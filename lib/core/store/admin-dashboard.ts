/**
 * Admin Dashboard Store - Refactored for Backend Integration
 *
 * Production-ready admin dashboard state management with:
 * - Full backend API integration
 * - Type-safe data handling
 * - Comprehensive error handling
 * - Real-time data updates
 * - No mock/demo data
 *
 * @module lib/core/store/admin-dashboard
 * @refactored 2025-10-18
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  adminDashboardApi,
  type AdminDashboardBackendDto,
} from '@/lib/api/admin-dashboard';
import logger from '@/lib/infrastructure/monitoring/logger';
import { networkStatus } from '@/lib/shared/utils/networkStatus';

/**
 * Frontend Dashboard State (transformed from backend DTO)
 */
export interface AdminDashboardState {
  // Raw backend data
  backendData: AdminDashboardBackendDto | null;

  // Transformed stats for UI
  stats: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    userGrowthRate: number;

    totalPackages: number;
    activePackages: number;
    newPackages: number;

    totalRevenue: number;
    netRevenue: number;
    platformFee: number;
    revenueGrowthRate: number;

    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    completionRate: number;

    averageOrderValue: number;
    conversionRate: number;
    repeatPurchaseRate: number;
    customerSatisfaction: number;
  } | null;

  // Search metrics (Sprint 1 - Story 1.3.3)
  searchMetrics: {
    totalSearches: number;
    uniqueSearchers: number;
    zeroResultSearches: number;
    zeroResultRate: number;
    clickThroughRate: number;
    searchToOrderConversionRate: number;
    conversionRate: number;
    averageResultCount: number;
    topKeywords: string[];
    zeroResultKeywords: string[];
  } | null;

  // System health
  systemHealth: {
    status: 'healthy' | 'warning' | 'critical' | 'unknown';
    databaseHealthy: boolean;
    elasticsearchHealthy: boolean;
    uptime: number; // seconds
    responseTime: number; // ms
    heapUsagePercent: number;
    activeConnections: number;
    errorRate: number;
    memoryUsage: number; // percentage
    cpuUsage: number; // percentage (not available in backend yet)
    diskUsage: number; // percentage (not available in backend yet)
    lastCheck: string;
  } | null;

  // Chart data for trends
  trends: {
    dailyRevenue: Array<{ date: string; value: number }>;
    dailyOrders: Array<{ date: string; value: number }>;
    dailyUsers: Array<{ date: string; value: number }>;
    dailyPackageViews: Array<{ date: string; value: number }>;
  } | null;

  // Top performers
  topPackages: Array<{
    packageId: string;
    title: string;
    sellerName: string;
    views: number;
    orders: number;
    revenue: number;
  }> | null;

  // Metadata
  periodDays: number;
  periodStart: string | null;
  periodEnd: string | null;
  generatedAt: string | null;
  fromCache: boolean;

  // UI State
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

/**
 * Admin Dashboard Store Actions
 */
export interface AdminDashboardActions {
  // Data fetching
  fetchDashboard: (days?: number) => Promise<void>;
  fetchDashboardRealtime: () => Promise<void>;
  refreshDashboard: () => Promise<void>;

  // Actions
  refreshAllDashboards: () => Promise<boolean>;

  // Auto-refresh management
  startAutoRefresh: (intervalMs?: number) => void;
  stopAutoRefresh: () => void;

  // State management
  clearError: () => void;
  reset: () => void;
}

/**
 * Complete Store Interface
 */
export type AdminDashboardStore = AdminDashboardState & AdminDashboardActions;

/**
 * Initial State
 */
const initialState: AdminDashboardState = {
  backendData: null,
  stats: null,
  searchMetrics: null,
  systemHealth: null,
  trends: null,
  topPackages: null,
  periodDays: 30,
  periodStart: null,
  periodEnd: null,
  generatedAt: null,
  fromCache: false,
  isLoading: false,
  error: null,
  lastUpdated: null,
};

/**
 * Transform backend DTO to frontend state
 */
