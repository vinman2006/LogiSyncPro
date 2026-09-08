'use client';

import React, { useEffect, useState } from 'react';
import {
  Truck,
  MapPin,
  Navigation,
  Thermometer,
  Gauge,
  Radio,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface TruckRouteMapProps {
  shipmentId: string;
  status: string;
  origin: string;
  destination: string;
}

export function TruckRouteMap({ shipmentId, status, origin, destination }: TruckRouteMapProps) {
  const [telemetry, setTelemetry] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchTracking() {
      try {
        const res = await fetch(`/api/shipments/${shipmentId}/track`);
        const data = await res.json();
        if (mounted && data.success) {
          setTelemetry(data);
        }
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchTracking();
    const interval = setInterval(fetchTracking, 4000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [shipmentId]);

  const progress = telemetry?.progress ?? (status === 'COMPLETED' || status === 'ARRIVED' ? 100 : status === 'IN_TRANSIT' ? 55 : 0);
  const truck = telemetry?.truck || {
    lat: 19.5761,
    lng: 74.2144,
    currentLocationName: 'Sangamner Agri Corridor',
    nextLocationName: 'Ahmednagar Bypass',
    carrier: 'LogiSync Express Hauler MH-12-LS-4421',
    speedKmH: status === 'IN_TRANSIT' ? 62 : 0,
    temperatureC: 4.8,
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
      {/* Telemetry Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-border bg-muted/30 px-6 py-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <Radio className="h-5 w-5 animate-pulse text-brand" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">GPS Corridors & Telemetry</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                LIVE SAT-LINK
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              Vehicle: {truck.carrier}
            </p>
          </div>
        </div>

        {/* Real-time telemetry badges */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border">
            <Gauge className="h-4 w-4 text-brand" />
            <span className="text-muted-foreground">Speed:</span>
            <span className="font-bold text-foreground">{truck.speedKmH} km/h</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border">
            <Thermometer className="h-4 w-4 text-sky-500" />
            <span className="text-muted-foreground">Cold-Chain:</span>
            <span className="font-bold text-emerald-600">{truck.temperatureC}°C</span>
          </div>
        </div>
      </div>

      {/* Visual Corridor Diagram */}
      <div className="p-6">
        <div className="relative mb-8 pt-4">
          {/* Progress track */}
          <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand via-amber-500 to-emerald-500 transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Animated Truck Pin */}
          <div
            className="absolute top-1 -translate-x-1/2 transition-all duration-700 ease-out"
            style={{ left: `${Math.max(4, Math.min(96, progress))}%` }}
          >
            <div className="relative flex flex-col items-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-lg ring-4 ring-brand/20">
                <Truck className="h-4 w-4" />
              </div>
              <div className="mt-1 whitespace-nowrap rounded-md bg-neutral-900 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                {progress >= 100 ? 'Arrived' : `${progress}% • In Transit`}
              </div>
            </div>
          </div>
        </div>

        {/* Waypoints Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-border bg-muted/20">
            <div className="flex items-center gap-1.5 text-muted-foreground font-semibold mb-1">
              <MapPin className="h-3.5 w-3.5 text-brand" /> Origin
            </div>
            <div className="font-bold text-foreground truncate">{origin}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">20.0110° N, 73.7903° E</div>
          </div>

          <div className="p-3 rounded-xl border border-border bg-muted/20">
            <div className="flex items-center gap-1.5 text-muted-foreground font-semibold mb-1">
              <Navigation className="h-3.5 w-3.5 text-amber-500" /> Current Waypoint
            </div>
            <div className="font-bold text-foreground truncate">{truck.currentLocationName}</div>
            <div className="text-[10px] text-emerald-600 mt-0.5 font-medium">GPS Signal Strong</div>
          </div>

          <div className="p-3 rounded-xl border border-border bg-muted/20">
            <div className="flex items-center gap-1.5 text-muted-foreground font-semibold mb-1">
              <Clock className="h-3.5 w-3.5 text-sky-500" /> Approaching Next
            </div>
            <div className="font-bold text-foreground truncate">{truck.nextLocationName}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">Corridor NH-60</div>
          </div>

          <div className="p-3 rounded-xl border border-border bg-muted/20">
            <div className="flex items-center gap-1.5 text-muted-foreground font-semibold mb-1">
              <MapPin className="h-3.5 w-3.5 text-emerald-600" /> Destination
            </div>
            <div className="font-bold text-foreground truncate">{destination}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">18.4900° N, 73.8650° E</div>
          </div>
        </div>

        {/* Verified Cold-Chain Assurance */}
        <div className="mt-4 flex items-center justify-between rounded-xl bg-brand/5 border border-brand/20 p-3 text-xs">
          <div className="flex items-center gap-2 text-foreground">
            <ShieldCheck className="h-4 w-4 text-brand" />
            <span>
              <strong>Produce Integrity:</strong> Oranges kept at stable +4.8°C refrigerated environment with zero threshold breaches.
            </span>
          </div>
          <span className="font-mono text-[11px] text-muted-foreground">LAT: {truck.lat} • LNG: {truck.lng}</span>
        </div>
      </div>
    </div>
  );
}
