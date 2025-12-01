'use client';

/**
 * ================================================
 * USE MODERATOR ACTIVITY HOOK
 * ================================================
 * Hook for managing moderator activity timeline
 *
 * Sprint: Moderator System Completion - Day 2
 * @version 1.0.0
 * @author MarifetBul Development Team
 * @updated November 1, 2025
 */

'use client';

import React, { useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { moderationApi } from '@/lib/api/moderation';
import logger from '@/lib/infrastructure/monitoring/logger';
import type {
  ModeratorActivity,
  ActionType,
} from '@/types/business/moderation';

// ============================================================================
// TYPES
// ============================================================================

interface ActivityFilters {
  actionType?: ActionType | 'ALL';
  moderatorId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

interface UseModeratorActivityReturn {
  activities: ModeratorActivity[];
  filteredActivities: ModeratorActivity[];
  isLoading: boolean;
  error: Error | null;
  filters: ActivityFilters;
  setFilters: (filters: ActivityFilters) => void;
  refresh: () => void;
  getActivityStats: () => {
    totalActions: number;
    approveCount: number;
    rejectCount: number;
    spamCount: number;
    warnCount: number;
    banCount: number;
  };
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook for managing moderator activity timeline
 * Provides filtering and statistics
 */
export function useModeratorActivity(
  page = 1,
  pageSize = 50
): UseModeratorActivityReturn {
  const [filters, setFiltersState] = React.useState<ActivityFilters>({
    actionType: 'ALL',
  });

  // Fetch activities with SWR
  const {
    data: response,
    error,
    isLoading,
    mutate,
  } = useSWR(
    ['/moderation/activities', page, pageSize],
    async () => {
      try {
        const data = await moderationApi.getRecentActivities(page, pageSize);
        logger.debug('Moderator activities fetched:', {
          count: data.content.length,
        });
        return data;
      } catch (err) {
        logger.error(
          'Failed to fetch moderator activities:',
          err instanceof Error ? err : new Error(String(err))
        );
        throw err;
      }
    },
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
      dedupingInterval: 10000,
    }
  );

  const activities = useMemo(() => response?.content || [], [response]);

  // Filter activities based on filters
  const filteredActivities = useMemo(() => {
    let result = [...activities];

    // Filter by action type
    if (filters.actionType && filters.actionType !== 'ALL') {
      result = result.filter(
        (activity) => activity.action === filters.actionType
      );
    }

    // Filter by moderator
    if (filters.moderatorId) {
      result = result.filter(
        (activity) => activity.moderatorId === filters.moderatorId
      );
    }

    // Filter by date range
    if (filters.dateFrom) {
      result = result.filter(
        (activity) => new Date(activity.timestamp) >= filters.dateFrom!
      );
    }

    if (filters.dateTo) {
      result = result.filter(
        (activity) => new Date(activity.timestamp) <= filters.dateTo!
      );
    }

    return result;
  }, [activities, filters]);

  // Set filters
  const setFilters = useCallback((newFilters: ActivityFilters) => {
    setFiltersState(newFilters);
  }, []);

  // Manual refresh
  const refresh = useCallback(() => {
    mutate();
  }, [mutate]);

  // Calculate activity statistics
  const getActivityStats = useCallback(() => {
    const stats = {
      totalActions: filteredActivities.length,
      approveCount: 0,
      rejectCount: 0,
      spamCount: 0,
      warnCount: 0,
      banCount: 0,
    };

    filteredActivities.forEach((activity) => {
      switch (activity.action) {
        case 'APPROVE':
        case 'BULK_APPROVE':
          stats.approveCount++;
          break;
        case 'REJECT':
        case 'BULK_REJECT':
          stats.rejectCount++;
          break;
        case 'SPAM':
        case 'BULK_SPAM':
          stats.spamCount++;
          break;
        case 'WARN':
          stats.warnCount++;
          break;
        case 'BAN':
          stats.banCount++;
          break;
      }
    });

    return stats;
  }, [filteredActivities]);

  return {
    activities,
    filteredActivities,
    isLoading,
    error: error || null,
    filters,
    setFilters,
    refresh,
    getActivityStats,
  };
}

export default useModeratorActivity;
