'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, User, MapPin, Heart, RotateCcw, LogOut, Shield } from 'lucide-react';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { useAuth } from '@/lib/context/auth-context';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, signOut, isStaff } = useAuth();

  const isAuthPage = pathname?.startsWith('/account/login') || pathname?.startsWith('/account/register');

  // For Login and Register pages: render clean centered layout without account sidebar
  if (isAuthPage) {
    return (
      <div className="min-h-screen flex flex-col bg-ivory">
        <Header />
        <main className="flex-1 flex items-center justify-center py-12 md:py-16 px-4 sm:px-6">
          {children}
        </main>
        <Footer />
      </div>
    );
  }

  const links = [
    { label: 'Overview', href: '/account', icon: User },
    { label: 'My Orders', href: '/account/orders', icon: Package },
    { label: 'Saved Addresses', href: '/account/addresses', icon: MapPin },
    { label: 'Wishlist', href: '/account/wishlist', icon: Heart },
    { label: 'Returns & Exchanges', href: '/account/returns', icon: RotateCcw },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          {/* Account Sidebar */}
          <aside className="w-full md:w-64 shrink-0 space-y-6">
            <div className="p-6 bg-cream/60 border border-sand/70 space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-gold font-semibold">
                Client Account
              </span>
              <h2 className="font-serif text-lg text-charcoal font-medium">
                {user?.profile?.full_name || user?.phone || user?.email || 'Valued Client'}
              </h2>
              <p className="text-xs text-charcoal-muted truncate">
                {user?.phone || user?.email || 'Authenticated Account'}
              </p>
            </div>

            <nav className="space-y-1 bg-ivory border border-sand/60 p-2 text-xs">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-3 px-3 py-2.5 transition-colors font-medium ${
                      isActive
                        ? 'bg-charcoal text-ivory'
                        : 'text-charcoal hover:bg-cream hover:text-gold'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              {isStaff && (
                <Link
                  href="/admin"
                  className="flex items-center space-x-3 px-3 py-2.5 text-gold hover:bg-cream font-medium"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </Link>
              )}

              <button
                onClick={() => signOut()}
                className="w-full flex items-center space-x-3 px-3 py-2.5 text-error hover:bg-error/10 transition-colors text-left font-medium cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </nav>
          </aside>

          {/* Main Account Content Area */}
          <div className="flex-1 bg-ivory border border-sand/60 p-6 md:p-8 min-h-[500px]">
            {children}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
