import { useEffect } from 'react';
import useDashboardStore from '@/lib/core/store/dashboard';
import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';

export function useDashboard() {
  const store = useDashboardStore();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user?.userType && user.userType !== 'admin') {
      store.fetchDashboard(user.userType);
      store.startAutoRefresh();
    }

    return () => {
      store.stopAutoRefresh();
    };
  }, [isAuthenticated, user?.userType, store]);

  // Handle visibility change for auto-refresh
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        store.stopAutoRefresh();
      } else if (
        isAuthenticated &&
        user?.userType &&
        user.userType !== 'admin'
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
  }, [isAuthenticated, user?.userType, store]);

  return {
    ...store,
    userType: user?.userType,
    isFreelancer: user?.userType === 'freelancer',
    isEmployer: user?.userType === 'employer',
  };
}

export function useDashboardRefresh() {
  const { refreshDashboard, isLoading } = useDashboardStore();

  return {
    refresh: refreshDashboard,
    isRefreshing: isLoading,
  };
}
