'use client';

/**
 * useAdminDashboard Hook - Production Ready
 *
 * Provides admin dashboard data and actions with full backend integration
 *
 * @module hooks/business/useAdminDashboard
 * @refactored 2025-10-18
 */

import { useCallback, useEffect, useRef } from 'react';
import {
  useAdminDashboardStore,
  useAdminDashboardSelectors,
} from '@/lib/core/store/admin-dashboard';
import logger from '@/lib/infrastructure/monitoring/logger';

/**
 * Hook for admin dashboard functionality
 *
 * Features:
 * - Auto-fetch on mount
 * - Auto-refresh every 5 minutes
 * - Error handling
 * - Loading states
 * - Real-time data from backend
 */
export function useAdminDashboard() {
  const { fetchDashboard, refreshDashboard, refreshAllDashboards, clearError } =
    useAdminDashboardStore();

  const selectors = useAdminDashboardSelectors();
  const hasInitialized = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-fetch dashboard data on mount (only once)
  useEffect(() => {
    if (!hasInitialized.current && !selectors.hasData && !selectors.isLoading) {
      logger.debug('🔄 Admin Dashboard: Initial fetch (30 days)');
      hasInitialized.current = true;
      fetchDashboard(30);
    }
  }, [fetchDashboard, selectors.hasData, selectors.isLoading]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Only setup interval if we have data
    if (selectors.hasData) {
      logger.debug(
        '⏰ Admin Dashboard: Setting up auto-refresh (5min interval)'
      );
      intervalRef.current = setInterval(
        () => {
          logger.debug('🔄 Admin Dashboard: Auto-refresh triggered');
          refreshDashboard();
        },
        5 * 60 * 1000
      ); // 5 minutes
    }

    // Cleanup
    return () => {
      if (intervalRef.current) {
        logger.debug('🧹 Admin Dashboard: Cleaning up auto-refresh');
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [selectors.hasData, refreshDashboard]);

  /**
   * Manual refresh handler
   */
  const handleRefresh = useCallback(async () => {
    try {
      logger.info('🔄 Manual dashboard refresh initiated');
      await refreshDashboard();
    } catch (error) {
      logger.error(
        'Dashboard refresh failed',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }, [refreshDashboard]);

  /**
   * Force backend cache refresh
   */
  const handleRefreshAll = useCallback(async () => {
    try {
      logger.info('🔄 Backend cache refresh initiated');
      const success = await refreshAllDashboards();
      return success;
    } catch (error) {
      logger.error(
        'Backend cache refresh failed',
        error instanceof Error ? error : new Error(String(error))
      );
      return false;
    }
  }, [refreshAllDashboards]);

  return {
    // Data selectors
    stats: selectors.stats,
    searchMetrics: selectors.searchMetrics,
    systemHealth: selectors.systemHealth,
    trends: selectors.trends,
    topPackages: selectors.topPackages,
    backendData: selectors.backendData,

    // Computed values
    isHealthy: selectors.isHealthy,
    systemStatus: selectors.systemStatus,
    totalUsers: selectors.totalUsers,
    totalRevenue: selectors.totalRevenue,
    activeUsers: selectors.activeUsers,
    pendingOrders: selectors.pendingOrders,

    // Search metrics computed (Sprint 1 - Story 1.3.3)
    hasSearchData: selectors.hasSearchData,
    totalSearches: selectors.totalSearches,
    searchCTR: selectors.searchCTR,
    searchConversionRate: selectors.searchConversionRate,
    zeroResultRate: selectors.zeroResultRate,

    // Chart data
    hasChartData: selectors.hasChartData,
    revenueChartData: selectors.revenueChartData,
    ordersChartData: selectors.ordersChartData,
    usersChartData: selectors.usersChartData,

    // Metadata
    periodDays: selectors.periodDays,
    periodStart: selectors.periodStart,
    periodEnd: selectors.periodEnd,
    generatedAt: selectors.generatedAt,
    fromCache: selectors.fromCache,

    // UI State
    isLoading: selectors.isLoading,
    error: selectors.error,
    lastUpdated: selectors.lastUpdated,
    hasData: selectors.hasData,

    // Actions
    refresh: handleRefresh,
    refreshAll: handleRefreshAll,
    clearError,

    // Alerts summary for header (computed from system health)
    alertsSummary: {
      total: !selectors.isHealthy ? 1 : 0, // Show 1 if system has issues
      critical: selectors.systemHealth?.status === 'critical' ? 1 : 0, // Critical if status is critical
      unread: !selectors.isHealthy ? 1 : 0, // Unread if system not healthy
    },

    // Legacy compatibility (for gradual migration)
    healthStatus: {
      isHealthy: selectors.isHealthy,
      status: selectors.systemStatus,
      hasIssues: !selectors.isHealthy,
    },

    statsSummary: {
      usersGrowth: selectors.stats?.userGrowthRate || 0,
      revenueGrowth: selectors.stats?.revenueGrowthRate || 0,
      conversionRate: selectors.stats?.conversionRate || 0,
      retentionRate: selectors.stats?.repeatPurchaseRate || 0,
    },
  };
}

export default useAdminDashboard;
