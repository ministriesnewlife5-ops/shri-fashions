import { createAdminClient } from '@/lib/supabase/admin';
import { Order, OrderItem, OrderAddress, OrderStatus, PaymentStatus } from '@/lib/types/database';
import { CheckoutRequest } from '@/lib/validations/checkout';
import { calculateOrderPricing } from '@/lib/utils/pricing';
import { createRazorpayOrder } from '@/lib/payments/razorpay';

function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `SHR-${year}${month}${day}-${random}`;
}

// 1. Authoritative Server-Side Checkout Order Creation
export async function createCheckoutOrder({
  input,
  userId,
}: {
  input: CheckoutRequest;
  userId?: string | null;
}): Promise<{
  success: boolean;
  order?: Order;
  razorpayOrder?: { id: string; amount: number; currency: string } | null;
  error?: string;
}> {
  try {
    const admin = createAdminClient();

    // 1. Fetch variant and product details directly from Supabase
    const variantIds = input.items.map((i) => i.variantId);
    const { data: variants, error: variantsError } = await admin
      .from('product_variants')
      .select(`
        *,
        product:products(
          id,
          name,
          status,
          images:product_images(*)
        )
      `)
      .in('id', variantIds);

    if (variantsError || !variants || variants.length === 0) {
      return { success: false, error: 'Product variants could not be retrieved from the catalog.' };
    }

    const resolvedItems: {
      variant: any;
      product: any;
      quantity: number;
    }[] = [];

    for (const item of input.items) {
      const foundVariant = variants.find((v: any) => v.id === item.variantId);
      if (!foundVariant || !foundVariant.product) {
        return { success: false, error: `Product variant ${item.variantId} not found in atelier catalog.` };
      }

      if (foundVariant.product.status !== 'active') {
        return { success: false, error: `"${foundVariant.product.name}" is currently unavailable.` };
      }

      if (foundVariant.stock_quantity < item.quantity) {
        return {
          success: false,
          error: `Insufficient inventory for "${foundVariant.product.name} (Size ${foundVariant.size})". Only ${foundVariant.stock_quantity} available.`,
        };
      }

      resolvedItems.push({
        variant: foundVariant,
        product: foundVariant.product,
        quantity: item.quantity,
      });
    }

    // 2. Validate coupon if provided against Supabase coupons table
    let appliedCoupon = null;
    if (input.couponCode) {
      const code = input.couponCode.trim().toUpperCase();
      const { data: couponData } = await admin
        .from('coupons')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .maybeSingle();

      if (couponData) {
        // Check date validity
        const now = new Date();
        const isStarted = !couponData.start_date || new Date(couponData.start_date) <= now;
        const isNotExpired = !couponData.end_date || new Date(couponData.end_date) >= now;
        const withinMaxUses = !couponData.max_uses || (couponData.used_count || 0) < couponData.max_uses;

        if (isStarted && isNotExpired && withinMaxUses) {
          appliedCoupon = couponData;
        }
      }
    }

    // 3. Authoritative server pricing calculation
    const pricing = calculateOrderPricing({
      items: resolvedItems.map((i) => ({
        variant_id: i.variant.id,
        unit_price_paise: i.variant.price_paise,
        quantity: i.quantity,
      })),
      coupon: appliedCoupon,
      isCod: input.paymentMethod === 'cod',
    });

    const orderNumber = generateOrderNumber();
    const nowIso = new Date().toISOString();

    // 4. Insert Order into Supabase
    const initialOrderStatus: OrderStatus = input.paymentMethod === 'cod' ? 'confirmed' : 'pending';
    const initialPaymentStatus: PaymentStatus = 'pending';

    const { data: orderRecord, error: orderInsertError } = await admin
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: userId || null,
        guest_email: !userId ? input.email : null,
        guest_phone: !userId ? input.phone : null,
        status: initialOrderStatus,
        payment_method: input.paymentMethod,
        payment_status: initialPaymentStatus,
        currency: 'INR',
        subtotal_paise: pricing.subtotal_paise,
        discount_paise: pricing.discount_paise,
        shipping_paise: pricing.shipping_paise,
        tax_paise: pricing.tax_paise,
        total_paise: pricing.total_paise,
        coupon_code: appliedCoupon?.code || null,
        notes: input.orderNotes || null,
        created_at: nowIso,
        updated_at: nowIso,
      })
      .select()
      .single();

    if (orderInsertError || !orderRecord) {
      console.error('Error inserting order in Supabase:', orderInsertError);
      return { success: false, error: 'Failed to record order in database. Please try again.' };
    }

    const orderId = orderRecord.id;

    // 5. Insert Order Items into Supabase
    const orderItemsPayload = resolvedItems.map((i) => ({
      order_id: orderId,
      variant_id: i.variant.id,
      product_name: i.product.name,
      sku: i.variant.sku,
      size: i.variant.size,
      color: i.variant.color_name,
      unit_price_paise: i.variant.price_paise,
      quantity: i.quantity,
      line_total_paise: i.variant.price_paise * i.quantity,
      image_url: i.product.images?.[0]?.storage_path || null,
      created_at: nowIso,
    }));

    const { error: itemsError } = await admin.from('order_items').insert(orderItemsPayload);
    if (itemsError) {
      console.error('Error inserting order items:', itemsError);
    }

    // 6. Insert Order Addresses into Supabase
    const addressesPayload = [
      {
        order_id: orderId,
        type: 'shipping',
        full_name: input.shippingAddress.fullName,
        phone: input.shippingAddress.phone,
        address_line1: input.shippingAddress.addressLine1,
        address_line2: input.shippingAddress.addressLine2 || null,
        city: input.shippingAddress.city,
        state: input.shippingAddress.state,
        pincode: input.shippingAddress.pincode,
        country: input.shippingAddress.country || 'India',
        created_at: nowIso,
      },
    ];

    if (input.useSameAddressForBilling) {
      addressesPayload.push({
        ...addressesPayload[0],
        type: 'billing',
      });
    } else if (input.billingAddress) {
      addressesPayload.push({
        order_id: orderId,
        type: 'billing',
        full_name: input.billingAddress.fullName,
        phone: input.billingAddress.phone,
        address_line1: input.billingAddress.addressLine1,
        address_line2: input.billingAddress.addressLine2 || null,
        city: input.billingAddress.city,
        state: input.billingAddress.state,
        pincode: input.billingAddress.pincode,
        country: input.billingAddress.country || 'India',
        created_at: nowIso,
      });
    }

    const { error: addressError } = await admin.from('order_addresses').insert(addressesPayload);
    if (addressError) {
      console.error('Error inserting order addresses:', addressError);
    }

    // 7. Atomic stock deduction for confirmed COD orders
    if (input.paymentMethod === 'cod') {
      for (const item of resolvedItems) {
        const newQty = Math.max(0, item.variant.stock_quantity - item.quantity);
        await admin
          .from('product_variants')
          .update({ stock_quantity: newQty, updated_at: nowIso })
          .eq('id', item.variant.id);

        // Record inventory movement
        await admin.from('inventory_movements').insert({
          variant_id: item.variant.id,
          type: 'order_allocation',
          quantity: -item.quantity,
          reference_id: orderId,
          created_at: nowIso,
        });
      }
    }

    // 8. Handle Razorpay Gateway Order creation
    let razorpayOrder = null;
    if (input.paymentMethod === 'online_razorpay') {
      razorpayOrder = await createRazorpayOrder({
        amountPaise: pricing.total_paise,
        receipt: orderNumber,
        notes: {
          order_id: orderId,
          order_number: orderNumber,
          customer_email: input.email,
        },
      });

      // Record pending payment entry in Supabase
      if (razorpayOrder) {
        await admin.from('payments').insert({
          order_id: orderId,
          gateway_name: 'razorpay',
          gateway_order_id: razorpayOrder.id,
          amount_paise: pricing.total_paise,
          currency: 'INR',
          status: 'pending',
          created_at: nowIso,
        });
      }
    }

    // Build hydrated order response
    const completeOrder: Order = {
      ...orderRecord,
      items: orderItemsPayload.map((item, idx) => ({ ...item, id: `item_${idx}` })),
      shipping_address: addressesPayload[0] as OrderAddress,
      billing_address: (addressesPayload[1] || addressesPayload[0]) as OrderAddress,
      payments: [],
      shipments: [],
    };

    return {
      success: true,
      order: completeOrder,
      razorpayOrder,
    };
  } catch (error: any) {
    console.error('Order creation exception:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred during checkout.',
    };
  }
}

