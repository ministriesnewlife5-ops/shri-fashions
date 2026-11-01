'use client';

import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, ArrowUpDown, History, CheckCircle2, Loader2, Boxes } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatPaise } from '@/lib/utils/format';

interface InventoryItem {
  id: string;
  productName: string;
  sku: string;
  size: string;
  color: string;
  pricePaise: number;
  stockQuantity: number;
}

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);

  // Controlled stock adjustment modal state
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [changeQty, setChangeQty] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState('Studio physical stock audit');
  const [isUpdating, setIsUpdating] = useState(false);
  const [historyMessage, setHistoryMessage] = useState<string | null>(null);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('product_variants')
        .select(`
          id,
          sku,
          size,
          color_name,
          price_paise,
          stock_quantity,
          product:products(
            name
          )
        `)
        .order('sku', { ascending: true });

      if (error || !data) {
        setItems([]);
      } else {
        const formatted: InventoryItem[] = data.map((v: any) => ({
          id: v.id,
          productName: v.product?.name || 'Unnamed Silhouette',
          sku: v.sku,
          size: v.size,
          color: v.color_name,
          pricePaise: v.price_paise,
          stockQuantity: v.stock_quantity,
        }));
        setItems(formatted);
      }
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.productName.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
    const matchesStock = filterLowStockOnly ? item.stockQuantity <= 5 : true;
    return matchesSearch && matchesStock;
  });

  const handleApplyAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || changeQty === 0) return;

    setIsUpdating(true);
    const newStock = Math.max(0, selectedItem.stockQuantity + changeQty);

    try {
      const supabase = createClient();

      // 1. Update variant stock
      const { error: updateError } = await supabase
        .from('product_variants')
        .update({ stock_quantity: newStock, updated_at: new Date().toISOString() })
        .eq('id', selectedItem.id);

      if (updateError) {
        alert('Failed to update inventory in database: ' + updateError.message);
        setIsUpdating(false);
        return;
      }

      // 2. Record inventory movement
      await supabase.from('inventory_movements').insert({
        variant_id: selectedItem.id,
        type: 'manual_adjustment',
        quantity: changeQty,
        notes: adjustmentReason,
      });

      // Update local state
      setItems(
        items.map((i) =>
          i.id === selectedItem.id ? { ...i, stockQuantity: newStock } : i
        )
      );

      setHistoryMessage(
        `Recorded adjustment of ${changeQty > 0 ? `+${changeQty}` : changeQty} units for SKU: ${selectedItem.sku} (${adjustmentReason}). New stock: ${newStock}.`
      );

      setSelectedItem(null);
      setChangeQty(0);
    } catch (err: any) {
      alert('Error updating stock: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-sand pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-gold font-semibold block">
            Warehousing & Logistics
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-charcoal font-normal">
            Inventory & Stock Reconciliation
          </h1>
        </div>

        <button
          onClick={fetchInventory}
          className="text-xs text-charcoal-muted hover:text-charcoal flex items-center space-x-1"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {historyMessage && (
        <div className="p-4 bg-success/15 border border-success/40 text-success text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{historyMessage}</span>
          </div>
          <button
            onClick={() => setHistoryMessage(null)}
            className="text-[10px] uppercase font-bold text-success hover:underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by silhouette or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-ivory border border-sand px-3 py-2 text-xs text-charcoal pl-8 focus:border-charcoal focus:outline-hidden"
          />
          <Search className="w-3.5 h-3.5 text-charcoal-muted absolute left-2.5 top-2.5" />
        </div>

        <button
          onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
          className={`px-3 py-2 text-xs border flex items-center space-x-1.5 transition-colors cursor-pointer ${
            filterLowStockOnly
              ? 'bg-charcoal text-ivory border-charcoal'
              : 'bg-ivory border-sand text-charcoal hover:bg-cream'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Low Stock Only (&le; 5 units)</span>
        </button>
      </div>

      {/* Inventory Table */}
      <div className="bg-ivory border border-sand/70 p-6 shadow-xs overflow-x-auto">
        {isLoading ? (
          <div className="py-20 text-center flex flex-col items-center space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-gold" />
            <span className="text-xs text-charcoal-muted">Loading live inventory from Supabase...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Boxes className="w-10 h-10 text-sand mx-auto stroke-1" />
            <h3 className="font-serif text-base text-charcoal">No Inventory Variants Found</h3>
            <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
              {search || filterLowStockOnly
                ? 'No silhouette variants match your active filter criteria.'
                : 'No inventory variants registered in the atelier catalog yet.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-sand text-charcoal-muted uppercase tracking-wider text-[10px] bg-cream/40">
                <th className="py-3 px-3">SKU</th>
                <th className="py-3 px-3">Silhouette Name</th>
                <th className="py-3 px-3">Size / Color</th>
                <th className="py-3 px-3">Unit Price</th>
                <th className="py-3 px-3">Stock Units</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand/40">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-cream/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-charcoal">{item.sku}</td>
                  <td className="py-3 px-3 font-medium text-charcoal">{item.productName}</td>
                  <td className="py-3 px-3 text-charcoal-muted">
                    {item.size} &middot; {item.color}
                  </td>
                  <td className="py-3 px-3 font-medium text-charcoal">
                    {formatPaise(item.pricePaise)}
                  </td>
                  <td className="py-3 px-3 font-semibold text-charcoal font-mono">
                    {item.stockQuantity}
                  </td>
                  <td className="py-3 px-3">
                    {item.stockQuantity === 0 ? (
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-xs bg-error/15 text-error">
                        Out of Stock
                      </span>
                    ) : item.stockQuantity <= 5 ? (
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-xs bg-gold/20 text-charcoal">
                        Low Stock
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-xs bg-success/15 text-success">
                        Healthy
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setChangeQty(0);
                      }}
                      className="px-2.5 py-1 border border-charcoal text-[11px] text-charcoal hover:bg-charcoal hover:text-ivory transition-colors cursor-pointer"
                    >
                      Adjust Units
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Stock Adjustment Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-xs">
          <div className="bg-ivory border border-sand w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="font-serif text-lg text-charcoal border-b border-sand pb-2">
              Stock Adjustment &mdash; {selectedItem.sku}
            </h3>

            <div className="text-xs space-y-1 text-charcoal-muted bg-cream/50 p-3">
              <div>
                <strong>Silhouette:</strong> {selectedItem.productName}
              </div>
              <div>
                <strong>Specification:</strong> Size {selectedItem.size} &middot; {selectedItem.color}
              </div>
              <div>
                <strong>Current On-Hand Stock:</strong>{' '}
                <span className="font-mono font-bold text-charcoal">{selectedItem.stockQuantity}</span> units
              </div>
            </div>

            <form onSubmit={handleApplyAdjustment} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">
                  Quantity Adjustment (positive to add stock, negative to reduce):
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={changeQty}
                    onChange={(e) => setChangeQty(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-cream/30 border border-sand px-3 py-2 text-charcoal font-mono text-sm focus:border-charcoal focus:outline-hidden"
                  />
                  <span className="shrink-0 text-charcoal-muted">
                    Resulting Stock:{' '}
                    <strong className="text-charcoal font-mono">
                      {Math.max(0, selectedItem.stockQuantity + changeQty)}
                    </strong>
                  </span>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Reason for Adjustment *</label>
                <select
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full bg-cream/30 border border-sand px-3 py-2 text-charcoal focus:border-charcoal focus:outline-hidden"
                >
                  <option value="Studio physical stock audit">Studio physical stock audit</option>
                  <option value="Artisanal batch delivery received">Artisanal batch delivery received</option>
                  <option value="Damaged during atelier handling">Damaged during atelier handling</option>
                  <option value="Fabrication quality recall">Fabrication quality recall</option>
                  <option value="Customer return restocked">Customer return restocked</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-sand">
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 border border-sand text-charcoal hover:bg-cream"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating || changeQty === 0}
                  className="px-4 py-2 bg-charcoal text-ivory uppercase tracking-wider text-[11px] font-semibold hover:bg-gold disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Confirm Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
