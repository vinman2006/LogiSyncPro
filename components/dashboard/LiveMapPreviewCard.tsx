'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, ArrowUpRight, Radio, RefreshCw } from 'lucide-react';
import { StatusPill } from '@/components/shared/StatusPill';
import { useLogistics } from '@/lib/context/LogisticsContext';

export function LiveMapPreviewCard() {
  const { selectedHub, showToast } = useLogistics();
  const [isPinging, setIsPinging] = useState(false);
  const [lastPingSec, setLastPingSec] = useState(12);

  const handlePingGps = () => {
    setIsPinging(true);
    setTimeout(() => {
      setIsPinging(false);
      setLastPingSec(1);
      showToast(
        'GPS Coordinates Re-Synced',
        `Acquired telemetry locks for ${selectedHub.activeVehicles} active trucks on western corridor.`,
        'success'
      );
    }, 500);
  };

  return (
    <div className="bg-white rounded-xl border border-border p-5 shadow-sm flex flex-col justify-between h-full relative overflow-hidden">
      {/* Card Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-info-50 flex items-center justify-center text-info-600 border border-info-500/20">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-heading font-bold text-neutral-900">
                Live Corridor Telemetry
              </h2>
              <p className="text-xs text-neutral-500">
                GPS Tracking & Freight Corridors (Phase 2 Preview)
              </p>
            </div>
          </div>

          <StatusPill status="in-transit" customLabel="GPS Live" size="sm" />
        </div>

        {/* Status Metrics Strip with interactive Ping Action */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-neutral-100 text-center">
          <div className="bg-neutral-50 rounded-lg p-2 border border-neutral-200/60">
            <div className="text-xs font-bold text-neutral-900 tabular-nums">
              {selectedHub.activeVehicles}
            </div>
            <div className="text-[10px] text-neutral-500 uppercase tracking-wider">In Transit</div>
          </div>
          <div className="bg-neutral-50 rounded-lg p-2 border border-neutral-200/60">
            <div className="text-xs font-bold text-neutral-900 tabular-nums">
              {selectedHub.code}
            </div>
            <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Active Hub</div>
          </div>
          <button
            type="button"
            onClick={handlePingGps}
            disabled={isPinging}
            className="bg-neutral-50 hover:bg-neutral-100 rounded-lg p-2 border border-neutral-200/60 transition-colors flex flex-col items-center justify-center cursor-pointer group"
            title="Click to manually ping active truck GPS receivers"
          >
            <div className="text-xs font-bold text-info-600 tabular-nums flex items-center gap-1">
              <span>{lastPingSec}s ago</span>
              <RefreshCw
                className={`w-2.5 h-2.5 text-neutral-400 group-hover:text-info-600 ${
                  isPinging ? 'animate-spin text-info-600' : ''
                }`}
              />
            </div>
            <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Ping Telemetry</div>
          </button>
        </div>
      </div>

      {/* Stylized Minimal Vector Map Graphic */}
      <div className="my-4 relative h-[155px] rounded-lg bg-neutral-100/60 border border-neutral-200/80 overflow-hidden flex items-center justify-center">
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(#94A3B8 1px, transparent 1px), radial-gradient(#94A3B8 1px, #F8FAFC 1px)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 10px 10px',
          }}
        />

        {/* Stylized Corridor SVG Polyline */}
        <svg
          className="absolute inset-0 w-full h-full text-info-600"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Mumbai to Delhi NH-48 Corridor */}
          <path
            d="M 60 120 Q 140 70 240 30"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray="4 4"
            className="animate-pulse"
          />
          {/* Pune to Bengaluru Corridor */}
          <path
            d="M 80 125 Q 160 135 280 110"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="1.5"
          />
        </svg>

        {/* Marker 1: Active Truck with floating ETA pill */}
        <div className="absolute left-[30%] top-[40%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="bg-white/95 border border-border shadow-sm rounded-full px-2 py-0.5 text-[10px] font-semibold text-neutral-800 flex items-center gap-1 mb-1 whitespace-nowrap tabular-nums">
            <span className="w-1.5 h-1.5 rounded-full bg-success-600" />
            MH-12-Q-4491 • 54 km/h
          </div>
          <div className="relative flex items-center justify-center">
            <span className="w-4 h-4 rounded-full bg-info-500/30 animate-ping absolute" />
            <span className="w-2.5 h-2.5 rounded-full bg-info-600 border-2 border-white shadow-xs" />
          </div>
        </div>

        {/* Marker 2: Hub Origin */}
        <div className="absolute left-[12%] bottom-[18%] flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-brand-600 border-2 border-white shadow-xs" />
          <span className="text-[10px] font-semibold text-neutral-600 bg-white/80 px-1 rounded">
            {selectedHub.code}
          </span>
        </div>

        {/* Marker 3: Hub Destination */}
        <div className="absolute right-[16%] top-[12%] flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-brand-600 border-2 border-white shadow-xs" />
          <span className="text-[10px] font-semibold text-neutral-600 bg-white/80 px-1 rounded">
            Delhi DC
          </span>
        </div>

        {/* Center overlay badge */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-white/90 backdrop-blur-xs border border-border px-2.5 py-1 rounded-md text-[11px] font-medium text-neutral-600 shadow-xs">
          <Radio className="w-3 h-3 text-brand-600 animate-pulse" />
          <span>React-Leaflet Map Engine in Phase 2</span>
        </div>
      </div>

      {/* Card Footer with Link to Phase 2 Live Map Module */}
      <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
        <span className="text-xs text-neutral-500">
          FASTag toll & GPS receiver sync
        </span>
        <Link
          href="/live-map"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-500 transition-colors"
        >
          <span>Open Fleet Map</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
