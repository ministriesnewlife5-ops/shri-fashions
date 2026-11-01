'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import { Header } from '@/components/storefront/header';
import { AnnouncementBar } from '@/components/storefront/announcement-bar';
import { Footer } from '@/components/storefront/footer';

export default function ContactPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Order inquiry');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !message) return;
    setSent(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <AnnouncementBar />
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-16 md:py-24 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs uppercase tracking-[0.3em] text-gold font-medium block">
            Atelier Concierge
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-charcoal font-normal">
            Get in Touch
          </h1>
          <p className="text-xs md:text-sm text-charcoal-muted max-w-md mx-auto">
            Our concierge team is available for styling guidance, sizing consultations, and bespoke order inquiries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Studio Contact Info */}
          <div className="md:col-span-5 space-y-6 text-xs text-charcoal-muted">
            <div className="p-6 bg-cream/40 border border-sand/70 space-y-4">
              <h2 className="font-serif text-lg text-charcoal font-semibold border-b border-sand pb-2">
                Studio Information
              </h2>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-charcoal">Bangalore Design Atelier</p>
                    <p>14 Indiranagar, 12th Main Road, Bengaluru, Karnataka 560038, India</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-charcoal">Electronic Mail</p>
                    <p>concierge@shri-atelier.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-charcoal">Telephone & WhatsApp</p>
                    <p>+91 98765 43210 (Mon–Sat, 10:00 AM – 7:00 PM IST)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Inquiry Form */}
          <div className="md:col-span-7">
            {sent ? (
              <div className="p-8 bg-cream/50 border border-gold/40 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-gold mx-auto" />
                <h3 className="font-serif text-xl text-charcoal">Message Received</h3>
                <p className="text-xs text-charcoal-muted max-w-sm mx-auto leading-relaxed">
                  Thank you, {fullName}. Our studio concierge will review your message and respond within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 bg-cream/30 border border-sand/60 space-y-4 text-xs">
                <div>
                  <label className="text-xs uppercase tracking-wider font-semibold text-charcoal block mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-ivory border border-sand p-2.5 text-xs focus:border-charcoal focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider font-semibold text-charcoal block mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-ivory border border-sand p-2.5 text-xs focus:border-charcoal focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider font-semibold text-charcoal block mb-1">
                    Subject
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-ivory border border-sand p-2.5 text-xs focus:border-charcoal focus:outline-hidden"
                  >
                    <option value="Order inquiry">Order inquiry / Tracking update</option>
                    <option value="Size consultation">Size consultation & silhouette fit</option>
                    <option value="Return or exchange">Return or exchange request</option>
                    <option value="Press and editorial">Press & editorial loans</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider font-semibold text-charcoal block mb-1">
                    Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="How can our atelier assist you today?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-ivory border border-sand p-2.5 text-xs focus:border-charcoal focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-charcoal text-ivory text-xs uppercase tracking-widest font-semibold hover:bg-gold transition-colors"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
