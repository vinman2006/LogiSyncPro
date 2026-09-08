'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Menu,
  Search,
  Bell,
  Building2,
  ChevronDown,
  Check,
  UserCheck,
  Shield,
  Briefcase,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLogistics } from '@/lib/context/LogisticsContext';
import { MOCK_DATA_HUBS } from '@/lib/mock-data/dashboard';
import { UserRole } from '@/lib/mock-data/types';

interface TopbarProps {
  onOpenMobileMenu: () => void;
  pageTitle?: string;
}

const ROLES: Array<{ role: UserRole; icon: React.ComponentType<{ className?: string }>; description: string }> = [
  { role: 'Admin', icon: Shield, description: 'Full access to all operations, AI, and company settings' },
  { role: 'Manager', icon: Briefcase, description: 'Manage fleet, corridors, and warehouse dispatches' },
  { role: 'Staff', icon: UserCheck, description: 'Daily consignment intake and delivery updates' },
  { role: 'Viewer', icon: Eye, description: 'Read-only analytics and SLA audit reporting' },
];

export function Topbar({ onOpenMobileMenu, pageTitle }: TopbarProps) {
  const {
    selectedHub,
    changeHub,
    user,
    switchUserRole,
    alerts,
    unreadAlertsCount,
    markAlertAsRead,
    setSearchOpen,
  } = useLogistics();

  const [hubDropdownOpen, setHubDropdownOpen] = useState(false);
  const [alertDropdownOpen, setAlertDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-border px-4 sm:px-6 flex items-center justify-between gap-3">
      {/* Left Section: Mobile Menu Trigger + Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="p-2 -ml-1 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex flex-col">
          <span className="text-xs text-neutral-400 font-medium">LogiSync Pro</span>
          <span className="text-sm font-heading font-semibold text-neutral-900 truncate">
            {pageTitle || 'Operations Overview'}
          </span>
        </div>
      </div>

      {/* Middle Section: Global Search Bar (Click or Ctrl+K triggers SearchDialog) */}
      <div className="flex-1 max-w-md mx-2 sm:mx-4">
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="relative w-full h-9 pl-9 pr-12 text-left text-xs sm:text-sm bg-neutral-100/80 hover:bg-neutral-100 focus:bg-white text-neutral-500 rounded-lg border border-transparent hover:border-border transition-all flex items-center"
          title="Open Global Search (Ctrl + K)"
        >
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <span className="truncate">Search consignment, truck (e.g. MH-12), or SKU...</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 bg-white border border-neutral-300 rounded shadow-xs pointer-events-none">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right Section: Hub Switcher + Alert Bell + User Menu */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Logistics Hub Switcher Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setHubDropdownOpen(!hubDropdownOpen);
              setAlertDropdownOpen(false);
              setUserMenuOpen(false);
            }}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-50 hover:bg-neutral-100 border border-border rounded-lg transition-colors"
            title="Switch Active Logistics Hub"
          >
            <Building2 className="w-3.5 h-3.5 text-neutral-500" />
            <span className="hidden md:inline max-w-[130px] truncate">
              {selectedHub.name}
            </span>
            <span className="md:hidden text-xs">{selectedHub.code}</span>
            <ChevronDown className="w-3 h-3 text-neutral-400" />
          </button>

          {hubDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-64 bg-white border border-border rounded-xl shadow-md py-1.5 z-50 animate-in fade-in slide-in-from-top-1"
              onMouseLeave={() => setHubDropdownOpen(false)}
            >
              <div className="px-3 py-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider border-b border-neutral-100">
                Switch Active Hub
              </div>
              {MOCK_DATA_HUBS.map((hub) => (
                <button
                  key={hub.id}
                  type="button"
                  onClick={() => {
                    changeHub(hub);
                    setHubDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-neutral-50 text-xs transition-colors"
                >
                  <div>
                    <div className="font-medium text-neutral-800">{hub.name}</div>
                    <div className="text-[11px] text-neutral-500">
                      {hub.city} • {hub.activeVehicles} active trucks
                    </div>
                  </div>
                  {hub.id === selectedHub.id && (
                    <Check className="w-4 h-4 text-brand-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Alerts Bell Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setAlertDropdownOpen(!alertDropdownOpen);
              setHubDropdownOpen(false);
              setUserMenuOpen(false);
            }}
            className="relative p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label={`View alerts (${unreadAlertsCount} unread)`}
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            {unreadAlertsCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-critical-600 text-white text-[10px] font-bold flex items-center justify-center tabular-nums shadow-xs animate-pulse">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {alertDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-border rounded-xl shadow-lg p-2 z-50 animate-in fade-in slide-in-from-top-1"
              onMouseLeave={() => setAlertDropdownOpen(false)}
            >
              <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-100">
                <span className="text-xs font-semibold text-neutral-900">
                  Operational Alerts ({unreadAlertsCount} unread)
                </span>
                <Link
                  href="/alerts"
                  className="text-xs text-brand-600 hover:underline font-medium"
                  onClick={() => setAlertDropdownOpen(false)}
                >
                  View full feed
                </Link>
              </div>

              <div className="divide-y divide-neutral-100 max-h-72 overflow-y-auto py-1">
                {alerts.length === 0 ? (
                  <div className="py-6 text-center text-xs text-neutral-400">
                    No active alerts
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => markAlertAsRead(alert.id)}
                      className="px-3 py-2.5 hover:bg-neutral-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={cn(
                            'w-2 h-2 rounded-full mt-1.5 shrink-0',
                            alert.severity === 'critical' && 'bg-critical-600',
                            alert.severity === 'warning' && 'bg-warning-600',
                            alert.severity === 'info' && 'bg-info-600'
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-medium text-neutral-900 truncate">
                              {alert.title}
                            </span>
                            {!alert.isRead && (
                              <span className="text-[10px] text-critical-600 font-semibold shrink-0">
                                New
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-neutral-500 line-clamp-1">
                            {alert.message}
                          </div>
                          <div className="text-[10px] text-neutral-400 mt-0.5 tabular-nums">
                            {alert.relativeTime}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Role Switcher Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setUserMenuOpen(!userMenuOpen);
              setHubDropdownOpen(false);
              setAlertDropdownOpen(false);
            }}
            className="flex items-center gap-2 pl-2 border-l border-border hover:opacity-90 transition-opacity"
            title="User Profile & Role Permissions"
          >
            <div className="w-8 h-8 rounded-full bg-brand-50 border border-brand-500/20 text-brand-600 flex items-center justify-center text-xs font-bold shadow-xs">
              {user.avatarInitials}
            </div>

            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-medium text-neutral-900 leading-tight">
                {user.name}
              </span>
              <span className="text-[10px] text-neutral-500 leading-tight">
                {user.companyName}
              </span>
            </div>

            {/* Role Pill */}
            <span
              className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border border-neutral-300 bg-neutral-100 text-neutral-800"
              title={`Active Role: ${user.role} (Click to switch)`}
            >
              {user.role}
            </span>
          </button>

          {userMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-72 bg-white border border-border rounded-xl shadow-lg p-2 z-50 animate-in fade-in slide-in-from-top-1"
              onMouseLeave={() => setUserMenuOpen(false)}
            >
              <div className="px-3 py-2 border-b border-neutral-100">
                <div className="text-xs font-bold text-neutral-900">{user.name}</div>
                <div className="text-[11px] text-neutral-500">{user.email}</div>
                <div className="text-[10px] text-neutral-400 font-medium mt-0.5 truncate">
                  {user.companyName}
                </div>
              </div>

              <div className="py-2">
                <div className="px-3 pb-1.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Switch Operational Role
                </div>

                {ROLES.map(({ role, icon: RoleIcon, description }) => {
                  const isCurrent = user.role === role;

                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        switchUserRole(role);
                        setUserMenuOpen(false);
                      }}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs transition-colors',
                        isCurrent
                          ? 'bg-brand-50 text-brand-600 font-medium'
                          : 'hover:bg-neutral-50 text-neutral-700'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <RoleIcon className={cn('w-4 h-4', isCurrent ? 'text-brand-600' : 'text-neutral-400')} />
                        <div>
                          <div className="font-medium leading-tight">{role}</div>
                          <div className="text-[10px] text-neutral-400 leading-tight truncate max-w-[180px]">
                            {description}
                          </div>
                        </div>
                      </div>

                      {isCurrent && <Check className="w-3.5 h-3.5 text-brand-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-neutral-100">
                <Link
                  href="/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="block px-3 py-1.5 text-xs text-neutral-600 hover:text-brand-600 hover:bg-neutral-50 rounded-lg transition-colors"
                >
                  Organization Settings & RBAC
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
