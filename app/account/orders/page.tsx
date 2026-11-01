import React from 'react';
import Link from 'next/link';
import { Package, ArrowRight, Eye } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getUserOrders } from '@/lib/services/orders';
import { formatPaise, formatDate } from '@/lib/utils/format';

export const metadata = {
  title: 'My Orders | SHRÎ Atelier',
};

export default async function CustomerOrdersPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const orders = session?.user?.id ? await getUserOrders(session.user.id) : [];

  return (
    <div className="space-y-6">
      <div className="border-b border-sand pb-4 flex justify-between items-center">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-gold font-semibold block">
            Purchase History
          </span>
          <h1 className="font-serif text-2xl md:text-3xl text-charcoal font-normal">
            My Orders
          </h1>
        </div>
        <span className="text-xs text-charcoal-muted font-medium">
          {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <Package className="w-12 h-12 text-sand mx-auto stroke-1" />
          <h3 className="font-serif text-lg text-charcoal">No Orders Placed Yet</h3>
          <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
            When you acquire a silhouette from our atelier, you can trace its journey and delivery timeline here.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="px-6 py-2.5 bg-charcoal text-ivory text-xs uppercase tracking-widest inline-block"
            >
              Explore Collection
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const itemCount = order.items?.reduce((s, i) => s + i.quantity, 0) || 1;
            return (
              <div
                key={order.id}
                className="p-5 bg-cream/40 border border-sand/60 space-y-4 hover:border-gold/60 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-sand/40 pb-3 gap-2">
                  <div className="space-y-1">
                    <span className="font-mono text-xs font-bold text-charcoal">
                      {order.order_number}
                    </span>
                    <p className="text-[11px] text-charcoal-muted">
                      Placed on {formatDate(order.created_at)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span
                      className={`text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-xs ${
                        order.status === 'delivered'
                          ? 'bg-success/15 text-success'
                          : order.status === 'cancelled'
                          ? 'bg-error/15 text-error'
                          : 'bg-gold/20 text-charcoal'
                      }`}
                    >
                      {order.status}
                    </span>
                    <span className="font-semibold text-sm text-charcoal">
                      {formatPaise(order.total_paise)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="text-charcoal-muted">
                    <span>
                      {itemCount} {itemCount === 1 ? 'Item' : 'Items'} &middot;{' '}
                    </span>
                    <span className="capitalize">
                      {order.payment_method === 'online_razorpay' ? 'Razorpay PG' : 'Cash on Delivery'}
                    </span>
                  </div>

                  <Link
                    href={`/order-confirmation/${order.order_number}`}
                    className="text-xs text-gold hover:underline inline-flex items-center space-x-1 font-medium"
                  >
                    <span>View Order Receipt</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
