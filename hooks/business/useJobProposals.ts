'use client';

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/shared/utils/logger';

/**
 * Proposal summary for a specific job
 */
export interface JobProposalSummary {
  jobId: string;
  totalCount: number;
  unreadCount: number;
  pendingCount: number;
  acceptedCount: number;
  rejectedCount: number;
  hasNewProposals: boolean;
  lastProposalDate?: Date;
  averageProposedBudget?: number;
  lowestProposedBudget?: number;
  highestProposedBudget?: number;
}

/**
 * API response item structure
 */
interface ProposalSummaryApiItem {
  jobId: string;
  totalCount?: number;
  unreadCount?: number;
  pendingCount?: number;
  acceptedCount?: number;
  rejectedCount?: number;
  lastProposalDate?: string;
  averageProposedBudget?: number;
  lowestProposedBudget?: number;
  highestProposedBudget?: number;
}

/**
 * Map of job ID to proposal summary
 */
export type JobProposalMap = Record<string, JobProposalSummary>;

/**
 * Hook parameters
 */
export interface UseJobProposalsParams {
  /**
   * List of job IDs to fetch proposal data for
   * If not provided, will fetch for all user's jobs
   */
  jobIds?: string[];

  /**
   * Auto-fetch on mount
   * @default true
   */
  autoFetch?: boolean;

  /**
   * Enable polling for real-time updates
   * @default false
   */
  enablePolling?: boolean;

  /**
   * Polling interval in milliseconds
   * @default 60000 (1 minute)
   */
  pollingInterval?: number;
}

/**
 * Hook return value
 */
export interface UseJobProposalsReturn {
  /**
   * Map of job ID to proposal summary
   */
  proposalsByJob: JobProposalMap;

  /**
   * Check if a specific job has proposals
   */
  hasProposals: (jobId: string) => boolean;

  /**
   * Get proposal summary for a specific job
   */
  getProposalSummary: (jobId: string) => JobProposalSummary | undefined;

  /**
   * Get total unread proposal count across all jobs
   */
  getTotalUnreadCount: () => number;

  /**
   * Get jobs with new/unread proposals
   */
  getJobsWithNewProposals: () => string[];

  /**
   * Loading state
   */
  loading: boolean;

  /**
   * Error message if fetch failed
   */
  error: string | null;

  /**
   * Manually fetch proposal data
   */
  fetchProposalData: () => Promise<void>;

  /**
   * Clear error state
   */
  clearError: () => void;
}

/**
 * Hook for managing proposal data for employer's jobs
 * Provides summary statistics and quick access to proposal counts
 *
 * @example
 * ```tsx
 * const {
 *   proposalsByJob,
 *   hasProposals,
 *   getProposalSummary,
 *   getTotalUnreadCount,
 *   loading
 * } = useJobProposals({
 *   jobIds: ['job-1', 'job-2'],
 *   enablePolling: true
 * });
 *
 * // Check if job has proposals
 * if (hasProposals('job-1')) {
 *   const summary = getProposalSummary('job-1');
 *   logger.debug(`${summary.unreadCount} new proposals`);
 * }
 *
 * // Get total unread across all jobs
 * const total = getTotalUnreadCount();
 * ```
 */
export function useJobProposals({
  jobIds,
  autoFetch = true,
  enablePolling = false,
  pollingInterval = 60000,
}: UseJobProposalsParams = {}): UseJobProposalsReturn {
  const [proposalsByJob, setProposalsByJob] = useState<JobProposalMap>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch proposal summary data for jobs
   */
  const fetchProposalData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      if (jobIds && jobIds.length > 0) {
        params.append('jobIds', jobIds.join(','));
      }

      const response = await fetch(
        `/api/v1/jobs/proposals/summary?${params.toString()}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch proposal data: ${response.statusText}`
        );
      }

      const data = await response.json();

      // Transform API response to JobProposalMap
      const proposalMap: JobProposalMap = {};

      if (data.data && Array.isArray(data.data)) {
        data.data.forEach((item: ProposalSummaryApiItem) => {
          proposalMap[item.jobId] = {
            jobId: item.jobId,
            totalCount: item.totalCount || 0,
            unreadCount: item.unreadCount || 0,
            pendingCount: item.pendingCount || 0,
            acceptedCount: item.acceptedCount || 0,
            rejectedCount: item.rejectedCount || 0,
            hasNewProposals: (item.unreadCount || 0) > 0,
            lastProposalDate: item.lastProposalDate
              ? new Date(item.lastProposalDate)
              : undefined,
            averageProposedBudget: item.averageProposedBudget,
            lowestProposedBudget: item.lowestProposedBudget,
            highestProposedBudget: item.highestProposedBudget,
          };
        });
      }

      setProposalsByJob(proposalMap);
      logger.info('Job proposal data fetched successfully', {
        count: Object.keys(proposalMap).length,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch proposal data';
      setError(errorMessage);
      logger.error('Failed to fetch job proposal data', { error: err });
    } finally {
      setLoading(false);
    }
  }, [jobIds]);

  /**
   * Check if a specific job has proposals
   */
  const hasProposals = useCallback(
    (jobId: string): boolean => {
      return proposalsByJob[jobId]?.totalCount > 0;
    },
    [proposalsByJob]
  );

  /**
   * Get proposal summary for a specific job
   */
  const getProposalSummary = useCallback(
    (jobId: string): JobProposalSummary | undefined => {
      return proposalsByJob[jobId];
    },
    [proposalsByJob]
  );

  /**
   * Get total unread proposal count across all jobs
   */
  const getTotalUnreadCount = useCallback((): number => {
    return Object.values(proposalsByJob).reduce(
      (sum, summary) => sum + summary.unreadCount,
      0
    );
  }, [proposalsByJob]);

  /**
   * Get jobs with new/unread proposals
   */
  const getJobsWithNewProposals = useCallback((): string[] => {
    return Object.keys(proposalsByJob).filter(
      (jobId) => proposalsByJob[jobId].hasNewProposals
    );
  }, [proposalsByJob]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchProposalData();
    }
  }, [autoFetch, fetchProposalData]);

  // Setup polling if enabled
  useEffect(() => {
    if (!enablePolling || pollingInterval <= 0) {
      return;
    }

    const intervalId = setInterval(() => {
      fetchProposalData();
    }, pollingInterval);

    logger.info('Job proposal polling enabled', { interval: pollingInterval });

    return () => {
      clearInterval(intervalId);
      logger.info('Job proposal polling disabled');
    };
  }, [enablePolling, pollingInterval, fetchProposalData]);

  return {
    proposalsByJob,
    hasProposals,
    getProposalSummary,
    getTotalUnreadCount,
    getJobsWithNewProposals,
    loading,
    error,
    fetchProposalData,
    clearError,
  };
}
