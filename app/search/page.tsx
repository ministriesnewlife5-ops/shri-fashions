import React from 'react';
import Link from 'next/link';
import { Search as SearchIcon, ArrowRight } from 'lucide-react';
import { Header } from '@/components/storefront/header';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { Footer } from '@/components/storefront/footer';
import { ProductCard } from '@/components/storefront/product-card';
import { getProducts } from '@/lib/services/catalogue';

export const metadata = {
  title: 'Search Silhouettes | SHRÎ Atelier',
  description: 'Search our handcrafted collections of dresses, co-ords, and kurtas.',
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; query?: string }>;
}) {
  const resolved = await searchParams;
  const query = resolved.q || resolved.query || '';

  const products = await getProducts({
    search: query,
  });

  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="max-w-2xl mx-auto text-center space-y-4 mb-12">
          <span className="text-[11px] uppercase tracking-[0.3em] text-gold font-medium block">
            Catalogue Search
          </span>
          <h1 className="font-serif text-3xl md:text-4xl text-charcoal font-normal">
            {query ? `Search: “${query}”` : 'Search the Atelier'}
          </h1>

          <form action="/search" method="GET" className="pt-2">
            <div className="relative max-w-md mx-auto">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search silk, linen, maxi, tunics..."
                className="w-full bg-cream/70 border border-sand px-4 py-3 text-xs text-charcoal placeholder:text-charcoal-muted focus:outline-hidden focus:border-charcoal pr-10"
              />
              <button
                type="submit"
                className="absolute right-3 top-3 text-charcoal-muted hover:text-charcoal"
                aria-label="Search"
              >
                <SearchIcon className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {query && (
          <div className="mb-6 flex justify-between items-center border-b border-sand pb-4">
            <span className="text-xs uppercase tracking-wider text-charcoal-muted font-medium">
              Found {products.length} {products.length === 1 ? 'silhouette' : 'silhouettes'}
            </span>
            <Link href="/shop" className="text-xs text-gold hover:underline">
              View all pieces
            </Link>
          </div>
        )}

        {products.length === 0 ? (
          <div className="py-20 text-center space-y-4 max-w-md mx-auto bg-cream/30 border border-sand/40 p-8">
            <p className="font-serif text-xl text-charcoal">No pieces matched your inquiry</p>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              We couldn&apos;t find any garments matching &ldquo;{query}&rdquo;. Browse our curated categories or explore our popular collections.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-2">
              <Link
                href="/shop?category=dresses"
                className="px-3 py-1.5 border border-sand text-xs text-charcoal hover:border-charcoal"
              >
                Sculptural Dresses
              </Link>
              <Link
                href="/shop?category=co-ords"
                className="px-3 py-1.5 border border-sand text-xs text-charcoal hover:border-charcoal"
              >
                Linen Co-ords
              </Link>
              <Link
                href="/shop?category=tunics-kurtas"
                className="px-3 py-1.5 border border-sand text-xs text-charcoal hover:border-charcoal"
              >
                Silk Tunics
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
