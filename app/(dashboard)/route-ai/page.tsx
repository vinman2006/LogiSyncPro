'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  MapPin,
  ArrowRight,
  TrendingDown,
  Clock,
  IndianRupee,
  Navigation,
  CheckCircle2,
  Send,
  Zap,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useLogistics } from '@/lib/context/LogisticsContext';

interface RouteOption {
  id: string;
  name: string;
  distanceKm: number;
  durationHours: number;
  tollCostInr: number;
  fuelLitres: number;
  fuelCostInr: number;
  totalCostInr: number;
  savingsVsStandardInr: number;
  slaRisk: 'Low' | 'Moderate' | 'High';
  recommended: boolean;
  highlights: string[];
}

const CORRIDOR_ROUTES: RouteOption[] = [
  {
    id: 'rt-ai-opt',
    name: 'AI Optimized: NH-60 + Samruddhi Mahamarg Bypass',
    distanceKm: 218,
    durationHours: 4.2,
    tollCostInr: 580,
    fuelLitres: 48,
    fuelCostInr: 4320,
    totalCostInr: 4900,
    savingsVsStandardInr: 2150,
    slaRisk: 'Low',
    recommended: true,
    highlights: [
      'Bypasses Khed-Shivapur toll bottleneck (saves ~45m)',
      'Smooth 6-lane surface reduces tyre wear by 22%',
      'Grade-A cold-chain priority lanes at toll gates',
    ],
  },
  {
    id: 'rt-traditional',
    name: 'Standard Route: NH-48 Express Corridor',
    distanceKm: 245,
    durationHours: 5.6,
    tollCostInr: 850,
    fuelLitres: 69,
    fuelCostInr: 6200,
    totalCostInr: 7050,
    savingsVsStandardInr: 0,
    slaRisk: 'Moderate',
    recommended: false,
    highlights: [
      'Heavy freight traffic during peak hours (18:00 - 21:00)',
      '3 mandatory weighbridges with queue delays',
    ],
  },
  {
    id: 'rt-scenic',
    name: 'State Highway 119 Rural Transit',
    distanceKm: 202,
    durationHours: 6.1,
    tollCostInr: 120,
    fuelLitres: 62,
    fuelCostInr: 5580,
    totalCostInr: 5700,
    savingsVsStandardInr: 1350,
    slaRisk: 'High',
    recommended: false,
    highlights: [
      'Zero commercial highway tolls',
      'Narrow 2-lane sections unsuitable for heavy multi-axle trailers',
    ],
  },
];

export default function RouteAiPage() {
  const { showToast } = useLogistics();
  const [selectedRoute, setSelectedRoute] = useState<string>('rt-ai-opt');
  const [origin, setOrigin] = useState('Nashik Agri Produce Hub');
  const [destination, setDestination] = useState('Pune Market Yard Terminal #4');
  const [isSolving, setIsSolving] = useState(false);
  const [routes, setRoutes] = useState<RouteOption[]>(CORRIDOR_ROUTES);

  const handleSolveRoute = () => {
    setIsSolving(true);
    setTimeout(() => {
      setIsSolving(false);
      showToast(
        'Corridor Solution Calculated',
        'Solved optimal route via Samruddhi Mahamarg bypass. Saved ₹2,150 & 1h 24m.',
        'success'
      );
    }, 600);
  };

  const handleDispatchDriver = (route: RouteOption) => {
    showToast(
      'Route Dispatched via WhatsApp',
      `Sent GPS waypoint navigation link to driver mobile for ${route.name}.`,
      'success'
    );
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="AI Corridor & Route Solver"
        description="Machine-learning route optimization cutting fuel expenses, toll queues, and transit bottleneck delays for Indian highway corridors"
        breadcrumbs={[{ label: 'Route AI' }]}
        showDemoBadge={true}
      />

      {/* Corridor Search Bar */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full relative">
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Pickup Origin
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-brand absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full h-10 pl-9 pr-3 text-xs font-semibold rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
          </div>

          <div className="hidden sm:flex items-center justify-center p-2 rounded-full bg-muted mt-5">
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </div>

          <div className="flex-1 w-full relative">
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Destination Terminal
            </label>
            <div className="relative">
              <Navigation className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full h-10 pl-9 pr-3 text-xs font-semibold rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
          </div>

          <div className="w-full sm:w-auto mt-0 sm:mt-5">
            <button
              type="button"
              onClick={handleSolveRoute}
              disabled={isSolving}
              className="w-full sm:w-auto flex items-center justify-center gap-2 h-10 px-6 rounded-xl bg-brand text-brand-foreground text-xs font-bold shadow hover:opacity-95 transition-all cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 ${isSolving ? 'animate-spin' : ''}`} />
              <span>{isSolving ? 'Solving Corridors...' : 'Optimize Corridor'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Suggested Routes Comparison */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-foreground">Calculated Corridors for Consignment</h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {routes.map((rt) => {
            const isSelected = selectedRoute === rt.id;
            return (
              <div
                key={rt.id}
                onClick={() => setSelectedRoute(rt.id)}
                className={`flex flex-col justify-between rounded-2xl border p-5 transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-brand bg-brand/5 ring-2 ring-brand/30 shadow-md'
                    : 'border-border bg-card hover:border-brand/40 shadow-sm'
                }`}
              >
                <div>
                  {rt.recommended && (
                    <div className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-brand text-brand-foreground mb-3">
                      <Zap className="w-3 h-3" /> AI RECOMMENDED CORRIDOR
                    </div>
                  )}

                  <h4 className="font-bold text-foreground text-sm leading-snug">{rt.name}</h4>

                  {/* Specs Grid */}
                  <div className="grid grid-cols-3 gap-2 my-4 text-center">
                    <div className="p-2.5 rounded-xl bg-muted/40 border border-border">
                      <div className="text-muted-foreground text-[10px] uppercase">Duration</div>
                      <div className="font-mono font-bold text-foreground text-sm mt-0.5">
                        {rt.durationHours} hrs
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-muted/40 border border-border">
                      <div className="text-muted-foreground text-[10px] uppercase">Distance</div>
                      <div className="font-mono font-bold text-foreground text-sm mt-0.5">
                        {rt.distanceKm} km
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-muted/40 border border-border">
                      <div className="text-muted-foreground text-[10px] uppercase">Total Cost</div>
                      <div className="font-mono font-bold text-foreground text-sm mt-0.5">
                        ₹{rt.totalCostInr}
                      </div>
                    </div>
                  </div>

                  {/* Cost breakdown */}
                  <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border pt-3">
                    <div className="flex justify-between">
                      <span>FASTag Tolls:</span>
                      <span className="font-mono font-semibold text-foreground">₹{rt.tollCostInr}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Diesel Fuel ({rt.fuelLitres} L):</span>
                      <span className="font-mono font-semibold text-foreground">₹{rt.fuelCostInr}</span>
                    </div>
                    {rt.savingsVsStandardInr > 0 && (
                      <div className="flex justify-between text-emerald-600 font-bold pt-1 border-t border-border/50">
                        <span>Net Savings:</span>
                        <span className="font-mono">Save ₹{rt.savingsVsStandardInr}</span>
                      </div>
                    )}
                  </div>

                  {/* Highlights */}
                  <ul className="mt-4 space-y-1 text-[11px] text-neutral-600 dark:text-neutral-400">
                    {rt.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDispatchDriver(rt);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand text-brand-foreground text-xs font-semibold shadow hover:opacity-95 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" /> Dispatch Route to Driver
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
