import React from 'react';
import { CreditCard, CheckCircle2, Clock } from 'lucide-react';
import { getAllOrders } from '@/lib/services/orders';
import { formatPaise, formatDate } from '@/lib/utils/format';

export const metadata = {
  title: 'Payment Reconciliation | SHRÎ Admin',
};

export default async function AdminPaymentsPage() {
  const orders = await getAllOrders();

  return (
    <div className="space-y-6">
      <div className="border-b border-sand pb-4">
        <span className="text-[10px] uppercase tracking-widest text-gold font-semibold block">
          Financial Ledger
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl text-charcoal font-normal">
          Payment & Gateway Transactions
        </h1>
      </div>

      <div className="bg-ivory border border-sand/70 p-6 shadow-xs overflow-x-auto">
        {orders.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <CreditCard className="w-10 h-10 text-sand mx-auto stroke-1" />
            <h3 className="font-serif text-base text-charcoal">No Payment Transactions Recorded</h3>
            <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
              Razorpay gateway settlements and Cash on Delivery collections will appear here once orders are processed.
            </p>
          </div>
        ) : (
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-sand text-charcoal-muted uppercase tracking-wider text-[10px] bg-cream/40">
                <th className="py-3 px-3">Order Ref</th>
                <th className="py-3 px-3">Gateway Provider</th>
                <th className="py-3 px-3">Payment Method</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Gateway Status</th>
                <th className="py-3 px-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand/40">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-cream/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-charcoal">
                    {order.order_number}
                  </td>
                  <td className="py-3 px-3 font-medium uppercase text-[11px]">
                    {order.payment_method === 'online_razorpay' ? 'Razorpay PG' : 'In-House COD'}
                  </td>
                  <td className="py-3 px-3 text-charcoal-muted">
                    {order.payment_method === 'online_razorpay' ? 'UPI / Cards / Netbanking' : 'Cash upon Delivery'}
                  </td>
                  <td className="py-3 px-3 font-semibold text-charcoal">
                    {formatPaise(order.total_paise)}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-xs ${
                        order.payment_status === 'captured'
                          ? 'bg-success/15 text-success'
                          : 'bg-gold/20 text-charcoal'
                      }`}
                    >
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-charcoal-muted">
                    {formatDate(order.created_at)}
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
