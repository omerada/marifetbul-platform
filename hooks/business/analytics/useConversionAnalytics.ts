import { useState, useEffect, useCallback } from 'react';
import logger from '@/lib/infrastructure/monitoring/logger';
import type { TimePeriod } from './useRevenueAnalytics';

export interface ConversionStage {
  stage: 'view' | 'contact' | 'order' | 'complete';
  count: number;
  conversionRate: number; // % of previous stage
}

export interface ConversionAnalytics {
  funnel: ConversionStage[];
  overallConversion: number; // view to complete %
  dropOffPoints: {
    stage: string;
    dropOffRate: number;
  }[];
}

export function useConversionAnalytics(period: TimePeriod = '30d') {
  const [data, setData] = useState<ConversionAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const url = new URL(
        '/api/v1/admin/analytics/conversions',
        window.location.origin
      );
      url.searchParams.set('period', period);

      const response = await fetch(url.toString(), {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      logger.info('[Hook] Conversion analytics loaded');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error(
        '[Hook] Conversion analytics error',
        err instanceof Error ? err : new Error(message)
      );
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchConversions();
  }, [fetchConversions]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchConversions,
  };
}
