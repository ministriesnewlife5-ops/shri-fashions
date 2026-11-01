import React from 'react';
import { Header } from '@/components/storefront/header';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { Footer } from '@/components/storefront/footer';

export const metadata = {
  title: 'Privacy Policy | SHRÎ Atelier',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-16 md:py-20 space-y-8">
        <div className="border-b border-sand pb-4">
          <span className="text-xs uppercase tracking-[0.3em] text-gold font-medium block">
            Client Confidentiality
          </span>
          <h1 className="font-serif text-3xl md:text-4xl text-charcoal font-normal">
            Privacy Policy
          </h1>
        </div>

        <div className="text-xs text-charcoal-muted leading-relaxed font-light space-y-6">
          <p>
            SHRÎ Atelier Pvt. Ltd. (&ldquo;we&rdquo;, &ldquo;our&rdquo;) is committed to honoring the confidentiality of our clients. We do not sell, rent, or trade customer contact details with third-party advertisers.
          </p>

          <div>
            <h2 className="font-serif text-base text-charcoal font-semibold mb-1">
              Information We Collect
            </h2>
            <p>
              When you purchase a garment or create an atelier profile, we collect your name, shipping address, contact phone, and email address solely for fulfillment, delivery status notifications, and customer service.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-base text-charcoal font-semibold mb-1">
              Payment Security
            </h2>
            <p>
              We do not store your credit card numbers, CVVs, or bank login credentials on our servers. All online transactions are processed through Razorpay using PCI-DSS compliant 256-bit SSL encryption.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
