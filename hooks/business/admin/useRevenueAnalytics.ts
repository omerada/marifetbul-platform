/**
 * ================================================
 * USE REVENUE ANALYTICS HOOK
 * ================================================
 * Hook for fetching and managing revenue analytics data
 *
 * Features:
 * - Revenue breakdown by period
 * - Payment method distribution
 * - Growth metrics
 * - Refund analytics
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 3 - Task 3.1
 */

import { useState, useEffect, useCallback } from 'react';
import {
  RevenueBreakdownDto,
  getRevenueBreakdown,
  getTodaysRevenueBreakdown,
  getThisWeekRevenueBreakdown,
  getThisMonthRevenueBreakdown,
} from '@/lib/api/admin-analytics';
import { toast } from 'sonner';

export type PeriodType = 'today' | 'week' | 'month' | 'custom';

interface UseRevenueAnalyticsOptions {
  period?: PeriodType;
  startDate?: string;
  endDate?: string;
  autoLoad?: boolean;
}

interface UseRevenueAnalyticsReturn {
  data: RevenueBreakdownDto | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  loadPeriod: (
    period: PeriodType,
    startDate?: string,
    endDate?: string
  ) => Promise<void>;
}

/**
 * Custom hook for revenue analytics
 */
export function useRevenueAnalytics(
  options: UseRevenueAnalyticsOptions = {}
): UseRevenueAnalyticsReturn {
  const { period = 'today', startDate, endDate, autoLoad = true } = options;

  const [data, setData] = useState<RevenueBreakdownDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPeriod, setCurrentPeriod] = useState<PeriodType>(period);
  const [dateRange, setDateRange] = useState({ startDate, endDate });

  /**
   * Fetch revenue data based on period
   */
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let result: RevenueBreakdownDto;

      switch (currentPeriod) {
        case 'today':
          result = await getTodaysRevenueBreakdown();
          break;
        case 'week':
          result = await getThisWeekRevenueBreakdown();
          break;
        case 'month':
          result = await getThisMonthRevenueBreakdown();
          break;
        case 'custom':
          if (!dateRange.startDate || !dateRange.endDate) {
            throw new Error(
              'Özel tarih aralığı için başlangıç ve bitiş tarihleri gereklidir'
            );
          }
          result = await getRevenueBreakdown(
            dateRange.startDate,
            dateRange.endDate
          );
          break;
        default:
          result = await getTodaysRevenueBreakdown();
      }

      setData(result);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Gelir verileri yüklenirken hata oluştu';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [currentPeriod, dateRange]);

  /**
   * Load data for specific period
   */
  const loadPeriod = useCallback(
    async (
      newPeriod: PeriodType,
      newStartDate?: string,
      newEndDate?: string
    ) => {
      setCurrentPeriod(newPeriod);
      if (newPeriod === 'custom') {
        setDateRange({ startDate: newStartDate, endDate: newEndDate });
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
    loadPeriod,
  };
}
