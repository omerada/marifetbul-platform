'use client';

import { HelpCenterLayout } from '@/components/help';
import { SearchResults } from '@/components/help';
import { useSearchParams } from 'next/navigation';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  return (
    <HelpCenterLayout
      title={query ? `"${query}" için arama sonuçları` : 'Arama'}
      showSearch={false}
    >
      <div className="container mx-auto px-4 py-8">
        <SearchResults initialQuery={query} />
      </div>
    </HelpCenterLayout>
  );
}
