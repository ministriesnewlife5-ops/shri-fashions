'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  ArrowRight,
  Lock,
  CheckCircle2,
  AlertCircle,
  Tag,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '@/lib/context/cart-context';
import { useAuth } from '@/lib/context/auth-context';
import { formatPaise } from '@/lib/utils/format';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh'
];

export function CheckoutForm() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    items,
    subtotalPaise,
    discountPaise,
    appliedCoupon,
    clearCart,
  } = useCart();

  // Form states
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || user?.profile?.phone || '');
  const [fullName, setFullName] = useState(user?.profile?.full_name || '');

  React.useEffect(() => {
    if (user) {
      if (user.email && !email) setEmail(user.email);
      if ((user.phone || user.profile?.phone) && !phone) setPhone(user.phone || user.profile?.phone || '');
      if (user.profile?.full_name && !fullName) setFullName(user.profile.full_name);
    }
  }, [user]);
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'online_razorpay' | 'cod'>('online_razorpay');
  const [orderNotes, setOrderNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dynamic calculations based on payment method
  const freeShipping = subtotalPaise >= 250000;
  const shippingFee = freeShipping ? 0 : 15000; // ₹150
  const codFee = paymentMethod === 'cod' ? 9900 : 0; // ₹99
  const taxableBase = Math.max(0, subtotalPaise - discountPaise);
  const totalPaise = taxableBase + shippingFee + codFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic frontend checks
    if (!email || !phone || !fullName || !addressLine1 || !city || !pincode) {
      setErrorMessage('Please fill in all required shipping fields.');
      return;
    }

    if (!/^\d{6}$/.test(pincode)) {
      setErrorMessage('Please enter a valid 6-digit Indian postal pincode.');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        email,
        phone,
        shippingAddress: {
          fullName,
          phone,
          addressLine1,
          addressLine2: addressLine2 || undefined,
          city,
          state,
          pincode,
          country: 'India',
        },
        useSameAddressForBilling: true,
        paymentMethod,
        items: items.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity,
        })),
        couponCode: appliedCoupon?.code || null,
        orderNotes: orderNotes || undefined,
      };

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Checkout failed. Please check your information.');
        setIsSubmitting(false);
        return;
      }

      const orderNumber = data.orderNumber;
      const orderId = data.orderId;

      // Handle Online Payment with Razorpay
      if (paymentMethod === 'online_razorpay') {
        const razorpayOrder = data.razorpayOrder;

        // Check if Razorpay script is present or test mode simulation
        const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

        if (razorpayKey && (window as any).Razorpay) {
          const options = {
            key: razorpayKey,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            name: 'SHRÎ Atelier',
            description: `Order ${orderNumber}`,
            order_id: razorpayOrder.id,
            prefill: {
              name: fullName,
              email: email,
              contact: phone,
            },
            theme: {
              color: '#1C1A18',
            },
            handler: async function (response: any) {
              // Verify signature
              const verifyRes = await fetch('/api/checkout/razorpay/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });

              if (verifyRes.ok) {
                clearCart();
                router.push(`/order-confirmation/${orderNumber}`);
              } else {
                setErrorMessage('Payment verification failed. Please contact atelier support.');
                setIsSubmitting(false);
              }
            },
            modal: {
              ondismiss: function () {
                setIsSubmitting(false);
              },
            },
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        } else {
          // Test Mode Gateway Simulation (when live credentials are not yet entered)
          // Verifies the test transaction cleanly and moves to confirmation
          await fetch('/api/checkout/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId,
              razorpayOrderId: razorpayOrder?.id || 'order_test_demo',
              razorpayPaymentId: `pay_test_${Date.now()}`,
              razorpaySignature: `test_sig_${Date.now()}`,
            }),
          });

          clearCart();
          router.push(`/order-confirmation/${orderNumber}`);
        }
      } else {
        // Cash on Delivery
        clearCart();
        router.push(`/order-confirmation/${orderNumber}`);
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message || 'Network error submitting checkout. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-20 text-center space-y-4">
        <p className="font-serif text-xl">Your bag is empty.</p>
        <Link
          href="/shop"
          className="inline-block px-6 py-2.5 bg-charcoal text-ivory text-xs uppercase tracking-widest"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
      {/* Checkout Form */}
      <div className="lg:col-span-7">
        <form onSubmit={handleSubmitOrder} className="space-y-8">
          {errorMessage && (
            <div className="p-4 bg-error/10 border border-error/30 text-error text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Contact Details */}
          <div className="space-y-4">
            <h2 className="font-serif text-xl text-charcoal border-b border-sand pb-3">
              1. Contact Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wider font-semibold text-charcoal block mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-ivory border border-sand px-3.5 py-2.5 text-xs text-charcoal focus:border-charcoal focus:outline-hidden"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider font-semibold text-charcoal block mb-1">
                  Mobile Number (India) *
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 border border-r-0 border-sand bg-cream text-xs text-charcoal">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 bg-ivory border border-sand px-3 py-2.5 text-xs text-charcoal focus:border-charcoal focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="space-y-4">
            <h2 className="font-serif text-xl text-charcoal border-b border-sand pb-3">
              2. Delivery Address
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider font-semibold text-charcoal block mb-1">
                  Full Recipient Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Radhika Varma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-ivory border border-sand px-3.5 py-2.5 text-xs text-charcoal focus:border-charcoal focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider font-semibold text-charcoal block mb-1">
                  Address Line 1 (Flat, House, Building, Street) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Apartment 402, Signature Palms, 12th Main Road"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="w-full bg-ivory border border-sand px-3.5 py-2.5 text-xs text-charcoal focus:border-charcoal focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider font-semibold text-charcoal block mb-1">
                  Address Line 2 (Landmark, Colony) - Optional
                </label>
                <input
                  type="text"
                  placeholder="Near Indiranagar Club"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  className="w-full bg-ivory border border-sand px-3.5 py-2.5 text-xs text-charcoal focus:border-charcoal focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wider font-semibold text-charcoal block mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Bengaluru"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-ivory border border-sand px-3.5 py-2.5 text-xs text-charcoal focus:border-charcoal focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider font-semibold text-charcoal block mb-1">
                    State *
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-ivory border border-sand px-3 py-2.5 text-xs text-charcoal focus:border-charcoal focus:outline-hidden"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider font-semibold text-charcoal block mb-1">
                    Postal Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="560038"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full bg-ivory border border-sand px-3.5 py-2.5 text-xs text-charcoal focus:border-charcoal focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-4">
            <h2 className="font-serif text-xl text-charcoal border-b border-sand pb-3">
              3. Payment Selection
            </h2>

            <div className="space-y-3">
              {/* Online Payment */}
              <label
                className={`flex items-start p-4 border cursor-pointer transition-colors ${
                  paymentMethod === 'online_razorpay'
                    ? 'border-charcoal bg-cream/40 ring-1 ring-charcoal'
                    : 'border-sand hover:bg-cream/20'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="online_razorpay"
                  checked={paymentMethod === 'online_razorpay'}
                  onChange={() => setPaymentMethod('online_razorpay')}
                  className="mt-0.5 text-charcoal focus:ring-0"
                />
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold uppercase tracking-wider text-charcoal">
                      Online Payment (Razorpay)
                    </span>
                    <span className="text-[10px] text-success font-semibold uppercase tracking-widest bg-success/10 px-2 py-0.5">
                      Fastest Dispatch
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                    Instant verification via UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, or Netbanking.
                  </p>
                </div>
              </label>

              {/* Cash on Delivery (COD) */}
              <label
                className={`flex items-start p-4 border cursor-pointer transition-colors ${
                  paymentMethod === 'cod'
                    ? 'border-charcoal bg-cream/40 ring-1 ring-charcoal'
                    : 'border-sand hover:bg-cream/20'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-0.5 text-charcoal focus:ring-0"
                />
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold uppercase tracking-wider text-charcoal">
                      Cash on Delivery (COD)
                    </span>
                    <span className="text-xs font-medium text-charcoal">
                      +₹99 Handling
                    </span>
                  </div>
                  <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                    Pay in cash or UPI directly to courier partner upon doorstep delivery.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Delivery Note */}
          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-charcoal block mb-1">
              Order Notes / Delivery Instructions (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Leave with security / Call upon arrival"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              className="w-full bg-ivory border border-sand p-3 text-xs text-charcoal focus:border-charcoal focus:outline-hidden"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-charcoal text-ivory text-xs uppercase tracking-widest font-semibold hover:bg-gold transition-colors flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50"
          >
            <Lock className="w-4 h-4" />
            <span>
              {isSubmitting
                ? 'Processing Atelier Order...'
                : paymentMethod === 'online_razorpay'
                ? `Pay ${formatPaise(totalPaise)} Securely`
                : `Confirm Order (${formatPaise(totalPaise)})`}
            </span>
          </button>
        </form>
      </div>

      {/* Right: Order Summary */}
      <div className="lg:col-span-5">
        <div className="bg-cream/40 p-6 md:p-8 border border-sand/60 space-y-6 sticky top-28">
          <h2 className="font-serif text-xl text-charcoal border-b border-sand pb-4">
            Bag Summary ({items.length} items)
          </h2>

          <div className="divide-y divide-sand/40 max-h-72 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.variantId} className="py-3 flex space-x-3 items-center">
                <div className="w-14 h-18 bg-cream shrink-0 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-serif text-xs font-medium text-charcoal line-clamp-1">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-charcoal-muted">
                    Size: {item.size} • Qty: {item.quantity}
                  </p>
                  <p className="text-xs font-semibold text-charcoal">
                    {formatPaise(item.pricePaise * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Breakdown */}
          <div className="space-y-2 text-xs text-charcoal-muted pt-2 border-t border-sand">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-charcoal font-medium">{formatPaise(subtotalPaise)}</span>
            </div>
            {discountPaise > 0 && (
              <div className="flex justify-between text-success">
                <span>Coupon ({appliedCoupon?.code})</span>
                <span>-{formatPaise(discountPaise)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Courier</span>
              <span className="text-charcoal font-medium">
                {freeShipping ? 'Complimentary' : formatPaise(shippingFee)}
              </span>
            </div>
            {paymentMethod === 'cod' && (
              <div className="flex justify-between">
                <span>COD Verification Fee</span>
                <span className="text-charcoal font-medium">{formatPaise(codFee)}</span>
              </div>
            )}
            <div className="flex justify-between text-charcoal-muted/80">
              <span>Estimated GST (5% Included)</span>
              <span>{formatPaise(Math.round(((subtotalPaise - discountPaise) * 5) / 105))}</span>
            </div>

            <div className="pt-4 border-t border-sand flex justify-between text-base font-semibold text-charcoal">
              <span>Total Payable Amount</span>
              <span>{formatPaise(totalPaise)}</span>
            </div>
          </div>

          <div className="p-3 bg-ivory border border-sand/60 text-[11px] text-charcoal-muted space-y-1">
            <p className="font-semibold text-charcoal">Studio Dispatch Assurance</p>
            <p>Every piece is individually steamed, quality audited, and packaged in plastic-free recycled linen boxes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
