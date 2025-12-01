'use client';

/**
 * ================================================
 * REVENUE BREAKDOWN CONTAINER - DATA FETCHING WRAPPER
 * ================================================
 * Container component for RevenueBreakdownWidget
 *
 * This handles:
 * - Data fetching with period/date range support
 * - Loading and error states
 * - Automatic refresh on period changes
 * - Error handling and retry logic
 *
 * @module components/domains/admin/dashboard/widgets
 * @since Sprint 2 - Code Consolidation
 * @version 2.0.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { RevenueBreakdownWidget } from './RevenueBreakdownWidget';
import type { RevenueBreakdownDto } from '@/lib/api/admin-analytics';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// TYPES
// ================================================

export interface RevenueBreakdownContainerProps {
  /** Time period for revenue data */
  period?: 'today' | 'week' | 'month' | 'custom';

  /** Start date for custom period (YYYY-MM-DD) */
  startDate?: string;

  /** End date for custom period (YYYY-MM-DD) */
  endDate?: string;

  /** Additional CSS classes */
  className?: string;
}

// ================================================
// CONTAINER COMPONENT
// ================================================

/**
 * Revenue Breakdown Container - Handles data fetching
 *
 * @example
 * ```tsx
 * // Monthly revenue
 * <RevenueBreakdownContainer period="month" />
 *
 * // Custom date range
 * <RevenueBreakdownContainer
 *   period="custom"
 *   startDate="2025-01-01"
 *   endDate="2025-01-31"
 * />
 * ```
 */
export function RevenueBreakdownContainer({
  period = 'month',
  startDate,
  endDate,
  className,
}: RevenueBreakdownContainerProps) {
  // ================================================
  // STATE
  // ================================================

  const [data, setData] = useState<RevenueBreakdownDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ================================================
  // DATA FETCHING
  // ================================================

  const fetchBreakdown = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get auth token from cookie
      const authHeader = document.cookie
        .split('; ')
        .find((row) => row.startsWith('auth_token='))
        ?.split('=')[1];

      // Build URL based on period
      let url = `/api/v1/admin/analytics/revenue/breakdown`;

      if (period === 'today') {
        url += '/today';
      } else if (period === 'week') {
        url += '/week';
      } else if (period === 'month') {
        url += '/month';
      } else if (period === 'custom' && startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }

      logger.debug('Fetching revenue breakdown:', {
        url,
        period,
        startDate,
        endDate,
      });

      // Fetch data
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
          `HTTP ${response.status}: ${errorText || 'Gelir analizi alınamadı'}`
        );
      }

      const result = await response.json();
      const revenueData = result.data || result;

      logger.info('Revenue breakdown loaded successfully:', {
        period,
        grossRevenue: revenueData.summary?.grossRevenue,
      });

      setData(revenueData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Bilinmeyen hata';

      logger.error(
        'Revenue breakdown fetch error:',
        err instanceof Error ? err : new Error(String(err)),
        {
          period,
          startDate,
          endDate,
        }
      );

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ================================================
  // EFFECTS
  // ================================================

  useEffect(() => {
    fetchBreakdown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, startDate, endDate]);

  // ================================================
  // RENDER
  // ================================================

  return (
    <RevenueBreakdownWidget
      data={data!}
      isLoading={isLoading}
      error={error}
      onRefresh={fetchBreakdown}
      className={className}
    />
  );
}

export default RevenueBreakdownContainer;
