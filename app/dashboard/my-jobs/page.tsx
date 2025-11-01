/**
 * My Jobs Dashboard Page
 * Employer's job management dashboard
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Briefcase, Loader2, Filter } from 'lucide-react';
import { MyJobCard } from '@/components/domains/jobs/MyJobCard';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/hooks';
import {
  getMyJobs,
  closeJob,
  reopenJob,
  deleteJob,
  type JobFilters,
} from '@/lib/api/jobs';
import type {
  JobResponse,
  PageResponse,
  JobStatus,
} from '@/types/backend-aligned';

export default function MyJobsPage() {
  const router = useRouter();
  const toast = useToast();

  // State
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<JobStatus | 'all'>(
    'all'
  );

  const [filters, setFilters] = useState<JobFilters>({
    page: 0,
    size: 20,
    sortBy: 'latest',
  });

  // Load jobs
  const loadJobs = async (newFilters?: JobFilters) => {
    try {
      setIsLoading(true);
      const filtersToUse = newFilters || filters;

      const response: PageResponse<JobResponse> = await getMyJobs(filtersToUse);

      setJobs(response.content);
      setCurrentPage(response.page || 0);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('Failed to load my jobs:', error);
      toast.error('İşleriniz yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle status filter
  const handleStatusFilter = (status: JobStatus | 'all') => {
    setSelectedStatus(status);
    const newFilters: JobFilters = {
      ...filters,
      status: status === 'all' ? undefined : status,
      page: 0,
    };
    setFilters(newFilters);
    loadJobs(newFilters);
  };

  // Handle close job
  const handleCloseJob = async (jobId: string) => {
    if (!confirm('Bu işi kapatmak istediğinizden emin misiniz?')) return;

    try {
      await closeJob(jobId);
      toast.success('İş başarıyla kapatıldı');
      loadJobs();
    } catch (error) {
      console.error('Failed to close job:', error);
      toast.error('İş kapatılırken bir hata oluştu');
    }
  };

  // Handle reopen job
  const handleReopenJob = async (jobId: string) => {
    try {
      await reopenJob(jobId);
      toast.success('İş yeniden açıldı');
      loadJobs();
    } catch (error) {
      console.error('Failed to reopen job:', error);
      toast.error('İş yeniden açılırken bir hata oluştu');
    }
  };

  // Handle delete job
  const handleDeleteJob = async (jobId: string) => {
    if (
      !confirm(
        'Bu işi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.'
      )
    )
      return;

    try {
      await deleteJob(jobId);
      toast.success('İş başarıyla silindi');
      loadJobs();
    } catch (error) {
      console.error('Failed to delete job:', error);
      toast.error('İş silinirken bir hata oluştu');
    }
  };

  // Get job counts by status
  const getStatusCounts = () => {
    const counts = {
      all: totalElements,
      DRAFT: 0,
      OPEN: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      CLOSED: 0,
    };

    // This would ideally come from an API endpoint
    // For now, we calculate from current page
    jobs.forEach((job) => {
      if (counts[job.status as keyof typeof counts] !== undefined) {
        counts[job.status as keyof typeof counts]++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">İşlerim</h1>
            <p className="text-gray-600">
              İş ilanlarınızı yönetin ve teklifleri görüntüleyin
            </p>
          </div>
          <Button
            onClick={() => router.push('/marketplace/jobs/create')}
            className="flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Yeni İş İlanı
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-6">
          <Card
            className={`cursor-pointer p-4 transition-shadow hover:shadow-md ${selectedStatus === 'all' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => handleStatusFilter('all')}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {statusCounts.all}
              </div>
              <div className="text-sm text-gray-600">Tümü</div>
            </div>
          </Card>

          <Card
            className={`cursor-pointer p-4 transition-shadow hover:shadow-md ${selectedStatus === 'DRAFT' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => handleStatusFilter('DRAFT')}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700">
                {statusCounts.DRAFT}
              </div>
              <div className="text-sm text-gray-600">Taslak</div>
            </div>
          </Card>

          <Card
            className={`cursor-pointer p-4 transition-shadow hover:shadow-md ${selectedStatus === 'OPEN' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => handleStatusFilter('OPEN')}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">
                {statusCounts.OPEN}
              </div>
              <div className="text-sm text-gray-600">Açık</div>
            </div>
          </Card>

          <Card
            className={`cursor-pointer p-4 transition-shadow hover:shadow-md ${selectedStatus === 'IN_PROGRESS' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => handleStatusFilter('IN_PROGRESS')}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">
                {statusCounts.IN_PROGRESS}
              </div>
              <div className="text-sm text-gray-600">Devam Ediyor</div>
            </div>
          </Card>

          <Card
            className={`cursor-pointer p-4 transition-shadow hover:shadow-md ${selectedStatus === 'COMPLETED' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => handleStatusFilter('COMPLETED')}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-700">
                {statusCounts.COMPLETED}
              </div>
              <div className="text-sm text-gray-600">Tamamlandı</div>
            </div>
          </Card>

          <Card
            className={`cursor-pointer p-4 transition-shadow hover:shadow-md ${selectedStatus === 'CLOSED' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => handleStatusFilter('CLOSED')}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-red-700">
                {statusCounts.CLOSED}
              </div>
              <div className="text-sm text-gray-600">Kapalı</div>
            </div>
          </Card>
        </div>

        {/* Filter Info */}
        {selectedStatus !== 'all' && (
          <div className="mb-4 flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-600">
              Filtreleniyor: <Badge variant="secondary">{selectedStatus}</Badge>
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleStatusFilter('all')}
            >
              Temizle
            </Button>
          </div>
        )}

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
              {selectedStatus === 'all'
                ? 'Henüz iş ilanı yok'
                : 'Bu statüde iş ilanı bulunamadı'}
            </h3>
            <p className="mb-6 max-w-md text-gray-600">
              {selectedStatus === 'all'
                ? 'İlk iş ilanınızı oluşturarak başlayın.'
                : 'Farklı bir filtre seçmeyi deneyin.'}
            </p>
            {selectedStatus === 'all' ? (
              <Button
                onClick={() => router.push('/marketplace/jobs/create')}
                className="flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Yeni İş İlanı Oluştur
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => handleStatusFilter('all')}
              >
                Tüm İşleri Göster
              </Button>
            )}
          </div>
        )}

        {/* Jobs List */}
        {!isLoading && jobs.length > 0 && (
          <div className="space-y-4">
            {jobs.map((job) => (
              <MyJobCard
                key={job.id}
                job={job}
                onView={(id) => router.push(`/marketplace/jobs/${id}`)}
                onEdit={(id) => router.push(`/marketplace/jobs/${id}/edit`)}
                onDelete={handleDeleteJob}
                onClose={handleCloseJob}
                onReopen={handleReopenJob}
                onViewProposals={(id) =>
                  router.push(`/dashboard/my-jobs/${id}/proposals`)
                }
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && jobs.length > 0 && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                const newFilters = { ...filters, page: currentPage - 1 };
                setFilters(newFilters);
                loadJobs(newFilters);
              }}
              disabled={currentPage === 0}
            >
              Önceki
            </Button>

            <span className="text-sm text-gray-600">
              Sayfa {currentPage + 1} / {totalPages}
            </span>

            <Button
              variant="outline"
              onClick={() => {
                const newFilters = { ...filters, page: currentPage + 1 };
                setFilters(newFilters);
                loadJobs(newFilters);
              }}
              disabled={currentPage >= totalPages - 1}
            >
              Sonraki
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
