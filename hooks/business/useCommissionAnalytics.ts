/**
 * ================================================
 * USE COMMISSION ANALYTICS HOOK
 * ================================================
 * Custom hook for commission analytics and history
 *
 * Sprint: Admin Commission Management
 * Story: Commission Analytics Dashboard (5 SP)
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint Day 1
 */

'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import {
  getCommissionAnalytics,
  getCommissionHistory,
} from '@/lib/api/admin/commissions';
import type {
  CommissionAnalytics,
  CommissionHistory,
  PageResponse,
} from '@/lib/api/admin/types';

// ========== Hook ==========

export function useCommissionAnalytics(
  startDate?: string,
  endDate?: string,
  period?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
) {
  // Build SWR key with parameters
  const analyticsKey = useMemo(() => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (period) params.append('period', period);
    const queryString = params.toString();
    return `/api/v1/admin/commissions/analytics${queryString ? `?${queryString}` : ''}`;
  }, [startDate, endDate, period]);

  // Fetch analytics with SWR
  const {
    data: analytics,
    error,
    isLoading,
    mutate: refetch,
  } = useSWR<CommissionAnalytics>(
    analyticsKey,
    () => getCommissionAnalytics(startDate, endDate, period),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    analytics,
    isLoading,
    error,
    refetch,
  };
}

// ========== Commission History Hook ==========

export function useCommissionHistory(
  page: number = 0,
  size: number = 20,
  categoryId?: string,
  startDate?: string,
  endDate?: string
) {
  // Build SWR key with parameters
  const historyKey = useMemo(() => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    if (categoryId) params.append('categoryId', categoryId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return `/api/v1/admin/commissions/history?${params.toString()}`;
  }, [page, size, categoryId, startDate, endDate]);

  // Fetch history with SWR
  const {
    data: history,
    error,
    isLoading,
    mutate: refetch,
  } = useSWR<PageResponse<CommissionHistory>>(
    historyKey,
    () => getCommissionHistory({ page, size, categoryId, startDate, endDate }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    history,
    isLoading,
    error,
    refetch,
  };
}
