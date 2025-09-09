'use client';

import React, { useState } from 'react';
import { Job, ServicePackage, JobFilters, PackageFilters } from '@/types';
import { useJobs } from '@/hooks/useJobs';
import { usePackages } from '@/hooks/usePackages';
import { JobCard } from './JobCard';
import { ServiceCard } from './ServiceCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { Search, Filter, Briefcase, Package } from 'lucide-react';

type MarketplaceMode = 'jobs' | 'services';

interface MarketplaceListProps {
  initialMode?: MarketplaceMode;
  className?: string;
}

export function MarketplaceList({
  initialMode = 'jobs',
  className,
}: MarketplaceListProps) {
  const [mode, setMode] = useState<MarketplaceMode>(initialMode);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [jobFilters, setJobFilters] = useState<JobFilters>({});
  const [packageFilters, setPackageFilters] = useState<PackageFilters>({});

  // Data fetching
  const {
    jobs,
    pagination: jobsPagination,
    isLoading: jobsLoading,
    error: jobsError,
  } = useJobs(currentPage, 12, { ...jobFilters, search: searchQuery });

  const {
    packages,
    pagination: packagesPagination,
    isLoading: packagesLoading,
    error: packagesError,
  } = usePackages(currentPage, 12, { ...packageFilters, search: searchQuery });

  const isLoading = mode === 'jobs' ? jobsLoading : packagesLoading;
  const error = mode === 'jobs' ? jobsError : packagesError;
  const pagination = mode === 'jobs' ? jobsPagination : packagesPagination;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleModeToggle = (newMode: MarketplaceMode) => {
    setMode(newMode);
    setCurrentPage(1);
    setSearchQuery('');
  };

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
      {/* Header with Mode Toggle */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Pazar Yeri</h1>

          {/* Mode Toggle */}
          <div className="flex items-center rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => handleModeToggle('jobs')}
              className={`flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                mode === 'jobs'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Briefcase className="mr-2 h-4 w-4" />
              İş İlanları
            </button>
            <button
              onClick={() => handleModeToggle('services')}
              className={`flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                mode === 'services'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Package className="mr-2 h-4 w-4" />
              Hizmetler
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              type="text"
              placeholder={`${mode === 'jobs' ? 'İş ilanları' : 'Hizmetler'} ara...`}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-64 pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filtreler
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="rounded-lg bg-gray-50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Filtreler</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input
              type="text"
              placeholder="Kategori"
              value={
                mode === 'jobs'
                  ? jobFilters.category || ''
                  : packageFilters.category || ''
              }
              onChange={(e) => {
                if (mode === 'jobs') {
                  setJobFilters({ ...jobFilters, category: e.target.value });
                } else {
                  setPackageFilters({
                    ...packageFilters,
                    category: e.target.value,
                  });
                }
                setCurrentPage(1);
              }}
            />
            {mode === 'jobs' && (
              <Input
                type="text"
                placeholder="Konum"
                value={jobFilters.location || ''}
                onChange={(e) => {
                  setJobFilters({ ...jobFilters, location: e.target.value });
                  setCurrentPage(1);
                }}
              />
            )}
            <Input
              type="text"
              placeholder="Yetenekler"
              value={mode === 'jobs' ? jobFilters.skills?.[0] || '' : ''}
              onChange={(e) => {
                if (mode === 'jobs') {
                  setJobFilters({
                    ...jobFilters,
                    skills: e.target.value ? [e.target.value] : undefined,
                  });
                }
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      )}

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
            {mode === 'jobs' ? 'İş ilanları' : 'Hizmetler'} yüklenemedi. Lütfen tekrar deneyin.
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
                  onViewDetails={(job) => handleJobAction('view', job)}
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
                  onViewDetails={(service) =>
                    handleServiceAction('view', service)
                  }
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
                Filtreleri değiştirmeyi veya daha genel arama terimlerini denemeyi deneyin.
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
