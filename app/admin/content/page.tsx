'use client';

import React, { useState } from 'react';
import { FileText, CheckCircle2 } from 'lucide-react';

export default function AdminContentPage() {
  const [announcement, setAnnouncement] = useState(
    'Complimentary Express Delivery Across India on Orders Above ₹2,500'
  );
  const [heroTitle, setHeroTitle] = useState('Autumn Nocturne');
  const [heroSubtitle, setHeroSubtitle] = useState(
    'A study in quiet luxury, architectural drapery, and pure artisanal silks designed for the modern connoisseur.'
  );
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-sand pb-4">
        <span className="text-[10px] uppercase tracking-widest text-gold font-semibold block">
          Editorial & Brand Voice
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl text-charcoal font-normal">
          Content & Storefront Banners
        </h1>
      </div>

      {saved && (
        <div className="p-4 bg-success/15 border border-success/40 text-success text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Storefront content updated successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        {/* Announcement Bar */}
        <div className="bg-ivory border border-sand/70 p-6 space-y-4">
          <h2 className="font-serif text-base text-charcoal border-b border-sand pb-2">
            Header Announcement Bar
          </h2>
          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-charcoal block mb-1">
              Banner Announcement Text
            </label>
            <input
              type="text"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              className="w-full bg-cream/30 border border-sand p-2 text-xs text-charcoal"
            />
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-ivory border border-sand/70 p-6 space-y-4">
          <h2 className="font-serif text-base text-charcoal border-b border-sand pb-2">
            Homepage Hero Campaign Banner
          </h2>
          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-charcoal block mb-1">
              Campaign Title
            </label>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="w-full bg-cream/30 border border-sand p-2 text-xs text-charcoal"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-charcoal block mb-1">
              Campaign Subtitle
            </label>
            <textarea
              rows={2}
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              className="w-full bg-cream/30 border border-sand p-2 text-xs text-charcoal"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-charcoal text-ivory text-xs uppercase tracking-widest font-semibold hover:bg-gold transition-colors"
        >
          Publish Content Changes
        </button>
      </form>
    </div>
  );
}
