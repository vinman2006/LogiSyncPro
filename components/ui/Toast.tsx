'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  variant?: 'success' | 'critical' | 'info' | 'warning';
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.variant === 'success' || !toast.variant;
        const isCritical = toast.variant === 'critical';
        const isWarning = toast.variant === 'warning';
        const isInfo = toast.variant === 'info';

        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border bg-white shadow-lg transition-all transform animate-in slide-in-from-bottom-2 duration-200',
              isSuccess && 'border-success-600/30 text-neutral-900',
              isCritical && 'border-critical-600/30 text-neutral-900',
              isWarning && 'border-warning-600/30 text-neutral-900',
              isInfo && 'border-info-600/30 text-neutral-900'
            )}
          >
            {/* Semantic Icon */}
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-success-600" />}
              {isCritical && <AlertCircle className="w-4 h-4 text-critical-600" />}
              {isWarning && <AlertCircle className="w-4 h-4 text-warning-600" />}
              {isInfo && <Info className="w-4 h-4 text-info-600" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-heading font-bold text-neutral-900 leading-snug">
                {toast.title}
              </div>
              {toast.message && (
                <div className="text-[11px] text-neutral-600 mt-0.5 leading-relaxed">
                  {toast.message}
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="p-1 -mr-1 -mt-1 text-neutral-400 hover:text-neutral-700 rounded-md transition-colors shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
