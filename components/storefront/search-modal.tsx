'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search as SearchIcon, X, ArrowRight, Loader2 } from 'lucide-react';
import { Product } from '@/lib/types/database';
import { formatPaise } from '@/lib/utils/format';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.products || []);
        } else {
          setResults([]);
        }
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative min-h-screen flex items-start justify-center pt-20 px-4">
        <div className="relative bg-ivory w-full max-w-2xl shadow-2xl p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-sand pb-4">
            <div className="flex items-center space-x-3 flex-1">
              <SearchIcon className="w-5 h-5 text-charcoal-muted" />
              <input
                type="text"
                autoFocus
                placeholder="Search silhouettes, pure silk, linen co-ords..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-sm md:text-base text-charcoal placeholder:text-charcoal-muted/60 focus:outline-hidden"
              />
            </div>
            <button
              onClick={onClose}
              className="p-1 text-charcoal-muted hover:text-charcoal transition-colors ml-4"
              aria-label="Close search dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Categories */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="text-charcoal-muted py-1 pr-2">Popular Inquiries:</span>
            {['Silk Dresses', 'Linen Co-ords', 'Chanderi Tunics', 'Evening Gowns'].map((term) => (
              <button
                key={term}
                onClick={() => setQuery(term)}
                className="px-3 py-1 bg-cream/70 hover:bg-sand/70 text-charcoal transition-colors"
              >
                {term}
              </button>
            ))}
          </div>

          {/* Search Results */}
          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-gold font-semibold">
                {query ? 'Matching Silhouettes' : 'Featured Atelier Silhouettes'}
              </span>
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-gold" />}
            </div>

            {results.length === 0 && !isLoading ? (
              <div className="py-12 text-center text-xs text-charcoal-muted">
                {query ? (
                  <p>No silhouettes match &ldquo;{query}&rdquo;. Try another term.</p>
                ) : (
                  <p>Our catalog is currently preparing new seasonal silhouettes.</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.map((product) => {
                  const minPrice = Math.min(...(product.variants?.map((v) => v.price_paise) || [0]));
                  const img = product.images?.[0]?.storage_path || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80';

                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      onClick={onClose}
                      className="flex space-x-3 p-2 hover:bg-cream/50 transition-colors group"
                    >
                      <div className="relative w-16 h-20 bg-cream shrink-0 overflow-hidden">
                        <Image
                          src={img}
                          alt={product.name}
                          fill
                          sizes="64px"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex flex-col justify-center min-w-0">
                        <span className="text-[10px] uppercase tracking-wider text-gold font-medium truncate">
                          {product.category?.name || 'Silhouette'}
                        </span>
                        <h4 className="font-serif text-xs sm:text-sm text-charcoal truncate group-hover:text-gold transition-colors">
                          {product.name}
                        </h4>
                        <span className="text-xs text-charcoal-muted font-medium mt-1">
                          {formatPaise(minPrice)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer CTA */}
          <div className="pt-4 border-t border-sand flex justify-between items-center text-xs">
            <span className="text-charcoal-muted">Press ESC or click outside to dismiss</span>
            <Link
              href="/shop"
              onClick={onClose}
              className="text-gold font-medium hover:underline inline-flex items-center space-x-1"
            >
              <span>Explore Entire Catalog</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
