import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, Package, Truck, ArrowRight, Printer } from 'lucide-react';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { getOrderByNumber } from '@/lib/services/orders';
import { formatPaise, formatDate } from '@/lib/utils/format';

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);

  if (!order) {
    notFound();
  }

  const isCod = order.payment_method === 'cod';

  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 md:py-16">
        {/* Success Banner */}
        <div className="text-center space-y-4 pb-10 border-b border-sand">
          <div className="w-16 h-16 bg-gold/15 text-gold-hover rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="text-xs uppercase tracking-[0.3em] text-gold font-medium block">
            Thank you for your order
          </span>
          <h1 className="font-serif text-3xl md:text-4xl text-charcoal font-normal">
            Your Order Has Been Inscribed
          </h1>
          <p className="text-xs text-charcoal-muted max-w-md mx-auto leading-relaxed">
            Order reference <strong className="font-mono text-charcoal">{order.order_number}</strong> has been logged into our Bangalore atelier studio for tailored preparation.
          </p>
        </div>

        {/* Order Details & Receipt */}
        <div className="py-10 space-y-10">
          {/* Status summary banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-cream/50 p-6 border border-sand/60 text-xs">
            <div>
              <span className="text-charcoal-muted block uppercase tracking-wider text-[10px]">
                Order Number
              </span>
              <strong className="font-mono text-charcoal text-sm">{order.order_number}</strong>
            </div>
            <div>
              <span className="text-charcoal-muted block uppercase tracking-wider text-[10px]">
                Payment Status
              </span>
              <strong className="text-charcoal capitalize">
                {order.payment_status === 'captured'
                  ? 'Paid Securely via Online Gateway'
                  : isCod
                  ? 'Cash on Delivery (Pending Collection)'
                  : 'Pending'}
              </strong>
            </div>
            <div>
              <span className="text-charcoal-muted block uppercase tracking-wider text-[10px]">
                Estimated Delivery
              </span>
              <strong className="text-charcoal">
                2 to 4 Business Days (Insured Courier)
              </strong>
            </div>
          </div>

          {/* Purchased Items Table */}
          <div className="space-y-4">
            <h2 className="font-serif text-xl text-charcoal border-b border-sand pb-3">
              Selected Silhouettes
            </h2>

            <div className="divide-y divide-sand border-y border-sand">
              {order.items?.map((item) => (
                <div key={item.id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {item.image_url && (
                      <div className="w-14 h-18 bg-cream shrink-0 overflow-hidden">
                        <img
                          src={item.image_url}
                          alt={item.product_name}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                    )}
                    <div>
                      <h4 className="font-serif text-sm font-medium text-charcoal">
                        {item.product_name}
                      </h4>
                      <p className="text-xs text-charcoal-muted mt-0.5">
                        Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                      </p>
                      <p className="text-[10px] font-mono text-charcoal-muted">
                        SKU: {item.sku}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-xs text-charcoal">
                    {formatPaise(item.line_total_paise)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping & Financial Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            {/* Delivery address snapshot */}
            <div className="space-y-2 text-xs text-charcoal-muted bg-cream/30 p-6 border border-sand/40">
              <h3 className="font-serif text-base text-charcoal font-semibold mb-2">
                Delivery Address
              </h3>
              <p className="font-medium text-charcoal">{order.shipping_address?.full_name}</p>
              <p>{order.shipping_address?.address_line1}</p>
              {order.shipping_address?.address_line2 && (
                <p>{order.shipping_address.address_line2}</p>
              )}
              <p>
                {order.shipping_address?.city}, {order.shipping_address?.state} -{' '}
                {order.shipping_address?.pincode}
              </p>
              <p>Phone: +91 {order.shipping_address?.phone}</p>
            </div>

            {/* Price breakdown */}
            <div className="space-y-2 text-xs text-charcoal-muted bg-cream/30 p-6 border border-sand/40">
              <h3 className="font-serif text-base text-charcoal font-semibold mb-2">
                Financial Statement
              </h3>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-charcoal">{formatPaise(order.subtotal_paise)}</span>
              </div>
              {order.discount_paise > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount</span>
                  <span>-{formatPaise(order.discount_paise)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-charcoal">
                  {order.shipping_paise === 0 ? 'Complimentary' : formatPaise(order.shipping_paise)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Taxes (GST 5% Included)</span>
                <span className="text-charcoal">{formatPaise(order.tax_paise)}</span>
              </div>
              <div className="pt-3 border-t border-sand flex justify-between font-bold text-sm text-charcoal">
                <span>Total Amount</span>
                <span>{formatPaise(order.total_paise)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-sand">
            <Link
              href="/shop"
              className="w-full sm:w-auto px-6 py-3 bg-charcoal text-ivory text-xs uppercase tracking-widest font-semibold hover:bg-gold transition-colors text-center"
            >
              Continue Browsing Silhouettes
            </Link>
            <Link
              href="/account/orders"
              className="text-xs uppercase tracking-widest font-semibold text-charcoal hover:underline"
            >
              View in My Orders
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
