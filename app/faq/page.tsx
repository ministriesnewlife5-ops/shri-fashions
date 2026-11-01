import React from 'react';
import { Header } from '@/components/storefront/header';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { Footer } from '@/components/storefront/footer';

export const metadata = {
  title: 'Frequently Asked Questions | SHRÎ Atelier',
};

export default function FAQPage() {
  const faqs = [
    {
      q: 'How do I choose my ideal size in SHRÎ Atelier garments?',
      a: 'Our silhouettes are tailored with fluid, architectural drapery. We recommend consulting our Size Guide located on every product page. If you fall between sizes, our concierge team is on hand via WhatsApp to assist with exact measurement comparisons.',
    },
    {
      q: 'Are your fabrics 100% pure natural fibers?',
      a: 'Yes. We work exclusively with pure Mulberry silks, certified Normandy flax linen, and organic handloom cottons. We do not use synthetic polyester linings.',
    },
    {
      q: 'Do you offer Cash on Delivery (COD)?',
      a: 'Yes, Cash on Delivery is supported for all serviceable Indian pincodes with a nominal ₹99 handling charge. You can pay via cash or UPI to the courier upon arrival.',
    },
    {
      q: 'How long does delivery take?',
      a: 'In-stock pieces are dispatched within 24 to 48 hours from our Bangalore atelier. Delivery typically takes 2 to 4 business days depending on your destination city.',
    },
    {
      q: 'What is your return and exchange policy?',
      a: 'We offer complimentary 7-day reverse doorstep pickup for unworn garments with original tags intact. You can request a size exchange or full refund.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-16 md:py-20 space-y-8">
        <div className="border-b border-sand pb-4">
          <span className="text-xs uppercase tracking-[0.3em] text-gold font-medium block">
            Client Assistance
          </span>
          <h1 className="font-serif text-3xl md:text-4xl text-charcoal font-normal">
            Frequently Asked Questions
          </h1>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className="p-6 bg-cream/40 border border-sand/60 space-y-2">
              <h3 className="font-serif text-base text-charcoal font-medium">
                {faq.q}
              </h3>
              <p className="text-xs text-charcoal-muted leading-relaxed font-light">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
