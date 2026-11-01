'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X, RotateCcw, ChevronDown, Check } from 'lucide-react';
import { Category } from '@/lib/types/database';

interface ShopFiltersProps {
  categories: Category[];
  totalCount: number;
}

export function ShopFilters({ categories, totalCount }: ShopFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Extract current values
  const currentCategory = searchParams.get('category') || '';
  const currentSize = searchParams.get('size') || '';
  const currentColor = searchParams.get('color') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const inStockOnly = searchParams.get('inStock') === 'true';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/shop?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push('/shop');
  };

  const hasActiveFilters =
    Boolean(currentCategory || currentSize || currentColor || inStockOnly || minPrice || maxPrice);

  const sizes = ['XS', 'S', 'M', 'L', 'XL'];
  const colors = [
    { name: 'Champagne', hex: '#D4AF37' },
    { name: 'Charcoal', hex: '#1C1A18' },
    { name: 'Ivory', hex: '#FDFBF7' },
    { name: 'Olive', hex: '#556B2F' },
    { name: 'Gilded', hex: '#E6C687' },
    { name: 'Terracotta', hex: '#C48A73' },
    { name: 'Sand', hex: '#D9CDB8' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Filter and Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-sand gap-4">
        <div className="flex items-center space-x-4">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="lg:hidden flex items-center space-x-2 px-4 py-2 border border-sand text-xs uppercase tracking-wider text-charcoal hover:bg-cream"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters {hasActiveFilters && '• Active'}</span>
          </button>

          <span className="text-xs text-charcoal-muted uppercase tracking-wider font-medium">
            Showing {totalCount} {totalCount === 1 ? 'Silhouette' : 'Silhouettes'}
          </span>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-gold hover:underline flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear all</span>
            </button>
          )}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs uppercase tracking-wider text-charcoal-muted">Sort by:</span>
          <select
            value={currentSort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="bg-ivory border border-sand px-3 py-1.5 text-xs text-charcoal focus:outline-hidden focus:border-charcoal"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="popularity">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden overflow-hidden">
          <div
            className="absolute inset-0 bg-charcoal/50 backdrop-blur-xs"
            onClick={() => setIsMobileFiltersOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xs bg-ivory p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-sand pb-4">
                  <h3 className="font-serif text-lg uppercase tracking-wider">Filters</h3>
                  <button
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="p-1 text-charcoal-muted hover:text-charcoal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Categories */}
                <div className="space-y-2">
                  <span className="text-xs uppercase tracking-widest font-semibold text-charcoal block">
                    Category
                  </span>
                  <div className="space-y-1">
                    <button
                      onClick={() => updateParam('category', null)}
                      className={`block text-xs py-1 text-left ${!currentCategory ? 'text-gold font-semibold' : 'text-charcoal-muted'}`}
                    >
                      All Categories
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => updateParam('category', c.slug)}
                        className={`block text-xs py-1 text-left ${currentCategory === c.slug ? 'text-gold font-semibold' : 'text-charcoal-muted'}`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size */}
                <div className="space-y-2">
                  <span className="text-xs uppercase tracking-widest font-semibold text-charcoal block">
                    Size
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => updateParam('size', currentSize === s ? null : s)}
                        className={`px-3 py-1.5 text-xs border ${currentSize === s ? 'bg-charcoal text-ivory border-charcoal' : 'border-sand text-charcoal'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div className="pt-2">
                  <label className="flex items-center space-x-2 text-xs text-charcoal cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => updateParam('inStock', e.target.checked ? 'true' : null)}
                      className="rounded-xs border-sand text-charcoal focus:ring-0"
                    />
                    <span>In-Stock Only</span>
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t border-sand space-y-2">
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="w-full py-3 bg-charcoal text-ivory text-xs uppercase tracking-widest font-semibold"
                >
                  Apply Filters
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      clearAllFilters();
                      setIsMobileFiltersOpen(false);
                    }}
                    className="w-full py-2 text-xs text-charcoal-muted uppercase tracking-widest hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ShopSidebar({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get('category') || '';
  const currentSize = searchParams.get('size') || '';
  const currentColor = searchParams.get('color') || '';
  const inStockOnly = searchParams.get('inStock') === 'true';

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/shop?${params.toString()}`);
  };

  const sizes = ['XS', 'S', 'M', 'L', 'XL'];
  const colors = [
    { name: 'Champagne', hex: '#D4AF37' },
    { name: 'Charcoal', hex: '#1C1A18' },
    { name: 'Ivory', hex: '#FDFBF7' },
    { name: 'Olive', hex: '#556B2F' },
    { name: 'Gilded', hex: '#E6C687' },
    { name: 'Terracotta', hex: '#C48A73' },
    { name: 'Sand', hex: '#D9CDB8' },
  ];

  return (
    <aside className="hidden lg:block w-64 pr-8 space-y-8 divide-y divide-sand/60">
      {/* Category Filter */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-widest font-semibold text-charcoal">
          Silhouette
        </h3>
        <ul className="space-y-1.5 text-xs">
          <li>
            <button
              onClick={() => updateParam('category', null)}
              className={`hover:text-gold transition-colors ${!currentCategory ? 'text-gold font-semibold' : 'text-charcoal-muted'}`}
            >
              All Categories
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => updateParam('category', c.slug)}
                className={`hover:text-gold transition-colors text-left ${currentCategory === c.slug ? 'text-gold font-semibold' : 'text-charcoal-muted'}`}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Size Filter */}
      <div className="pt-6 space-y-3">
        <h3 className="text-xs uppercase tracking-widest font-semibold text-charcoal">
          Size
        </h3>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => (
            <button
              key={s}
              onClick={() => updateParam('size', currentSize === s ? null : s)}
              className={`w-9 h-9 text-xs border flex items-center justify-center transition-colors ${
                currentSize === s
                  ? 'bg-charcoal text-ivory border-charcoal font-semibold'
                  : 'border-sand text-charcoal hover:border-charcoal'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Color Filter */}
      <div className="pt-6 space-y-3">
        <h3 className="text-xs uppercase tracking-widest font-semibold text-charcoal">
          Palette
        </h3>
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => {
            const isSelected = currentColor.toLowerCase() === c.name.toLowerCase();
            return (
              <button
                key={c.name}
                onClick={() => updateParam('color', isSelected ? null : c.name)}
                title={c.name}
                className={`relative w-7 h-7 rounded-full border transition-transform ${
                  isSelected ? 'scale-110 ring-2 ring-gold ring-offset-2' : 'border-sand hover:scale-105'
                }`}
                style={{ backgroundColor: c.hex }}
              >
                {isSelected && (
                  <Check
                    className={`w-3.5 h-3.5 mx-auto ${c.hex === '#FDFBF7' ? 'text-charcoal' : 'text-ivory'}`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stock Availability */}
      <div className="pt-6">
        <label className="flex items-center space-x-2 text-xs text-charcoal cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => updateParam('inStock', e.target.checked ? 'true' : null)}
            className="rounded-xs border-sand text-charcoal focus:ring-0"
          />
          <span className="text-charcoal-muted hover:text-charcoal transition-colors">
            In-Stock Silhouettes Only
          </span>
        </label>
      </div>
    </aside>
  );
}
