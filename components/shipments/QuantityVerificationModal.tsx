'use client';

import React, { useState } from 'react';
import { PackageCheck, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

interface QuantityVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipmentId: string;
  expectedQuantity: number;
  unit: string;
  commodity: string;
  onVerified: (updatedShipment: any) => void;
}

export function QuantityVerificationModal({
  isOpen,
  onClose,
  shipmentId,
  expectedQuantity,
  unit,
  commodity,
  onVerified,
}: QuantityVerificationModalProps) {
  const [receivedQty, setReceivedQty] = useState<number>(980);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const difference = Number(receivedQty) - Number(expectedQuantity);

  const handleConfirm = async () => {
    if (!receivedQty || receivedQty <= 0) {
      setError('Please enter a valid received quantity.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/shipments/${shipmentId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_quantity',
          receivedQuantity: Number(receivedQty),
          location: 'Pune Market Yard Destination Dock #4',
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to verify quantity');

      onVerified(data.shipment);
      onClose();
    } catch (e: any) {
      setError(e.message || 'Verification failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 md:p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
            <PackageCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Collector Receiving Dock Verification</h3>
            <p className="text-xs text-muted-foreground">Verify physical weigh-bridge scale weight before payment</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3 mb-5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Commodity:</span>
            <span className="font-bold text-foreground">{commodity}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Expected Dispatched Quantity:</span>
            <span className="font-bold text-foreground">
              {expectedQuantity} {unit}
            </span>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Actual Weighed Quantity Received ({unit})
            </label>
            <input
              type="number"
              step="any"
              value={receivedQty}
              onChange={(e) => setReceivedQty(Number(e.target.value))}
              placeholder="e.g. 980"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-lg font-mono font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          {/* Variance calculation banner */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-medium ${
              difference === 0
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                : difference < 0
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-400'
                : 'bg-brand/10 border-brand/20 text-brand'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Weight Variance:</span>
            </div>
            <span className="font-mono font-bold text-sm">
              {difference > 0 ? `+${difference}` : difference} {unit}{' '}
              {difference < 0 ? '(Transit shrinkage/loss)' : difference === 0 ? '(Exact match)' : ''}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleConfirm}
            className="flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-brand-foreground shadow hover:opacity-95 disabled:opacity-50 transition-all"
          >
            {submitting ? 'Recording Verification...' : 'Confirm Received Quantity'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
