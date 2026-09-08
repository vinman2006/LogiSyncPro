'use client';

import React from 'react';
import { Truck } from 'lucide-react';
import { Phase2Placeholder } from '@/components/shared/Phase2Placeholder';

export default function FleetPage() {
  return (
    <Phase2Placeholder
      title="Fleet Management"
      moduleName="Fleet"
      description="Central vehicle asset registry, real-time maintenance diagnostics, fuel monitoring, and fitness certificate expiration tracking."
      icon={Truck}
      plannedFeatures={[
        'Truck avatar cards with plate registration (e.g. MH, DL, KA)',
        'Fuel level horizontal bars with anomaly leakage alerts',
        'PUC, National Permit, and Insurance renewal calendar',
        'Driver assignment and fast FASTag toll recharge',
      ]}
    />
  );
}
