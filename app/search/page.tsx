/**
 * ================================================
 * INTEGRATED SEARCH PAGE WITH ADVANCED FILTERS
 * ================================================
 * Sprint 2: Search & Discovery - Story 1 Integration
 *
 * Complete search experience with:
 * - Advanced filters integration
 * - Backend API connection
 * - Real-time search results
 * - Responsive filter sidebar
 *
 * @author MarifetBul Development Team
 * @version 2.0.0
 * @since 2025-11-26
 */

'use client';

export const dynamic = 'force-dynamic';
import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout';
import { UniversalSearch } from '@/components/domains/search';
import {
  AdvancedSearchFilters,
  type SearchFilters,
} from '@/components/domains/search';
import { SearchSearchResults } from '@/components/domains/search';
import { ZeroResultsState } from '@/components/domains/search/ZeroResultsState';
import { Card, Button, Loading } from '@/components/ui';
import { useResponsive } from '@/hooks';
import {
  Search,
  SlidersHorizontal,
  Briefcase,
  Package,
  Users,
  MapPin,
  Clock,
  Star,
  X,
  Grid3x3,
  List,
} from 'lucide-react';
import { trackSearch } from '@/lib/api/search-analytics';
import logger from '@/lib/infrastructure/monitoring/logger';

type SearchTab = 'all' | 'services' | 'jobs' | 'freelancers';
type ViewMode = 'grid' | 'list';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  price: number;
  rating: number;
  deliveryDays: number;
  seller: {
    id: string;
    name: string;
    verified: boolean;
  };
  featured: boolean;
  categoryId: string;
}

interface SearchResponse {
  content: SearchResult[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMobile } = useResponsive();

  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') as SearchTab | null;

  const [activeTab, setActiveTab] = useState<SearchTab>(type || 'all');
  const [searchQuery, setSearchQuery] = useState(query);
  const [showFilters, setShowFilters] = useState(!isMobile);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Sprint 2: Advanced search filters state
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  /**
   * Perform advanced search with filters
   */
  const performAdvancedSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const requestBody = {
        keyword: searchQuery,
        ...filters,
        page: currentPage,
        size: 20,
        sortBy: 'relevance',
        sortDir: 'desc',
      };

      logger.info('Advanced search request', { requestBody });

