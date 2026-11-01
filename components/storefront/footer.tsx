'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle2, ShieldCheck, Truck, RefreshCw, Sparkles } from 'lucide-react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    setIsSubscribed(true);
  };

  return (
    <footer className="bg-charcoal text-ivory/80 pt-16 pb-12 mt-20 border-t border-charcoal-light">
      {/* Brand Value Pillars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 border-b border-charcoal-muted/30">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start space-y-2">
            <Sparkles className="w-6 h-6 text-gold mb-1" />
            <h4 className="font-serif text-base text-ivory font-medium">Handcrafted in India</h4>
            <p className="text-xs text-ivory/60 leading-relaxed">
              Cut from pure Mulberry silks, Normandy linens, and artisan-spun cottons.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-start space-y-2">
            <Truck className="w-6 h-6 text-gold mb-1" />
            <h4 className="font-serif text-base text-ivory font-medium">Complimentary Delivery</h4>
            <p className="text-xs text-ivory/60 leading-relaxed">
              Express insured courier shipping across all Indian pincodes on orders over ₹2,500.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-start space-y-2">
            <RefreshCw className="w-6 h-6 text-gold mb-1" />
            <h4 className="font-serif text-base text-ivory font-medium">Seamless 7-Day Returns</h4>
            <p className="text-xs text-ivory/60 leading-relaxed">
              Hassle-free reverse doorstep pickup for unworn garments in original packaging.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-start space-y-2">
            <ShieldCheck className="w-6 h-6 text-gold mb-1" />
            <h4 className="font-serif text-base text-ivory font-medium">Secure Payments & COD</h4>
            <p className="text-xs text-ivory/60 leading-relaxed">
              Bank-grade 256-bit encryption via Razorpay UPI/cards, plus Cash on Delivery.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-serif text-2xl tracking-[0.25em] font-medium uppercase text-ivory block">
                SHRÎ
              </span>
              <span className="text-[9px] uppercase tracking-[0.45em] text-gold font-sans block -mt-1">
                Atelier
              </span>
            </Link>
            <p className="text-xs text-ivory/70 leading-relaxed max-w-sm">
              A contemporary Indian luxury house devoted to architectural tailoring, pure natural fibers, and mindful single-brand craftsmanship.
            </p>
            <div className="pt-2 text-xs text-ivory/60 space-y-1">
              <p>Studio: 14 Indiranagar, Bengaluru, KA 560038</p>
              <p>Email: concierge@shri-atelier.com</p>
              <p>Phone: +91 98765 43210 (Mon–Sat, 10am–7pm IST)</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-ivory">Catalogue</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/shop" className="hover:text-gold transition-colors">
                  All Collections
                </Link>
              </li>
              <li>
                <Link href="/shop?category=dresses" className="hover:text-gold transition-colors">
                  Sculptural Dresses
                </Link>
              </li>
              <li>
                <Link href="/shop?category=co-ords" className="hover:text-gold transition-colors">
                  Silk & Linen Sets
                </Link>
              </li>
              <li>
                <Link href="/shop?category=tunics-kurtas" className="hover:text-gold transition-colors">
                  Handcrafted Tunics
                </Link>
              </li>
              <li>
                <Link href="/collections/autumn-nocturne" className="hover:text-gold transition-colors">
                  Autumn Nocturne
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-ivory">Client Care</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/account/orders" className="hover:text-gold transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-gold transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/return-policy" className="hover:text-gold transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-gold transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gold transition-colors">
                  Concierge & Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs uppercase tracking-widest font-semibold text-ivory">The Atelier Journal</h4>
            <p className="text-xs text-ivory/70 leading-relaxed">
              Subscribe to receive private preview invitations for limited seasonal capsule drops and textile chronicles.
            </p>
            {isSubscribed ? (
              <div className="flex items-center space-x-2 text-xs text-gold bg-gold/10 p-3 border border-gold/30">
                <CheckCircle2 className="w-4 h-4 text-gold" />
                <span>You are now inscribed into our private seasonal circle.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-charcoal-light border border-charcoal-muted/40 px-3.5 py-2.5 text-xs text-ivory placeholder:text-ivory/40 focus:outline-hidden focus:border-gold"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gold text-charcoal font-medium text-xs uppercase tracking-widest hover:bg-gold-hover transition-colors"
                  >
                    Join
                  </button>
                </div>
                <p className="text-[10px] text-ivory/50">
                  By joining, you accept our Privacy Policy. Unsubscribe anytime.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Sub-bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-charcoal-muted/30 flex flex-col md:flex-row items-center justify-between text-xs text-ivory/50 space-y-4 md:space-y-0">
        <p>© 2026 SHRÎ Atelier Pvt. Ltd. All rights reserved.</p>
        <div className="flex flex-wrap items-center space-x-6 text-[11px]">
          <Link href="/privacy-policy" className="hover:text-gold transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-gold transition-colors">
            Terms & Conditions
          </Link>
          <Link href="/shipping-policy" className="hover:text-gold transition-colors">
            Shipping Terms
          </Link>
          <Link href="/return-policy" className="hover:text-gold transition-colors">
            Returns Policy
          </Link>
        </div>
        <div className="flex items-center space-x-2 text-[10px] text-ivory/40">
          <span>Razorpay Verified</span>
          <span>•</span>
          <span>UPI / RuPay / Visa</span>
          <span>•</span>
          <span>COD Available</span>
        </div>
      </div>
    </footer>
  );
}
