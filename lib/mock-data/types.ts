export type StatusType =
  | 'active'
  | 'idle'
  | 'maintenance'
  | 'critical'
  | 'in-transit'
  | 'verified';

export type MetricAccent = 'success' | 'warning' | 'critical' | 'info' | 'brand';

export interface KpiMetric {
  id: string;
  label: string;
  value: string;
  unit?: string;
  trendValue: string;
  trendDirection: 'up' | 'down';
  trendPeriod: string;
  accent: MetricAccent;
  isHero?: boolean;
  subtext: string;
}

export interface WeeklyVolumePoint {
  day: string;
  fullDay: string;
  volume: number;
  onTimeDeliveries: number;
  delayedDeliveries: number;
  onTimeRate: number;
}

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface AlertItem {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  entityTag: string;
  timestamp: string;
  relativeTime: string;
  isRead: boolean;
  actionUrl?: string;
}

export type UserRole = 'Admin' | 'Manager' | 'Staff' | 'Viewer';

export interface UserProfile {
  name: string;
  role: UserRole;
  email: string;
  avatarInitials: string;
  companyName: string;
  currentHub: string;
}

export interface WarehouseHub {
  id: string;
  name: string;
  city: string;
  state: string;
  code: string;
  activeVehicles: number;
}
