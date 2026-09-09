'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  RefreshCw,
  Table,
  Users,
  Building2,
  Package,
  CreditCard,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface TableCounts {
  users?: number;
  businesses?: number;
  nodes?: number;
  shipments?: number;
  payments?: number;
}

export function NeonDatabaseViewer() {
  const [selectedTable, setSelectedTable] = useState<string>('users');
  const [rows, setRows] = useState<any[]>([]);
  const [counts, setCounts] = useState<TableCounts>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lastRefreshed, setLastRefreshed] = useState<string>('');
  const [error, setError] = useState<string>('');

  const fetchTableData = async (table: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/neon/tables?table=${encodeURIComponent(table)}`);
      const data = await res.json();
      if (data.success) {
        setRows(data.rows || []);
        if (data.counts) setCounts(data.counts);
        setLastRefreshed(new Date().toLocaleTimeString('en-IN', { hour12: true }));
      } else {
        setError(data.error || 'Failed to fetch table data');
      }
    } catch (err: any) {
      setError(err.message || 'Network connection failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTableData(selectedTable);
  }, [selectedTable]);

  // Filter rows based on search
  const filteredRows = rows.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return Object.values(r).some(
      (val) => val !== null && val !== undefined && String(val).toLowerCase().includes(q)
    );
  });

  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <div className="space-y-6">
      {/* Neon Live Connection Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-neutral-950 dark:text-neutral-50">
                Neon Serverless PostgreSQL (Production)
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ONLINE • AWS US-EAST-2
              </span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
              Live database queries executing against table: <code className="font-mono font-bold text-emerald-700 dark:text-emerald-300">neondb.{selectedTable}</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {lastRefreshed && (
            <span className="text-[11px] text-neutral-500 flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3" /> {lastRefreshed}
            </span>
          )}
          <button
            type="button"
            onClick={() => fetchTableData(selectedTable)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 shadow-xs transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Live Data</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Strip across Neon Tables */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { key: 'users', label: 'Registered Users', icon: Users, count: counts.users ?? 0, color: 'text-brand' },
          { key: 'businesses', label: 'Registered Businesses', icon: Building2, count: counts.businesses ?? 0, color: 'text-sky-600' },
          { key: 'nodes', label: 'Active Supply Nodes', icon: Building2, count: counts.nodes ?? 0, color: 'text-amber-600' },
          { key: 'shipments', label: 'Consignments', icon: Package, count: counts.shipments ?? 0, color: 'text-purple-600' },
          { key: 'payments', label: 'Payment Transactions', icon: CreditCard, count: counts.payments ?? 0, color: 'text-emerald-600' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isCurrent = selectedTable === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedTable(tab.key)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isCurrent
                  ? 'border-brand bg-brand/5 ring-2 ring-brand/30 shadow-sm'
                  : 'border-border bg-card hover:bg-muted/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-4 h-4 ${tab.color}`} />
                <span className="font-mono text-lg font-black text-foreground">{tab.count}</span>
              </div>
              <div className="text-xs font-medium text-muted-foreground mt-2">{tab.label}</div>
            </button>
          );
        })}
      </div>

      {/* Search & Table Viewer Card */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Card Header & Controls */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-brand" />
            <h4 className="text-sm font-bold text-foreground capitalize">
              Table: <span className="font-mono text-brand font-black">{selectedTable}</span>
            </h4>
            <span className="text-xs text-muted-foreground">({filteredRows.length} records)</span>
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search table values..."
              className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
        </div>

        {/* Live Table */}
        <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
          {loading ? (
            <div className="py-16 text-center">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand mb-2" />
              <p className="text-xs text-muted-foreground">Querying Neon Postgres...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-xs text-destructive">
              Error querying table: {error}
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="py-16 text-center">
              <Database className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-foreground">No records found in {selectedTable}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedTable === 'users'
                  ? 'Sign up or log in to see a real-time entry inserted here.'
                  : 'New entries created in the app will appear live in this table.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/50 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider sticky top-0 backdrop-blur-xs">
                  {columns.map((col) => (
                    <th key={col} className="px-4 py-3 whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono text-[11px]">
                {filteredRows.map((row, idx) => (
                  <tr
                    key={row.id || idx}
                    className="hover:bg-brand/5 transition-colors group"
                  >
                    {columns.map((col) => {
                      const val = row[col];
                      let displayVal = val;
                      if (typeof val === 'object' && val !== null) {
                        displayVal = JSON.stringify(val);
                      } else if (col.includes('_at') && val) {
                        displayVal = new Date(val).toLocaleString('en-IN');
                      }

                      const isKeyField = col === 'email' || col === 'readable_id' || col === 'name' || col === 'business_name';

                      return (
                        <td key={col} className="px-4 py-3 whitespace-nowrap text-foreground">
                          {isKeyField ? (
                            <span className="font-sans font-bold text-brand bg-brand/10 px-2 py-0.5 rounded text-xs">
                              {String(displayVal)}
                            </span>
                          ) : col === 'id' || col.includes('_id') ? (
                            <span className="text-muted-foreground truncate max-w-[120px] inline-block" title={String(displayVal)}>
                              {String(displayVal).slice(0, 8)}…
                            </span>
                          ) : (
                            <span className="truncate max-w-[200px] inline-block" title={String(displayVal)}>
                              {String(displayVal ?? '—')}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
