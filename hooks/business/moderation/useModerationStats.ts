'use client';

/**
 * ================================================
 * USE MODERATION STATS HOOK
 * ================================================
 * Dashboard statistics for moderation system
 *
 * Features:
 * - Real-time moderation statistics
 * - Pending items count
 * - Performance metrics
 * - Activity tracking
 *
 * Sprint: Moderation System Production Ready
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 13, 2025
 */

import useSWR from 'swr';
import { getBackendApiUrl } from '@/lib/config/api';

// ============================================================================
// TYPES
// ============================================================================

export interface ModerationStats {
  // Pending counts
  pendingReviews: number;
  pendingComments: number;
  pendingReports: number;
  flaggedItems: number;

  // Resolution counts
  resolvedToday: number;
  resolvedThisWeek: number;
  resolvedThisMonth: number;

  // Performance
  averageResolutionTimeMinutes: number;
  totalModeratorsActive: number;

  // Performance breakdown
  performance: {
    actionsToday: number;
    actionsThisWeek: number;
    actionsThisMonth: number;
    averageActionTimeMinutes: number;
    accuracyRate: number;
  };
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
      .catch(() => ({ message: 'Failed to fetch stats' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
};

// ============================================================================
// MAIN HOOK
// ============================================================================

export interface UseModerationStatsOptions {
  refreshInterval?: number; // milliseconds
  autoFetch?: boolean;
}

export interface UseModerationStatsReturn {
  stats: ModerationStats | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

export function useModerationStats(
  options: UseModerationStatsOptions = {}
): UseModerationStatsReturn {
  const { refreshInterval = 30000, autoFetch = true } = options; // 30s default

  const { data, error, mutate, isLoading } = useSWR<ModerationStats>(
    autoFetch ? `${getBackendApiUrl()}/api/v1/moderation/stats` : null,
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  return {
    stats: data || null,
    isLoading,
    error: error || null,
    refresh: () => mutate(),
  };
}

export default useModerationStats;
