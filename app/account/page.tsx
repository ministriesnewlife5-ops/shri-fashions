'use client';

import React from 'react';
import Link from 'next/link';
import { Package, Heart, MapPin, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/context/auth-context';
import { useWishlist } from '@/lib/context/wishlist-context';

export default function AccountOverviewPage() {
  const { user } = useAuth();
  const { wishlistCount } = useWishlist();

  return (
    <div className="space-y-8">
      <div className="border-b border-sand pb-4">
        <span className="text-[10px] uppercase tracking-widest text-gold font-semibold block">
          Welcome to SHRÎ Atelier
        </span>
        <h1 className="font-serif text-2xl md:text-3xl text-charcoal font-normal">
          Client Dashboard
        </h1>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-5 bg-cream/50 border border-sand/60 space-y-2">
          <Package className="w-5 h-5 text-gold" />
          <h3 className="font-serif text-base text-charcoal">My Orders</h3>
          <p className="text-xs text-charcoal-muted">Track existing orders and view purchase history.</p>
          <Link
            href="/account/orders"
            className="text-xs text-gold hover:underline inline-flex items-center space-x-1 pt-2 font-medium"
          >
            <span>View Orders</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="p-5 bg-cream/50 border border-sand/60 space-y-2">
          <Heart className="w-5 h-5 text-gold" />
          <h3 className="font-serif text-base text-charcoal">Saved Wishlist</h3>
          <p className="text-xs text-charcoal-muted">{wishlistCount} silhouettes curated in your private list.</p>
          <Link
            href="/account/wishlist"
            className="text-xs text-gold hover:underline inline-flex items-center space-x-1 pt-2 font-medium"
          >
            <span>View Wishlist</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="p-5 bg-cream/50 border border-sand/60 space-y-2">
          <MapPin className="w-5 h-5 text-gold" />
          <h3 className="font-serif text-base text-charcoal">Addresses</h3>
          <p className="text-xs text-charcoal-muted">Manage your primary shipping and billing destinations.</p>
          <Link
            href="/account/addresses"
            className="text-xs text-gold hover:underline inline-flex items-center space-x-1 pt-2 font-medium"
          >
            <span>Manage Addresses</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Profile Details */}
      <div className="pt-6 border-t border-sand space-y-4">
        <h2 className="font-serif text-lg text-charcoal font-medium">Profile Information</h2>
        <div className="bg-cream/30 p-6 border border-sand/60 text-xs space-y-2 max-w-lg">
          <div className="flex justify-between">
            <span className="text-charcoal-muted">Full Name:</span>
            <span className="text-charcoal font-semibold">{user?.profile?.full_name || 'Not specified'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-charcoal-muted">Mobile Number:</span>
            <span className="text-charcoal font-semibold">{user?.phone || user?.profile?.phone || 'Not registered'}</span>
          </div>
          {user?.email && (
            <div className="flex justify-between">
              <span className="text-charcoal-muted">Email:</span>
              <span className="text-charcoal font-semibold">{user.email}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-charcoal-muted">Membership Tier:</span>
            <span className="text-gold font-semibold uppercase tracking-wider text-[11px]">Privé Circle</span>
          </div>
        </div>
      </div>
    </div>
  );
}
