'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, ShoppingBag, ArrowRight, Tag, Trash2 } from 'lucide-react';
import { useCart } from '@/lib/context/cart-context';
import { formatPaise } from '@/lib/utils/format';

export function CartDrawer() {
  const {
    items,
    itemCount,
    subtotalPaise,
    discountPaise,
    totalPaise,
    appliedCoupon,
    couponError,
    freeShippingEligible,
    amountForFreeShippingPaise,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    await applyCoupon(couponInput);
    setIsApplyingCoupon(false);
  };

  const freeShippingProgress = Math.min(100, Math.round(((250000 - amountForFreeShippingPaise) / 250000) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-ivory text-charcoal shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-sand/60 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-charcoal" />
              <h2 className="font-serif text-xl tracking-wide uppercase">Shopping Bag</h2>
              <span className="text-xs text-charcoal-muted font-sans">({itemCount})</span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 -mr-2 text-charcoal-muted hover:text-charcoal transition-colors"
              aria-label="Close shopping bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Tracker */}
          <div className="px-6 py-3 bg-cream/70 border-b border-sand/40 text-xs">
            {freeShippingEligible ? (
              <p className="text-success font-medium flex items-center justify-center">
                ✓ You have unlocked Complimentary Express Delivery!
              </p>
            ) : (
              <div>
                <p className="text-charcoal-muted mb-1 text-center">
                  Add <span className="font-semibold text-charcoal">{formatPaise(amountForFreeShippingPaise)}</span> more for Free Delivery
                </p>
                <div className="w-full bg-sand h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gold h-full transition-all duration-300"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 divide-y divide-sand/40">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <ShoppingBag className="w-12 h-12 text-sand mb-4 stroke-1" />
                <p className="font-serif text-lg text-charcoal mb-2">Your shopping bag is empty</p>
                <p className="text-xs text-charcoal-muted max-w-xs mb-6">
                  Explore our handcrafted silhouettes and discover timeless luxury pieces.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 bg-charcoal text-ivory text-xs uppercase tracking-widest hover:bg-gold transition-colors"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.variantId} className="py-4 flex space-x-4">
                  <div className="relative w-20 h-26 bg-cream shrink-0 overflow-hidden rounded-xs">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-serif text-sm font-medium leading-snug line-clamp-1">
                          {item.name}
                        </h3>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="text-charcoal-muted hover:text-error transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-charcoal-muted mt-1">
                        Size: <span className="text-charcoal font-medium">{item.size}</span> | Color:{' '}
                        <span className="text-charcoal font-medium">{item.color}</span>
                      </p>
                      <p className="text-xs font-semibold text-charcoal mt-1">
                        {formatPaise(item.pricePaise)}
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center space-x-3 mt-3">
                      <div className="flex items-center border border-sand">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="p-1 hover:bg-sand/40 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3 text-charcoal" />
                        </button>
                        <span className="px-3 text-xs font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="p-1 hover:bg-sand/40 transition-colors disabled:opacity-30"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3 text-charcoal" />
                        </button>
                      </div>
                      {item.quantity >= item.maxStock && (
                        <span className="text-[10px] text-terracotta">Max stock</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-6 bg-cream/40 border-t border-sand/60 space-y-4">
              {/* Coupon Code Input */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-gold/15 px-3 py-2 border border-gold/30 text-xs">
                  <div className="flex items-center space-x-2">
                    <Tag className="w-3.5 h-3.5 text-gold-hover" />
                    <span className="font-medium text-charcoal tracking-wide">
                      {appliedCoupon.code} applied (-{formatPaise(discountPaise)})
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-charcoal-muted hover:text-error underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-1">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Promo code (e.g. WELCOME10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 bg-ivory border border-sand px-3 py-2 text-xs uppercase placeholder:normal-case focus:outline-hidden focus:border-charcoal"
                    />
                    <button
                      type="submit"
                      disabled={isApplyingCoupon || !couponInput.trim()}
                      className="px-4 py-2 bg-charcoal text-ivory text-xs uppercase tracking-wider hover:bg-gold transition-colors disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-[11px] text-error">{couponError}</p>}
                </form>
              )}

              {/* Price summary */}
              <div className="space-y-1.5 text-xs text-charcoal-muted">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-charcoal font-medium">{formatPaise(subtotalPaise)}</span>
                </div>
                {discountPaise > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount</span>
                    <span>-{formatPaise(discountPaise)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="text-charcoal font-medium">
                    {freeShippingEligible ? 'Complimentary' : 'Calculated at checkout'}
                  </span>
                </div>
                <div className="pt-2 border-t border-sand/60 flex justify-between text-sm font-semibold text-charcoal">
                  <span>Estimated Total</span>
                  <span>{formatPaise(totalPaise)}</span>
                </div>
                <p className="text-[10px] text-charcoal-muted text-center">
                  Inclusive of all taxes (GST 5%) • Ships in 24–48 hours
                </p>
              </div>

              {/* Buttons */}
              <div className="space-y-2">
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-3.5 bg-charcoal text-ivory text-xs uppercase tracking-widest font-medium flex items-center justify-center space-x-2 hover:bg-gold transition-colors text-center"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-2.5 text-center text-xs uppercase tracking-widest text-charcoal hover:underline block"
                >
                  View Full Cart
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
