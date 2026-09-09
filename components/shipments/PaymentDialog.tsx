'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  ShieldCheck,
  Zap,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { paymentService, PaymentMethodType } from '@/lib/services/payment';
import { ShipmentEntity } from '@/lib/db/repo';

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  shipment: ShipmentEntity;
  onPaymentSuccess: (result: any) => void;
}

export function PaymentDialog({
  isOpen,
  onClose,
  shipment,
  onPaymentSuccess,
}: PaymentDialogProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('RAZORPAY');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handlePay = async () => {
    setIsProcessing(true);
    setError('');

    try {
      const result = await paymentService.processPayment(selectedMethod, {
        shipmentId: shipment.id,
        readableId: shipment.readable_id,
        amount: Number(shipment.value),
        currency: shipment.currency || 'INR',
        commodity: shipment.commodity,
        quantity: shipment.received_quantity || shipment.expected_quantity,
        distributorName: shipment.distributor_name || 'Pune Fresh Logistics',
        collectorName: shipment.collector_name || 'Pune City Produce Collector',
      });

      if (!result.success) {
        throw new Error(result.error || 'Payment could not be processed');
      }

      setSuccessInfo(result);
      onPaymentSuccess(result);
    } catch (err: any) {
      setError(err.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyHash = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-neutral-200 bg-white p-6 md:p-8 shadow-2xl text-neutral-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 pb-4 mb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">Multi-Rail Settlement Gateway</span>
            <h2 className="text-xl font-bold text-neutral-900">Settle Shipment {shipment.readable_id}</h2>
          </div>
          <div className="text-right">
            <span className="text-xs text-neutral-500">Settlement Total</span>
            <div className="text-2xl font-bold font-mono text-neutral-900">
              ₹{Number(shipment.value).toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-600 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success confirmation state */}
        {successInfo ? (
          <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50 border border-emerald-200">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Payment Verified & Settled</h3>
              <p className="text-xs text-neutral-500">
                Transaction finalized via {successInfo.method}. Shipment status updated to COMPLETED.
              </p>
            </div>

            {successInfo.transactionHash && (
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-left">
                <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-1">
                  <span>Cryptographic / Gateway Hash:</span>
                  <button
                    type="button"
                    onClick={() => copyHash(successInfo.transactionHash)}
                    className="flex items-center gap-1 text-brand-600 hover:underline"
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="font-mono text-xs break-all font-semibold text-neutral-900">
                  {successInfo.transactionHash}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl bg-brand-500 hover:bg-brand-600 py-3 text-sm font-semibold text-white shadow-md transition-all cursor-pointer"
            >
              View Updated Transaction Ledger
            </button>
          </div>
        ) : (
          <div>
            {/* Payment Method Selector */}
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
              Select Settlement Rail
            </label>

            <div className="space-y-2.5 mb-6">
              {/* 1. Razorpay */}
              <button
                type="button"
                onClick={() => setSelectedMethod('RAZORPAY')}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                  selectedMethod === 'RAZORPAY'
                    ? 'border-brand-500 bg-brand-50/70 ring-1 ring-brand-500 shadow-xs'
                    : 'border-neutral-200 bg-neutral-50/60 hover:border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0C2340] text-white">
                    <CreditCard className="h-5 w-5 text-[#3399CC]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-neutral-900">Razorpay Test Checkout</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
                        UPI • Cards • NetBanking
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Server-verified HMAC SHA256 test payment gateway.
                    </p>
                  </div>
                </div>
                {selectedMethod === 'RAZORPAY' && <CheckCircle2 className="h-5 w-5 text-brand-600" />}
              </button>

              {/* 2. MetaMask EVM */}
              <button
                type="button"
                onClick={() => setSelectedMethod('METAMASK')}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                  selectedMethod === 'METAMASK'
                    ? 'border-brand-500 bg-brand-50/70 ring-1 ring-brand-500 shadow-xs'
                    : 'border-neutral-200 bg-neutral-50/60 hover:border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F6851B]/15 text-[#F6851B]">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-neutral-900">MetaMask (EVM Testnet)</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                        Web3 Escrow
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Direct browser wallet connection & smart escrow transaction hash.
                    </p>
                  </div>
                </div>
                {selectedMethod === 'METAMASK' && <CheckCircle2 className="h-5 w-5 text-brand-600" />}
              </button>

              {/* 3. Stellar */}
              <button
                type="button"
                onClick={() => setSelectedMethod('STELLAR')}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                  selectedMethod === 'STELLAR'
                    ? 'border-brand-500 bg-brand-50/70 ring-1 ring-brand-500 shadow-xs'
                    : 'border-neutral-200 bg-neutral-50/60 hover:border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-neutral-900">Stellar Network (Testnet)</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                        XLM Ledger
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Sub-second low-cost cross-border remittance and ledger settlement.
                    </p>
                  </div>
                </div>
                {selectedMethod === 'STELLAR' && <CheckCircle2 className="h-5 w-5 text-brand-600" />}
              </button>
            </div>

            {/* Primary Action Button */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={handlePay}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-600 py-3.5 text-sm font-semibold text-white shadow-md hover:shadow-lg disabled:opacity-50 transition-all mb-4 cursor-pointer"
            >
              {isProcessing ? 'Processing & Verifying Payment...' : `Pay ₹${Number(shipment.value).toLocaleString('en-IN')} with ${selectedMethod}`}
            </button>

            {/* Pitch/Demo Resilience Button (Section 21 Requirement) */}
            <div className="border-t border-neutral-200 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">Need instantaneous demo approval?</span>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => {
                    setSelectedMethod('DEMO');
                    setTimeout(() => {
                      paymentService
                        .processPayment('DEMO', {
                          shipmentId: shipment.id,
                          readableId: shipment.readable_id,
                          amount: Number(shipment.value),
                          currency: shipment.currency || 'INR',
                          commodity: shipment.commodity,
                          quantity: shipment.received_quantity || shipment.expected_quantity,
                          distributorName: shipment.distributor_name || 'Pune Fresh Logistics',
                          collectorName: shipment.collector_name || 'Pune City Produce Collector',
                        })
                        .then((res) => {
                          setSuccessInfo(res);
                          onPaymentSuccess(res);
                        })
                        .catch((e) => setError(e.message));
                    }, 50);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-amber-500/40 bg-amber-50 text-amber-800 text-xs font-bold hover:bg-amber-100 transition-all cursor-pointer"
                >
                  <span>⚡ Demo: Mark as Paid</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-200 uppercase font-extrabold text-amber-900">
                    DEMO ONLY
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
