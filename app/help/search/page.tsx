'use client';

import { HelpCenterLayout } from '@/components/domains/support';
import { HelpSearchResults } from '@/components/domains/support';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  return (
    <HelpCenterLayout
      title={query ? `"${query}" için arama sonuçları` : 'Arama'}
      showSearch={false}
    >
      <div className="container mx-auto px-4 py-8">
        <HelpSearchResults initialQuery={query} />
      </div>
    </HelpCenterLayout>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