function transformBackendData(
  dto: AdminDashboardBackendDto
): Omit<AdminDashboardState, 'isLoading' | 'error' | 'lastUpdated'> {
  return {
    backendData: dto,

    stats: {
      // User metrics
      totalUsers: dto.userMetrics?.totalUsers || 0,
      activeUsers: dto.userMetrics?.activeUsers || 0,
      newUsers: dto.userMetrics?.newUsers || 0,
      userGrowthRate: dto.userMetrics?.userGrowthRate || 0,

      // Package metrics
      totalPackages: dto.packageMetrics?.totalPackages || 0,
      activePackages: dto.packageMetrics?.activePackages || 0,
      newPackages: dto.packageMetrics?.newPackages || 0,

      // Revenue metrics
      totalRevenue: Number(dto.revenueMetrics?.totalRevenue) || 0,
      netRevenue: Number(dto.revenueMetrics?.netRevenue) || 0,
      platformFee: Number(dto.revenueMetrics?.platformFee) || 0,
      revenueGrowthRate: dto.revenueMetrics?.revenueGrowthRate || 0,

      // Order metrics
      totalOrders: dto.orderMetrics?.totalOrders || 0,
      completedOrders: dto.orderMetrics?.completedOrders || 0,
      pendingOrders: dto.orderMetrics?.pendingOrders || 0,
      completionRate: dto.orderMetrics?.completionRate || 0,

      // Business metrics
      averageOrderValue: Number(dto.revenueMetrics?.averageOrderValue) || 0,
      conversionRate: dto.businessMetrics?.conversionRate || 0,
      repeatPurchaseRate: dto.businessMetrics?.repeatPurchaseRate || 0,
      customerSatisfaction: dto.businessMetrics?.customerSatisfactionScore || 0,
    },

    // Search metrics (Sprint 1 - Story 1.3.3)
    searchMetrics: dto.searchMetrics
      ? {
          totalSearches: dto.searchMetrics.totalSearches || 0,
          uniqueSearchers: dto.searchMetrics.uniqueSearchers || 0,
          zeroResultSearches: dto.searchMetrics.zeroResultSearches || 0,
          zeroResultRate: dto.searchMetrics.zeroResultRate || 0,
          clickThroughRate: dto.searchMetrics.clickThroughRate || 0,
          searchToOrderConversionRate:
            dto.searchMetrics.searchToOrderConversionRate || 0,
          conversionRate: dto.searchMetrics.conversionRate || 0,
          averageResultCount: dto.searchMetrics.averageResultCount || 0,
          topKeywords: dto.searchMetrics.topKeywords || [],
          zeroResultKeywords: dto.searchMetrics.zeroResultKeywords || [],
        }
      : null,

    systemHealth: {
      status:
        dto.systemHealth?.systemStatus === 'HEALTHY'
          ? 'healthy'
          : dto.systemHealth?.systemStatus === 'DEGRADED'
            ? 'warning'
            : dto.systemHealth?.systemStatus === 'DOWN'
              ? 'critical'
              : 'unknown',
      databaseHealthy: dto.systemHealth?.databaseHealthy || false,
      elasticsearchHealthy: dto.systemHealth?.elasticsearchHealthy || false,
      uptime: dto.systemHealth?.uptimeSeconds || 0,
      responseTime: dto.activityMetrics?.averageResponseTime || 0,
      heapUsagePercent: dto.systemHealth?.heapUsagePercent || 0,
      activeConnections: dto.systemHealth?.activeConnections || 0,
      errorRate: dto.activityMetrics?.errorRate || 0,
      memoryUsage: dto.systemHealth?.heapUsagePercent || 0,
      cpuUsage: 0, // Not available in backend DTO yet
      diskUsage: 0, // Not available in backend DTO yet
      lastCheck: dto.generatedAt || new Date().toISOString(),
    },

    trends: dto.trends || null,

    topPackages: dto.packageMetrics?.topPackages || null,

    periodDays: dto.periodDays || 30,
    periodStart: dto.periodStart || null,
    periodEnd: dto.periodEnd || null,
    generatedAt: dto.generatedAt || null,
    fromCache: dto.fromCache || false,
  };
}

/**
 * Admin Dashboard Store with Devtools & Immer
 *
 * Features:
 * - Backend API integration
 * - Automatic retry logic (via apiClient)
 * - Offline detection and graceful degradation
 * - Auto-refresh with network-aware pausing
 * - Type-safe state management
 */

// Auto-refresh interval reference (outside store for cleanup)
let autoRefreshInterval: NodeJS.Timeout | null = null;
let networkStatusUnsubscribe: (() => void) | null = null;

