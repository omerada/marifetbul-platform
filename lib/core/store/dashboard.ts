import { create } from 'zustand';
import { FreelancerDashboard, EmployerDashboard } from '@/types';
import { useAuthStore } from './domains/auth/authStore';
import { logger } from '@/lib/shared/utils/logger';

// Enhanced error type for better error handling
export interface DashboardError {
  message: string;
  code?: string;
  details?: string;
  timestamp: Date;
}

interface DashboardStore {
  // State
  dashboardData: FreelancerDashboard | EmployerDashboard | null;
  isLoading: boolean;
  isRefreshing: boolean; // Separate state for refresh vs initial load
  error: DashboardError | null;
  lastRefresh: Date | null;
  refreshInterval: NodeJS.Timeout | null;
  retryCount: number; // Track retry attempts

  // Actions
  fetchDashboard: (
    userType: 'freelancer' | 'employer',
    days?: number
  ) => Promise<void>;
  refreshDashboard: () => Promise<void>;
  startAutoRefresh: () => void;
  stopAutoRefresh: () => void;
  clearError: () => void;
  resetDashboard: () => void;
  retry: () => Promise<void>; // Manual retry action
}

const useDashboardStore = create<DashboardStore>((set, get) => ({
  // Initial state
  dashboardData: null,
  isLoading: false,
  isRefreshing: false,
  error: null,
  lastRefresh: null,
  refreshInterval: null,
  retryCount: 0,

  // Fetch dashboard data
  fetchDashboard: async (
    userType: 'freelancer' | 'employer',
    days: number = 30
  ) => {
    const { retryCount } = get();
    const isRetry = retryCount > 0;

    set({
      isLoading: !isRetry, // Don't show loading on retry
      isRefreshing: isRetry,
      error: null,
    });

    try {
      const authState = useAuthStore.getState();
      if (!authState.isAuthenticated) {
        throw new Error('Kullanıcı girişi gerekli');
      }

      logger.debug('[Dashboard Store] Fetching dashboard', {
        userType,
        days,
        isRetry,
      });

      const url = `/api/dashboard/${userType}?days=${days}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        // Handle specific HTTP errors
        if (response.status === 401) {
          throw new Error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        } else if (response.status === 403) {
          throw new Error('Bu sayfaya erişim yetkiniz yok.');
        } else if (response.status === 404) {
          throw new Error('Dashboard servisi bulunamadı.');
        } else if (response.status >= 500) {
          throw new Error('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
        }
      }

      const data = await response.json();

      if (data.success && data.data) {
        logger.debug('[Dashboard Store] Dashboard loaded successfully');

        set({
          dashboardData: data.data,
          isLoading: false,
          isRefreshing: false,
          lastRefresh: new Date(),
          error: null,
          retryCount: 0, // Reset retry count on success
        });
      } else {
        const errorMessage =
          data.error || data.message || 'Dashboard verisi yüklenemedi';

        logger.error('[Dashboard Store] Dashboard fetch failed', {
          error: errorMessage,
        });

        set({
          error: {
            message: errorMessage,
            code: data.code,
            details: data.details,
            timestamp: new Date(),
          },
          isLoading: false,
          isRefreshing: false,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';

      logger.error(
        '[Dashboard Store] Dashboard fetch error',
        error instanceof Error ? error : new Error(String(error))
      );

      set({
        error: {
          message: errorMessage,
          timestamp: new Date(),
        },
        isLoading: false,
        isRefreshing: false,
      });
    }
  },

  // Refresh dashboard
  refreshDashboard: async () => {
    const { user } = useAuthStore.getState();
    const { retryCount } = get();

    if (user?.userType && user.userType !== 'admin') {
      logger.debug('[Dashboard Store] Refreshing dashboard', {
        userType: user.userType,
      });

      set({ isRefreshing: true, retryCount: retryCount + 1 });
      await get().fetchDashboard(user.userType);
    }
  },

  // Manual retry action
  retry: async () => {
    const { user } = useAuthStore.getState();
    const { retryCount } = get();

    if (user?.userType && user.userType !== 'admin') {
      logger.debug('[Dashboard Store] Retry attempt', {
        userType: user.userType,
        attempt: retryCount + 1,
      });

      set({ retryCount: retryCount + 1 });
      await get().fetchDashboard(user.userType);
    }
  },

  // Start auto-refresh (every 5 minutes)
  startAutoRefresh: () => {
    const { refreshInterval } = get();

    // Clear existing interval
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }

    logger.debug('[Dashboard Store] Starting auto-refresh (5 min interval)');

    // Set new interval - 5 minutes
    const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000;
    const newInterval = setInterval(() => {
      get().refreshDashboard();
    }, AUTO_REFRESH_INTERVAL);

    set({ refreshInterval: newInterval });
  },

  // Stop auto-refresh
  stopAutoRefresh: () => {
    const { refreshInterval } = get();
    if (refreshInterval) {
      clearInterval(refreshInterval);
      set({ refreshInterval: null });
    }
  },

  // Clear error
  clearError: () => {
    logger.debug('[Dashboard Store] Clearing error');
    set({ error: null, retryCount: 0 });
  },

  // Reset dashboard state
  resetDashboard: () => {
    const { refreshInterval } = get();

    logger.debug('[Dashboard Store] Resetting dashboard');

    // Stop auto-refresh
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }

    set({
      dashboardData: null,
      isLoading: false,
      isRefreshing: false,
      error: null,
      lastRefresh: null,
      refreshInterval: null,
      retryCount: 0,
    });
  },
}));

export default useDashboardStore;
