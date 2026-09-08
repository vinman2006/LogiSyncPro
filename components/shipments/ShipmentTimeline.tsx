'use client';

import React from 'react';
import {
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  CreditCard,
  Flag,
  CircleDot,
  FileCheck,
} from 'lucide-react';
import { ShipmentEntity, ShipmentEventEntity } from '@/lib/db/repo';

interface ShipmentTimelineProps {
  shipment: ShipmentEntity;
  events: ShipmentEventEntity[];
}

interface StepDef {
  key: string;
  label: string;
  icon: any;
  isCompleted: (status: string, events: ShipmentEventEntity[]) => boolean;
  isActive: (status: string) => boolean;
}

export const TIMELINE_STEPS: StepDef[] = [
  {
    key: 'CREATED',
    label: 'Shipment Created',
    icon: FileCheck,
    isCompleted: (s) => s !== 'DRAFT',
    isActive: (s) => s === 'DRAFT',
  },
  {
    key: 'REQUESTED',
    label: 'Collector Requested',
    icon: Clock,
    isCompleted: (s) => s !== 'DRAFT',
    isActive: (s) => s === 'REQUESTED',
  },
  {
    key: 'ACCEPTED',
    label: 'Collector Accepted',
    icon: CheckCircle2,
    isCompleted: (s) =>
      ['ACCEPTED', 'IN_TRANSIT', 'ARRIVED', 'RECEIVED', 'PAYMENT_PENDING', 'PAYMENT_VERIFIED', 'COMPLETED'].includes(s),
    isActive: (s) => s === 'ACCEPTED',
  },
  {
    key: 'IN_TRANSIT',
    label: 'Loaded & In Transit',
    icon: Truck,
    isCompleted: (s) =>
      ['ARRIVED', 'RECEIVED', 'PAYMENT_PENDING', 'PAYMENT_VERIFIED', 'COMPLETED'].includes(s),
    isActive: (s) => s === 'IN_TRANSIT',
  },
  {
    key: 'ARRIVED',
    label: 'Arrived at Destination',
    icon: CircleDot,
    isCompleted: (s) =>
      ['RECEIVED', 'PAYMENT_PENDING', 'PAYMENT_VERIFIED', 'COMPLETED'].includes(s),
    isActive: (s) => s === 'ARRIVED',
  },
  {
    key: 'QUANTITY_VERIFIED',
    label: 'Quantity Verified',
    icon: PackageCheck,
    isCompleted: (s, ev) =>
      ev.some((e) => e.event_type === 'QUANTITY_VERIFIED') ||
      ['PAYMENT_PENDING', 'PAYMENT_VERIFIED', 'COMPLETED'].includes(s),
    isActive: (s) => s === 'RECEIVED' || s === 'PAYMENT_PENDING',
  },
  {
    key: 'PAYMENT_VERIFIED',
    label: 'Payment Verified',
    icon: CreditCard,
    isCompleted: (s, ev) =>
      ev.some((e) => e.event_type === 'PAYMENT_VERIFIED') || ['PAYMENT_VERIFIED', 'COMPLETED'].includes(s),
    isActive: (s) => s === 'PAYMENT_PENDING',
  },
  {
    key: 'COMPLETED',
    label: 'Transaction Completed',
    icon: Flag,
    isCompleted: (s) => s === 'COMPLETED',
    isActive: (s) => s === 'COMPLETED',
  },
];

export function ShipmentTimeline({ shipment, events }: ShipmentTimelineProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-foreground">Logistics Verification Stepper</h3>
          <p className="text-xs text-muted-foreground">Immutable state machine lifecycle & multi-participant approvals</p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
            shipment.status === 'COMPLETED'
              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
              : shipment.status === 'IN_TRANSIT'
              ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
              : 'bg-brand/10 text-brand border border-brand/20'
          }`}
        >
          ● Status: {shipment.status.replace('_', ' ')}
        </span>
      </div>

      <div className="relative pl-6 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-muted-foreground/20">
        {TIMELINE_STEPS.map((step) => {
          const completed = step.isCompleted(shipment.status, events);
          const active = step.isActive(shipment.status);
          const Icon = step.icon;

          // Find associated event for timestamp if present
          const matchingEvent = events.find(
            (e) =>
              e.event_type === step.key ||
              (step.key === 'REQUESTED' && e.event_type === 'COLLECTOR_REQUESTED') ||
              (step.key === 'ACCEPTED' && e.event_type === 'COLLECTOR_ACCEPTED') ||
              (step.key === 'IN_TRANSIT' && e.event_type === 'SHIPMENT_IN_TRANSIT') ||
              (step.key === 'ARRIVED' && e.event_type === 'SHIPMENT_ARRIVED')
          );

          return (
            <div key={step.key} className="relative flex items-start gap-4">
              {/* Step indicator node */}
              <div
                className={`absolute -left-6 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                  completed
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : active
                    ? 'border-brand bg-brand text-brand-foreground ring-4 ring-brand/20 animate-pulse'
                    : 'border-muted-foreground/30 bg-background text-muted-foreground'
                }`}
              >
                {completed ? (
                  <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-current" />
                )}
              </div>

              <div className="flex-1 -mt-0.5">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-semibold ${
                      completed
                        ? 'text-foreground'
                        : active
                        ? 'text-brand font-bold'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </span>
                  {matchingEvent && (
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {new Date(matchingEvent.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>

                {matchingEvent?.location && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Location: <span className="font-medium text-foreground">{matchingEvent.location}</span>
                  </p>
                )}

                {step.key === 'QUANTITY_VERIFIED' && shipment.received_quantity && (
                  <div className="mt-1.5 inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    <span>Expected: {shipment.expected_quantity} {shipment.unit}</span>
                    <span>•</span>
                    <span className="font-bold">Received: {shipment.received_quantity} {shipment.unit}</span>
                    <span>•</span>
                    <span className="text-destructive font-semibold">
                      Diff: {Number(shipment.received_quantity) - Number(shipment.expected_quantity)} {shipment.unit}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
