import { create } from 'zustand';
import { FreelancerDashboard, EmployerDashboard } from '@/types';
import type { ModeratorDashboard } from '@/components/domains/dashboard/types/dashboard.types';
import { useUnifiedAuthStore } from './domains/auth/unifiedAuthStore';
import logger from '@/lib/infrastructure/monitoring/logger';
import { sellerDashboardApi } from '@/lib/api/seller-dashboard';
import { buyerDashboardApi } from '@/lib/api/buyer-dashboard';
import { moderatorDashboardApi } from '@/lib/api/moderator-dashboard';
import {
  adaptFreelancerDashboard,
  adaptEmployerDashboard,
  adaptModeratorDashboard,
} from '@/components/domains/dashboard/utils/dashboardAdapters';

// Enhanced error type for better error handling
export interface DashboardError {
  message: string;
  code?: string;
  details?: string;
  timestamp: Date;
}

// Unified dashboard data type
export type UnifiedDashboardData =
  | FreelancerDashboard
  | EmployerDashboard
  | ModeratorDashboard;

interface DashboardStore {
  // State
  dashboardData: UnifiedDashboardData | null;
  isLoading: boolean;
  isRefreshing: boolean; // Separate state for refresh vs initial load
  error: DashboardError | null;
  lastRefresh: Date | null;
  refreshInterval: NodeJS.Timeout | null;
  retryCount: number; // Track retry attempts
  maxRetries: number; // Maximum retry attempts before giving up

  // Actions
  fetchDashboard: (
    userType: 'freelancer' | 'employer' | 'moderator',
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
    updater: (data: UnifiedDashboardData) => UnifiedDashboardData
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
    userType: 'freelancer' | 'employer' | 'moderator',
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
      const authState = useUnifiedAuthStore.getState();
      if (!authState.isAuthenticated) {
        throw new Error('Kullanıcı girişi gerekli');
      }

      logger.debug('[Dashboard Store] Fetching dashboard', {
        userType,
        days,
        isRetry,
      });

      // Use appropriate API client based on user type
      let dashboardData: UnifiedDashboardData;

      if (userType === 'freelancer') {
        const backendData =
          await sellerDashboardApi.getSellerDashboardByDays(days);
        dashboardData = adaptFreelancerDashboard(backendData);
      } else if (userType === 'employer') {
        const backendData =
          await buyerDashboardApi.getBuyerDashboardByDays(days);
        dashboardData = adaptEmployerDashboard(backendData);
      } else if (userType === 'moderator') {
        // SPRINT 1 - Story 2: MODERATOR Dashboard Support
        // Using new unified moderator dashboard API
        logger.debug('[Dashboard Store] Fetching moderator dashboard data');

        // Fetch complete moderator dashboard (stats + pending + activities)
        const moderatorData = await moderatorDashboardApi.getDashboard();

        // Transform to ModeratorDashboard format
        dashboardData = adaptModeratorDashboard({
          stats: moderatorData.stats,
          pendingItems: moderatorData.pendingItems.items || [],
          activities: moderatorData.recentActivities.activities || [],
          periodDays: days,
        });
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
    const { user } = useUnifiedAuthStore.getState();
    const { retryCount } = get();

    // Normalize role to userType
    const normalizedUserType =
      user?.role === 'MODERATOR' ? 'moderator' : user?.userType;

    if (normalizedUserType && normalizedUserType !== 'admin') {
      logger.debug('[Dashboard Store] Refreshing dashboard', {
        role: user?.role,
        userType: normalizedUserType,
      });

      set({ isRefreshing: true, retryCount: retryCount + 1 });
      await get().fetchDashboard(normalizedUserType);
    }
  },

  // Manual retry action
  retry: async () => {
    const { user } = useUnifiedAuthStore.getState();
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

    // Normalize role to userType
    const normalizedUserType =
      user?.role === 'MODERATOR' ? 'moderator' : user?.userType;

    if (normalizedUserType && normalizedUserType !== 'admin') {
      logger.debug('[Dashboard Store] Retry attempt', {
        role: user?.role,
        userType: normalizedUserType,
        attempt: retryCount + 1,
        maxRetries,
      });

      set({ retryCount: retryCount + 1 });
      await get().fetchDashboard(normalizedUserType);
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
