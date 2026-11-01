import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import { CheckoutForm } from '@/components/storefront/checkout-form';

export const metadata = {
  title: 'Secure Checkout | SHRÎ Atelier',
  description: 'Complete your luxury fashion order with secure payment or Cash on Delivery.',
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      {/* Minimal Checkout Header */}
      <header className="border-b border-sand py-4 px-4 sm:px-8 bg-ivory sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/cart"
            className="text-xs uppercase tracking-widest text-charcoal-muted hover:text-charcoal flex items-center space-x-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Bag</span>
          </Link>

          <Link href="/" className="text-center block">
            <span className="font-serif text-2xl tracking-[0.25em] font-medium uppercase text-charcoal">
              SHRÎ
            </span>
            <span className="text-[9px] uppercase tracking-[0.45em] text-charcoal-muted block -mt-1 font-sans">
              Atelier
            </span>
          </Link>

          <div className="flex items-center space-x-1 text-xs text-charcoal-muted">
            <Shield className="w-4 h-4 text-gold" />
            <span className="hidden sm:inline">256-Bit SSL Encrypted</span>
          </div>
        </div>
      </header>

      {/* Main Checkout Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <CheckoutForm />
      </main>

      {/* Minimal Checkout Footer */}
      <footer className="border-t border-sand py-6 text-center text-xs text-charcoal-muted bg-cream/30">
        <p>© 2026 SHRÎ Atelier Pvt. Ltd. All transactions are securely audited and encrypted.</p>
      </footer>
    </div>
  );
}
