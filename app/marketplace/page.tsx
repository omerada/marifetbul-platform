'use client';

import { useState, useEffect, Suspense, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout';
import { MarketplaceList } from '@/components/marketplace/MarketplaceList';
import { EnhancedMobileMarketplace } from '@/components/features/EnhancedMobileMarketplace';
import { Loading } from '@/components/ui';
import { useResponsive } from '@/hooks/useResponsive';
import { useJobFilters, usePackageFilters } from '@/hooks/useFilters';
import { MarketplaceHeader } from '@/components/features/MarketplaceHeader';
import { EnhancedFilters } from '@/components/features/EnhancedFilters';

type MarketplaceView = 'jobs' | 'services';

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const { isMobile } = useResponsive();

  // State-based view switching (no URL changes for better UX)
  const initialView = (searchParams.get('view') as MarketplaceView) || 'jobs';
  const [activeTab] = useState<MarketplaceView>(initialView);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

  // Advanced filters
  const jobFilters = useJobFilters({ search: searchQuery });
  const packageFilters = usePackageFilters({ search: searchQuery });

  // Debounced search to prevent excessive API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Update filters when search changes
  useEffect(() => {
    if (activeTab === 'jobs') {
      jobFilters.updateFilters({
        ...jobFilters.filters,
        search: debouncedSearchQuery,
      });
    } else {
      packageFilters.updateFilters({
        ...packageFilters.filters,
        search: debouncedSearchQuery,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, activeTab]);

  // Real-time search without page reload
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Quick stats (could be fetched from API)
  const quickStats = useMemo(
    () => ({
      jobs: { total: 1247, thisWeek: 52, trending: 'React Developer' },
      services: { total: 3891, thisWeek: 128, trending: 'Logo Tasarım' },
    }),
    []
  );

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Enhanced Header with new component */}
        <MarketplaceHeader
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          activeTab={activeTab}
          quickStats={quickStats}
        />

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {isMobile ? (
            <EnhancedMobileMarketplace initialMode={activeTab} />
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
              {/* Enhanced Filters Sidebar */}
              <EnhancedFilters
                activeTab={activeTab}
                jobFilters={jobFilters}
                packageFilters={packageFilters}
              />

              {/* Results */}
              <div className="lg:col-span-3">
                <MarketplaceList initialMode={activeTab} />
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense
      fallback={
        <AppLayout>
          <div className="flex min-h-screen items-center justify-center">
            <Loading size="lg" text="Marketplace yükleniyor..." />
          </div>
        </AppLayout>
      }
    >
      <MarketplaceContent />
    </Suspense>
  );
}
