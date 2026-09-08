'use client';

import React from 'react';
import { Settings } from 'lucide-react';
import { Phase2Placeholder } from '@/components/shared/Phase2Placeholder';

export default function SettingsPage() {
  return (
    <Phase2Placeholder
      title="Settings & Organization Roles"
      moduleName="Settings"
      description="Manage company hubs, driver rosters, ERP/Tally integrations, GST e-Way portal credentials, and role-based permissions (Admin, Manager, Staff, Viewer)."
      icon={Settings}
      plannedFeatures={[
        'Role-Based Access Control (Admin, Manager, Staff, Viewer)',
        'Indian ERP integrations (Tally Prime, Marg, Zoho Books)',
        'Govt GST e-Way Bill & Vahan/Sarathi API credentials',
        'WhatsApp Business Cloud API setup for automatic driver dispatches',
      ]}
    />
  );
}
