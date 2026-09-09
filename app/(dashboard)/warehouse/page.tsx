'use client';

import React, { useState } from 'react';
import {
  Boxes,
  Search,
  Plus,
  AlertCircle,
  Thermometer,
  RotateCw,
  Building2,
  TrendingDown,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useLogistics } from '@/lib/context/LogisticsContext';

interface InventoryItem {
  sku: string;
  name: string;
  category: 'Packaging' | 'Fresh Produce' | 'Cold-Chain Pharma' | 'Pallet Supplies';
  hub: 'Bhiwandi Central Hub' | 'Okhla Industrial DC' | 'Peenya Logistics Park';
  zone: 'Ambient' | 'Cold (0-4°C)' | 'Frozen (-18°C)';
  quantity: number;
  unit: string;
  minThreshold: number;
  temperature?: number;
  status: 'Healthy' | 'Low Stock' | 'Critical Reorder';
}

const INVENTORY_DATA: InventoryItem[] = [
  {
    sku: 'IND-5521',
    name: '5-Ply Heavy Corrugated Produce Box',
    category: 'Packaging',
    hub: 'Bhiwandi Central Hub',
    zone: 'Ambient',
    quantity: 140,
    unit: 'boxes',
    minThreshold: 300,
    status: 'Low Stock',
  },
  {
    sku: 'AGR-ORG-01',
    name: 'Maharashtra Sweet Nagpur Oranges (Grade A)',
    category: 'Fresh Produce',
    hub: 'Bhiwandi Central Hub',
    zone: 'Cold (0-4°C)',
    quantity: 3450,
    unit: 'kg',
    minThreshold: 1000,
    temperature: 3.2,
    status: 'Healthy',
  },
  {
    sku: 'PLT-WD-12',
    name: 'Euro Spec Heat-Treated Wooden Pallets',
    category: 'Pallet Supplies',
    hub: 'Peenya Logistics Park',
    zone: 'Ambient',
    quantity: 85,
    unit: 'pallets',
    minThreshold: 200,
    status: 'Low Stock',
  },
  {
    sku: 'MED-VACC-09',
    name: 'Temperature-Sensitive Biological Vials',
    category: 'Cold-Chain Pharma',
    hub: 'Okhla Industrial DC',
    zone: 'Frozen (-18°C)',
    quantity: 1200,
    unit: 'vials',
    minThreshold: 500,
    temperature: -18.4,
    status: 'Healthy',
  },
  {
    sku: 'STR-FILM-80',
    name: 'Industrial Stretch Wrap Film (23 Micron)',
    category: 'Packaging',
    hub: 'Bhiwandi Central Hub',
    zone: 'Ambient',
    quantity: 45,
    unit: 'rolls',
    minThreshold: 100,
    status: 'Critical Reorder',
  },
  {
    sku: 'AGR-GRP-04',
    name: 'Nashik Export Table Grapes',
    category: 'Fresh Produce',
    hub: 'Bhiwandi Central Hub',
    zone: 'Cold (0-4°C)',
    quantity: 2100,
    unit: 'kg',
    minThreshold: 800,
    temperature: 2.1,
    status: 'Healthy',
  },
];

export default function WarehousePage() {
  const { showToast } = useLogistics();
  const [items, setItems] = useState<InventoryItem[]>(INVENTORY_DATA);
  const [selectedHub, setSelectedHub] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const handleReorder = (item: InventoryItem) => {
    setItems((prev) =>
      prev.map((i) =>
        i.sku === item.sku
          ? { ...i, quantity: i.quantity + i.minThreshold, status: 'Healthy' as const }
          : i
      )
    );
    showToast(
      'Purchase Reorder Dispatched',
      `Auto-generated PO for +${item.minThreshold} ${item.unit} of ${item.name}.`,
      'success'
    );
  };

  const filtered = items.filter((i) => {
    if (selectedHub !== 'ALL' && i.hub !== selectedHub) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      i.name.toLowerCase().includes(q) ||
      i.sku.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q) ||
      i.zone.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Warehouse & Stock Operations"
        description="Multi-hub SKU inventory, temperature-controlled zone monitoring (Ambient/Cold/Frozen), bin locations, and threshold triggers"
        breadcrumbs={[{ label: 'Warehouse & Inventory' }]}
        showDemoBadge={true}
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">Monitored SKU Items</span>
          <div className="text-2xl font-mono font-bold text-foreground mt-1">1,248 SKUs</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Across 3 regional mega DCs</div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">Low Stock Flags</span>
          <div className="text-2xl font-mono font-bold text-amber-600 mt-1">
            {items.filter((i) => i.status !== 'Healthy').length} SKUs
          </div>
          <div className="text-[11px] text-amber-700/80 mt-0.5">Reorder required</div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">Cold Store Zones</span>
          <div className="text-2xl font-mono font-bold text-sky-600 mt-1">2,400 sq.m</div>
          <div className="text-[11px] text-sky-600 mt-0.5">Continuous telemetry logging</div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground">Inventory Turnover</span>
          <div className="text-2xl font-mono font-bold text-emerald-600 mt-1">14.2 Days</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Fast produce cycling</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          {['ALL', 'Bhiwandi Central Hub', 'Okhla Industrial DC', 'Peenya Logistics Park'].map((hub) => (
            <button
              key={hub}
              onClick={() => setSelectedHub(hub)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                selectedHub === hub
                  ? 'bg-brand text-brand-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {hub === 'ALL' ? 'All Hubs' : hub.replace(' Logistics Park', '').replace(' Industrial DC', '').replace(' Central Hub', '')}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search SKU, produce, box..."
            className="w-full h-9 pl-9 pr-3 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                <th className="px-4 py-3">SKU & Item Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Hub & Zone</th>
                <th className="px-4 py-3">Stock Level</th>
                <th className="px-4 py-3">Health Status</th>
                <th className="px-4 py-3 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((item) => (
                <tr key={item.sku} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-foreground">{item.name}</div>
                    <span className="font-mono text-[11px] text-brand bg-brand/10 px-1.5 py-0.2 rounded font-semibold">
                      #{item.sku}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-muted-foreground font-medium">
                    {item.category}
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-semibold text-foreground">{item.hub}</div>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                      {item.zone.includes('Cold') || item.zone.includes('Frozen') ? (
                        <span className="inline-flex items-center gap-1 text-sky-600 font-mono font-bold">
                          <Thermometer className="w-3 h-3" /> {item.zone} ({item.temperature}°C)
                        </span>
                      ) : (
                        <span>{item.zone} Zone</span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-mono font-bold text-foreground text-sm">
                      {item.quantity.toLocaleString()} {item.unit}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Min Threshold: {item.minThreshold.toLocaleString()} {item.unit}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'Healthy'
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : item.status === 'Low Stock'
                          ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                          : 'bg-red-500/10 text-red-600 border border-red-500/20'
                      }`}
                    >
                      ● {item.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleReorder(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand text-brand-foreground font-semibold text-xs hover:opacity-95 transition-all shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Order Restock</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
