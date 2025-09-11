'use client';

import { Suspense } from 'react';
import { MarketplacePage } from '@/components/features/marketplace/MarketplacePage';
import { MarketplaceSkeleton } from '@/components/features/marketplace/MarketplaceSkeleton';

export default function Marketplace() {
  return (
    <Suspense fallback={<MarketplaceSkeleton />}>
      <MarketplacePage />
    </Suspense>
  );
}
