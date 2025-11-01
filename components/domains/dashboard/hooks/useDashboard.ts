/**
 * ================================================
 * USE DASHBOARD HOOK - UNIFIED DASHBOARD DATA
 * ================================================
 * Sprint 1 - Day 5: Main dashboard hook for role-aware data fetching
 *
 * Features:
 * - Role-based data fetching
 * - Auto-refresh with visibility tracking
 * - Loading and error states
 * - Period selection
 * - Cache management
 * - Type-safe data access
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';
import useDashboardStore from '@/lib/core/store/dashboard';
import type { FreelancerDashboard, EmployerDashboard } from '@/types';
import type { DashboardError } from '@/lib/core/store/dashboard';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Dashboard data union type
 */
export type DashboardData = FreelancerDashboard | EmployerDashboard;

/**
 * User role type
 */
export type UserRole = 'freelancer' | 'employer' | 'admin' | 'moderator';

/**
 * Dashboard period type
 */
export type DashboardPeriod = 'week' | 'month' | 'quarter' | 'year';

/**
 * Period to days mapping
 */
const PERIOD_DAYS: Record<DashboardPeriod, number> = {
  week: 7,
  month: 30,
  quarter: 90,
  year: 365,
};

// ============================================================================
// TYPES
// ============================================================================

/**
 * Dashboard hook configuration
 */
export interface UseDashboardConfig {
  /**
   * Initial period to fetch
   * @default 'week'
   */
  initialPeriod?: DashboardPeriod;

  /**
   * Enable auto-refresh
   * @default true
   */
  autoRefresh?: boolean;

  /**
   * Auto-refresh interval in ms
   * @default 300000 (5 minutes)
   */
  refreshInterval?: number;

  /**
   * Enable visibility-based refresh
   * @default true
   */
  refreshOnFocus?: boolean;

  /**
   * Custom error handler
   */
  onError?: (error: Error) => void;

  /**
   * Custom success handler
   */
  onSuccess?: (data: DashboardData) => void;
}

/**
 * Dashboard hook return value
 */
export interface UseDashboardReturn {
  // Data
  data: DashboardData | null;
  role: UserRole | null;
  period: DashboardPeriod;

  // States
  isLoading: boolean;
  isRefreshing: boolean;
  error: DashboardError | null;
  lastUpdated: Date | null;

  // Actions
  refresh: () => Promise<void>;
  changePeriod: (period: DashboardPeriod) => Promise<void>;
  clearError: () => void;

