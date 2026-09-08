'use client';

import React from 'react';
import { Bell } from 'lucide-react';
import { Phase2Placeholder } from '@/components/shared/Phase2Placeholder';

export default function AlertsPage() {
  return (
    <Phase2Placeholder
      title="Alert Center"
      moduleName="Alerts"
      description="Centralized exception management inbox with priority routing, multi-channel broadcast (WhatsApp/SMS/Email), and resolution escalations."
      icon={Bell}
      plannedFeatures={[
        'Comprehensive exception feed categorized by Critical, Warning, and Info',
        'Custom escalation matrix (Alert Supervisor after 30 mins delay)',
        'Automated WhatsApp incident dispatches to corridor coordinators',
        'Historical SLA breach root-cause reporting and analytics',
      ]}
    />
  );
}
