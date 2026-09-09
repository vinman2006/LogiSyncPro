'use client';

import React, { useState } from 'react';
import {
  UserCheck,
  Award,
  Shield,
  Zap,
  TrendingUp,
  AlertTriangle,
  Fuel,
  IndianRupee,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useLogistics } from '@/lib/context/LogisticsContext';

interface DriverScorecard {
  id: string;
  name: string;
  avatar: string;
  assignedTruck: string;
  tripsCompleted: number;
  safetyScore: number;
  fuelEfficiencyKmPerL: number;
  harshBrakingIncidents: number;
  monthlyBonusInr: number;
  rank: number;
}

const DRIVERS_DATA: DriverScorecard[] = [
  {
    id: 'drv-01',
    name: 'Santosh Jadhav',
    avatar: 'SJ',
    assignedTruck: 'MH-12-Q-4491 (Tata Signa)',
    tripsCompleted: 48,
    safetyScore: 98,
    fuelEfficiencyKmPerL: 4.8,
    harshBrakingIncidents: 0,
    monthlyBonusInr: 6500,
    rank: 1,
  },
  {
    id: 'drv-02',
    name: 'Virendra Singh',
    avatar: 'VS',
    assignedTruck: 'DL-01-AX-9920 (BharatBenz Reefer)',
    tripsCompleted: 42,
    safetyScore: 95,
    fuelEfficiencyKmPerL: 4.5,
    harshBrakingIncidents: 1,
    monthlyBonusInr: 5200,
    rank: 2,
  },
  {
    id: 'drv-03',
    name: 'Ganesh Shinde',
    avatar: 'GS',
    assignedTruck: 'MH-14-BT-3321 (Mahindra Blazo)',
    tripsCompleted: 39,
    safetyScore: 92,
    fuelEfficiencyKmPerL: 4.3,
    harshBrakingIncidents: 2,
    monthlyBonusInr: 4000,
    rank: 3,
  },
  {
    id: 'drv-04',
    name: 'Anand Gowda',
    avatar: 'AG',
    assignedTruck: 'KA-04-E-1029 (Eicher Pro)',
    tripsCompleted: 36,
    safetyScore: 88,
    fuelEfficiencyKmPerL: 3.9,
    harshBrakingIncidents: 3,
    monthlyBonusInr: 2500,
    rank: 4,
  },
];

export default function DriverAnalyticsPage() {
  const { showToast } = useLogistics();

  const handleDisburseBonus = (driver: DriverScorecard) => {
    showToast(
      'Incentive Disbursed to Driver UPI',
      `Transferred monthly efficiency bonus ₹${driver.monthlyBonusInr.toLocaleString('en-IN')} to ${driver.name}.`,
      'success'
    );
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Driver Safety & Performance Analytics"
        description="Driver safety scorecards, CAN-bus harsh braking telemetry, highway fuel-efficiency incentives, and digital UPI bonus disbursements"
        breadcrumbs={[{ label: 'Driver Analytics' }]}
        showDemoBadge={true}
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">Fleet Safety Rating</span>
          <div className="text-2xl font-mono font-bold text-emerald-600 mt-1">94.5 / 100</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">-62% incident reduction</div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">Harsh Braking Events</span>
          <div className="text-2xl font-mono font-bold text-foreground mt-1">6 Events</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Logged across 12,000 km</div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">Top Fleet Mileage</span>
          <div className="text-2xl font-mono font-bold text-brand mt-1">4.8 km/L</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">By Santosh Jadhav (Rank #1)</div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">Monthly Incentive Pool</span>
          <div className="text-2xl font-mono font-bold text-foreground mt-1">₹18,200</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Direct UPI payout ready</div>
        </div>
      </div>

      {/* Driver Leaderboard Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-brand" />
            <h3 className="font-bold text-sm text-foreground">Monthly Driver Efficiency Leaderboard</h3>
          </div>
          <span className="text-xs text-muted-foreground">Updated in real-time from truck telematics</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                <th className="px-4 py-3">Rank & Driver</th>
                <th className="px-4 py-3">Assigned Truck Asset</th>
                <th className="px-4 py-3">Safety Score</th>
                <th className="px-4 py-3">Fuel Economy</th>
                <th className="px-4 py-3">Harsh Braking</th>
                <th className="px-4 py-3">Bonus Incentive</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {DRIVERS_DATA.map((d) => (
                <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-brand/10 text-brand font-bold text-xs flex items-center justify-center font-mono">
                        #{d.rank}
                      </span>
                      <div>
                        <div className="font-bold text-foreground">{d.name}</div>
                        <div className="text-[10px] text-muted-foreground">{d.tripsCompleted} trips completed</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 font-medium text-foreground">
                    {d.assignedTruck}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-600 text-sm">{d.safetyScore}%</span>
                      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${d.safetyScore}%` }} />
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 font-mono font-bold text-foreground">
                    {d.fuelEfficiencyKmPerL} km/L
                  </td>

                  <td className="px-4 py-3 font-mono font-semibold text-muted-foreground">
                    {d.harshBrakingIncidents} incidents
                  </td>

                  <td className="px-4 py-3 font-mono font-bold text-brand">
                    ₹{d.monthlyBonusInr.toLocaleString('en-IN')}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDisburseBonus(d)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand text-brand-foreground font-semibold text-xs hover:opacity-95 transition-all shadow-xs cursor-pointer"
                    >
                      <span>Pay UPI Bonus</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
