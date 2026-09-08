'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  WarehouseHub,
  KpiMetric,
  AlertItem,
  UserProfile,
  UserRole,
} from '@/lib/mock-data/types';
import {
  MOCK_DATA_HUBS,
  MOCK_DATA_KPIS,
  MOCK_DATA_ALERTS,
  MOCK_DATA_USER,
  MOCK_DATA_WEEKLY_VOLUME,
} from '@/lib/mock-data/dashboard';
import { ToastItem, ToastContainer } from '@/components/ui/Toast';

export type DateRangeKey = 'today' | 'this-week' | 'september-2026' | 'last-30-days';

interface LogisticsContextType {
  selectedHub: WarehouseHub;
  changeHub: (hub: WarehouseHub) => void;
  dateRange: DateRangeKey;
  dateRangeLabel: string;
  changeDateRange: (range: DateRangeKey, label: string) => void;
  kpis: KpiMetric[];
  alerts: AlertItem[];
  unreadAlertsCount: number;
  markAlertAsRead: (id: string) => void;
  markAllAlertsAsRead: () => void;
  resolveAlert: (id: string, actionNote: string) => void;
  user: UserProfile;
  switchUserRole: (role: UserRole) => void;
  isRefreshing: boolean;
  lastRefreshedTime: string;
  refreshTelemetry: () => void;
  exportCsvReport: () => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  showToast: (
    title: string,
    message?: string,
    variant?: 'success' | 'critical' | 'info' | 'warning'
  ) => void;
  dismissToast: (id: string) => void;
}

const LogisticsContext = createContext<LogisticsContextType | undefined>(undefined);

