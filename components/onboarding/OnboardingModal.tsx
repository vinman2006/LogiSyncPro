'use client';

import React, { useState } from 'react';
import {
  Globe,
  Truck,
  Building2,
  Package,
  Sprout,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (node: any) => void;
  onClose?: () => void;
}

export function OnboardingModal({ isOpen, onComplete, onClose }: OnboardingModalProps) {
  const { user } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [country, setCountry] = useState('India');
  const [countryCode, setCountryCode] = useState('IN');
  const [role, setRole] = useState<'DISTRIBUTOR' | 'COLLECTOR' | 'FARMER'>('DISTRIBUTOR');
  const [businessName, setBusinessName] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('+91 98230 11223');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Preset demo helpers
  const applyPreset = (presetRole: 'DISTRIBUTOR' | 'COLLECTOR' | 'FARMER') => {
    setRole(presetRole);
    if (presetRole === 'DISTRIBUTOR') {
      setBusinessName('Pune Fresh Logistics');
      setCity('Pune');
    } else if (presetRole === 'COLLECTOR') {
      setBusinessName('Pune City Produce Collector');
      setCity('Pune');
    } else {
      setBusinessName('Maharashtra Orange Farm');
      setCity('Nashik');
    }
  };

  const handleFinish = async () => {
    if (!businessName.trim() || !city.trim()) {
      setError('Please provide your business name and operating city.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: user?.uid || `demo-user-${Date.now()}`,
          email: user?.email || 'user@logisync.com',
          country,
          countryCode,
          role,
          businessName,
          city,
          phone,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to complete onboarding');
      }

      onComplete(data.node);
    } catch (err: any) {
      setError(err.message || 'Onboarding error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-neutral-200 bg-white p-6 md:p-8 shadow-2xl text-neutral-900">
        {/* Progress Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            <span>Logistics Node Setup</span>
            <span>Step {step} of 3</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className={`h-1.5 rounded-full transition-all ${step >= 1 ? 'bg-brand' : 'bg-muted'}`} />
            <div className={`h-1.5 rounded-full transition-all ${step >= 2 ? 'bg-brand' : 'bg-muted'}`} />
            <div className={`h-1.5 rounded-full transition-all ${step >= 3 ? 'bg-brand' : 'bg-muted'}`} />
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* STEP 1: COUNTRY */}
        {step === 1 && (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Where does your business operate?</h2>
                <p className="text-sm text-muted-foreground">Select your primary jurisdiction for customs & compliance.</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {[
                { name: 'India', code: 'IN', flag: '🇮🇳', label: 'Domestic Agri & FMCG Hubs (Maharashtra, Gujarat, Delhi NCR)' },
                { name: 'United Arab Emirates', code: 'AE', flag: '🇦🇪', label: 'Middle East Export Corridor (Dubai, Abu Dhabi)' },
                { name: 'Singapore', code: 'SG', flag: '🇸🇬', label: 'ASEAN Cold Chain & Maritime Terminal' },
                { name: 'United States', code: 'US', flag: '🇺🇸', label: 'Interstate Freight & Cold Chain Network' },
              ].map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    setCountry(c.name);
                    setCountryCode(c.code);
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                    country === c.name
                      ? 'border-brand bg-brand/5 shadow-sm ring-1 ring-brand'
                      : 'border-border bg-muted/20 hover:border-muted-foreground/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{c.flag}</span>
                    <div>
                      <div className="font-semibold text-foreground">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.label}</div>
                    </div>
                  </div>
                  {country === c.name && <CheckCircle2 className="h-5 w-5 text-brand" />}
                </button>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-brand-foreground shadow hover:opacity-95 transition-all"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: ROLE */}
        {step === 2 && (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">What do you do in the supply chain?</h2>
                <p className="text-sm text-muted-foreground">This configures your logistics permissions and node routing.</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {[
                {
                  role: 'DISTRIBUTOR' as const,
                  title: 'Distributor',
                  desc: 'Collects produce/goods from farmers, handles transport fleets, and dispatches to city collectors.',
                  icon: Truck,
                  badge: 'Primary Demo Role',
                },
                {
                  role: 'COLLECTOR' as const,
                  title: 'Collector',
                  desc: 'Receives shipments at market hubs or urban destinations, verifies quantities, and handles settlement.',
                  icon: Package,
                  badge: 'Recipient Node',
                },
                {
                  role: 'FARMER' as const,
                  title: 'Farmer / Producer',
                  desc: 'Produces raw agricultural commodities (Oranges, Fruits, Crops) for pickup and dispatch.',
                  icon: Sprout,
                  badge: 'Origin Node',
                },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = role === item.role;
                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => {
                      applyPreset(item.role);
                    }}
                    className={`w-full flex items-start gap-4 p-4 rounded-xl border transition-all text-left ${
                      isSelected
                        ? 'border-brand bg-brand/5 shadow-sm ring-1 ring-brand'
                        : 'border-border bg-muted/20 hover:border-muted-foreground/30'
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg ${isSelected ? 'bg-brand text-brand-foreground' : 'bg-muted text-foreground'}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{item.title}</span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-brand/10 text-brand">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                    {isSelected && <CheckCircle2 className="h-5 w-5 text-brand shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-brand-foreground shadow hover:opacity-95 transition-all"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: BUSINESS PROFILE */}
        {step === 3 && (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Configure your Logistics Node</h2>
                <p className="text-sm text-muted-foreground">This creates your node in the LogiSync network.</p>
              </div>
            </div>

            {/* Quick Demo Autofill buttons */}
            <div className="mt-4 mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2">
                <Sparkles className="h-3.5 w-3.5" /> Quick Demo Role Autofill:
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset('DISTRIBUTOR')}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                    role === 'DISTRIBUTOR'
                      ? 'bg-brand text-brand-foreground border-brand'
                      : 'bg-background hover:bg-muted text-foreground border-border'
                  }`}
                >
                  Distributor: Pune Fresh Logistics
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('COLLECTOR')}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                    role === 'COLLECTOR'
                      ? 'bg-brand text-brand-foreground border-brand'
                      : 'bg-background hover:bg-muted text-foreground border-border'
                  }`}
                >
                  Collector: Pune City Produce Collector
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('FARMER')}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                    role === 'FARMER'
                      ? 'bg-brand text-brand-foreground border-brand'
                      : 'bg-background hover:bg-muted text-foreground border-border'
                  }`}
                >
                  Farmer: Maharashtra Orange Farm
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Business / Hub Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Pune Fresh Logistics"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Operating City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Pune or Nashik"
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Node Role</label>
                  <input
                    type="text"
                    disabled
                    value={role}
                    className="w-full rounded-xl border border-border bg-muted px-4 py-2.5 text-sm font-semibold text-muted-foreground cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98230 11223"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinish}
                className="flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-brand-foreground shadow hover:opacity-95 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Registering Node...' : 'Complete Setup & Enter Platform'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
