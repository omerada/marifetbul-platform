'use client';

/**
 * ================================================
 * USE JOB PUBLISH HOOK
 * ================================================
 * Workflow management for job publishing
 *
 * Sprint 2 - Story 4: Jobs Hooks Expansion
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 25, 2025
 */

import { useState, useCallback } from 'react';
import {
  publishJob as publishJobAPI,
  closeJob as closeJobAPI,
} from '@/lib/api/jobs';
import type { JobResponse } from '@/types/backend-aligned';
import logger from '@/lib/infrastructure/monitoring/logger';
import { toast } from 'sonner';

// ================================================
// TYPES
// ================================================

export interface UseJobPublishReturn {
  // State
  isPublishing: boolean;
  isClosing: boolean;
  error: Error | null;

  // Actions
  publish: (jobId: string) => Promise<JobResponse | null>;
  close: (jobId: string) => Promise<JobResponse | null>;
  clearError: () => void;

  // Validation
  canPublish: (job: JobResponse) => boolean;
  canClose: (job: JobResponse) => boolean;
  getPublishBlockers: (job: JobResponse) => string[];
}

// ================================================
// HOOK
// ================================================

export function useJobPublish(): UseJobPublishReturn {
  const [isPublishing, setIsPublishing] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Publish a draft job
   */
  const publish = useCallback(
    async (jobId: string): Promise<JobResponse | null> => {
      try {
        setIsPublishing(true);
        setError(null);

        logger.info('Publishing job', { jobId });
        const result = await publishJobAPI(jobId);

        toast.success('İş ilanı başarıyla yayınlandı!');
        logger.info('Job published successfully', { jobId });

        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);

        toast.error('İş ilanı yayınlanamadı', {
          description: error.message,
        });

        logger.error('Job publish failed', error instanceof Error ? error : new Error(String(error)), { jobId });
        return null;
      } finally {
        setIsPublishing(false);
      }
    },
    []
  );

  /**
   * Close an active job
   */
  const close = useCallback(
    async (jobId: string): Promise<JobResponse | null> => {
      try {
        setIsClosing(true);
        setError(null);

        logger.info('Closing job', { jobId });
        const result = await closeJobAPI(jobId);

        toast.success('İş ilanı kapatıldı');
        logger.info('Job closed successfully', { jobId });

        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);

        toast.error('İş ilanı kapatılamadı', {
          description: error.message,
        });

        logger.error('Job close failed', error instanceof Error ? error : new Error(String(error)), { jobId });
        return null;
      } finally {
        setIsClosing(false);
      }
    },
    []
  );

  /**
   * Check if job can be published
   */
  const canPublish = useCallback((job: JobResponse): boolean => {
    return job.status === 'DRAFT';
  }, []);

  /**
   * Check if job can be closed
   */
  const canClose = useCallback((job: JobResponse): boolean => {
    return job.status === 'OPEN' || job.status === 'IN_PROGRESS';
  }, []);

  /**
   * Get list of reasons why job cannot be published
   */
  const getPublishBlockers = useCallback((job: JobResponse): string[] => {
    const blockers: string[] = [];

    if (!job.title || job.title.length < 10) {
      blockers.push('Başlık en az 10 karakter olmalıdır');
    }

    if (!job.description || job.description.length < 50) {
      blockers.push('Açıklama en az 50 karakter olmalıdır');
    }

    if (!job.category) {
      blockers.push('Kategori seçilmelidir');
    }

    if (job.budgetType === 'FIXED' && (!job.budgetMin || job.budgetMin <= 0)) {
      blockers.push('Bütçe belirtilmelidir');
    }

    if (
      job.budgetType === 'HOURLY' &&
      (!job.hourlyRate || job.hourlyRate <= 0)
    ) {
      blockers.push('Saatlik ücret belirtilmelidir');
    }

    if (!job.requiredSkills || job.requiredSkills.length === 0) {
      blockers.push('En az 1 beceri eklenmeli dir');
    }

    if (job.status !== 'DRAFT') {
      blockers.push('Sadece taslak ilanlar yayınlanabilir');
    }

    return blockers;
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isPublishing,
    isClosing,
    error,

    // Actions
    publish,
    close,
    clearError,

    // Validation
    canPublish,
    canClose,
    getPublishBlockers,
  };
}
