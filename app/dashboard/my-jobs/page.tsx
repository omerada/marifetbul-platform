/**
 * ================================================
 * MY JOBS DASHBOARD PAGE
 * ================================================
 * Employer's job management dashboard
 *
 * Features:
 * - Job listing with filters
 * - Status-based filtering
 * - Pagination
 * - Quick actions (close, reopen, delete)
 * - Statistics cards
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint 1: Refactored with useJobs hook
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Briefcase, Loader2, Filter, AlertCircle } from 'lucide-react';
import { MyJobCard } from '@/components/domains/jobs/MyJobCard';
import {
  JobCloseModal,
  JobReopenModal,
} from '@/components/domains/jobs/JobStatusModals';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useJobs } from '@/hooks/business/jobs/useJobs';
import type { JobStatus, JobResponse } from '@/types/backend-aligned';

export default function MyJobsPage() {
  const router = useRouter();

  // State
  const [selectedStatus, setSelectedStatus] = useState<JobStatus | 'all'>(
    'all'
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobResponse | null>(null);

  // Use Jobs Hook
  const { jobs, isLoading, error, pagination, fetchMyJobs } = useJobs();

  // Initial load
  useEffect(() => {
    fetchMyJobs({
      page: currentPage,
      size: 20,
      status: selectedStatus === 'all' ? undefined : selectedStatus,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedStatus]);

  // Handle status filter
  const handleStatusFilter = (status: JobStatus | 'all') => {
    setSelectedStatus(status);
    setCurrentPage(0);
  };

  // Handle close job
  const handleCloseJob = async (jobId: string) => {
    const job = jobs?.find((j) => j.id === jobId);
    if (!job) return;

    setSelectedJob(job);
    setCloseModalOpen(true);
  };

  // Handle reopen job
  const handleReopenJob = async (jobId: string) => {
    const job = jobs?.find((j) => j.id === jobId);
    if (!job) return;

    setSelectedJob(job);
    setReopenModalOpen(true);
  };

  // Handle delete job
  const handleDeleteJob = async (jobId: string) => {
    if (
      !confirm(
        'Bu işi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.'
      )
    )
      return;

    // TODO: Implement delete job API call
    console.log('Delete job:', jobId);
  };

  // Handle modal success
  const handleModalSuccess = () => {
    fetchMyJobs({
      page: currentPage,
      size: 20,
      status: selectedStatus === 'all' ? undefined : selectedStatus,
    });
  };

  // Get job counts by status
  const getStatusCounts = () => {
    const counts = {
      all: pagination?.totalElements || 0,
      DRAFT: 0,
      OPEN: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      CLOSED: 0,
    };

    // This would ideally come from an API endpoint
    // For now, we calculate from current page
    jobs?.forEach((job) => {
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

        {/* Error State */}
        {error && (
          <Card className="p-6">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-semibold">Bir hata oluştu</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && (!jobs || jobs.length === 0) && (
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
        {!isLoading && !error && jobs && jobs.length > 0 && (
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
        {!isLoading &&
          !error &&
          jobs &&
          jobs.length > 0 &&
          pagination &&
          pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => prev - 1)}
                disabled={currentPage === 0}
              >
                Önceki
              </Button>

              <span className="text-sm text-gray-600">
                Sayfa {currentPage + 1} / {pagination.totalPages}
              </span>

              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={currentPage >= pagination.totalPages - 1}
              >
                Sonraki
              </Button>
            </div>
          )}
      </div>

      {/* Modals */}
      {selectedJob && (
        <>
          <JobCloseModal
            isOpen={closeModalOpen}
            onClose={() => setCloseModalOpen(false)}
            onSuccess={handleModalSuccess}
            job={selectedJob}
          />
          <JobReopenModal
            isOpen={reopenModalOpen}
            onClose={() => setReopenModalOpen(false)}
            onSuccess={handleModalSuccess}
            job={selectedJob}
          />
        </>
      )}
    </div>
  );
}
