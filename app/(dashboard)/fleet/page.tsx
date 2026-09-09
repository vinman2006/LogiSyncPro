'use client';

import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Gauge,
  Thermometer,
  ShieldCheck,
  Calendar,
  Wrench,
  RotateCw,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useLogistics } from '@/lib/context/LogisticsContext';

interface FleetVehicle {
  id: string;
  plateNumber: string;
  model: string;
  type: 'Heavy Multi-Axle' | 'Reefer (Cold Chain)' | 'Light Commercial';
  driver: string;
  status: 'In Transit' | 'Loading' | 'Scheduled Service' | 'Available';
  fuelPercent: number;
  cargoTemp?: number;
  hub: string;
  pucValidUntil: string;
  nationalPermitValidUntil: string;
  lastOdometerKm: number;
}

const FLEET_DATA: FleetVehicle[] = [
  {
    id: 'trk-01',
    plateNumber: 'MH-12-Q-4491',
    model: 'Tata Signa 4825.TK',
    type: 'Heavy Multi-Axle',
    driver: 'Santosh Jadhav',
    status: 'In Transit',
    fuelPercent: 78,
    hub: 'Bhiwandi Central Hub',
    pucValidUntil: '28 Nov 2026',
    nationalPermitValidUntil: '15 Jan 2027',
    lastOdometerKm: 142850,
  },
  {
    id: 'trk-02',
    plateNumber: 'DL-01-AX-9920',
    model: 'BharatBenz 2823R Reefer',
    type: 'Reefer (Cold Chain)',
    driver: 'Virendra Singh',
    status: 'In Transit',
    fuelPercent: 64,
    cargoTemp: 3.8,
    hub: 'Okhla Industrial DC',
    pucValidUntil: '12 Dec 2026',
    nationalPermitValidUntil: '30 Apr 2027',
    lastOdometerKm: 98420,
  },
  {
    id: 'trk-03',
    plateNumber: 'KA-04-E-1029',
    model: 'Eicher Pro 3019',
    type: 'Light Commercial',
    driver: 'Anand Gowda',
    status: 'Loading',
    fuelPercent: 88,
    hub: 'Peenya Logistics Park',
    pucValidUntil: '04 Oct 2026',
    nationalPermitValidUntil: '20 Feb 2027',
    lastOdometerKm: 65110,
  },
  {
    id: 'trk-04',
    plateNumber: 'MH-14-BT-3321',
    model: 'Mahindra Blazo X 49',
    type: 'Heavy Multi-Axle',
    driver: 'Ganesh Shinde',
    status: 'Available',
    fuelPercent: 92,
    hub: 'Bhiwandi Central Hub',
    pucValidUntil: '19 Jan 2027',
    nationalPermitValidUntil: '18 Mar 2027',
    lastOdometerKm: 112400,
  },
  {
    id: 'trk-05',
    plateNumber: 'MH-04-KD-7822',
    model: 'Tata Ultra T.16 Reefer',
    type: 'Reefer (Cold Chain)',
    driver: 'Pravin Pawar',
    status: 'Scheduled Service',
    fuelPercent: 32,
    cargoTemp: 4.2,
    hub: 'Bhiwandi Central Hub',
    pucValidUntil: '15 Oct 2026',
    nationalPermitValidUntil: '10 Nov 2026',
    lastOdometerKm: 154200,
  },
  {
    id: 'trk-06',
    plateNumber: 'TN-09-CB-5544',
    model: 'Ashok Leyland 4220',
    type: 'Heavy Multi-Axle',
    driver: 'Murugan K.',
    status: 'In Transit',
    fuelPercent: 55,
    hub: 'Sriperumbudur Hub',
    pucValidUntil: '22 Feb 2027',
    nationalPermitValidUntil: '05 May 2027',
    lastOdometerKm: 88900,
  },
];

