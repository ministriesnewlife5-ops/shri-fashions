import React from 'react';
import Link from 'next/link';
import { Plus, Edit, Eye, Search, Shirt } from 'lucide-react';
import { getProducts } from '@/lib/services/catalogue';
import { formatPaise } from '@/lib/utils/format';

export const metadata = {
  title: 'Catalogue Management | SHRÎ Admin',
};

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sand pb-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-gold font-semibold block">
            Catalogue & Inventory
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-charcoal font-normal">
            Silhouette Management
          </h1>
        </div>
        <Link
          href="/admin/products/new"
          className="px-4 py-2 bg-charcoal text-ivory text-xs uppercase tracking-wider font-semibold hover:bg-gold transition-colors inline-flex items-center space-x-1"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Silhouette</span>
        </Link>
      </div>

      <div className="bg-ivory border border-sand/70 p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center text-xs">
          <span className="text-charcoal-muted uppercase tracking-wider font-semibold">
            {products.length} Active Silhouettes In Studio
          </span>
        </div>

        {products.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Shirt className="w-10 h-10 text-sand mx-auto stroke-1" />
            <h3 className="font-serif text-base text-charcoal">No Silhouettes in Atelier</h3>
            <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
              Your store currently has no active products. Add your first handcrafted silhouette to launch the collection.
            </p>
            <div className="pt-2">
              <Link
                href="/admin/products/new"
                className="px-4 py-2 bg-charcoal text-ivory text-xs uppercase tracking-wider font-semibold hover:bg-gold transition-colors inline-flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Silhouette</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-sand text-charcoal-muted uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-2">Silhouette</th>
                  <th className="py-3 px-2">Category</th>
                  <th className="py-3 px-2">Base Price</th>
                  <th className="py-3 px-2">Variants & Stock</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand/40">
                {products.map((product) => {
                  const lowestPrice = Math.min(...(product.variants?.map((v) => v.price_paise) || [0]));
                  const totalStock = product.variants?.reduce((s, v) => s + v.stock_quantity, 0) || 0;
                  const variantCount = product.variants?.length || 0;

                  return (
                    <tr key={product.id} className="hover:bg-cream/40 transition-colors">
                      <td className="py-3 px-2 flex items-center space-x-3">
                        <div className="w-10 h-14 bg-cream shrink-0 overflow-hidden">
                          {product.images?.[0] && (
                            <img
                              src={product.images[0].storage_path}
                              alt={product.name}
                              className="w-full h-full object-cover object-top"
                            />
                          )}
                        </div>
                        <div>
                          <strong className="text-charcoal block line-clamp-1">{product.name}</strong>
                          <span className="text-[10px] text-charcoal-muted font-mono">{product.slug}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-charcoal-muted uppercase text-[10px]">
                        {product.category?.name || 'Standard'}
                      </td>
                      <td className="py-3 px-2 font-semibold text-charcoal">
                        {formatPaise(lowestPrice)}
                      </td>
                      <td className="py-3 px-2">
                        <span className="block text-charcoal">{totalStock} Units Total</span>
                        <span className="text-[10px] text-charcoal-muted">
                          ({variantCount} variants)
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-xs bg-success/15 text-success">
                          {product.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right space-x-2">
                        <Link
                          href={`/products/${product.slug}`}
                          target="_blank"
                          className="p-1.5 text-charcoal-muted hover:text-charcoal inline-block"
                          title="View Live in Store"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="p-1.5 text-gold hover:text-gold-hover inline-block"
                          title="Edit Silhouette"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
