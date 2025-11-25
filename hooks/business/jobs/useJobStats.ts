'use client';

/**
 * ================================================
 * USE JOB STATS HOOK
 * ================================================
 * Job statistics and analytics hook
 *
 * Sprint 2 - Story 4: Jobs Hooks Expansion
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 25, 2025
 */

import { useMemo } from 'react';
import useSWR from 'swr';
import type { JobResponse } from '@/types/backend-aligned';
import * as jobsAPI from '@/lib/api/jobs';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// TYPES
// ================================================

export interface JobStats {
  // Counts
  total: number;
  active: number;
  draft: number;
  closed: number;
  pending: number;

  // Metrics
  totalBudget: number;
  averageBudget: number;
  totalProposals: number;
  averageProposals: number;

  // Engagement
  totalViews: number;
  averageViews: number;
  conversionRate: number; // proposals / views

  // Time metrics
  averageTimeToFirstProposal: number; // hours
  averageTimeToClose: number; // days
}

export interface UseJobStatsReturn {
  // Stats
  stats: JobStats | null;

  // Loading state
  isLoading: boolean;
  error: Error | null;

  // Actions
  refresh: () => Promise<void>;

  // Computed stats
  getStatusDistribution: () => Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  getBudgetDistribution: () => { fixed: number; hourly: number };
  getTopPerformingJobs: (limit?: number) => JobResponse[];
}

// ================================================
// HOOK
// ================================================

export function useJobStats(jobs?: JobResponse[]): UseJobStatsReturn {
  // Fetch jobs if not provided
  const {
    data: fetchedJobsData,
    error,
    mutate,
  } = useSWR(jobs ? null : 'my-jobs-stats', async () => {
    const response = await jobsAPI.getMyJobs({});
    return response;
  });

  const activeJobs = useMemo(
    () => jobs || fetchedJobsData?.content || [],
    [jobs, fetchedJobsData]
  );
  const isLoading = !jobs && !fetchedJobsData && !error;

  /**
   * Calculate comprehensive stats
   */
  const stats = useMemo((): JobStats | null => {
    if (activeJobs.length === 0) return null;

    const total = activeJobs.length;
    const active = activeJobs.filter((j) => j.status === 'OPEN').length;
    const draft = activeJobs.filter((j) => j.status === 'DRAFT').length;
    const closed = activeJobs.filter((j) => j.status === 'CLOSED').length;
    const pending = activeJobs.filter((j) => j.status === 'IN_PROGRESS').length;

    // Budget calculations
    const budgets = activeJobs
      .filter((j) => j.budgetMin)
      .map((j) => j.budgetMin || 0);
    const totalBudget = budgets.reduce((sum, b) => sum + b, 0);
    const averageBudget = budgets.length > 0 ? totalBudget / budgets.length : 0;

    // Proposal calculations
    const totalProposals = activeJobs.reduce(
      (sum, j) => sum + (j.proposalCount || 0),
      0
    );
    const averageProposals = total > 0 ? totalProposals / total : 0;

    // View calculations
    const totalViews = activeJobs.reduce(
      (sum, j) => sum + (j.viewCount || 0),
      0
    );
    const averageViews = total > 0 ? totalViews / total : 0;

    // Conversion rate
    const conversionRate =
      totalViews > 0 ? (totalProposals / totalViews) * 100 : 0;

    // Time metrics (mock for now - would need timestamps from backend)
    const averageTimeToFirstProposal = 24; // hours
    const averageTimeToClose = 7; // days

    return {
      total,
      active,
      draft,
      closed,
      pending,
      totalBudget,
      averageBudget,
      totalProposals,
      averageProposals,
      totalViews,
      averageViews,
      conversionRate,
      averageTimeToFirstProposal,
      averageTimeToClose,
    };
  }, [activeJobs]);

  /**
   * Get status distribution
   */
  const getStatusDistribution = useMemo(() => {
    return () => {
      if (!stats) return [];

      const total = stats.total;
      return [
        {
          status: 'ACTIVE',
          count: stats.active,
          percentage: total > 0 ? (stats.active / total) * 100 : 0,
        },
        {
          status: 'DRAFT',
          count: stats.draft,
          percentage: total > 0 ? (stats.draft / total) * 100 : 0,
        },
        {
          status: 'CLOSED',
          count: stats.closed,
          percentage: total > 0 ? (stats.closed / total) * 100 : 0,
        },
        {
          status: 'PENDING',
          count: stats.pending,
          percentage: total > 0 ? (stats.pending / total) * 100 : 0,
        },
      ];
    };
  }, [stats]);

  /**
   * Get budget type distribution
   */
  const getBudgetDistribution = useMemo(() => {
    return () => {
      const fixed = activeJobs.filter((j) => j.budgetType === 'FIXED').length;
      const hourly = activeJobs.filter((j) => j.budgetType === 'HOURLY').length;
      return { fixed, hourly };
    };
  }, [activeJobs]);

  /**
   * Get top performing jobs (by proposal count)
   */
  const getTopPerformingJobs = useMemo(() => {
    return (limit = 5) => {
      return [...activeJobs]
        .sort((a, b) => (b.proposalCount || 0) - (a.proposalCount || 0))
        .slice(0, limit);
    };
  }, [activeJobs]);

  /**
   * Refresh stats
   */
  const refresh = async () => {
    if (mutate) {
      await mutate();
      logger.debug('Job stats refreshed');
    }
  };

  return {
    stats,
    isLoading,
    error: error || null,
    refresh,
    getStatusDistribution,
    getBudgetDistribution,
    getTopPerformingJobs,
  };
}