// 2. Fetch single order by order number from Supabase
export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  try {
    const admin = createAdminClient();
    const { data: order, error } = await admin
      .from('orders')
      .select(`
        *,
        items:order_items(*),
        addresses:order_addresses(*),
        payments:payments(*)
      `)
      .eq('order_number', orderNumber)
      .maybeSingle();

    if (error || !order) {
      return null;
    }

    const shippingAddress = order.addresses?.find((a: any) => a.type === 'shipping') || null;
    const billingAddress = order.addresses?.find((a: any) => a.type === 'billing') || shippingAddress;

    return {
      ...order,
      shipping_address: shippingAddress,
      billing_address: billingAddress,
      items: order.items || [],
      payments: order.payments || [],
    } as Order;
  } catch (err) {
    console.error(`Failed to fetch order ${orderNumber}:`, err);
    return null;
  }
}

// 3. Fetch all orders from Supabase (for Admin Console)
export async function getAllOrders(): Promise<Order[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('orders')
      .select(`
        *,
        items:order_items(*),
        addresses:order_addresses(*),
        payments:payments(*)
      `)
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('Error fetching all orders from Supabase:', error?.message);
      return [];
    }

    return data.map((order: any) => ({
      ...order,
      shipping_address: order.addresses?.find((a: any) => a.type === 'shipping') || null,
      billing_address: order.addresses?.find((a: any) => a.type === 'billing') || null,
      items: order.items || [],
      payments: order.payments || [],
    })) as Order[];
  } catch (err) {
    console.error('Failed to get all orders:', err);
    return [];
  }
}

