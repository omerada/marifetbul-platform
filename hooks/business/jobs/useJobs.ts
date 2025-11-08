/**
 * ================================================
 * USE JOBS HOOK
 * ================================================
 * Custom hook for managing job listings (employer dashboard)
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 6, 2025
 * Sprint: Job Posting & Proposal System - Story 1, Task 1.5
 */

import { useState, useCallback, useEffect } from 'react';
import useSWR from 'swr';
import type {
  PageResponse,
  JobResponse,
  JobStatus,
} from '@/types/backend-aligned';
import * as jobsAPI from '@/lib/api/jobs';
import { logger } from '@/lib/infrastructure/monitoring/logger';
import { toast } from 'sonner';

// ================================================
// TYPES
// ================================================

export interface JobFilters {
  status?: JobStatus;
  search?: string;
  category?: string;
  sortBy?: 'newest' | 'budget' | 'deadline' | 'proposals';
  page?: number;
  limit?: number;
}

export interface UseJobsReturn {
  // Data
  jobs: JobResponse[];
  pagination: {
    page: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
    hasPrevious: boolean;
  } | null;
  stats: {
    totalJobs: number;
    activeJobs: number;
    draftJobs: number;
    closedJobs: number;
  };

  // Loading States
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isPublishing: boolean;
  isClosing: boolean;

  // Error
  error: Error | null;

  // Actions
  createJob: (data: jobsAPI.CreateJobRequest) => Promise<JobResponse | null>;
  updateJob: (
    id: string,
    data: jobsAPI.UpdateJobRequest
  ) => Promise<JobResponse | null>;
  deleteJob: (id: string) => Promise<boolean>;
  publishJob: (id: string) => Promise<JobResponse | null>;
  closeJob: (id: string) => Promise<JobResponse | null>;
  refresh: () => Promise<void>;
  setFilters: (filters: JobFilters) => void;
}

// ================================================
// HOOK
// ================================================

export function useJobs(initialFilters: JobFilters = {}): UseJobsReturn {
  const [filters, setFilters] = useState<JobFilters>({
    page: 1,
    limit: 10,
    sortBy: 'newest',
    ...initialFilters,
  });

  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // ==================== DATA FETCHING ====================

  // Fetch user's jobs
  const {
    data: jobsData,
    error,
    isLoading,
    mutate,
  } = useSWR<PageResponse<JobResponse>>(
    ['my-jobs', filters],
    async () => {
      const response = await jobsAPI.getMyJobs(filters);
      return response;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  // Calculate stats from jobs
  const stats = {
    totalJobs: jobsData?.totalElements || 0,
    activeJobs:
      jobsData?.content.filter((j) => j.status === 'OPEN').length || 0,
    draftJobs:
      jobsData?.content.filter((j) => j.status === 'DRAFT').length || 0,
    closedJobs:
      jobsData?.content.filter((j) => j.status === 'CLOSED').length || 0,
  };

  // ==================== ACTIONS ====================

  /**
   * Create new job
   */
  const createJob = useCallback(
    async (data: jobsAPI.CreateJobRequest): Promise<JobResponse | null> => {
      try {
        setIsCreating(true);
        logger.info('Creating job', { title: data.title });

        const newJob = await jobsAPI.createJob(data);

        // Optimistic update
        await mutate();

        toast.success('İş ilanı oluşturuldu', {
          description:
            data.status === 'DRAFT'
              ? 'Taslak olarak kaydedildi'
              : 'İlan yayınlandı',
        });

        logger.info('Job created successfully', { jobId: newJob.id });
        return newJob;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error('Failed to create job', err);
        toast.error('İlan oluşturulamadı', {
          description: err.message || 'Lütfen tekrar deneyin',
        });
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [mutate]
  );

  /**
   * Update existing job
   */
  const updateJob = useCallback(
    async (
      id: string,
      data: jobsAPI.UpdateJobRequest
    ): Promise<JobResponse | null> => {
      try {
        setIsUpdating(true);
        logger.info('Updating job', { jobId: id });

        const updatedJob = await jobsAPI.updateJob(id, data);

        // Optimistic update
        await mutate();

        toast.success('İlan güncellendi');

        logger.info('Job updated successfully', { jobId: id });
        return updatedJob;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error('Failed to update job', err);
        toast.error('İlan güncellenemedi', {
          description: err.message || 'Lütfen tekrar deneyin',
        });
        return null;
      } finally {
        setIsUpdating(false);
      }
    },
    [mutate]
  );

  /**
   * Delete job
   */
  const deleteJob = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setIsDeleting(true);
        logger.info('Deleting job', { jobId: id });

        await jobsAPI.deleteJob(id);

        // Optimistic update
        await mutate();

        toast.success('İlan silindi');

        logger.info('Job deleted successfully', { jobId: id });
        return true;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error('Failed to delete job', err);
        toast.error('İlan silinemedi', {
          description: err.message || 'Lütfen tekrar deneyin',
        });
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [mutate]
  );

  /**
   * Publish job (change status from DRAFT to OPEN)
   */
  const publishJob = useCallback(
    async (id: string): Promise<JobResponse | null> => {
      try {
        setIsPublishing(true);
        logger.info('Publishing job', { jobId: id });

        const publishedJob = await jobsAPI.publishJob(id);

        // Optimistic update
        await mutate();

        toast.success('İlan yayınlandı', {
          description: "Freelancer'lar artık tekliflerini gönderebilir",
        });

        logger.info('Job published successfully', { jobId: id });
        return publishedJob;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error('Failed to publish job', err);
        toast.error('İlan yayınlanamadı', {
          description: err.message || 'Lütfen tekrar deneyin',
        });
        return null;
      } finally {
        setIsPublishing(false);
      }
    },
    [mutate]
  );

  /**
   * Close job (stop accepting proposals)
   */
  const closeJob = useCallback(
    async (id: string): Promise<JobResponse | null> => {
      try {
        setIsClosing(true);
        logger.info('Closing job', { jobId: id });

        const closedJob = await jobsAPI.closeJob(id);

        // Optimistic update
        await mutate();

        toast.success('İlan kapatıldı', {
          description: 'Artık yeni teklif alınmayacak',
        });

        logger.info('Job closed successfully', { jobId: id });
        return closedJob;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error('Failed to close job', err);
        toast.error('İlan kapatılamadı', {
          description: err.message || 'Lütfen tekrar deneyin',
        });
        return null;
      } finally {
        setIsClosing(false);
      }
    },
    [mutate]
  );

  /**
   * Refresh jobs list
   */
  const refresh = useCallback(async () => {
    await mutate();
  }, [mutate]);

  // ==================== LOG ERRORS ====================

  useEffect(() => {
    if (error) {
      logger.error('Jobs fetch error', error);
    }
  }, [error]);

  // ==================== RETURN ====================

  return {
    // Data
    jobs: jobsData?.content || [],
    pagination: jobsData
      ? {
          page: jobsData.pageNumber,
          totalPages: jobsData.totalPages,
          totalElements: jobsData.totalElements,
          hasNext: jobsData.hasNext,
          hasPrevious: jobsData.hasPrevious,
        }
      : null,
    stats,

    // Loading States
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isPublishing,
    isClosing,

    // Error
    error: error || null,

    // Actions
    createJob,
    updateJob,
    deleteJob,
    publishJob,
    closeJob,
    refresh,
    setFilters,
  };
}
