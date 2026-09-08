'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  MapPin,
  CheckCircle2,
  Package,
  Send,
  Search,
  Filter,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { NodeEntity } from '@/lib/db/repo';
import { CreateShipmentModal } from '@/components/shipments/CreateShipmentModal';
import { useRouter } from 'next/navigation';

export default function FindCollectorsPage() {
  const router = useRouter();
  const [collectors, setCollectors] = useState<NodeEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [selectedCollectorId, setSelectedCollectorId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function loadCollectors() {
      try {
        const url = searchCity
          ? `/api/nodes/collectors?city=${encodeURIComponent(searchCity)}`
          : '/api/nodes/collectors';
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setCollectors(data.collectors || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadCollectors();
  }, [searchCity]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">Find Verified Collectors</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              KYC & GST VERIFIED
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Discover verified wholesale receiving hubs and urban produce collectors accepting agricultural commodities
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            placeholder="Search by city (e.g. Pune, Mumbai, Nashik)..."
            className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Filter className="h-4 w-4 text-brand" />
          <span>Showing Verified MSME Nodes in Maharashtra</span>
        </div>
      </div>

      {/* Collectors Grid */}
      {collectors.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
          <Building2 className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
          <h3 className="text-base font-bold text-foreground">No Collectors Found</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Try searching for cities like Pune or Nashik.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {collectors.map((collector) => (
            <div
              key={collector.id}
              className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm hover:border-brand/40 transition-all group"
            >
              <div>
                {/* Node Code & Verification */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[11px] font-bold text-muted-foreground bg-muted px-2.5 py-0.5 rounded-md">
                    {collector.node_code}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="h-3 w-3" /> Verified Node
                  </span>
                </div>

                {/* Name & City */}
                <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-brand transition-colors">
                  {collector.name}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                  <MapPin className="h-3.5 w-3.5 text-brand" />
                  <span>{collector.city}, {collector.country}</span>
                </div>

                {/* Commodities Handled */}
                <div className="mb-5">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                    Accepting Commodities
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(collector.commodities_handled || ['Oranges', 'Citrus', 'Fruits']).map((c) => (
                      <span
                        key={c}
                        className="text-xs px-2.5 py-1 rounded-lg bg-brand/5 border border-brand/20 font-medium text-foreground"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => {
                  setSelectedCollectorId(collector.id);
                  setIsModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand py-2.5 text-xs font-semibold text-brand-foreground shadow hover:opacity-95 transition-all"
              >
                <Send className="h-3.5 w-3.5" /> Request Shipment
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Shipment Request Modal */}
      <CreateShipmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        preselectedCollectorId={selectedCollectorId}
        onCreated={(shp) => {
          router.push(`/shipments/${shp.readable_id}`);
        }}
      />
    </div>
  );
}
