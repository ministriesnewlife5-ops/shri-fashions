import React from 'react';
import Link from 'next/link';
import { Eye, Search, Filter } from 'lucide-react';
import { getAllOrders } from '@/lib/services/orders';
import { formatPaise, formatDate } from '@/lib/utils/format';

export const metadata = {
  title: 'Order Fulfillment | SHRÎ Admin',
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const resolved = await searchParams;
  let orders = await getAllOrders();

  if (resolved.status) {
    orders = orders.filter((o) => o.status === resolved.status);
  }

  if (resolved.search) {
    const q = resolved.search.toLowerCase();
    orders = orders.filter(
      (o) =>
        o.order_number.toLowerCase().includes(q) ||
        o.shipping_address?.full_name.toLowerCase().includes(q) ||
        o.guest_email?.toLowerCase().includes(q)
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-sand pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-gold font-semibold block">
            Fulfillment & Logistics
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-charcoal font-normal">
            Client Order Records
          </h1>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-sand text-xs uppercase tracking-wider space-x-6 overflow-x-auto pb-2">
        <Link
          href="/admin/orders"
          className={`pb-1 font-semibold ${!resolved.status ? 'border-b-2 border-charcoal text-charcoal' : 'text-charcoal-muted'}`}
        >
          All Orders
        </Link>
        <Link
          href="/admin/orders?status=pending"
          className={`pb-1 font-semibold ${resolved.status === 'pending' ? 'border-b-2 border-charcoal text-charcoal' : 'text-charcoal-muted'}`}
        >
          Pending
        </Link>
        <Link
          href="/admin/orders?status=confirmed"
          className={`pb-1 font-semibold ${resolved.status === 'confirmed' ? 'border-b-2 border-charcoal text-charcoal' : 'text-charcoal-muted'}`}
        >
          Confirmed
        </Link>
        <Link
          href="/admin/orders?status=processing"
          className={`pb-1 font-semibold ${resolved.status === 'processing' ? 'border-b-2 border-charcoal text-charcoal' : 'text-charcoal-muted'}`}
        >
          Processing
        </Link>
        <Link
          href="/admin/orders?status=shipped"
          className={`pb-1 font-semibold ${resolved.status === 'shipped' ? 'border-b-2 border-charcoal text-charcoal' : 'text-charcoal-muted'}`}
        >
          Shipped
        </Link>
        <Link
          href="/admin/orders?status=delivered"
          className={`pb-1 font-semibold ${resolved.status === 'delivered' ? 'border-b-2 border-charcoal text-charcoal' : 'text-charcoal-muted'}`}
        >
          Delivered
        </Link>
      </div>

      {/* Orders Table */}
      <div className="bg-ivory border border-sand/70 shadow-xs overflow-x-auto">
        {orders.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Filter className="w-10 h-10 text-sand mx-auto stroke-1" />
            <h3 className="font-serif text-base text-charcoal">No Orders Found</h3>
            <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
              {resolved.status || resolved.search
                ? 'No client orders match your current filter selection.'
                : 'No client orders have been placed with the atelier yet.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-sand text-charcoal-muted uppercase tracking-wider text-[10px] bg-cream/40">
                <th className="py-3 px-4">Order Reference</th>
                <th className="py-3 px-4">Date Placed</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4">Order Status</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand/40">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-cream/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-charcoal">
                    <Link href={`/admin/orders/${order.id}`} className="hover:text-gold">
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 text-charcoal-muted">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="py-3.5 px-4 text-charcoal font-medium">
                    {order.shipping_address?.full_name || order.guest_email || 'Client'}
                  </td>
                  <td className="py-3.5 px-4 uppercase text-[10px]">
                    {order.payment_method === 'online_razorpay' ? 'Online (Razorpay)' : 'Cash on Delivery'}
                  </td>
                  <td className="py-3.5 px-4">
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
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-xs ${
                        order.status === 'delivered'
                          ? 'bg-success/15 text-success'
                          : order.status === 'cancelled'
                          ? 'bg-error/15 text-error'
                          : 'bg-gold/20 text-charcoal'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-charcoal">
                    {formatPaise(order.total_paise)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="p-1.5 text-gold hover:text-gold-hover inline-flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </Link>
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
