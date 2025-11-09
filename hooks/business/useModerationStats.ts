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
 * @param refreshInterval - Auto-refresh interval in milliseconds (default: 30000)
 */
export function useModerationStats(
  refreshInterval = 30000
): UseModerationStatsReturn {
  const {
    data: stats,
    error,
    isLoading,
    mutate,
  } = useSWR<ModerationStats>(
    '/moderation/stats',
    async () => {
      try {
        const data = await moderationApi.getStats();
        logger.debug('Moderation stats fetched:', data);
        return data;
      } catch (err) {
        logger.error('Failed to fetch moderation stats:', err instanceof Error ? err : new Error(String(err)));
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
  const lastUpdated = stats ? new Date() : null;

  return {
    stats: stats || null,
    isLoading,
    error: error || null,
    refresh,
    lastUpdated,
  };
}

export default useModerationStats;
