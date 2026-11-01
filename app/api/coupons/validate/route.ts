import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, subtotalPaise = 0 } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'Please enter a promotional code.' },
        { status: 400 }
      );
    }

    const trimmedCode = code.trim().toUpperCase();
    const supabase = await createClient();

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', trimmedCode)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !coupon) {
      return NextResponse.json(
        { valid: false, error: 'Invalid or inactive promotional code.' },
        { status: 200 }
      );
    }

    const now = new Date();

    if (coupon.start_date && new Date(coupon.start_date) > now) {
      return NextResponse.json(
        { valid: false, error: 'This promotional code is not yet active.' },
        { status: 200 }
      );
    }

    if (coupon.end_date && new Date(coupon.end_date) < now) {
      return NextResponse.json(
        { valid: false, error: 'This promotional code has expired.' },
        { status: 200 }
      );
    }

    if (coupon.max_uses && (coupon.used_count || 0) >= coupon.max_uses) {
      return NextResponse.json(
        { valid: false, error: 'This promotional code has reached its maximum redemptions.' },
        { status: 200 }
      );
    }

    if (coupon.min_order_paise && subtotalPaise < coupon.min_order_paise) {
      const minInr = (coupon.min_order_paise / 100).toLocaleString('en-IN');
      return NextResponse.json(
        {
          valid: false,
          error: `This code requires a minimum order of ₹${minInr}.`,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        min_order_paise: coupon.min_order_paise || 0,
        max_discount_paise: coupon.max_discount_paise,
      },
    });
  } catch (err: any) {
    console.error('Coupon validation exception:', err);
    return NextResponse.json(
      { valid: false, error: 'Failed to validate coupon code.' },
      { status: 500 }
    );
  }
}
