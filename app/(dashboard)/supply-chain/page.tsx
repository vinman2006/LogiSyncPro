'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sprout,
  Truck,
  Package,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Building2,
  ExternalLink,
  Plus,
  Send,
  Navigation,
} from 'lucide-react';
import { NodeEntity, ShipmentEntity } from '@/lib/db/repo';
import { useNetwork } from '@/lib/context/NetworkContext';

export default function SupplyChainNetworkPage() {
  const { shipments } = useNetwork();
  const [nodes, setNodes] = useState<NodeEntity[]>([]);
  const [selectedNode, setSelectedNode] = useState<NodeEntity | null>(null);

  useEffect(() => {
    async function loadNodes() {
      try {
        const res = await fetch('/api/nodes');
        const data = await res.json();
        if (data.success && data.nodes) {
          setNodes(data.nodes);
          setSelectedNode(data.nodes.find((n: NodeEntity) => n.role === 'DISTRIBUTOR') || data.nodes[0]);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadNodes();
  }, []);

  const farmerNode = nodes.find((n) => n.role === 'FARMER');
  const distributorNode = nodes.find((n) => n.role === 'DISTRIBUTOR');
  const collectorNode = nodes.find((n) => n.role === 'COLLECTOR');

  const activeTransitShipment = shipments.find((s) => s.status === 'IN_TRANSIT') || shipments[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">Supply Chain Node Network</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand/10 text-brand border border-brand/20">
              ONE SYSTEM. EVERY MOVE.
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Visual interactive topology representing agricultural producers, logistics distributors, and destination collector hubs
          </p>
        </div>

        <Link
          href="/network/collectors"
          className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground shadow hover:opacity-95 transition-all"
        >
          <Send className="h-4 w-4" /> Find & Request Collectors
        </Link>
      </div>

      {/* Visual Interactive Supply Chain Topology */}
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-6">
          Multi-Tier Transaction Flow (Oranges Pilot Corridor)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Node 1: FARMER */}
          <div
            onClick={() => farmerNode && setSelectedNode(farmerNode)}
            className={`cursor-pointer rounded-2xl border p-6 transition-all relative ${
              selectedNode?.role === 'FARMER'
                ? 'border-brand bg-brand/5 ring-2 ring-brand shadow-md'
                : 'border-border bg-muted/20 hover:border-muted-foreground/30'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600">
                <Sprout className="h-6 w-6" />
              </div>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                ORIGIN NODE
              </span>
            </div>

            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              1. Producer / Farmer
            </span>
            <h3 className="text-lg font-bold text-foreground mt-1">
              {farmerNode?.name || 'Maharashtra Orange Farm'}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-brand" /> {farmerNode?.city || 'Nashik'}, Maharashtra
            </p>

            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Commodity:</span>
              <span className="font-bold text-foreground">Oranges (1,000 kg)</span>
            </div>
          </div>

          {/* Node 2: DISTRIBUTOR (with in-transit truck bridge) */}
          <div
            onClick={() => distributorNode && setSelectedNode(distributorNode)}
            className={`cursor-pointer rounded-2xl border p-6 transition-all relative ${
              selectedNode?.role === 'DISTRIBUTOR'
                ? 'border-brand bg-brand/5 ring-2 ring-brand shadow-md'
                : 'border-border bg-muted/20 hover:border-muted-foreground/30'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/15 text-brand">
                <Truck className="h-6 w-6" />
              </div>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-brand/10 text-brand border border-brand/20">
                LOGISTICS HUB
              </span>
            </div>

            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              2. Distributor & Fleet
            </span>
            <h3 className="text-lg font-bold text-foreground mt-1">
              {distributorNode?.name || 'Pune Fresh Logistics'}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-brand" /> {distributorNode?.city || 'Pune'}, Maharashtra
            </p>

            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Fleet Status:</span>
              <span className="font-bold text-brand flex items-center gap-1">
                <Navigation className="h-3 w-3" /> Corridors Active
              </span>
            </div>
          </div>

          {/* Node 3: COLLECTOR */}
          <div
            onClick={() => collectorNode && setSelectedNode(collectorNode)}
            className={`cursor-pointer rounded-2xl border p-6 transition-all relative ${
              selectedNode?.role === 'COLLECTOR'
                ? 'border-brand bg-brand/5 ring-2 ring-brand shadow-md'
                : 'border-border bg-muted/20 hover:border-muted-foreground/30'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600">
                <Package className="h-6 w-6" />
              </div>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 border border-sky-500/20">
                DESTINATION NODE
              </span>
            </div>

            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              3. Urban Collector
            </span>
            <h3 className="text-lg font-bold text-foreground mt-1">
              {collectorNode?.name || 'Pune City Produce Collector'}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5 text-sky-600" /> Market Yard, Pune
            </p>

            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Settlement:</span>
              <span className="font-bold text-emerald-600">Verified Receiver</span>
            </div>
          </div>
        </div>

        {/* Selected Node Details Card (Requirement 29) */}
        {selectedNode && (
          <div className="mt-8 rounded-2xl border border-border bg-muted/30 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4 mb-4">
              <div>
                <span className="text-xs font-semibold text-brand uppercase tracking-wider">
                  Inspecting Node Topology
                </span>
                <h3 className="text-xl font-bold text-foreground mt-0.5">{selectedNode.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold bg-card border border-border px-3 py-1 rounded-lg text-foreground">
                  {selectedNode.node_code}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {selectedNode.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground font-medium">Role:</span>
                <div className="font-bold text-foreground mt-1">{selectedNode.role}</div>
              </div>
              <div>
                <span className="text-muted-foreground font-medium">Jurisdiction / Location:</span>
                <div className="font-bold text-foreground mt-1">{selectedNode.city}, {selectedNode.country}</div>
              </div>
              <div>
                <span className="text-muted-foreground font-medium">Commodities Handled:</span>
                <div className="font-bold text-foreground mt-1">
                  {(selectedNode.commodities_handled || ['Oranges', 'Citrus']).join(', ')}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground font-medium">Related Shipments:</span>
                <div className="font-mono font-bold text-foreground mt-1">
                  {shipments.length} Active Records
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Pipeline Feed */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-foreground">Active Corridors & Consignments</h3>
            <p className="text-xs text-muted-foreground">Connected ledger moves between network participants</p>
          </div>
          <Link
            href="/shipments"
            className="text-xs font-semibold text-brand hover:underline flex items-center gap-1"
          >
            <span>View All</span> <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {shipments.slice(0, 3).map((s) => (
            <div
              key={s.id}
              className="flex flex-wrap items-center justify-between rounded-xl border border-border bg-muted/20 p-4 gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-brand bg-brand/10 px-2.5 py-1 rounded">
                  {s.readable_id}
                </span>
                <div>
                  <div className="font-bold text-foreground">
                    {s.commodity} • {s.expected_quantity} {s.unit}
                  </div>
                  <div className="text-muted-foreground text-[11px] mt-0.5">
                    {s.origin} → {s.destination}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    s.status === 'COMPLETED'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : s.status === 'IN_TRANSIT'
                      ? 'bg-amber-500/10 text-amber-600'
                      : 'bg-brand/10 text-brand'
                  }`}
                >
                  ● {s.status.replace('_', ' ')}
                </span>
                <Link
                  href={`/shipments/${s.readable_id}`}
                  className="font-semibold text-foreground hover:text-brand flex items-center gap-1"
                >
                  <span>Inspect</span> <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
