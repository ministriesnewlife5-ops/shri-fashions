'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Heart,
  ShoppingBag,
  Check,
  Truck,
  RefreshCw,
  Ruler,
  ShieldCheck,
  Star,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Product, ProductVariant } from '@/lib/types/database';
import { formatPaise, calculateDiscountPercentage } from '@/lib/utils/format';
import { useCart } from '@/lib/context/cart-context';
import { useWishlist } from '@/lib/context/wishlist-context';

interface ProductViewProps {
  product: Product;
}

export function ProductView({ product }: ProductViewProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const variants = product.variants?.filter((v) => v.is_active) || [];
  const images = product.images || [];

  // Group unique sizes and colors
  const sizes = Array.from(new Set(variants.map((v) => v.size)));
  const colors = Array.from(
    new Map(variants.map((v) => [v.color_name, { hex: v.color_hex || '#000000', name: v.color_name }])).values()
  );

  // Selected state
  const [selectedColor, setSelectedColor] = useState<string>(
    variants[0]?.color_name || ''
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    variants[0]?.size || ''
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'fabric' | 'care' | 'shipping'>('details');
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  // Find exact matching variant
  const selectedVariant = variants.find(
    (v) => v.color_name === selectedColor && v.size === selectedSize
  ) || variants[0];

  const currentPrice = selectedVariant?.price_paise || 0;
  const compareAtPrice = selectedVariant?.compare_at_price_paise;
  const discount = calculateDiscountPercentage(currentPrice, compareAtPrice);
  const isOutOfStock = !selectedVariant || selectedVariant.stock_quantity <= 0;
  const isLowStock = selectedVariant && selectedVariant.stock_quantity > 0 && selectedVariant.stock_quantity <= 5;

  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (!selectedVariant || isOutOfStock) return;

    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      name: product.name,
      image: images[selectedImageIndex]?.storage_path || images[0]?.storage_path || '',
      size: selectedVariant.size,
      color: selectedVariant.color_name,
      pricePaise: selectedVariant.price_paise,
      compareAtPricePaise: selectedVariant.compare_at_price_paise,
      quantity,
      maxStock: selectedVariant.stock_quantity,
    });

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  return (
    <div className="space-y-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-charcoal-muted uppercase tracking-wider">
        <a href="/" className="hover:text-charcoal transition-colors">Home</a>
        <ChevronRight className="w-3 h-3" />
        <a href="/shop" className="hover:text-charcoal transition-colors">Shop</a>
        <ChevronRight className="w-3 h-3" />
        {product.category && (
          <>
            <a
              href={`/shop?category=${product.category.slug}`}
              className="hover:text-charcoal transition-colors"
            >
              {product.category.name}
            </a>
            <ChevronRight className="w-3 h-3" />
          </>
        )}
        <span className="text-charcoal font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Left: Product Images Gallery */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
          {/* Thumbnail column */}
          <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto shrink-0 py-1">
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setSelectedImageIndex(idx)}
                className={`relative w-16 h-22 sm:w-20 sm:h-26 overflow-hidden border-2 transition-all shrink-0 ${
                  selectedImageIndex === idx ? 'border-charcoal' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={img.storage_path}
                  alt={img.alt_text || product.name}
                  className="w-full h-full object-cover object-top"
                />
              </button>
            ))}
          </div>

          {/* Main Selected Image */}
          <div className="relative flex-1 aspect-3/4 bg-cream overflow-hidden group">
            <img
              src={images[selectedImageIndex]?.storage_path || images[0]?.storage_path}
              alt={images[selectedImageIndex]?.alt_text || product.name}
              className="w-full h-full object-cover object-top cursor-zoom-in group-hover:scale-105 transition-transform duration-500"
            />
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-charcoal text-ivory text-xs font-semibold uppercase tracking-wider px-2.5 py-1">
                Save {discount}%
              </span>
            )}
          </div>
        </div>

        {/* Right: Product Purchase Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-gold font-medium block mb-1">
              {product.category?.name || 'Exclusive Silhouette'}
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-charcoal font-normal leading-tight">
              {product.name}
            </h1>
            <p className="text-xs text-charcoal-muted mt-1">
              SKU: <span className="font-mono text-charcoal">{selectedVariant?.sku || 'SHR-001'}</span>
            </p>
          </div>

          {/* Price display */}
          <div className="flex items-baseline space-x-3 pt-2 border-t border-sand">
            <span className="font-serif text-2xl md:text-3xl font-semibold text-charcoal">
              {formatPaise(currentPrice)}
            </span>
            {compareAtPrice && compareAtPrice > currentPrice && (
              <span className="text-base text-charcoal-muted line-through">
                {formatPaise(compareAtPrice)}
              </span>
            )}
            <span className="text-xs text-charcoal-muted font-light">
              Inclusive of all taxes (GST 5%)
            </span>
          </div>

          {/* Color Selector */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-charcoal uppercase tracking-wider font-medium">
                Color: <span className="font-normal text-charcoal-muted">{selectedColor}</span>
              </span>
            </div>
            <div className="flex items-center space-x-3">
              {colors.map((c) => {
                const isSelected = selectedColor === c.name;
                return (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    className={`relative w-8 h-8 rounded-full border transition-all ${
                      isSelected ? 'ring-2 ring-gold ring-offset-2 scale-110' : 'border-sand hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  >
                    {isSelected && (
                      <Check
                        className={`w-4 h-4 mx-auto ${c.hex === '#FDFBF7' ? 'text-charcoal' : 'text-ivory'}`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Selector */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-charcoal uppercase tracking-wider font-medium">
                Select Size
              </span>
              <button
                onClick={() => setIsSizeChartOpen(true)}
                className="text-gold hover:underline flex items-center space-x-1"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Size Guide</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {sizes.map((s) => {
                const variantForSize = variants.find(
                  (v) => v.color_name === selectedColor && v.size === s
                );
                const hasStock = variantForSize && variantForSize.stock_quantity > 0;
                const isSelected = selectedSize === s;

                return (
                  <button
                    key={s}
                    disabled={!hasStock}
                    onClick={() => setSelectedSize(s)}
                    className={`w-12 h-12 text-xs uppercase tracking-wider border transition-all relative ${
                      isSelected
                        ? 'bg-charcoal text-ivory border-charcoal font-semibold'
                        : hasStock
                        ? 'border-sand text-charcoal hover:border-charcoal'
                        : 'border-sand/40 text-charcoal-muted/40 cursor-not-allowed line-through'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stock availability indication */}
          <div className="text-xs pt-1">
            {isOutOfStock ? (
              <p className="text-error font-medium">Currently out of stock in this size & color</p>
            ) : isLowStock ? (
              <p className="text-terracotta font-medium flex items-center space-x-1">
                <span>• Only {selectedVariant.stock_quantity} pieces remaining in atelier inventory</span>
              </p>
            ) : (
              <p className="text-success font-medium flex items-center space-x-1">
                <span>✓ Ready to ship from Bangalore studio</span>
              </p>
            )}
          </div>

          {/* Quantity selector & CTA buttons */}
          <div className="space-y-3 pt-4 border-t border-sand">
            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-sand">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-charcoal hover:bg-cream transition-colors text-sm"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="px-4 text-xs font-semibold">{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(quantity + 1, selectedVariant?.stock_quantity || 1))
                  }
                  disabled={quantity >= (selectedVariant?.stock_quantity || 1)}
                  className="px-3 py-2 text-charcoal hover:bg-cream transition-colors text-sm disabled:opacity-30"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Add to Bag */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 py-3.5 bg-charcoal text-ivory text-xs uppercase tracking-widest font-semibold hover:bg-gold transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? 'Sold Out' : 'Add to Shopping Bag'}</span>
              </button>

              {/* Wishlist toggle */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3.5 border border-sand transition-colors ${
                  isWishlisted ? 'text-gold border-gold' : 'text-charcoal hover:text-gold'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-gold' : ''}`} />
              </button>
            </div>

            {/* Buy Now Direct Button */}
            {!isOutOfStock && (
              <button
                onClick={handleBuyNow}
                className="w-full py-3.5 bg-gold text-charcoal text-xs uppercase tracking-widest font-semibold hover:bg-gold-hover transition-colors shadow-sm"
              >
                Buy Now — Instant Checkout
              </button>
            )}
          </div>

          {/* Toast Notification */}
          {addedToast && (
            <div className="p-3 bg-cream border border-gold/40 text-xs text-charcoal flex items-center justify-between">
              <span>Added to your bag with size {selectedSize}.</span>
              <a href="/cart" className="text-gold font-semibold underline ml-2">
                View Bag
              </a>
            </div>
          )}

          {/* Atelier Trust Badges */}
          <div className="grid grid-cols-2 gap-4 py-4 border-t border-sand text-xs text-charcoal-muted">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-gold shrink-0" />
              <span>Complimentary courier over ₹2,500</span>
            </div>
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 text-gold shrink-0" />
              <span>7-Day Doorstep Returns</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-gold shrink-0" />
              <span>Cash on Delivery Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-gold shrink-0" />
              <span>Made in Bangalore Atelier</span>
            </div>
          </div>

          {/* Tabbed Specifications */}
          <div className="pt-4 border-t border-sand">
            <div className="flex border-b border-sand text-xs uppercase tracking-wider">
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-2.5 mr-6 font-medium transition-colors ${
                  activeTab === 'details' ? 'border-b-2 border-charcoal text-charcoal' : 'text-charcoal-muted'
                }`}
              >
                Silhouettes & Fit
              </button>
              <button
                onClick={() => setActiveTab('fabric')}
                className={`pb-2.5 mr-6 font-medium transition-colors ${
                  activeTab === 'fabric' ? 'border-b-2 border-charcoal text-charcoal' : 'text-charcoal-muted'
                }`}
              >
                Textile Story
              </button>
              <button
                onClick={() => setActiveTab('care')}
                className={`pb-2.5 mr-6 font-medium transition-colors ${
                  activeTab === 'care' ? 'border-b-2 border-charcoal text-charcoal' : 'text-charcoal-muted'
                }`}
              >
                Care Guide
              </button>
            </div>

            <div className="py-4 text-xs text-charcoal-muted leading-relaxed font-light">
              {activeTab === 'details' && (
                <div className="space-y-2">
                  <p>{product.description}</p>
                  <p className="font-medium text-charcoal pt-1">
                    Fit: <span className="font-normal text-charcoal-muted">{product.fit || 'True to size with fluid drape.'}</span>
                  </p>
                </div>
              )}
              {activeTab === 'fabric' && (
                <div>
                  <p className="font-semibold text-charcoal mb-1">Fabric Composition:</p>
                  <p>{product.fabric || '100% Pure artisanal natural fibers.'}</p>
                </div>
              )}
              {activeTab === 'care' && (
                <div>
                  <p className="font-semibold text-charcoal mb-1">Garment Longevity Instructions:</p>
                  <p>{product.care_instructions || 'Professional dry clean only. Store in a breathable cotton garment bag.'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Size Chart Modal */}
      {isSizeChartOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-charcoal/60 backdrop-blur-xs"
            onClick={() => setIsSizeChartOpen(false)}
          />
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-ivory max-w-xl w-full p-8 shadow-2xl border border-sand space-y-6">
              <div className="flex justify-between items-center border-b border-sand pb-4">
                <h3 className="font-serif text-xl text-charcoal">Atelier Size Dimensions (Inches)</h3>
                <button
                  onClick={() => setIsSizeChartOpen(false)}
                  className="text-xs uppercase text-charcoal-muted hover:text-charcoal"
                >
                  ✕ Close
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-sand bg-cream/60">
                      <th className="py-2.5 px-3 font-semibold text-charcoal uppercase">Size</th>
                      <th className="py-2.5 px-3 font-semibold text-charcoal uppercase">Bust (in)</th>
                      <th className="py-2.5 px-3 font-semibold text-charcoal uppercase">Waist (in)</th>
                      <th className="py-2.5 px-3 font-semibold text-charcoal uppercase">Hip (in)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand/40">
                    <tr>
                      <td className="py-2 px-3 font-semibold">XS</td>
                      <td className="py-2 px-3">32 - 33</td>
                      <td className="py-2 px-3">25 - 26</td>
                      <td className="py-2 px-3">35 - 36</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">S</td>
                      <td className="py-2 px-3">34 - 35</td>
                      <td className="py-2 px-3">27 - 28</td>
                      <td className="py-2 px-3">37 - 38</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">M</td>
                      <td className="py-2 px-3">36 - 37</td>
                      <td className="py-2 px-3">29 - 30</td>
                      <td className="py-2 px-3">39 - 40</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">L</td>
                      <td className="py-2 px-3">38 - 40</td>
                      <td className="py-2 px-3">31 - 33</td>
                      <td className="py-2 px-3">41 - 43</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold">XL</td>
                      <td className="py-2 px-3">41 - 43</td>
                      <td className="py-2 px-3">34 - 36</td>
                      <td className="py-2 px-3">44 - 46</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-[11px] text-charcoal-muted leading-relaxed">
                All measurements reflect garment dimensions designed for a comfortable, architectural silhouette. Need bespoke adjustments? Contact our concierge team.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
