import { describe, it, expect } from 'vitest';
import { calculateOrderPricing } from '@/lib/utils/pricing';
import { Coupon } from '@/lib/types/database';

describe('Pricing and Calculation Engine', () => {
  it('correctly calculates subtotal from line items', () => {
    const items = [
      { variant_id: 'v1', unit_price_paise: 899000, quantity: 1 }, // ₹8,990
      { variant_id: 'v2', unit_price_paise: 649000, quantity: 2 }, // ₹6,490 * 2 = ₹12,980
    ];
    const result = calculateOrderPricing({ items });
    // Total subtotal: 899000 + 1298000 = 2197000 paise (₹21,970)
    expect(result.subtotal_paise).toBe(2197000);
    // Above free shipping threshold (₹2,500 = 250000 paise)
    expect(result.free_shipping_eligible).toBe(true);
    expect(result.shipping_paise).toBe(0);
  });

  it('charges standard shipping when under free shipping threshold', () => {
    const items = [
      { variant_id: 'v3', unit_price_paise: 150000, quantity: 1 }, // ₹1,500
    ];
    const result = calculateOrderPricing({
      items,
      freeShippingThresholdPaise: 250000, // ₹2,500
      standardShippingPaise: 15000, // ₹150
    });
    expect(result.subtotal_paise).toBe(150000);
    expect(result.free_shipping_eligible).toBe(false);
    expect(result.shipping_paise).toBe(15000);
    expect(result.total_paise).toBe(150000 + 15000);
  });

  it('applies percentage coupon correctly with max discount cap', () => {
    const items = [
      { variant_id: 'v1', unit_price_paise: 2000000, quantity: 1 }, // ₹20,000
    ];
    const coupon: Coupon = {
      id: 'c1',
      code: 'WELCOME10',
      discount_type: 'percentage',
      discount_value: 10, // 10%
      min_order_paise: 200000, // ₹2,000
      max_discount_paise: 100000, // capped at ₹1,000
      start_date: '2026-01-01',
      per_customer_limit: 1,
      used_count: 0,
      is_active: true,
      created_at: '2026-01-01',
    };
    const result = calculateOrderPricing({ items, coupon });
    // 10% of 2000000 is 200000, but cap is 100000
    expect(result.discount_paise).toBe(100000);
    expect(result.total_paise).toBe(1900000);
  });

  it('applies fixed coupon correctly and does not exceed subtotal', () => {
    const items = [
      { variant_id: 'v1', unit_price_paise: 300000, quantity: 1 }, // ₹3,000
    ];
    const coupon: Coupon = {
      id: 'c2',
      code: 'FLAT500',
      discount_type: 'fixed',
      discount_value: 50000, // ₹500
      min_order_paise: 250000, // min ₹2,500
      start_date: '2026-01-01',
      per_customer_limit: 1,
      used_count: 0,
      is_active: true,
      created_at: '2026-01-01',
    };
    const result = calculateOrderPricing({ items, coupon });
    expect(result.discount_paise).toBe(50000);
    expect(result.total_paise).toBe(250000);
  });

  it('adds COD fee when COD is chosen', () => {
    const items = [
      { variant_id: 'v1', unit_price_paise: 300000, quantity: 1 },
    ];
    const result = calculateOrderPricing({
      items,
      isCod: true,
      codFeePaise: 9900, // ₹99
    });
    expect(result.cod_fee_paise).toBe(9900);
    expect(result.total_paise).toBe(300000 + 9900);
  });
});
