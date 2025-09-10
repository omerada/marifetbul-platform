'use client';

import React, { useState } from 'react';
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
}

export function MarketplaceList({
  initialMode = 'jobs',
  className,
}: MarketplaceListProps) {
  const mode = initialMode;
  const [currentPage, setCurrentPage] = useState(1);

  // Advanced filters hooks
  const jobFiltersHook = useJobFilters({});
  const packageFiltersHook = usePackageFilters({});

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
      <div className="mt-8 flex items-center justify-center space-x-2">
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
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="py-12 text-center">
          <p className="text-red-600">
            {mode === 'jobs' ? 'İş ilanları' : 'Hizmetler'} yüklenemedi. Lütfen
            tekrar deneyin.
          </p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Tekrar Dene
          </Button>
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
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {((mode === 'jobs' && jobs.length === 0) ||
            (mode === 'services' && packages.length === 0)) && (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                {mode === 'jobs' ? (
                  <Briefcase className="h-8 w-8 text-gray-400" />
                ) : (
                  <Package className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                {mode === 'jobs' ? 'İş ilanı bulunamadı' : 'Hizmet bulunamadı'}
              </h3>
              <p className="text-gray-600">
                Filtreleri değiştirmeyi veya daha genel arama terimlerini
                denemeyi deneyin.
              </p>
            </div>
          )}

          {/* Pagination */}
          {renderPagination()}
        </>
      )}
    </div>
  );
}
