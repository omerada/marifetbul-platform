'use client';

import { useFacetedSearch } from '@/hooks/business/search';
import {
  FacetPanel,
  SearchResults,
  SearchHeader,
  type Service,
} from './components';
import { Card } from '@/components/ui/Card';
import { Loader2 } from 'lucide-react';

export default function FacetedSearchPage() {
  const {
    data,
    filters,
    isLoading,
    error,
    updateFilters,
    toggleFacet,
    clearFilters,
  } = useFacetedSearch({ pageSize: 20 });

  const handleSearch = (query: string) => {
    updateFilters({ query });
  };

  const handlePageChange = (page: number) => {
    updateFilters({ page });
  };

  return (
    <div className="container mx-auto py-6">
      <SearchHeader
        query={filters.query || ''}
        onSearch={handleSearch}
        activeFiltersCount={
          (filters.categories?.length || 0) +
          (filters.locations?.length || 0) +
          (filters.minRating ? 1 : 0) +
          (filters.priceMin || filters.priceMax ? 1 : 0)
        }
        onClearFilters={clearFilters}
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Facet Panel (Sidebar) */}
        <aside className="lg:col-span-1">
          <FacetPanel
            facets={data?.facets || {}}
            filters={filters}
            onToggleFacet={toggleFacet}
            onUpdateFilters={updateFilters}
            isLoading={isLoading}
          />
        </aside>

        {/* Search Results */}
        <main className="lg:col-span-3">
          {error ? (
            <Card className="p-6 text-center">
              <p className="text-destructive">Error loading results: {error}</p>
            </Card>
          ) : isLoading ? (
            <Card className="flex items-center justify-center p-12">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </Card>
          ) : (
            <SearchResults
              services={(data?.services || []) as Service[]}
              pagination={data?.pagination}
              onPageChange={handlePageChange}
            />
          )}
        </main>
      </div>
    </div>
  );
}
