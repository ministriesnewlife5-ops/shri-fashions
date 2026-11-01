import { NextRequest, NextResponse } from 'next/server';
import { CheckoutRequestSchema } from '@/lib/validations/checkout';
import { createCheckoutOrder } from '@/lib/services/orders';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Zod input validation
    const validationResult = CheckoutRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          issues: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const checkoutData = validationResult.data;

    // Detect authenticated customer session
    let userId: string | null = null;
    try {
      const supabase = await createClient();
      const { data: { session } } = await supabase.auth.getSession();
      userId = session?.user?.id || null;
    } catch {
      // Guest checkout
    }

    // 2. Execute order creation workflow
    const result = await createCheckoutOrder({
      input: checkoutData,
      userId,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      orderNumber: result.order?.order_number,
      orderId: result.order?.id,
      paymentMethod: result.order?.payment_method,
      totalPaise: result.order?.total_paise,
      razorpayOrder: result.razorpayOrder,
    });
  } catch (error: any) {
    console.error('Checkout API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error processing checkout' },
      { status: 500 }
    );
  }
}
