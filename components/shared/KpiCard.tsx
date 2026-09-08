import React from 'react';
import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KpiMetric, MetricAccent } from '@/lib/mock-data/types';

interface KpiCardProps {
  metric: KpiMetric;
  className?: string;
}

const ACCENT_STYLES: Record<
  MetricAccent,
  {
    borderLeft: string;
    trendBg: string;
    trendText: string;
    dotBg: string;
  }
> = {
  success: {
    borderLeft: 'border-l-success-600',
    trendBg: 'bg-success-50',
    trendText: 'text-success-600',
    dotBg: 'bg-success-600',
  },
  brand: {
    borderLeft: 'border-l-brand-600',
    trendBg: 'bg-brand-50',
    trendText: 'text-brand-600',
    dotBg: 'bg-brand-600',
  },
  info: {
    borderLeft: 'border-l-info-600',
    trendBg: 'bg-info-50',
    trendText: 'text-info-600',
    dotBg: 'bg-info-600',
  },
  warning: {
    borderLeft: 'border-l-warning-600',
    trendBg: 'bg-warning-50',
    trendText: 'text-warning-600',
    dotBg: 'bg-warning-600',
  },
  critical: {
    borderLeft: 'border-l-critical-600',
    trendBg: 'bg-critical-50',
    trendText: 'text-critical-600',
    dotBg: 'bg-critical-600',
  },
};

export function KpiCard({ metric, className }: KpiCardProps) {
  const accent = ACCENT_STYLES[metric.accent] || ACCENT_STYLES.info;
  const isUp = metric.trendDirection === 'up';
  const TrendIcon = isUp ? TrendingUp : TrendingDown;

  return (
    <div
      className={cn(
        'relative bg-white rounded-xl border border-border border-l-4 p-5 shadow-sm transition-all duration-200 hover:shadow-md flex flex-col justify-between',
        accent.borderLeft,
        metric.isHero && 'ring-1 ring-neutral-200/70',
        className
      )}
    >
      <div>
        {/* Card Header: Label & Trend Indicator */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-xs font-medium text-neutral-600 tracking-wide uppercase">
            {metric.label}
          </span>
          
          {/* Trend Pill with icon and text */}
          <div
            className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold tabular-nums select-none',
              accent.trendBg,
              accent.trendText
            )}
            title={`${metric.trendValue} ${metric.trendPeriod}`}
          >
            <TrendIcon className="w-3 h-3" strokeWidth={2.5} />
            <span>{metric.trendValue}</span>
          </div>
        </div>

        {/* Big Value Display */}
        <div className="flex items-baseline gap-2 mt-1">
          <span
            className={cn(
              'font-heading font-bold tracking-tight text-neutral-900 tabular-nums',
              metric.isHero ? 'text-3xl lg:text-[32px]' : 'text-2xl lg:text-3xl'
            )}
          >
            {metric.value}
          </span>
          {metric.unit && metric.unit !== '%' && metric.unit !== 'INR' && (
            <span className="text-sm font-medium text-neutral-500">
              {metric.unit}
            </span>
          )}
        </div>
      </div>

      {/* Subtext and Context Details */}
      <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
        <span className="truncate" title={metric.subtext}>
          {metric.subtext}
        </span>
        {metric.accent === 'brand' && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded ml-2 shrink-0">
            <Sparkles className="w-3 h-3" />
            AI Boost
          </span>
        )}
      </div>
    </div>
  );
}