export function LogisticsProvider({ children }: { children: ReactNode }) {
  const [selectedHub, setSelectedHub] = useState<WarehouseHub>(MOCK_DATA_HUBS[0]);
  const [dateRange, setDateRange] = useState<DateRangeKey>('september-2026');
  const [dateRangeLabel, setDateRangeLabel] = useState<string>('September 2026');
  const [kpis, setKpis] = useState<KpiMetric[]>(MOCK_DATA_KPIS);
  const [alerts, setAlerts] = useState<AlertItem[]>(MOCK_DATA_ALERTS);
  const [user, setUser] = useState<UserProfile>(MOCK_DATA_USER);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedTime, setLastRefreshedTime] = useState('Just now');
  const [searchOpen, setSearchOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Toast dispatch helper
  const showToast = useCallback(
    (
      title: string,
      message?: string,
      variant: 'success' | 'critical' | 'info' | 'warning' = 'success'
    ) => {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      setToasts((prev) => [...prev, { id, title, message, variant }]);

      // Auto-dismiss after 3.5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Hub switcher logic
  const changeHub = useCallback(
    (hub: WarehouseHub) => {
      setSelectedHub(hub);

      // Adjust active fleet KPI based on hub
      setKpis((prev) =>
        prev.map((kpi) => {
          if (kpi.id === 'kpi-fleet') {
            return {
              ...kpi,
              value: `${hub.activeVehicles}`,
              subtext: `${hub.city} active fleet corridor`,
            };
          }
          return kpi;
        })
      );

      showToast(
        `Switched to ${hub.name}`,
        `Displaying active consignments and telemetry for ${hub.city}, ${hub.state}.`,
        'info'
      );
    },
    [showToast]
  );

  // Date range switcher logic
  const changeDateRange = useCallback(
    (range: DateRangeKey, label: string) => {
      setDateRange(range);
      setDateRangeLabel(label);

      // Adapt KPI numbers depending on period
      setKpis((prev) =>
        prev.map((kpi) => {
          if (range === 'today') {
            if (kpi.id === 'kpi-ontime') return { ...kpi, value: '96.2%', trendValue: '+1.8%' };
            if (kpi.id === 'kpi-savings') return { ...kpi, value: '₹14,250', trendValue: '+9.4%', trendPeriod: 'today' };
          } else if (range === 'this-week') {
            if (kpi.id === 'kpi-ontime') return { ...kpi, value: '95.1%', trendValue: '+2.1%' };
            if (kpi.id === 'kpi-savings') return { ...kpi, value: '₹62,800', trendValue: '+12.6%', trendPeriod: 'this week' };
          } else if (range === 'last-30-days') {
            if (kpi.id === 'kpi-ontime') return { ...kpi, value: '93.7%', trendValue: '+3.0%' };
            if (kpi.id === 'kpi-savings') return { ...kpi, value: '₹2,18,400', trendValue: '+16.2%', trendPeriod: 'last 30d' };
          } else {
            // Default september-2026
            if (kpi.id === 'kpi-ontime') return { ...kpi, value: '94.8%', trendValue: '+2.4%' };
            if (kpi.id === 'kpi-savings') return { ...kpi, value: '₹1,84,500', trendValue: '+14.8%' };
          }
          return kpi;
        })
      );

      showToast(`Filter Applied: ${label}`, `Updated dashboard metrics for selected timeframe.`, 'info');
    },
    [showToast]
  );

  // Alert actions
  const markAlertAsRead = useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((alert) => (alert.id === id ? { ...alert, isRead: true } : alert))
    );
  }, []);

  const markAllAlertsAsRead = useCallback(() => {
    setAlerts((prev) => prev.map((alert) => ({ ...alert, isRead: true })));
    showToast('All Alerts Marked as Read', 'Alert counters have been cleared.', 'success');
  }, [showToast]);

  const resolveAlert = useCallback(
    (id: string, actionNote: string) => {
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === id
            ? { ...alert, isRead: true, message: `${alert.message} [RESOLVED: ${actionNote}]` }
            : alert
        )
      );
      showToast('Exception Resolved', actionNote, 'success');
    },
    [showToast]
  );

  // User role switcher
  const switchUserRole = useCallback(
    (newRole: UserRole) => {
      setUser((prev) => ({ ...prev, role: newRole }));
      showToast(
        `Role Switched to ${newRole}`,
        `You now have ${newRole} access permissions in LogiSync Pro.`,
        'info'
      );
    },
    [showToast]
  );

  // Telemetry refresh logic
  const refreshTelemetry = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshedTime('Just now');
      // Subtle realistic variance in On-Time delivery %
      setKpis((prev) =>
        prev.map((kpi) => {
          if (kpi.id === 'kpi-ontime') {
            const variance = (Math.random() * 0.4 - 0.2).toFixed(1);
            const num = (94.8 + parseFloat(variance)).toFixed(1);
            return { ...kpi, value: `${num}%` };
          }
          return kpi;
        })
      );
      showToast(
        'Telemetry Refreshed',
        'Live GPS coordinates, corridor delays, and temperature telemetry updated.',
        'success'
      );
    }, 700);
  }, [showToast]);

  // Export CSV Report logic
  const exportCsvReport = useCallback(() => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const filename = `logisync_operations_report_${timestamp}.csv`;

      // Build structured CSV data
      const csvLines: string[] = [
        'LOGISYNC PRO - OPERATIONS & FLEET REPORT',
        `Generated At: ${new Date().toLocaleString('en-IN')}`,
        `Hub: ${selectedHub.name} (${selectedHub.city})`,
        `Reporting Period: ${dateRangeLabel}`,
        `Generated By: ${user.name} (${user.role})`,
        '',
        '--- SECTION 1: KEY PERFORMANCE INDICATORS ---',
        'Metric ID,Metric Name,Value,Trend,Period,Status Accent',
      ];

      kpis.forEach((kpi) => {
        csvLines.push(
          `"${kpi.id}","${kpi.label}","${kpi.value}","${kpi.trendValue}","${kpi.trendPeriod}","${kpi.accent}"`
        );
      });

      csvLines.push('');
      csvLines.push('--- SECTION 2: WEEKLY DELIVERY VOLUME ---');
      csvLines.push('Day,Total Dispatches,On-Time Deliveries,Delayed Deliveries,On-Time Rate %');

      MOCK_DATA_WEEKLY_VOLUME.forEach((point) => {
        csvLines.push(
          `"${point.fullDay}",${point.volume},${point.onTimeDeliveries},${point.delayedDeliveries},${point.onTimeRate}%`
        );
      });

      csvLines.push('');
      csvLines.push('--- SECTION 3: RECENT OPERATIONAL EXCEPTIONS ---');
      csvLines.push('Alert ID,Severity,Title,Entity Tag,Timestamp,Status');

      alerts.forEach((alert) => {
        csvLines.push(
          `"${alert.id}","${alert.severity}","${alert.title}","${alert.entityTag}","${alert.timestamp}","${
            alert.isRead ? 'Resolved/Read' : 'Unresolved'
          }"`
        );
      });

      const csvContent = '\uFEFF' + csvLines.join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(
        'CSV Export Downloaded',
        `Saved report file ${filename} with KPIs, dispatches, and alerts.`,
        'success'
      );
    } catch {
      showToast('Export Failed', 'An error occurred while generating CSV.', 'critical');
    }
  }, [selectedHub, dateRangeLabel, user, kpis, alerts, showToast]);

  const unreadAlertsCount = alerts.filter((a) => !a.isRead).length;

  return (
    <LogisticsContext.Provider
      value={{
        selectedHub,
        changeHub,
        dateRange,
        dateRangeLabel,
        changeDateRange,
        kpis,
        alerts,
        unreadAlertsCount,
        markAlertAsRead,
        markAllAlertsAsRead,
        resolveAlert,
        user,
        switchUserRole,
        isRefreshing,
        lastRefreshedTime,
        refreshTelemetry,
        exportCsvReport,
        searchOpen,
        setSearchOpen,
        showToast,
        dismissToast,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </LogisticsContext.Provider>
  );
}

export function useLogistics() {
  const context = useContext(LogisticsContext);
  if (!context) {
    throw new Error('useLogistics must be used within a LogisticsProvider');
  }
  return context;
}
