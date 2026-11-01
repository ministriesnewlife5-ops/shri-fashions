'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Product } from '@/lib/types/database';
import { formatPaise, calculateDiscountPercentage } from '@/lib/utils/format';
import { useWishlist } from '@/lib/context/wishlist-context';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);

  const images = product.images || [];
  const primaryImage = images[0]?.storage_path || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=80';
  const secondaryImage = images[1]?.storage_path || primaryImage;

  // Active variants
  const variants = product.variants?.filter((v) => v.is_active) || [];
  const minPrice = variants.length > 0 ? Math.min(...variants.map((v) => v.price_paise)) : 0;
  const compareAtPrice = variants[0]?.compare_at_price_paise;
  const discount = calculateDiscountPercentage(minPrice, compareAtPrice);

  // Available unique sizes and colors
  const sizes = Array.from(new Set(variants.map((v) => v.size)));
  const colors = Array.from(
    new Map(variants.map((v) => [v.color_name, v.color_hex || '#000000'])).entries()
  );

  const totalStock = variants.reduce((sum, v) => sum + v.stock_quantity, 0);
  const isWishlisted = isInWishlist(product.id);

  return (
    <div
      className="group flex flex-col h-full relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container with 3:4 Aspect Ratio */}
      <div className="relative aspect-3/4 w-full overflow-hidden bg-cream mb-4">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <img
            src={isHovered && images.length > 1 ? secondaryImage : primaryImage}
            alt={images[0]?.alt_text || product.name}
            className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Wishlist button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-ivory/80 backdrop-blur-xs text-charcoal hover:text-gold transition-colors shadow-xs z-10"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`w-4 h-4 ${isWishlisted ? 'fill-gold text-gold' : 'text-charcoal'}`}
          />
        </button>

        {/* Badges: Discount or Low Stock */}
        <div className="absolute top-3 left-3 flex flex-col space-y-1.5 z-10 pointer-events-none">
          {discount > 0 && (
            <span className="bg-charcoal text-ivory text-[10px] font-medium uppercase tracking-wider px-2 py-0.5">
              -{discount}%
            </span>
          )}
          {totalStock > 0 && totalStock <= 5 && (
            <span className="bg-terracotta text-ivory text-[10px] font-medium tracking-wider px-2 py-0.5">
              Only {totalStock} Left
            </span>
          )}
          {totalStock === 0 && (
            <span className="bg-sand text-charcoal text-[10px] font-medium tracking-wider px-2 py-0.5">
              Sold Out
            </span>
          )}
        </div>

        {/* Quick view / hover action bar */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-charcoal/40 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-center">
          <Link
            href={`/products/${product.slug}`}
            className="w-full py-2 bg-ivory text-charcoal text-[11px] font-medium uppercase tracking-widest text-center hover:bg-gold hover:text-ivory transition-colors shadow-md"
          >
            Select Size & Bag
          </Link>
        </div>
      </div>

      {/* Product Information */}
      <div className="flex-1 flex flex-col">
        {/* Category & Color swatches */}
        <div className="flex items-center justify-between text-[11px] text-charcoal-muted mb-1">
          <span className="uppercase tracking-widest">{product.category?.name || 'Collection'}</span>
          <div className="flex items-center space-x-1">
            {colors.map(([name, hex]) => (
              <span
                key={name}
                title={name}
                className="w-2.5 h-2.5 rounded-full border border-sand"
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>
        </div>

        {/* Name */}
        <h3 className="font-serif text-base text-charcoal font-medium leading-snug line-clamp-1 mb-1.5 group-hover:text-gold transition-colors">
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h3>

        {/* Price & Compare price */}
        <div className="flex items-center space-x-2 mt-auto">
          <span className="text-sm font-semibold text-charcoal">{formatPaise(minPrice)}</span>
          {compareAtPrice && compareAtPrice > minPrice && (
            <span className="text-xs text-charcoal-muted line-through">
              {formatPaise(compareAtPrice)}
            </span>
          )}
        </div>

        {/* Available sizes */}
        <div className="flex items-center space-x-1.5 mt-2 text-[10px] text-charcoal-muted">
          <span>Sizes:</span>
          {sizes.map((s) => (
            <span key={s} className="px-1 border border-sand/60">
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
