'use client';

import React from 'react';
import { Share2 } from 'lucide-react';
import { Phase2Placeholder } from '@/components/shared/Phase2Placeholder';

export default function SupplyChainPage() {
  return (
    <Phase2Placeholder
      title="Supply Chain Visibility"
      moduleName="Supply Chain"
      description="End-to-end multi-tier pipeline tracking from supplier dispatch to warehouse reception and distributor handoff."
      icon={Share2}
      plannedFeatures={[
        'Horizontal milestone stepper (Supplier → Hub → Transit → Delivered)',
        'Consignment risk-score chips (Low / Moderate / Elevated)',
        'Vendor SLA scorecard and supplier dispatch lead time analytics',
        'Consolidated GST invoice & e-Way bill document vault',
      ]}
    />
  );
}
