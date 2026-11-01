import { Coupon } from '@/lib/types/database';

export interface LineItemInput {
  variant_id: string;
  unit_price_paise: number;
  quantity: number;
}

export interface PricingCalculationResult {
  subtotal_paise: number;
  discount_paise: number;
  shipping_paise: number;
  cod_fee_paise: number;
  tax_paise: number;
  total_paise: number;
  coupon_applied?: Coupon | null;
  free_shipping_eligible: boolean;
  amount_for_free_shipping_paise: number;
}

export function calculateOrderPricing({
  items,
  coupon = null,
  isCod = false,
  freeShippingThresholdPaise = 250000, // ₹2,500
  standardShippingPaise = 15000, // ₹150
  codFeePaise = 9900, // ₹99
  taxPercentage = 5, // 5% GST
}: {
  items: LineItemInput[];
  coupon?: Coupon | null;
  isCod?: boolean;
  freeShippingThresholdPaise?: number;
  standardShippingPaise?: number;
  codFeePaise?: number;
  taxPercentage?: number;
}): PricingCalculationResult {
  // 1. Calculate subtotal
  const subtotal_paise = items.reduce((sum, item) => {
    return sum + Math.max(0, item.unit_price_paise) * Math.max(1, item.quantity);
  }, 0);

  // 2. Calculate coupon discount
  let discount_paise = 0;
  if (coupon && coupon.is_active) {
    if (subtotal_paise >= coupon.min_order_paise) {
      if (coupon.discount_type === 'percentage') {
        const calculated = Math.round((subtotal_paise * coupon.discount_value) / 100);
        discount_paise = coupon.max_discount_paise
          ? Math.min(calculated, coupon.max_discount_paise)
          : calculated;
      } else if (coupon.discount_type === 'fixed') {
        discount_paise = Math.min(coupon.discount_value, subtotal_paise);
      }
    }
  }

  // Ensure discount does not exceed subtotal
  discount_paise = Math.min(discount_paise, subtotal_paise);

  // 3. Shipping logic
  const free_shipping_eligible = subtotal_paise >= freeShippingThresholdPaise;
  const shipping_paise = items.length === 0 ? 0 : free_shipping_eligible ? 0 : standardShippingPaise;
  const amount_for_free_shipping_paise = Math.max(0, freeShippingThresholdPaise - subtotal_paise);

  // 4. COD fee
  const applied_cod_fee = isCod && items.length > 0 ? codFeePaise : 0;

  // 5. Tax calculation (GST 5% included in prices or calculated)
  // Standard Indian retail includes GST in MRP; we compute the tax component for transparency
  const taxable_base = Math.max(0, subtotal_paise - discount_paise);
  const tax_paise = Math.round((taxable_base * taxPercentage) / (100 + taxPercentage));

  // 6. Final payable total
  const total_paise = Math.max(0, taxable_base + shipping_paise + applied_cod_fee);

  return {
    subtotal_paise,
    discount_paise,
    shipping_paise,
    cod_fee_paise: applied_cod_fee,
    tax_paise,
    total_paise,
    coupon_applied: discount_paise > 0 ? coupon : null,
    free_shipping_eligible,
    amount_for_free_shipping_paise,
  };
}
