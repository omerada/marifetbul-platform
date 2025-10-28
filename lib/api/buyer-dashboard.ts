/**
 * Buyer/Employer Dashboard API Client
 *
 * Provides type-safe API calls to backend buyer dashboard endpoints
 * Handles authentication, error handling, and response transformation
 *
 * @module lib/api/buyer-dashboard
 * @created 2025-01-XX (Sprint 2 - Dashboard Integration)
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import { DASHBOARD_ENDPOINTS } from './endpoints';
import type { ApiResponse } from '@/types/shared/api';
import type { ActivityDto } from './seller-dashboard';

/**
 * Backend DTO Types (matching Java BuyerDashboardDto)
 */
export interface BuyerDashboardBackendDto {
  periodStart: string;
  periodEnd: string;
  periodDays: number;

  // Spending metrics
  spendingMetrics: {
    totalSpent: number;
    platformFee: number;
    totalOrders: number;
    averageOrderValue: number;
    spendingGrowth: number;
    spendingGrowthRate: number;
    spendingByCategory: Record<string, number>;
  };

  // Order metrics
  orderMetrics: {
    totalOrders: number;
    completedOrders: number;
    activeOrders: number;
    cancelledOrders: number;
    completionRate: number;
    cancellationRate: number;
    averageDeliveryTime: number;
    onTimeDeliveryRate: number;
    ordersByStatus: Record<string, number>;
    ordersByCategory: Record<string, number>;
  };

  // Seller interaction metrics
  sellerMetrics: {
    totalSellers: number;
    repeatSellers: number;
    repeatSellerRate: number;
    averageSellerRating: number;
    totalReviewsGiven: number;
    satisfactionWithSellers: number;
  };

  // Favorite & saved
  activityMetrics: {
    totalFavorites: number;
    totalSearches: number;
    savedPackages: number;
    packageViews: number;
  };

  // Recommended packages (for recommendations endpoint)
  recommendations?: Array<{
    packageId: string;
    title: string;
    sellerName: string;
    price: number;
    rating: number;
    orders: number;
    matchScore: number; // AI/algorithm recommendation score
  }>;

  // Trends
  trends?: {
    dailySpending: Array<{ date: string; value: number }>;
    dailyOrders: Array<{ date: string; value: number }>;
  };

  generatedAt: string;
  fromCache: boolean;
  cacheAgeSeconds?: number;
}

/**
 * Buyer Snapshot Response (quick metrics for header)
 */
export interface BuyerSnapshotDto {
  activeOrders: number;
  pendingDeliveries: number;
  unreadMessages: number;
  favoritePackagesCount: number;
  recommendedPackagesCount: number;
}

/**
 * Buyer Dashboard API Service
 */
export const buyerDashboardApi = {
  /**
   * Get buyer dashboard with optional date range
   * @param startTime - Optional start time (ISO string)
   * @param endTime - Optional end time (ISO string)
   * @returns Buyer dashboard data
   */
  async getBuyerDashboard(
    startTime?: string,
    endTime?: string
  ): Promise<BuyerDashboardBackendDto> {
    const params = new URLSearchParams();
    if (startTime) params.append('startTime', startTime);
    if (endTime) params.append('endTime', endTime);

    const queryString = params.toString();
    const url = `${DASHBOARD_ENDPOINTS.BUYER_DASHBOARD}${queryString ? `?${queryString}` : ''}`;

    const response =
      await apiClient.get<ApiResponse<BuyerDashboardBackendDto>>(url);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Dashboard verisi alınamadı');
    }

    return response.data;
  },

  /**
   * Get buyer dashboard for last N days
   * @param days - Number of days (default: 30)
   * @returns Buyer dashboard data
   */
  async getBuyerDashboardByDays(
    days: number = 30
  ): Promise<BuyerDashboardBackendDto> {
    const url = DASHBOARD_ENDPOINTS.BUYER_DASHBOARD_BY_DAYS(days);

    const response =
      await apiClient.get<ApiResponse<BuyerDashboardBackendDto>>(url);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Dashboard verisi alınamadı');
    }

    return response.data;
  },

  /**
   * Get buyer dashboard with personalized package recommendations
   * @returns Buyer dashboard with recommended packages
   */
  async getBuyerDashboardWithRecommendations(): Promise<BuyerDashboardBackendDto> {
    const response = await apiClient.get<ApiResponse<BuyerDashboardBackendDto>>(
      DASHBOARD_ENDPOINTS.BUYER_DASHBOARD_RECOMMENDATIONS
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Dashboard önerileri alınamadı');
    }

    return response.data;
  },

  /**
   * Get buyer snapshot (quick metrics)
   * @returns Buyer snapshot data
   */
  async getBuyerSnapshot(): Promise<BuyerSnapshotDto> {
    const response = await apiClient.get<ApiResponse<BuyerSnapshotDto>>(
      DASHBOARD_ENDPOINTS.BUYER_SNAPSHOT
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Snapshot verisi alınamadı');
    }

    return response.data;
  },

  /**
   * Refresh buyer dashboard cache
   * @returns Success status
   */
  async refreshBuyerDashboard(): Promise<boolean> {
    const response = await apiClient.post<ApiResponse<boolean>>(
      DASHBOARD_ENDPOINTS.BUYER_REFRESH
    );

    return response.success && response.data === true;
  },

  /**
   * Get employer activity timeline
   * @param page - Page number (0-based)
   * @param size - Page size
   * @returns List of activities
   */
  async getEmployerActivities(
    page: number = 0,
    size: number = 20
  ): Promise<ActivityDto[]> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    const url = `${DASHBOARD_ENDPOINTS.EMPLOYER_ACTIVITIES}?${params}`;

    const response = await apiClient.get<ApiResponse<ActivityDto[]>>(url);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Aktivite verisi alınamadı');
    }

    return response.data;
  },
};

export default buyerDashboardApi;
