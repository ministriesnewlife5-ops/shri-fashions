import React from 'react';
import { Header } from '@/components/storefront/header';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { Footer } from '@/components/storefront/footer';

export const metadata = {
  title: 'Shipping & Delivery Policy | SHRÎ Atelier',
};

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-16 md:py-20 space-y-8">
        <div className="border-b border-sand pb-4">
          <span className="text-xs uppercase tracking-[0.3em] text-gold font-medium block">
            Atelier Logistics
          </span>
          <h1 className="font-serif text-3xl md:text-4xl text-charcoal font-normal">
            Shipping & Delivery Policy
          </h1>
        </div>

        <div className="text-xs text-charcoal-muted leading-relaxed font-light space-y-6">
          <div>
            <h2 className="font-serif text-base text-charcoal font-semibold mb-1">
              1. Complimentary Courier Delivery Across India
            </h2>
            <p>
              We provide complimentary express delivery on all orders exceeding ₹2,500. For orders under ₹2,500, a nominal shipping charge of ₹150 is applied at checkout to cover insured courier handling.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-base text-charcoal font-semibold mb-1">
              2. Processing & Dispatch Timeline
            </h2>
            <p>
              Because we own our inventory and store all fabrics in our dedicated Bangalore studio, all in-stock silhouettes undergo quality steaming and inspection and are dispatched within 24 to 48 hours of order confirmation.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-base text-charcoal font-semibold mb-1">
              3. Courier Partners & Tracking
            </h2>
            <p>
              Orders are shipped via premier express logistics partners (Blue Dart, Delhivery, or Shiprocket Express). Upon dispatch, you will receive an SMS and email notification with an active tracking link.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-base text-charcoal font-semibold mb-1">
              4. Cash on Delivery (COD) Protocol
            </h2>
            <p>
              COD is available across most Indian postal codes with a nominal ₹99 handling fee. Please ensure the exact cash amount or UPI payment is available upon doorstep arrival of our courier partner.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
