'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, normalizePhoneNumber } from '@/lib/context/auth-context';
import { Smartphone, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { user, sendPhoneOtp, verifyPhoneOtp } = useAuth();

  // Phone OTP States
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      if (user.role === 'admin' || user.role === 'staff') {
        router.push('/admin');
      } else {
        router.push('/account');
      }
    }
  }, [user, router]);

  // Resend Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Step 1: Send OTP to Phone
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanDigits = phone.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsLoading(true);
    const res = await sendPhoneOtp(phone);
    setIsLoading(false);

    if (res.success) {
      setIsOtpSent(true);
      setCountdown(60);
      setSuccessMessage(`A 6-digit verification code has been sent to ${normalizePhoneNumber(phone)}.`);
    } else {
      setErrorMessage(res.error || 'Failed to dispatch verification code. Please try again.');
    }
  };

  // Step 2: Verify Phone OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!otp || otp.trim().length !== 6) {
      setErrorMessage('Please enter the 6-digit code received on your mobile.');
      return;
    }

    setIsLoading(true);
    const res = await verifyPhoneOtp(phone, otp);
    setIsLoading(false);

    if (res.success) {
      router.push('/account');
    } else {
      setErrorMessage(res.error || 'Invalid or expired OTP. Please verify and retry.');
    }
  };

  return (
    <div className="max-w-md w-full bg-cream/50 p-8 md:p-10 border border-sand/70 shadow-sm space-y-6">
      <div className="text-center space-y-2">
        <span className="text-[11px] uppercase tracking-[0.3em] text-gold font-medium block">
          Atelier Circle
        </span>
        <h1 className="font-serif text-3xl text-charcoal font-normal">
          Sign In to Your Account
        </h1>
        <p className="text-xs text-charcoal-muted">
          Sign in seamlessly with your registered mobile phone number.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 bg-error/10 border border-error/30 text-error text-xs rounded-xs">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-success/10 border border-success/30 text-success text-xs rounded-xs flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* PHONE OTP AUTHENTICATION */}
      {!isOtpSent ? (
        // Step 1: Enter Phone Number
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider font-semibold text-charcoal block mb-1">
              Mobile Number
            </label>
            <div className="flex border border-sand bg-ivory focus-within:border-charcoal transition-colors">
              <span className="px-3.5 py-2.5 text-xs text-charcoal-muted border-r border-sand bg-cream/30 flex items-center">
                +91
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-transparent px-3.5 py-2.5 text-xs text-charcoal tracking-wider focus:outline-hidden"
              />
            </div>
            <span className="text-[10px] text-charcoal-muted block mt-1">
              An authentic 6-digit one-time passcode will be sent via SMS.
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading || phone.replace(/\D/g, '').length < 10}
            className="w-full py-3.5 bg-charcoal text-ivory text-xs uppercase tracking-widest font-semibold hover:bg-gold transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>{isLoading ? 'Dispatching OTP...' : 'Send Verification OTP'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      ) : (
        // Step 2: Enter 6-digit OTP
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs uppercase tracking-wider font-semibold text-charcoal">
                6-Digit Passcode
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsOtpSent(false);
                  setOtp('');
                }}
                className="text-[11px] text-gold hover:underline"
              >
                Change Number
              </button>
            </div>

            <input
              type="text"
              inputMode="numeric"
              autoFocus
              required
              maxLength={6}
              placeholder="••••••"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-ivory border border-sand px-3.5 py-3 text-center text-base tracking-[0.5em] font-mono text-charcoal focus:border-charcoal focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.trim().length !== 6}
            className="w-full py-3.5 bg-charcoal text-ivory text-xs uppercase tracking-widest font-semibold hover:bg-gold transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>{isLoading ? 'Verifying OTP...' : 'Verify & Access Account'}</span>
            <ShieldCheck className="w-4 h-4" />
          </button>

          <div className="text-center pt-2">
            {countdown > 0 ? (
              <span className="text-[11px] text-charcoal-muted">
                Resend code in <strong className="font-mono text-charcoal">{countdown}s</strong>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleSendOtp}
                className="text-[11px] text-gold hover:underline font-medium"
              >
                Resend Verification Code
              </button>
            )}
          </div>
        </form>
      )}

      <div className="pt-4 border-t border-sand text-center text-xs text-charcoal-muted">
        <p>
          New to SHRÎ Atelier?{' '}
          <Link href="/account/register" className="text-gold font-semibold hover:underline">
            Inscribe With Us
          </Link>
        </p>
      </div>
    </div>
  );
}
