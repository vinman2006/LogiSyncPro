'use client';

import React, { useState } from 'react';
import {
  PackageCheck,
  Search,
  Plus,
  Truck,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  ChevronRight,
  ShieldCheck,
  QrCode,
  ArrowRight,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useLogistics } from '@/lib/context/LogisticsContext';

type Stage = 'Assigned' | 'In Transit' | 'Out for Delivery' | 'Delivered';

interface DeliveryOrder {
  id: string;
  trackingCode: string;
  consignee: string;
  address: string;
  items: string;
  carrier: string;
  stage: Stage;
  eta: string;
  otpCode: string;
  isDelayed?: boolean;
}

const INITIAL_DELIVERIES: DeliveryOrder[] = [
  {
    id: 'ord-01',
    trackingCode: 'DLV-2026-8801',
    consignee: 'Kalyani Wholesale Produce',
    address: 'Market Yard Gate 4, Gultekdi, Pune',
    items: '1,000 kg Nagpur Sweet Oranges',
    carrier: 'Tata Signa (MH-12-Q-4491)',
    stage: 'In Transit',
    eta: 'Today, 18:30 IST',
    otpCode: '4829',
  },
  {
    id: 'ord-02',
    trackingCode: 'DLV-2026-8802',
    consignee: 'Apollo Cold-Chain Depot',
    address: 'Okhla Phase 3 Industrial Area, New Delhi',
    items: '500 kg Temperature Sensitive Produce',
    carrier: 'BharatBenz Reefer (DL-01-AX-9920)',
    stage: 'Out for Delivery',
    eta: 'Today, 15:45 IST',
    otpCode: '9120',
  },
  {
    id: 'ord-03',
    trackingCode: 'DLV-2026-8803',
    consignee: 'Peenya Retail Supermarket Co-op',
    address: 'Peenya 2nd Stage, Bengaluru',
    items: '80 Crates Fresh Pomegranates',
    carrier: 'Eicher Pro (KA-04-E-1029)',
    stage: 'Assigned',
    eta: 'Tomorrow, 10:00 IST',
    otpCode: '3381',
  },
  {
    id: 'ord-04',
    trackingCode: 'DLV-2026-8804',
    consignee: 'Sahyadri Agro Processing Ltd',
    address: 'MIDC Bhosari, Pune',
    items: '2,500 kg Processing Citrus',
    carrier: 'Mahindra Blazo (MH-14-BT-3321)',
    stage: 'Delivered',
    eta: 'Delivered Today 11:20 IST',
    otpCode: '7740',
  },
];

const STAGES: Stage[] = ['Assigned', 'In Transit', 'Out for Delivery', 'Delivered'];

export default function DeliveryPage() {
  const { showToast } = useLogistics();
  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>(INITIAL_DELIVERIES);
  const [activeTab, setActiveTab] = useState<string>('ALL');

  const advanceStage = (id: string) => {
    setDeliveries((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        const currIdx = STAGES.indexOf(d.stage);
        if (currIdx < STAGES.length - 1) {
          const nextStage = STAGES[currIdx + 1];
          showToast(
            'Order Status Advanced',
            `Order ${d.trackingCode} is now in "${nextStage}".`,
            'success'
          );
          return { ...d, stage: nextStage };
        }
        return d;
      })
    );
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Last-Mile Delivery Tracker"
        description="Interactive dispatch Kanban board with digital ePOD signatures, customer OTP receipts, and delay mitigation"
        breadcrumbs={[{ label: 'Last-Mile Delivery' }]}
        showDemoBadge={true}
      />

      {/* Kanban Stages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAGES.map((stage) => {
          const stageOrders = deliveries.filter((d) => d.stage === stage);
          return (
            <div
              key={stage}
              className="flex flex-col rounded-2xl border border-border bg-muted/20 p-4 shadow-sm"
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      stage === 'Delivered'
                        ? 'bg-emerald-500'
                        : stage === 'Out for Delivery'
                        ? 'bg-brand'
                        : stage === 'In Transit'
                        ? 'bg-amber-500'
                        : 'bg-neutral-400'
                    }`}
                  />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">
                    {stage}
                  </h3>
                </div>
                <span className="font-mono text-xs font-bold text-muted-foreground px-2 py-0.5 rounded-full bg-background">
                  {stageOrders.length}
                </span>
              </div>

              {/* Order Cards */}
              <div className="space-y-3 flex-1">
                {stageOrders.length === 0 ? (
                  <div className="py-12 text-center text-xs text-muted-foreground">
                    No active shipments in this stage
                  </div>
                ) : (
                  stageOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-4 rounded-xl border border-border bg-card shadow-xs hover:border-brand/40 transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[11px] text-brand bg-brand/10 px-2 py-0.5 rounded">
                          {ord.trackingCode}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                          OTP: <strong className="text-foreground">{ord.otpCode}</strong>
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-xs text-foreground leading-snug">
                          {ord.consignee}
                        </h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                          {ord.items}
                        </p>
                      </div>

                      <div className="text-[11px] text-muted-foreground space-y-1 pt-2 border-t border-border/50">
                        <div className="flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                          <span className="truncate">{ord.address}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Truck className="w-3 h-3 text-brand shrink-0" />
                          <span className="truncate">{ord.carrier}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-muted-foreground shrink-0" />
                          <span>{ord.eta}</span>
                        </div>
                      </div>

                      {stage !== 'Delivered' && (
                        <button
                          type="button"
                          onClick={() => advanceStage(ord.id)}
                          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-brand/10 hover:bg-brand text-brand hover:text-brand-foreground text-xs font-semibold transition-all cursor-pointer"
                        >
                          <span>Move to Next Stage</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
