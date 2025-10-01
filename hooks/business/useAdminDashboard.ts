import { useCallback, useEffect, useRef } from 'react';
import {
  useAdminDashboardStore,
  useAdminDashboardSelectors,
} from '@/lib/core/store/admin-dashboard';

/**
 * Hook for admin dashboard functionality
 */
export function useAdminDashboard() {
  const {
    fetchDashboard,
    refreshDashboard,
    markAlertAsRead,
    dismissAlert,
    clearError,
  } = useAdminDashboardStore();

  const selectors = useAdminDashboardSelectors();
  const hasInitialized = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-fetch dashboard data on mount (only once)
  useEffect(() => {
    if (!hasInitialized.current && !selectors.hasData && !selectors.isLoading) {
      console.log('🔄 Admin Dashboard: Initial fetch');
      hasInitialized.current = true;
      fetchDashboard();
    }
  }, [fetchDashboard, selectors.hasData, selectors.isLoading]);

  // Auto-refresh every 5 minutes (setup once)
  useEffect(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Only setup interval if we have data
    if (selectors.hasData) {
      console.log('⏰ Admin Dashboard: Setting up auto-refresh interval');
      intervalRef.current = setInterval(
        () => {
          console.log('🔄 Admin Dashboard: Auto-refresh triggered');
          refreshDashboard();
        },
        5 * 60 * 1000
      ); // 5 minutes
    }

    // Cleanup
    return () => {
      if (intervalRef.current) {
        console.log('🧹 Admin Dashboard: Cleaning up auto-refresh interval');
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [selectors.hasData, refreshDashboard]); // Include refreshDashboard dependency

  const handleAlertAction = useCallback(
    async (alertId: string, action: 'read' | 'dismiss') => {
      try {
        if (action === 'read') {
          await markAlertAsRead(alertId);
        } else {
          await dismissAlert(alertId);
        }
      } catch (error) {
        console.error('Alert action failed:', error);
      }
    },
    [markAlertAsRead, dismissAlert]
  );

  const handleRefresh = useCallback(async () => {
    try {
      await refreshDashboard();
    } catch (error) {
      console.error('Dashboard refresh failed:', error);
    }
  }, [refreshDashboard]);

  return {
    // Data
    ...selectors,

    // Actions
    refresh: handleRefresh,
    alertAction: handleAlertAction,
    clearError,

    // Computed values
    healthStatus: {
      isHealthy: selectors.isHealthy,
      status: selectors.systemStatus,
      hasIssues: (selectors.systemHealth?.issues?.length ?? 0) > 0,
    },

    alertsSummary: {
      total: selectors.alerts.length,
      unread: selectors.unreadAlerts.length,
      critical: selectors.criticalAlerts.length,
    },

    statsSummary: {
      usersGrowth: selectors.stats?.revenueGrowth || 0,
      revenueGrowth: selectors.stats?.revenueGrowth || 0,
      conversionRate: selectors.stats?.conversionRate || 0,
      retentionRate: selectors.stats?.userRetentionRate || 0,
    },
  };
}

export default useAdminDashboard;
