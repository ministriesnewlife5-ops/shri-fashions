'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Shirt,
  Boxes,
  FolderTree,
  ShoppingBag,
  CreditCard,
  RotateCcw,
  Users,
  Ticket,
  FileText,
  BarChart3,
  Settings,
  History,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  Lock,
  Smartphone,
  ArrowRight,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/lib/context/auth-context';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isAdmin, isLoading, loginAdmin, signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Admin Login States
  const [adminPhone, setAdminPhone] = useState('9788394119');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Shirt },
    { label: 'Inventory & Stock', href: '/admin/inventory', icon: Boxes },
    { label: 'Categories', href: '/admin/categories', icon: FolderTree },
    { label: 'Collections', href: '/admin/collections', icon: FolderTree },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Payments', href: '/admin/payments', icon: CreditCard },
    { label: 'Returns & Refunds', href: '/admin/returns', icon: RotateCcw },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Coupons', href: '/admin/coupons', icon: Ticket },
    { label: 'Store Content', href: '/admin/content', icon: FileText },
    { label: 'Sales Reports', href: '/admin/reports', icon: BarChart3 },
    { label: 'Store Settings', href: '/admin/settings', icon: Settings },
    { label: 'Audit Logs', href: '/admin/audit-logs', icon: History },
  ];

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);

    const res = await loginAdmin(adminPhone, adminPassword);
    setIsSubmitting(false);

    if (!res.success) {
      setLoginError(res.error || 'Invalid credentials. Access restricted to authorized personnel.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sand/20 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-widest text-charcoal font-medium">
            Loading Atelier Console...
          </p>
        </div>
      </div>
    );
  }

  // Admin Access Gate: Displayed if not authenticated as admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-charcoal flex flex-col justify-between text-ivory">
        {/* Top Header */}
        <header className="p-6 border-b border-charcoal-light flex justify-between items-center max-w-7xl mx-auto w-full">
          <div>
            <span className="font-serif text-2xl tracking-[0.2em] uppercase block font-light">
              SHRÎ
            </span>
            <span className="text-[9px] uppercase tracking-[0.35em] text-gold block font-sans">
              Administrative Console
            </span>
          </div>
          <Link
            href="/"
            className="text-xs text-gold/80 hover:text-gold flex items-center space-x-1.5 transition-colors"
          >
            <span>Return to Boutique</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </header>

        {/* Login Gate Form */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="max-w-md w-full bg-charcoal-light/40 border border-sand/20 backdrop-blur-xs p-8 md:p-10 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-3">
                <Lock className="w-5 h-5 text-gold" />
              </div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-gold font-semibold block">
                Authorized Personnel Only
              </span>
              <h1 className="font-serif text-2xl text-ivory font-normal">
                Atelier Console Login
              </h1>
              <p className="text-xs text-ivory/60">
                Sign in with your administrative credentials to manage catalog, orders, and store operations.
              </p>
            </div>

            {loginError && (
              <div className="p-3 bg-error/20 border border-error/40 text-error text-xs rounded-xs">
                {loginError}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider font-semibold text-ivory/80 block mb-1">
                  Mobile Number / Identifier
                </label>
                <div className="flex border border-charcoal-light bg-charcoal focus-within:border-gold transition-colors">
                  <span className="px-3.5 py-2.5 text-xs text-ivory/50 border-r border-charcoal-light bg-charcoal-light/30 flex items-center">
                    +91
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="9788394119"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    className="w-full bg-transparent px-3.5 py-2.5 text-xs text-ivory tracking-wider focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider font-semibold text-ivory/80 block mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-charcoal border border-charcoal-light px-3.5 py-2.5 text-xs text-ivory focus:border-gold focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !adminPhone || !adminPassword}
                className="w-full py-3.5 bg-gold text-charcoal text-xs uppercase tracking-widest font-semibold hover:bg-gold-light transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer mt-2"
              >
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Console'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="pt-4 border-t border-charcoal-light text-center text-[11px] text-ivory/40">
              <span>Secure PostgreSQL &middot; Role-Based Access Control</span>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-4 border-t border-charcoal-light text-center text-xs text-ivory/40">
          SHRÎ Atelier &copy; {new Date().getFullYear()} &middot; All Rights Reserved
        </footer>
      </div>
    );
  }

  // Authenticated Admin Dashboard Layout
  return (
    <div className="min-h-screen bg-sand/20 flex flex-col lg:flex-row text-charcoal">
      {/* Mobile Header Bar */}
      <div className="lg:hidden bg-charcoal text-ivory p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 text-ivory hover:text-gold"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <span className="font-serif text-lg tracking-wider">SHRÎ Admin</span>
        </div>
        <Link href="/" className="text-xs text-gold hover:underline flex items-center space-x-1">
          <span>View Store</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Admin Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-charcoal text-ivory flex flex-col justify-between transform transition-transform duration-300 lg:static lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-charcoal-light flex justify-between items-center">
            <div>
              <span className="font-serif text-xl tracking-[0.2em] font-medium text-ivory uppercase block">
                SHRÎ
              </span>
              <span className="text-[9px] uppercase tracking-[0.35em] text-gold block font-sans">
                Atelier Console
              </span>
            </div>
            <Link
              href="/"
              target="_blank"
              className="text-ivory/60 hover:text-gold transition-colors p-1"
              title="Open Storefront in New Tab"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>

          {/* User badge */}
          <div className="px-6 py-3 bg-charcoal-light/60 border-b border-charcoal-light flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 truncate">
              <ShieldCheck className="w-4 h-4 text-gold shrink-0" />
              <div className="truncate">
                <span className="truncate text-ivory/90 font-medium block">
                  {user?.profile?.full_name || 'Studio Administrator'}
                </span>
                <span className="text-[10px] text-ivory/50 block font-mono">
                  {user?.phone || '+91 97883 94119'}
                </span>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold text-gold px-1.5 py-0.5 bg-gold/10">
              Admin
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-230px)] text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xs transition-colors font-medium ${
                    isActive
                      ? 'bg-gold text-charcoal font-semibold'
                      : 'text-ivory/70 hover:bg-charcoal-light hover:text-ivory'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Bar with Sign Out */}
        <div className="p-4 border-t border-charcoal-light text-[11px] text-ivory/60 flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <span>v1.0 &middot; Supabase DB</span>
            <Link
              href="/"
              className="text-gold hover:underline text-[10px]"
            >
              View Storefront
            </Link>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center justify-center space-x-2 py-2 text-error hover:bg-error/10 border border-error/20 transition-colors text-xs font-medium cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out of Console</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
