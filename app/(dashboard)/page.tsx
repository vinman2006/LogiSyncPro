'use client';

import React from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { KpiCard } from '@/components/shared/KpiCard';
import { WeeklyVolumeChart } from '@/components/dashboard/WeeklyVolumeChart';
import { LiveMapPreviewCard } from '@/components/dashboard/LiveMapPreviewCard';
import { RecentAlertsFeed } from '@/components/dashboard/RecentAlertsFeed';
import { DateRangeDropdown } from '@/components/dashboard/DateRangeDropdown';
import { useLogistics } from '@/lib/context/LogisticsContext';

export default function DashboardOverviewPage() {
  const { kpis, isRefreshing, refreshTelemetry, exportCsvReport, lastRefreshedTime } =
    useLogistics();

  return (
    <div className="space-y-6">
      {/* Dashboard Page Header */}
      <PageHeader
        title="Operations Overview"
        description="Unified real-time logistics telemetry, SLA adherence, and freight operations"
        breadcrumbs={[{ label: 'Overview' }]}
        showDemoBadge={true}
        actions={
          <>
            {/* Interactive Reporting Period Filter */}
            <DateRangeDropdown />

            {/* Refresh Telemetry Action */}
            <button
              type="button"
              onClick={refreshTelemetry}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-white border border-border rounded-lg hover:bg-neutral-50 shadow-xs transition-colors disabled:opacity-60"
              title={`Last updated: ${lastRefreshedTime}. Click to re-sync.`}
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-neutral-500 ${
                  isRefreshing ? 'animate-spin text-brand-600' : ''
                }`}
              />
              <span className="hidden sm:inline">
                {isRefreshing ? 'Syncing...' : 'Refresh'}
              </span>
            </button>

            {/* Real CSV Export Action */}
            <button
              type="button"
              onClick={exportCsvReport}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-lg shadow-xs transition-colors"
              title="Download full CSV report of KPIs, volume, and active exceptions"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </>
        }
      />

      {/* 1. Hero KPI Cards Row (5 Cards) */}
      <section aria-label="Key Performance Indicators">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {kpis.map((metric) => (
            <KpiCard key={metric.id} metric={metric} />
          ))}
        </div>
      </section>

      {/* 2. Middle Row: Live Map Teaser (Left) + Recharts Volume (Right) */}
      <section
        aria-label="Corridor Telemetry and Volume"
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        <div className="lg:col-span-6 xl:col-span-5">
          <LiveMapPreviewCard />
        </div>
        <div className="lg:col-span-6 xl:col-span-7">
          <WeeklyVolumeChart />
        </div>
      </section>

      {/* 3. Bottom Row: Recent Operational Alerts Feed */}
      <section aria-label="Recent Operational Alerts">
        <RecentAlertsFeed />
      </section>
    </div>
  );
}
