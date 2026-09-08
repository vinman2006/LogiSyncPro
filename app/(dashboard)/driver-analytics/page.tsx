'use client';

import React from 'react';
import { UserCheck } from 'lucide-react';
import { Phase2Placeholder } from '@/components/shared/Phase2Placeholder';

export default function DriverAnalyticsPage() {
  return (
    <Phase2Placeholder
      title="Driver Safety & Performance Analytics"
      moduleName="Driver Analytics"
      description="Driver safety scorecards, harsh braking / overspeeding detection, driving hour compliance, and monthly incentive leaderboards."
      icon={UserCheck}
      plannedFeatures={[
        'Safety score radial gauges (Speeding, Harsh Braking, Night Driving)',
        'Driver leaderboard with monthly fuel-efficiency bonuses',
        'Working hour rest compliance (prevent driver fatigue accidents)',
        'Driver digital wallet integration & trip advance management',
      ]}
    />
  );
}
