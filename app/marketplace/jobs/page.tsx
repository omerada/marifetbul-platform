/**
 * Job Listing Page
 * Browse and search job postings
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Loader2 } from 'lucide-react';
import { JobCard, JobFilters } from '@/components/domains/jobs';
import { Button } from '@/components/ui';
import { useToast } from '@/hooks';
import { getJobs, type JobFilters as JobFiltersType } from '@/lib/api/jobs';
import type { JobResponse, PageResponse } from '@/types/backend-aligned';

export default function JobsPage() {
  const router = useRouter();
  const toast = useToast();

  // State
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [filters, setFilters] = useState<JobFiltersType>({
    status: 'OPEN',
    page: 0,
    size: 20,
    sortBy: 'latest',
  });

  // Load jobs
  const loadJobs = async (newFilters?: JobFiltersType) => {
    try {
      setIsLoading(true);
      const filtersToUse = newFilters || filters;

      const response: PageResponse<JobResponse> = await getJobs(filtersToUse);

      setJobs(response.content);
      setCurrentPage(response.page || 0);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('Failed to load jobs:', error);
      toast.error('İşler yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle filter change
  const handleFilterChange = (newFilters: JobFiltersType) => {
    setFilters(newFilters);
    loadJobs(newFilters);
  };

  // Handle job click
  const handleJobClick = (jobId: string) => {
    router.push(`/marketplace/jobs/${jobId}`);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    loadJobs(newFilters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
            {/* Results Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {isLoading ? (
                  <span>Yükleniyor...</span>
                ) : (
                  <span>
                    <span className="font-semibold text-gray-900">
                      {totalElements}
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
            {!isLoading && jobs.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white py-16 text-center">
                <Briefcase className="mb-4 h-16 w-16 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  İş ilanı bulunamadı
                </h3>
                <p className="mb-6 max-w-md text-gray-600">
                  {filters.search || filters.categoryId
                    ? 'Filtrelerinize uygun iş ilanı bulunamadı. Filtreleri değiştirmeyi deneyin.'
                    : 'Henüz yayınlanmış iş ilanı bulunmuyor.'}
                </p>
                {(filters.search || filters.categoryId) && (
                  <Button
                    onClick={() =>
                      handleFilterChange({ status: 'OPEN', page: 0, size: 20 })
                    }
                    variant="outline"
                  >
                    Filtreleri Temizle
                  </Button>
                )}
              </div>
            )}

            {/* Jobs Grid */}
            {!isLoading && jobs.length > 0 && (
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
            {!isLoading && jobs.length > 0 && totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0 || isLoading}
                >
                  Önceki
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i;

                    // Show pages around current page
                    if (totalPages > 5) {
                      if (currentPage < 3) {
                        pageNum = i;
                      } else if (currentPage >= totalPages - 3) {
                        pageNum = totalPages - 5 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        disabled={isLoading}
                      >
                        {pageNum + 1}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1 || isLoading}
                >
                  Sonraki
                </Button>
              </div>
            )}

            {/* Page Info */}
            {!isLoading && jobs.length > 0 && (
              <div className="mt-4 text-center text-sm text-gray-600">
                Sayfa {currentPage + 1} / {totalPages}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
