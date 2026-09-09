'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SyncHero from './SyncHero';
import { Logo } from '@/components/ui/Logo';
import {
  Truck,
  MapPin,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  Star,
  Package,
  Route,
  Warehouse,
  Bell,
  IndianRupee,
  CheckCircle2,
  ChevronRight,
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
  // Scroll-triggered animations
  useEffect(() => {
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
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 md:px-12 h-16 bg-white/90 backdrop-blur-md border-b border-neutral-200/80 shadow-xs">
        <Link href="/" className="flex items-center group">
          <Logo variant="full" theme="light" size={32} />
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600">
          <a href="#features" className="hover:text-neutral-950 transition-colors">Features</a>
          <a href="#stats" className="hover:text-neutral-950 transition-colors">Results</a>
          <a href="#testimonials" className="hover:text-neutral-950 transition-colors">Clients</a>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/auth/login"
            className="px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-neutral-700 hover:text-neutral-950 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-all duration-200 shadow-md shadow-brand-600/25 hover:shadow-brand-600/35 whitespace-nowrap"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ─── Hero Section: Bold Typography & Transformation Particle Field ─── */}
      <SyncHero />

      {/* ─── Stats Section: Numbers that matter ──────── */}
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
                  {Array.from({ length: t.rating }).map((_, i) => (
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
            <Link href="/dashboard" className="hover:text-neutral-800 transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
