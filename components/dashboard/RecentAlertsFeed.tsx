'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  ChevronRight,
  CheckCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AlertItem, AlertSeverity } from '@/lib/mock-data/types';
import { useLogistics } from '@/lib/context/LogisticsContext';
import { AlertDetailModal } from '@/components/dashboard/AlertDetailModal';

export function RecentAlertsFeed() {
  const { alerts, markAllAlertsAsRead } = useLogistics();
  const [filter, setFilter] = useState<'all' | AlertSeverity>('all');
  const [inspectAlert, setInspectAlert] = useState<AlertItem | null>(null);

  const filteredAlerts =
    filter === 'all'
      ? alerts
      : alerts.filter((item) => item.severity === filter);

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  const getSeverityConfig = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return {
          stripColor: 'bg-critical-600',
          textColor: 'text-critical-600',
          bgBadge: 'bg-critical-50 text-critical-600 border-critical-600/20',
          icon: AlertCircle,
          label: 'Critical SLA',
        };
      case 'warning':
        return {
          stripColor: 'bg-warning-600',
          textColor: 'text-warning-600',
          bgBadge: 'bg-warning-50 text-warning-600 border-warning-600/20',
          icon: AlertTriangle,
          label: 'Warning',
        };
      case 'info':
      default:
        return {
          stripColor: 'bg-info-600',
          textColor: 'text-info-600',
          bgBadge: 'bg-info-50 text-info-600 border-info-600/20',
          icon: ShieldCheck,
          label: 'Notice',
        };
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
        {/* Feed Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-heading font-bold text-neutral-900">
                Recent Operational Alerts
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 tabular-nums">
                {unreadCount} Unresolved
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Real-time corridor exceptions, cold-chain breaches, and inventory thresholds
            </p>
          </div>

          {/* Severity Filter Controls & Mark All Read */}
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-border p-0.5 bg-neutral-50 text-xs">
              {(['all', 'critical', 'warning', 'info'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFilter(type)}
                  className={cn(
                    'px-2.5 py-1 rounded-md font-medium capitalize transition-colors',
                    filter === type
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-800'
                  )}
                >
                  {type}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={markAllAlertsAsRead}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-50 hover:bg-neutral-100 border border-border rounded-lg transition-colors"
              title="Mark all alerts as read"
            >
              <CheckCheck className="w-3.5 h-3.5 text-neutral-500" />
              <span className="hidden sm:inline">Mark all read</span>
            </button>
          </div>
        </div>

        {/* Alert Items List */}
        <div className="divide-y divide-neutral-100 mt-1">
          {filteredAlerts.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-400">
              No alerts found for selected severity filter.
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const config = getSeverityConfig(alert.severity);
              const Icon = config.icon;

              return (
                <div
                  key={alert.id}
                  className={cn(
                    'relative flex items-start justify-between gap-4 py-3.5 pl-4 pr-3 hover:bg-neutral-50/80 rounded-lg transition-colors group cursor-pointer',
                    !alert.isRead && 'bg-neutral-50/40'
                  )}
                  onClick={() => setInspectAlert(alert)}
                >
                  {/* Severity Left Color Strip */}
                  <span
                    className={cn(
                      'absolute left-0 top-3 bottom-3 w-1 rounded-full',
                      config.stripColor
                    )}
                  />

                  {/* Main Alert Content */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div
                      className={cn(
                        'p-1.5 rounded-lg shrink-0 mt-0.5 border',
                        config.bgBadge
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-neutral-900">
                          {alert.title}
                        </span>
                        <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
                          {alert.entityTag}
                        </span>
                        {!alert.isRead && (
                          <span
                            className="w-2 h-2 rounded-full bg-critical-600 shrink-0"
                            title="Unresolved exception"
                          />
                        )}
                      </div>

                      <p className="text-xs text-neutral-600 leading-relaxed">
                        {alert.message}
                      </p>
                    </div>
                  </div>

                  {/* Time & Inspect Action */}
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                    <span className="text-xs text-neutral-400 tabular-nums">
                      {alert.relativeTime}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectAlert(alert);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-medium text-neutral-600 hover:text-brand-600 px-2.5 py-1 rounded-lg bg-white border border-border shadow-xs hover:border-brand-500/30 transition-colors"
                    >
                      <span>Inspect</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Feed Footer */}
        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span>Displaying active operational exception stream</span>
          <Link
            href="/alerts"
            className="font-medium text-brand-600 hover:underline inline-flex items-center gap-1"
          >
            View Full Alert Center
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Alert Inspection & AI Resolution Modal */}
      <AlertDetailModal
        alert={inspectAlert}
        onClose={() => setInspectAlert(null)}
      />
    </>
  );
}
