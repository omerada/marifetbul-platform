'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout';
import { UniversalSearch } from '@/components/domains/search';
import { SearchSearchResults } from '@/components/domains/search';
import { Card, Button, Loading } from '@/components/ui';
import { useResponsive, useFilterState, useFacets } from '@/hooks';
import {
  AdvancedFilterPanel,
  FilterChips,
  FacetedNavigation,
  SortOptions,
  DEFAULT_FACET_GROUPS,
  DEFAULT_SORT,
} from '@/components/shared/filters';
import type {
  FilterState,
  SortOption,
  ViewMode,
} from '@/components/shared/filters';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Briefcase,
  Package,
  Users,
  MapPin,
  Clock,
  Star,
  X,
} from 'lucide-react';
import { trackSearch } from '@/lib/api/search-analytics';
import logger from '@/lib/infrastructure/monitoring/logger';

type SearchTab = 'all' | 'services' | 'jobs' | 'freelancers';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMobile } = useResponsive();

  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') as SearchTab | null;

  const [activeTab, setActiveTab] = useState<SearchTab>(type || 'all');
  const [searchQuery, setSearchQuery] = useState(query);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>(DEFAULT_SORT);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Sprint 4: Advanced filter state management
  const {
    filters,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    activeFilterCount,
  } = useFilterState({
    defaultFilters: {
      priceRange: [100, 10000],
      minRating: null,
      deliveryTime: null,
      sellerLevels: [],
      location: null,
    },
    syncWithUrl: true,
  });

  // Sprint 4 Day 2: Faceted navigation
  const {
    facetGroups,
    selectedFacets,
    toggleFacet,
    isLoading: facetsLoading,
  } = useFacets({
    facetGroups: DEFAULT_FACET_GROUPS,
    fetchOnMount: true,
    currentFilters: filters as unknown as Record<string, unknown>,
  });

  // Handle filter chip removal
  const handleRemoveFilter = (
    filterKey: keyof FilterState,
    value?: string | number
  ) => {
    const newFilters = { ...filters };

    switch (filterKey) {
      case 'priceRange':
        newFilters.priceRange = [100, 10000];
        break;
      case 'minRating':
        newFilters.minRating = null;
        break;
      case 'deliveryTime':
        newFilters.deliveryTime = null;
        break;
      case 'sellerLevels':
        if (value) {
          newFilters.sellerLevels = newFilters.sellerLevels.filter(
            (l) => l !== value
          );
        }
        break;
      case 'location':
        newFilters.location = null;
        break;
    }

    updateFilters(newFilters);
  };

  // Update URL when tab or query changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (activeTab !== 'all') params.set('type', activeTab);

    const newUrl = `/search${params.toString() ? `?${params.toString()}` : ''}`;
    router.replace(newUrl, { scroll: false });
  }, [searchQuery, activeTab, router]);

  const handleSearch = (newQuery: string, searchType?: string) => {
    setSearchQuery(newQuery);
    if (searchType && searchType !== 'all') {
      setActiveTab(searchType as SearchTab);
    }

    // Track search analytics
    if (newQuery.trim()) {
      trackSearch({
        query: newQuery,
        resultCount:
          searchResults[activeTab as keyof typeof searchResults] || 0,
        filters: {
          type: searchType || activeTab,
          sortBy,
        },
      }).catch((err) => {
        logger.debug('Failed to track search', err);
      });
    }
  };

  const handleTabChange = (tab: SearchTab) => {
    setActiveTab(tab);
  };

  // Fetch search results counts from backend
  const [searchResults, setSearchResults] = useState({
    all: 0,
    services: 0,
    jobs: 0,
    freelancers: 0,
  });

  useEffect(() => {
    const fetchSearchCounts = async () => {
      if (!searchParams?.get('query')) {
        setSearchResults({ all: 0, services: 0, jobs: 0, freelancers: 0 });
        return;
      }

      try {
        const response = await fetch(
          `/api/v1/search/counts?query=${encodeURIComponent(searchParams.get('query') || '')}`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        if (response.ok) {
          const data = await response.json();
          setSearchResults(
            data.data || { all: 0, services: 0, jobs: 0, freelancers: 0 }
          );
          logger.info('Search counts fetched', {
            query: searchParams.get('query'),
            results: data.data,
          });
        } else {
          logger.warn('Search counts fetch failed', {
            status: response.status,
          });
          setSearchResults({ all: 0, services: 0, jobs: 0, freelancers: 0 });
        }
      } catch (err) {
        logger.error(
          'Search counts fetch error',
          err instanceof Error ? err : new Error(String(err))
        );
        setSearchResults({ all: 0, services: 0, jobs: 0, freelancers: 0 });
      }
    };

    fetchSearchCounts();
  }, [searchParams]);

  const tabs = [
    {
      key: 'all' as SearchTab,
      label: 'Tümü',
      icon: Search,
      count: searchResults.all,
    },
    {
      key: 'services' as SearchTab,
      label: 'Hizmetler',
      icon: Package,
      count: searchResults.services,
    },
    {
      key: 'jobs' as SearchTab,
      label: 'İş İlanları',
      icon: Briefcase,
      count: searchResults.jobs,
    },
    {
      key: 'freelancers' as SearchTab,
      label: 'Freelancerlar',
      icon: Users,
      count: searchResults.freelancers,
    },
  ];

  // Removed sortOptions array - using SortOptions component now

  const quickFilters = [
    { label: 'Uzaktan', icon: MapPin, active: false },
    { label: '24 saat teslimat', icon: Clock, active: false },
    { label: '4+ yıldız', icon: Star, active: false },
    { label: 'Pro freelancer', icon: Users, active: false },
  ];

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Search Header */}
        <section className="border-b bg-white">
          <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <UniversalSearch
                onSearch={handleSearch}
                placeholder="Ne arıyorsun?"
                className="mb-4"
              />

              {searchQuery && (
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    <strong>&quot;{searchQuery}&quot;</strong> için{' '}
                    <strong>{searchResults[activeTab].toLocaleString()}</strong>{' '}
                    sonuç bulundu
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Sprint 4 Day 2: Sort Options Bar */}
        <section className="border-b bg-gray-50 py-4">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <SortOptions
              sortBy={sortBy}
              onSortChange={setSortBy}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              resultCount={searchResults[activeTab]}
              showViewToggle={!isMobile}
            />
          </div>
        </section>

        {/* Search Navigation */}
        <section className="sticky top-0 z-30 border-b bg-white shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              {/* Tabs */}
              <div className="flex space-x-1 lg:space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => handleTabChange(tab.key)}
                    className={`group flex items-center border-b-2 px-2 py-4 text-sm font-medium transition-all duration-200 lg:px-1 ${
                      activeTab === tab.key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <tab.icon className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.slice(0, 3)}</span>
                    {tab.count > 0 && (
                      <span className="ml-2 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 group-hover:bg-gray-200">
                        {tab.count > 999 ? '999+' : tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Sort and Filter - Sprint 4 Day 2 */}
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {!isMobile && 'Filtreler'}
                  {hasActiveFilters && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>

            {/* Quick Filters */}
            {!isMobile && (
              <div className="flex items-center space-x-3 pb-4">
                <span className="text-sm text-gray-500">Hızlı filtreler:</span>
                {quickFilters.map((filter, index) => (
                  <button
                    key={index}
                    className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm transition-colors ${
                      filter.active
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <filter.icon className="h-3 w-3" />
                    {filter.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Search Results */}
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {searchQuery ? (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
              {/* Advanced Filters Sidebar - Desktop */}
              {!isMobile && showFilters && (
                <div className="lg:col-span-1">
                  <div className="sticky top-24 space-y-4">
                    {/* Sprint 4: Advanced Filter Panel */}
                    <AdvancedFilterPanel
                      initialFilters={filters}
                      onFiltersChange={(newFilters) => {
                        updateFilters(newFilters);
                      }}
                      onClose={() => setShowFilters(false)}
                      className="shadow-sm ring-1 ring-gray-200/60"
                    />

                    {/* Sprint 4 Day 2: Faceted Navigation */}
                    <Card
                      className="overflow-hidden shadow-sm ring-1 ring-gray-200/60"
                      padding="sm"
                    >
                      <FacetedNavigation
                        facetGroups={facetGroups}
                        selectedFacets={selectedFacets}
                        onFacetToggle={toggleFacet}
                        isLoading={facetsLoading}
                        initialShowCount={5}
                      />
                    </Card>
                  </div>
                </div>
              )}

              {/* Results Content */}
              <div
                className={
                  showFilters && !isMobile ? 'lg:col-span-3' : 'lg:col-span-4'
                }
              >
                {/* Sprint 4: Filter Chips - Active filters display */}
                {hasActiveFilters && (
                  <div className="mb-6">
                    <Card className="bg-blue-50/50 ring-1 ring-blue-200/60">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <Filter className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">
                              Aktif Filtreler ({activeFilterCount})
                            </span>
                          </div>
                          <FilterChips
                            filters={filters}
                            onRemoveFilter={handleRemoveFilter}
                            onClearAll={clearFilters}
                          />
                        </div>
                        <button
                          onClick={clearFilters}
                          className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                          title="Tüm filtreleri temizle"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </Card>
                  </div>
                )}

                <SearchSearchResults
                  query={searchQuery}
                  activeTab={activeTab}
                  sortBy={sortBy}
                />
              </div>
            </div>
          ) : (
            /* No Search Query - Show trending/popular */
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-8">
                <h2 className="mb-4 text-2xl font-bold text-gray-900">
                  Ne aramak istiyorsun?
                </h2>
                <p className="text-gray-600">
                  Popüler kategorileri keşfet veya arama yaparak başla
                </p>
              </div>

              {/* Popular Categories */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {[
                  { name: 'Web Tasarım', count: '2.3k', icon: '🎨' },
                  { name: 'Logo Yapımı', count: '1.8k', icon: '🎯' },
                  { name: 'SEO', count: '967', icon: '📈' },
                  { name: 'Mobil App', count: '1.2k', icon: '📱' },
                  { name: 'İçerik Yazımı', count: '834', icon: '✍️' },
                  { name: 'Sosyal Medya', count: '692', icon: '📸' },
                  { name: 'Video Editör', count: '543', icon: '🎬' },
                  { name: 'Çeviri', count: '421', icon: '🌍' },
                ].map((category) => (
                  <button
                    key={category.name}
                    onClick={() => handleSearch(category.name)}
                    className="group rounded-lg border border-gray-200 bg-white p-4 text-left transition-all hover:border-blue-300 hover:shadow-md"
                  >
                    <div className="mb-2 text-2xl">{category.icon}</div>
                    <div className="font-medium text-gray-900 group-hover:text-blue-600">
                      {category.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {category.count} hizmet
                    </div>
                  </button>
                ))}
              </div>

              {/* Trending Searches */}
              <div className="mt-8">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Trend Aramalar
                </h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    'React developer',
                    'Logo tasarım',
                    'WordPress',
                    'E-ticaret',
                    'Instagram tasarım',
                    'SEO uzmanı',
                  ].map((trend) => (
                    <button
                      key={trend}
                      onClick={() => handleSearch(trend)}
                      className="rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-blue-100 hover:text-blue-700"
                    >
                      {trend}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <AppLayout>
          <div className="flex min-h-screen items-center justify-center">
            <Loading size="lg" text="Arama sayfası yükleniyor..." />
          </div>
        </AppLayout>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
