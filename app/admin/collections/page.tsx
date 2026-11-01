import React from 'react';
import { getCollections } from '@/lib/services/catalogue';

export const metadata = {
  title: 'Collection Management | SHRÎ Admin',
};

export const dynamic = 'force-dynamic';

export default async function AdminCollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="space-y-6">
      <div className="border-b border-sand pb-4 flex justify-between items-center">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-gold font-semibold block">
            Capsule Drops
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-charcoal font-normal">
            Seasonal Collections
          </h1>
        </div>
      </div>

      {collections.length === 0 ? (
        <div className="bg-ivory border border-sand/70 p-16 text-center space-y-2 shadow-xs">
          <h3 className="font-serif text-base text-charcoal">No Seasonal Collections Created</h3>
          <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
            Capsule drops and seasonal collections group together limited edition silhouettes for curated editorial lookbooks.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {collections.map((col) => (
            <div key={col.id} className="bg-ivory border border-sand/70 p-6 space-y-4 shadow-xs">
              <div className="relative aspect-16/9 bg-cream overflow-hidden">
                {col.banner_image && (
                  <img src={col.banner_image} alt={col.name} className="w-full h-full object-cover" />
                )}
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <h3 className="font-serif text-lg text-charcoal font-semibold">{col.name}</h3>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-xs bg-success/15 text-success">
                    Published
                  </span>
                </div>
                <p className="font-mono text-xs text-charcoal-muted mt-0.5">/collections/{col.slug}</p>
                <p className="text-xs text-charcoal-muted mt-2">{col.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
