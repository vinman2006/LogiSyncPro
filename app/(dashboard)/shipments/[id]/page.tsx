'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Truck,
  CheckCircle2,
  XCircle,
  PackageCheck,
  CreditCard,
  Building2,
  MapPin,
  Calendar,
  IndianRupee,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  RotateCw,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useNetwork } from '@/lib/context/NetworkContext';
import { ShipmentEntity, ShipmentEventEntity } from '@/lib/db/repo';
import { ShipmentTimeline } from '@/components/shipments/ShipmentTimeline';
import { TruckRouteMap } from '@/components/shipments/TruckRouteMap';
import { QuantityVerificationModal } from '@/components/shipments/QuantityVerificationModal';
import { PaymentDialog } from '@/components/shipments/PaymentDialog';

export default function ShipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const shipmentId = params.id as string;
  const { currentNode, refreshShipments } = useNetwork();

  const [shipment, setShipment] = useState<ShipmentEntity | null>(null);
  const [events, setEvents] = useState<ShipmentEventEntity[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTechDetails, setShowTechDetails] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const fetchDetails = useCallback(async () => {
    try {
      const res = await fetch(`/api/shipments/${shipmentId}`);
      const data = await res.json();
      if (data.success) {
        setShipment(data.shipment);
        setEvents(data.events || []);
        setAuditLogs(data.auditLogs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [shipmentId]);

  useEffect(() => {
    fetchDetails();
    // Fast polling for realtime status sync
    const interval = setInterval(fetchDetails, 3000);
    return () => clearInterval(interval);
  }, [fetchDetails]);

  const handleAction = async (action: string, payload: any = {}) => {
    setActionLoading(true);
    setActionMessage('');
    try {
      const res = await fetch(`/api/shipments/${shipmentId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          actorId: currentNode?.id,
          ...payload,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Action failed');

      setShipment(data.shipment);
      await fetchDetails();
      await refreshShipments();
    } catch (err: any) {
      setActionMessage(err.message || 'Action error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !shipment) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RotateCw className="h-8 w-8 animate-spin text-brand" />
          <p className="text-sm font-medium text-muted-foreground">Loading shipment data...</p>
        </div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-foreground">Shipment Not Found</h2>
        <p className="text-sm text-muted-foreground mt-2">The requested shipment ID does not exist.</p>
        <Link
          href="/shipments"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Shipments
        </Link>
      </div>
    );
  }

  const isDistributor = !currentNode || currentNode.role === 'DISTRIBUTOR';
  const isCollector = currentNode?.role === 'COLLECTOR';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/shipments')}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold font-mono text-foreground">{shipment.readable_id}</h1>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  shipment.status === 'COMPLETED'
                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                    : shipment.status === 'IN_TRANSIT'
                    ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                    : 'bg-brand/10 text-brand border border-brand/20'
                }`}
              >
                ● {shipment.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {shipment.commodity} • {shipment.origin} → {shipment.destination}
            </p>
          </div>
        </div>

        {/* Dynamic Action Trigger Button based on State Machine */}
        <div className="flex items-center gap-2">
          {shipment.status === 'REQUESTED' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleAction('reject')}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm font-semibold hover:bg-destructive/20 transition-all"
              >
                <XCircle className="h-4 w-4" /> Reject
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleAction('accept')}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-brand text-brand-foreground text-sm font-semibold shadow hover:opacity-95 transition-all"
              >
                <CheckCircle2 className="h-4 w-4" /> Accept Shipment
              </button>
            </div>
          )}

          {shipment.status === 'ACCEPTED' && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => handleAction('in_transit')}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand text-brand-foreground text-sm font-semibold shadow hover:opacity-95 transition-all"
            >
              <Truck className="h-4 w-4" />
              {actionLoading ? 'Dispatching...' : 'Dispatch & Move In Transit'}
            </button>
          )}

          {shipment.status === 'IN_TRANSIT' && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => handleAction('mark_arrived')}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold shadow hover:opacity-95 transition-all"
            >
              <CheckCircle2 className="h-4 w-4" />
              {actionLoading ? 'Updating...' : 'Mark as Arrived in City'}
            </button>
          )}

          {shipment.status === 'ARRIVED' && (
            <button
              type="button"
              onClick={() => setShowVerifyModal(true)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold shadow hover:opacity-95 transition-all animate-pulse"
            >
              <PackageCheck className="h-4 w-4" /> Verify Received Quantity
            </button>
          )}

          {shipment.status === 'PAYMENT_PENDING' && (
            <button
              type="button"
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand text-brand-foreground text-sm font-semibold shadow hover:opacity-95 transition-all animate-pulse"
            >
              <CreditCard className="h-4 w-4" /> Settle & Pay ₹{Number(shipment.value).toLocaleString('en-IN')}
            </button>
          )}

          {shipment.status === 'COMPLETED' && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm font-bold">
              <ShieldCheck className="h-5 w-5" /> Transaction Completed & Verified
            </div>
          )}
        </div>
      </div>

      {actionMessage && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
          {actionMessage}
        </div>
      )}

      {/* Primary Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <span className="text-xs text-muted-foreground font-medium">Commodity & Quantity</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{shipment.commodity}</span>
            <span className="text-sm font-mono font-bold text-brand">
              {shipment.expected_quantity} {shipment.unit}
            </span>
          </div>
          {shipment.received_quantity && (
            <div className="mt-2 text-xs text-emerald-600 font-semibold">
              ✓ Verified: {shipment.received_quantity} {shipment.unit} (
              {Number(shipment.received_quantity) - Number(shipment.expected_quantity)} {shipment.unit})
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <span className="text-xs text-muted-foreground font-medium">Distributor Node</span>
          <div className="mt-2">
            <div className="text-base font-bold text-foreground truncate">
              {shipment.distributor_name || 'Pune Fresh Logistics'}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="h-3.5 w-3.5 text-brand" /> {shipment.origin}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <span className="text-xs text-muted-foreground font-medium">Collector Node</span>
          <div className="mt-2">
            <div className="text-base font-bold text-foreground truncate">
              {shipment.collector_name || 'Pune City Produce Collector'}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Building2 className="h-3.5 w-3.5 text-emerald-600" /> {shipment.destination}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <span className="text-xs text-muted-foreground font-medium">Settlement Value</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-foreground">
              ₹{Number(shipment.value).toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-muted-foreground">INR</span>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            Multi-Rail: Razorpay • MetaMask • Stellar
          </div>
        </div>
      </div>

      {/* Live Route & Tracking */}
      <TruckRouteMap
        shipmentId={shipment.id}
        status={shipment.status}
        origin={shipment.origin}
        destination={shipment.destination}
      />

      {/* Stepper Timeline & Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verification Timeline */}
        <ShipmentTimeline shipment={shipment} events={events} />

        {/* Audit Log / Chain of Custody */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Audit Log & Chain of Custody</h3>
              <p className="text-xs text-muted-foreground">Permanent chronological audit record</p>
            </div>
            <span className="text-xs font-mono font-semibold text-muted-foreground">
              {auditLogs.length} Records
            </span>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {auditLogs.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No audit events recorded yet.
              </div>
            ) : (
              auditLogs.map((log, idx) => (
                <div
                  key={log.id || idx}
                  className="rounded-xl border border-border bg-muted/20 p-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-foreground">{log.action}</span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  {log.metadata && (
                    <div className="mt-1 text-[11px] text-muted-foreground font-mono truncate">
                      {JSON.stringify(log.metadata)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Technical Details Drawer (Requirement 47) */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <button
          type="button"
          onClick={() => setShowTechDetails(!showTechDetails)}
          className="flex w-full items-center justify-between text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <span>View Cryptographic & Technical Details</span>
          {showTechDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showTechDetails && (
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 rounded-xl bg-muted/30 border border-border">
              <div className="text-muted-foreground text-[10px] uppercase">PostgreSQL UUID</div>
              <div className="mt-1 text-foreground font-bold break-all">{shipment.id}</div>
            </div>
            <div className="p-3 rounded-xl bg-muted/30 border border-border">
              <div className="text-muted-foreground text-[10px] uppercase">Distributor Node Code</div>
              <div className="mt-1 text-foreground font-bold">{shipment.distributor_node_id}</div>
            </div>
            <div className="p-3 rounded-xl bg-muted/30 border border-border">
              <div className="text-muted-foreground text-[10px] uppercase">Collector Node Code</div>
              <div className="mt-1 text-foreground font-bold">{shipment.collector_node_id}</div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <QuantityVerificationModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        shipmentId={shipment.id}
        expectedQuantity={Number(shipment.expected_quantity)}
        unit={shipment.unit}
        commodity={shipment.commodity}
        onVerified={(updated) => setShipment(updated)}
      />

      <PaymentDialog
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        shipment={shipment}
        onPaymentSuccess={() => {
          fetchDetails();
          refreshShipments();
        }}
      />
    </div>
  );
}
