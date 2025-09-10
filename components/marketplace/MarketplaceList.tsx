'use client';

import React, { useState, useEffect } from 'react';
import { Job, ServicePackage } from '@/types';
import { useJobs } from '@/hooks/useJobs';
import { usePackages } from '@/hooks/usePackages';
import { useJobFilters, usePackageFilters } from '@/hooks/useFilters';
import { JobCard } from './JobCard';
import { ServiceCard } from './ServiceCard';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Briefcase, Package } from 'lucide-react';

type MarketplaceMode = 'jobs' | 'services';

interface MarketplaceListProps {
  initialMode?: MarketplaceMode;
  className?: string;
  searchQuery?: string;
  externalFilters?: Record<string, unknown>;
}

export function MarketplaceList({
  initialMode = 'jobs',
  className,
  searchQuery = '',
  externalFilters,
}: MarketplaceListProps) {
  const mode = initialMode;
  const [currentPage, setCurrentPage] = useState(1);

  // Advanced filters hooks with search integration
  const jobFiltersHook = useJobFilters({
    search: searchQuery,
    ...(externalFilters || {}),
  });
  const packageFiltersHook = usePackageFilters({
    search: searchQuery,
    ...(externalFilters || {}),
  });

  // Reset page when filters or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, externalFilters, mode]);

  // Data fetching with filters
  const {
    jobs,
    pagination: jobsPagination,
    isLoading: jobsLoading,
    error: jobsError,
  } = useJobs(currentPage, 12, jobFiltersHook.filters);

  const {
    packages,
    pagination: packagesPagination,
    isLoading: packagesLoading,
    error: packagesError,
  } = usePackages(currentPage, 12, packageFiltersHook.filters);

  const isLoading = mode === 'jobs' ? jobsLoading : packagesLoading;
  const error = mode === 'jobs' ? jobsError : packagesError;
  const pagination = mode === 'jobs' ? jobsPagination : packagesPagination;

  // Results data
  const currentData = mode === 'jobs' ? jobs : packages;

  // Display results count
  const resultsCount = pagination?.total || 0;
  const showingFrom = Math.min((currentPage - 1) * 12 + 1, resultsCount);
  const showingTo = Math.min(currentPage * 12, resultsCount);

  const handleJobAction = (action: string, job: Job) => {
    console.log(`${action} job:`, job.id);
    // TODO: Implement job actions (save, view details, etc.)
  };

  const handleServiceAction = (action: string, service: ServicePackage) => {
    console.log(`${action} service:`, service.id);
    // TODO: Implement service actions (save, add to cart, view details, etc.)
  };

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(
      pagination.totalPages,
      startPage + maxPagesToShow - 1
    );

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="mt-8 flex flex-col items-center space-y-4">
        {/* Results info */}
        <div className="text-sm text-gray-600">
          {resultsCount > 0 && (
            <span>
              {showingFrom}-{showingTo} / {resultsCount.toLocaleString()} sonuç
              {searchQuery && ` "${searchQuery}" için`}
            </span>
          )}
        </div>

        {/* Pagination buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Önceki
          </Button>

          {pages.map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === pagination.totalPages}
          >
            Sonraki
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'jobs' ? 'İş İlanları' : 'Hizmet Paketleri'}
          </h2>
          {resultsCount > 0 && (
            <p className="mt-1 text-sm text-gray-600">
              {resultsCount.toLocaleString()} sonuç bulundu
              {searchQuery && ` "${searchQuery}" için`}
            </p>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <Loading size="lg" text="Yükleniyor..." />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <Package className="h-8 w-8 text-red-600" />
          </div>
          <p className="mb-2 text-lg font-medium text-red-600">
            Bir hata oluştu
          </p>
          <p className="mb-4 text-gray-600">
            {mode === 'jobs' ? 'İş ilanları' : 'Hizmetler'} yüklenemedi.
          </p>
          <Button onClick={() => window.location.reload()}>Tekrar Dene</Button>
        </div>
      )}

      {/* Content Grid */}
      {!isLoading && !error && (
        <>
          {mode === 'jobs' ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onSaveJob={(job) => handleJobAction('save', job)}
                  className="transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {packages.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onAddToCart={(service) =>
                    handleServiceAction('cart', service)
                  }
                  onSaveService={(service) =>
                    handleServiceAction('save', service)
                  }
                  className="transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {currentData.length === 0 && (
            <div className="py-16 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                {mode === 'jobs' ? (
                  <Briefcase className="h-10 w-10 text-gray-400" />
                ) : (
                  <Package className="h-10 w-10 text-gray-400" />
                )}
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                {searchQuery
                  ? `"${searchQuery}" için sonuç bulunamadı`
                  : `${mode === 'jobs' ? 'İş ilanı' : 'Hizmet'} bulunamadı`}
              </h3>
              <p className="mx-auto mb-6 max-w-md text-gray-600">
                {searchQuery
                  ? 'Farklı anahtar kelimeler deneyebilir veya filtreleri değiştirebilirsiniz.'
                  : 'Filtreleri değiştirmeyi veya daha genel arama terimlerini denemeyi deneyin.'}
              </p>
              {(searchQuery ||
                (externalFilters &&
                  Object.keys(externalFilters).length > 0)) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    // Clear search and filters
                    window.location.reload();
                  }}
                >
                  Tüm Filtreleri Temizle
                </Button>
              )}
            </div>
          )}

          {/* Pagination */}
          {renderPagination()}
        </>
      )}
    </div>
  );
}
