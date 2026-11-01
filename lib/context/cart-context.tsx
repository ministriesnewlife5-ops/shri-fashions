'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Coupon } from '@/lib/types/database';
import { calculateOrderPricing } from '@/lib/utils/pricing';

export interface CartItemModel {
  variantId: string;
  productId: string;
  name: string;
  image: string;
  size: string;
  color: string;
  pricePaise: number;
  compareAtPricePaise?: number | null;
  quantity: number;
  maxStock: number;
}

interface CartContextType {
  items: CartItemModel[];
  itemCount: number;
  subtotalPaise: number;
  discountPaise: number;
  shippingPaise: number;
  totalPaise: number;
  appliedCoupon: Coupon | null;
  couponError: string | null;
  freeShippingEligible: boolean;
  amountForFreeShippingPaise: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addItem: (item: Omit<CartItemModel, 'quantity'> & { quantity?: number }) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'shri_cart_items_v1';
const COUPON_STORAGE_KEY = 'shri_cart_coupon_v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemModel[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const storedItems = localStorage.getItem(CART_STORAGE_KEY);
      if (storedItems) {
        setItems(JSON.parse(storedItems));
      }
      const storedCoupon = localStorage.getItem(COUPON_STORAGE_KEY);
      if (storedCoupon) {
        setAppliedCoupon(JSON.parse(storedCoupon));
      }
    } catch {
      // Storage unavailable or invalid JSON
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Sync items to local storage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage write error
    }
  }, [items, isInitialized]);

  // Sync coupon to local storage
  useEffect(() => {
    if (!isInitialized) return;
    try {
      if (appliedCoupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch {
      // Storage write error
    }
  }, [appliedCoupon, isInitialized]);

  // Recalculate totals
  const pricing = calculateOrderPricing({
    items: items.map((i) => ({
      variant_id: i.variantId,
      unit_price_paise: i.pricePaise,
      quantity: i.quantity,
    })),
    coupon: appliedCoupon,
  });

  const addItem = (newItem: Omit<CartItemModel, 'quantity'> & { quantity?: number }) => {
    const qty = newItem.quantity || 1;
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === newItem.variantId);
      if (existing) {
        const updatedQty = Math.min(existing.quantity + qty, newItem.maxStock);
        return prev.map((i) =>
          i.variantId === newItem.variantId ? { ...i, quantity: updatedQty } : i
        );
      }
      return [...prev, { ...newItem, quantity: Math.min(qty, newItem.maxStock) }];
    });
    setIsCartOpen(true);
  };

  const removeItem = (variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(variantId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.variantId === variantId) {
          return { ...i, quantity: Math.min(quantity, i.maxStock) };
        }
        return i;
      })
    );
  };

  // Real Supabase Coupon Validation via Backend API
  const applyCoupon = async (code: string): Promise<boolean> => {
    setCouponError(null);
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setCouponError('Please enter a promotional code.');
      return false;
    }

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: trimmed,
          subtotalPaise: pricing.subtotal_paise,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.valid) {
        setCouponError(data.error || 'Invalid or inactive promotional code.');
        return false;
      }

      setAppliedCoupon(data.coupon);
      return true;
    } catch {
      setCouponError('Unable to validate coupon at this time. Please try again.');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setCouponError(null);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(COUPON_STORAGE_KEY);
    } catch {
      // Storage clear
    }
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Free shipping threshold: ₹2,500 (250,000 paise)
  const freeShippingThresholdPaise = 250000;
  const freeShippingEligible = pricing.subtotal_paise >= freeShippingThresholdPaise;
  const amountForFreeShippingPaise = Math.max(0, freeShippingThresholdPaise - pricing.subtotal_paise);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotalPaise: pricing.subtotal_paise,
        discountPaise: pricing.discount_paise,
        shippingPaise: pricing.shipping_paise,
        totalPaise: pricing.total_paise,
        appliedCoupon,
        couponError,
        freeShippingEligible,
        amountForFreeShippingPaise,
        isCartOpen,
        setIsCartOpen,
        addItem,
        removeItem,
        updateQuantity,
        applyCoupon,
        removeCoupon,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
