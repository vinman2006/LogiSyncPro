'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Phase2Placeholder } from '@/components/shared/Phase2Placeholder';

export default function ForecastingPage() {
  return (
    <Phase2Placeholder
      title="Predictive Demand Forecasting"
      moduleName="Forecasting"
      description="Time-series SKU demand prediction trained on festive seasonality (Diwali, Holi, Monsoons) to prevent stockouts and demurrage."
      icon={TrendingUp}
      plannedFeatures={[
        'SKU historical vs forecasted demand curves (solid vs dashed lines)',
        'Festival & regional surge multiplier simulator',
        'Recommended reorder quantity and supplier buffer stock calculator',
        'Dead-inventory liquidation advisory with historical trends',
      ]}
    />
  );
}
