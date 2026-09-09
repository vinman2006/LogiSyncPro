'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { NeonDatabaseViewer } from '@/components/database/NeonDatabaseViewer';

export default function DatabasePage() {
  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Neon PostgreSQL Live Explorer"
        description="Real-time multi-tenant database ledger synchronized across cloud branches (Branch: production)"
        breadcrumbs={[{ label: 'Neon Database' }]}
        showDemoBadge={true}
      />

      <NeonDatabaseViewer />
    </div>
  );
}
