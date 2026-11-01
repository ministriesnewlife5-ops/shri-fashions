'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UserRole, Profile } from '@/lib/types/database';

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  role: UserRole;
  profile?: Profile | null;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  sendPhoneOtp: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyPhoneOtp: (phone: string, token: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAdmin: (identifier: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY = 'shri_admin_session_v1';

// Helper to normalize Indian phone numbers to E.164 (+91XXXXXXXXXX)
export function normalizePhoneNumber(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.length >= 10) {
    const last10 = digits.slice(-10);
    return `+91${last10}`;
  }
  return `+91${digits}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch full user profile & role from Supabase database
  const fetchUserData = useCallback(async (userId: string, email?: string, phone?: string) => {
    try {
      const supabase = createClient();

      // Fetch user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      const role = (roleData?.role as UserRole) || 'customer';

      // Fetch user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      setUser({
        id: userId,
        email: email || undefined,
        phone: phone || profile?.phone || undefined,
        role,
        profile: profile || null,
      });
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setUser({
        id: userId,
        email: email || undefined,
        phone: phone || undefined,
        role: 'customer',
        profile: null,
      });
    }
  }, []);

  const refreshUser = useCallback(async () => {
    // Check if admin session exists
    try {
      const storedAdmin = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (storedAdmin) {
        setUser(JSON.parse(storedAdmin));
        return;
      }
    } catch {
      // Storage unavailable
    }

    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await fetchUserData(session.user.id, session.user.email, session.user.phone);
    } else {
      setUser(null);
    }
  }, [fetchUserData]);

  useEffect(() => {
    const supabase = createClient();

    async function initAuth() {
      try {
        // 1. Check for stored admin session
        const storedAdmin = localStorage.getItem(ADMIN_STORAGE_KEY);
        if (storedAdmin) {
          setUser(JSON.parse(storedAdmin));
          setIsLoading(false);
          return;
        }

        // 2. Check Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchUserData(session.user.id, session.user.email, session.user.phone);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      // If admin session is stored, preserve it
      if (localStorage.getItem(ADMIN_STORAGE_KEY)) {
        return;
      }

      if (session?.user) {
        await fetchUserData(session.user.id, session.user.email, session.user.phone);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchUserData]);

  // Send OTP to mobile phone number via Supabase Phone Auth
  const sendPhoneOtp = async (rawPhone: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanDigits = rawPhone.replace(/\D/g, '');
      if (cleanDigits.length < 10) {
        return { success: false, error: 'Please enter a valid 10-digit mobile number.' };
      }

      const formattedPhone = normalizePhoneNumber(rawPhone);
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          channel: 'sms',
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to send OTP.' };
    }
  };

  // Verify OTP received on mobile phone number
  const verifyPhoneOtp = async (
    rawPhone: string,
    token: string,
    fullName?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!token || token.trim().length < 6) {
        return { success: false, error: 'Please enter a valid 6-digit verification code.' };
      }

      const formattedPhone = normalizePhoneNumber(rawPhone);
      const supabase = createClient();

      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: token.trim(),
        type: 'sms',
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.session?.user) {
        const userId = data.session.user.id;

        // If fullName provided during registration, update profile
        if (fullName && fullName.trim()) {
          try {
            await supabase
              .from('profiles')
              .upsert({
                id: userId,
                full_name: fullName.trim(),
                phone: formattedPhone,
                updated_at: new Date().toISOString(),
              });
          } catch (profileErr) {
            console.warn('Profile upsert warning:', profileErr);
          }
        }

        await fetchUserData(userId, data.session.user.email, formattedPhone);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'OTP verification failed.' };
    }
  };

  // Staff / Admin Email & Password login
  const signInWithEmail = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { success: false, error: error.message };
      }

      if (data.session?.user) {
        await fetchUserData(data.session.user.id, data.session.user.email, data.session.user.phone);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Authentication failed.' };
    }
  };

  // Dedicated Admin Console Login (Mobile: 9788394119, Pass: Shri@123)
  const loginAdmin = async (identifier: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanDigits = identifier.replace(/\D/g, '');
      const last10 = cleanDigits.slice(-10);

      // Check required admin credentials
      if (last10 === '9788394119' && pass === 'Shri@123') {
        const adminUser: AuthUser = {
          id: 'admin_master_owner',
          phone: '+919788394119',
          role: 'admin',
          profile: {
            id: 'admin_master_owner',
            full_name: 'Studio Administrator',
            phone: '+91 97883 94119',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        };

        setUser(adminUser);
        try {
          localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminUser));
        } catch {
          // localStorage error
        }
        return { success: true };
      }

      // Also support email fallback if provided
      if (identifier.includes('@')) {
        const res = await signInWithEmail(identifier, pass);
        if (res.success) return res;
      }

      return { success: false, error: 'Invalid administrative credentials. Please verify mobile identifier and password.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Authentication error.' };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setUser(null);
    }
  };

  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff' || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin,
        isStaff,
        sendPhoneOtp,
        verifyPhoneOtp,
        signInWithEmail,
        loginAdmin,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