      const response = await fetch('/api/v1/search/packages/advanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data: SearchResponse = await response.json();

      setSearchResults(data.content || []);
      setTotalResults(data.totalElements || 0);

      // Track search analytics
      trackSearch({
        query: searchQuery,
        resultCount: data.totalElements || 0,
        filters: {
          type: activeTab,
          ...filters,
        },
      }).catch((err) => {
        logger.debug('Failed to track search', err);
      });

      logger.info('Search completed', {
        query: searchQuery,
        results: data.totalElements,
        filters,
      });
    } catch (error) {
      logger.error(
        'Search error',
        error instanceof Error ? error : new Error(String(error))
      );
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filters, currentPage, activeTab]);

  /**
   * Handle search query submission
   */
  const handleSearch = useCallback((newQuery: string) => {
    setSearchQuery(newQuery);
    setCurrentPage(0);
  }, []);

  /**
   * Handle filter changes
   */
  const handleFilterChange = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(0);
  }, []);

  /**
   * Clear all filters
   */
  const clearAllFilters = useCallback(() => {
    setFilters({});
    setCurrentPage(0);
  }, []);

  /**
   * Count active filters
   */
  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== null
  ).length;

  // Perform search when query or filters change
  useEffect(() => {
    if (searchQuery.trim()) {
      performAdvancedSearch();
    }
  }, [searchQuery, filters, currentPage, performAdvancedSearch]);

  // Update URL when tab or query changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (activeTab !== 'all') params.set('type', activeTab);

    const newUrl = `/search${params.toString() ? `?${params.toString()}` : ''}`;
    router.replace(newUrl, { scroll: false });
  }, [searchQuery, activeTab, router]);

  const handleTabChange = (tab: SearchTab) => {
    setActiveTab(tab);
  };

  const tabs = [
    {
      key: 'all' as SearchTab,
      label: 'TÃ¼mÃ¼',
      icon: Search,
      count: totalResults,
    },
    {
      key: 'services' as SearchTab,
      label: 'Hizmetler',
      icon: Package,
      count: 0, // Would be populated from separate API
    },
    {
      key: 'jobs' as SearchTab,
      label: 'Ä°ÅŸ Ä°lanlarÄ±',
      icon: Briefcase,
      count: 0,
    },
    {
      key: 'freelancers' as SearchTab,
      label: 'Freelancerlar',
      icon: Users,
      count: 0,
    },
  ];

  const quickFilters = [
    { label: 'Uzaktan', icon: MapPin, active: false },
    { label: '24 saat teslimat', icon: Clock, active: false },
    { label: '4+ yÄ±ldÄ±z', icon: Star, active: false },
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
                placeholder="Ne arÄ±yorsun?"
                className="mb-4"
              />

              {searchQuery && (
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    <strong>&quot;{searchQuery}&quot;</strong> iÃ§in{' '}
                    <strong>{totalResults.toLocaleString()}</strong> sonuÃ§
                    bulundu
                  </span>
                </div>
              )}
            </div>
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

              {/* Filter and View Controls */}
              <div className="flex items-center space-x-3">
                {/* View Mode Toggle */}
                {!isMobile && (
                  <div className="flex rounded-lg border border-gray-300">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Filter Toggle Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {!isMobile && 'Filtreler'}
                  {activeFilterCount > 0 && (
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
                <span className="text-sm text-gray-500">
                  HÄ±zlÄ± filtreler:
                </span>
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
              {/* Advanced Filters Sidebar - Sprint 2 Integration */}
              {showFilters && (
                <div className="lg:col-span-1">
                  <AdvancedSearchFilters
                    filters={filters}
                    onChange={handleFilterChange}
                    variant="sidebar"
                    className="shadow-sm"
                  />
                </div>
              )}

              {/* Results Content */}
              <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
                {/* Active Filters Display */}
                {activeFilterCount > 0 && (
                  <div className="mb-6">
                    <Card className="bg-blue-50/50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-900">
                          Aktif Filtreler ({activeFilterCount})
                        </span>
                        <button
                          onClick={clearAllFilters}
                          className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                          Temizle
                        </button>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Loading State */}
                {isLoading && (
                  <div className="flex justify-center py-12">
                    <Loading size="lg" text="AranÄ±yor..." />
                  </div>
                )}

                {/* Results */}
                {!isLoading && searchResults.length > 0 && (
                  <SearchSearchResults
                    query={searchQuery}
                    activeTab={activeTab}
                    sortBy="relevance"
                  />
                )}

                {/* No Results - Enhanced */}
                {!isLoading && searchResults.length === 0 && searchQuery && (
                  <ZeroResultsState
                    query={searchQuery}
                    activeFilterCount={activeFilterCount}
                    onClearFilters={clearAllFilters}
                    onSearch={(newQuery) => {
                      setSearchQuery(newQuery);
                      handleSearch(newQuery);
                    }}
                    showSuggestions={true}
                    showPopular={true}
                    showCategories={true}
                  />
                )}
              </div>
            </div>
          ) : (
            // No Search Query - Show trending/popular
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-8">
                <h2 className="mb-4 text-2xl font-bold text-gray-900">
                  Ne aramak istiyorsun?
                </h2>
                <p className="text-gray-600">
                  PopÃ¼ler kategorileri keÅŸfet veya arama yaparak baÅŸla
                </p>
              </div>

              {/* Popular Categories */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {[
                  { name: 'Web TasarÄ±m', count: '2.3k', icon: 'ğŸ¨' },
                  { name: 'Logo YapÄ±mÄ±', count: '1.8k', icon: 'ğŸ¯' },
                  { name: 'SEO', count: '967', icon: 'ğŸ“ˆ' },
                  { name: 'Mobil App', count: '1.2k', icon: 'ğŸ“±' },
                  { name: 'Ä°Ã§erik YazÄ±mÄ±', count: '834', icon: 'âœï¸' },
                  { name: 'Sosyal Medya', count: '692', icon: 'ğŸ“¸' },
                  { name: 'Video EditÃ¶r', count: '543', icon: 'ğŸ¬' },
                  { name: 'Ã‡eviri', count: '421', icon: 'ğŸŒ' },
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
                    'Logo tasarÄ±m',
                    'WordPress',
                    'E-ticaret',
                    'Instagram tasarÄ±m',
                    'SEO uzmanÄ±',
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
    <Suspense fallback={<Loading size="lg" text="Yükleniyor..." />}>
      <SearchContent />
    </Suspense>
  );
}
