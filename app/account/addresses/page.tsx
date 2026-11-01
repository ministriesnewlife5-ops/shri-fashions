'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/context/auth-context';

interface SavedAddress {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default_shipping: boolean;
}

export default function AddressesPage() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAddresses = async () => {
    if (!user) {
      setAddresses([]);
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error || !data) {
        setAddresses([]);
      } else {
        setAddresses(data as SavedAddress[]);
      }
    } catch {
      setAddresses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !fullName || !phone || !addressLine1 || !city || !pincode) return;

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const isFirst = addresses.length === 0;

      const { data, error } = await supabase
        .from('addresses')
        .insert({
          user_id: user.id,
          full_name: fullName.trim(),
          phone: phone.trim(),
          address_line1: addressLine1.trim(),
          address_line2: addressLine2.trim() || null,
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          country: 'India',
          is_default_shipping: isFirst,
          is_default_billing: isFirst,
        })
        .select()
        .single();

      if (error) {
        alert('Failed to save address: ' + error.message);
      } else if (data) {
        setAddresses([data as SavedAddress, ...addresses]);
        setShowAddForm(false);
        setFullName('');
        setPhone('');
        setAddressLine1('');
        setAddressLine2('');
        setCity('');
        setPincode('');
      }
    } catch (err: any) {
      alert('Error saving address: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you certain you wish to remove this saved shipping destination?')) return;

    try {
      const supabase = createClient();
      await supabase.from('addresses').delete().eq('id', id);
      setAddresses(addresses.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Failed to delete address:', err);
    }
  };

  const handleSetDefault = async (id: string) => {
    if (!user) return;
    try {
      const supabase = createClient();
      // Reset all defaults
      await supabase
        .from('addresses')
        .update({ is_default_shipping: false })
        .eq('user_id', user.id);

      // Set selected
      await supabase
        .from('addresses')
        .update({ is_default_shipping: true })
        .eq('id', id);

      setAddresses(
        addresses.map((a) => ({
          ...a,
          is_default_shipping: a.id === id,
        }))
      );
    } catch (err) {
      console.error('Failed to update default address:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-sand pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-gold font-semibold block">
            Fulfillment Book
          </span>
          <h1 className="font-serif text-2xl md:text-3xl text-charcoal font-normal">
            Saved Delivery Addresses
          </h1>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-charcoal text-ivory text-xs uppercase tracking-wider font-semibold hover:bg-gold transition-colors inline-flex items-center space-x-1.5 self-start cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Add Address Form */}
      {showAddForm && (
        <form
          onSubmit={handleAdd}
          className="p-6 bg-cream/40 border border-sand/70 space-y-4 max-w-2xl text-xs"
        >
          <h3 className="font-serif text-base text-charcoal">New Destination Address</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold block mb-1">Recipient Full Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-ivory border border-sand p-2"
                placeholder="e.g. Radhika Varma"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Mobile Contact *</label>
              <input
                type="tel"
                required
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-ivory border border-sand p-2"
                placeholder="9876543210"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1">Street Address / Suite / Residence *</label>
            <input
              type="text"
              required
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              className="w-full bg-ivory border border-sand p-2"
              placeholder="e.g. 402 Palm Grove Residences, 12th Main"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Locality / Landmark (Optional)</label>
            <input
              type="text"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              className="w-full bg-ivory border border-sand p-2"
              placeholder="e.g. Near Indiranagar Metro"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="font-semibold block mb-1">City *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-ivory border border-sand p-2"
                placeholder="Bengaluru"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">State *</label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-ivory border border-sand p-2"
                placeholder="Karnataka"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">PIN Code *</label>
              <input
                type="text"
                required
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-ivory border border-sand p-2"
                placeholder="560038"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-sand">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-sand text-charcoal hover:bg-cream"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-charcoal text-ivory uppercase tracking-wider text-[11px] font-semibold hover:bg-gold transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Destination'}
            </button>
          </div>
        </form>
      )}

      {/* Address List */}
      {isLoading ? (
        <div className="py-20 text-center flex flex-col items-center space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-gold" />
          <span className="text-xs text-charcoal-muted">Loading saved addresses...</span>
        </div>
      ) : addresses.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <MapPin className="w-10 h-10 text-sand mx-auto stroke-1" />
          <h3 className="font-serif text-base text-charcoal">No Addresses Saved Yet</h3>
          <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
            Save your preferred residence and studio shipping destinations for seamless single-click checkouts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-5 bg-cream/40 border transition-colors space-y-3 relative ${
                addr.is_default_shipping ? 'border-gold' : 'border-sand/70 hover:border-sand'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-serif text-sm font-semibold text-charcoal">
                    {addr.full_name}
                  </h4>
                  <p className="text-xs font-mono text-charcoal-muted">{addr.phone}</p>
                </div>
                {addr.is_default_shipping && (
                  <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 bg-gold/20 text-charcoal flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-gold" />
                    <span>Default</span>
                  </span>
                )}
              </div>

              <div className="text-xs text-charcoal-muted leading-relaxed">
                <p>{addr.address_line1}</p>
                {addr.address_line2 && <p>{addr.address_line2}</p>}
                <p>
                  {addr.city}, {addr.state} &mdash; {addr.pincode}
                </p>
                <p className="text-[11px] uppercase tracking-wider pt-0.5">India</p>
              </div>

              <div className="pt-2 border-t border-sand/50 flex justify-between items-center text-xs">
                {!addr.is_default_shipping ? (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-gold hover:underline text-[11px] font-medium"
                  >
                    Set as Default
                  </button>
                ) : (
                  <span className="text-[11px] text-charcoal-muted">Primary Address</span>
                )}

                <button
                  onClick={() => handleDelete(addr.id)}
                  className="text-error hover:text-error/80 p-1 transition-colors"
                  title="Remove address"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
