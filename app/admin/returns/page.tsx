import React from 'react';
import { RotateCcw } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatDate } from '@/lib/utils/format';

export const metadata = {
  title: 'Returns & Quality Inspection | SHRÎ Admin',
};

export default async function AdminReturnsPage() {
  let returnRequests: any[] = [];

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from('return_requests')
      .select(`
        *,
        order:orders(order_number)
      `)
      .order('created_at', { ascending: false });

    if (data) {
      returnRequests = data;
    }
  } catch (err) {
    console.error('Failed to fetch returns in admin:', err);
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-sand pb-4">
        <span className="text-[10px] uppercase tracking-widest text-gold font-semibold block">
          Client Care & Reverse Logistics
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl text-charcoal font-normal">
          Return Inquiries & Restocking
        </h1>
      </div>

      <div className="bg-ivory border border-sand/70 p-6 shadow-xs overflow-x-auto">
        {returnRequests.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <RotateCcw className="w-10 h-10 text-sand mx-auto stroke-1" />
            <h3 className="font-serif text-base text-charcoal">No Active Return Inquiries</h3>
            <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
              Client return and exchange requests submitted through customer accounts will appear here for quality inspection and restocking approval.
            </p>
          </div>
        ) : (
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-sand text-charcoal-muted uppercase tracking-wider text-[10px] bg-cream/40">
                <th className="py-3 px-3">Return ID</th>
                <th className="py-3 px-3">Order Number</th>
                <th className="py-3 px-3">Reason</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Requested Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand/40">
              {returnRequests.map((ret) => (
                <tr key={ret.id} className="hover:bg-cream/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-charcoal">
                    {ret.id.substring(0, 8)}
                  </td>
                  <td className="py-3 px-3 font-mono text-charcoal">
                    {ret.order?.order_number || '—'}
                  </td>
                  <td className="py-3 px-3 text-charcoal-muted">
                    {ret.reason || 'General inquiry'}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-xs bg-gold/20 text-charcoal">
                      {ret.status || 'Pending'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-charcoal-muted">
                    {formatDate(ret.created_at)}
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
