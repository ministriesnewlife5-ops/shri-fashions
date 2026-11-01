'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, AlertCircle, Printer, Truck, ShieldCheck } from 'lucide-react';
import { Order, OrderStatus } from '@/lib/types/database';
import { formatPaise, formatDate } from '@/lib/utils/format';

export function OrderDetailView({ initialOrder }: { initialOrder: Order }) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order.status);
  const [internalNote, setInternalNote] = useState(order.admin_notes || '');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleUpdateStatus = () => {
    setOrder({
      ...order,
      status: selectedStatus,
      admin_notes: internalNote,
      updated_at: new Date().toISOString(),
    });
    setToastMessage(`Order status updated to "${selectedStatus}" successfully.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCancelOrder = () => {
    if (confirm('Are you sure you want to cancel this order and restore reserved stock?')) {
      setOrder({
        ...order,
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      });
      setSelectedStatus('cancelled');
      setToastMessage('Order has been cancelled.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-sand pb-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/orders"
            className="p-1 text-charcoal-muted hover:text-charcoal"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-[10px] uppercase tracking-widest text-gold font-semibold block">
              Order Fulfillment Record
            </span>
            <h1 className="font-serif text-2xl text-charcoal font-normal flex items-center space-x-3">
              <span>{order.order_number}</span>
              <span
                className={`text-xs uppercase font-semibold px-2.5 py-0.5 rounded-xs ${
                  order.status === 'delivered'
                    ? 'bg-success/15 text-success'
                    : order.status === 'cancelled'
                    ? 'bg-error/15 text-error'
                    : 'bg-gold/20 text-charcoal'
                }`}
              >
                {order.status}
              </span>
            </h1>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 border border-sand bg-ivory text-charcoal text-xs uppercase tracking-wider font-semibold hover:bg-cream transition-colors flex items-center space-x-1"
        >
          <Printer className="w-4 h-4" />
          <span>Print Packing Slip</span>
        </button>
      </div>

      {toastMessage && (
        <div className="p-4 bg-success/15 border border-success/40 text-success text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Items and Addresses */}
        <div className="lg:col-span-8 space-y-6">
          {/* Purchased Items */}
          <div className="bg-ivory border border-sand/70 p-6 space-y-4">
            <h2 className="font-serif text-lg text-charcoal border-b border-sand pb-2">
              Order Items ({order.items?.length || 0})
            </h2>

            <div className="divide-y divide-sand/40">
              {order.items?.map((item) => (
                <div key={item.id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {item.image_url && (
                      <div className="w-12 h-16 bg-cream shrink-0 overflow-hidden">
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
                      <p className="text-xs text-charcoal-muted">
                        Size: <strong>{item.size}</strong> • Color: <strong>{item.color}</strong> • SKU:{' '}
                        <span className="font-mono">{item.sku}</span>
                      </p>
                      <p className="text-[11px] text-charcoal-muted">
                        Unit Price: {formatPaise(item.unit_price_paise)} × {item.quantity}
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

          {/* Delivery & Shipping Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-ivory border border-sand/70 p-5 space-y-2 text-xs text-charcoal-muted">
              <h3 className="font-serif text-base text-charcoal font-semibold mb-2">
                Shipping Destination
              </h3>
              <p className="font-semibold text-charcoal">{order.shipping_address?.full_name}</p>
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

            <div className="bg-ivory border border-sand/70 p-5 space-y-2 text-xs text-charcoal-muted">
              <h3 className="font-serif text-base text-charcoal font-semibold mb-2">
                Payment Verification
              </h3>
              <p>
                Method:{' '}
                <strong className="uppercase text-charcoal">
                  {order.payment_method === 'online_razorpay' ? 'Online (Razorpay)' : 'Cash on Delivery'}
                </strong>
              </p>
              <p>
                Gateway Status:{' '}
                <strong className="uppercase text-charcoal">{order.payment_status}</strong>
              </p>
              <p>Currency: {order.currency}</p>
              <p className="pt-2 text-charcoal font-medium">
                Total Amount: <strong>{formatPaise(order.total_paise)}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Status Transitions & Notes */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-ivory border border-sand/70 p-6 space-y-4">
            <h3 className="font-serif text-base text-charcoal border-b border-sand pb-2">
              Update Order Status
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] uppercase font-semibold text-charcoal block mb-1">
                  Transition Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                  className="w-full bg-cream/40 border border-sand p-2 text-xs"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing in Atelier</option>
                  <option value="shipped">Shipped with Courier</option>
                  <option value="delivered">Delivered to Client</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-semibold text-charcoal block mb-1">
                  Internal Staff Notes
                </label>
                <textarea
                  rows={3}
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="e.g. Added bespoke hem stitching per client phone request"
                  className="w-full bg-cream/40 border border-sand p-2 text-xs"
                />
              </div>

              <button
                onClick={handleUpdateStatus}
                className="w-full py-2.5 bg-charcoal text-ivory uppercase tracking-wider font-semibold hover:bg-gold transition-colors text-xs"
              >
                Save Order Changes
              </button>

              {order.status !== 'cancelled' && order.status !== 'delivered' && (
                <button
                  onClick={handleCancelOrder}
                  className="w-full py-2 text-error border border-error/40 uppercase tracking-wider font-semibold hover:bg-error/10 text-xs mt-2"
                >
                  Cancel Order & Restore Stock
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
