'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Trash2, Loader2 } from 'lucide-react';
import { useWishlist } from '@/lib/context/wishlist-context';
import { useCart } from '@/lib/context/cart-context';
import { createClient } from '@/lib/supabase/client';
import { Product } from '@/lib/types/database';
import { formatPaise } from '@/lib/utils/format';

export default function WishlistPage() {
  const { wishlistIds, toggleWishlist } = useWishlist();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadWishlistProducts() {
      if (wishlistIds.length === 0) {
        setProducts([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(*),
            images:product_images(*),
            variants:product_variants(*)
          `)
          .in('id', wishlistIds);

        setProducts((data as Product[]) || []);
      } catch {
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadWishlistProducts();
  }, [wishlistIds]);

  const handleMoveToBag = (product: Product) => {
    const firstVariant = product.variants?.[0];
    if (!firstVariant) return;

    addItem({
      variantId: firstVariant.id,
      productId: product.id,
      name: product.name,
      image: product.images?.[0]?.storage_path || '',
      size: firstVariant.size,
      color: firstVariant.color_name,
      pricePaise: firstVariant.price_paise,
      compareAtPricePaise: firstVariant.compare_at_price_paise,
      quantity: 1,
      maxStock: firstVariant.stock_quantity,
    });
    toggleWishlist(product.id);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-sand pb-4 flex justify-between items-center">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-gold font-semibold block">
            Private Curation
          </span>
          <h1 className="font-serif text-2xl md:text-3xl text-charcoal font-normal">
            My Wishlist
          </h1>
        </div>
        <span className="text-xs text-charcoal-muted font-medium">
          {products.length} {products.length === 1 ? 'Silhouette' : 'Silhouettes'}
        </span>
      </div>

      {isLoading ? (
        <div className="py-20 text-center flex flex-col items-center space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-gold" />
          <span className="text-xs text-charcoal-muted">Loading your curated pieces...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <Heart className="w-12 h-12 text-sand mx-auto stroke-1" />
          <h3 className="font-serif text-lg text-charcoal">Your Wishlist is Empty</h3>
          <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
            Click the heart icon on any silhouette to bookmark it for private viewing or future acquisition.
          </p>
          <div className="pt-2">
            <Link
              href="/shop"
              className="px-6 py-2.5 bg-charcoal text-ivory text-xs uppercase tracking-widest inline-block"
            >
              Discover Silhouettes
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const minPrice = Math.min(...(product.variants?.map((v) => v.price_paise) || [0]));
            const img = product.images?.[0]?.storage_path || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80';

            return (
              <div
                key={product.id}
                className="bg-cream/30 border border-sand/60 p-4 space-y-3 group relative flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="relative aspect-3/4 overflow-hidden bg-sand/30">
                    <Image
                      src={img}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="absolute top-2 right-2 p-1.5 bg-ivory/80 hover:bg-ivory text-error transition-colors"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gold font-medium block">
                      {product.category?.name || 'Silhouette'}
                    </span>
                    <Link
                      href={`/products/${product.slug}`}
                      className="font-serif text-sm text-charcoal hover:text-gold transition-colors block font-medium"
                    >
                      {product.name}
                    </Link>
                    <span className="text-xs font-semibold text-charcoal block mt-1">
                      {formatPaise(minPrice)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleMoveToBag(product)}
                  className="w-full py-2 bg-charcoal text-ivory text-xs uppercase tracking-widest font-semibold hover:bg-gold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Move to Bag</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
