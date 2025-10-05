import React, { Suspense } from 'react';
import { Loading } from '@/components/ui';
import CategoriesPageClient from '@/components/domains/marketplace/CategoriesPageClient';

// SEO Metadata - Import from separate file
export { metadata } from './metadata';

export default function CategoriesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loading size="lg" />
        </div>
      }
    >
      <CategoriesPageClient />
    </Suspense>
  );
}
