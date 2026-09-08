'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Disable SSR for MapLibre GL (requires window/DOM)
const LiveMap3D = dynamic(() => import('@/components/map/LiveMap3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] rounded-xl bg-neutral-900 flex items-center justify-center border border-neutral-800">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-neutral-400">Loading 3D Map…</p>
      </div>
    </div>
  ),
});

export default function LiveMapPage() {
  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-neutral-100">Live Fleet Map</h1>
          <p className="text-sm text-neutral-400 mt-0.5">
            3D real-time tracking · OpenStreetMap · 5 vehicles active
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-900/30 border border-green-800/50">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-medium text-green-400">Live · Updated 3s ago</span>
        </div>
      </div>

      {/* 3D Map — fills remaining height */}
      <div className="flex-1" style={{ minHeight: 520 }}>
        <LiveMap3D className="h-full" />
      </div>
    </div>
  );
}
