/**
 * ================================================
 * USE MODERATOR DASHBOARD HOOK
 * ================================================
 * Main hook for moderator dashboard with aggregated stats
 *
 * Features:
 * - Aggregated statistics from all moderation types
 * - Real-time stats updates
 * - Pending items from all categories
 * - Today's activity summary
 *
 * Sprint 2 - Story 2.1: Moderator Dashboard Overview
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 3, 2025
 */

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { logger } from '@/lib/shared/utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface ModerationStats {
  // Comments
  pendingComments: number;
  flaggedComments: number;
  commentsApprovedToday: number;
  commentsRejectedToday: number;

  // Reviews
  pendingReviews: number;
  flaggedReviews: number;
  reviewsApprovedToday: number;
  reviewsRejectedToday: number;

  // Reports
  pendingReports: number;
  reportsResolvedToday: number;

  // Support Tickets
  pendingSupportTickets: number;
  ticketsClosedToday: number;

  // Aggregated
  totalPendingItems: number;
  totalActionsToday: number;
  averageResponseTimeMinutes: number;
  accuracyRate: number;
}

export interface PendingItem {
  id: string;
  type: 'COMMENT' | 'REVIEW' | 'REPORT' | 'TICKET';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  reportedBy?: string;
  reportedAt: string;
  waitingTimeMinutes: number;
  targetUrl?: string;
}

export interface PendingItemsResponse {
  items: PendingItem[];
  pagination: {
    page: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
  };
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export interface UseModeratorDashboardOptions {
  autoFetch?: boolean;
  refreshInterval?: number; // in milliseconds
}

export interface UseModeratorDashboardReturn {
  stats: ModerationStats | null;
  pendingItems: PendingItem[];
  pagination: PendingItemsResponse['pagination'] | null;
  isLoading: boolean;
  isLoadingItems: boolean;
  error: Error | null;
  refresh: () => void;
  refreshPendingItems: () => void;
  currentPage: number;
  goToPage: (page: number) => void;
}

export function useModeratorDashboard(
  options: UseModeratorDashboardOptions = {}
): UseModeratorDashboardReturn {
  const {
    autoFetch = true,
    refreshInterval = 30000, // 30 seconds default
  } = options;

  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;

  // Fetch stats
  const {
    data: statsData,
    error: statsError,
    isLoading: statsLoading,
    mutate: mutateStats,
  } = useSWR<{ data: ModerationStats }>(
    autoFetch ? '/api/v1/moderator/stats' : null,
    async (url) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    {
      refreshInterval,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  // Fetch pending items
  const {
    data: itemsData,
    error: itemsError,
    isLoading: itemsLoading,
    mutate: mutateItems,
  } = useSWR<{ data: PendingItemsResponse }>(
    autoFetch
      ? ['/api/v1/moderator/pending-items', currentPage, pageSize]
      : null,
    async ([url]) => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: pageSize.toString(),
      });

      const response = await fetch(`${url}?${params}`);
      if (!response.ok) throw new Error('Failed to fetch pending items');
      return response.json();
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const refresh = useCallback(() => {
    mutateStats();
    logger.info('Dashboard stats refreshed');
  }, [mutateStats]);

  const refreshPendingItems = useCallback(() => {
    mutateItems();
    logger.info('Pending items refreshed');
  }, [mutateItems]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
    logger.info('Navigated to page', { page });
  }, []);

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  const error = statsError || itemsError;
  if (error) {
    logger.error('Dashboard error:', error);
  }

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    stats: statsData?.data ?? null,
    pendingItems: itemsData?.data.items ?? [],
    pagination: itemsData?.data.pagination ?? null,
    isLoading: statsLoading,
    isLoadingItems: itemsLoading,
    error: error ?? null,
    refresh,
    refreshPendingItems,
    currentPage,
    goToPage,
  };
}
