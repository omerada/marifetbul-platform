'use client';

/**
 * ================================================
 * USE MODERATION DASHBOARD HOOK
 * ================================================
 * Hook for moderator dashboard data
 *
 * Sprint 2.1: Moderator Dashboard - Real-time Stats
 * @version 1.0.0
 * @author MarifetBul Development Team
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { moderationApi } from '@/lib/api/moderation';
import logger from '@/lib/infrastructure/monitoring/logger';
import type {
  ModerationStats,
  PendingItem,
  ModeratorActivity,
} from '@/types/business/moderation';

interface UseModerationDashboardReturn {
  stats: ModerationStats | null;
  pendingItems: PendingItem[];
  recentActivities: ModeratorActivity[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for moderation dashboard data
 * Fetches stats, pending items, and recent activities
 *
 * @param autoRefreshInterval - Auto refresh interval in ms (0 to disable)
 */
export function useModerationDashboard(
  autoRefreshInterval = 30000 // 30 seconds default
): UseModerationDashboardReturn {
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [recentActivities, setRecentActivities] = useState<ModeratorActivity[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all dashboard data
   */
  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      // Fetch all data in parallel
      const [statsData, pendingData, activitiesData] = await Promise.all([
        moderationApi.getStats(),
        moderationApi.getPendingReviews(1, 10),
        moderationApi.getRecentActivities(1, 20),
      ]);

      setStats(statsData);
      setPendingItems(pendingData.content as any);
      setRecentActivities(activitiesData.content);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Veri yüklenirken hata oluştu';
      setError(errorMessage);
      logger.error(
        'Moderation dashboard error:',
        err instanceof Error ? err : new Error(String(err))
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  /**
   * Manual refresh
   */
  const refresh = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto refresh
  useEffect(() => {
    if (autoRefreshInterval > 0) {
      const interval = setInterval(() => {
        fetchData(true);
      }, autoRefreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefreshInterval, fetchData]);

  return {
    stats,
    pendingItems,
    recentActivities,
    isLoading,
    isRefreshing,
    error,
    refresh,
    clearError,
  };
}
