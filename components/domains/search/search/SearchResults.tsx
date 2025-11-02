'use client';

import { useEffect, useState } from 'react';
import { useMarketplace } from '@/hooks';
import { MarketplaceList } from '../../marketplace/marketplace/MarketplaceList';
import { ZeroResultsState } from '@/components/shared/search';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Package, Briefcase, Users, RefreshCcw } from 'lucide-react';

interface SearchResultsProps {
  query: string;
  activeTab: 'all' | 'services' | 'jobs' | 'freelancers';
  sortBy: string;
}

export function SearchResults({
  query,
  activeTab,
  sortBy,
}: SearchResultsProps) {
  const {
    jobs,
    packages,
    isLoading,
    error,
    viewPreferences,
    applyJobFilters,
    applyPackageFilters,
    refreshData,
  } = useMarketplace();

  const [searchApplied, setSearchApplied] = useState(false);

  // Apply search filters when query or tab changes
  useEffect(() => {
    if (!query && !searchApplied) return;

    if (activeTab === 'jobs' || activeTab === 'all') {
      applyJobFilters();
    }

    if (activeTab === 'services' || activeTab === 'all') {
      applyPackageFilters();
    }

    setSearchApplied(true);
  }, [query, activeTab, applyJobFilters, applyPackageFilters, searchApplied]);

  // Update sort when sortBy changes
  useEffect(() => {
    if (!searchApplied) return;

    if (activeTab === 'jobs' || activeTab === 'all') {
      applyJobFilters();
    }

    if (activeTab === 'services' || activeTab === 'all') {
      applyPackageFilters();
    }
  }, [
    sortBy,
    searchApplied,
    query,
    activeTab,
    applyJobFilters,
    applyPackageFilters,
  ]);

  const handleRefresh = () => {
    refreshData();
  };

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="p-8 text-center">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Arama Sonuçları Yüklenemedi
          </h3>
          <p className="mb-4 text-gray-600">{error}</p>
          <Button onClick={handleRefresh} variant="primary">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Tekrar Dene
          </Button>
        </Card>
      </div>
    );
  }

  // Render different layouts based on active tab
  if (activeTab === 'all') {
    return (
      <div className="space-y-8">
        {/* Services Section */}
        {packages.length > 0 && (
          <div>
            <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
              <Package className="mr-2 h-5 w-5 text-green-500" />
              Hizmetler ({packages.length})
            </h3>
            <MarketplaceList
              mode="packages"
              data={packages.slice(0, 6)} // Show first 6 for preview
              isLoading={isLoading}
              viewPreferences={{
                ...viewPreferences,
                layout: 'grid',
                showFilters: false,
                showAdvancedFilters: false,
              }}
            />
            {packages.length > 6 && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    // This would normally navigate to services tab
                    window.location.href =
                      '/search?q=' +
                      encodeURIComponent(query) +
                      '&type=services';
                  }}
                >
                  Tüm Hizmetleri Görüntüle ({packages.length})
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Jobs Section */}
        {jobs.length > 0 && (
          <div>
            <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
              <Briefcase className="mr-2 h-5 w-5 text-blue-500" />
              İş İlanları ({jobs.length})
            </h3>
            <MarketplaceList
              mode="jobs"
              data={jobs.slice(0, 6)} // Show first 6 for preview
              isLoading={isLoading}
              viewPreferences={{
                ...viewPreferences,
                layout: 'grid',
                showFilters: false,
                showAdvancedFilters: false,
              }}
            />
            {jobs.length > 6 && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    // This would normally navigate to jobs tab
                    window.location.href =
                      '/search?q=' + encodeURIComponent(query) + '&type=jobs';
                  }}
                >
                  Tüm İş İlanlarını Görüntüle ({jobs.length})
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Empty state when no results - Sprint 4 Day 3 */}
        {!isLoading && packages.length === 0 && jobs.length === 0 && query && (
          <ZeroResultsState
            query={query}
            hasActiveFilters={false}
            onNewSearch={(newQuery) => {
              window.location.href =
                '/search?q=' + encodeURIComponent(newQuery);
            }}
            suggestions={[
              query.replace(/ı/g, 'i'),
              query.replace(/i/g, 'ı'),
              query + ' hizmeti',
            ]}
          />
        )}
      </div>
    );
  }

  if (activeTab === 'services') {
    return (
      <MarketplaceList
        mode="packages"
        data={packages}
        isLoading={isLoading}
        viewPreferences={{
          ...viewPreferences,
          showFilters: false,
          showAdvancedFilters: false,
        }}
      />
    );
  }

  if (activeTab === 'jobs') {
    return (
      <MarketplaceList
        mode="jobs"
        data={jobs}
        isLoading={isLoading}
        viewPreferences={{
          ...viewPreferences,
          showFilters: false,
          showAdvancedFilters: false,
        }}
      />
    );
  }

  if (activeTab === 'freelancers') {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Freelancer Arama
              </h3>
              <p className="text-gray-600">
                Freelancer arama özelliği yakında eklenecek.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => (window.location.href = '/marketplace')}
              >
                Marketplace&apos;e Git
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return null;
}
