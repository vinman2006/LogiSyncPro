'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
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
  ChevronLeft,
  ChevronRight,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LogoIcon } from '@/components/ui/Logo';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  badgeVariant?: 'brand' | 'critical' | 'neutral';
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [
      {
        label: 'Dashboard',
        href: '/',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: 'Operations',
    items: [
      {
        label: 'Consignments & Shipments',
        href: '/shipments',
        icon: PackageCheck,
      },
      {
        label: 'Find Collectors',
        href: '/network/collectors',
        icon: Share2,
      },
      {
        label: 'Node Network',
        href: '/supply-chain',
        icon: Share2,
      },
      {
        label: 'Fleet Management',
        href: '/fleet',
        icon: Truck,
      },
      {
        label: 'Live GPS Map',
        href: '/live-map',
        icon: MapPin,
      },
      {
        label: 'Warehouse & Stock',
        href: '/warehouse',
        icon: Boxes,
      },
      {
        label: 'Delivery Tracker',
        href: '/delivery',
        icon: PackageCheck,
      },
    ],
  },
  {
    title: 'Intelligence',
    items: [
      {
        label: 'Route AI Optimization',
        href: '/route-ai',
        icon: Sparkles,
        badge: 'AI',
        badgeVariant: 'brand',
      },
      {
        label: 'Demand Forecasting',
        href: '/forecasting',
        icon: TrendingUp,
      },
      {
        label: 'Driver Analytics',
        href: '/driver-analytics',
        icon: UserCheck,
      },
      {
        label: 'Blockchain Verify',
        href: '/blockchain',
        icon: ShieldCheck,
      },
    ],
  },
  {
    title: 'Admin',
    items: [
      {
        label: 'Alert Center',
        href: '/alerts',
        icon: Bell,
        badge: 3,
        badgeVariant: 'critical',
      },
      {
        label: 'Settings & Roles',
        href: '/settings',
        icon: Settings,
      },
    ],
  },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-primary-subtle border-r border-border transition-all duration-300 ease-in-out',
          // Mobile state: slide in / out
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          // Desktop width: 260px expanded / 72px collapsed
          isCollapsed ? 'w-[72px]' : 'w-[260px]'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border shrink-0 bg-white">
          <Link
            href="/"
            className={cn(
              'flex items-center gap-2.5 overflow-hidden transition-all',
              isCollapsed && 'justify-center w-full px-0'
            )}
            onClick={() => onMobileClose()}
          >
            {/* Logo Mark: Concept 1 Signal + Motion */}
            <LogoIcon size={34} />

            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-heading font-bold text-base text-neutral-900 tracking-tight">
                    LogiSync
                  </span>
                  <span className="font-heading font-extrabold text-xs px-1.5 py-0.5 rounded bg-brand-50 text-brand-600 border border-brand-500/20">
                    PRO
                  </span>
                </div>
                <span className="text-[10px] text-neutral-500 font-medium tracking-wide truncate">
                  MSME Logistics Platform
                </span>
              </div>
            )}
          </Link>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={onMobileClose}
            className="p-1.5 text-neutral-500 hover:text-neutral-800 rounded-md lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items (Scrollable) */}
        <nav
          aria-label="Main Navigation"
          className="flex-1 overflow-y-auto px-3 py-4 space-y-6"
        >
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 pb-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  {section.title}
                </div>
              )}

              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === '/'
                      ? pathname === '/'
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => onMobileClose()}
                      title={isCollapsed ? item.label : undefined}
                      className={cn(
                        'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors relative',
                        isActive
                          ? 'border-l-4 border-brand-600 bg-brand-50 text-brand-600 font-medium shadow-sm'
                          : 'text-neutral-600 hover:bg-neutral-100/80 hover:text-neutral-900 font-normal',
                        isCollapsed && 'justify-center px-0'
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-5 h-5 shrink-0 transition-colors',
                          isActive
                            ? 'text-brand-600'
                            : 'text-neutral-500 group-hover:text-neutral-800'
                        )}
                        strokeWidth={isActive ? 2.2 : 1.8}
                      />

                      {!isCollapsed && (
                        <span className="truncate flex-1">{item.label}</span>
                      )}

                      {!isCollapsed && item.badge && (
                        <span
                          className={cn(
                            'ml-auto text-[11px] font-semibold px-1.5 py-0.2 rounded-full tabular-nums',
                            item.badgeVariant === 'critical' &&
                              'bg-critical-50 text-critical-600 border border-critical-600/20',
                            item.badgeVariant === 'brand' &&
                              'bg-brand-50 text-brand-600 border border-brand-500/20',
                            item.badgeVariant === 'neutral' &&
                              'bg-neutral-100 text-neutral-600'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer with Collapse Toggle (Desktop only) */}
        <div className="hidden lg:flex items-center justify-between p-3 border-t border-border bg-white/70">
          {!isCollapsed && (
            <div className="flex items-center gap-2 pl-2">
              <span className="w-2 h-2 rounded-full bg-success-600 animate-pulse" />
              <span className="text-xs text-neutral-500 font-medium">
                System Live • GPS On
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn(
              'p-2 rounded-lg text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors',
              isCollapsed && 'mx-auto'
            )}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