export default function FleetPage() {
  const { showToast } = useLogistics();
  const [vehicles, setVehicles] = useState<FleetVehicle[]>(FLEET_DATA);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefreshTelematics = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      showToast('Fleet Telematics Synced', 'CAN-bus ECU telemetry locks refreshed for 6 active trucks.', 'success');
    }, 600);
  };

  const filtered = vehicles.filter((v) => {
    if (filterType !== 'ALL' && v.type !== filterType) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      v.plateNumber.toLowerCase().includes(q) ||
      v.driver.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      v.hub.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Fleet Telematics & Assets"
        description="Centralized vehicle asset registry, real-time maintenance diagnostics, CAN-bus fuel gauges, and statutory fitness tracking"
        breadcrumbs={[{ label: 'Fleet Management' }]}
        showDemoBadge={true}
        actions={
          <button
            type="button"
            onClick={handleRefreshTelematics}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-brand text-brand-foreground shadow hover:opacity-95 transition-all cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync Fleet Sensors</span>
          </button>
        }
      />

      {/* Fleet Overview KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm">
          <div className="text-xs font-semibold text-muted-foreground">Total Registered Fleet</div>
          <div className="text-2xl font-mono font-bold text-foreground mt-1">48 Trucks</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">42 Active on Road Today</div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm">
          <div className="text-xs font-semibold text-muted-foreground">Cold-Chain Reefers</div>
          <div className="text-2xl font-mono font-bold text-sky-600 mt-1">14 Reefers</div>
          <div className="text-[11px] text-sky-600/80 mt-0.5">All sensors ≤ 4.0°C compliant</div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm">
          <div className="text-xs font-semibold text-muted-foreground">Average Diesel Efficiency</div>
          <div className="text-2xl font-mono font-bold text-foreground mt-1">4.2 km/L</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">+8.4% with Route AI solver</div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm">
          <div className="text-xs font-semibold text-muted-foreground">Permit Compliance</div>
          <div className="text-2xl font-mono font-bold text-emerald-600 mt-1">100% Valid</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">National GST e-Way Ready</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'Heavy Multi-Axle', 'Reefer (Cold Chain)', 'Light Commercial'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterType(tab)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                filterType === tab
                  ? 'bg-brand text-brand-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {tab === 'ALL' ? 'All Types' : tab}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search plate (MH-12), driver, hub..."
            className="w-full h-9 pl-9 pr-3 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
      </div>

      {/* Vehicle Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((v) => (
          <div
            key={v.id}
            className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm hover:border-brand/40 transition-all group"
          >
            <div>
              {/* Header: Plate & Status */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-brand/10 text-brand font-mono font-bold text-xs border border-brand/20">
                    {v.plateNumber}
                  </div>
                </div>

                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    v.status === 'In Transit'
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      : v.status === 'Loading'
                      ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      : v.status === 'Scheduled Service'
                      ? 'bg-red-500/10 text-red-600 border border-red-500/20'
                      : 'bg-muted text-muted-foreground border border-border'
                  }`}
                >
                  ● {v.status}
                </span>
              </div>

              {/* Model & Type */}
              <div className="mb-4">
                <h4 className="font-bold text-foreground text-sm">{v.model}</h4>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {v.type} • Hub: <strong>{v.hub}</strong>
                </div>
              </div>

              {/* Driver & Telemetry Indicators */}
              <div className="p-3 rounded-xl bg-muted/20 border border-border space-y-2.5 text-xs mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Assigned Driver:</span>
                  <span className="font-semibold text-foreground">{v.driver}</span>
                </div>

                {/* Fuel gauge bar */}
                <div>
                  <div className="flex justify-between items-center text-[11px] mb-1">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Gauge className="w-3 h-3 text-brand" /> Diesel Fuel Tank
                    </span>
                    <span className="font-mono font-bold text-foreground">{v.fuelPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        v.fuelPercent < 25 ? 'bg-red-500' : v.fuelPercent < 50 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${v.fuelPercent}%` }}
                    />
                  </div>
                </div>

                {/* Reefer Temperature if applicable */}
                {v.cargoTemp !== undefined && (
                  <div className="flex justify-between items-center pt-1 border-t border-border/50 text-[11px]">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-sky-500" /> Reefer Temp:
                    </span>
                    <span className="font-mono font-bold text-sky-600">{v.cargoTemp}°C (Setpoint: 4.0°C)</span>
                  </div>
                )}
              </div>

              {/* Compliance Badges */}
              <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground mb-4">
                <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-border">
                  <span className="block font-semibold">PUC Expiration:</span>
                  <span className="text-foreground font-mono">{v.pucValidUntil}</span>
                </div>
                <div className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-border">
                  <span className="block font-semibold">National Permit:</span>
                  <span className="text-foreground font-mono">{v.nationalPermitValidUntil}</span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => showToast('Driver Contacted', `Sent SMS dispatch ping to ${v.driver} (${v.plateNumber}).`, 'info')}
                className="flex-1 py-2 rounded-xl border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition-colors text-center"
              >
                Ping Driver
              </button>
              <button
                type="button"
                onClick={() => showToast('FASTag Recharged', `Initiated ₹3,000 FASTag topup for ${v.plateNumber}.`, 'success')}
                className="flex-1 py-2 rounded-xl bg-brand text-brand-foreground text-xs font-semibold hover:opacity-95 transition-all text-center"
              >
                FASTag Topup
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
