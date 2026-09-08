import React from 'react';
import { Database } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DemoDataBadgeProps {
  className?: string;
  showIcon?: boolean;
}

export function DemoDataBadge({ className, showIcon = true }: DemoDataBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide',
        'border border-neutral-300 bg-neutral-50/90 text-neutral-600 select-none shadow-sm',
        className
      )}
      title="This view uses local mock data for demonstration"
    >
      {showIcon && <Database className="w-3 h-3 text-neutral-500" strokeWidth={2} />}
      <span>DEMO DATA</span>
    </span>
  );
}