  // Computed
  isEmpty: boolean;
  hasError: boolean;
  isStale: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Required<UseDashboardConfig> = {
  initialPeriod: 'week',
  autoRefresh: true,
  refreshInterval: 5 * 60 * 1000, // 5 minutes
  refreshOnFocus: true,
  onError: () => {},
  onSuccess: () => {},
};

/**
 * Cache staleness threshold (5 minutes)
 */
const STALE_TIME = 5 * 60 * 1000;

// ============================================================================
// MAIN HOOK
// ============================================================================

/**
 * Main dashboard hook
 *
 * Provides role-aware dashboard data with auto-refresh and period selection.
 *
 * @example
 * ```tsx
 * function Dashboard() {
 *   const {
 *     data,
 *     role,
 *     isLoading,
 *     error,
 *     refresh,
 *     changePeriod
 *   } = useDashboard({
 *     initialPeriod: 'month',
 *     autoRefresh: true
 *   });
 *
 *   if (isLoading) return <LoadingState />;
 *   if (error) return <ErrorState error={error} onRetry={refresh} />;
 *
 *   return <DashboardView data={data} />;
 * }
 * ```
 */
export function useDashboard(
  config: UseDashboardConfig = {}
): UseDashboardReturn {
  // Merge config with defaults
  const { initialPeriod, autoRefresh, refreshOnFocus, onError, onSuccess } = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  // Auth state
  const { user, isAuthenticated } = useAuthStore();
  const role = user?.userType ?? null;

  // Dashboard store
  const store = useDashboardStore();
  const {
    dashboardData,
    isLoading,
    error,
    lastRefresh,
    fetchDashboard,
    refreshDashboard,
    startAutoRefresh,
    stopAutoRefresh,
    clearError: storeClearError,
  } = store;

  // Current period (from store or default)
  const currentPeriod = initialPeriod;

  // Convert period to days
  const periodToDays = useCallback((period: DashboardPeriod): number => {
    return PERIOD_DAYS[period];
  }, []);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  /**
   * Check if data is empty
   */
  const isEmpty = useMemo(() => {
    if (!dashboardData) return true;

    // Check based on role
    if (role === 'freelancer' || role === 'employer') {
      return (
        !dashboardData.stats || Object.keys(dashboardData.stats).length === 0
      );
    }

    if (role === 'admin' || role === 'moderator') {
      return (
        !dashboardData.stats || Object.keys(dashboardData.stats).length === 0
      );
    }

    return true;
  }, [dashboardData, role]);

  /**
   * Check if data is stale
   */
  const isStale = useMemo(() => {
    if (!lastRefresh) return true;
    return Date.now() - lastRefresh.getTime() > STALE_TIME;
  }, [lastRefresh]);

  /**
   * Check if there's an error
   */
  const hasError = useMemo(() => error !== null, [error]);

  // ============================================================================
  // ACTIONS
  // ============================================================================

  /**
   * Refresh dashboard data
   */
  const refresh = useCallback(async () => {
    if (!isAuthenticated || !role || role === 'admin') return;

    try {
      await refreshDashboard();
      if (dashboardData && onSuccess) {
        onSuccess(dashboardData);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Refresh failed');
      if (onError) {
        onError(error);
      }
    }
  }, [
    isAuthenticated,
    role,
    refreshDashboard,
    dashboardData,
    onSuccess,
    onError,
  ]);

  /**
   * Change period and refetch
   */
  const changePeriod = useCallback(
    async (newPeriod: DashboardPeriod) => {
      if (!isAuthenticated || !role || role === 'admin') return;

      try {
        const days = periodToDays(newPeriod);
        await fetchDashboard(role, days);
        if (dashboardData && onSuccess) {
          onSuccess(dashboardData);
        }
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Period change failed');
        if (onError) {
          onError(error);
        }
      }
    },
    [
      isAuthenticated,
      role,
      fetchDashboard,
      periodToDays,
      dashboardData,
      onSuccess,
      onError,
    ]
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    storeClearError();
  }, [storeClearError]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Initial fetch on mount or role change
   */
  useEffect(() => {
    if (!isAuthenticated || !role || role === 'admin') return;

    // Fetch if no data or stale
    if (!dashboardData || isStale) {
      const days = periodToDays(initialPeriod);
      fetchDashboard(role, days);
    }
  }, [
    isAuthenticated,
    role,
    initialPeriod,
    dashboardData,
    isStale,
    fetchDashboard,
    periodToDays,
  ]);

  /**
   * Auto-refresh setup
   */
  useEffect(() => {
    if (!isAuthenticated || !role || role === 'admin' || !autoRefresh) return;

    startAutoRefresh();

    return () => {
      stopAutoRefresh();
    };
  }, [isAuthenticated, role, autoRefresh, startAutoRefresh, stopAutoRefresh]);

  /**
   * Visibility-based refresh
   */
  useEffect(() => {
    if (!isAuthenticated || !role || role === 'admin' || !refreshOnFocus) {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab hidden - stop auto-refresh
        stopAutoRefresh();
      } else {
        // Tab visible - restart auto-refresh and refresh stale data
        if (autoRefresh) {
          startAutoRefresh();
        }

        // Refresh if data is stale
        if (isStale) {
          refreshDashboard();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [
    isAuthenticated,
    role,
    refreshOnFocus,
    autoRefresh,
    isStale,
    startAutoRefresh,
    stopAutoRefresh,
    refreshDashboard,
  ]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Data
    data: dashboardData,
    role,
    period: currentPeriod,

    // States
    isLoading,
    isRefreshing: isLoading && !!dashboardData, // Refreshing if loading with existing data
    error,
    lastUpdated: lastRefresh,

    // Actions
    refresh,
    changePeriod,
    clearError,

    // Computed
    isEmpty,
    hasError,
    isStale,
  };
}

/**
 * Refresh-only hook for components that only need refresh functionality
 *
 * @example
 * ```tsx
 * function RefreshButton() {
 *   const { refresh, isRefreshing } = useDashboardRefresh();
 *
 *   return (
 *     <button onClick={refresh} disabled={isRefreshing}>
 *       {isRefreshing ? 'Refreshing...' : 'Refresh'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useDashboardRefresh() {
  const { refreshDashboard, isLoading } = useDashboardStore();
  const { isAuthenticated } = useAuthStore();

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    await refreshDashboard();
  }, [isAuthenticated, refreshDashboard]);

  return {
    refresh,
    isRefreshing: isLoading,
  };
}
