'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Country, State, ICountry, IState } from 'country-state-city';
import {
  MapPin,
  CheckCircle2,
  ArrowRight,
  Search,
  Sparkles,
  ChevronDown,
  Building2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useNetwork } from '@/lib/context/NetworkContext';
import { resolveUserName } from '@/lib/utils/userName';

export function OnboardingScreen() {
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const { setCurrentNode, refreshShipments } = useNetwork();

  // Resolved user name: Firebase displayName or email prefix fallback (e.g. Vineet)
  const resolvedName = useMemo(() => {
    return resolveUserName(user?.displayName, user?.email);
  }, [user]);

  // Countries dataset
  const allCountries = useMemo(() => Country.getAllCountries(), []);

  // Form states - Default to India (IN)
  const [selectedCountry, setSelectedCountry] = useState<ICountry>(() => {
    const india = allCountries.find((c) => c.isoCode === 'IN');
    return india || allCountries[0];
  });
  const [countrySearch, setCountrySearch] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

  // Dropdown refs for click-outside closing
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const regionDropdownRef = useRef<HTMLDivElement>(null);

  // States/Regions dataset dynamically loaded for selected country
  const regionsForCountry = useMemo(() => {
    return State.getStatesOfCountry(selectedCountry.isoCode);
  }, [selectedCountry]);

  const [selectedRegion, setSelectedRegion] = useState<IState | null>(null);
  const [regionSearch, setRegionSearch] = useState('');
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(target)) {
        setIsCountryDropdownOpen(false);
      }
      if (regionDropdownRef.current && !regionDropdownRef.current.contains(target)) {
        setIsRegionDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Default region to Maharashtra if India, or first state in list
  useEffect(() => {
    const states = State.getStatesOfCountry(selectedCountry.isoCode);
    if (states.length > 0) {
      const maharashtra = states.find((s) => s.name.toLowerCase().includes('maharashtra'));
      setSelectedRegion(maharashtra || states[0]);
    } else {
      setSelectedRegion(null);
    }
  }, [selectedCountry]);

  // Role: Farmer | Distributor | Collector
  const [role, setRole] = useState<'DISTRIBUTOR' | 'COLLECTOR' | 'FARMER'>('DISTRIBUTOR');

  // Business Name
  const [businessName, setBusinessName] = useState('');

  // Flow & submission state
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Location & Role & Biz Name -> Step 2: Demo Initialization Option
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdNode, setCreatedNode] = useState<any>(null);

  // Filtered countries based on search input (India pinned first when not searching)
  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) {
      const india = allCountries.find((c) => c.isoCode === 'IN');
      const others = allCountries.filter((c) => c.isoCode !== 'IN');
      return india ? [india, ...others] : allCountries;
    }
    const q = countrySearch.toLowerCase();
    return allCountries.filter(
      (c) => c.name.toLowerCase().includes(q) || c.isoCode.toLowerCase().includes(q)
    );
  }, [allCountries, countrySearch]);

  // Filtered regions based on search input
  const filteredRegions = useMemo(() => {
    if (!regionSearch.trim()) return regionsForCountry;
    const q = regionSearch.toLowerCase();
    return regionsForCountry.filter(
      (r) => r.name.toLowerCase().includes(q) || r.isoCode.toLowerCase().includes(q)
    );
  }, [regionsForCountry, regionSearch]);

  // Submit Step 1: Save Onboarding Profile & Logistics Node to Neon
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      setError('Please enter your business name.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const regionName = selectedRegion?.name || selectedCountry.name;
      const regionCode = selectedRegion?.isoCode || selectedCountry.isoCode;

      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: user?.uid || `demo-uid-${Date.now()}`,
          email: user?.email || 'user@logisync.com',
          displayName: resolvedName,
          country: selectedCountry.name,
          countryCode: selectedCountry.isoCode,
          region: regionName,
          regionCode: regionCode,
          role,
          businessName: businessName.trim(),
          city: regionName,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to save onboarding');
      }

      setCreatedNode(data.node);
      setCurrentNode(data.node);
      await refreshProfile?.();

      // Move to prominent Demo Initialization step
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Onboarding error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2 Action A: Initialize Orange Demo (Idempotent)
  const handleInitializeDemo = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/demo/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: user?.uid || `demo-uid-${Date.now()}`,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to initialize demo');

      await refreshShipments();
      await refreshProfile?.();

      // Redirect to dashboard with query flag
      router.replace('/dashboard?demo=ready');
    } catch (err: any) {
      setError(err.message || 'Demo initialization failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2 Action B: Skip demo and go straight to live empty dashboard
  const handleSkipDemo = async () => {
    await refreshProfile?.();
    router.replace('/dashboard');
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-6 sm:py-8 px-4 animate-in fade-in duration-300">
      {/* Top Header branding */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-bold mb-3 border border-brand-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>One System. Every Move.</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
          Welcome to LogiSync, <span className="text-brand-600">{resolvedName}</span>
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 mt-2">
          Let&apos;s set up your logistics network and node profile.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Country, Region, Role, Business Name */}
      {step === 1 && (
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-xl">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* 1. Country Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                1. Choose your country
              </label>
              <div className="relative" ref={countryDropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsCountryDropdownOpen((prev) => !prev);
                    setIsRegionDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl border border-neutral-300 bg-white text-left text-sm font-semibold text-neutral-900 hover:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{selectedCountry.flag}</span>
                    <span>{selectedCountry.name}</span>
                    <span className="text-xs text-neutral-500 font-mono">({selectedCountry.isoCode})</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                </button>

                {isCountryDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl border border-neutral-200 bg-white shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-2.5 border-b border-neutral-200 bg-neutral-50">
                      <div className="relative">
                        <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
                        <input
                          type="text"
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          placeholder="Search countries..."
                          autoFocus
                          className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto divide-y divide-neutral-100 p-1 bg-white">
                      {filteredCountries.slice(0, 80).map((c) => (
                        <button
                          key={c.isoCode}
                          type="button"
                          onClick={() => {
                            setSelectedCountry(c);
                            setIsCountryDropdownOpen(false);
                            setCountrySearch('');
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs rounded-lg transition-colors ${
                            selectedCountry.isoCode === c.isoCode
                              ? 'bg-brand-50 text-brand-600 font-bold'
                              : 'hover:bg-neutral-100 text-neutral-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{c.flag}</span>
                            <span>{c.name}</span>
                          </div>
                          <span className="text-[10px] text-neutral-400 font-mono">{c.isoCode}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Region Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                2. Choose your region / state in {selectedCountry.name}
              </label>
              {regionsForCountry.length > 0 ? (
                <div className="relative" ref={regionDropdownRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegionDropdownOpen((prev) => !prev);
                      setIsCountryDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl border border-neutral-300 bg-white text-left text-sm font-semibold text-neutral-900 hover:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all shadow-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-brand-500" />
                      <span>{selectedRegion?.name || 'Select Region'}</span>
                      {selectedRegion?.isoCode && (
                        <span className="text-xs text-neutral-500 font-mono">
                          ({selectedRegion.isoCode})
                        </span>
                      )}
                    </div>
                    <ChevronDown className="w-4 h-4 text-neutral-400" />
                  </button>

                  {isRegionDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl border border-neutral-200 bg-white shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                      <div className="p-2.5 border-b border-neutral-200 bg-neutral-50">
                        <div className="relative">
                          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5 pointer-events-none" />
                          <input
                            type="text"
                            value={regionSearch}
                            onChange={(e) => setRegionSearch(e.target.value)}
                            placeholder="Search regions / states..."
                            autoFocus
                            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                          />
                        </div>
                      </div>
                      <div className="max-h-60 overflow-y-auto divide-y divide-neutral-100 p-1 bg-white">
                        {filteredRegions.map((r) => (
                          <button
                            key={r.isoCode}
                            type="button"
                            onClick={() => {
                              setSelectedRegion(r);
                              setIsRegionDropdownOpen(false);
                              setRegionSearch('');
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs rounded-lg transition-colors ${
                              selectedRegion?.isoCode === r.isoCode
                                ? 'bg-brand-50 text-brand-600 font-bold'
                                : 'hover:bg-neutral-100 text-neutral-800'
                            }`}
                          >
                            <span>{r.name}</span>
                            <span className="text-[10px] text-neutral-400 font-mono">{r.isoCode}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs text-neutral-500">
                  Direct national jurisdiction ({selectedCountry.name})
                </div>
              )}
            </div>

            {/* 3. Business Role */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                3. What is your role in the supply chain?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Farmer */}
                <button
                  type="button"
                  onClick={() => setRole('FARMER')}
                  className={`p-4 rounded-2xl border text-left transition-all relative ${
                    role === 'FARMER'
                      ? 'border-brand-500 bg-brand-50/70 ring-2 ring-brand-500 shadow-sm'
                      : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50/50'
                  }`}
                >
                  <div className="text-2xl mb-2">🌱</div>
                  <div className="font-bold text-neutral-900 text-sm">Farmer</div>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                    Produces agricultural goods at origin.
                  </p>
                  {role === 'FARMER' && (
                    <CheckCircle2 className="w-4 h-4 text-brand-600 absolute top-3 right-3" />
                  )}
                </button>

                {/* Distributor */}
                <button
                  type="button"
                  onClick={() => setRole('DISTRIBUTOR')}
                  className={`p-4 rounded-2xl border text-left transition-all relative ${
                    role === 'DISTRIBUTOR'
                      ? 'border-brand-500 bg-brand-50/70 ring-2 ring-brand-500 shadow-sm'
                      : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50/50'
                  }`}
                >
                  <div className="text-2xl mb-2">🚚</div>
                  <div className="font-bold text-neutral-900 text-sm">Distributor</div>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                    Moves goods from producers to destinations.
                  </p>
                  {role === 'DISTRIBUTOR' && (
                    <CheckCircle2 className="w-4 h-4 text-brand-600 absolute top-3 right-3" />
                  )}
                </button>

                {/* Collector */}
                <button
                  type="button"
                  onClick={() => setRole('COLLECTOR')}
                  className={`p-4 rounded-2xl border text-left transition-all relative ${
                    role === 'COLLECTOR'
                      ? 'border-brand-500 bg-brand-50/70 ring-2 ring-brand-500 shadow-sm'
                      : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50/50'
                  }`}
                >
                  <div className="text-2xl mb-2">📦</div>
                  <div className="font-bold text-neutral-900 text-sm">Collector</div>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                    Receives goods at the urban destination.
                  </p>
                  {role === 'COLLECTOR' && (
                    <CheckCircle2 className="w-4 h-4 text-brand-600 absolute top-3 right-3" />
                  )}
                </button>
              </div>
            </div>

            {/* 4. Business Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                4. Business name
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder={`e.g. ${resolvedName} Fresh Logistics`}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-xs"
                />
              </div>
            </div>

            {/* Continue Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-600 py-3.5 text-sm font-bold text-white shadow-md hover:shadow-lg disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <span>Next: Initialize Logistics Network</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 2: Demo Initialization Screen */}
      {step === 2 && (
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-xl animate-in zoom-in-95 duration-200">
          <div className="text-center mb-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900">Your Logistics Node is Ready</h2>
            <p className="text-xs text-neutral-600 mt-1">
              Registered as <strong>{createdNode?.name || businessName}</strong> ({role}) in{' '}
              {selectedRegion?.name || selectedCountry.name}.
            </p>
          </div>

          {/* Prominent Orange Supply Chain Demo Card */}
          <div className="rounded-2xl border-2 border-brand-500/30 bg-gradient-to-b from-brand-50/80 to-white p-6 mb-6">
            <div className="flex items-center gap-2 text-brand-600 font-bold text-xs uppercase tracking-wider mb-2">
              <span>🍊 Orange Supply Chain Pilot</span>
              <span className="px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 text-[10px]">RECOMMENDED</span>
            </div>

            <h3 className="text-lg font-bold text-neutral-900">
              Ready to explore LogiSync? Initialize Demo
            </h3>
            <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
              Experience a live multi-participant supply chain transaction using fresh oranges. Real database records
              will be created for this workflow.
            </p>

            {/* Visual Flow Topology */}
            <div className="my-5 py-4 px-4 rounded-xl bg-white border border-neutral-200 flex items-center justify-between text-center text-xs font-semibold shadow-xs">
              <div className="flex flex-col items-center">
                <span className="text-lg mb-1">🌱</span>
                <span className="text-[11px] text-neutral-900 font-bold">Farmer</span>
                <span className="text-[10px] text-neutral-500">Nashik</span>
              </div>
              <ArrowRight className="w-4 h-4 text-brand-500" />
              <div className="flex flex-col items-center">
                <span className="text-lg mb-1">🚚</span>
                <span className="text-[11px] text-brand-600 font-bold">
                  {role === 'DISTRIBUTOR' ? 'You (Distributor)' : 'Distributor'}
                </span>
                <span className="text-[10px] text-neutral-500">Transit</span>
              </div>
              <ArrowRight className="w-4 h-4 text-brand-500" />
              <div className="flex flex-col items-center">
                <span className="text-lg mb-1">📦</span>
                <span className="text-[11px] text-neutral-900 font-bold">
                  {role === 'COLLECTOR' ? 'You (Collector)' : 'Collector'}
                </span>
                <span className="text-[10px] text-neutral-500">Pune</span>
              </div>
            </div>

            {/* Personalized Role Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs border-t border-neutral-200 pt-4 text-left">
              <div>
                <span className="text-neutral-500 text-[10px]">Your Role:</span>
                <div className="font-bold text-neutral-900">{role}</div>
              </div>
              <div>
                <span className="text-neutral-500 text-[10px]">Commodity:</span>
                <div className="font-bold text-neutral-900">Oranges</div>
              </div>
              <div>
                <span className="text-neutral-500 text-[10px]">Quantity:</span>
                <div className="font-bold text-neutral-900">1,000 kg</div>
              </div>
              <div>
                <span className="text-neutral-500 text-[10px]">Corridor:</span>
                <div className="font-bold text-neutral-900">Maharashtra → Pune</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleInitializeDemo}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-600 py-4 text-sm font-bold text-white shadow-lg hover:shadow-xl disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Initializing Orange Supply Chain Demo...</span>
                </>
              ) : (
                <>
                  <span>Initialize Orange Demo →</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSkipDemo}
              className="w-full py-2.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
            >
              Skip for now → (Open clean dashboard)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
