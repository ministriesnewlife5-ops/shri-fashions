import React from 'react';
import { BarChart3, Download, TrendingUp } from 'lucide-react';
import { getAllOrders } from '@/lib/services/orders';
import { formatPaise } from '@/lib/utils/format';

export const metadata = {
  title: 'Executive Sales Reports | SHRÎ Admin',
};

export default async function AdminReportsPage() {
  const orders = await getAllOrders();

  const onlineOrders = orders.filter((o) => o.payment_method === 'online_razorpay');
  const codOrders = orders.filter((o) => o.payment_method === 'cod');

  const onlineRevenue = onlineOrders.reduce((s, o) => s + o.total_paise, 0);
  const codRevenue = codOrders.reduce((s, o) => s + o.total_paise, 0);
  const totalRevenue = onlineRevenue + codRevenue;

  const onlinePct = totalRevenue > 0 ? Math.round((onlineRevenue / totalRevenue) * 100) : 0;
  const codPct = totalRevenue > 0 ? Math.round((codRevenue / totalRevenue) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="border-b border-sand pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-gold font-semibold block">
            Commercial Analytics
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-charcoal font-normal">
            Sales & Channel Reports
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Channel Breakdown */}
        <div className="bg-ivory border border-sand/70 p-6 space-y-4 shadow-xs">
          <h2 className="font-serif text-lg text-charcoal border-b border-sand pb-2">
            Revenue by Payment Channel
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between text-charcoal font-medium mb-1">
                <span>Online (Razorpay Gateway)</span>
                <span>{formatPaise(onlineRevenue)} ({onlineOrders.length} orders &middot; {onlinePct}%)</span>
              </div>
              <div className="w-full bg-sand h-2 rounded-full overflow-hidden">
                <div className="bg-gold h-full" style={{ width: `${onlinePct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-charcoal font-medium mb-1">
                <span>Cash on Delivery (COD)</span>
                <span>{formatPaise(codRevenue)} ({codOrders.length} orders &middot; {codPct}%)</span>
              </div>
              <div className="w-full bg-sand h-2 rounded-full overflow-hidden">
                <div className="bg-charcoal h-full" style={{ width: `${codPct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Fulfillment Distribution */}
        <div className="bg-ivory border border-sand/70 p-6 space-y-4 shadow-xs">
          <h2 className="font-serif text-lg text-charcoal border-b border-sand pb-2">
            Order Status Distribution
          </h2>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-cream/40 border border-sand/50">
              <span className="text-charcoal-muted uppercase text-[10px] block">Confirmed</span>
              <strong className="text-lg font-serif text-charcoal">
                {orders.filter((o) => o.status === 'confirmed').length}
              </strong>
            </div>
            <div className="p-3 bg-cream/40 border border-sand/50">
              <span className="text-charcoal-muted uppercase text-[10px] block">Processing</span>
              <strong className="text-lg font-serif text-charcoal">
                {orders.filter((o) => o.status === 'processing').length}
              </strong>
            </div>
            <div className="p-3 bg-cream/40 border border-sand/50">
              <span className="text-charcoal-muted uppercase text-[10px] block">Shipped</span>
              <strong className="text-lg font-serif text-charcoal">
                {orders.filter((o) => o.status === 'shipped').length}
              </strong>
            </div>
            <div className="p-3 bg-cream/40 border border-sand/50">
              <span className="text-charcoal-muted uppercase text-[10px] block">Delivered</span>
              <strong className="text-lg font-serif text-charcoal">
                {orders.filter((o) => o.status === 'delivered').length}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
