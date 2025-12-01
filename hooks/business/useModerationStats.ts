'use client';

/**
 * ================================================
 * USE MODERATION STATS HOOK
 * ================================================
 * Hook for real-time moderation statistics
 *
 * Sprint: Moderator System Completion - Day 2
 * @version 1.0.0
 * @author MarifetBul Development Team
 * @updated November 1, 2025
 */

'use client';

import { useCallback } from 'react';
import useSWR from 'swr';
import { moderationApi } from '@/lib/api/moderation';
import logger from '@/lib/infrastructure/monitoring/logger';
import type { ModerationStats } from '@/types/business/moderation';

// ============================================================================
// TYPES
// ============================================================================

interface UseModerationStatsReturn {
  stats: ModerationStats | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
  lastUpdated: Date | null;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook for fetching and managing moderation statistics
 * Uses SWR for automatic caching and revalidation
 *
 * SPRINT 1 - STORY 1: Updated to use production-ready API
 * - Endpoint: GET /api/v1/moderation/stats
 * - Response: ModerationStatsResponse (backend)
 * - Auto-transforms to ModerationStats (frontend)
 *
 * @param refreshInterval - Auto-refresh interval in milliseconds (default: 30000)
 */
export function useModerationStats(
  refreshInterval = 30000
): UseModerationStatsReturn {
  const {
    data: rawStats,
    error,
    isLoading,
    mutate,
  } = useSWR<ModerationStats>(
    '/moderation/stats',
    async () => {
      try {
        const data = await moderationApi.getStats();

        // Add backward compatibility fields for legacy components
        const enhancedStats: ModerationStats & {
          flaggedComments?: number;
          reviewsApprovedToday?: number;
          reviewsRejectedToday?: number;
          reportsResolvedToday?: number;
          pendingSupportTickets?: number;
          ticketsClosedToday?: number;
          totalPendingItems?: number;
          totalActionsToday?: number;
          accuracyRate?: number;
        } = {
          ...data,
          // Legacy compatibility (not in ModerationStats type)
          commentsApprovedToday: data.performance.actionsToday,
          commentsRejectedToday: 0, // Not tracked separately anymore
          reviewsApprovedToday: data.performance.actionsToday,
          reviewsRejectedToday: 0, // Not tracked separately anymore
          reportsResolvedToday: data.resolvedToday,
          pendingSupportTickets: 0, // Removed from new API
          ticketsClosedToday: 0, // Removed from new API
          totalPendingItems:
            data.pendingReviews + data.pendingComments + data.pendingReports,
          totalActionsToday: data.performance.actionsToday,
          accuracyRate: data.performance.accuracyRate,
        };

        logger.debug('Moderation stats fetched', {
          pendingReviews: enhancedStats.pendingReviews,
          pendingComments: enhancedStats.pendingComments,
          totalPending:
            enhancedStats.pendingReviews +
            enhancedStats.pendingComments +
            enhancedStats.pendingReports,
        });
        return enhancedStats;
      } catch (err) {
        logger.error(
          'Failed to fetch moderation stats:',
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

  // Manual refresh
  const refresh = useCallback(() => {
    mutate();
  }, [mutate]);

  // Calculate last updated time
  const lastUpdated = rawStats ? new Date() : null;

  return {
    stats: rawStats || null,
    isLoading,
    error: error || null,
    refresh,
    lastUpdated,
  };
}

export default useModerationStats;
