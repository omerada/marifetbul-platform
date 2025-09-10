'use client';

import React, { useState } from 'react';
import { Search, Filter, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import MobileFiltersSheet, {
  defaultMobileFilters,
  type FilterSection,
} from './MobileFiltersSheet';
import { JobCard } from '@/components/marketplace/JobCard';
import { ServiceCard } from '@/components/marketplace/ServiceCard';
import { useJobs } from '@/hooks/useJobs';
import { usePackages } from '@/hooks/usePackages';
import { Job, ServicePackage } from '@/types';

type ViewMode = 'grid' | 'list';
type MarketplaceMode = 'jobs' | 'services';

interface MobileMarketplaceProps {
  initialMode?: MarketplaceMode;
}

export function MobileMarketplace({
  initialMode = 'jobs',
}: MobileMarketplaceProps) {
  const [mode, setMode] = useState<MarketplaceMode>(initialMode);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState(defaultMobileFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Convert FilterSection[] to simple filter object for API calls
  const convertFiltersToApiFormat = (
    filterSections: FilterSection[]
  ): Record<string, string> => {
    const apiFilters: Record<string, string> = {};

    filterSections.forEach((section) => {
      if (section.type === 'multiselect' || section.type === 'radio') {
        const selectedOptions = section.options?.filter((opt) => opt.selected);
        if (selectedOptions && selectedOptions.length > 0) {
          apiFilters[section.id] = selectedOptions
            .map((opt) => opt.id)
            .join(',');
        }
      } else if (
        section.type === 'range' &&
        section.value &&
        typeof section.value === 'object'
      ) {
        if (section.value.min)
          apiFilters[`${section.id}_min`] = section.value.min;
        if (section.value.max)
          apiFilters[`${section.id}_max`] = section.value.max;
      }
    });

    return apiFilters;
  };

  const apiFilters = convertFiltersToApiFormat(filters);

  // Data fetching
  const {
    jobs,
    pagination: jobsPagination,
    isLoading: jobsLoading,
  } = useJobs(currentPage, 12, { ...apiFilters, search: searchQuery });

  const {
    packages,
    pagination: packagesPagination,
    isLoading: packagesLoading,
  } = usePackages(currentPage, 12, { ...apiFilters, search: searchQuery });

  const isLoading = mode === 'jobs' ? jobsLoading : packagesLoading;
  const data = mode === 'jobs' ? jobs : packages;
  const pagination = mode === 'jobs' ? jobsPagination : packagesPagination;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleApplyFilters = (newFilters: FilterSection[]) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const getActiveFiltersCount = (filterSections: FilterSection[]): number => {
    return filterSections.reduce((count, section) => {
      if (section.type === 'multiselect' || section.type === 'radio') {
        return (
          count + (section.options?.filter((opt) => opt.selected).length || 0)
        );
      }
      if (
        section.type === 'range' &&
        section.value &&
        typeof section.value === 'object'
      ) {
        return count + (section.value.min || section.value.max ? 1 : 0);
      }
      return count;
    }, 0);
  };

  const handleClearAllFilters = () => {
    setFilters(defaultMobileFilters);
    setCurrentPage(1);
  };

  const activeFiltersCount = getActiveFiltersCount(filters);

  return (
    <div className="min-h-screen bg-gray-50 lg:hidden">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-gray-200 bg-white px-4 py-3">
        {/* Mode Toggle */}
        <div className="mb-3 flex items-center justify-center">
          <div className="flex items-center rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setMode('jobs')}
              className={`flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                mode === 'jobs'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              İş İlanları
            </button>
            <button
              onClick={() => setMode('services')}
              className={`flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                mode === 'services'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Hizmetler
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder={`${mode === 'jobs' ? 'İş ara' : 'Hizmet ara'}...`}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pr-4 pl-10"
          />
        </div>

        {/* Filter and View Controls */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(true)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtreler
            {activeFiltersCount > 0 && (
              <span className="ml-1 rounded-full bg-blue-600 px-2 py-1 text-xs text-white">
                {activeFiltersCount}
              </span>
            )}
          </Button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-md p-2 ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-md p-2 ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg bg-white p-4">
                <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
                <div className="mb-4 h-3 w-1/2 rounded bg-gray-200"></div>
                <div className="space-y-2">
                  <div className="h-3 rounded bg-gray-200"></div>
                  <div className="h-3 w-5/6 rounded bg-gray-200"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-4 text-sm text-gray-600">
              {pagination?.total || 0} sonuç bulundu
            </div>

            {/* Items Grid/List */}
            <div
              className={
                viewMode === 'grid'
                  ? mode === 'jobs'
                    ? 'space-y-4'
                    : 'grid grid-cols-1 gap-3 sm:grid-cols-2'
                  : 'space-y-3'
              }
            >
              {data.map((item) => {
                if (mode === 'jobs') {
                  const job = item as Job;
                  return (
                    <JobCard
                      key={job.id}
                      job={job}
                      onSaveJob={() => {}}
                      className={`bg-white transition-transform active:scale-95 ${
                        viewMode === 'grid' ? 'touch-manipulation' : ''
                      }`}
                    />
                  );
                } else {
                  const service = item as ServicePackage;
                  return (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      onAddToCart={() => {}}
                      onSaveService={() => {}}
                      className={`bg-white transition-transform active:scale-95 ${
                        viewMode === 'grid' ? 'touch-manipulation' : ''
                      }`}
                    />
                  );
                }
              })}
            </div>

            {/* Empty State */}
            {data.length === 0 && (
              <div className="py-12 text-center">
                <div className="mb-2 text-gray-500">
                  {mode === 'jobs' ? 'İş ilanı' : 'Hizmet'} bulunamadı
                </div>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilters(defaultMobileFilters);
                    setCurrentPage(1);
                  }}
                  className="text-sm font-medium text-blue-600"
                >
                  Filtreleri temizle
                </button>
              </div>
            )}

            {/* Load More */}
            {pagination && pagination.page < pagination.totalPages && (
              <div className="mt-6 text-center">
                <Button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  variant="outline"
                  className="w-full"
                >
                  Daha Fazla Yükle
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Mobile Filters Sheet */}
      <MobileFiltersSheet
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={handleApplyFilters}
        onClearAll={handleClearAllFilters}
        filters={filters}
        resultCount={data?.length || 0}
      />
    </div>
  );
}
