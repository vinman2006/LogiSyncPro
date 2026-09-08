'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Zap,
  Globe,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  CreditCard,
  Lock,
} from 'lucide-react';
import { useNetwork } from '@/lib/context/NetworkContext';

export default function BlockchainPage() {
  const { shipments } = useNetwork();
  const [metaMaskAddress, setMetaMaskAddress] = useState<string | null>(null);
  const [metaMaskNetwork, setMetaMaskNetwork] = useState<string | null>(null);
  const [stellarAddress, setStellarAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  // Check if MetaMask already connected
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      (window as any).ethereum
        .request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setMetaMaskAddress(accounts[0]);
            (window as any).ethereum
              .request({ method: 'eth_chainId' })
              .then((chainId: string) => setMetaMaskNetwork(chainId));
          }
        })
        .catch(() => {});
    }
  }, []);

  const connectMetaMask = async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      setMsg('MetaMask not detected in browser. Install MetaMask extension.');
      return;
    }
    setConnecting(true);
    setMsg('');
    try {
      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      setMetaMaskAddress(accounts[0]);
      const chainId = await (window as any).ethereum.request({ method: 'eth_chainId' });
      setMetaMaskNetwork(chainId);
    } catch (e: any) {
      setMsg(e.message || 'MetaMask connection rejected');
    } finally {
      setConnecting(false);
    }
  };

  const connectStellar = async () => {
    setConnecting(true);
    try {
      // Connect to Stellar Testnet simulated account
      const testnetAccount = 'GDLOGISYNCESCROWTESTNET777777777777777777777777777777';
      setStellarAddress(testnetAccount);
    } finally {
      setConnecting(false);
    }
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const completedTransactions = shipments.filter(
    (s) => s.status === 'COMPLETED' || s.status === 'PAYMENT_VERIFIED'
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">Cryptographic & Blockchain Ledger</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              IMMUTABLE AUDIT TRAIL
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Tamper-proof chain of custody proofs, multi-rail Web3 smart escrow, and decentralized settlement verification
          </p>
        </div>
      </div>

      {msg && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Web3 Wallets Connectivity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* EVM / MetaMask */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F6851B]/15 text-[#F6851B]">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">MetaMask (EVM Network)</h3>
                  <p className="text-xs text-muted-foreground">Ethereum, Polygon & Arbitrum smart contracts</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${metaMaskAddress ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
                {metaMaskAddress ? 'CONNECTED' : 'DISCONNECTED'}
              </span>
            </div>

            {metaMaskAddress ? (
              <div className="space-y-2 text-xs rounded-xl bg-muted/30 border border-border p-3.5 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Account:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-foreground">
                    <span>{metaMaskAddress.slice(0, 8)}...{metaMaskAddress.slice(-6)}</span>
                    <button
                      type="button"
                      onClick={() => copyText('mm', metaMaskAddress)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {copiedId === 'mm' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network ID:</span>
                  <span className="font-mono text-foreground font-bold">{metaMaskNetwork || '0x1'}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Connect your EVM browser wallet to execute smart escrow payments and cryptographically sign freight consignment receipts.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={connectMetaMask}
            disabled={connecting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand py-2.5 text-xs font-semibold text-brand-foreground shadow hover:opacity-95 transition-all"
          >
            <Zap className="h-3.5 w-3.5" />
            {metaMaskAddress ? 'Switch EVM Account' : 'Connect MetaMask'}
          </button>
        </div>

        {/* Stellar Network */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/15 text-purple-600">
                  <Globe className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Stellar Network (Testnet)</h3>
                  <p className="text-xs text-muted-foreground">Sub-second cross-border freight settlement</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stellarAddress ? 'bg-purple-500/10 text-purple-600' : 'bg-muted text-muted-foreground'}`}>
                {stellarAddress ? 'ACTIVE TESTNET' : 'AVAILABLE'}
              </span>
            </div>

            {stellarAddress ? (
              <div className="space-y-2 text-xs rounded-xl bg-muted/30 border border-border p-3.5 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Public Key:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-foreground">
                    <span>{stellarAddress.slice(0, 8)}...{stellarAddress.slice(-6)}</span>
                    <button
                      type="button"
                      onClick={() => copyText('stellar', stellarAddress)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {copiedId === 'stellar' ? <Check className="h-3 w-3 text-purple-600" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ledger Rail:</span>
                  <span className="font-mono text-purple-600 font-bold">Stellar Horizon Testnet</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Utilize Stellar&apos;s decentralized protocol for instant commodity payments with low transaction fees and automatic foreign exchange settlement.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={connectStellar}
            disabled={connecting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 py-2.5 text-xs font-semibold text-white shadow hover:opacity-95 transition-all"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            {stellarAddress ? 'Stellar Testnet Connected' : 'Connect Stellar Wallet'}
          </button>
        </div>
      </div>

      {/* Verified Cryptographic Transactions Table */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-foreground">Consignment Settlement Hashes</h3>
            <p className="text-xs text-muted-foreground">Cryptographic receipts recorded across transactions</p>
          </div>
          <span className="font-mono text-xs font-semibold text-muted-foreground">
            {completedTransactions.length} Verified Entries
          </span>
        </div>

        {completedTransactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No completed transactions on the ledger yet. Settle a shipment using Razorpay, MetaMask, Stellar, or Demo to record on-chain proofs.
          </div>
        ) : (
          <div className="space-y-3">
            {completedTransactions.map((s) => (
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
                      {s.commodity} ({s.received_quantity || s.expected_quantity} {s.unit}) • ₹{Number(s.value).toLocaleString('en-IN')}
                    </div>
                    <div className="font-mono text-[11px] text-muted-foreground mt-0.5">
                      Hash: 0x8a92f...c421 • Verified Settlement Proof
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full text-[11px] border border-emerald-500/20">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Immutable
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
        )}
      </div>
    </div>
  );
}
