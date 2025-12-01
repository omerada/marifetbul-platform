'use client';

/**
 * ================================================
 * USE MODERATION ACTIVITIES HOOK
 * ================================================
 * Hook for fetching moderation activity log with pagination
 *
 * SPRINT 1 - STORY 3: Production Implementation
 * @version 1.0.0
 * @author MarifetBul Development Team
 * @created November 9, 2025
 */

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { getRecentActivities } from '@/lib/api/moderation';
import logger from '@/lib/infrastructure/monitoring/logger';
import type { ModerationActivity } from '@/types/business/moderation';
import type { PageResponse } from '@/types/infrastructure/api';

// ============================================================================
// TYPES
// ============================================================================

export interface UseModerationActivitiesParams {
  /** Page number (0-indexed) */
  page?: number;
  /** Page size (default 20, max 100) */
  size?: number;
  /** Include all moderators' activities (admin only) */
  allModerators?: boolean;
  /** Auto-refresh interval in ms (default: 30000 = 30 seconds) */
  refreshInterval?: number;
}

export interface UseModerationActivitiesReturn {
  /** Activity items for current page */
  activities: ModerationActivity[];
  /** Total number of activities across all pages */
  totalElements: number;
  /** Total number of pages */
  totalPages: number;
  /** Current page number (0-indexed) */
  currentPage: number;
  /** Page size */
  pageSize: number;
  /** Is loading */
  isLoading: boolean;
  /** Error if any */
  error: Error | null;
  /** Is first page */
  isFirstPage: boolean;
  /** Is last page */
  isLastPage: boolean;
  /** Has next page */
  hasNext: boolean;
  /** Has previous page */
  hasPrevious: boolean;
  /** Go to next page */
  nextPage: () => void;
  /** Go to previous page */
  prevPage: () => void;
  /** Go to specific page */
  goToPage: (page: number) => void;
  /** Refresh activities */
  refresh: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook for fetching and managing moderation activities
 * Uses SWR for automatic caching and revalidation
 *
 * SPRINT 1 - STORY 3: Production Implementation
 * - Endpoint: GET /api/v1/moderation/activities
 * - Supports pagination (page, size)
 * - Admin can view all moderators' activities
 * - Auto-sorted by timestamp DESC (newest first)
 *
 * @param params - Activity parameters (page, size, allModerators, refresh interval)
 * @returns Activity data with pagination controls
 */
export function useModerationActivities(
  params: UseModerationActivitiesParams = {}
): UseModerationActivitiesReturn {
  const {
    page: initialPage = 0,
    size = 20,
    allModerators = false,
    refreshInterval = 30000, // 30 seconds
  } = params;

  const [currentPage, setCurrentPage] = useState(initialPage);

  // SWR key includes all parameters for cache invalidation
  const swrKey = `/moderation/activities?page=${currentPage}&size=${size}&allModerators=${allModerators}`;

  const { data, error, isLoading, mutate } = useSWR<
    PageResponse<ModerationActivity>
  >(
    swrKey,
    async () => {
      try {
        logger.debug('Fetching moderation activities', {
          page: currentPage,
          size,
          allModerators,
        });

        const response = await getRecentActivities(
          currentPage,
          size,
          allModerators
        );

        logger.debug('Moderation activities fetched', {
          totalActivities: response.totalElements,
          currentPage,
          activitiesInPage: response.content.length,
        });

        return response;
      } catch (err) {
        logger.error(
          'Failed to fetch moderation activities:',
          err instanceof Error ? err : new Error(String(err))
        );
        throw err;
      }
    },
    {
      refreshInterval,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 10000, // Prevent duplicate requests within 10s
      errorRetryInterval: 5000,
      errorRetryCount: 3,
    }
  );

  // Pagination controls
  const nextPage = useCallback(() => {
    if (data && currentPage < data.totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, data]);

  const prevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  const goToPage = useCallback((page: number) => {
    if (page >= 0) {
      setCurrentPage(page);
    }
  }, []);

  // Manual refresh
  const refresh = useCallback(() => {
    mutate();
  }, [mutate]);

  return {
    activities: data?.content || [],
    totalElements: data?.totalElements || 0,
    totalPages: data?.totalPages || 0,
    currentPage,
    pageSize: size,
    isLoading,
    error: error || null,
    isFirstPage: data?.first ?? true,
    isLastPage: data?.last ?? true,
    hasNext: !(data?.last ?? true),
    hasPrevious: !(data?.first ?? true),
    nextPage,
    prevPage,
    goToPage,
    refresh,
  };
}

export default useModerationActivities;
