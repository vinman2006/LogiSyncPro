'use client';

import React from 'react';
import { Boxes } from 'lucide-react';
import { Phase2Placeholder } from '@/components/shared/Phase2Placeholder';

export default function WarehousePage() {
  return (
    <Phase2Placeholder
      title="Warehouse & Inventory Management"
      moduleName="Warehouse"
      description="Multi-hub stock levels, temperature-controlled zone monitoring (Ambient/Cold/Frozen), bin location tracking, and auto-reorder thresholds."
      icon={Boxes}
      plannedFeatures={[
        'SKU inventory grid with stock health progress bars',
        'Cold-chain temperature zone badges (Ambient, Cold, Frozen)',
        'Low-stock threshold triggers & WhatsApp purchase order generation',
        'Barcode / QR intake and dispatch reconciliation',
      ]}
    />
  );
}
