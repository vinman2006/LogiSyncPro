'use client';

import React from 'react';
import { PackageCheck } from 'lucide-react';
import { Phase2Placeholder } from '@/components/shared/Phase2Placeholder';

export default function DeliveryPage() {
  return (
    <Phase2Placeholder
      title="Last-Mile Delivery Tracker"
      moduleName="Delivery"
      description="Kanban dispatch boards (Pickup → In Transit → Out for Delivery → Delivered) with driver signatures, OTP proofs, and SLA delay alerts."
      icon={PackageCheck}
      plannedFeatures={[
        'Interactive Kanban dispatch stages for daily consignments',
        'Delayed order red corner ribbons with immediate mitigation actions',
        'Customer OTP and digital ePOD (proof of delivery) capture',
        'Automated WhatsApp milestone updates to end recipients',
      ]}
    />
  );
}
