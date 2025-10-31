/**
 * ================================================
 * USE REVENUE COMPARISON HOOK
 * ================================================
 * Hook for comparing revenue between different periods
 *
 * Features:
 * - Day over day comparison
 * - Week over week comparison
 * - Month over month comparison
 * - Custom period comparison
 * - Performance indicators
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 3 - Task 3.3
 */

import { useState, useEffect, useCallback } from 'react';
import {
  RevenueComparisonDto,
  getTodayVsYesterdayComparison,
  getThisWeekVsLastWeekComparison,
  getThisMonthVsLastMonthComparison,
  compareRevenuePeriods,
} from '@/lib/api/admin-analytics';
import { toast } from 'sonner';

export type ComparisonType = 'day' | 'week' | 'month' | 'custom';

interface UseRevenueComparisonOptions {
  comparisonType?: ComparisonType;
  currentStart?: string;
  currentEnd?: string;
  previousStart?: string;
  previousEnd?: string;
  autoLoad?: boolean;
}

interface UseRevenueComparisonReturn {
  data: RevenueComparisonDto | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  loadComparison: (
    type: ComparisonType,
    currentStart?: string,
    currentEnd?: string,
    previousStart?: string,
    previousEnd?: string
  ) => Promise<void>;
}

/**
 * Custom hook for revenue comparison
 */
export function useRevenueComparison(
  options: UseRevenueComparisonOptions = {}
): UseRevenueComparisonReturn {
  const {
    comparisonType = 'day',
    currentStart,
    currentEnd,
    previousStart,
    previousEnd,
    autoLoad = true,
  } = options;

  const [data, setData] = useState<RevenueComparisonDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentType, setCurrentType] =
    useState<ComparisonType>(comparisonType);
  const [dateRanges, setDateRanges] = useState({
    currentStart,
    currentEnd,
    previousStart,
    previousEnd,
  });

  /**
   * Fetch comparison data
   */
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let result: RevenueComparisonDto;

      switch (currentType) {
        case 'day':
          result = await getTodayVsYesterdayComparison();
          break;
        case 'week':
          result = await getThisWeekVsLastWeekComparison();
          break;
        case 'month':
          result = await getThisMonthVsLastMonthComparison();
          break;
        case 'custom':
          if (
            !dateRanges.currentStart ||
            !dateRanges.currentEnd ||
            !dateRanges.previousStart ||
            !dateRanges.previousEnd
          ) {
            throw new Error(
              'Özel karşılaştırma için tüm tarih aralıkları gereklidir'
            );
          }
          result = await compareRevenuePeriods(
            dateRanges.currentStart,
            dateRanges.currentEnd,
            dateRanges.previousStart,
            dateRanges.previousEnd
          );
          break;
        default:
          result = await getTodayVsYesterdayComparison();
      }

      setData(result);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Karşılaştırma verileri yüklenirken hata oluştu';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [currentType, dateRanges]);

  /**
   * Load specific comparison
   */
  const loadComparison = useCallback(
    async (
      type: ComparisonType,
      newCurrentStart?: string,
      newCurrentEnd?: string,
      newPreviousStart?: string,
      newPreviousEnd?: string
    ) => {
      setCurrentType(type);
      if (type === 'custom') {
        setDateRanges({
          currentStart: newCurrentStart,
          currentEnd: newCurrentEnd,
          previousStart: newPreviousStart,
          previousEnd: newPreviousEnd,
        });
      }
    },
    []
  );

  /**
   * Refresh current data
   */
  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Auto-load on mount or when dependencies change
  useEffect(() => {
    if (autoLoad) {
      fetchData();
    }
  }, [autoLoad, fetchData]);

  return {
    data,
    isLoading,
    error,
    refresh,
    loadComparison,
  };
}
