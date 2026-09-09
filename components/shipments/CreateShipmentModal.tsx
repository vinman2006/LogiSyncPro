'use client';

import React, { useState, useEffect } from 'react';
import {
  PackagePlus,
  Send,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { NodeEntity } from '@/lib/db/repo';
import { useNetwork } from '@/lib/context/NetworkContext';
import { useAuth } from '@/lib/context/AuthContext';

interface CreateShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (shipment: any) => void;
  preselectedCollectorId?: string;
}

export function CreateShipmentModal({
  isOpen,
  onClose,
  onCreated,
  preselectedCollectorId,
}: CreateShipmentModalProps) {
  const { currentNode, refreshShipments } = useNetwork();
  const { userName } = useAuth();
  const initiatorName = userName || 'Vineet';

  const [collectors, setCollectors] = useState<NodeEntity[]>([]);
  const [collectorId, setCollectorId] = useState(preselectedCollectorId || '');
  const [commodity, setCommodity] = useState('Oranges');
  const [quantity, setQuantity] = useState('1000');
  const [unit, setUnit] = useState('kg');
  const [origin, setOrigin] = useState('Nashik, Maharashtra');
  const [destination, setDestination] = useState('Market Yard, Pune, Maharashtra');
  const [value, setValue] = useState('50000');
  const [expectedArrival, setExpectedArrival] = useState('Today, 18:30 IST');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch available collectors
  useEffect(() => {
    async function loadCollectors() {
      try {
        const res = await fetch('/api/nodes/collectors');
        const data = await res.json();
        if (data.success && data.collectors?.length > 0) {
          setCollectors(data.collectors);
          if (!collectorId) {
            setCollectorId(data.collectors[0].id);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    if (isOpen) {
      loadCollectors();
    }
  }, [isOpen, collectorId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectorId) {
      setError('Please select a verified collector node.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          distributor_node_id: currentNode?.id || 'node-dist-001',
          collector_node_id: collectorId,
          farmer_node_id: 'node-farmer-001',
          commodity,
          expected_quantity: Number(quantity),
          unit,
          origin,
          destination,
          value: Number(value),
          currency: 'INR',
          expected_arrival: expectedArrival,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to dispatch shipment request');

      await refreshShipments();
      onCreated(data.shipment);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Creation error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl border border-neutral-200 bg-white shadow-2xl text-neutral-900 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-neutral-100 flex items-center gap-3 shrink-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 border border-brand-500/20">
            <PackagePlus className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-neutral-900 truncate">Create & Dispatch Consignment</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 border border-brand-500/20 shrink-0">
                Initiated by {initiatorName}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5 truncate">
              Initiate a verified supply chain transaction from {currentNode?.name || `${initiatorName} Fresh Logistics`}
            </p>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-600 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form id="create-shipment-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Commodity & Quantity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Commodity / Produce</label>
                <input
                  type="text"
                  value={commodity}
                  onChange={(e) => setCommodity(e.target.value)}
                  placeholder="e.g. Oranges"
                  required
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Quantity & Unit</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="1000"
                    required
                    className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-mono font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 shrink-0"
                  >
                    <option value="kg">kg</option>
                    <option value="crates">crates</option>
                    <option value="tonnes">tonnes</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Collector Selection */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Destination Collector Node
              </label>
              <div className="relative">
                <select
                  value={collectorId}
                  onChange={(e) => setCollectorId(e.target.value)}
                  required
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {collectors.length === 0 ? (
                    <option value="node-coll-001">Pune City Produce Collector (Pune)</option>
                  ) : (
                    collectors.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} • {c.city} ({c.status})
                      </option>
                    ))
                  )}
                </select>
                <Building2 className="absolute right-4 top-3 h-4 w-4 text-neutral-400 pointer-events-none" />
              </div>
            </div>

            {/* Origin & Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Dispatch Origin</label>
                <div className="relative">
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    required
                    className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Delivery Destination</label>
                <div className="relative">
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                    className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>

            {/* Settlement Value & Expected Arrival */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Consignment Value (₹)</label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="50000"
                  required
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-mono font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Expected Delivery ETA</label>
                <input
                  type="text"
                  value={expectedArrival}
                  onChange={(e) => setExpectedArrival(e.target.value)}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-neutral-100 bg-neutral-50/60 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-shipment-form"
            disabled={submitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg disabled:opacity-50 transition-all cursor-pointer"
          >
            <Send className="h-4 w-4" />
            {submitting ? 'Dispatching Request...' : 'Send Shipment Request'}
          </button>
        </div>
      </div>
    </div>
  );
}
