'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Plus,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  RotateCw,
  Search,
  MapPin,
  Building2,
} from 'lucide-react';
import { useNetwork } from '@/lib/context/NetworkContext';
import { CreateShipmentModal } from '@/components/shipments/CreateShipmentModal';

export default function ShipmentsPage() {
  const { shipments, refreshShipments, currentNode } = useNetwork();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filtered = shipments.filter((s) => {
    if (filterStatus !== 'ALL' && s.status !== filterStatus) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.readable_id.toLowerCase().includes(q) ||
      s.commodity.toLowerCase().includes(q) ||
      s.origin.toLowerCase().includes(q) ||
      s.destination.toLowerCase().includes(q) ||
      (s.distributor_name && s.distributor_name.toLowerCase().includes(q)) ||
      (s.collector_name && s.collector_name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Consignments & Shipments</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time multi-participant transaction flows across farmer, distributor, and collector nodes
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground shadow hover:opacity-95 transition-all"
        >
          <Plus className="h-4 w-4" /> Create Shipment
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { key: 'ALL', label: 'All Consignments' },
            { key: 'REQUESTED', label: 'Incoming Requests' },
            { key: 'ACCEPTED', label: 'Accepted' },
            { key: 'IN_TRANSIT', label: 'In Transit' },
            { key: 'ARRIVED', label: 'Arrived / Verification' },
            { key: 'PAYMENT_PENDING', label: 'Payment Pending' },
            { key: 'COMPLETED', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                filterStatus === tab.key
                  ? 'bg-brand text-brand-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ID, commodity, city..."
            className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
      </div>

      {/* Shipments List Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
            <Package className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">No Shipments Found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {filterStatus === 'REQUESTED'
              ? 'When a distributor sends you a shipment request, it will appear here.'
              : 'There are no consignments matching the selected filters.'}
          </p>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-xs font-semibold text-brand-foreground shadow"
          >
            <Plus className="h-3.5 w-3.5" /> Create New Shipment
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <div
              key={s.id}
              className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm hover:border-brand/40 transition-all group"
            >
              <div>
                {/* Header info */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-brand bg-brand/10 px-2.5 py-0.5 rounded-md">
                    {s.readable_id}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      s.status === 'COMPLETED'
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : s.status === 'IN_TRANSIT'
                        ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                        : 'bg-brand/10 text-brand border border-brand/20'
                    }`}
                  >
                    ● {s.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Commodity & Quantity */}
                <div className="mb-4">
                  <div className="text-lg font-bold text-foreground flex items-baseline gap-2">
                    <span>{s.commodity}</span>
                    <span className="text-xs font-mono font-bold text-muted-foreground">
                      {s.expected_quantity} {s.unit}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                    <MapPin className="h-3.5 w-3.5 text-brand shrink-0" />
                    <span className="truncate">{s.origin} → {s.destination}</span>
                  </div>
                </div>

                {/* Node details */}
                <div className="space-y-1.5 border-t border-border pt-3 text-xs mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Distributor:</span>
                    <span className="font-semibold text-foreground truncate max-w-[170px]">
                      {s.distributor_name || 'Pune Fresh Logistics'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Collector:</span>
                    <span className="font-semibold text-foreground truncate max-w-[170px]">
                      {s.collector_name || 'Pune City Produce Collector'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Consignment Value:</span>
                    <span className="font-mono font-bold text-foreground">
                      ₹{Number(s.value).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Link */}
              <Link
                href={`/shipments/${s.readable_id}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-muted/40 py-2.5 text-xs font-semibold text-foreground group-hover:bg-brand group-hover:text-brand-foreground transition-all"
              >
                <span>View Transaction Details</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <CreateShipmentModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={() => refreshShipments()}
      />
    </div>
  );
}
