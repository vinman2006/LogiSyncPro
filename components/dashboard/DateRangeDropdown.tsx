'use client';

import React, { useState } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';
import { useLogistics, DateRangeKey } from '@/lib/context/LogisticsContext';

interface DateOption {
  key: DateRangeKey;
  label: string;
  subtitle: string;
}

const DATE_OPTIONS: DateOption[] = [
  {
    key: 'today',
    label: 'Today (Live)',
    subtitle: 'Real-time 24h dispatches & current corridors',
  },
  {
    key: 'this-week',
    label: 'This Week',
    subtitle: 'Current operating week (Mon–Sun)',
  },
  {
    key: 'september-2026',
    label: 'September 2026',
    subtitle: 'Fiscal Q3 month-to-date performance',
  },
  {
    key: 'last-30-days',
    label: 'Last 30 Days',
    subtitle: 'Trailing 30-day aggregate logistics KPIs',
  },
];

export function DateRangeDropdown() {
  const { dateRange, dateRangeLabel, changeDateRange } = useLogistics();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-white border border-border rounded-lg hover:bg-neutral-50 shadow-xs transition-colors"
        title="Select Reporting Period"
      >
        <Calendar className="w-3.5 h-3.5 text-neutral-500" />
        <span>{dateRangeLabel}</span>
        <ChevronDown className="w-3 h-3 text-neutral-400" />
      </button>

      {isOpen && (
        <div
          className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-64 bg-white border border-border rounded-xl shadow-md py-1.5 z-40 animate-in fade-in slide-in-from-top-1"
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="px-3 py-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider border-b border-neutral-100">
            Reporting Timeframe
          </div>

          {DATE_OPTIONS.map((option) => {
            const isSelected = dateRange === option.key;

            return (
              <button
                key={option.key}
                type="button"
                onClick={() => {
                  changeDateRange(option.key, option.label);
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-neutral-50 text-xs transition-colors"
              >
                <div>
                  <div className="font-medium text-neutral-800">{option.label}</div>
                  <div className="text-[11px] text-neutral-500">{option.subtitle}</div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-brand-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
