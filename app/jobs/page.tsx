'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout';
import { Card, Button, Input } from '@/components/ui';
import { JobCard } from '@/components/marketplace/JobCard';
import { JobFiltersSimple as JobFilters } from '@/components/filters/JobFiltersSimple';
import { MobileJobFilters } from '@/components/mobile/MobileJobFilters';
import { useJobs } from '@/hooks/useJobs';
import { useJobFilters } from '@/hooks/useFilters';
import { useResponsive } from '@/hooks/useResponsive';
import {
  Search,
  Filter,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
} from 'lucide-react';
import type { JobFilters as JobFiltersType, Job } from '@/types';

export default function JobsPage() {
  const { isMobile } = useResponsive();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'newest' | 'budget' | 'proposals'>(
    'newest'
  );
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const {
    filters,
    updateFilters,
    clearFilters,
    isFiltersVisible,
    toggleFiltersVisibility,
  } = useJobFilters({ search: searchQuery });

  const { jobs, pagination, isLoading, error, refetch } = useJobs(
    currentPage,
    12,
    { ...filters, sort: sortBy }
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    updateFilters({ ...filters, search: query });
    setCurrentPage(1);
  };

  const handleFiltersChange = (newFilters: JobFiltersType) => {
    updateFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSortChange = (newSort: typeof sortBy) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const handleJobSave = (job: Job) => {
    console.log('Saving job:', job.id);
  };

  // Quick filter options
  const quickFilters = [
    {
      label: 'Uzaktan',
      value: 'remote',
      icon: MapPin,
      active: filters.location?.includes('remote'),
      onClick: () => {
        const newLocation = filters.location?.includes('remote')
          ? filters.location.filter((l) => l !== 'remote')
          : [...(filters.location || []), 'remote'];
        handleFiltersChange({ ...filters, location: newLocation });
      },
    },
    {
      label: 'Sabit Bütçe',
      value: 'fixed',
      icon: DollarSign,
      active: filters.jobType === 'fixed',
      onClick: () => {
        handleFiltersChange({
          ...filters,
          jobType: filters.jobType === 'fixed' ? undefined : 'fixed',
        });
      },
    },
    {
      label: 'Acil',
      value: 'urgent',
      icon: Clock,
      active: filters.deadline === 'urgent',
      onClick: () => {
        handleFiltersChange({
          ...filters,
          deadline: filters.deadline === 'urgent' ? undefined : 'urgent',
        });
      },
    },
  ];

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    return (
      <div className="mt-8 flex items-center justify-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Önceki
        </Button>

        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
          const page = i + Math.max(1, currentPage - 2);
          if (page > pagination.totalPages) return null;

          return (
            <Button
              key={page}
              variant={currentPage === page ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          );
        })}

        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === pagination.totalPages}
        >
          Sonraki
        </Button>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Simplified Header */}
        <div className="border-b bg-white">
          <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-6 text-center">
              <h1 className="mb-2 text-2xl font-bold text-gray-900">
                İş İlanları
              </h1>
              <p className="text-gray-600">
                {pagination?.total
                  ? `${pagination.total.toLocaleString('tr-TR')} `
                  : ''}
                iş ilanı bulundu
              </p>
            </div>

            {/* Unified Search and Filter */}
            <div className="mx-auto mb-4 max-w-xl">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <Input
                  type="text"
                  placeholder="İş ara (teknoloji, şirket, konum...)"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pr-20 pl-10"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    isMobile
                      ? setShowMobileFilters(true)
                      : toggleFiltersVisibility()
                  }
                  className="absolute top-1/2 right-2 -translate-y-1/2"
                >
                  <Filter className="mr-1 h-4 w-4" />
                  Filtre
                </Button>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex justify-center space-x-2 overflow-x-auto pb-2">
              {quickFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={filter.onClick}
                  className={`flex items-center rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    filter.active
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <filter.icon className="mr-1 h-4 w-4" />
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {/* Desktop Filters Sidebar */}
            {!isMobile && (
              <div
                className={`transition-all duration-300 ${
                  isFiltersVisible ? 'w-80' : 'w-0 overflow-hidden'
                }`}
              >
                <div className="sticky top-6">
                  <JobFilters
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onClearFilters={clearFilters}
                  />
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="flex-1">
              {/* Sort Controls */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Sıralama:</span>
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      handleSortChange(e.target.value as typeof sortBy)
                    }
                    className="rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="newest">En Yeni</option>
                    <option value="budget">Bütçe (Yüksekten Düşüğe)</option>
                    <option value="proposals">En Az Teklif</option>
                  </select>
                </div>

                {/* Results Info */}
                <div className="text-sm text-gray-600">
                  {pagination && (
                    <>
                      {(currentPage - 1) * 12 + 1}-
                      {Math.min(currentPage * 12, pagination.total)} /{' '}
                      {pagination.total}
                    </>
                  )}
                </div>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="space-y-4">
                  {Array.from({ length: 6 }, (_, i) => (
                    <Card key={i} className="p-6">
                      <div className="animate-pulse">
                        <div className="mb-4 h-6 w-3/4 rounded bg-gray-200"></div>
                        <div className="mb-4 h-4 w-full rounded bg-gray-200"></div>
                        <div className="mb-4 h-4 w-2/3 rounded bg-gray-200"></div>
                        <div className="flex space-x-2">
                          <div className="h-6 w-16 rounded-full bg-gray-200"></div>
                          <div className="h-6 w-20 rounded-full bg-gray-200"></div>
                          <div className="h-6 w-18 rounded-full bg-gray-200"></div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Error State */}
              {error && (
                <Card className="p-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                    <Briefcase className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    İş ilanları yüklenemedi
                  </h3>
                  <p className="mb-4 text-gray-600">
                    Bir hata oluştu. Lütfen sayfayı yenileyin veya daha sonra
                    tekrar deneyin.
                  </p>
                  <Button onClick={() => refetch()}>Tekrar Dene</Button>
                </Card>
              )}

              {/* Jobs Grid */}
              {!isLoading && !error && jobs && (
                <>
                  {jobs.length > 0 ? (
                    <div className="space-y-4">
                      {jobs.map((job) => (
                        <JobCard
                          key={job.id}
                          job={job}
                          onSaveJob={handleJobSave}
                          className="hover:shadow-md"
                        />
                      ))}
                    </div>
                  ) : (
                    /* Empty State */
                    <Card className="p-12 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                        <Briefcase className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-gray-900">
                        İş ilanı bulunamadı
                      </h3>
                      <p className="mb-4 text-gray-600">
                        Arama kriterlerinizle eşleşen iş ilanı bulunamadı.
                        Filtreleri değiştirmeyi deneyin.
                      </p>
                      <Button variant="outline" onClick={clearFilters}>
                        Filtreleri Temizle
                      </Button>
                    </Card>
                  )}

                  {/* Pagination */}
                  {renderPagination()}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {isMobile && (
        <MobileJobFilters
          isOpen={showMobileFilters}
          onClose={() => setShowMobileFilters(false)}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={clearFilters}
        />
      )}
    </AppLayout>
  );
}
