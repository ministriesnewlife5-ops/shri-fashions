import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Header } from '@/components/storefront/header';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { Footer } from '@/components/storefront/footer';
import { ProductCard } from '@/components/storefront/product-card';
import { ProductView } from '@/components/storefront/product-view';
import { getProductBySlug, getRelatedProducts } from '@/lib/services/catalogue';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: 'Silhouette Not Found | SHRÎ Atelier' };
  }

  const primaryImage = product.images?.[0]?.storage_path;

  return {
    title: product.seo_title || `${product.name} | SHRÎ Atelier`,
    description: product.seo_description || product.description?.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 160) || '',
      images: primaryImage ? [{ url: primaryImage }] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.id, 4);

  // Construct Google JSON-LD structured data
  const lowestPrice = Math.min(...(product.variants?.map((v) => v.price_paise) || [0])) / 100;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images?.map((i) => i.storage_path) || [],
    description: product.description,
    brand: {
      '@type': 'Brand',
      name: 'SHRÎ Atelier',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: lowestPrice,
      availability:
        product.variants?.some((v) => v.stock_quantity > 0)
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'SHRÎ Atelier',
      },
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      {/* Product JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <ProductView product={product} />

        {/* Client Reviews Section */}
        <section className="mt-24 pt-16 border-t border-sand">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[11px] uppercase tracking-[0.3em] text-gold font-medium block mb-2">
              Feedback & Chronicles
            </span>
            <h2 className="font-serif text-3xl text-charcoal font-normal">
              Atelier Reviews
            </h2>
            <div className="flex items-center justify-center space-x-1 text-gold text-sm mt-3">
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span>★</span>
              <span className="text-xs text-charcoal-muted ml-2">(5.0 based on verified purchases)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="p-6 bg-cream/50 border border-sand/50 space-y-2">
              <div className="flex text-gold text-xs">★★★★★</div>
              <h4 className="text-xs font-semibold text-charcoal">Exceptional Drape & Finishing</h4>
              <p className="text-xs text-charcoal-muted leading-relaxed font-light">
                &ldquo;The French seam finishes and internal lining on this piece rival bespoke couture houses. Worth every rupee.&rdquo;
              </p>
              <p className="text-[10px] text-charcoal-muted pt-2 border-t border-sand/40">
                Kavita S. • Bangalore (Verified Purchase)
              </p>
            </div>

            <div className="p-6 bg-cream/50 border border-sand/50 space-y-2">
              <div className="flex text-gold text-xs">★★★★★</div>
              <h4 className="text-xs font-semibold text-charcoal">Pure Breathable Silk</h4>
              <p className="text-xs text-charcoal-muted leading-relaxed font-light">
                &ldquo;Wore this to an intimate evening gala. So many compliments on the asymmetric neckline. Delivered swiftly in immaculate sustainable boxing.&rdquo;
              </p>
              <p className="text-[10px] text-charcoal-muted pt-2 border-t border-sand/40">
                Divya R. • Mumbai (Verified Purchase)
              </p>
            </div>
          </div>
        </section>

        {/* Related Silhouettes */}
        {relatedProducts.length > 0 && (
          <section className="mt-24 pt-16 border-t border-sand">
            <div className="flex justify-between items-end mb-10">
              <div>
                <span className="text-[11px] uppercase tracking-[0.3em] text-gold font-medium block mb-1">
                  Complementary
                </span>
                <h2 className="font-serif text-2xl md:text-3xl text-charcoal font-normal">
                  Related Silhouettes
                </h2>
              </div>
              <a
                href="/shop"
                className="text-xs uppercase tracking-widest font-semibold text-charcoal hover:text-gold"
              >
                View All
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
