import React from 'react';
import { Header } from '@/components/storefront/header';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { Footer } from '@/components/storefront/footer';

export const metadata = {
  title: 'Our Story & Philosophy | SHRÎ Atelier',
  description: 'The philosophy of SHRÎ Atelier: architectural drapery, natural fibers, and zero deadstock.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-16 md:py-24 space-y-12">
        <div className="text-center space-y-4">
          <span className="text-xs uppercase tracking-[0.3em] text-gold font-medium block">
            Our Atelier Philosophy
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-charcoal font-normal leading-tight">
            Quiet Luxury, Mindfully Tailored
          </h1>
          <div className="w-16 h-px bg-gold mx-auto mt-6" />
        </div>

        <div className="aspect-16/9 bg-cream overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=80"
            alt="Handcrafting pure linen and silk"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="prose prose-sm max-w-none text-charcoal-muted leading-relaxed font-light space-y-6">
          <p className="text-base text-charcoal font-serif italic">
            &ldquo;We founded SHRÎ Atelier on a singular belief: clothing should be an intimate sanctuary of breath, texture, and understated elegance.&rdquo;
          </p>

          <p>
            Unlike mass-production multi-brand apparel platforms, SHRÎ Atelier operates as a dedicated single-brand fashion house. Every garment in our collection is conceived in our Bangalore design studio, pattern-cut by master tailors, and fabricated in limited, non-wasteful batch runs.
          </p>

          <h2 className="font-serif text-2xl text-charcoal font-normal pt-4">
            The Purity of Natural Textiles
          </h2>
          <p>
            We strictly refuse synthetic polyester blends that degrade quickly and trap heat. Instead, our textile library consists exclusively of:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Mulberry Silk:</strong> Spun for a soft fluid drape that glides effortlessly against the skin.</li>
            <li><strong>Normandy Flax Linen:</strong> Certified European flax that softens with every gentle wash cycle.</li>
            <li><strong>Handloom Chanderi:</strong> Woven by generational artisan clusters, blending fine cotton warp with silk weft and subtle metallic zari accents.</li>
          </ul>

          <h2 className="font-serif text-2xl text-charcoal font-normal pt-4">
            Zero Deadstock Initiative
          </h2>
          <p>
            Fast fashion produces billions of unsold garments destined for landfills. At SHRÎ Atelier, we manufacture our own in-house inventory in controlled small batches. When a silhouette sells out, we re-weave only upon measured demand, preserving the dignity of textile crafts and protecting our ecosystem.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
