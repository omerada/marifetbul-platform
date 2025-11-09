'use client';

/**
 * ================================================
 * REVENUE COMPARISON CONTAINER - DATA FETCHING WRAPPER
 * ================================================
 * Container component for RevenueComparisonWidget
 *
 * @module components/domains/admin/dashboard/widgets
 * @since Sprint 2.2 - Code Consolidation
 * @version 2.0.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  RevenueComparisonWidget,
  type RevenueComparisonDto,
} from './RevenueComparisonWidget';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// TYPES
// ================================================

export interface RevenueComparisonContainerProps {
  /** Comparison type */
  comparisonType?: 'today' | 'week' | 'month';

  /** Additional CSS classes */
  className?: string;
}

// ================================================
// CONTAINER COMPONENT
// ================================================

/**
 * Revenue Comparison Container - Handles data fetching
 *
 * @example
 * ```tsx
 * <RevenueComparisonContainer comparisonType="week" />
 * ```
 */
export function RevenueComparisonContainer({
  comparisonType = 'week',
  className,
}: RevenueComparisonContainerProps) {
  const [data, setData] = useState<RevenueComparisonDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComparison = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const authHeader = document.cookie
        .split('; ')
        .find((row) => row.startsWith('auth_token='))
        ?.split('=')[1];

      let url = `/api/v1/admin/analytics/revenue/compare`;

      if (comparisonType === 'today') {
        url += '/today-vs-yesterday';
      } else if (comparisonType === 'week') {
        url += '/this-week-vs-last-week';
      } else if (comparisonType === 'month') {
        url += '/this-month-vs-last-month';
      }

      logger.debug('Fetching revenue comparison:', { url, comparisonType });

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
          `HTTP ${response.status}: ${errorText || 'Karşılaştırma alınamadı'}`
        );
      }

      const result = await response.json();
      const comparisonData = result.data || result;

      logger.info('Revenue comparison loaded:', {
        comparisonType,
        revenueChange: comparisonData.comparison?.revenueChangePercentage,
      });

      setData(comparisonData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Bilinmeyen hata';

      logger.error(
        'Revenue comparison fetch error:',
        err instanceof Error ? err : new Error(String(err)),
        {
          comparisonType,
        }
      );

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comparisonType]);

  return (
    <RevenueComparisonWidget
      data={data!}
      isLoading={isLoading}
      error={error}
      onRefresh={fetchComparison}
      className={className}
    />
  );
}

export default RevenueComparisonContainer;
