/**
 * ================================================
 * JOB LISTING PAGE
 * ================================================
 * Browse and search job postings with filters
 *
 * Features:
 * - Job listing with pagination
 * - Advanced filters (category, budget, location, skills)
 * - Search functionality
 * - Integration with useJobs hook
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint 2: Refactored with useJobs hook
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Loader2 } from 'lucide-react';
import { JobCard, JobFilters, FilterChips } from '@/components/domains/jobs';
import { Button } from '@/components/ui';
import { useJobs } from '@/hooks/business/jobs/useJobs';
import type { JobFilters as JobFiltersType } from '@/lib/api/jobs';

export default function JobsPage() {
  const router = useRouter();
  const [filters, setFiltersState] = useState<JobFiltersType>({
    status: 'OPEN',
    size: 20,
    sortBy: 'latest',
  });

  // Use the new useJobs hook
  const { jobs, isLoading, pagination, fetchJobs } = useJobs();

  // Load jobs when filters change
  useEffect(() => {
    fetchJobs(filters);
  }, [filters, fetchJobs]);

  // Handle filter change
  const handleFilterChange = useCallback((newFilters: JobFiltersType) => {
    setFiltersState({ ...newFilters, page: 0 }); // Reset to first page on filter change
  }, []);

  // Handle filter removal from chips
  const handleRemoveFilter = useCallback(
    (filterKey: keyof JobFiltersType, value?: string) => {
      setFiltersState((prev) => {
        const newFilters = { ...prev };

        if (filterKey === 'experienceLevel' && value) {
          // Remove specific experience level
          const current = Array.isArray(newFilters.experienceLevel)
            ? newFilters.experienceLevel
            : [];
          const updated = current.filter((v) => v !== value);
          newFilters.experienceLevel = updated.length > 0 ? updated : undefined;
        } else if (filterKey === 'skills' && value) {
          // Remove specific skill
          const current = Array.isArray(newFilters.skills)
            ? newFilters.skills
            : [];
          const updated = current.filter((v) => v !== value);
          newFilters.skills = updated.length > 0 ? updated : undefined;
        } else {
          // Remove entire filter
          delete newFilters[filterKey];
        }

        newFilters.page = 0; // Reset to first page
        return newFilters;
      });
    },
    []
  );

  // Handle clear all filters
  const handleClearAllFilters = useCallback(() => {
    setFiltersState({
      status: 'OPEN',
      size: 20,
      sortBy: 'latest',
    });
  }, []);

  // Handle job click
  const handleJobClick = (jobId: string) => {
    router.push(`/marketplace/jobs/${jobId}`);
  };

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setFiltersState((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">İş İlanları</h1>
          <p className="text-gray-600">Projeler bulun ve teklif verin</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <JobFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Jobs List */}
          <div className="lg:col-span-3">
            {/* Filter Chips */}
            <div className="mb-4">
              <FilterChips
                filters={filters}
                onRemoveFilter={handleRemoveFilter}
                onClearAll={handleClearAllFilters}
                isLoading={isLoading}
              />
            </div>

            {/* Results Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {isLoading ? (
                  <span>Yükleniyor...</span>
                ) : (
                  <span>
                    <span className="font-semibold text-gray-900">
                      {pagination?.totalElements || 0}
                    </span>{' '}
                    iş ilanı bulundu
                  </span>
                )}
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            )}

            {/* Empty State */}
            {!isLoading && (!jobs || jobs.length === 0) && (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white py-16 text-center">
                <Briefcase className="mb-4 h-16 w-16 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  İş ilanı bulunamadı
                </h3>
                <p className="mb-6 max-w-md text-gray-600">
                  Filtrelerinize uygun iş ilanı bulunamadı veya henüz
                  yayınlanmış iş ilanı bulunmuyor.
                </p>
              </div>
            )}

            {/* Jobs Grid */}
            {!isLoading && jobs && jobs.length > 0 && (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onClick={handleJobClick}
                    showActions={true}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!isLoading &&
              jobs &&
              jobs.length > 0 &&
              pagination &&
              pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 0 || isLoading}
                  >
                    Önceki
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from(
                      {
                        length: Math.min(5, pagination.totalPages),
                      },
                      (_, i) => {
                        let pageNum = i;

                        // Show pages around current page
                        if (pagination.totalPages > 5) {
                          if (pagination.page < 3) {
                            pageNum = i;
                          } else if (
                            pagination.page >=
                            pagination.totalPages - 3
                          ) {
                            pageNum = pagination.totalPages - 5 + i;
                          } else {
                            pageNum = pagination.page - 2 + i;
                          }
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={
                              pagination.page === pageNum ? 'primary' : 'ghost'
                            }
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            disabled={isLoading}
                          >
                            {pageNum + 1}
                          </Button>
                        );
                      }
                    )}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={
                      pagination.page >= pagination.totalPages - 1 || isLoading
                    }
                  >
                    Sonraki
                  </Button>
                </div>
              )}

            {/* Page Info */}
            {!isLoading && jobs && jobs.length > 0 && pagination && (
              <div className="mt-4 text-center text-sm text-gray-600">
                Sayfa {pagination.page + 1} / {pagination.totalPages}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
