'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Trash2, ShoppingBag, Tag, Plus, Minus, ArrowLeft, ShieldCheck, Truck } from 'lucide-react';
import { Header } from '@/components/storefront/header';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { Footer } from '@/components/storefront/footer';
import { useCart } from '@/lib/context/cart-context';
import { formatPaise } from '@/lib/utils/format';

export default function CartPage() {
  const {
    items,
    itemCount,
    subtotalPaise,
    discountPaise,
    shippingPaise,
    totalPaise,
    appliedCoupon,
    couponError,
    freeShippingEligible,
    amountForFreeShippingPaise,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setIsApplying(true);
    await applyCoupon(couponCode);
    setIsApplying(false);
  };

  const freeShippingProgress = Math.min(100, Math.round(((250000 - amountForFreeShippingPaise) / 250000) * 100));

  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="border-b border-sand pb-6 mb-8 flex items-baseline justify-between">
          <h1 className="font-serif text-3xl md:text-4xl text-charcoal">
            Shopping Bag ({itemCount})
          </h1>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-widest text-charcoal-muted hover:text-charcoal flex items-center space-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Browsing</span>
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="py-24 text-center space-y-4 max-w-md mx-auto">
            <ShoppingBag className="w-16 h-16 text-sand mx-auto stroke-1" />
            <h2 className="font-serif text-2xl text-charcoal">Your bag is currently empty</h2>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Explore our handcrafted seasonal silhouettes in pure Mulberry silk, European linen, and handwoven Chanderi.
            </p>
            <div className="pt-4">
              <Link
                href="/shop"
                className="px-8 py-3.5 bg-charcoal text-ivory text-xs uppercase tracking-widest font-semibold hover:bg-gold transition-colors inline-block"
              >
                Discover Collection
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Items Column */}
            <div className="lg:col-span-8 space-y-6">
              {/* Free shipping alert */}
              <div className="p-4 bg-cream/70 border border-sand/60 text-xs">
                {freeShippingEligible ? (
                  <p className="text-success font-medium flex items-center">
                    <Truck className="w-4 h-4 mr-2" />
                    Congratulations! Your order qualifies for Complimentary Express Delivery.
                  </p>
                ) : (
                  <div>
                    <p className="text-charcoal mb-1">
                      Add <strong className="font-semibold">{formatPaise(amountForFreeShippingPaise)}</strong> more to unlock Complimentary Express Courier Delivery across India.
                    </p>
                    <div className="w-full bg-sand h-1.5 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-gold h-full transition-all duration-300"
                        style={{ width: `${freeShippingProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="divide-y divide-sand border-y border-sand">
                {items.map((item) => (
                  <div key={item.variantId} className="py-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                    <div className="w-24 h-32 bg-cream shrink-0 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-serif text-base text-charcoal font-medium">
                            <Link href={`/products/${item.productId}`} className="hover:text-gold transition-colors">
                              {item.name}
                            </Link>
                          </h3>
                          <span className="font-semibold text-charcoal text-sm">
                            {formatPaise(item.pricePaise * item.quantity)}
                          </span>
                        </div>

                        <div className="text-xs text-charcoal-muted mt-1 space-x-3">
                          <span>Size: <strong className="text-charcoal font-medium">{item.size}</strong></span>
                          <span>•</span>
                          <span>Color: <strong className="text-charcoal font-medium">{item.color}</strong></span>
                          <span>•</span>
                          <span>Unit: {formatPaise(item.pricePaise)}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center border border-sand">
                            <button
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                              className="px-2.5 py-1 text-charcoal hover:bg-cream text-xs"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-3 text-xs font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                              disabled={item.quantity >= item.maxStock}
                              className="px-2.5 py-1 text-charcoal hover:bg-cream text-xs disabled:opacity-30"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          {item.quantity >= item.maxStock && (
                            <span className="text-[10px] text-terracotta">Max available</span>
                          )}
                        </div>

                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="text-xs text-charcoal-muted hover:text-error flex items-center space-x-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Summary Column */}
            <div className="lg:col-span-4">
              <div className="bg-cream/40 p-6 md:p-8 border border-sand/60 space-y-6">
                <h2 className="font-serif text-xl text-charcoal pb-4 border-b border-sand">
                  Order Summary
                </h2>

                {/* Coupon Code Section */}
                <div>
                  <label className="text-xs uppercase tracking-wider font-semibold text-charcoal block mb-2">
                    Promotional Code
                  </label>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-gold/15 p-2.5 border border-gold/30 text-xs">
                      <div className="flex items-center space-x-2">
                        <Tag className="w-3.5 h-3.5 text-gold-hover" />
                        <span className="font-semibold text-charcoal">{appliedCoupon.code}</span>
                        <span className="text-charcoal-muted">(-{formatPaise(discountPaise)})</span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-charcoal-muted hover:text-error underline text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="e.g. WELCOME10"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="flex-1 bg-ivory border border-sand px-3 py-2 text-xs uppercase placeholder:normal-case focus:outline-hidden focus:border-charcoal"
                        />
                        <button
                          type="submit"
                          disabled={isApplying || !couponCode.trim()}
                          className="px-4 py-2 bg-charcoal text-ivory text-xs uppercase tracking-wider hover:bg-gold transition-colors disabled:opacity-50"
                        >
                          Apply
                        </button>
                      </div>
                      {couponError && <p className="text-[11px] text-error">{couponError}</p>}
                    </form>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 text-xs text-charcoal-muted pt-2 border-t border-sand">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-charcoal font-medium">{formatPaise(subtotalPaise)}</span>
                  </div>
                  {discountPaise > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Promotional Discount</span>
                      <span>-{formatPaise(discountPaise)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping Charges</span>
                    <span className="text-charcoal font-medium">
                      {freeShippingEligible ? 'Free' : formatPaise(shippingPaise)}
                    </span>
                  </div>
                  <div className="flex justify-between text-charcoal-muted/80">
                    <span>Estimated GST (5% Included)</span>
                    <span>{formatPaise(Math.round(((subtotalPaise - discountPaise) * 5) / 105))}</span>
                  </div>

                  <div className="pt-4 border-t border-sand flex justify-between text-base font-semibold text-charcoal">
                    <span>Estimated Total</span>
                    <span>{formatPaise(totalPaise)}</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <div className="space-y-3 pt-2">
                  <Link
                    href="/checkout"
                    className="w-full py-4 bg-charcoal text-ivory text-xs uppercase tracking-widest font-semibold flex items-center justify-center space-x-2 hover:bg-gold transition-colors text-center shadow-md"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <div className="flex items-center justify-center space-x-2 text-[11px] text-charcoal-muted">
                    <ShieldCheck className="w-3.5 h-3.5 text-gold" />
                    <span>256-bit Encrypted SSL Checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
