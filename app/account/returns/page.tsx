'use client';

import React, { useState } from 'react';
import { RotateCcw, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/context/auth-context';

export default function ReturnsPage() {
  const { user } = useAuth();
  const [orderNumber, setOrderNumber] = useState('');
  const [reason, setReason] = useState('Size exchange needed');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const supabase = createClient();

      // Find order by order_number
      const { data: order } = await supabase
        .from('orders')
        .select('id')
        .eq('order_number', orderNumber.trim())
        .maybeSingle();

      if (!order) {
        setErrorMsg('Order reference number not found. Please verify your order number.');
        setIsSubmitting(false);
        return;
      }

      const { error: insertError } = await supabase.from('return_requests').insert({
        order_id: order.id,
        user_id: user?.id || null,
        reason: `${reason}: ${notes}`.trim(),
        status: 'requested',
      });

      if (insertError) {
        setErrorMsg('Failed to record return inquiry: ' + insertError.message);
      } else {
        setSubmitted(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-sand pb-4">
        <span className="text-[10px] uppercase tracking-widest text-gold font-semibold block">
          Client Care
        </span>
        <h1 className="font-serif text-2xl md:text-3xl text-charcoal font-normal">
          Returns & Exchanges
        </h1>
      </div>

      <div className="p-4 bg-cream/40 border border-sand/60 text-xs text-charcoal-muted leading-relaxed space-y-1">
        <p className="font-semibold text-charcoal">7-Day Complimentary Doorstep Return Policy</p>
        <p>
          We offer hassle-free reverse courier pickup across all serviceable Indian pincodes. Garments must be unworn, unwashed, and retained with their original atelier swing tags and garment bags.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-error/10 border border-error/30 text-error text-xs rounded-xs">
          {errorMsg}
        </div>
      )}

      {submitted ? (
        <div className="p-8 bg-cream/50 border border-gold/40 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-gold mx-auto" />
          <h3 className="font-serif text-xl text-charcoal">Return Inquiry Inscribed</h3>
          <p className="text-xs text-charcoal-muted max-w-md mx-auto leading-relaxed">
            Our atelier concierge will contact you within 24 hours to schedule reverse doorstep pickup for order{' '}
            <strong className="font-mono text-charcoal">{orderNumber}</strong>.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setOrderNumber('');
              setNotes('');
            }}
            className="text-xs text-gold underline pt-2 cursor-pointer"
          >
            Submit Another Request
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 bg-cream/30 border border-sand space-y-4 max-w-lg">
          <h3 className="font-serif text-base text-charcoal">Initiate Return or Size Exchange</h3>

          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-charcoal block mb-1">
              Order Reference Number *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. SHR-20261028-1001"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full bg-ivory border border-sand px-3 py-2 text-xs font-mono text-charcoal uppercase focus:border-charcoal focus:outline-hidden"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-charcoal block mb-1">
              Inquiry Nature *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-ivory border border-sand px-3 py-2 text-xs text-charcoal focus:border-charcoal focus:outline-hidden"
            >
              <option value="Size exchange needed">Exchange for Different Size</option>
              <option value="Color swap requested">Exchange for Different Color</option>
              <option value="Fit does not meet expectation">Fit Not as Anticipated</option>
              <option value="Fabric quality inquiry">Fabric Inspection Requested</option>
            </select>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-charcoal block mb-1">
              Client Notes (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Please describe your preferred replacement size or comments..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-ivory border border-sand px-3 py-2 text-xs text-charcoal focus:border-charcoal focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !orderNumber.trim()}
            className="w-full py-3 bg-charcoal text-ivory text-xs uppercase tracking-widest font-semibold hover:bg-gold transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Inscribing Request...' : 'Inscribe Return Request'}
          </button>
        </form>
      )}
    </div>
  );
}
