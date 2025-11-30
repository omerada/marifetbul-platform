/**
 * useJob Hook - Fetch and manage single job
 * Provides job data with loading and error states
 */

import { useState, useEffect, useCallback } from 'react';
import { getJobById } from '@/lib/api/jobs';
import type { JobResponse } from '@/types/backend-aligned';
import logger from '@/lib/infrastructure/monitoring/logger';

export interface UseJobReturn {
  data: JobResponse | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useJob(jobId: string | undefined): UseJobReturn {
  const [data, setData] = useState<JobResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchJob = useCallback(async () => {
    if (!jobId) {
      setData(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getJobById(jobId);
      setData(response);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      logger.error('Failed to fetch job', error, { jobId });
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchJob,
  };
}
