/**
 * ================================================
 * USE JOBS HOOK
 * ================================================
 * Custom hook for job management
 * Provides CRUD operations with loading states and error handling
 *
 * Features:
 * - Create, update, delete jobs
 * - Fetch jobs with filters
 * - Publish, close, reopen jobs
 * - Optimistic updates
 * - Error handling with toast notifications
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 1: Job System
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import * as jobsApi from '@/lib/api/jobs';
import type { JobResponse } from '@/types/backend-aligned';
import type {
  CreateJobRequest,
  UpdateJobRequest,
  JobFilters,
} from '@/lib/api/jobs';
import { errorHandler } from '@/lib/api/error-handler';
import { logger } from '@/lib/infrastructure/monitoring/logger';

// ================================================
// TYPES
// ================================================

interface UseJobsReturn {
  // State
  jobs: JobResponse[] | null;
  currentJob: JobResponse | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  } | null;

  // Actions
  fetchJobs: (filters?: JobFilters) => Promise<void>;
  fetchMyJobs: (filters?: Omit<JobFilters, 'employerId'>) => Promise<void>;
  fetchJobById: (jobId: string) => Promise<void>;
  createJob: (data: CreateJobRequest) => Promise<JobResponse | null>;
  updateJob: (jobId: string, data: UpdateJobRequest) => Promise<boolean>;
  deleteJob: (jobId: string) => Promise<boolean>;
  publishJob: (jobId: string) => Promise<boolean>;
  closeJob: (jobId: string) => Promise<boolean>;
  reopenJob: (jobId: string) => Promise<boolean>;
  clearError: () => void;
  reset: () => void;
}

// ================================================
// HOOK
// ================================================

export function useJobs(): UseJobsReturn {
  // State
  const [jobs, setJobs] = useState<JobResponse[] | null>(null);
  const [currentJob, setCurrentJob] = useState<JobResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  } | null>(null);

  // ================================================
  // FETCH OPERATIONS
  // ================================================

  const fetchJobs = useCallback(async (filters?: JobFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      logger.info('Fetching jobs', { filters });

      const response = await jobsApi.getJobs(filters);

      setJobs(response.content);
      setPagination({
        page: response.page,
        size: response.size,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
      });

      logger.info('Jobs fetched successfully', {
        count: response.content.length,
        total: response.totalElements,
      });
    } catch (err) {
      const apiError = errorHandler.handle(err, { action: 'fetchJobs' });
      setError(apiError.getUserMessage());
      logger.error('Failed to fetch jobs', err as Error, { filters });
      toast.error('İş ilanları yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMyJobs = useCallback(
    async (filters?: Omit<JobFilters, 'employerId'>) => {
      setIsLoading(true);
      setError(null);

      try {
        logger.info('Fetching my jobs', { filters });

        const response = await jobsApi.getMyJobs(filters);

        setJobs(response.content);
        setPagination({
          page: response.page,
          size: response.size,
          totalElements: response.totalElements,
          totalPages: response.totalPages,
        });

        logger.info('My jobs fetched successfully', {
          count: response.content.length,
        });
      } catch (err) {
        const apiError = errorHandler.handle(err, { action: 'fetchMyJobs' });
        setError(apiError.getUserMessage());
        logger.error('Failed to fetch my jobs', err as Error);
        toast.error('İş ilanlarınız yüklenemedi');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchJobById = useCallback(async (jobId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      logger.info('Fetching job by ID', { jobId });

      const job = await jobsApi.getJobById(jobId);

      setCurrentJob(job);

      logger.info('Job fetched successfully', { jobId });
    } catch (err) {
      const apiError = errorHandler.handle(err, { action: 'fetchJobById' });
      setError(apiError.getUserMessage());
      logger.error('Failed to fetch job', err as Error, { jobId });
      toast.error('İş ilanı yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ================================================
  // CREATE OPERATION
  // ================================================

  const createJob = useCallback(
    async (data: CreateJobRequest): Promise<JobResponse | null> => {
      setIsCreating(true);
      setError(null);

      try {
        logger.info('Creating job', { title: data.title });

        const newJob = await jobsApi.createJob(data);

        logger.info('Job created successfully', { jobId: newJob.id });

        toast.success('İş ilanı oluşturuldu', {
          description: 'İş ilanınız başarıyla kaydedildi',
        });

        // Add to jobs list if available
        if (jobs) {
          setJobs([newJob, ...jobs]);
        }

        return newJob;
      } catch (err) {
        const apiError = errorHandler.handle(err, { action: 'createJob' });
        setError(apiError.getUserMessage());
        logger.error('Failed to create job', err as Error, {
          title: data.title,
        });
        toast.error('İş ilanı oluşturulamadı', {
          description: apiError.getUserMessage(),
        });
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [jobs]
  );

  // ================================================
  // UPDATE OPERATION
  // ================================================

  const updateJob = useCallback(
    async (jobId: string, data: UpdateJobRequest): Promise<boolean> => {
      setIsUpdating(true);
      setError(null);

      try {
        logger.info('Updating job', { jobId });

        const updatedJob = await jobsApi.updateJob(jobId, data);

        logger.info('Job updated successfully', { jobId });

        toast.success('İş ilanı güncellendi');

        // Update in list
        if (jobs) {
          setJobs(jobs.map((job) => (job.id === jobId ? updatedJob : job)));
        }

        // Update current job
        if (currentJob?.id === jobId) {
          setCurrentJob(updatedJob);
        }

        return true;
      } catch (err) {
        const apiError = errorHandler.handle(err, { action: 'updateJob' });
        setError(apiError.getUserMessage());
        logger.error('Failed to update job', err as Error, { jobId });
        toast.error('İş ilanı güncellenemedi', {
          description: apiError.getUserMessage(),
        });
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [jobs, currentJob]
  );

  // ================================================
  // DELETE OPERATION
  // ================================================

  const deleteJob = useCallback(
    async (jobId: string): Promise<boolean> => {
      setIsDeleting(true);
      setError(null);

      try {
        logger.info('Deleting job', { jobId });

        await jobsApi.deleteJob(jobId);

        logger.info('Job deleted successfully', { jobId });

        toast.success('İş ilanı silindi');

        // Remove from list
        if (jobs) {
          setJobs(jobs.filter((job) => job.id !== jobId));
        }

        // Clear current job if deleted
        if (currentJob?.id === jobId) {
          setCurrentJob(null);
        }

        return true;
      } catch (err) {
        const apiError = errorHandler.handle(err, { action: 'deleteJob' });
        setError(apiError.getUserMessage());
        logger.error('Failed to delete job', err as Error, { jobId });
        toast.error('İş ilanı silinemedi', {
          description: apiError.getUserMessage(),
        });
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [jobs, currentJob]
  );

  // ================================================
  // STATUS CHANGE OPERATIONS
  // ================================================

  const publishJob = useCallback(
    async (jobId: string): Promise<boolean> => {
      setIsUpdating(true);
      setError(null);

      try {
        logger.info('Publishing job', { jobId });

        const publishedJob = await jobsApi.publishJob(jobId);

        logger.info('Job published successfully', { jobId });

        toast.success('İş ilanı yayınlandı', {
          description: 'İş ilanınız artık görünür durumda',
        });

        // Update in list
        if (jobs) {
          setJobs(jobs.map((job) => (job.id === jobId ? publishedJob : job)));
        }

        // Update current job
        if (currentJob?.id === jobId) {
          setCurrentJob(publishedJob);
        }

        return true;
      } catch (err) {
        const apiError = errorHandler.handle(err, { action: 'publishJob' });
        setError(apiError.getUserMessage());
        logger.error('Failed to publish job', err as Error, { jobId });
        toast.error('İş ilanı yayınlanamadı', {
          description: apiError.getUserMessage(),
        });
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [jobs, currentJob]
  );

  const closeJob = useCallback(
    async (jobId: string): Promise<boolean> => {
      setIsUpdating(true);
      setError(null);

      try {
        logger.info('Closing job', { jobId });

        const closedJob = await jobsApi.closeJob(jobId);

        logger.info('Job closed successfully', { jobId });

        toast.success('İş ilanı kapatıldı');

        // Update in list
        if (jobs) {
          setJobs(jobs.map((job) => (job.id === jobId ? closedJob : job)));
        }

        // Update current job
        if (currentJob?.id === jobId) {
          setCurrentJob(closedJob);
        }

        return true;
      } catch (err) {
        const apiError = errorHandler.handle(err, { action: 'closeJob' });
        setError(apiError.getUserMessage());
        logger.error('Failed to close job', err as Error, { jobId });
        toast.error('İş ilanı kapatılamadı', {
          description: apiError.getUserMessage(),
        });
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [jobs, currentJob]
  );

  const reopenJob = useCallback(
    async (jobId: string): Promise<boolean> => {
      setIsUpdating(true);
      setError(null);

      try {
        logger.info('Reopening job', { jobId });

        const reopenedJob = await jobsApi.reopenJob(jobId);

        logger.info('Job reopened successfully', { jobId });

        toast.success('İş ilanı tekrar açıldı');

        // Update in list
        if (jobs) {
          setJobs(jobs.map((job) => (job.id === jobId ? reopenedJob : job)));
        }

        // Update current job
        if (currentJob?.id === jobId) {
          setCurrentJob(reopenedJob);
        }

        return true;
      } catch (err) {
        const apiError = errorHandler.handle(err, { action: 'reopenJob' });
        setError(apiError.getUserMessage());
        logger.error('Failed to reopen job', err as Error, { jobId });
        toast.error('İş ilanı açılamadı', {
          description: apiError.getUserMessage(),
        });
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [jobs, currentJob]
  );

  // ================================================
  // UTILITY ACTIONS
  // ================================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setJobs(null);
    setCurrentJob(null);
    setError(null);
    setPagination(null);
  }, []);

  // ================================================
  // RETURN
  // ================================================

  return {
    // State
    jobs,
    currentJob,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    pagination,

    // Actions
    fetchJobs,
    fetchMyJobs,
    fetchJobById,
    createJob,
    updateJob,
    deleteJob,
    publishJob,
    closeJob,
    reopenJob,
    clearError,
    reset,
  };
}

// ================================================
// EXPORT
// ================================================

export default useJobs;