export const useAdminDashboardStore = create<AdminDashboardStore>()(
  devtools(
    immer((set, get) => ({
      ...initialState,

      // Fetch dashboard for specified days
      fetchDashboard: async (days = 30) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          logger.debug(`📊 Fetching admin dashboard for last ${days} days`);

          const backendData =
            await adminDashboardApi.getAdminDashboardByDays(days);
          const transformedData = transformBackendData(backendData);

          set((state) => {
            Object.assign(state, transformedData);
            state.isLoading = false;
            state.lastUpdated = new Date().toISOString();
            state.error = null;
          });

          logger.info(
            `✅ Admin dashboard loaded successfully (${days} days, from cache: ${backendData.fromCache})`
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Dashboard verisi alınamadı';
          logger.error(
            '❌ Admin dashboard fetch failed',
            error instanceof Error ? error : new Error(String(error))
          );

          set((state) => {
            state.isLoading = false;
            state.error = errorMessage;
          });

          // Don't re-throw - let components handle via state
        }
      },

      // Fetch real-time dashboard (last 24 hours)
      fetchDashboardRealtime: async () => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          logger.debug('📊 Fetching real-time admin dashboard');

          const backendData =
            await adminDashboardApi.getAdminDashboardRealtime();
          const transformedData = transformBackendData(backendData);

          set((state) => {
            Object.assign(state, transformedData);
            state.isLoading = false;
            state.lastUpdated = new Date().toISOString();
            state.error = null;
          });

          logger.info('✅ Real-time admin dashboard loaded successfully');
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Dashboard verisi alınamadı';
          logger.error(
            '❌ Real-time dashboard fetch failed',
            error instanceof Error ? error : new Error(String(error))
          );

          set((state) => {
            state.isLoading = false;
            state.error = errorMessage;
          });

          // Don't re-throw - let components handle via state
        }
      },

      // Refresh current dashboard
      refreshDashboard: async () => {
        const { periodDays, fetchDashboard } = get();
        logger.debug(`🔄 Refreshing admin dashboard (${periodDays} days)`);
        await fetchDashboard(periodDays);
      },

      // Refresh all dashboard caches on backend
      refreshAllDashboards: async () => {
        try {
          logger.debug('🔄 Requesting backend dashboard cache refresh');
          const success = await adminDashboardApi.refreshAllDashboards();

          if (success) {
            logger.info('✅ Backend dashboard caches refreshed successfully');
            // Re-fetch current dashboard
            await get().refreshDashboard();
          }

          return success;
        } catch (error) {
          logger.error(
            '❌ Dashboard cache refresh failed',
            error instanceof Error ? error : new Error(String(error))
          );
          return false;
        }
      },

      // Clear error
      clearError: () => {
        set((state) => {
          state.error = null;
        });
      },

      // Reset to initial state
      reset: () => {
        // Clean up auto-refresh
        get().stopAutoRefresh();
        set(initialState);
      },

      // Start auto-refresh with network awareness
      startAutoRefresh: (intervalMs = 30000) => {
        // Clean up existing interval
        if (autoRefreshInterval) {
          clearInterval(autoRefreshInterval);
        }

        logger.info(`🔄 Starting auto-refresh (interval: ${intervalMs}ms)`);

        // Set up network status monitoring
        networkStatusUnsubscribe = networkStatus.subscribe((status) => {
          logger.debug(`📡 Network status changed: ${status}`);

          if (status === 'offline') {
            // Pause auto-refresh when offline
            logger.warn('⏸️ Pausing auto-refresh - network offline');
            if (autoRefreshInterval) {
              clearInterval(autoRefreshInterval);
              autoRefreshInterval = null;
            }
          } else if (status === 'online' && !autoRefreshInterval) {
            // Resume auto-refresh when back online
            logger.info('▶️ Resuming auto-refresh - network online');
            autoRefreshInterval = setInterval(() => {
              const currentStatus = networkStatus.getStatus();
              if (currentStatus !== 'offline') {
                get().fetchDashboard(get().periodDays);
              }
            }, intervalMs);
          }
        });

        // Start initial interval
        autoRefreshInterval = setInterval(() => {
          const currentStatus = networkStatus.getStatus();
          if (currentStatus !== 'offline') {
            get().fetchDashboard(get().periodDays);
          } else {
            logger.debug('⏭️ Skipping auto-refresh - network offline');
          }
        }, intervalMs);
      },

      // Stop auto-refresh
      stopAutoRefresh: () => {
        logger.info('🛑 Stopping auto-refresh');

        if (autoRefreshInterval) {
          clearInterval(autoRefreshInterval);
          autoRefreshInterval = null;
        }

        if (networkStatusUnsubscribe) {
          networkStatusUnsubscribe();
          networkStatusUnsubscribe = null;
        }
      },
    })),
    {
      name: 'admin-dashboard',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

/**
 * Selectors for computed values
 */
export const useAdminDashboardSelectors = () => {
  const store = useAdminDashboardStore();

  return {
    // Raw data
    backendData: store.backendData,

    // Stats
    stats: store.stats,
    searchMetrics: store.searchMetrics,
    systemHealth: store.systemHealth,
    trends: store.trends,
    topPackages: store.topPackages,

    // Computed values
    isHealthy: store.systemHealth?.status === 'healthy',
    systemStatus: store.systemHealth?.status || 'unknown',
    totalUsers: store.stats?.totalUsers || 0,
    totalRevenue: store.stats?.totalRevenue || 0,
    activeUsers: store.stats?.activeUsers || 0,
    pendingOrders: store.stats?.pendingOrders || 0,

    // Search metrics computed (Sprint 1 - Story 1.3.3)
    hasSearchData: !!store.searchMetrics,
    totalSearches: store.searchMetrics?.totalSearches || 0,
    searchCTR: store.searchMetrics?.clickThroughRate || 0,
    searchConversionRate: store.searchMetrics?.searchToOrderConversionRate || 0,
    zeroResultRate: store.searchMetrics?.zeroResultRate || 0,

    // Chart data
    hasChartData: !!store.trends,
    revenueChartData: store.trends?.dailyRevenue || [],
    ordersChartData: store.trends?.dailyOrders || [],
    usersChartData: store.trends?.dailyUsers || [],

    // Metadata
    periodDays: store.periodDays,
    periodStart: store.periodStart,
    periodEnd: store.periodEnd,
    generatedAt: store.generatedAt,
    fromCache: store.fromCache,

    // UI State
    isLoading: store.isLoading,
    error: store.error,
    lastUpdated: store.lastUpdated,
    hasData: !!store.backendData,
  };
};

export default useAdminDashboardStore;
