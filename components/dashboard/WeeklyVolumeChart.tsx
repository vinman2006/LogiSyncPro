'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOCK_DATA_WEEKLY_VOLUME } from '@/lib/mock-data/dashboard';
import { WeeklyVolumePoint } from '@/lib/mock-data/types';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: WeeklyVolumePoint }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-border rounded-lg shadow-md p-3 text-xs min-w-[190px]">
        <div className="font-heading font-bold text-neutral-900 mb-1.5 pb-1 border-b border-neutral-100 flex items-center justify-between">
          <span>{data.fullDay}</span>
          <span className="text-[10px] font-medium text-neutral-400">Weekly Route</span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4 text-neutral-600">
            <span>Dispatches:</span>
            <span className="font-semibold text-neutral-900 tabular-nums">
              {data.volume} shipments
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 text-success-600">
            <span>On-Time SLA:</span>
            <span className="font-semibold tabular-nums">
              {data.onTimeDeliveries} ({data.onTimeRate}%)
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 text-warning-600">
            <span>Delayed:</span>
            <span className="font-semibold tabular-nums">
              {data.delayedDeliveries} shipments
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export function WeeklyVolumeChart() {
  const [mounted, setMounted] = useState(false);
  const [metricView, setMetricView] = useState<'volume' | 'rate'>('volume');

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalVolume = MOCK_DATA_WEEKLY_VOLUME.reduce(
    (acc, item) => acc + item.volume,
    0
  );

  const avgOnTimeRate = (
    MOCK_DATA_WEEKLY_VOLUME.reduce((acc, item) => acc + item.onTimeRate, 0) /
    MOCK_DATA_WEEKLY_VOLUME.length
  ).toFixed(1);

  const isVolume = metricView === 'volume';

  return (
    <div className="bg-white rounded-xl border border-border p-5 shadow-sm flex flex-col justify-between h-full">
      {/* Chart Header with Interactive View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-info-600" />
            <h2 className="text-base font-heading font-bold text-neutral-900">
              Weekly Delivery Volume & SLA
            </h2>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Consignment dispatches across regional corridors (Mon–Sun)
          </p>
        </div>

        {/* View Toggle Buttons */}
        <div className="inline-flex rounded-lg border border-border p-0.5 bg-neutral-50 text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMetricView('volume')}
            className={cn(
              'px-2.5 py-1 rounded-md font-medium transition-colors',
              isVolume
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800'
            )}
          >
            Dispatches
          </button>
          <button
            type="button"
            onClick={() => setMetricView('rate')}
            className={cn(
              'px-2.5 py-1 rounded-md font-medium transition-colors',
              !isVolume
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800'
            )}
          >
            On-Time %
          </button>
        </div>
      </div>

      {/* Chart Visualization */}
      <div className="w-full h-[240px] pt-2">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={MOCK_DATA_WEEKLY_VOLUME}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={isVolume ? '#2563EB' : '#16A34A'}
                    stopOpacity={0.18}
                  />
                  <stop
                    offset="95%"
                    stopColor={isVolume ? '#2563EB' : '#16A34A'}
                    stopOpacity={0.0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E2E8F0"
              />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
                tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748B', fontSize: 11 }}
                domain={isVolume ? ['auto', 'auto'] : [90, 100]}
                unit={isVolume ? '' : '%'}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey={isVolume ? 'volume' : 'onTimeRate'}
                stroke={isVolume ? '#2563EB' : '#16A34A'}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#chartGradient)"
                activeDot={{
                  r: 5,
                  fill: isVolume ? '#2563EB' : '#16A34A',
                  stroke: '#FFFFFF',
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">
            Loading chart telemetry...
          </div>
        )}
      </div>

      {/* Chart Footer Highlights */}
      <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <span
              className={cn(
                'w-2.5 h-2.5 rounded-sm inline-block',
                isVolume ? 'bg-info-600' : 'bg-success-600'
              )}
            />
            <span>
              {isVolume
                ? `${totalVolume.toLocaleString('en-IN')} Dispatches this week`
                : `Avg. On-Time SLA: ${avgOnTimeRate}%`}
            </span>
          </span>
        </div>

        <span className="text-[11px] text-neutral-400">
          Click toggle above to switch views
        </span>
      </div>
    </div>
  );
}
