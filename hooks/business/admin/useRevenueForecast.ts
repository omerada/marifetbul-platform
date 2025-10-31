/**
 * ================================================
 * USE REVENUE FORECAST HOOK
 * ================================================
 * Hook for revenue forecasting and predictions
 *
 * Features:
 * - Next week forecast
 * - Next month forecast
 * - Custom period forecast
 * - Confidence intervals
 * - Trend analysis
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 3 - Task 3.3
 */

import { useState, useEffect, useCallback } from 'react';
import {
  RevenueForecastDto,
  forecastRevenue,
  getNextWeekForecast,
  getNextMonthForecast,
} from '@/lib/api/admin-analytics';
import { toast } from 'sonner';

export type ForecastPeriod = 'week' | 'month' | 'custom';

interface UseRevenueForecastOptions {
  period?: ForecastPeriod;
  forecastDays?: number;
  historicalDays?: number;
  autoLoad?: boolean;
}

interface UseRevenueForecastReturn {
  data: RevenueForecastDto | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  loadForecast: (
    period: ForecastPeriod,
    forecastDays?: number,
    historicalDays?: number
  ) => Promise<void>;
}

/**
 * Custom hook for revenue forecasting
 */
export function useRevenueForecast(
  options: UseRevenueForecastOptions = {}
): UseRevenueForecastReturn {
  const {
    period = 'week',
    forecastDays = 7,
    historicalDays = 30,
    autoLoad = true,
  } = options;

  const [data, setData] = useState<RevenueForecastDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPeriod, setCurrentPeriod] = useState<ForecastPeriod>(period);
  const [forecastParams, setForecastParams] = useState({
    forecastDays,
    historicalDays,
  });

  /**
   * Fetch forecast data
   */
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let result: RevenueForecastDto;

      switch (currentPeriod) {
        case 'week':
          result = await getNextWeekForecast();
          break;
        case 'month':
          result = await getNextMonthForecast();
          break;
        case 'custom':
          result = await forecastRevenue(
            forecastParams.forecastDays,
            forecastParams.historicalDays
          );
          break;
        default:
          result = await getNextWeekForecast();
      }

      setData(result);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Tahmin verileri yüklenirken hata oluştu';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [currentPeriod, forecastParams]);

  /**
   * Load specific forecast
   */
  const loadForecast = useCallback(
    async (
      newPeriod: ForecastPeriod,
      newForecastDays?: number,
      newHistoricalDays?: number
    ) => {
      setCurrentPeriod(newPeriod);
      if (newPeriod === 'custom' && newForecastDays && newHistoricalDays) {
        setForecastParams({
          forecastDays: newForecastDays,
          historicalDays: newHistoricalDays,
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
    loadForecast,
  };
}
