'use client';

import { useEffect } from 'react';
import useDashboardStore from '@/lib/core/store/dashboard';
import { useAuthStore } from '@/lib/core/store/domains/auth/unifiedAuthStore';
import logger from '@/lib/infrastructure/monitoring/logger';

/**
 * Main dashboard hook with role-based data fetching
 *
 * Supports:
 * - FREELANCER → Seller Dashboard
 * - EMPLOYER → Buyer Dashboard
 * - MODERATOR → Moderation Stats
 * - ADMIN → Admin Dashboard (use useAdminDashboard separately)
 *
 * @version 2.0.0
 * @production-ready ✅
 */
export function useDashboard() {
  const store = useDashboardStore();
  const { user, isAuthenticated } = useAuthStore();

  // Normalize role from backend (ADMIN, MODERATOR, etc.) to userType
  const normalizedUserType =
    user?.role === 'MODERATOR' ? 'moderator' : user?.userType;

  useEffect(() => {
    // Skip admin - they have their own dashboard hook (useAdminDashboard)
    if (
      isAuthenticated &&
      normalizedUserType &&
      normalizedUserType !== 'admin'
    ) {
      logger.debug('[useDashboard] Initializing dashboard', {
        role: user?.role,
        userType: normalizedUserType,
      });

      store.fetchDashboard(normalizedUserType);
      store.startAutoRefresh();
    }

    return () => {
      store.stopAutoRefresh();
    };
  }, [isAuthenticated, normalizedUserType, store, user?.role]);

  // Handle visibility change for auto-refresh
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        store.stopAutoRefresh();
      } else if (
        isAuthenticated &&
        normalizedUserType &&
        normalizedUserType !== 'admin'
      ) {
        store.startAutoRefresh();
        // Refresh when user comes back to tab
        store.refreshDashboard();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, normalizedUserType, store]);

  return {
    ...store,
    userType: normalizedUserType,
    isFreelancer: normalizedUserType === 'freelancer',
    isEmployer: normalizedUserType === 'employer',
    isModerator: normalizedUserType === 'moderator',
    isAdmin: normalizedUserType === 'admin',
  };
}
