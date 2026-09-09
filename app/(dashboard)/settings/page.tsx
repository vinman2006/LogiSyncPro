'use client';

import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Building2,
  Database,
  Key,
  CheckCircle2,
  UserCheck,
  Briefcase,
  Eye,
  Save,
  Radio,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from '@/lib/context/AuthContext';
import { useNetwork } from '@/lib/context/NetworkContext';
import { NeonDatabaseViewer } from '@/components/database/NeonDatabaseViewer';

export default function SettingsPage() {
  const { userName, user: authUser, userNode } = useAuth();
  const { currentNode, switchDemoRole } = useNetwork();

  const [activeTab, setActiveTab] = useState<'general' | 'roles' | 'database'>('database');
  const [savedNotice, setSavedNotice] = useState(false);

  // Form states
  const [companyName, setCompanyName] = useState(userNode?.name || `${userName || 'Vineet'} Fresh Logistics`);
  const [operatingCity, setOperatingCity] = useState(userNode?.city || 'Pune');
  const [gstin, setGstin] = useState('27AABCU9603R1ZM');
  const [fastagEnabled, setFastagEnabled] = useState(true);

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Settings & Organization Control"
        description="Manage company hubs, Neon PostgreSQL configuration, and supply chain participant roles"
        breadcrumbs={[{ label: 'Settings' }]}
        showDemoBadge={true}
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('database')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'database'
              ? 'bg-brand text-brand-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Live Neon DB Ledger</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'general'
              ? 'bg-brand text-brand-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Company & GST Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'roles'
              ? 'bg-brand text-brand-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Role Permissions (RBAC)</span>
        </button>
      </div>

      {savedNotice && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>Settings saved and synchronized with Neon Database.</span>
        </div>
      )}

      {/* TAB 1: NEON DATABASE */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          <NeonDatabaseViewer />
        </div>
      )}

      {/* TAB 2: GENERAL SETTINGS */}
      {activeTab === 'general' && (
        <div className="max-w-2xl space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-base font-bold text-foreground">Organization Details</h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-foreground mb-1">Company / Hub Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-foreground mb-1">Operating Hub City</label>
                <input
                  type="text"
                  value={operatingCity}
                  onChange={(e) => setOperatingCity(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">GSTIN Number</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand uppercase font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={fastagEnabled}
                  onChange={(e) => setFastagEnabled(e.target.checked)}
                  className="rounded border-border text-brand focus:ring-brand h-4 w-4"
                />
                <span className="font-semibold text-foreground">Enable Automated FASTag Corridor Toll API</span>
              </label>
              <p className="text-[11px] text-muted-foreground ml-6 mt-0.5">
                Automatically logs toll passage timestamps into consignment event tracking.
              </p>
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand text-brand-foreground font-semibold shadow hover:opacity-95 transition-all"
              >
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ROLE PERMISSIONS (RBAC) */}
      {activeTab === 'roles' && (
        <div className="space-y-4 max-w-3xl">
          <div className="p-4 rounded-2xl border border-border bg-card shadow-sm">
            <h3 className="text-base font-bold text-foreground">Operational Roles in Supply Chain</h3>
            <p className="text-xs text-muted-foreground mt-0.5 mb-4">
              Select or switch the active participant node permissions for demo simulations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  role: 'DISTRIBUTOR' as const,
                  title: 'Distributor',
                  badge: 'Primary Node',
                  desc: 'Creates consignments, tracks fleets, coordinates dispatch.',
                  icon: Briefcase,
                },
                {
                  role: 'COLLECTOR' as const,
                  title: 'Collector',
                  badge: 'Receiving Dock',
                  desc: 'Accepts shipments, verifies weighbridge quantity, settles payment.',
                  icon: UserCheck,
                },
                {
                  role: 'FARMER' as const,
                  title: 'Farmer / Producer',
                  badge: 'Origin Farm',
                  desc: 'Supplies raw produce, monitors farmgate pickup and receipts.',
                  icon: Eye,
                },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = currentNode?.role === item.role;
                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => switchDemoRole(item.role)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-brand bg-brand/5 ring-1 ring-brand'
                        : 'border-border bg-muted/20 hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-brand' : 'text-muted-foreground'}`} />
                      {isSelected && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand text-brand-foreground">ACTIVE</span>}
                    </div>
                    <div className="font-bold text-sm text-foreground">{item.title}</div>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{item.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
