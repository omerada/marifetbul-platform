/**
 * ================================================
 * USE SEARCH ANALYTICS HOOK
 * ================================================
 * Custom hook for managing search analytics state and operations
 *
 * Sprint 1: Search Analytics Implementation
 *
 * Features:
 * - Fetch search metrics for specified time periods
 * - Get top search queries and zero-result queries
 * - Real-time metrics refresh
 * - Error handling and loading states
 * - Caching with SWR
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-10-29
 */

import { useState, useCallback, useMemo } from 'react';
import useSWR from 'swr';
import {
  getSearchMetrics,
  getTopQueries,
  getZeroResultQueries,
  getConversionRate,
  getClickThroughRate,
  getQuerySuggestions,
  type SearchMetrics,
  type TopQueries,
} from '@/lib/api/search-analytics';

// ================================================
// TYPES
// ================================================

export interface UseSearchAnalyticsOptions {
  /**
   * Number of days to look back
   * @default 30
   */
  days?: number;

  /**
   * Number of top queries to fetch
   * @default 10
   */
  topQueriesLimit?: number;

  /**
   * Auto-refresh interval in milliseconds
   * Set to 0 to disable auto-refresh
   * @default 0
   */
  refreshInterval?: number;

  /**
   * Enable real-time updates
   * @default false
   */
  enableRealtime?: boolean;
}

export interface SearchAnalyticsState {
  metrics: SearchMetrics | null;
  topQueries: TopQueries | null;
  zeroResultQueries: TopQueries | null;
  conversionRate: number | null;
  clickThroughRate: number | null;
  isLoading: boolean;
  isValidating: boolean;
  error: Error | null;
}

export interface FormattedMetrics {
  totalSearches: string;
  uniqueUsers: string;
  zeroResultRate: string;
  clickThroughRate: string;
  conversionRate: string;
  averageResults: string;
}

// ================================================
// HOOK
// ================================================

/**
 * useSearchAnalytics Hook
 *
 * Provides comprehensive search analytics data with automatic
 * caching, refresh, and error handling
 *
 * @param options - Configuration options
 * @returns Search analytics state and operations
 *
 * @example
 * ```tsx
 * const { metrics, topQueries, isLoading, refresh } = useSearchAnalytics({
 *   days: 30,
 *   refreshInterval: 300000, // 5 minutes
 * });
 *
 * if (isLoading) return <LoadingSpinner />;
 *
 * return (
 *   <div>
 *     <p>Total Searches: {metrics?.totalSearches}</p>
 *     <button onClick={refresh}>Refresh</button>
 *   </div>
 * );
 * ```
 */
