/**
 * ================================================
 * USE REFUND ANALYTICS HOOK
 * ================================================
 * Hook for fetching refund analytics and statistics
 *
 * Features:
 * - Overall refund statistics
 * - Date range filtering
 * - Status breakdown
 * - Approval rate tracking
 * - Processing time metrics
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 3 - Task 3.4
 */

import { useState, useEffect, useCallback } from 'react';
import {
  RefundStatisticsDto,
  getRefundStatistics,
} from '@/lib/api/admin/refund-admin-api';
import { toast } from 'sonner';

export type RefundPeriod = 'today' | 'week' | 'month' | 'custom';

interface UseRefundAnalyticsOptions {
  period?: RefundPeriod;
  customStartDate?: string;
  customEndDate?: string;
  autoLoad?: boolean;
}

interface UseRefundAnalyticsReturn {
  data: RefundStatisticsDto | null;
  isLoading: boolean;
  error: string | null;
  currentPeriod: RefundPeriod;
  refresh: () => Promise<void>;
  loadPeriod: (
    period: RefundPeriod,
    startDate?: string,
    endDate?: string
  ) => Promise<void>;
}

/**
 * Hook for refund analytics
 */
export function useRefundAnalytics(
  options: UseRefundAnalyticsOptions = {}
): UseRefundAnalyticsReturn {
  const {
    period = 'today',
    customStartDate,
    customEndDate,
    autoLoad = true,
  } = options;

  const [data, setData] = useState<RefundStatisticsDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPeriod, setCurrentPeriod] = useState<RefundPeriod>(period);
  const [dateRange, setDateRange] = useState<{
    startDate?: string;
    endDate?: string;
  }>({
    startDate: customStartDate,
    endDate: customEndDate,
  });

  /**
   * Calculate date range based on period
   */
  const getDateRange = useCallback(
    (periodType: RefundPeriod) => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      switch (periodType) {
        case 'today': {
          const startDate = today.toISOString();
          const endDate = new Date(
            today.getTime() + 24 * 60 * 60 * 1000
          ).toISOString();
          return { startDate, endDate };
        }

        case 'week': {
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          return {
            startDate: weekAgo.toISOString(),
            endDate: now.toISOString(),
          };
        }

        case 'month': {
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          return {
            startDate: monthAgo.toISOString(),
            endDate: now.toISOString(),
          };
        }

        case 'custom':
          return {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          };

        default:
          return {};
      }
    },
    [dateRange]
  );

  /**
   * Fetch refund analytics
   */
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { startDate, endDate } = getDateRange(currentPeriod);

      const statistics = await getRefundStatistics(startDate, endDate);

      setData(statistics);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'İstatistikler yüklenemedi';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentPeriod, getDateRange]);

  /**
   * Refresh current data
   */
  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  /**
   * Load specific period
   */
  const loadPeriod = useCallback(
    async (newPeriod: RefundPeriod, startDate?: string, endDate?: string) => {
      setCurrentPeriod(newPeriod);
      if (newPeriod === 'custom') {
        setDateRange({ startDate, endDate });
      }
    },
    []
  );

  /**
   * Auto-load on mount and when period changes
   */
  useEffect(() => {
    if (autoLoad) {
      fetchData();
    }
  }, [autoLoad, fetchData]);

  return {
    data,
    isLoading,
    error,
    currentPeriod,
    refresh,
    loadPeriod,
  };
}
