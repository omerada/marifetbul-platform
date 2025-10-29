import { create } from 'zustand';
import { FreelancerDashboard, EmployerDashboard } from '@/types';
import { useAuthStore } from './domains/auth/authStore';
import { logger } from '@/lib/shared/utils/logger';
import { sellerDashboardApi } from '@/lib/api/seller-dashboard';
import { buyerDashboardApi } from '@/lib/api/buyer-dashboard';
import {
  transformSellerDashboardV2,
  transformBuyerDashboardV2,
} from '@/lib/api/transformers/dashboard';

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
  maxRetries: number; // Maximum retry attempts before giving up

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

  // Optimistic updates
  updateDashboardOptimistic: (
    updater: (
      data: FreelancerDashboard | EmployerDashboard
    ) => FreelancerDashboard | EmployerDashboard
  ) => void;
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
  maxRetries: 3, // Maximum 3 retry attempts

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

      // Use appropriate API client based on user type
      let dashboardData: FreelancerDashboard | EmployerDashboard;
      if (userType === 'freelancer') {
        const backendData =
          await sellerDashboardApi.getSellerDashboardByDays(days);
        dashboardData = transformSellerDashboardV2(backendData);
      } else if (userType === 'employer') {
        const backendData =
          await buyerDashboardApi.getBuyerDashboardByDays(days);
        dashboardData = transformBuyerDashboardV2(backendData);
      } else {
        throw new Error(`Unsupported user type: ${userType}`);
      }

      logger.debug('[Dashboard Store] Dashboard loaded successfully');

      set({
        dashboardData,
        isLoading: false,
        isRefreshing: false,
        lastRefresh: new Date(),
        error: null,
        retryCount: 0, // Reset retry count on success
      });
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
    const { retryCount, maxRetries } = get();

    if (retryCount >= maxRetries) {
      logger.warn('[Dashboard Store] Max retry attempts reached', {
        retryCount,
        maxRetries,
      });

      set({
        error: {
          message:
            'Maksimum deneme sayısına ulaşıldı. Lütfen sayfayı yenileyin.',
          code: 'MAX_RETRIES_EXCEEDED',
          timestamp: new Date(),
        },
      });
      return;
    }

    if (user?.userType && user.userType !== 'admin') {
      logger.debug('[Dashboard Store] Retry attempt', {
        userType: user.userType,
        attempt: retryCount + 1,
        maxRetries,
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

  // Optimistic update - Story 1.2
  updateDashboardOptimistic: (updater) => {
    const { dashboardData } = get();

    if (!dashboardData) {
      logger.warn(
        '[Dashboard Store] Cannot perform optimistic update - no data'
      );
      return;
    }

    logger.debug('[Dashboard Store] Performing optimistic update');

    try {
      const updatedData = updater(dashboardData);
      set({ dashboardData: updatedData });
    } catch (error) {
      logger.error(
        '[Dashboard Store] Optimistic update failed',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  },
}));

export default useDashboardStore;
