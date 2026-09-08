'use client';

import React from 'react';
import {
  X,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Clock,
  Tag,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { AlertItem } from '@/lib/mock-data/types';
import { useLogistics } from '@/lib/context/LogisticsContext';

interface AlertDetailModalProps {
  alert: AlertItem | null;
  onClose: () => void;
}

export function AlertDetailModal({ alert, onClose }: AlertDetailModalProps) {
  const { resolveAlert, markAlertAsRead } = useLogistics();

  if (!alert) return null;

  const isCritical = alert.severity === 'critical';
  const isWarning = alert.severity === 'warning';

  const SeverityIcon = isCritical
    ? AlertCircle
    : isWarning
    ? AlertTriangle
    : ShieldCheck;

  // Generate contextual AI mitigation recommendation
  const getAiRecommendation = () => {
    if (alert.entityTag.includes('MH-12')) {
      return {
        actionText: 'Apply SH-119 Alternate Detour',
        note: 'AI Detour via SH-119 accepted. Recalibrated ETA saves ~32 mins.',
        details: 'Traffic model predicts NH-48 bottleneck will clear in 85 mins. Detour bypasses Khed-Shivapur toll with +₹280 fuel cost but protects customer SLA.',
      };
    }
    if (alert.entityTag.includes('DL-01')) {
      return {
        actionText: 'Dispatch High-Priority Driver SMS/WhatsApp',
        note: 'Cold-chain alert dispatched to driver & Bhiwandi cold storage depot.',
        details: 'Trigger emergency compressor auxiliary power check. Threshold 4°C breached by +3.8°C.',
      };
    }
    if (alert.entityTag.includes('SKU')) {
      return {
        actionText: 'Generate Auto-Reorder PO (WhatsApp)',
        note: 'Purchase Order generated and sent to BoxCraft Packaging Pvt Ltd.',
        details: 'Current inventory: 140 units. Lead time is 48 hours. Auto-drafted order for 500 units at contracted ₹42/unit.',
      };
    }
    if (alert.entityTag.includes('KA-04')) {
      return {
        actionText: 'Send Ignition Cutoff Reminder',
        note: 'Driver alerted via automated voice call to turn off engine while idling.',
        details: 'Vehicle idling for 115+ minutes with AC on. Estimated fuel waste: 3.2 Liters diesel (~₹290).',
      };
    }
    return {
      actionText: 'Acknowledge & Archive Audit Trail',
      note: 'Blockchain cryptographic proof archived to compliance records.',
      details: 'All smart-contract signatures verified by JNPT Port customs node.',
    };
  };

  const aiRec = getAiRecommendation();

  const handleApplyAiAction = () => {
    resolveAlert(alert.id, aiRec.note);
    onClose();
  };

  const handleAcknowledgeOnly = () => {
    markAlertAsRead(alert.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white border border-border rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-5 border-b border-border bg-neutral-50/50">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'p-2 rounded-xl border mt-0.5',
                isCritical && 'bg-critical-50 text-critical-600 border-critical-600/20',
                isWarning && 'bg-warning-50 text-warning-600 border-warning-600/20',
                !isCritical && !isWarning && 'bg-info-50 text-info-600 border-info-600/20'
              )}
            >
              <SeverityIcon className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={cn(
                    'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border',
                    isCritical && 'bg-critical-50 text-critical-600 border-critical-600/30',
                    isWarning && 'bg-warning-50 text-warning-600 border-warning-600/30',
                    !isCritical && !isWarning && 'bg-info-50 text-info-600 border-info-600/30'
                  )}
                >
                  {alert.severity} SLA Event
                </span>
                <span className="text-xs text-neutral-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {alert.relativeTime}
                </span>
              </div>

              <h2 className="text-base font-heading font-bold text-neutral-900 leading-snug">
                {alert.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Entity & Status Info Strip */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200/70 text-xs">
            <div className="flex items-center gap-2 text-neutral-600">
              <Tag className="w-3.5 h-3.5 text-neutral-400" />
              <span>Target Asset:</span>
              <span className="font-mono font-semibold text-neutral-900">
                {alert.entityTag}
              </span>
            </div>

            <div className="flex items-center gap-1.5 font-medium">
              <span
                className={cn(
                  'w-2 h-2 rounded-full',
                  alert.isRead ? 'bg-success-600' : 'bg-critical-600 animate-pulse'
                )}
              />
              <span className={alert.isRead ? 'text-success-600' : 'text-neutral-700'}>
                {alert.isRead ? 'Resolved' : 'Active Exception'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
              Incident Description
            </div>
            <p className="text-sm text-neutral-700 bg-neutral-50/60 p-3 rounded-lg border border-neutral-200/50 leading-relaxed">
              {alert.message}
            </p>
          </div>

          {/* AI Recommended Mitigation Box */}
          <div className="p-4 rounded-xl border border-brand-500/30 bg-brand-50/50 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-brand-500 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-heading font-bold text-neutral-900">
                AI Recommended Resolution
              </span>
            </div>

            <p className="text-xs text-neutral-700 leading-relaxed pl-8">
              {aiRec.details}
            </p>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-4 border-t border-border bg-neutral-50/50">
          {alert.actionUrl && (
            <Link
              href={alert.actionUrl}
              onClick={onClose}
              className="inline-flex items-center gap-1 text-xs font-medium text-neutral-600 hover:text-brand-600 transition-colors"
            >
              <span>Inspect in Module</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleAcknowledgeOnly}
              className="px-3 py-2 text-xs font-medium text-neutral-700 bg-white border border-border rounded-lg hover:bg-neutral-50 transition-colors"
            >
              Acknowledge
            </button>

            <button
              type="button"
              onClick={handleApplyAiAction}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-lg shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{aiRec.actionText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
