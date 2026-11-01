import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Feather, ShieldCheck } from 'lucide-react';
import { Header } from '@/components/storefront/header';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { Footer } from '@/components/storefront/footer';
import { ProductCard } from '@/components/storefront/product-card';
import { getCategories, getFeaturedProducts, getBestSellers, getCollections } from '@/lib/services/catalogue';

export default async function HomePage() {
  const [categories, featuredProducts, bestSellers, collections] = await Promise.all([
    getCategories(),
    getFeaturedProducts(4),
    getBestSellers(4),
    getCollections(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <AnnouncementBar />
      <Header />

      <main className="flex-1">
        {/* Editorial Fashion Campaign Hero */}
        <section className="relative h-[85vh] min-h-[580px] w-full overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=85"
              alt="SHRÎ Atelier Autumn Nocturne Campaign"
              className="w-full h-full object-cover object-center filter brightness-[0.88]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/20 to-transparent" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-ivory space-y-6">
            <span className="text-xs uppercase tracking-[0.35em] text-ivory/80 font-medium inline-block bg-charcoal/30 backdrop-blur-xs px-4 py-1 border border-ivory/20">
              Limited Edition • Single-Brand Atelier
            </span>
            <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-normal leading-tight tracking-tight">
              Autumn Nocturne
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-ivory/90 font-light max-w-xl mx-auto leading-relaxed">
              A study in quiet luxury, architectural drapery, and pure artisanal silks designed for the modern connoisseur.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/shop"
                className="w-full sm:w-auto px-8 py-3.5 bg-ivory text-charcoal text-xs font-semibold uppercase tracking-widest hover:bg-gold hover:text-ivory transition-colors shadow-lg"
              >
                Explore Silhouettes
              </Link>
              <Link
                href="/about"
                className="w-full sm:w-auto px-8 py-3.5 bg-transparent border border-ivory text-ivory text-xs font-semibold uppercase tracking-widest hover:bg-ivory/15 transition-colors"
              >
                Our Studio Story
              </Link>
            </div>
          </div>
        </section>

        {/* Shop By Category */}
        {categories.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-[11px] uppercase tracking-[0.3em] text-gold font-medium block mb-2">
                Curated Wardrobe
              </span>
              <h2 className="font-serif text-3xl md:text-4xl text-charcoal font-normal">
                Shop by Silhouette
              </h2>
              <div className="w-12 h-px bg-gold mx-auto mt-4" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/shop?category=${category.slug}`}
                  className="group relative aspect-3/4 overflow-hidden bg-cream flex flex-col justify-end p-6"
                >
                  <img
                    src={category.image_url || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80'}
                    alt={category.name}
                    className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
                  <div className="relative z-10 text-ivory">
                    <h3 className="font-serif text-lg md:text-xl font-normal group-hover:text-gold transition-colors">
                      {category.name}
                    </h3>
                    <span className="text-[11px] uppercase tracking-wider text-ivory/70 flex items-center space-x-1 mt-1 group-hover:underline">
                      <span>Discover</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* New Arrivals Grid */}
        {featuredProducts.length > 0 && (
          <section className="bg-cream/40 py-20 border-y border-sand/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
                <div>
                  <span className="text-[11px] uppercase tracking-[0.3em] text-gold font-medium block mb-2">
                    Just In
                  </span>
                  <h2 className="font-serif text-3xl md:text-4xl text-charcoal font-normal">
                    New Season Arrivals
                  </h2>
                </div>
                <Link
                  href="/shop"
                  className="inline-flex items-center space-x-1 text-xs uppercase tracking-widest font-semibold text-charcoal hover:text-gold transition-colors mt-4 md:mt-0"
                >
                  <span>View Full Catalogue</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* The Mindful Atelier Philosophy */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 relative">
              <div className="aspect-4/5 overflow-hidden shadow-xl bg-cream">
                <img
                  src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80"
                  alt="Artisan examining mulberry silk drape"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 hidden sm:block bg-ivory p-6 border border-sand shadow-lg max-w-xs">
                <p className="font-serif italic text-charcoal text-sm leading-relaxed">
                  &ldquo;A garment should feel like a natural extension of one&rsquo;s quiet poise.&rdquo;
                </p>
                <span className="text-[10px] uppercase tracking-widest text-gold block mt-2 font-sans font-medium">
                  — Atelier Studio Note
                </span>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-6">
              <span className="text-[11px] uppercase tracking-[0.3em] text-gold font-medium block">
                The Single-Brand Promise
              </span>
              <h2 className="font-serif text-3xl md:text-5xl text-charcoal font-normal leading-tight">
                Pure Natural Fibers. Zero Deadstock.
              </h2>
              <p className="text-sm md:text-base text-charcoal-muted leading-relaxed font-light">
                Unlike mass-market multi-brand retailers, SHRÎ Atelier owns its design studio and fabric mills. Every bolt of Mulberry silk, Normandy linen, and handwoven Chanderi is inspected, pre-washed, and cut in micro-batches in our Bangalore studio.
              </p>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-sand">
                <div className="space-y-1">
                  <span className="font-serif text-2xl text-charcoal block">100%</span>
                  <span className="text-xs uppercase tracking-wider text-charcoal-muted font-medium">
                    Pure Natural Textiles
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="font-serif text-2xl text-charcoal block">In-House</span>
                  <span className="text-xs uppercase tracking-wider text-charcoal-muted font-medium">
                    Own Inventory & Atelier
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-block px-7 py-3 bg-charcoal text-ivory text-xs uppercase tracking-widest font-semibold hover:bg-gold transition-colors"
                >
                  Read Our Craft Story
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Best Sellers */}
        {bestSellers.length > 0 && (
          <section className="bg-cream/40 py-20 border-t border-sand/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-xl mx-auto mb-12">
                <span className="text-[11px] uppercase tracking-[0.3em] text-gold font-medium block mb-2">
                  Most Cherished
                </span>
                <h2 className="font-serif text-3xl md:text-4xl text-charcoal font-normal">
                  Signature Best Sellers
                </h2>
                <p className="text-xs text-charcoal-muted mt-2">
                  Based on our actual atelier order data and discerning clientele favorites.
                </p>
                <div className="w-12 h-px bg-gold mx-auto mt-4" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {bestSellers.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Featured Editorial Collections Showcase */}
        {collections.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {collections.map((col) => (
                <div key={col.id} className="relative aspect-4/3 overflow-hidden bg-cream group">
                  <img
                    src={col.banner_image || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80'}
                    alt={col.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-charcoal/40 group-hover:bg-charcoal/50 transition-colors" />
                  <div className="absolute inset-0 p-8 flex flex-col justify-end text-ivory space-y-2">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-medium">
                      Capsule Collection
                    </span>
                    <h3 className="font-serif text-2xl md:text-3xl font-normal">{col.name}</h3>
                    <p className="text-xs text-ivory/80 line-clamp-2 max-w-md font-light">
                      {col.description}
                    </p>
                    <div className="pt-2">
                      <Link
                        href={`/collections/${col.slug}`}
                        className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest font-semibold text-ivory group-hover:text-gold transition-colors"
                      >
                        <span>Explore Collection</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
