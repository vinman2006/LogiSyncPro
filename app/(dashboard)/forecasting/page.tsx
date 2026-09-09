'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Calendar,
  Sparkles,
  BarChart3,
  ArrowUpRight,
  Package,
  Layers,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { PageHeader } from '@/components/layout/PageHeader';

const FORECAST_DATA = [
  { month: 'Jul', actual: 1200, forecast: 1180, festiveSurge: 1180 },
  { month: 'Aug', actual: 1450, forecast: 1400, festiveSurge: 1400 },
  { month: 'Sep', actual: 1680, forecast: 1650, festiveSurge: 1720 },
  { month: 'Oct (Diwali)', forecast: 2450, festiveSurge: 2850 },
  { month: 'Nov (Post-Festive)', forecast: 2100, festiveSurge: 2200 },
  { month: 'Dec', forecast: 1850, festiveSurge: 1900 },
];

export default function ForecastingPage() {
  const [selectedCommodity, setSelectedCommodity] = useState('Oranges');
  const [surgeMultiplier, setSurgeMultiplier] = useState(1.25);

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Predictive Demand Forecasting"
        description="Machine learning time-series models anticipating seasonal demand surges (Diwali, Weddings, Monsoons) to optimize procurement buffer"
        breadcrumbs={[{ label: 'Demand Forecasting' }]}
        showDemoBadge={true}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">Projected Festive Peak</span>
          <div className="text-2xl font-mono font-bold text-brand mt-1">+48.5%</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">October Diwali corridor rush</div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">Model Confidence</span>
          <div className="text-2xl font-mono font-bold text-emerald-600 mt-1">96.2%</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Trained on 3 years APMC data</div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">Recommended Buffer</span>
          <div className="text-2xl font-mono font-bold text-foreground mt-1">+3,200 kg</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Pre-ordered from Nashik farms</div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">Prevented Stockouts</span>
          <div className="text-2xl font-mono font-bold text-sky-600 mt-1">₹4.2L</div>
          <div className="text-[11px] text-sky-600 mt-0.5">Estimated lost sale avoidance</div>
        </div>
      </div>

      {/* Interactive Forecast Chart */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <h3 className="text-base font-bold text-foreground">
              Commodity Demand Curve: {selectedCommodity} (MT)
            </h3>
            <p className="text-xs text-muted-foreground">
              Solid line: Historical actual dispatches • Dashed line: AI predicted demand
            </p>
          </div>

          <div className="flex items-center gap-2">
            {['Oranges', 'Citrus / Grapes', 'Packaging Supplies'].map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCommodity(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCommodity === c
                    ? 'bg-brand text-brand-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={FORECAST_DATA}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="actual"
                name="Actual Recorded Volume (MT)"
                stroke="#EA580C"
                strokeWidth={3}
                dot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="forecast"
                name="AI Baseline Prediction (MT)"
                stroke="#3B82F6"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
              <Line
                type="monotone"
                dataKey="festiveSurge"
                name="Festive Surge Scenario (MT)"
                stroke="#10B981"
                strokeWidth={2}
                strokeDasharray="3 3"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
