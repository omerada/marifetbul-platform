import { useCallback, useEffect } from 'react';
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

  // Auto-fetch dashboard data on mount
  useEffect(() => {
    if (!selectors.hasData && !selectors.isLoading) {
      fetchDashboard();
    }
  }, [fetchDashboard, selectors.hasData, selectors.isLoading]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(
      () => {
        if (selectors.hasData) {
          refreshDashboard();
        }
      },
      5 * 60 * 1000
    ); // 5 minutes

    return () => clearInterval(interval);
  }, [refreshDashboard, selectors.hasData]);

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
