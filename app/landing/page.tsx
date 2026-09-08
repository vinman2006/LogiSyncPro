'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SparklesCore } from '@/components/ui/sparkles';
import { Logo, LogoIcon } from '@/components/ui/Logo';
import {
  Truck,
  MapPin,
  BarChart3,
  Zap,
  ShieldCheck,
  ArrowRight,
  Star,
  Package,
  Route,
  Warehouse,
  Bell,
  IndianRupee,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  Globe,
  Sparkles,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// Stats data
const STATS = [
  { value: 1400, suffix: '+', label: 'Deliveries / Day', icon: Truck, color: '#F97316' },
  { value: 94.8, suffix: '%', label: 'SLA Fulfilment', icon: CheckCircle2, color: '#22C55E' },
  { value: 1.8, prefix: '₹', suffix: 'L', label: 'Avg Monthly Savings', icon: IndianRupee, color: '#3B82F6' },
  { value: 320, suffix: '+', label: 'MSME Clients', icon: Star, color: '#A855F7' },
];

// Feature cards
const FEATURES = [
  {
    icon: MapPin,
    title: '3D Live Fleet Map',
    description: 'GPU-accelerated 3D OpenStreetMap with real-time truck positions, GPS tracing, and animated ETA pills.',
    color: '#F97316',
    gradient: 'from-orange-600/20 to-transparent',
  },
  {
    icon: Route,
    title: 'AI Route Optimization',
    description: 'Machine-learning route planner cuts fuel costs by 18% on average using live traffic and FASTag data.',
    color: '#22C55E',
    gradient: 'from-green-600/20 to-transparent',
  },
  {
    icon: Warehouse,
    title: 'Hub Management',
    description: 'Manage Bhiwandi, Okhla, and Peenya hubs from a unified control plane with real-time occupancy.',
    color: '#3B82F6',
    gradient: 'from-blue-600/20 to-transparent',
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    description: 'AI-generated mitigation recommendations with ≤90s escalation for SLA breaches, delays, and breakdowns.',
    color: '#EF4444',
    gradient: 'from-red-600/20 to-transparent',
  },
  {
    icon: BarChart3,
    title: 'Operations Analytics',
    description: 'Recharts-powered dashboards with weekly volume trends, hub performance, and revenue attribution.',
    color: '#A855F7',
    gradient: 'from-purple-600/20 to-transparent',
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise Auth',
    description: 'Firebase Authentication with Google Sign-In, role-based access, and SOC2-compliant session handling.',
    color: '#14B8A6',
    gradient: 'from-teal-600/20 to-transparent',
  },
];

// Testimonials
const TESTIMONIALS = [
  {
    name: 'Rahul Mehta',
    company: 'Mehta Textiles Pvt Ltd, Surat',
    text: 'LogiSync Pro cut our delivery escalations by 60%. The 3D map alone is worth the subscription — our ops team lives in it.',
    avatar: 'RM',
    rating: 5,
  },
  {
    name: 'Priya Sharma',
    company: 'ShopEasy Logistics, Pune',
    text: 'We saved ₹2.1L in the first month. The AI route planner found corridors our drivers had overlooked for years.',
    avatar: 'PS',
    rating: 5,
  },
  {
    name: 'Arjun Nair',
    company: 'KeralaFresh Distribution, Kochi',
    text: 'The Firebase auth integration let us onboard 40 drivers in one afternoon. Clean, fast, reliable.',
    avatar: 'AN',
    rating: 5,
  },
];

// Animated counter hook
function useCounter(target: number, duration = 2) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const obj = { value: 0 };
          gsap.to(obj, {
            value: target,
            duration,
            ease: 'power2.out',
            onUpdate: () => {
              setCount(parseFloat(obj.value.toFixed(target % 1 === 0 ? 0 : 1)));
            },
          });
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

function StatCard({ stat, index }: { stat: typeof STATS[0]; index: number }) {
  const { count, ref } = useCounter(stat.value, 2 + index * 0.3);
  const Icon = stat.icon;

  return (
    <div className="stat-card flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-neutral-200/90 shadow-sm hover:shadow-md hover:border-neutral-300 transition-all duration-300 group">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
        style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}30` }}
      >
        <Icon className="w-5 h-5" style={{ color: stat.color }} />
      </div>
      <div className="font-heading text-4xl font-black text-neutral-950 mb-1 tabular-nums">
        {stat.prefix && <span style={{ color: stat.color }}>{stat.prefix}</span>}
        <span ref={ref}>{count}</span>
        <span style={{ color: stat.color }}>{stat.suffix}</span>
      </div>
      <div className="text-sm text-neutral-600 font-medium">{stat.label}</div>
    </div>
  );
}

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSubRef = useRef<HTMLParagraphElement>(null);
  const heroCTARef = useRef<HTMLDivElement>(null);

  // Hero entrance animation
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Text reveals — hero entrance
    tl.fromTo(
      heroTitleRef.current,
      { y: 35, opacity: 0, scale: 0.96 },
      { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'power3.out' }
    )
      .fromTo(heroSubRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.2')
      .fromTo(heroCTARef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, '-=0.2')
      .fromTo('.hero-card', { y: 30, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.1 }, '-=0.2');

    // Scroll-triggered animations
    gsap.utils.toArray('.feature-card').forEach((card, i) => {
      gsap.fromTo(
        card as Element,
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6, delay: i * 0.08,
          scrollTrigger: { trigger: card as Element, start: 'top 85%', toggleActions: 'play none none none' },
        }
      );
    });

    gsap.utils.toArray('.testimonial-card').forEach((card, i) => {
      gsap.fromTo(
        card as Element,
        { x: i % 2 === 0 ? -40 : 40, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 0.7, delay: i * 0.1,
          scrollTrigger: { trigger: card as Element, start: 'top 85%', toggleActions: 'play none none none' },
        }
      );
    });

    gsap.fromTo('.section-title', { y: 30, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.6,
      scrollTrigger: { trigger: '.features-section', start: 'top 80%', toggleActions: 'play none none none' },
    });

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  return (
    <div className="min-h-screen bg-white text-neutral-900 overflow-x-hidden selection:bg-brand-500/20">
      {/* ─── Navbar ─────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-16 bg-white/90 backdrop-blur-md border-b border-neutral-200/80 shadow-xs">
        <Link href="/landing" className="flex items-center group">
          <Logo variant="full" theme="light" size={34} />
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600">
          <a href="#features" className="hover:text-neutral-950 transition-colors">Features</a>
          <a href="#stats" className="hover:text-neutral-950 transition-colors">Results</a>
          <a href="#testimonials" className="hover:text-neutral-950 transition-colors">Clients</a>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="px-4 py-2 text-sm font-semibold text-neutral-700 hover:text-neutral-950 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="px-4 py-2 text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-all duration-200 shadow-md shadow-brand-600/25 hover:shadow-brand-600/35"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ─── Hero Section ──────────────────────────── */}
      <section ref={heroRef} className="relative w-full bg-white flex flex-col items-center justify-center overflow-hidden pt-24 pb-0">

        {/* ── Title block ── */}
        <div className="relative z-20 flex flex-col items-center text-center px-6 pt-12 pb-0">

          {/* Main Headline — exact Aceternity styling with LogiSyncPRO */}
          <h1
            ref={heroTitleRef}
            className="md:text-7xl text-4xl lg:text-9xl font-black text-center text-neutral-950 relative z-20 leading-tight tracking-tight select-none"
          >
            LogiSyncPRO
          </h1>
        </div>

        {/* ── Sparkles strip — colorful particles on white background ── */}
        <div className="w-[40rem] max-w-full h-40 relative">
          {/* Indigo horizontal glow — blurred */}
          <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm opacity-70" />
          {/* Indigo horizontal line — crisp */}
          <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-600 to-transparent h-px w-3/4" />
          {/* Sky blue accent — blurred */}
          <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm opacity-80" />
          {/* Orange accent line — crisp */}
          <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-orange-500 to-transparent h-px w-1/4" />

          {/* Multi-colored Particle canvas */}
          <SparklesCore
            background="transparent"
            minSize={0.6}
            maxSize={1.8}
            particleDensity={1400}
            className="w-full h-full"
            particleColors={[
              '#4F46E5', // Indigo
              '#0EA5E9', // Sky Blue
              '#F97316', // Orange
              '#10B981', // Emerald
              '#8B5CF6', // Purple
              '#EC4899', // Pink
              '#F59E0B', // Amber
              '#06B6D4', // Cyan
            ]}
          />

          {/* Radial mask — creates the glowing colorful star dome on white */}
          <div
            className="absolute inset-0 w-full h-full bg-white [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)] pointer-events-none"
            style={{
              maskImage: 'radial-gradient(350px 200px at top, transparent 20%, white)',
              WebkitMaskImage: 'radial-gradient(350px 200px at top, transparent 20%, white)',
            }}
          />
        </div>

        {/* ── Below-sparkles content ── */}
        <div className="relative z-10 w-full max-w-4xl mx-auto text-center px-6 pt-10 pb-20">

          {/* Subheading */}
          <p ref={heroSubRef} className="text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            The only logistics platform built for Indian roads — 3D live fleet tracking,
            AI route optimization, and real-time hub management. Trusted by 320+ MSMEs.
          </p>

          {/* CTAs */}
          <div ref={heroCTARef} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link
              href="/auth/register"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-base transition-all duration-200 shadow-xl shadow-brand-600/30 hover:shadow-brand-600/45 hover:scale-105"
            >
              Start Free 14-Day Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-800 font-bold text-base transition-all duration-200 shadow-sm hover:border-neutral-300"
            >
              <Globe className="w-5 h-5 text-neutral-500" />
              View Dashboard
            </Link>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { label: 'Route AI', value: '-18% Fuel', icon: Route, color: '#22C55E' },
              { label: 'Alert Response', value: '≤ 90 sec', icon: Bell, color: '#EF4444' },
              { label: 'Uptime SLA', value: '99.95%', icon: TrendingUp, color: '#3B82F6' },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={i}
                  className={`hero-card flex items-center gap-3 p-4 rounded-xl bg-white border border-neutral-200/90 shadow-sm ${i === 2 ? 'col-span-2 md:col-span-1' : ''}`}
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${card.color}15` }}>
                    <Icon className="w-4 h-4" style={{ color: card.color }} />
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-neutral-500 mb-0.5">{card.label}</div>
                    <div className="font-heading font-bold text-neutral-900 text-sm">{card.value}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 animate-bounce z-20">
          <span className="text-xs text-neutral-400 font-medium">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-neutral-300 to-transparent" />
        </div>
      </section>

      {/* ─── Stats Section ─────────────────────────── */}
      <section id="stats" className="py-20 px-6 md:px-12 bg-neutral-50/70 border-t border-neutral-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title font-heading text-3xl md:text-4xl font-black text-neutral-950 mb-3">
              Numbers that matter
            </h2>
            <p className="text-neutral-500">Real outcomes across our MSME client base</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((stat, i) => (
              <StatCard key={stat.label} stat={stat} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Section ──────────────────────── */}
      <section id="features" className="features-section py-20 px-6 md:px-12 bg-white border-t border-neutral-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title font-heading text-3xl md:text-4xl font-black text-neutral-950 mb-3">
              Everything your ops team needs
            </h2>
            <p className="text-neutral-600 max-w-xl mx-auto">
              Built for the complexity of Indian logistics — from narrow lanes to toll-by-toll routing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="feature-card group relative p-6 rounded-2xl bg-neutral-50/70 border border-neutral-200/90 hover:bg-white hover:border-neutral-300 hover:shadow-md transition-all duration-300 overflow-hidden cursor-default"
                >
                  {/* Subtle Gradient Hover Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                  <div className="relative z-10">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                      style={{ background: `${feature.color}15`, border: `1px solid ${feature.color}30` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: feature.color }} />
                    </div>
                    <h3 className="font-heading font-bold text-neutral-950 text-base mb-2">{feature.title}</h3>
                    <p className="text-sm text-neutral-600 leading-relaxed">{feature.description}</p>
                    <div className="mt-4 flex items-center gap-1 text-xs font-semibold" style={{ color: feature.color }}>
                      <span>Learn more</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ──────────────────────────── */}
      <section id="testimonials" className="py-20 px-6 md:px-12 bg-neutral-50/70 border-t border-neutral-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="section-title font-heading text-3xl md:text-4xl font-black text-neutral-950 mb-3">
              Trusted by Indian operators
            </h2>
            <p className="text-neutral-500">Hear from logistics teams scaling with LogiSync Pro</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="testimonial-card p-6 rounded-2xl bg-white border border-neutral-200/90 hover:border-neutral-300 hover:shadow-md transition-all duration-300 flex flex-col"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current text-amber-500" />
                  ))}
                </div>
                <p className="text-sm text-neutral-700 leading-relaxed flex-1 mb-5 italic">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-50 border border-brand-200 flex items-center justify-center text-xs font-bold text-brand-600">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-neutral-900">{t.name}</div>
                    <div className="text-xs text-neutral-500">{t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─────────────────────────────── */}
      <section className="py-24 px-6 md:px-12 relative overflow-hidden bg-white border-t border-neutral-200">
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 100%, #EA580C18 0%, transparent 65%)' }}
        />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Package className="w-5 h-5 text-brand-600" />
            <span className="text-sm font-semibold text-brand-600">No credit card required</span>
          </div>
          <h2 className="font-heading text-4xl md:text-5xl font-black text-neutral-950 mb-5 leading-tight">
            Ready to transform<br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #F97316, #EA580C)' }}>
              your logistics?
            </span>
          </h2>
          <p className="text-neutral-600 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Join 320+ Indian MSMEs cutting costs and scaling faster with AI logistics intelligence.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-lg transition-all duration-200 shadow-xl shadow-brand-600/30 hover:shadow-brand-600/45 hover:scale-105"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/auth/login"
              className="flex items-center gap-2 px-10 py-4 rounded-2xl border border-neutral-300 text-neutral-800 hover:text-neutral-950 hover:bg-neutral-50 font-bold text-lg transition-all duration-200 shadow-xs"
            >
              Sign In
            </Link>
          </div>
          <p className="mt-6 text-xs text-neutral-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
            Secured by Firebase · SOC2 ready · 99.95% uptime
          </p>
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────── */}
      <footer className="border-t border-neutral-200 bg-neutral-50 px-6 md:px-12 py-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <Logo variant="full" theme="light" size={26} />
          </div>
          <div className="text-xs text-neutral-500 text-center">
            © 2024 LogiSync Pro. Built for Bharat&apos;s logistics operators.
          </div>
          <div className="flex items-center gap-6 text-xs text-neutral-500">
            <Link href="/auth/login" className="hover:text-neutral-800 transition-colors">Sign In</Link>
            <Link href="/auth/register" className="hover:text-neutral-800 transition-colors">Register</Link>
            <Link href="/" className="hover:text-neutral-800 transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

