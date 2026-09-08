import React from 'react';
import {
  CheckCircle2,
  Clock,
  Wrench,
  AlertCircle,
  Truck,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusType } from '@/lib/mock-data/types';

interface StatusConfig {
  label: string;
  icon: LucideIcon;
  textColor: string;
  bgColor: string;
  borderColor: string;
}

const STATUS_CONFIGS: Record<StatusType, StatusConfig> = {
  active: {
    label: 'Active',
    icon: CheckCircle2,
    textColor: 'text-success-600',
    bgColor: 'bg-success-50',
    borderColor: 'border-success-600/20',
  },
  idle: {
    label: 'Idle',
    icon: Clock,
    textColor: 'text-neutral-600',
    bgColor: 'bg-neutral-100',
    borderColor: 'border-neutral-300',
  },
  maintenance: {
    label: 'Maintenance',
    icon: Wrench,
    textColor: 'text-warning-600',
    bgColor: 'bg-warning-50',
    borderColor: 'border-warning-600/20',
  },
  critical: {
    label: 'Critical Alert',
    icon: AlertCircle,
    textColor: 'text-critical-600',
    bgColor: 'bg-critical-50',
    borderColor: 'border-critical-600/20',
  },
  'in-transit': {
    label: 'In Transit',
    icon: Truck,
    textColor: 'text-info-600',
    bgColor: 'bg-info-50',
    borderColor: 'border-info-600/20',
  },
  verified: {
    label: 'Verified',
    icon: ShieldCheck,
    textColor: 'text-info-600',
    bgColor: 'bg-info-50',
    borderColor: 'border-info-600/20',
  },
};

interface StatusPillProps {
  status: StatusType;
  customLabel?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function StatusPill({
  status,
  customLabel,
  className,
  size = 'md',
}: StatusPillProps) {
  const config = STATUS_CONFIGS[status] || STATUS_CONFIGS.idle;
  const Icon = config.icon;
  const displayText = customLabel || config.label;

  const isSmall = size === 'sm';

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        config.bgColor,
        config.textColor,
        config.borderColor,
        isSmall ? 'text-[11px] px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5',
        className
      )}
    >
      <Icon className={cn(isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5')} strokeWidth={2} />
      <span>{displayText}</span>
    </span>
  );
}
