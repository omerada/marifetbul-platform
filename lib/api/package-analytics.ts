/**
 * Package Analytics API Client
 * Sprint 1 - Task 1: Package Analytics Backend Integration
 *
 * @module lib/api/package-analytics
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import logger from '@/lib/infrastructure/monitoring/logger';

/**
 * Package Analytics Data Types
 */
export interface PackageMetrics {
  totalPackages: number;
  activePackages: number;
  totalViews: number;
  totalOrders: number;
  totalRevenue: number;
  averageRating: number;
  completionRate: number;
  conversionRate: number;
}

export interface PackageTrends {
  views: number;
  orders: number;
  revenue: number;
  rating: number;
}

export interface TopPackage {
  id: string;
  title: string;
  category: string;
  views: number;
  orders: number;
  revenue: number;
  rating: number;
}

export interface ChartData {
  labels: string[];
  views: number[];
  orders: number[];
  revenue: number[];
}

export interface PackageAnalyticsData {
  metrics: PackageMetrics;
  trends: PackageTrends;
  topPackages: TopPackage[];
  chartData: ChartData;
}

/**
 * Fetch seller package analytics
 *
 * @param days - Number of days to analyze (default: 30)
 * @returns Package analytics data
 */
export async function fetchPackageAnalytics(
  days: number = 30
): Promise<PackageAnalyticsData> {
  try {
    logger.info('Fetching package analytics', { days });

    const response = await apiClient.get<PackageAnalyticsData>(
      '/seller/packages/analytics',
      { days: String(days) }
    );

    logger.info('Package analytics fetched successfully', {
      totalPackages: response.metrics.totalPackages,
      totalRevenue: response.metrics.totalRevenue,
    });

    return response;
  } catch (error) {
    logger.error('Failed to fetch package analytics', { error, days });
    throw error;
  }
}

/**
 * Fetch package analytics for a specific date range
 *
 * @param startDate - Start date (ISO format)
 * @param endDate - End date (ISO format)
 * @returns Package analytics data
 */
export async function fetchPackageAnalyticsByDateRange(
  startDate: string,
  endDate: string
): Promise<PackageAnalyticsData> {
  try {
    logger.info('Fetching package analytics by date range', {
      startDate,
      endDate,
    });

    const response = await apiClient.get<PackageAnalyticsData>(
      '/seller/packages/analytics',
      { startDate, endDate }
    );

    logger.info('Package analytics fetched successfully (date range)', {
      totalPackages: response.metrics.totalPackages,
      totalRevenue: response.metrics.totalRevenue,
      dateRange: `${startDate} to ${endDate}`,
    });

    return response;
  } catch (error) {
    logger.error('Failed to fetch package analytics by date range', {
      error,
      startDate,
      endDate,
    });
    throw error;
  }
}
