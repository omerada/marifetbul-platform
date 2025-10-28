/**
 * Seller/Freelancer Dashboard API Client
 *
 * Provides type-safe API calls to backend seller dashboard endpoints
 * Handles authentication, error handling, and response transformation
 *
 * @module lib/api/seller-dashboard
 * @created 2025-01-XX (Sprint 2 - Dashboard Integration)
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import { DASHBOARD_ENDPOINTS } from './endpoints';
import type { ApiResponse } from '@/types/shared/api';

/**
 * Backend DTO Types (matching Java SellerDashboardDto)
 */
export interface SellerDashboardBackendDto {
  periodStart: string;
  periodEnd: string;
  periodDays: number;

  // Earnings metrics
  earningsMetrics: {
    totalEarnings: number;
    netEarnings: number;
    platformFee: number;
    pendingEarnings: number;
    availableBalance: number;
    totalWithdrawals: number;
    earningsGrowth: number;
    earningsGrowthRate: number;
    earningsByCategory: Record<string, number>;
  };

  // Package performance
  packageMetrics: {
    totalPackages: number;
    activePackages: number;
    totalViews: number;
    uniqueViewers: number;
    totalFavorites: number;
    conversionRate: number;
    averageRating: number;
    totalReviews: number;
    packagesByStatus: Record<string, number>;
    topPackages: Array<{
      packageId: string;
      title: string;
      views: number;
      orders: number;
      revenue: number;
      rating: number;
    }>;
  };

  // Order metrics
  orderMetrics: {
    totalOrders: number;
    completedOrders: number;
    activeOrders: number;
    cancelledOrders: number;
    completionRate: number;
    cancellationRate: number;
    averageOrderValue: number;
    averageDeliveryTime: number;
    onTimeDeliveryRate: number;
    ordersByStatus: Record<string, number>;
  };

  // Customer metrics
  customerMetrics: {
    totalBuyers: number;
    repeatBuyers: number;
    repeatBuyerRate: number;
    customerSatisfactionScore: number;
    totalReviews: number;
    averageRating: number;
    positiveReviewRate: number;
  };

  // Performance trends
  trends?: {
    dailyEarnings: Array<{ date: string; value: number }>;
    dailyOrders: Array<{ date: string; value: number }>;
    dailyViews: Array<{ date: string; value: number }>;
  };

  // Period comparison (for comparison endpoint)
  comparison?: {
    currentPeriod: {
      earnings: number;
      orders: number;
      views: number;
    };
    previousPeriod: {
      earnings: number;
      orders: number;
      views: number;
    };
    growth: {
      earningsGrowth: number;
      ordersGrowth: number;
      viewsGrowth: number;
    };
  };

  generatedAt: string;
  fromCache: boolean;
  cacheAgeSeconds?: number;
}

/**
 * Seller Snapshot Response (quick metrics for header)
 */
export interface SellerSnapshotDto {
  pendingOrders: number;
  activeOrders: number;
  availableBalance: number;
  pendingEarnings: number;
  unreadMessages: number;
  newReviews: number;
}

/**
 * Activity DTO (matching backend ActivityDto)
 */
export interface ActivityDto {
  id: string;
  userId: string;
  activityType: string;
  entityType: string;
  entityId: string;
  description: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
  read: boolean;
}

/**
 * Seller Dashboard API Service
 */
export const sellerDashboardApi = {
  /**
   * Get seller dashboard with optional date range
   * @param startTime - Optional start time (ISO string)
   * @param endTime - Optional end time (ISO string)
   * @returns Seller dashboard data
   */
  async getSellerDashboard(
    startTime?: string,
    endTime?: string
  ): Promise<SellerDashboardBackendDto> {
    const params = new URLSearchParams();
    if (startTime) params.append('startTime', startTime);
    if (endTime) params.append('endTime', endTime);

    const queryString = params.toString();
    const url = `${DASHBOARD_ENDPOINTS.SELLER_DASHBOARD}${queryString ? `?${queryString}` : ''}`;

    const response =
      await apiClient.get<ApiResponse<SellerDashboardBackendDto>>(url);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Dashboard verisi alınamadı');
    }

    return response.data;
  },

  /**
   * Get seller dashboard for last N days
   * @param days - Number of days (default: 30)
   * @returns Seller dashboard data
   */
  async getSellerDashboardByDays(
    days: number = 30
  ): Promise<SellerDashboardBackendDto> {
    const url = DASHBOARD_ENDPOINTS.SELLER_DASHBOARD_BY_DAYS(days);

    const response =
      await apiClient.get<ApiResponse<SellerDashboardBackendDto>>(url);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Dashboard verisi alınamadı');
    }

    return response.data;
  },

  /**
   * Get seller dashboard with period comparison
   * @param currentStart - Current period start (ISO string)
   * @param currentEnd - Current period end (ISO string)
   * @param previousStart - Previous period start (ISO string)
   * @param previousEnd - Previous period end (ISO string)
   * @returns Seller dashboard with comparison data
   */
  async getSellerDashboardWithComparison(
    currentStart: string,
    currentEnd: string,
    previousStart: string,
    previousEnd: string
  ): Promise<SellerDashboardBackendDto> {
    const params = new URLSearchParams({
      currentStart,
      currentEnd,
      previousStart,
      previousEnd,
    });

    const url = `${DASHBOARD_ENDPOINTS.SELLER_DASHBOARD_COMPARISON}?${params}`;

    const response =
      await apiClient.get<ApiResponse<SellerDashboardBackendDto>>(url);

    if (!response.success || !response.data) {
      throw new Error(
        response.message || 'Dashboard karşılaştırması alınamadı'
      );
    }

    return response.data;
  },

  /**
   * Get seller snapshot (quick metrics)
   * @returns Seller snapshot data
   */
  async getSellerSnapshot(): Promise<SellerSnapshotDto> {
    const response = await apiClient.get<ApiResponse<SellerSnapshotDto>>(
      DASHBOARD_ENDPOINTS.SELLER_SNAPSHOT
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Snapshot verisi alınamadı');
    }

    return response.data;
  },

  /**
   * Refresh seller dashboard cache
   * @returns Success status
   */
  async refreshSellerDashboard(): Promise<boolean> {
    const response = await apiClient.post<ApiResponse<boolean>>(
      DASHBOARD_ENDPOINTS.SELLER_REFRESH
    );

    return response.success && response.data === true;
  },

  /**
   * Get freelancer activity timeline
   * @param page - Page number (0-based)
   * @param size - Page size
   * @returns List of activities
   */
  async getFreelancerActivities(
    page: number = 0,
    size: number = 20
  ): Promise<ActivityDto[]> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    const url = `${DASHBOARD_ENDPOINTS.FREELANCER_ACTIVITIES}?${params}`;

    const response = await apiClient.get<ApiResponse<ActivityDto[]>>(url);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Aktivite verisi alınamadı');
    }

    return response.data;
  },
};

export default sellerDashboardApi;
