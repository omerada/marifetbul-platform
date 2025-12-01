'use client';

/**
 * ================================================
 * REVENUE FORECAST CONTAINER - DATA FETCHING WRAPPER
 * ================================================
 * Container component for RevenueForecastWidget
 *
 * @module components/domains/admin/dashboard/widgets
 * @since Sprint 2.2 - Code Consolidation
 * @version 2.0.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { RevenueForecastWidget } from './RevenueForecastWidget';
import type { RevenueForecastDto } from '@/lib/api/admin-analytics';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// TYPES
// ================================================

export interface RevenueForecastContainerProps {
  /** Number of days to forecast */
  forecastDays?: number;

  /** Number of historical days to base forecast on */
  historicalDays?: number;

  /** Additional CSS classes */
  className?: string;
}

// ================================================
// CONTAINER COMPONENT
// ================================================

/**
 * Revenue Forecast Container - Handles data fetching
 *
 * @example
 * ```tsx
 * <RevenueForecastContainer forecastDays={7} historicalDays={30} />
 * ```
 */
export function RevenueForecastContainer({
  forecastDays = 7,
  historicalDays = 30,
  className,
}: RevenueForecastContainerProps) {
  const [data, setData] = useState<RevenueForecastDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForecast = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const authHeader = document.cookie
        .split('; ')
        .find((row) => row.startsWith('auth_token='))
        ?.split('=')[1];

      const url = `/api/v1/admin/analytics/revenue/forecast?forecastDays=${forecastDays}&historicalDays=${historicalDays}`;

      logger.debug('Fetching revenue forecast:', {
        url,
        forecastDays,
        historicalDays,
      });

      const response = await fetch(url, {
        headers: {
          ...(authHeader && { Authorization: `Bearer ${authHeader}` }),
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${errorText || 'Tahmin alınamadı'}`
        );
      }

      const result = await response.json();
      const forecastData = result.data || result;

      logger.info('Revenue forecast loaded:', {
        forecastDays,
        predictedAmount: forecastData.predicted?.amount,
      });

      setData(forecastData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Bilinmeyen hata';

      logger.error(
        'Revenue forecast fetch error:',
        err instanceof Error ? err : new Error(String(err)),
        {
          forecastDays,
          historicalDays,
        }
      );

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forecastDays, historicalDays]);

  return (
    <RevenueForecastWidget
      data={data!}
      isLoading={isLoading}
      error={error}
      onRefresh={fetchForecast}
      className={className}
    />
  );
}

export default RevenueForecastContainer;
