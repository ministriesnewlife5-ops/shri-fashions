import React, { Suspense } from 'react';
import { Header } from '@/components/storefront/header';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { Footer } from '@/components/storefront/footer';
import { ProductCard } from '@/components/storefront/product-card';
import { ShopFilters, ShopSidebar } from '@/components/storefront/shop-filters';
import { getCategories, getProducts } from '@/lib/services/catalogue';

export const metadata = {
  title: 'All Silhouettes | SHRÎ Atelier',
  description: 'Explore the complete collection of handcrafted dresses, silk co-ords, and artisanal kurtas.',
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const categories = await getCategories();

  const products = await getProducts({
    category: resolvedParams.category,
    size: resolvedParams.size,
    color: resolvedParams.color,
    inStockOnly: resolvedParams.inStock === 'true',
    sort: resolvedParams.sort as any,
    search: resolvedParams.search,
  });

  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        {/* Editorial Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <span className="text-[11px] uppercase tracking-[0.3em] text-gold font-medium block">
            Atelier Wardrobe
          </span>
          <h1 className="font-serif text-3xl md:text-5xl text-charcoal font-normal">
            The Complete Collection
          </h1>
          <p className="text-xs md:text-sm text-charcoal-muted font-light leading-relaxed">
            Pure natural silks, Normandy linens, and artisan-spun cottons, meticulously crafted for mindful elegance.
          </p>
        </div>

        <Suspense fallback={<div className="py-12 text-center text-xs">Loading collection...</div>}>
          <ShopFilters categories={categories} totalCount={products.length} />

          <div className="flex pt-6">
            <ShopSidebar categories={categories} />

            <div className="flex-1">
              {products.length === 0 ? (
                <div className="py-24 text-center space-y-4 bg-cream/30 border border-sand/40">
                  <p className="font-serif text-xl text-charcoal">No silhouettes match your selected filters</p>
                  <p className="text-xs text-charcoal-muted max-w-md mx-auto">
                    Try adjusting your size, category, or color selections, or clear all filters to view our full seasonal catalogue.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
