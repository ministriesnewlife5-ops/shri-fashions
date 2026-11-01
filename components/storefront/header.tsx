'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Heart, ShoppingBag, User, Menu, X, Shield } from 'lucide-react';
import { useCart } from '@/lib/context/cart-context';
import { useWishlist } from '@/lib/context/wishlist-context';
import { useAuth } from '@/lib/context/auth-context';
import { SearchModal } from './search-modal';
import { CartDrawer } from './cart-drawer';

export function Header() {
  const pathname = usePathname();
  const { itemCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { user, isAdmin, isStaff, signOut } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navLinks = [
    { label: 'Shop All', href: '/shop' },
    { label: 'Collections', href: '/collections/autumn-nocturne' },
    { label: 'Dresses', href: '/shop?category=dresses' },
    { label: 'Co-ords', href: '/shop?category=co-ords' },
    { label: 'Tunics', href: '/shop?category=tunics-kurtas' },
    { label: 'Our Story', href: '/about' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-ivory/95 backdrop-blur-md border-b border-sand/50 transition-all">
        {/* Top utility sub-bar */}
        <div className="bg-cream/50 px-4 py-1 text-[11px] border-b border-sand/30 flex justify-between items-center text-charcoal-muted">
          <div className="flex items-center space-x-3">
            <span>Customer Concierge: +91 98765 43210</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">Made to Order & In-House Inventory</span>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            {user ? (
              <>
                {isStaff && (
                  <Link
                    href="/admin"
                    className="text-gold font-medium hover:underline flex items-center space-x-1"
                  >
                    <Shield className="w-3 h-3" />
                    <span>Console</span>
                  </Link>
                )}
                <Link href="/account" className="hover:text-charcoal transition-colors">
                  {user.profile?.full_name || user.phone || 'Account'}
                </Link>
                <button
                  onClick={() => signOut()}
                  className="hover:text-error transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/account/login" className="hover:text-charcoal transition-colors">
                  Sign In
                </Link>
                <span>|</span>
                <Link href="/account/register" className="text-gold font-medium hover:underline">
                  Inscribe With Us
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Main Header bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile menu trigger */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 -ml-2 text-charcoal hover:text-gold transition-colors"
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-charcoal hover:text-gold transition-colors ml-1"
                aria-label="Search catalogue"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Desktop Left Nav */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navLinks.slice(0, 3).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs uppercase tracking-widest transition-colors font-medium hover:text-gold ${
                    pathname === link.href ? 'text-gold border-b border-gold pb-1' : 'text-charcoal'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Center Brand Logo */}
            <div className="text-center">
              <Link href="/" className="inline-block group">
                <span className="font-serif text-2xl md:text-3xl tracking-[0.25em] font-medium uppercase text-charcoal block group-hover:text-gold transition-colors">
                  SHRÎ
                </span>
                <span className="text-[9px] uppercase tracking-[0.45em] text-charcoal-muted font-sans block -mt-1">
                  Atelier
                </span>
              </Link>
            </div>

            {/* Desktop Right Nav & Icons */}
            <div className="flex items-center space-x-6">
              <nav className="hidden lg:flex items-center space-x-8 mr-2">
                {navLinks.slice(3).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-xs uppercase tracking-widest transition-colors font-medium hover:text-gold ${
                      pathname === link.href ? 'text-gold border-b border-gold pb-1' : 'text-charcoal'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center space-x-4">
                {/* Search trigger */}
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="hidden lg:inline-flex p-1.5 text-charcoal hover:text-gold transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>

                {/* Wishlist */}
                <Link
                  href="/account/wishlist"
                  className="relative p-1.5 text-charcoal hover:text-gold transition-colors"
                  aria-label="Wishlist"
                >
                  <Heart className="w-5 h-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gold text-ivory text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Customer Account or Admin Panel shortcut */}
                {isStaff ? (
                  <Link
                    href="/admin"
                    className="p-1.5 text-gold hover:text-gold-hover transition-colors flex items-center space-x-1"
                    title="Access Admin Dashboard"
                  >
                    <Shield className="w-5 h-5" />
                    <span className="hidden xl:inline text-[11px] font-semibold uppercase tracking-wider">Admin</span>
                  </Link>
                ) : (
                  <Link
                    href={user ? "/account" : "/account/login"}
                    className="p-1.5 text-charcoal hover:text-gold transition-colors"
                    aria-label="Customer Account"
                  >
                    <User className="w-5 h-5" />
                  </Link>
                )}

                {/* Shopping Bag */}
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-1.5 text-charcoal hover:text-gold transition-colors"
                  aria-label="View Shopping Bag"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-charcoal text-ivory text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                      {itemCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-sand bg-ivory px-6 py-6 space-y-4">
            <div className="divide-y divide-sand/50">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-3 text-sm uppercase tracking-widest font-medium text-charcoal hover:text-gold"
                >
                  {link.label}
                </Link>
              ))}
              {isStaff && (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-3 text-sm uppercase tracking-widest font-medium text-gold hover:underline flex items-center space-x-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </Link>
              )}
              <Link
                href={user ? "/account" : "/account/login"}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-3 text-sm uppercase tracking-widest font-medium text-charcoal hover:text-gold"
              >
                {user ? "My Account & Orders" : "Sign In / Register"}
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Global Drawers */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <CartDrawer />
    </>
  );
}
