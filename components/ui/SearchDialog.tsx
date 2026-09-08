'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  Truck,
  MapPin,
  Boxes,
  PackageCheck,
  Share2,
  Sparkles,
  TrendingUp,
  UserCheck,
  ShieldCheck,
  Bell,
  Settings,
  Building2,
  FileText,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLogistics } from '@/lib/context/LogisticsContext';

interface SearchResultItem {
  id: string;
  title: string;
  category: 'Module' | 'Truck' | 'Hub' | 'SKU / Consignment';
  description: string;
  icon: LucideIcon;
  href: string;
}

const SEARCH_DATABASE: SearchResultItem[] = [
  // Modules
  { id: 'm-dashboard', title: 'Dashboard Overview', category: 'Module', description: 'Main operational overview and KPIs', icon: MapPin, href: '/' },
  { id: 'm-fleet', title: 'Fleet Management', category: 'Module', description: 'Vehicle asset health, permits, and fuel telemetry', icon: Truck, href: '/fleet' },
  { id: 'm-live-map', title: 'Live GPS Fleet Map', category: 'Module', description: 'Real-time vehicle corridor tracking and ETAs', icon: MapPin, href: '/live-map' },
  { id: 'm-warehouse', title: 'Warehouse & Inventory', category: 'Module', description: 'Temperature zone stock & reorder levels', icon: Boxes, href: '/warehouse' },
  { id: 'm-delivery', title: 'Last-Mile Delivery Tracker', category: 'Module', description: 'Kanban dispatch boards and digital ePOD', icon: PackageCheck, href: '/delivery' },
  { id: 'm-supply-chain', title: 'Supply Chain Visibility', category: 'Module', description: 'Multi-tier supplier pipeline & GST compliance', icon: Share2, href: '/supply-chain' },
  { id: 'm-route-ai', title: 'Route AI Optimization', category: 'Module', description: 'AI corridor solver for fuel and toll minimization', icon: Sparkles, href: '/route-ai' },
  { id: 'm-forecasting', title: 'Demand Forecasting', category: 'Module', description: 'Festive season SKU demand curve prediction', icon: TrendingUp, href: '/forecasting' },
  { id: 'm-driver', title: 'Driver Analytics', category: 'Module', description: 'Safety scorecards and trip efficiency incentives', icon: UserCheck, href: '/driver-analytics' },
  { id: 'm-blockchain', title: 'Blockchain Verification', category: 'Module', description: 'Tamper-proof e-Way bill audit ledger', icon: ShieldCheck, href: '/blockchain' },
  { id: 'm-alerts', title: 'Alert Center', category: 'Module', description: 'Corridor exception inbox and escalation dispatch', icon: Bell, href: '/alerts' },
  { id: 'm-settings', title: 'Settings & Roles', category: 'Module', description: 'Company hubs, roles, and Tally/ERP integrations', icon: Settings, href: '/settings' },

  // Tracked Vehicles
  { id: 'v-mh12', title: 'Truck MH-12-Q-4491 (Tata Signa)', category: 'Truck', description: 'En route NH-48 Pune-Mumbai corridor (Delayed 45m)', icon: Truck, href: '/live-map' },
  { id: 'v-dl01', title: 'Reefer Truck DL-01-AX-9920', category: 'Truck', description: 'Cold-chain Reefer (7.8°C temp exception flagged)', icon: Truck, href: '/fleet' },
  { id: 'v-ka04', title: 'Truck KA-04-E-1029 (Eicher Pro)', category: 'Truck', description: 'Idle at Peenya Logistics Gate 3 (115 mins)', icon: Truck, href: '/driver-analytics' },

  // Hubs
  { id: 'h-bhw', title: 'Bhiwandi Central Hub (MH)', category: 'Hub', description: 'Western Corridor Mega DC (24 trucks active)', icon: Building2, href: '/' },
  { id: 'h-okh', title: 'Okhla Industrial DC (Delhi NCR)', category: 'Hub', description: 'Northern Hub & Cold-Chain Depot', icon: Building2, href: '/' },
  { id: 'h-pny', title: 'Peenya Logistics Park (Bengaluru)', category: 'Hub', description: 'Southern Express Distribution Center', icon: Building2, href: '/' },

  // SKUs & Consignments
  { id: 's-5521', title: 'SKU #IND-5521 (Corrugated 5-Ply)', category: 'SKU / Consignment', description: 'Bhiwandi Hub inventory (140 left - low stock)', icon: FileText, href: '/warehouse' },
  { id: 'c-98204', title: 'Consignment CN-98204-MH', category: 'SKU / Consignment', description: 'Blockchain verified e-Way Bill #88392019482', icon: FileText, href: '/blockchain' },
];

export function SearchDialog() {
  const { searchOpen, setSearchOpen } = useLogistics();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, setSearchOpen]);

  // Focus input on open
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [searchOpen]);

  if (!searchOpen) return null;

  const filteredResults = query.trim()
    ? SEARCH_DATABASE.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      )
    : SEARCH_DATABASE.slice(0, 7); // Default suggestions

  const handleSelect = (item: SearchResultItem) => {
    setSearchOpen(false);
    router.push(item.href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredResults.length) % filteredResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        handleSelect(filteredResults[selectedIndex]);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-neutral-900/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => setSearchOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-white border border-border rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className="flex items-center px-4 border-b border-border bg-neutral-50/50">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search modules, trucks (MH-12), SKUs, or hubs..."
            className="w-full h-13 px-3 text-sm bg-transparent text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-neutral-400 hover:text-neutral-700 rounded-md mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 bg-white border border-neutral-300 rounded shadow-xs">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-neutral-100">
          {filteredResults.length === 0 ? (
            <div className="py-10 text-center text-xs text-neutral-400">
              No matching records found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            filteredResults.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    'w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between gap-3 transition-colors',
                    isSelected
                      ? 'bg-brand-50/80 text-neutral-900'
                      : 'hover:bg-neutral-50 text-neutral-700'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border',
                        isSelected
                          ? 'bg-brand-500 text-white border-brand-600'
                          : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-neutral-100 text-neutral-500 border border-neutral-200 shrink-0">
                          {item.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-500 truncate mt-0.5">
                        {item.description}
                      </div>
                    </div>
                  </div>

                  <ChevronRight
                    className={cn(
                      'w-4 h-4 shrink-0 transition-transform',
                      isSelected ? 'text-brand-600 translate-x-0.5' : 'text-neutral-300'
                    )}
                  />
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts info */}
        <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>Instant Logistics Search</span>
        </div>
      </div>
    </div>
  );
}
