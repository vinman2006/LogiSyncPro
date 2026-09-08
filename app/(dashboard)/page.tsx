'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Truck,
  Plus,
  Send,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Building2,
  Sparkles,
  RotateCw,
  Download,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { WeeklyVolumeChart } from '@/components/dashboard/WeeklyVolumeChart';
import { LiveMapPreviewCard } from '@/components/dashboard/LiveMapPreviewCard';
import { RecentAlertsFeed } from '@/components/dashboard/RecentAlertsFeed';
import { DateRangeDropdown } from '@/components/dashboard/DateRangeDropdown';
import { useLogistics } from '@/lib/context/LogisticsContext';
import { useNetwork } from '@/lib/context/NetworkContext';
import { CreateShipmentModal } from '@/components/shipments/CreateShipmentModal';

export default function DashboardOverviewPage() {
  const { isRefreshing, refreshTelemetry, exportCsvReport, lastRefreshedTime } = useLogistics();
  const {
    currentNode,
    switchDemoRole,
    stats,
    shipments,
    refreshShipments,
  } = useNetwork();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const isDistributor = !currentNode || currentNode.role === 'DISTRIBUTOR';
  const isCollector = currentNode?.role === 'COLLECTOR';
  const isFarmer = currentNode?.role === 'FARMER';

  // Action handler for fast collector acceptance on dashboard
  const handleQuickAction = async (shipmentId: string, action: string) => {
    setProcessingId(shipmentId);
    try {
      await fetch(`/api/shipments/${shipmentId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          actorId: currentNode?.id,
        }),
      });
      await refreshShipments();
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  const incomingRequests = shipments.filter((s) => s.status === 'REQUESTED');
  const inTransitShipments = shipments.filter((s) => s.status === 'IN_TRANSIT');

  return (
    <div className="space-y-6 pb-12">
      {/* Control Tower Header */}
      <PageHeader
        title={
          isCollector
            ? 'Collector Receiving Terminal'
            : isFarmer
            ? 'Producer Agricultural Hub'
            : 'Distributor Logistics Control Tower'
        }
        description={`One System. Every Move. • Active Node: ${currentNode?.name || 'Pune Fresh Logistics'} (${currentNode?.city || 'Pune'})`}
        breadcrumbs={[{ label: 'Overview' }]}
        showDemoBadge={true}
        actions={
          <>
            <DateRangeDropdown />

            {/* Quick Demo Switcher */}
            <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-card border border-border text-xs">
              <button
                type="button"
                onClick={() => switchDemoRole('DISTRIBUTOR')}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                  isDistributor ? 'bg-brand text-brand-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Distributor
              </button>
              <button
                type="button"
                onClick={() => switchDemoRole('COLLECTOR')}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                  isCollector ? 'bg-brand text-brand-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Collector
              </button>
              <button
                type="button"
                onClick={() => switchDemoRole('FARMER')}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                  isFarmer ? 'bg-brand text-brand-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Farmer
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-brand-foreground bg-brand hover:opacity-95 rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Shipment</span>
            </button>
          </>
        }
      />

      {/* Hero Operational Metrics (Requirement 28) */}
      <section aria-label="Logistics Metrics">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <span className="text-xs text-muted-foreground font-semibold">Active Consignments</span>
            <div className="mt-2 text-3xl font-mono font-bold text-foreground">{stats.active}</div>
            <div className="text-[11px] text-muted-foreground mt-1">Total in pipeline</div>
          </div>

          <div className="rounded-2xl border border-brand/30 bg-brand/5 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-brand font-bold">Incoming Requests</span>
              {stats.incoming > 0 && (
                <span className="h-2 w-2 rounded-full bg-brand animate-ping" />
              )}
            </div>
            <div className="mt-2 text-3xl font-mono font-bold text-brand">{stats.incoming}</div>
            <div className="text-[11px] text-brand/80 mt-1">Awaiting acceptance</div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <span className="text-xs text-muted-foreground font-semibold">In Transit</span>
            <div className="mt-2 text-3xl font-mono font-bold text-amber-500">{stats.inTransit}</div>
            <div className="text-[11px] text-muted-foreground mt-1">Active truck corridors</div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <span className="text-xs text-muted-foreground font-semibold">Pending Payments</span>
            <div className="mt-2 text-3xl font-mono font-bold text-sky-600">{stats.pendingPayment}</div>
            <div className="text-[11px] text-muted-foreground mt-1">Verified weight</div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm col-span-2 sm:col-span-1">
            <span className="text-xs text-muted-foreground font-semibold">Completed</span>
            <div className="mt-2 text-3xl font-mono font-bold text-emerald-600">{stats.completed}</div>
            <div className="text-[11px] text-muted-foreground mt-1">Settled & immutable</div>
          </div>
        </div>
      </section>

      {/* Collector Specific Alert / Inbox: Incoming Requests (Requirement 13 & 31) */}
      {isCollector && incomingRequests.length > 0 && (
        <section aria-label="Collector Incoming Requests Inbox">
          <div className="rounded-2xl border-2 border-brand/40 bg-brand/5 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-brand-foreground shadow">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Incoming Shipment Requests Awaiting Your Approval</h2>
                  <p className="text-xs text-muted-foreground">
                    Distributors have dispatched produce requests to your Pune receiving dock
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-brand bg-brand/10 px-3 py-1 rounded-full">
                {incomingRequests.length} Pending
              </span>
            </div>

            <div className="space-y-3">
              {incomingRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex flex-wrap items-center justify-between rounded-xl border border-border bg-card p-4 gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-brand bg-brand/10 px-2 py-0.5 rounded text-xs">
                        {req.readable_id}
                      </span>
                      <span className="font-bold text-foreground text-sm">
                        {req.distributor_name || 'Pune Fresh Logistics'}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <strong>{req.expected_quantity} {req.unit} {req.commodity}</strong> • {req.origin} → {req.destination} • ₹{Number(req.value).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={processingId === req.id}
                      onClick={() => handleQuickAction(req.id, 'reject')}
                      className="px-4 py-2 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs font-bold hover:bg-destructive/20 transition-all"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      disabled={processingId === req.id}
                      onClick={() => handleQuickAction(req.id, 'accept')}
                      className="px-5 py-2 rounded-xl bg-brand text-brand-foreground text-xs font-bold shadow hover:opacity-95 transition-all"
                    >
                      {processingId === req.id ? 'Accepting...' : 'Accept Request'}
                    </button>
                    <Link
                      href={`/shipments/${req.readable_id}`}
                      className="px-3 py-2 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Distributor Actions & Corridors Quick Access */}
      {isDistributor && (
        <section aria-label="Distributor Quick Launch">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-brand uppercase tracking-wider">
                  Outbound Freight Dispatch
                </span>
                <h3 className="text-lg font-bold text-foreground mt-1">Create & Send Consignment Request</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Dispatch commodities (Oranges, Fruits, Agri-produce) from Nashik or regional farms to verified collectors in Pune.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-brand py-3 text-xs font-semibold text-brand-foreground shadow hover:opacity-95 transition-all"
              >
                <Plus className="h-4 w-4" /> Create Shipment Request
              </button>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                  Partner Network Directory
                </span>
                <h3 className="text-lg font-bold text-foreground mt-1">Find Verified Collectors</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Locate certified wholesale market receivers in Pune Market Yard, Mumbai APMC, and Thane ready for produce acceptance.
                </p>
              </div>
              <Link
                href="/network/collectors"
                className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/40 py-3 text-xs font-semibold text-foreground hover:bg-muted transition-all"
              >
                <Building2 className="h-4 w-4 text-brand" /> Browse Verified Collectors Directory
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Active Moving Shipments Feed */}
      <section aria-label="Active Shipments">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Active Logistics Consignments</h3>
              <p className="text-xs text-muted-foreground">Synchronized across participant nodes</p>
            </div>
            <Link
              href="/shipments"
              className="text-xs font-semibold text-brand hover:underline flex items-center gap-1"
            >
              <span>View All ({shipments.length})</span> <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {shipments.slice(0, 4).map((s) => (
              <div
                key={s.id}
                className="flex flex-wrap items-center justify-between rounded-xl border border-border bg-muted/20 p-4 gap-4 text-xs hover:border-brand/40 transition-all"
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
                      {s.distributor_name || 'Distributor'} → {s.collector_name || 'Collector'} ({s.origin} to {s.destination})
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-foreground">
                    ₹{Number(s.value).toLocaleString('en-IN')}
                  </span>
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
                    <span>Track & Settle</span> <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Corridor Telemetry & Volume Chart */}
      <section
        aria-label="Corridor Telemetry and Volume"
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        <div className="lg:col-span-6 xl:col-span-5">
          <LiveMapPreviewCard />
        </div>
        <div className="lg:col-span-6 xl:col-span-7">
          <WeeklyVolumeChart />
        </div>
      </section>

      {/* Bottom Row: Recent Operational Alerts Feed */}
      <section aria-label="Recent Operational Alerts">
        <RecentAlertsFeed />
      </section>

      {/* Create Shipment Modal */}
      <CreateShipmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={() => refreshShipments()}
      />
    </div>
  );
}
