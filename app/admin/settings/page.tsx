'use client';

import React, { useState, useEffect } from 'react';
import { Settings, CheckCircle2, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function AdminSettingsPage() {
  const [storeName, setStoreName] = useState('SHRÎ Atelier');
  const [currency, setCurrency] = useState('INR');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(2500);
  const [standardShipping, setStandardShipping] = useState(150);
  const [codEnabled, setCodEnabled] = useState(true);
  const [codFee, setCodFee] = useState(99);
  const [taxPercentage, setTaxPercentage] = useState(5);
  const [lowStockThreshold, setLowStockThreshold] = useState(3);
  const [announcementText, setAnnouncementText] = useState('Complimentary Express Delivery Across India on Orders Above ₹2,500');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data } = await supabase.from('store_settings').select('key, value');
        if (data) {
          data.forEach((row: { key: string; value: any }) => {
            if (row.key === 'store_name') setStoreName(row.value);
            if (row.key === 'currency') setCurrency(row.value);
            if (row.key === 'free_shipping_threshold_paise') setFreeShippingThreshold(row.value / 100);
            if (row.key === 'standard_shipping_paise') setStandardShipping(row.value / 100);
            if (row.key === 'cod_enabled') setCodEnabled(Boolean(row.value));
            if (row.key === 'cod_fee_paise') setCodFee(row.value / 100);
            if (row.key === 'tax_percentage') setTaxPercentage(row.value);
            if (row.key === 'low_stock_threshold') setLowStockThreshold(row.value);
            if (row.key === 'announcement_bar' && row.value?.text) setAnnouncementText(row.value.text);
          });
        }
      } catch (err) {
        console.warn('Failed to load settings from Supabase:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const supabase = createClient();
      const settingsToUpsert = [
        { key: 'store_name', value: storeName },
        { key: 'currency', value: currency },
        { key: 'free_shipping_threshold_paise', value: freeShippingThreshold * 100 },
        { key: 'standard_shipping_paise', value: standardShipping * 100 },
        { key: 'cod_enabled', value: codEnabled },
        { key: 'cod_fee_paise', value: codFee * 100 },
        { key: 'tax_percentage', value: taxPercentage },
        { key: 'low_stock_threshold', value: lowStockThreshold },
        { key: 'announcement_bar', value: { text: announcementText, enabled: true } },
      ];

      for (const item of settingsToUpsert) {
        await supabase.from('store_settings').upsert(item as any);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert('Error updating settings: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center flex flex-col items-center space-y-2">
        <Loader2 className="w-6 h-6 animate-spin text-gold" />
        <span className="text-xs text-charcoal-muted">Loading settings from database...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-sand pb-4">
        <span className="text-[10px] uppercase tracking-widest text-gold font-semibold block">
          Configuration & Policies
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl text-charcoal font-normal">
          Store & Commerce Settings
        </h1>
      </div>

      {saved && (
        <div className="p-4 bg-success/15 border border-success/40 text-success text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Atelier settings saved to database successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        <div className="bg-ivory border border-sand/70 p-6 space-y-4 text-xs">
          <h2 className="font-serif text-base text-charcoal border-b border-sand pb-2">
            Store Identity
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider font-semibold text-charcoal block mb-1">
                Store Name
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-cream/30 border border-sand p-2"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider font-semibold text-charcoal block mb-1">
                Currency
              </label>
              <input
                type="text"
                disabled
                value={currency}
                className="w-full bg-sand/30 border border-sand p-2 cursor-not-allowed"
              />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-charcoal block mb-1">
              Storefront Announcement Message
            </label>
            <input
              type="text"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="w-full bg-cream/30 border border-sand p-2"
            />
          </div>
        </div>

        <div className="bg-ivory border border-sand/70 p-6 space-y-4 text-xs">
          <h2 className="font-serif text-base text-charcoal border-b border-sand pb-2">
            Shipping & COD Parameters (India)
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider font-semibold text-charcoal block mb-1">
                Free Shipping Threshold (₹)
              </label>
              <input
                type="number"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                className="w-full bg-cream/30 border border-sand p-2"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider font-semibold text-charcoal block mb-1">
                Standard Shipping Fee (₹)
              </label>
              <input
                type="number"
                value={standardShipping}
                onChange={(e) => setStandardShipping(Number(e.target.value))}
                className="w-full bg-cream/30 border border-sand p-2"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="cod"
              checked={codEnabled}
              onChange={(e) => setCodEnabled(e.target.checked)}
              className="accent-charcoal"
            />
            <label htmlFor="cod" className="font-medium text-charcoal">
              Enable Cash on Delivery (COD) for Indian PIN Codes
            </label>
          </div>
          {codEnabled && (
            <div>
              <label className="text-xs uppercase tracking-wider font-semibold text-charcoal block mb-1">
                COD Convenience Fee (₹)
              </label>
              <input
                type="number"
                value={codFee}
                onChange={(e) => setCodFee(Number(e.target.value))}
                className="w-full bg-cream/30 border border-sand p-2 max-w-xs"
              />
            </div>
          )}
        </div>

        <div className="bg-ivory border border-sand/70 p-6 space-y-4 text-xs">
          <h2 className="font-serif text-base text-charcoal border-b border-sand pb-2">
            Taxes & Inventory Thresholds
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider font-semibold text-charcoal block mb-1">
                Applicable GST / Tax Rate (%)
              </label>
              <input
                type="number"
                value={taxPercentage}
                onChange={(e) => setTaxPercentage(Number(e.target.value))}
                className="w-full bg-cream/30 border border-sand p-2"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider font-semibold text-charcoal block mb-1">
                Low Stock Warning Alert Units
              </label>
              <input
                type="number"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                className="w-full bg-cream/30 border border-sand p-2"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2.5 bg-charcoal text-ivory text-xs uppercase tracking-widest font-semibold hover:bg-gold transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Updating Settings...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
