'use client';

import { Suspense } from 'react';
import { MarketplacePage } from '@/components/domains/marketplace/marketplace/MarketplacePage';
import { Loading } from '@/components/ui';

export default function Marketplace() {
  return (
    <Suspense
      fallback={<Loading variant="skeleton" text="Marketplace yükleniyor..." />}
    >
      <MarketplacePage />
    </Suspense>
  );
}
