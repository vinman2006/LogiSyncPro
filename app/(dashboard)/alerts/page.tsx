'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Filter,
  Search,
  ExternalLink,
  RotateCw,
  Send,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useLogistics } from '@/lib/context/LogisticsContext';
import { MOCK_DATA_ALERTS } from '@/lib/mock-data/dashboard';
import { AlertItem } from '@/lib/mock-data/types';

export default function AlertsPage() {
  const { showToast } = useLogistics();
  const [alerts, setAlerts] = useState<AlertItem[]>(MOCK_DATA_ALERTS);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAcknowledge = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isRead: true } : a))
    );
    showToast('Exception Acknowledged', 'Dispatched status update to ops center.', 'info');
  };

  const handleMitigate = (alert: AlertItem) => {
    showToast(
      'Mitigation Dispatched via WhatsApp',
      `Sent automated re-routing protocol for ${alert.entityTag} to operations coordinator.`,
      'success'
    );
  };

  const filtered = alerts.filter((a) => {
    if (filterSeverity !== 'ALL' && a.severity !== filterSeverity) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.title.toLowerCase().includes(q) ||
      a.message.toLowerCase().includes(q) ||
      a.entityTag.toLowerCase().includes(q)
    );
  });

  const criticalCount = alerts.filter((a) => a.severity === 'critical' && !a.isRead).length;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Exception & Alert Operations Center"
        description="Priority dispatch incident inbox with SLA breach tracking, automated WhatsApp incident escalation, and route detours"
        breadcrumbs={[{ label: 'Alert Center' }]}
        showDemoBadge={true}
      />

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl border border-red-500/30 bg-red-50/40 dark:bg-red-950/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-600">Critical SLA Alerts</span>
            {criticalCount > 0 && <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />}
          </div>
          <div className="text-2xl font-mono font-bold text-red-600 mt-1">{criticalCount} Open</div>
          <div className="text-[11px] text-red-700/80 mt-0.5">Requires ops resolution</div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">Average Resolution Time</span>
          <div className="text-2xl font-mono font-bold text-foreground mt-1">18 mins</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Within 30 min SLA limit</div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">Corridor Delays Flagged</span>
          <div className="text-2xl font-mono font-bold text-amber-600 mt-1">2 Corridors</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">NH-48 & Pune Highway</div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">Automated Mitigations</span>
          <div className="text-2xl font-mono font-bold text-emerald-600 mt-1">94%</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">AI detour recommendations</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'critical', 'warning', 'info'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold capitalize transition-all ${
                filterSeverity === sev
                  ? 'bg-brand text-brand-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {sev === 'ALL' ? 'All Incidents' : sev}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search incident, truck (MH-12)..."
            className="w-full h-9 pl-9 pr-3 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filtered.map((alert) => {
          const isCritical = alert.severity === 'critical';
          const isWarning = alert.severity === 'warning';
          return (
            <div
              key={alert.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border transition-all gap-4 ${
                !alert.isRead
                  ? isCritical
                    ? 'border-red-500/40 bg-red-50/20'
                    : isWarning
                    ? 'border-amber-500/40 bg-amber-50/20'
                    : 'border-brand/40 bg-brand/5'
                  : 'border-border bg-card'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    isCritical
                      ? 'bg-red-500/10 text-red-600'
                      : isWarning
                      ? 'bg-amber-500/10 text-amber-600'
                      : 'bg-brand/10 text-brand'
                  }`}
                >
                  {isCritical ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : isWarning ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <Info className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-foreground text-sm">{alert.title}</h4>
                    <span className="font-mono text-[11px] font-semibold text-muted-foreground px-2 py-0.5 rounded bg-muted">
                      {alert.entityTag}
                    </span>
                    {!alert.isRead && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-500 text-white">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-2xl">
                    {alert.message}
                  </p>
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    Reported {alert.relativeTime}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {!alert.isRead && (
                  <button
                    type="button"
                    onClick={() => handleAcknowledge(alert.id)}
                    className="px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    Acknowledge
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleMitigate(alert)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand text-brand-foreground text-xs font-semibold shadow hover:opacity-95 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send WhatsApp Alert</span>
                </button>

                {alert.actionUrl && (
                  <Link
                    href={alert.actionUrl}
                    className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="View related asset"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
