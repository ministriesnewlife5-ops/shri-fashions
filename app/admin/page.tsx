import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ArrowRight,
  CreditCard,
  Truck,
  Boxes,
} from 'lucide-react';
import { getAllOrders } from '@/lib/services/orders';
import { getProducts } from '@/lib/services/catalogue';
import { formatPaise, formatDate } from '@/lib/utils/format';

export const metadata = {
  title: 'Atelier Console Overview | SHRÎ Admin',
};

export default async function AdminDashboardPage() {
  const orders = await getAllOrders();
  const products = await getProducts();

  // Metrics calculation
  const totalOrders = orders.length;

  // Qualifying Paid Revenue (exclude failed/cancelled and pending COD)
  const paidOrders = orders.filter((o) => o.payment_status === 'captured');
  const qualifyingRevenuePaise = paidOrders.reduce((sum, o) => sum + o.total_paise, 0);

  // COD Awaiting Collection
  const codPendingOrders = orders.filter(
    (o) => o.payment_method === 'cod' && o.status !== 'cancelled' && o.status !== 'delivered'
  );
  const codPendingPaise = codPendingOrders.reduce((sum, o) => sum + o.total_paise, 0);

  // Average Order Value
  const aovPaise = totalOrders > 0 ? Math.round(orders.reduce((s, o) => s + o.total_paise, 0) / totalOrders) : 0;

  // Orders awaiting processing
  const awaitingProcessingCount = orders.filter((o) => ['pending', 'confirmed'].includes(o.status)).length;

  // Low stock variants calculation across all products
  const lowStockThreshold = 5;
  const lowStockVariants: { product: any; variant: any }[] = [];
  products.forEach((p) => {
    p.variants?.forEach((v) => {
      if (v.stock_quantity <= lowStockThreshold) {
        lowStockVariants.push({ product: p, variant: v });
      }
    });
  });

  return (
    <div className="space-y-8">
      {/* Top Welcome Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sand pb-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-gold font-semibold block">
            Executive Overview
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-charcoal font-normal">
            Atelier Business Metrics
          </h1>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <Link
            href="/admin/products/new"
            className="px-4 py-2 bg-charcoal text-ivory uppercase tracking-wider font-semibold hover:bg-gold transition-colors"
          >
            + New Silhouette
          </Link>
          <Link
            href="/admin/reports"
            className="px-4 py-2 bg-ivory border border-sand text-charcoal uppercase tracking-wider font-semibold hover:bg-cream transition-colors"
          >
            Export Report
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Qualifying Collected Revenue */}
        <div className="p-5 bg-ivory border border-sand/70 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs text-charcoal-muted uppercase tracking-wider">
            <span>Collected Revenue</span>
            <CreditCard className="w-4 h-4 text-success" />
          </div>
          <p className="font-serif text-2xl font-semibold text-charcoal">
            {formatPaise(qualifyingRevenuePaise)}
          </p>
          <p className="text-[11px] text-charcoal-muted">
            From {paidOrders.length} verified captured online transactions
          </p>
        </div>

        {/* Metric 2: COD Awaiting Collection */}
        <div className="p-5 bg-ivory border border-sand/70 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs text-charcoal-muted uppercase tracking-wider">
            <span>COD In Fulfillment</span>
            <Truck className="w-4 h-4 text-gold" />
          </div>
          <p className="font-serif text-2xl font-semibold text-charcoal">
            {formatPaise(codPendingPaise)}
          </p>
          <p className="text-[11px] text-charcoal-muted">
            {codPendingOrders.length} orders dispatched / pending collection
          </p>
        </div>

        {/* Metric 3: Total Orders & AOV */}
        <div className="p-5 bg-ivory border border-sand/70 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs text-charcoal-muted uppercase tracking-wider">
            <span>Average Order Value</span>
            <TrendingUp className="w-4 h-4 text-gold" />
          </div>
          <p className="font-serif text-2xl font-semibold text-charcoal">
            {formatPaise(aovPaise)}
          </p>
          <p className="text-[11px] text-charcoal-muted">
            Total of {totalOrders} customer acquisitions
          </p>
        </div>

        {/* Metric 4: Awaiting Processing */}
        <div className="p-5 bg-ivory border border-sand/70 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs text-charcoal-muted uppercase tracking-wider">
            <span>Pending Dispatch</span>
            <Clock className="w-4 h-4 text-terracotta" />
          </div>
          <p className="font-serif text-2xl font-semibold text-charcoal">
            {awaitingProcessingCount} Orders
          </p>
          <p className="text-[11px] text-charcoal-muted">
            Requires atelier garment packaging & label generation
          </p>
        </div>
      </div>

      {/* Low Stock Warning Banner (if any) */}
      {lowStockVariants.length > 0 && (
        <div className="p-4 bg-terracotta/10 border border-terracotta/30 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2 text-terracotta">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              <strong>Low Inventory Alert:</strong> {lowStockVariants.length} variant(s) have 5 or fewer pieces remaining in stock.
            </span>
          </div>
          <Link
            href="/admin/inventory?filter=low"
            className="text-xs text-terracotta font-semibold hover:underline flex items-center space-x-1"
          >
            <span>Review Stock</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Recent Orders & Best Sellers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 bg-ivory border border-sand/70 p-6 space-y-4 shadow-xs">
          <div className="flex justify-between items-center border-b border-sand pb-3">
            <h2 className="font-serif text-lg text-charcoal font-medium">Recent Atelier Orders</h2>
            <Link
              href="/admin/orders"
              className="text-xs text-gold hover:underline font-semibold flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-sand text-charcoal-muted uppercase tracking-wider text-[10px]">
                  <th className="py-2.5">Order</th>
                  <th className="py-2.5">Recipient</th>
                  <th className="py-2.5">Method</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand/40">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-cream/40 transition-colors">
                    <td className="py-3 font-mono font-bold text-charcoal">
                      <Link href={`/admin/orders/${order.id}`} className="hover:text-gold">
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="py-3 text-charcoal">
                      {order.shipping_address?.full_name || order.guest_email || 'Shopper'}
                    </td>
                    <td className="py-3 uppercase text-[10px] text-charcoal-muted">
                      {order.payment_method === 'online_razorpay' ? 'Razorpay' : 'COD'}
                    </td>
                    <td className="py-3">
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
                    <td className="py-3 text-right font-semibold text-charcoal">
                      {formatPaise(order.total_paise)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Silhouettes */}
        <div className="lg:col-span-4 bg-ivory border border-sand/70 p-6 space-y-4 shadow-xs">
          <div className="flex justify-between items-center border-b border-sand pb-3">
            <h2 className="font-serif text-lg text-charcoal font-medium">Signature Silhouettes</h2>
            <Link
              href="/admin/products"
              className="text-xs text-gold hover:underline font-semibold"
            >
              Catalogue
            </Link>
          </div>

          <div className="divide-y divide-sand/40">
            {products.slice(0, 4).map((product) => {
              const lowestPrice = Math.min(...(product.variants?.map((v) => v.price_paise) || [0]));
              const totalStock = product.variants?.reduce((s, v) => s + v.stock_quantity, 0) || 0;
              return (
                <div key={product.id} className="py-3 flex items-center space-x-3">
                  <div className="w-10 h-14 bg-cream shrink-0 overflow-hidden">
                    {product.images?.[0] && (
                      <img
                        src={product.images[0].storage_path}
                        alt={product.name}
                        className="w-full h-full object-cover object-top"
                      />
                    )}
                  </div>
                  <div className="flex-1 truncate">
                    <p className="text-xs font-medium text-charcoal truncate">
                      {product.name}
                    </p>
                    <p className="text-[11px] text-charcoal-muted">
                      {formatPaise(lowestPrice)} • {totalStock} in stock
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
