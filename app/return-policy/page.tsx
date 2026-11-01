import React from 'react';
import { Header } from '@/components/storefront/header';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { Footer } from '@/components/storefront/footer';

export const metadata = {
  title: 'Returns & Exchange Policy | SHRÎ Atelier',
};

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-16 md:py-20 space-y-8">
        <div className="border-b border-sand pb-4">
          <span className="text-xs uppercase tracking-[0.3em] text-gold font-medium block">
            Client Peace of Mind
          </span>
          <h1 className="font-serif text-3xl md:text-4xl text-charcoal font-normal">
            Returns & Exchanges Policy
          </h1>
        </div>

        <div className="text-xs text-charcoal-muted leading-relaxed font-light space-y-6">
          <div>
            <h2 className="font-serif text-base text-charcoal font-semibold mb-1">
              1. 7-Day Doorstep Return & Exchange Window
            </h2>
            <p>
              We want you to feel sublime in every SHRÎ Atelier silhouette. If the size or fit does not meet your expectations, you may initiate a return or exchange request within 7 calendar days of delivery.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-base text-charcoal font-semibold mb-1">
              2. Garment Condition Criteria
            </h2>
            <p>
              To qualify for return approval and restock, all items must be in their original unwashed, unworn condition with all atelier swing tags intact and returned in their cloth garment bag.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-base text-charcoal font-semibold mb-1">
              3. Refund Processing
            </h2>
            <p>
              Once your returned garment is received and passed through studio inspection:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li><strong>Prepaid Online Orders:</strong> Refunds are credited directly back to the original payment source via Razorpay within 3–5 business days.</li>
              <li><strong>COD Orders:</strong> Refunds are transferred directly to your verified bank account via NEFT/UPI after confirmation.</li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
