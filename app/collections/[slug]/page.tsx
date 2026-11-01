import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Header } from '@/components/storefront/header';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { Footer } from '@/components/storefront/footer';
import { ProductCard } from '@/components/storefront/product-card';
import { getCollectionBySlug } from '@/lib/services/catalogue';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    return { title: 'Collection Not Found | SHRÎ Atelier' };
  }

  return {
    title: `${collection.name} | SHRÎ Atelier`,
    description: collection.description || `Explore ${collection.name} at SHRÎ Atelier.`,
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <AnnouncementBar />
      <Header />

      <main className="flex-1">
        {/* Collection Hero Banner */}
        <section className="relative h-[55vh] min-h-[380px] w-full overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <img
              src={collection.banner_image || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80'}
              alt={collection.name}
              className="w-full h-full object-cover object-center filter brightness-[0.85]"
            />
            <div className="absolute inset-0 bg-charcoal/40" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto px-4 text-center text-ivory space-y-4">
            <span className="text-xs uppercase tracking-[0.3em] text-gold font-medium">
              Capsule Collection
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal">
              {collection.name}
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-ivory/90 font-light max-w-xl mx-auto leading-relaxed">
              {collection.description}
            </p>
          </div>
        </section>

        {/* Collection Products Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex justify-between items-center mb-8 border-b border-sand pb-4">
            <span className="text-xs uppercase tracking-widest text-charcoal-muted">
              {collection.products?.length || 0} Limited Editions
            </span>
            <span className="text-xs uppercase tracking-widest text-charcoal-muted">
              Hand-spun Textiles
            </span>
          </div>

          {collection.products && collection.products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {collection.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-3 bg-cream/30 border border-sand/40">
              <h3 className="font-serif text-lg text-charcoal">Silhouettes in Preparation</h3>
              <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
                Our atelier is currently hand-tailoring upcoming pieces for this capsule collection. Check back shortly.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
