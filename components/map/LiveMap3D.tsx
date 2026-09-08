'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  Navigation,
  MapPin,
  Truck,
  Layers,
  Compass,
  AlertTriangle,
  Signal,
} from 'lucide-react';

// Mock truck fleet data
const MOCK_TRUCKS = [
  { id: 'TRK-0421', lat: 19.076, lng: 72.8777, eta: '14 min', load: 82, status: 'on-route', color: '#22C55E' },
  { id: 'TRK-0398', lat: 19.093, lng: 72.858, eta: '31 min', load: 67, status: 'on-route', color: '#22C55E' },
  { id: 'TRK-0512', lat: 19.065, lng: 72.895, eta: 'Delayed', load: 45, status: 'delayed', color: '#EF4444' },
  { id: 'TRK-0334', lat: 19.085, lng: 72.84, eta: '8 min', load: 91, status: 'arriving', color: '#F97316' },
  { id: 'TRK-0287', lat: 19.055, lng: 72.87, eta: '22 min', load: 55, status: 'on-route', color: '#22C55E' },
];

interface LiveMap3DProps {
  className?: string;
}

export default function LiveMap3D({ className = '' }: LiveMap3DProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const locationMarkerRef = useRef<maplibregl.Marker | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const truckMarkersRef = useRef<maplibregl.Marker[]>([]);

  const [is3D, setIs3D] = useState(true);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'tracking' | 'error'>('idle');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedTruck, setSelectedTruck] = useState<typeof MOCK_TRUCKS[0] | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Add truck fleet markers — defined before map init useEffect to avoid hoisting error
  const addTruckMarkers = useCallback((map: maplibregl.Map) => {
    MOCK_TRUCKS.forEach((truck) => {
      // Create custom HTML marker element
      const el = document.createElement('div');
      el.style.cssText = `
        width: 36px; height: 36px; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        border-radius: 50%; border: 2px solid ${truck.color};
        background: rgba(0,0,0,0.75); backdrop-filter: blur(4px);
        box-shadow: 0 0 12px ${truck.color}60;
        transition: transform 0.2s, box-shadow 0.2s;
      `;
      el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${truck.color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/><rect x="9" y="11" width="14" height="10" rx="1"/><circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/></svg>`;

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.3)';
        el.style.boxShadow = `0 0 20px ${truck.color}80`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
        el.style.boxShadow = `0 0 12px ${truck.color}60`;
      });
      el.addEventListener('click', () => setSelectedTruck(truck));

      const popup = new maplibregl.Popup({ offset: 20, closeButton: false, className: 'logi-popup' })
        .setHTML(`
          <div style="background:#1a1a1a; border:1px solid #333; border-radius:10px; padding:10px 14px; font-family:system-ui; color:#fff; min-width:140px;">
            <div style="font-size:11px; font-weight:700; color:${truck.color}; text-transform:uppercase; letter-spacing:0.05em;">${truck.id}</div>
            <div style="font-size:12px; color:#ccc; margin-top:4px;">ETA: <strong style="color:#fff;">${truck.eta}</strong></div>
            <div style="font-size:11px; color:#888; margin-top:2px;">Load: ${truck.load}%</div>
          </div>
        `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([truck.lng, truck.lat])
        .setPopup(popup)
        .addTo(map);

      truckMarkersRef.current.push(marker);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize MapLibre GL
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxzoom: 19,
          },
        },
        layers: [
          {
            id: 'osm-layer',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 22,
          },
        ],
      },
      center: [72.8777, 19.076], // Mumbai
      zoom: 13,
      pitch: 45,
      bearing: 0,
    });

    // Navigation controls
    map.addControl(
      new maplibregl.NavigationControl({ showZoom: true, showCompass: true, visualizePitch: true }),
      'top-right'
    );

    map.on('load', () => {
      setMapLoaded(true);
      // Add truck markers
      addTruckMarkers(map);
    });

    mapRef.current = map;

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const markers = truckMarkersRef.current;
      markers.forEach((m) => m.remove());
      map.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addTruckMarkers]);

  // Real-time GPS location tracking
  const startTracking = useCallback(() => {
    if (!mapRef.current) return;
    setGpsStatus('tracking');

    if (!navigator.geolocation) {
      setGpsStatus('error');
      return;
    }

    const updateLocation = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      setUserLocation([longitude, latitude]);

      const map = mapRef.current!;

      if (locationMarkerRef.current) {
        locationMarkerRef.current.setLngLat([longitude, latitude]);
      } else {
        // Create pulsing location dot
        const el = document.createElement('div');
        el.style.cssText = `position: relative; width: 20px; height: 20px;`;
        el.innerHTML = `
          <div style="
            width: 20px; height: 20px; border-radius: 50%;
            background: #3B82F6; border: 3px solid white;
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
            animation: gps-pulse 2s infinite;
          "></div>
          <style>
            @keyframes gps-pulse {
              0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
              70% { box-shadow: 0 0 0 16px rgba(59, 130, 246, 0); }
              100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
            }
          </style>
        `;

        locationMarkerRef.current = new maplibregl.Marker({ element: el })
          .setLngLat([longitude, latitude])
          .addTo(map);
      }

      // Fly to user location
      map.flyTo({
        center: [longitude, latitude],
        zoom: 15,
        pitch: is3D ? 50 : 0,
        duration: 1800,
        essential: true,
      });
    };

    const handleError = () => {
      setGpsStatus('error');
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      updateLocation,
      handleError,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 2000 }
    );
  }, [is3D]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    locationMarkerRef.current?.remove();
    locationMarkerRef.current = null;
    setGpsStatus('idle');
    setUserLocation(null);
  }, []);

  const toggle3D = useCallback(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const newIs3D = !is3D;
    setIs3D(newIs3D);
    map.easeTo({
      pitch: newIs3D ? 50 : 0,
      bearing: newIs3D ? 20 : 0,
      duration: 800,
    });
  }, [is3D]);

  const resetView = useCallback(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [72.8777, 19.076],
      zoom: 13,
      pitch: is3D ? 45 : 0,
      bearing: 0,
      duration: 1000,
    });
  }, [is3D]);

  return (
    <div className={`relative flex flex-col h-full ${className}`}>
      {/* Map Container */}
      <div ref={mapContainer} className="w-full flex-1 rounded-xl overflow-hidden" style={{ minHeight: 480 }} />

      {/* Top Control Bar */}
      <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
        {/* 3D Toggle */}
        <button
          onClick={toggle3D}
          title={is3D ? 'Switch to 2D' : 'Switch to 3D'}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold shadow-lg transition-all duration-200 ${
            is3D
              ? 'bg-brand-600 text-white shadow-brand-600/40 hover:bg-brand-500'
              : 'bg-neutral-900/90 text-neutral-300 hover:bg-neutral-800 border border-neutral-700'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          {is3D ? '3D View' : '2D View'}
        </button>

        {/* Reset View */}
        <button
          onClick={resetView}
          title="Reset to Mumbai"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-900/90 border border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-xs font-semibold shadow-lg transition-all duration-200"
        >
          <Compass className="w-3.5 h-3.5" />
          Mumbai
        </button>
      </div>

      {/* GPS Tracking Button */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
        <button
          onClick={gpsStatus === 'tracking' ? stopTracking : startTracking}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-xl transition-all duration-200 ${
            gpsStatus === 'tracking'
              ? 'bg-blue-600 text-white shadow-blue-600/40 hover:bg-blue-500'
              : gpsStatus === 'error'
              ? 'bg-critical-600/20 border border-critical-600/40 text-critical-400 hover:bg-critical-600/30'
              : 'bg-neutral-900/90 border border-neutral-700 text-neutral-200 hover:bg-neutral-800'
          }`}
        >
          {gpsStatus === 'tracking' ? (
            <>
              <Signal className="w-4 h-4 animate-pulse" />
              Tracking Live
            </>
          ) : gpsStatus === 'error' ? (
            <>
              <AlertTriangle className="w-4 h-4" />
              GPS Unavailable
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4" />
              Trace My Location
            </>
          )}
        </button>
      </div>

      {/* Fleet Summary Bar */}
      <div className="absolute bottom-3 left-3 right-14 z-10">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          {MOCK_TRUCKS.map((truck) => (
            <button
              key={truck.id}
              onClick={() => {
                setSelectedTruck(truck);
                mapRef.current?.flyTo({
                  center: [truck.lng, truck.lat],
                  zoom: 15,
                  pitch: is3D ? 50 : 0,
                  duration: 1200,
                });
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shadow-lg transition-all duration-150 border ${
                selectedTruck?.id === truck.id
                  ? 'bg-neutral-700 border-neutral-500 text-white'
                  : 'bg-neutral-900/90 border-neutral-800 text-neutral-300 hover:border-neutral-600'
              }`}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: truck.color }} />
              <Truck className="w-3 h-3 flex-shrink-0 opacity-60" />
              {truck.id}
              <span className="opacity-60">·</span>
              <span style={{ color: truck.color }}>{truck.eta}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Truck Detail Panel */}
      {selectedTruck && (
        <div className="absolute bottom-14 right-3 z-10 w-52 bg-neutral-900/95 border border-neutral-700 rounded-xl p-4 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-400" />
              <span className="text-sm font-bold text-white">{selectedTruck.id}</span>
            </div>
            <button
              onClick={() => setSelectedTruck(null)}
              className="text-neutral-600 hover:text-neutral-400 text-xs"
            >✕</button>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-neutral-400">Status</span>
              <span style={{ color: selectedTruck.color }} className="font-medium capitalize">{selectedTruck.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">ETA</span>
              <span className="text-white font-semibold">{selectedTruck.eta}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Load</span>
              <span className="text-white font-medium">{selectedTruck.load}%</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-neutral-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${selectedTruck.load}%`, background: selectedTruck.color }}
              />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3">
            <MapPin className="w-3 h-3 text-neutral-500" />
            <span className="text-[10px] text-neutral-500">
              {selectedTruck.lat.toFixed(4)}°N, {selectedTruck.lng.toFixed(4)}°E
            </span>
          </div>
        </div>
      )}

      {/* User Location Info */}
      {userLocation && (
        <div className="absolute top-3 right-14 z-10">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-900/50 border border-blue-700/50 text-xs text-blue-300">
            <MapPin className="w-3 h-3" />
            {userLocation[1].toFixed(4)}°N, {userLocation[0].toFixed(4)}°E
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 rounded-xl z-20">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-neutral-400">Loading 3D Map…</p>
          </div>
        </div>
      )}
    </div>
  );
}
