import React from 'react';
import { getCategories } from '@/lib/services/catalogue';

export const metadata = {
  title: 'Category Architecture | SHRÎ Admin',
};

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div className="border-b border-sand pb-4 flex justify-between items-center">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-gold font-semibold block">
            Navigation Architecture
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-charcoal font-normal">
            Silhouette Categories
          </h1>
        </div>
      </div>

      <div className="bg-ivory border border-sand/70 p-6 shadow-xs overflow-x-auto">
        {categories.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <h3 className="font-serif text-base text-charcoal">No Categories Configured</h3>
            <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
              Categories help organize your silhouettes into dresses, co-ords, tunics, and evening wear.
            </p>
          </div>
        ) : (
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-sand text-charcoal-muted uppercase tracking-wider text-[10px] bg-cream/40">
                <th className="py-3 px-3">Image</th>
                <th className="py-3 px-3">Category Name</th>
                <th className="py-3 px-3">Slug</th>
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand/40">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-cream/40 transition-colors">
                  <td className="py-3 px-3">
                    <div className="w-10 h-10 bg-cream overflow-hidden">
                      {c.image_url && (
                        <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-charcoal">{c.name}</td>
                  <td className="py-3 px-3 font-mono text-charcoal-muted">{c.slug}</td>
                  <td className="py-3 px-3 text-charcoal-muted max-w-xs truncate">{c.description}</td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-xs bg-success/15 text-success">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
