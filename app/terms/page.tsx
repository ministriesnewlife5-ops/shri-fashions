import React from 'react';
import { Header } from '@/components/storefront/header';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { Footer } from '@/components/storefront/footer';

export const metadata = {
  title: 'Terms of Service | SHRÎ Atelier',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-16 md:py-20 space-y-8">
        <div className="border-b border-sand pb-4">
          <span className="text-xs uppercase tracking-[0.3em] text-gold font-medium block">
            Legal Terms
          </span>
          <h1 className="font-serif text-3xl md:text-4xl text-charcoal font-normal">
            Terms of Service
          </h1>
        </div>

        <div className="text-xs text-charcoal-muted leading-relaxed font-light space-y-6">
          <p>
            Welcome to SHRÎ Atelier. By accessing or acquiring silhouettes from our website, you agree to be bound by the following terms and commercial practices.
          </p>

          <div>
            <h2 className="font-serif text-base text-charcoal font-semibold mb-1">
              Pricing and Currency
            </h2>
            <p>
              All prices displayed are denominated in Indian Rupees (INR ₹) and are inclusive of applicable Goods and Services Tax (GST 5% on apparel).
            </p>
          </div>

          <div>
            <h2 className="font-serif text-base text-charcoal font-semibold mb-1">
              Single-Brand Inventory Ownership
            </h2>
            <p>
              All products listed are created and owned directly by SHRÎ Atelier. We do not host third-party sellers. Orders are subject to physical studio stock verification.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
