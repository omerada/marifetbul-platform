/**
 * Admin Dashboard API Client
 *
 * Provides type-safe API calls to backend dashboard endpoints
 * Handles authentication, error handling, and response transformation
 *
 * @module lib/api/admin-dashboard
 * @created 2025-10-18
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import type { ApiResponse } from '@/types/shared/api';

/**
 * Backend DTO Types (matching Java DTOs)
 */
export interface AdminDashboardBackendDto {
  periodStart: string;
  periodEnd: string;
  periodDays: number;

  userMetrics: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    dailyActiveUsers: number;
    monthlyActiveUsers: number;
    dauMauRatio: number;
    totalSellers: number;
    activeSellers: number;
    totalBuyers: number;
    activeBuyers: number;
    usersByRole: Record<string, number>;
    userGrowthRate: number;
  };

  revenueMetrics: {
    totalRevenue: number;
    platformFee: number;
    sellerEarnings: number;
    netRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    totalRefunds: number;
    refundAmount: number;
    refundRate: number;
    revenueGrowth: number;
    revenueGrowthRate: number;
    revenueByCategory: Record<string, number>;
    revenueByPaymentMethod: Record<string, number>;
  };

  packageMetrics: {
    totalPackages: number;
    activePackages: number;
    newPackages: number;
    totalViews: number;
    uniqueViewers: number;
    totalFavorites: number;
    totalShares: number;
    averageConversionRate: number;
    packagesByCategory: Record<string, number>;
    packagesByStatus: Record<string, number>;
    topPackages: Array<{
      packageId: string;
      title: string;
      sellerName: string;
      views: number;
      orders: number;
      revenue: number;
    }>;
  };

  orderMetrics: {
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    cancelledOrders: number;
    refundedOrders: number;
    completionRate: number;
    cancellationRate: number;
    totalOrderValue: number;
    averageOrderValue: number;
    ordersByStatus: Record<string, number>;
    ordersByCategory: Record<string, number>;
  };

  searchMetrics?: {
    totalSearches: number;
    uniqueSearchers: number;
    zeroResultSearches: number;
    zeroResultRate: number;
    clickThroughRate: number;
    searchToOrderConversionRate: number;
    topKeywords: string[];
    zeroResultKeywords: string[];
    searchesByCategory: Record<string, number>;
  };

  activityMetrics?: {
    totalActivities: number;
    apiCalls: number;
    pageViews: number;
    averageResponseTime: number;
    slowRequests: number;
    errorRequests: number;
    errorRate: number;
    activitiesByType: Record<string, number>;
    activitiesByCategory: Record<string, number>;
    activitiesByHour: Record<number, number>;
  };

  systemHealth: {
    databaseHealthy: boolean;
    elasticsearchHealthy: boolean;
    systemStatus: 'HEALTHY' | 'DEGRADED' | 'DOWN';
    activeConnections: number;
    idleConnections: number;
    heapMemoryUsed: number;
    heapMemoryMax: number;
    heapUsagePercent: number;
    uptimeSeconds: number;
  };

  businessMetrics: {
    conversionRate: number;
    repeatPurchaseRate: number;
    averageLifetimeValue: number;
    customerSatisfactionScore: number;
    totalReviews: number;
    averageRating: number;
    totalMessages: number;
    responseRate: number;
  };

  trends: {
    dailyRevenue: Array<{ date: string; value: number }>;
    dailyOrders: Array<{ date: string; value: number }>;
    dailyUsers: Array<{ date: string; value: number }>;
    dailyPackageViews: Array<{ date: string; value: number }>;
  };

  generatedAt: string;
  fromCache: boolean;
  cacheAgeSeconds?: number;
}

/**
 * Platform Snapshot Response (quick metrics for header)
 */
export interface PlatformSnapshotDto {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  todayRevenue: number;
  pendingOrders: number;
  systemStatus: 'HEALTHY' | 'DEGRADED' | 'DOWN';
}

/**
 * Admin Dashboard API Service
 */
export const adminDashboardApi = {
  /**
   * Get comprehensive admin dashboard
   * @param startTime - Optional start time (ISO string)
   * @param endTime - Optional end time (ISO string)
   * @returns Admin dashboard data
   */
  async getAdminDashboard(
    startTime?: string,
    endTime?: string
  ): Promise<AdminDashboardBackendDto> {
    const params = new URLSearchParams();
    if (startTime) params.append('startTime', startTime);
    if (endTime) params.append('endTime', endTime);

    const queryString = params.toString();
    const url = `/dashboard/admin${queryString ? `?${queryString}` : ''}`;

    const response =
      await apiClient.get<ApiResponse<AdminDashboardBackendDto>>(url);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Dashboard verisi alınamadı');
    }

    return response.data;
  },

  /**
   * Get admin dashboard for last N days
   * @param days - Number of days (default: 30)
   * @returns Admin dashboard data
   */
  async getAdminDashboardByDays(
    days: number = 30
  ): Promise<AdminDashboardBackendDto> {
    const response = await apiClient.get<ApiResponse<AdminDashboardBackendDto>>(
      `/dashboard/admin/days/${days}`
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Dashboard verisi alınamadı');
    }

    return response.data;
  },

  /**
   * Get real-time admin dashboard (last 24 hours)
   * @returns Admin dashboard data
   */
  async getAdminDashboardRealtime(): Promise<AdminDashboardBackendDto> {
    const response = await apiClient.get<ApiResponse<AdminDashboardBackendDto>>(
      '/dashboard/admin/realtime'
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Dashboard verisi alınamadı');
    }

    return response.data;
  },

  /**
   * Get platform snapshot (quick metrics)
   * @returns Platform snapshot data
   */
  async getPlatformSnapshot(): Promise<PlatformSnapshotDto> {
    const response = await apiClient.get<ApiResponse<PlatformSnapshotDto>>(
      '/dashboard/admin/snapshot'
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Snapshot verisi alınamadı');
    }

    return response.data;
  },

  /**
   * Refresh all dashboard caches
   * @returns Success status
   */
  async refreshAllDashboards(): Promise<boolean> {
    const response = await apiClient.post<ApiResponse<boolean>>(
      '/dashboard/admin/refresh-all'
    );

    return response.success && response.data === true;
  },
};

export default adminDashboardApi;
