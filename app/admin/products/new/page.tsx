'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Category } from '@/lib/types/database';

interface VariantFormItem {
  id: string;
  sku: string;
  size: string;
  colorName: string;
  colorHex: string;
  priceRupees: number;
  compareAtPriceRupees?: number;
  stockQuantity: number;
}

export default function NewProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [fabric, setFabric] = useState('100% Hand-spun Mulberry Silk');
  const [fit, setFit] = useState('Fluid relaxed fit. Fits true to size.');
  const [careInstructions, setCareInstructions] = useState('Dry clean only. Store in a breathable cotton garment bag.');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=80');
  const [status, setStatus] = useState<'active' | 'draft'>('active');

  const [variants, setVariants] = useState<VariantFormItem[]>([
    {
      id: 'var-1',
      sku: 'SHR-NEW-GLD-S',
      size: 'S',
      colorName: 'Champagne Gold',
      colorHex: '#D4AF37',
      priceRupees: 7990,
      compareAtPriceRupees: 9990,
      stockQuantity: 12,
    },
    {
      id: 'var-2',
      sku: 'SHR-NEW-GLD-M',
      size: 'M',
      colorName: 'Champagne Gold',
      colorHex: '#D4AF37',
      priceRupees: 7990,
      compareAtPriceRupees: 9990,
      stockQuantity: 15,
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (data && data.length > 0) {
          setCategories(data as Category[]);
          setCategoryId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    }
    loadCategories();
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    );
  };

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        id: `var-${Date.now()}`,
        sku: `SHR-${(slug || 'SIL').toUpperCase().slice(0, 4)}-L`,
        size: 'L',
        colorName: 'Champagne Gold',
        colorHex: '#D4AF37',
        priceRupees: 7990,
        stockQuantity: 10,
      },
    ]);
  };

  const handleRemoveVariant = (id: string) => {
    setVariants(variants.filter((v) => v.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;

    setIsSubmitting(true);
    try {
      const supabase = createClient();

      // 1. Insert product
      const { data: prod, error: prodErr } = await supabase
        .from('products')
        .insert({
          name: name.trim(),
          slug: slug.trim(),
          category_id: categoryId || null,
          description: description.trim(),
          fabric: fabric.trim(),
          fit: fit.trim(),
          care_instructions: careInstructions.trim(),
          status,
          is_featured: false,
        })
        .select()
        .single();

      if (prodErr || !prod) {
        alert('Failed to register silhouette in database: ' + prodErr?.message);
        setIsSubmitting(false);
        return;
      }

      // 2. Insert primary image
      if (imageUrl && imageUrl.trim()) {
        await supabase.from('product_images').insert({
          product_id: prod.id,
          storage_path: imageUrl.trim(),
          alt_text: name,
          sort_order: 1,
        });
      }

      // 3. Insert variants
      if (variants.length > 0) {
        const variantsPayload = variants.map((v) => ({
          product_id: prod.id,
          sku: v.sku.trim(),
          size: v.size.trim(),
          color_name: v.colorName.trim(),
          color_hex: v.colorHex.trim(),
          price_paise: Math.round(v.priceRupees * 100),
          compare_at_price_paise: v.compareAtPriceRupees ? Math.round(v.compareAtPriceRupees * 100) : null,
          stock_quantity: v.stockQuantity,
          is_active: true,
        }));

        await supabase.from('product_variants').insert(variantsPayload);
      }

      setIsSaved(true);
      setTimeout(() => {
        router.push('/admin/products');
      }, 1200);
    } catch (err: any) {
      alert('Error creating silhouette: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-sand pb-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/products"
            className="p-1 text-charcoal-muted hover:text-charcoal transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-[10px] uppercase tracking-widest text-gold font-semibold block">
              Atelier Creation
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl text-charcoal font-normal">
              Inscribe New Silhouette
            </h1>
          </div>
        </div>
      </div>

      {isSaved && (
        <div className="p-4 bg-success/15 border border-success/40 text-success text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Silhouette recorded in atelier database successfully. Redirecting to catalog...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
        {/* Core Details */}
        <div className="bg-ivory border border-sand/70 p-6 space-y-4 text-xs">
          <h2 className="font-serif text-base text-charcoal border-b border-sand pb-2">
            1. Silhouette Identity
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold block mb-1">Silhouette Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. The Vayu Pleated Silk Maxi Dress"
                value={name}
                onChange={handleNameChange}
                className="w-full bg-cream/30 border border-sand p-2"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Slug (URL Reference) *</label>
              <input
                type="text"
                required
                placeholder="vayu-pleated-silk-maxi-dress"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-cream/30 border border-sand p-2 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold block mb-1">Category Classification *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-cream/30 border border-sand p-2"
              >
                {categories.length === 0 ? (
                  <option value="">General Silhouette</option>
                ) : (
                  categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="font-semibold block mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-cream/30 border border-sand p-2"
              >
                <option value="active">Active (Published to Store)</option>
                <option value="draft">Draft (Private in Studio)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1">Editorial Description</label>
            <textarea
              rows={4}
              placeholder="Describe the silhouette drape, tailoring details, and aesthetic inspiration..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-cream/30 border border-sand p-2"
            />
          </div>
        </div>

        {/* Textile & Care */}
        <div className="bg-ivory border border-sand/70 p-6 space-y-4 text-xs">
          <h2 className="font-serif text-base text-charcoal border-b border-sand pb-2">
            2. Textile Composition & Fit Notes
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold block mb-1">Fabric & Material Composition</label>
              <input
                type="text"
                value={fabric}
                onChange={(e) => setFabric(e.target.value)}
                className="w-full bg-cream/30 border border-sand p-2"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Fit & Silhouette Architecture</label>
              <input
                type="text"
                value={fit}
                onChange={(e) => setFit(e.target.value)}
                className="w-full bg-cream/30 border border-sand p-2"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1">Washing & Atelier Care Instructions</label>
            <input
              type="text"
              value={careInstructions}
              onChange={(e) => setCareInstructions(e.target.value)}
              className="w-full bg-cream/30 border border-sand p-2"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Primary Image URL</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-cream/30 border border-sand p-2"
            />
          </div>
        </div>

        {/* Variants & Inventory */}
        <div className="bg-ivory border border-sand/70 p-6 space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-sand pb-2">
            <h2 className="font-serif text-base text-charcoal">
              3. Size & Color Inventory Variants
            </h2>
            <button
              type="button"
              onClick={handleAddVariant}
              className="px-3 py-1.5 bg-cream hover:bg-sand border border-sand text-charcoal font-semibold flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Variant</span>
            </button>
          </div>

          <div className="space-y-3">
            {variants.map((v, idx) => (
              <div
                key={v.id}
                className="p-3 bg-cream/40 border border-sand/60 grid grid-cols-2 sm:grid-cols-7 gap-3 items-end"
              >
                <div>
                  <label className="font-semibold block text-[10px] text-charcoal-muted uppercase mb-1">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    value={v.sku}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[idx].sku = e.target.value;
                      setVariants(updated);
                    }}
                    className="w-full bg-ivory border border-sand p-1.5 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="font-semibold block text-[10px] text-charcoal-muted uppercase mb-1">
                    Size
                  </label>
                  <select
                    value={v.size}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[idx].size = e.target.value;
                      setVariants(updated);
                    }}
                    className="w-full bg-ivory border border-sand p-1.5"
                  >
                    {['XS', 'S', 'M', 'L', 'XL', 'Free Size'].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold block text-[10px] text-charcoal-muted uppercase mb-1">
                    Color Name
                  </label>
                  <input
                    type="text"
                    value={v.colorName}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[idx].colorName = e.target.value;
                      setVariants(updated);
                    }}
                    className="w-full bg-ivory border border-sand p-1.5"
                  />
                </div>

                <div>
                  <label className="font-semibold block text-[10px] text-charcoal-muted uppercase mb-1">
                    Color Hex
                  </label>
                  <input
                    type="text"
                    value={v.colorHex}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[idx].colorHex = e.target.value;
                      setVariants(updated);
                    }}
                    className="w-full bg-ivory border border-sand p-1.5 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="font-semibold block text-[10px] text-charcoal-muted uppercase mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    value={v.priceRupees}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[idx].priceRupees = Number(e.target.value);
                      setVariants(updated);
                    }}
                    className="w-full bg-ivory border border-sand p-1.5"
                  />
                </div>

                <div>
                  <label className="font-semibold block text-[10px] text-charcoal-muted uppercase mb-1">
                    Stock Units
                  </label>
                  <input
                    type="number"
                    value={v.stockQuantity}
                    onChange={(e) => {
                      const updated = [...variants];
                      updated[idx].stockQuantity = Number(e.target.value);
                      setVariants(updated);
                    }}
                    className="w-full bg-ivory border border-sand p-1.5 font-mono"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={variants.length === 1}
                    onClick={() => handleRemoveVariant(v.id)}
                    className="p-1.5 text-error hover:bg-error/10 disabled:opacity-30"
                    title="Remove variant"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Link
            href="/admin/products"
            className="px-6 py-2.5 border border-sand text-charcoal hover:bg-cream text-xs uppercase tracking-wider"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || !name || !slug}
            className="px-8 py-2.5 bg-charcoal text-ivory text-xs uppercase tracking-widest font-semibold hover:bg-gold transition-colors shadow-xs disabled:opacity-50"
          >
            {isSubmitting ? 'Recording Silhouette...' : 'Save & Inscribe Silhouette'}
          </button>
        </div>
      </form>
    </div>
  );
}
