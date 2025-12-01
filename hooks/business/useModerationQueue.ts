'use client';

/**
 * ================================================
 * USE MODERATION QUEUE HOOK
 * ================================================
 * Hook for fetching moderation queue with pagination and filtering
 *
 * SPRINT 1 - STORY 2: Production Implementation
 * @version 2.0.0 - Updated to use new queue API
 * @author MarifetBul Development Team
 * @updated November 8, 2025
 */

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { getModerationQueue } from '@/lib/api/moderation';
import logger from '@/lib/infrastructure/monitoring/logger';
import type { ModerationQueueItem } from '@/types/business/moderation';
import type { PageResponse } from '@/types/infrastructure/api';

// ============================================================================
// TYPES
// ============================================================================

export interface UseModerationQueueParams {
  /** Page number (0-indexed) */
  page?: number;
  /** Page size (default 20, max 100) */
  size?: number;
  /** Filter by type: 'review' | 'comment' | 'report' */
  type?: string | null;
  /** Filter by priority: 'HIGH' | 'MEDIUM' | 'LOW' */
  priority?: string | null;
  /** Auto-refresh interval in ms (default: 60000 = 1 minute) */
  refreshInterval?: number;
}

export interface UseModerationQueueReturn {
  /** Queue items for current page */
  items: ModerationQueueItem[];
  /** Total number of items across all pages */
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
  /** Set type filter */
  setTypeFilter: (type: string | null) => void;
  /** Set priority filter */
  setPriorityFilter: (priority: string | null) => void;
  /** Refresh queue */
  refresh: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook for fetching and managing moderation queue
 * Uses SWR for automatic caching and revalidation
 *
 * SPRINT 1 - STORY 2: Production Implementation
 * - Endpoint: GET /api/v1/moderation/queue
 * - Supports pagination (page, size)
 * - Supports filtering (type, priority)
 * - Auto-sorted by priority then date
 *
 * @param params - Queue parameters (page, size, filters, refresh interval)
 * @returns Queue data with pagination controls
 */
export function useModerationQueue(
  params: UseModerationQueueParams = {}
): UseModerationQueueReturn {
  const {
    page: initialPage = 0,
    size = 20,
    type: initialType = null,
    priority: initialPriority = null,
    refreshInterval = 60000, // 1 minute
  } = params;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [typeFilter, setTypeFilter] = useState<string | null>(initialType);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(
    initialPriority
  );

  // SWR key includes all parameters for cache invalidation
  const swrKey = `/moderation/queue?page=${currentPage}&size=${size}&type=${typeFilter || 'all'}&priority=${priorityFilter || 'all'}`;

  const { data, error, isLoading, mutate } = useSWR<
    PageResponse<ModerationQueueItem>
  >(
    swrKey,
    async () => {
      try {
        logger.debug('Fetching moderation queue', {
          page: currentPage,
          size,
          type: typeFilter,
          priority: priorityFilter,
        });

        const response = await getModerationQueue(
          currentPage,
          size,
          typeFilter,
          priorityFilter
        );

        logger.debug('Moderation queue fetched', {
          totalItems: response.totalElements,
          currentPage,
          itemsInPage: response.content.length,
        });

        return response;
      } catch (err) {
        logger.error(
          'Failed to fetch moderation queue:',
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

  // Filter controls
  const handleSetTypeFilter = useCallback((type: string | null) => {
    setTypeFilter(type);
    setCurrentPage(0); // Reset to first page when filter changes
  }, []);

  const handleSetPriorityFilter = useCallback((priority: string | null) => {
    setPriorityFilter(priority);
    setCurrentPage(0); // Reset to first page when filter changes
  }, []);

  // Manual refresh
  const refresh = useCallback(() => {
    mutate();
  }, [mutate]);

  return {
    items: data?.content || [],
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
    setTypeFilter: handleSetTypeFilter,
    setPriorityFilter: handleSetPriorityFilter,
    refresh,
  };
}

export default useModerationQueue;
