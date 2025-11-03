/**
 * ================================================
 * USE MODERATOR PERFORMANCE HOOK
 * ================================================
 * Hook for fetching moderator performance metrics and analytics
 *
 * Features:
 * - Overall performance metrics
 * - Resolution time trends
 * - Accuracy rate trends
 * - Category breakdown
 * - Comparative metrics
 *
 * Sprint 2 - Story 2.2: Performance Analytics
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 3, 2025
 */

import { useCallback } from 'react';
import useSWR from 'swr';
import { logger } from '@/lib/shared/utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface OverallMetrics {
  totalActions: number;
  averageResolutionTimeMinutes: number;
  accuracyRate: number;
  actionsLast7Days: number;
  actionsLast30Days: number;
  averageDailyActions: number;
}

export interface DailyMetric {
  date: string; // ISO date string
  value: number;
  count: number;
}

export interface CategoryMetric {
  totalActions: number;
  averageResolutionTime: number;
  accuracyRate: number;
  actionsLast7Days: number;
  percentageOfTotal: number;
}

export interface CategoryBreakdown {
  comments: CategoryMetric;
  reviews: CategoryMetric;
  reports: CategoryMetric;
  tickets: CategoryMetric;
}

export interface ComparativeMetrics {
  rank: number;
  totalModerators: number;
  percentile: number;
  resolutionTimeVsAverage: number; // percentage difference
  accuracyRateVsAverage: number; // percentage difference
  actionsPerDayVsAverage: number; // percentage difference
}

export interface PerformanceMetrics {
  overall: OverallMetrics;
  resolutionTimeTrend: DailyMetric[];
  accuracyTrend: DailyMetric[];
  categoryBreakdown: CategoryBreakdown;
  comparison: ComparativeMetrics;
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export interface UseModeratorPerformanceOptions {
  autoFetch?: boolean;
  refreshInterval?: number; // in milliseconds
  days?: number; // number of days to analyze (default: 30)
}

export interface UseModeratorPerformanceReturn {
  metrics: PerformanceMetrics | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

export function useModeratorPerformance(
  options: UseModeratorPerformanceOptions = {}
): UseModeratorPerformanceReturn {
  const {
    autoFetch = true,
    refreshInterval = 60000, // 60 seconds default (less frequent than dashboard)
    days = 30,
  } = options;

  // Fetch performance metrics
  const { data, error, isLoading, mutate } = useSWR<{
    data: PerformanceMetrics;
  }>(
    autoFetch ? ['/api/v1/moderator/performance', days] : null,
    async ([url, d]: [string, number]) => {
      const params = new URLSearchParams({ days: d.toString() });
      const response = await fetch(`${url}?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch performance metrics');
      }

      return response.json();
    },
    {
      refreshInterval,
      revalidateOnFocus: false, // Don't refetch on tab focus for performance data
      revalidateOnReconnect: true,
    }
  );

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const refresh = useCallback(() => {
    mutate();
    logger.info('Performance metrics refreshed');
  }, [mutate]);

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  if (error) {
    logger.error('Performance metrics error:', error);
  }

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    metrics: data?.data ?? null,
    isLoading,
    error: error ?? null,
    refresh,
  };
}
