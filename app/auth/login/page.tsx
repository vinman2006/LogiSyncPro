'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import gsap from 'gsap';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { getAuthErrorMessage } from '@/lib/firebase/auth';
import { LogoIcon } from '@/components/ui/Logo';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/dashboard';
  const { user, loading, signInWithGoogle, signInWithEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const getDestination = useCallback(() => {
    if (!from || from === '/' || from.startsWith('/auth')) {
      return '/dashboard';
    }
    return from;
  }, [from]);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.replace(getDestination());
    }
  }, [user, loading, router, getDestination]);

  // GSAP entrance animations
  useEffect(() => {
    if (!cardRef.current) return;

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo(
      cardRef.current,
      { y: 40, opacity: 0, scale: 0.96 },
      { y: 0, opacity: 1, scale: 1, duration: 0.7 }
    )
      .fromTo(
        '.auth-logo',
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        '-=0.4'
      )
      .fromTo(
        '.auth-field',
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.1 },
        '-=0.3'
      )
      .fromTo(
        '.auth-btn',
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, stagger: 0.08 },
        '-=0.1'
      );

    // Floating background orbs
    gsap.to('.auth-orb-1', {
      x: 30, y: -20, duration: 6, ease: 'sine.inOut', repeat: -1, yoyo: true,
    });
    gsap.to('.auth-orb-2', {
      x: -20, y: 30, duration: 8, ease: 'sine.inOut', repeat: -1, yoyo: true,
    });
  }, []);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      router.replace(getDestination());
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in your email and password.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await signInWithEmail(email, password);
      router.replace(getDestination());
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err));
      gsap.fromTo(
        cardRef.current,
        { x: -8 },
        { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex items-center justify-center bg-neutral-950 relative overflow-hidden px-4 py-12"
    >
      {/* Animated Background Orbs */}
      <div
        className="auth-orb-1 absolute top-[-120px] left-[-80px] w-[420px] h-[420px] rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #EA580C 0%, transparent 70%)' }}
      />
      <div
        className="auth-orb-2 absolute bottom-[-100px] right-[-80px] w-[320px] h-[320px] rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #2563EB 0%, transparent 70%)' }}
      />

      {/* Subtle Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Auth Card */}
      <div
        ref={cardRef}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo & Branding */}
        <div className="auth-logo text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center group">
            <LogoIcon size={56} className="mb-3 group-hover:scale-105 transition-transform duration-200 shadow-xl shadow-brand-600/30" />
            <div className="flex items-center gap-2">
              <span className="font-heading text-xl font-bold text-white tracking-tight">
                LogiSync
              </span>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-brand-600/20 text-brand-400 border border-brand-600/30">
                PRO
              </span>
            </div>
            <span className="text-xs text-neutral-500 mt-0.5 font-medium">
              AI Logistics for Indian MSMEs
            </span>
          </Link>
        </div>

        {/* Card Surface */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl shadow-black/40">
          <h1 className="font-heading text-2xl font-bold text-white mb-1 text-center">
            Welcome back
          </h1>
          <p className="text-sm text-neutral-400 text-center mb-7">
            Sign in to your operations dashboard
          </p>

          {/* Google Sign-In Button */}
          <div className="auth-field mb-5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-neutral-500" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="auth-field flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-neutral-800" />
            <span className="text-xs text-neutral-500 font-medium px-2">or</span>
            <div className="flex-1 h-px bg-neutral-800" />
          </div>

          {/* Email / Password Form */}
          <form ref={formRef} onSubmit={handleEmailSignIn} noValidate className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-critical-600/10 border border-critical-600/30 text-xs text-critical-400">
                <AlertCircle className="w-4 h-4 text-critical-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Input */}
            <div className="auth-field space-y-1.5">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.in"
                  className="w-full h-11 pl-10 pr-4 text-sm bg-neutral-800/70 text-white placeholder:text-neutral-600 border border-neutral-700 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="auth-field space-y-1.5">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-10 text-sm bg-neutral-800/70 text-white placeholder:text-neutral-600 border border-neutral-700 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sign In CTA */}
            <div className="auth-btn pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="auth-btn w-full flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-brand-600/30 hover:shadow-brand-600/50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Register Link */}
          <p className="auth-btn text-center text-xs text-neutral-500 mt-5">
            New to LogiSync Pro?{' '}
            <Link
              href="/auth/register"
              className="text-brand-400 hover:text-brand-300 font-semibold transition-colors"
            >
              Create your account
            </Link>
          </p>
        </div>

        {/* Footer Note */}
        <p className="text-center text-[11px] text-neutral-600 mt-4">
          <Sparkles className="inline w-3 h-3 text-brand-600 mr-1" />
          Secured by Firebase Authentication · Project logisyncpro
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-neutral-950">
          <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}