// 4. Fetch customer orders by user_id from Supabase
export async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('orders')
      .select(`
        *,
        items:order_items(*),
        addresses:order_addresses(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((order: any) => ({
      ...order,
      shipping_address: order.addresses?.find((a: any) => a.type === 'shipping') || null,
      billing_address: order.addresses?.find((a: any) => a.type === 'billing') || null,
      items: order.items || [],
    })) as Order[];
  } catch (err) {
    console.error('Failed to fetch user orders:', err);
    return [];
  }
}

// 5. Update order status in Supabase
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  comment?: string
): Promise<boolean> {
  try {
    const admin = createAdminClient();
    const nowIso = new Date().toISOString();

    const { error } = await admin
      .from('orders')
      .update({ status: newStatus, updated_at: nowIso })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order status in Supabase:', error);
      return false;
    }

    // Record in order status history
    await admin.from('order_status_history').insert({
      order_id: orderId,
      status: newStatus,
      comment: comment || `Status updated to ${newStatus}`,
      created_at: nowIso,
    });

    return true;
  } catch (err) {
    console.error('Failed to update order status:', err);
    return false;
  }
}

// 6. Cancel order and restore stock in Supabase
export async function cancelOrder(orderId: string, reason: string): Promise<boolean> {
  try {
    const admin = createAdminClient();
    const nowIso = new Date().toISOString();

    // Fetch order items to restore inventory
    const { data: order } = await admin
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', orderId)
      .single();

    if (!order || order.status === 'cancelled') {
      return false;
    }

    // Restore stock if it was previously confirmed/allocated
    if (order.status !== 'pending' && order.items && order.items.length > 0) {
      for (const item of order.items) {
        if (item.variant_id) {
          const { data: variant } = await admin
            .from('product_variants')
            .select('stock_quantity')
            .eq('id', item.variant_id)
            .single();

          if (variant) {
            await admin
              .from('product_variants')
              .update({
                stock_quantity: variant.stock_quantity + item.quantity,
                updated_at: nowIso,
              })
              .eq('id', item.variant_id);

            // Record movement
            await admin.from('inventory_movements').insert({
              variant_id: item.variant_id,
              type: 'cancellation_restock',
              quantity: item.quantity,
              reference_id: orderId,
              created_at: nowIso,
            });
          }
        }
      }
    }

    await admin
      .from('orders')
      .update({ status: 'cancelled', updated_at: nowIso })
      .eq('id', orderId);

    await admin.from('order_status_history').insert({
      order_id: orderId,
      status: 'cancelled',
      comment: `Order cancelled: ${reason}`,
      created_at: nowIso,
    });

    return true;
  } catch (err) {
    console.error('Failed to cancel order:', err);
    return false;
  }
}

// 7. Record payment success in Supabase
export async function recordPaymentSuccess(
  orderId: string,
  paymentDetails: {
    razorpayPaymentId: string;
    razorpayOrderId: string;
    razorpaySignature: string;
  }
): Promise<boolean> {
  try {
    const admin = createAdminClient();
    const nowIso = new Date().toISOString();

    // 1. Update order
    const { data: order, error: orderError } = await admin
      .from('orders')
      .update({
        payment_status: 'captured',
        status: 'confirmed',
        updated_at: nowIso,
      })
      .eq('id', orderId)
      .select('*, items:order_items(*)')
      .single();

    if (orderError || !order) {
      console.error('Error confirming order payment:', orderError);
      return false;
    }

    // 2. Insert or update payments record
    await admin.from('payments').upsert({
      order_id: orderId,
      gateway_name: 'razorpay',
      gateway_order_id: paymentDetails.razorpayOrderId,
      gateway_payment_id: paymentDetails.razorpayPaymentId,
      gateway_signature: paymentDetails.razorpaySignature,
      amount_paise: order.total_paise,
      currency: 'INR',
      status: 'captured',
      created_at: nowIso,
    });

    // 3. Deduct stock for confirmed online order
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        if (item.variant_id) {
          const { data: variant } = await admin
            .from('product_variants')
            .select('stock_quantity')
            .eq('id', item.variant_id)
            .single();

          if (variant) {
            const newStock = Math.max(0, variant.stock_quantity - item.quantity);
            await admin
              .from('product_variants')
              .update({ stock_quantity: newStock, updated_at: nowIso })
              .eq('id', item.variant_id);

            await admin.from('inventory_movements').insert({
              variant_id: item.variant_id,
              type: 'order_allocation',
              quantity: -item.quantity,
              reference_id: orderId,
              created_at: nowIso,
            });
          }
        }
      }
    }

    return true;
  } catch (err) {
    console.error('Failed to record payment success in Supabase:', err);
    return false;
  }
}
