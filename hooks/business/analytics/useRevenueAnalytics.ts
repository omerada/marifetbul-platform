import { useState, useEffect, useCallback } from 'react';
import logger from '@/lib/infrastructure/monitoring/logger';

export type TimePeriod = '7d' | '30d' | '90d' | '1y';
export type GroupBy = 'day' | 'week' | 'month';

export interface RevenueDataPoint {
  date: string; // ISO date
  totalRevenue: number;
  commissionRevenue: number;
  orderCount: number;
  averageOrderValue: number;
}

export interface RevenueAnalytics {
  data: RevenueDataPoint[];
  summary: {
    totalRevenue: number;
    totalCommission: number;
    totalOrders: number;
    averageOrderValue: number;
    growthRate: number; // % change from previous period
  };
}

export function useRevenueAnalytics(
  period: TimePeriod = '30d',
  groupBy: GroupBy = 'day'
) {
  const [data, setData] = useState<RevenueAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRevenue = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const url = new URL(
        '/api/v1/admin/analytics/revenue',
        window.location.origin
      );
      url.searchParams.set('period', period);
      url.searchParams.set('groupBy', groupBy);

      const response = await fetch(url.toString(), {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      logger.info('[Hook] Revenue analytics loaded', {
        dataPoints: result.data.length,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error(
        '[Hook] Revenue analytics error',
        err instanceof Error ? err : new Error(message)
      );
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [period, groupBy]);

  useEffect(() => {
    fetchRevenue();
  }, [fetchRevenue]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchRevenue,
  };
}
