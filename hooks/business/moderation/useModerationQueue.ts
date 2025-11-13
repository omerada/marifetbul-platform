'use client';

/**
 * ================================================
 * USE MODERATION QUEUE HOOK
 * ================================================
 * Unified queue management for all moderation types
 *
 * Features:
 * - Fetch queue items (comments, reviews, reports)
 * - Advanced filtering (type, priority, status, date range)
 * - Pagination support
 * - Real-time updates
 *
 * Sprint: Moderation System Production Ready
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 13, 2025
 */

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { getBackendApiUrl } from '@/lib/config/api';

// ============================================================================
// TYPES
// ============================================================================

export type QueueItemType = 'COMMENT' | 'REVIEW' | 'REPORT';
export type QueueItemPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface QueueItem {
  itemId: string;
  itemType: QueueItemType;
  content: string;
  authorName: string;
  authorId: string;
  priority: QueueItemPriority;
  status: string;
  createdAt: string;
  flagReason?: string;
  reportCount: number;
}

export interface ModerationQueueFilters {
  types?: string; // Comma-separated: COMMENT,REVIEW,REPORT
  priorities?: string; // Comma-separated: HIGH,MEDIUM,LOW
  statuses?: string; // Comma-separated status values
  createdFrom?: string; // ISO DateTime
  createdTo?: string; // ISO DateTime
  escalatedOnly?: boolean;
  flaggedOnly?: boolean;
  searchQuery?: string;
  minReportCount?: number;
  sortBy?: 'createdAt' | 'priority' | 'reportCount';
  sortDirection?: 'asc' | 'desc';
}

export interface ModerationQueueResponse {
  content: QueueItem[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// ============================================================================
// API FETCHER
// ============================================================================

const fetcher = async (url: string) => {
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: 'Failed to fetch queue' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
};

// ============================================================================
// MAIN HOOK
// ============================================================================

export interface UseModerationQueueOptions {
  autoFetch?: boolean;
  filters?: ModerationQueueFilters;
  pageSize?: number;
}

export interface UseModerationQueueReturn {
  // Data
  items: QueueItem[];
  pagination: {
    page: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  } | null;

  // State
  isLoading: boolean;
  error: Error | null;

  // Actions
  fetchPage: (page: number) => void;
  refresh: () => void;
  nextPage: () => void;
  prevPage: () => void;
}

export function useModerationQueue(
  options: UseModerationQueueOptions = {}
): UseModerationQueueReturn {
  const { autoFetch = true, filters = {}, pageSize = 20 } = options;

  const [page, setPage] = useState(0);

  // ========================================================================
  // BUILD URL
  // ========================================================================

  const buildUrl = useCallback(
    (currentPage: number) => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: pageSize.toString(),
        ...(filters.types && { types: filters.types }),
        ...(filters.priorities && { priorities: filters.priorities }),
        ...(filters.statuses && { statuses: filters.statuses }),
        ...(filters.createdFrom && { createdFrom: filters.createdFrom }),
        ...(filters.createdTo && { createdTo: filters.createdTo }),
        ...(filters.escalatedOnly && { escalatedOnly: 'true' }),
        ...(filters.flaggedOnly && { flaggedOnly: 'true' }),
        ...(filters.searchQuery && { searchQuery: filters.searchQuery }),
        ...(filters.minReportCount && {
          minReportCount: filters.minReportCount.toString(),
        }),
        ...(filters.sortBy && { sortBy: filters.sortBy }),
        ...(filters.sortDirection && { sortDirection: filters.sortDirection }),
      });

      return `${getBackendApiUrl()}/api/v1/moderation/queue/advanced?${params}`;
    },
    [filters, pageSize]
  );

  // ========================================================================
  // DATA FETCHING
  // ========================================================================

  const { data, error, mutate, isLoading } = useSWR<ModerationQueueResponse>(
    autoFetch ? buildUrl(page) : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  // ========================================================================
  // ACTIONS
  // ========================================================================

  const fetchPage = useCallback((targetPage: number) => {
    setPage(targetPage);
  }, []);

  const refresh = useCallback(() => {
    mutate();
  }, [mutate]);

  const nextPage = useCallback(() => {
    if (data && !data.last) {
      setPage((prev) => prev + 1);
    }
  }, [data]);

  const prevPage = useCallback(() => {
    if (data && !data.first) {
      setPage((prev) => Math.max(0, prev - 1));
    }
  }, [data]);

  // ========================================================================
  // RETURN
  // ========================================================================

  return {
    items: data?.content || [],
    pagination: data
      ? {
          page: data.pageNumber,
          pageSize: data.pageSize,
          totalElements: data.totalElements,
          totalPages: data.totalPages,
          hasNext: data.hasNext,
          hasPrevious: data.hasPrevious,
        }
      : null,
    isLoading,
    error: error || null,
    fetchPage,
    refresh,
    nextPage,
    prevPage,
  };
}

export default useModerationQueue;
