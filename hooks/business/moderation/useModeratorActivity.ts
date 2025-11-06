/**
 * ================================================
 * USE MODERATOR ACTIVITY HOOK
 * ================================================
 * Hook for fetching moderator activity logs
 *
 * Features:
 * - Recent activity timeline
 * - Filter by action type
 * - Filter by date range
 * - Real-time updates
 *
 * Sprint 2 - Story 2.3: Activity Timeline
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 3, 2025
 */

import { useCallback } from 'react';
import useSWR from 'swr';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

export type ActionType =
  | 'APPROVE'
  | 'REJECT'
  | 'SPAM'
  | 'RESOLVE'
  | 'CLOSE'
  | 'WARN'
  | 'BAN'
  | 'BULK_APPROVE'
  | 'BULK_REJECT'
  | 'BULK_SPAM';

export type TargetType = 'COMMENT' | 'REVIEW' | 'REPORT' | 'TICKET' | 'USER';

export interface ActivityLog {
  activityId: string;
  moderatorId: string;
  moderatorName: string;
  actionType: ActionType;
  targetType: TargetType;
  targetId: string;
  description: string;
  reason?: string;
  timestamp: string;
  affectedUserId?: string;
  affectedUserName?: string;
}

export interface ActivityFilters {
  actionType?: ActionType;
  targetType?: TargetType;
  startDate?: string;
  endDate?: string;
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export interface UseModeratorActivityOptions {
  autoFetch?: boolean;
  limit?: number;
  refreshInterval?: number;
}

export interface UseModeratorActivityReturn {
  activities: ActivityLog[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

export function useModeratorActivity(
  options: UseModeratorActivityOptions = {}
): UseModeratorActivityReturn {
  const {
    autoFetch = true,
    limit = 50,
    refreshInterval = 60000, // 1 minute
  } = options;

  // Fetch activities
  const { data, error, isLoading, mutate } = useSWR<{ data: ActivityLog[] }>(
    autoFetch ? ['/api/v1/moderator/recent-activity', limit] : null,
    async ([url, lim]: [string, number]) => {
      const params = new URLSearchParams({
        limit: lim.toString(),
      });

      const response = await fetch(`${url}?${params}`);
      if (!response.ok) throw new Error('Failed to fetch activities');
      return response.json();
    },
    {
      refreshInterval,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const refresh = useCallback(() => {
    mutate();
    logger.info('Activity timeline refreshed');
  }, [mutate]);

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  if (error) {
    logger.error('Activity fetch error:', error instanceof Error ? error : new Error(String(error)));
  }

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    activities: data?.data ?? [],
    isLoading,
    error: error ?? null,
    refresh,
  };
}
