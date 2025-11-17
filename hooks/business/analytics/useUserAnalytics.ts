import { useState, useEffect, useCallback } from 'react';
import logger from '@/lib/infrastructure/monitoring/logger';
import type { TimePeriod } from './useRevenueAnalytics';

export type UserMetric = 'active' | 'retention' | 'churn';

export interface UserAnalyticsData {
  metric: UserMetric;
  data: {
    date: string;
    value: number;
  }[];
  summary: {
    current: number;
    previous: number;
    changeRate: number; // % change
  };
}

export function useUserAnalytics(
  period: TimePeriod = '30d',
  metric: UserMetric = 'active'
) {
  const [data, setData] = useState<UserAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const url = new URL(
        '/api/v1/admin/analytics/users',
        window.location.origin
      );
      url.searchParams.set('period', period);
      url.searchParams.set('metric', metric);

      const response = await fetch(url.toString(), {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      logger.info('[Hook] User analytics loaded', { metric });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error(
        '[Hook] User analytics error',
        err instanceof Error ? err : new Error(message)
      );
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [period, metric]);

  useEffect(() => {
    fetchUserAnalytics();
  }, [fetchUserAnalytics]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchUserAnalytics,
  };
}
