import React from 'react';
import { Ticket, Plus } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPaise } from '@/lib/utils/format';
import { Coupon } from '@/lib/types/database';

export const metadata = {
  title: 'Coupon & Promotion Strategy | SHRÎ Admin',
};

export default async function AdminCouponsPage() {
  let coupons: Coupon[] = [];

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      coupons = data as Coupon[];
    }
  } catch (err) {
    console.error('Failed to query coupons in admin:', err);
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-sand pb-4 flex justify-between items-center">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-gold font-semibold block">
            Promotional Strategy
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-charcoal font-normal">
            Promotional Codes & Coupons
          </h1>
        </div>
      </div>

      <div className="bg-ivory border border-sand/70 p-6 shadow-xs overflow-x-auto">
        {coupons.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Ticket className="w-10 h-10 text-sand mx-auto stroke-1" />
            <h3 className="font-serif text-base text-charcoal">No Promotional Codes Configured</h3>
            <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
              You have not created any discount coupons or campaign vouchers yet.
            </p>
          </div>
        ) : (
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-sand text-charcoal-muted uppercase tracking-wider text-[10px] bg-cream/40">
                <th className="py-3 px-3">Promo Code</th>
                <th className="py-3 px-3">Discount Value</th>
                <th className="py-3 px-3">Minimum Order</th>
                <th className="py-3 px-3">Max Cap</th>
                <th className="py-3 px-3">Usage Count</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand/40">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-cream/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-charcoal">
                    {coupon.code}
                  </td>
                  <td className="py-3 px-3 font-semibold text-charcoal">
                    {coupon.discount_type === 'percentage'
                      ? `${coupon.discount_value}% Off`
                      : formatPaise(coupon.discount_value)}
                  </td>
                  <td className="py-3 px-3 text-charcoal-muted">
                    {formatPaise(coupon.min_order_paise || 0)}
                  </td>
                  <td className="py-3 px-3 text-charcoal-muted">
                    {coupon.max_discount_paise ? formatPaise(coupon.max_discount_paise) : 'No Cap'}
                  </td>
                  <td className="py-3 px-3">
                    {coupon.used_count || 0} / {coupon.usage_limit || '∞'}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-xs ${
                        coupon.is_active ? 'bg-success/15 text-success' : 'bg-sand text-charcoal-muted'
                      }`}
                    >
                      {coupon.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
