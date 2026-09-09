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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7 shadow-2xl text-neutral-900">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
            <PackageCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-neutral-900 truncate">Collector Dock Verification</h3>
            <p className="text-xs text-neutral-500">Verify physical weigh-bridge scale weight before payment</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-600 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3.5 sm:p-4 space-y-2.5 sm:space-y-3 mb-5">
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-neutral-500">Commodity:</span>
            <span className="font-bold text-neutral-900">{commodity}</span>
          </div>
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-neutral-500">Expected Quantity:</span>
            <span className="font-bold text-neutral-900">
              {expectedQuantity} {unit}
            </span>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Actual Weighed Quantity Received ({unit})
            </label>
            <input
              type="number"
              step="any"
              value={receivedQty}
              onChange={(e) => setReceivedQty(Number(e.target.value))}
              placeholder="e.g. 980"
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-lg font-mono font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Variance calculation banner */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-medium ${
              difference === 0
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : difference < 0
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-brand-50 border-brand-500/20 text-brand-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Weight Variance:</span>
            </div>
            <span className="font-mono font-bold text-xs sm:text-sm">
              {difference > 0 ? `+${difference}` : difference} {unit}{' '}
              {difference < 0 ? '(Transit shrinkage/loss)' : difference === 0 ? '(Exact match)' : ''}
            </span>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleConfirm}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg disabled:opacity-50 transition-all cursor-pointer"
          >
            {submitting ? 'Recording Verification...' : 'Confirm Received Quantity'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