export function useSearchAnalytics(
  options: UseSearchAnalyticsOptions = {}
): SearchAnalyticsState & {
  refresh: () => Promise<void>;
  getDateRange: () => { startDate: string; endDate: string };
  formatMetrics: () => FormattedMetrics | null;
  getSuggestions: (prefix: string) => Promise<string[]>;
} {
  const {
    days = 30,
    topQueriesLimit = 10,
    refreshInterval = 0,
    enableRealtime = false,
  } = options;

  const [customError, setCustomError] = useState<Error | null>(null);

  // ================================================
  // DATE RANGE CALCULATION
  // ================================================

  const getDateRange = useCallback(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  }, [days]);

  // ================================================
  // SWR DATA FETCHING
  // ================================================

  // Fetch search metrics
  const {
    data: metrics,
    error: metricsError,
    isValidating: metricsValidating,
    mutate: mutateMetrics,
  } = useSWR<SearchMetrics>(
    ['search-analytics-metrics', days],
    async () => {
      const { startDate, endDate } = getDateRange();
      return getSearchMetrics(startDate, endDate);
    },
    {
      refreshInterval: enableRealtime ? refreshInterval : 0,
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  // Fetch top queries
  const {
    data: topQueries,
    error: topQueriesError,
    isValidating: topQueriesValidating,
    mutate: mutateTopQueries,
  } = useSWR<TopQueries>(
    ['search-analytics-top-queries', days, topQueriesLimit],
    async () => {
      return getTopQueries(topQueriesLimit, days);
    },
    {
      refreshInterval: enableRealtime ? refreshInterval : 0,
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  // Fetch zero-result queries
  const {
    data: zeroResultQueries,
    error: zeroResultQueriesError,
    isValidating: zeroResultQueriesValidating,
    mutate: mutateZeroResultQueries,
  } = useSWR<TopQueries>(
    ['search-analytics-zero-result-queries', days, topQueriesLimit],
    async () => {
      return getZeroResultQueries(topQueriesLimit, days);
    },
    {
      refreshInterval: enableRealtime ? refreshInterval : 0,
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  // Fetch conversion rate
  const {
    data: conversionRate,
    error: conversionRateError,
    isValidating: conversionRateValidating,
    mutate: mutateConversionRate,
  } = useSWR<number>(
    ['search-analytics-conversion-rate', days],
    async () => {
      return getConversionRate(days);
    },
    {
      refreshInterval: enableRealtime ? refreshInterval : 0,
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  // Fetch click-through rate
  const {
    data: clickThroughRate,
    error: clickThroughRateError,
    isValidating: clickThroughRateValidating,
    mutate: mutateClickThroughRate,
  } = useSWR<number>(
    ['search-analytics-click-through-rate', days],
    async () => {
      return getClickThroughRate(days);
    },
    {
      refreshInterval: enableRealtime ? refreshInterval : 0,
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  // ================================================
  // LOADING & ERROR STATES
  // ================================================

  const isLoading =
    !metrics && !metricsError && !topQueries && !topQueriesError;

  const isValidating =
    metricsValidating ||
    topQueriesValidating ||
    zeroResultQueriesValidating ||
    conversionRateValidating ||
    clickThroughRateValidating;

  const error =
    customError ||
    metricsError ||
    topQueriesError ||
    zeroResultQueriesError ||
    conversionRateError ||
    clickThroughRateError;

  // ================================================
  // REFRESH FUNCTION
  // ================================================

  const refresh = useCallback(async () => {
    setCustomError(null);
    try {
      await Promise.all([
        mutateMetrics(),
        mutateTopQueries(),
        mutateZeroResultQueries(),
        mutateConversionRate(),
        mutateClickThroughRate(),
      ]);
    } catch (err) {
      setCustomError(
        err instanceof Error ? err : new Error('Failed to refresh analytics')
      );
    }
  }, [
    mutateMetrics,
    mutateTopQueries,
    mutateZeroResultQueries,
    mutateConversionRate,
    mutateClickThroughRate,
  ]);

  // ================================================
  // FORMATTED METRICS
  // ================================================

  const formatMetrics = useCallback((): FormattedMetrics | null => {
    if (!metrics) return null;

    const zeroResultRate =
      metrics.totalSearches > 0
        ? (metrics.zeroResultSearches / metrics.totalSearches) * 100
        : 0;

    return {
      totalSearches: new Intl.NumberFormat('tr-TR').format(
        metrics.totalSearches
      ),
      uniqueUsers: new Intl.NumberFormat('tr-TR').format(metrics.uniqueUsers),
      zeroResultRate: `${zeroResultRate.toFixed(2)}%`,
      clickThroughRate: `${metrics.clickThroughRate.toFixed(2)}%`,
      conversionRate: `${metrics.conversionRate.toFixed(2)}%`,
      averageResults: metrics.averageResults.toFixed(1),
    };
  }, [metrics]);

  // ================================================
  // QUERY SUGGESTIONS
  // ================================================

  const getSuggestions = useCallback(
    async (prefix: string): Promise<string[]> => {
      try {
        return await getQuerySuggestions(prefix, 5);
      } catch (err) {
        console.error('Failed to get query suggestions:', err);
        return [];
      }
    },
    []
  );

  // ================================================
  // RETURN STATE
  // ================================================

  return useMemo(
    () => ({
      metrics: metrics || null,
      topQueries: topQueries || null,
      zeroResultQueries: zeroResultQueries || null,
      conversionRate: conversionRate !== undefined ? conversionRate : null,
      clickThroughRate:
        clickThroughRate !== undefined ? clickThroughRate : null,
      isLoading,
      isValidating,
      error,
      refresh,
      getDateRange,
      formatMetrics,
      getSuggestions,
    }),
    [
      metrics,
      topQueries,
      zeroResultQueries,
      conversionRate,
      clickThroughRate,
      isLoading,
      isValidating,
      error,
      refresh,
      getDateRange,
      formatMetrics,
      getSuggestions,
    ]
  );
}

// ================================================
// EXPORTS
// ================================================

export default useSearchAnalytics;
