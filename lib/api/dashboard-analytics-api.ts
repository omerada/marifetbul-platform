/**
 * ================================================
 * DASHBOARD ANALYTICS API CLIENT
 * ================================================
 * API client for wallet analytics endpoints
 *
 * @module lib/api/dashboard-analytics-api
 * @since Story 1.3 - Wallet Analytics
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import type { ApiResponse } from '@/types/shared/api';

// ==================== TYPES ====================

export interface EarningsTrendPoint {
  date: string;
  earnings: number;
  orderCount: number;
  averageOrderValue: number;
}

export interface EarningsTrendResponse {
  data: EarningsTrendPoint[];
  totalEarnings: number;
  totalOrders: number;
  averageDaily: number;
  peakDay: number;
  peakDate: string | null;
  previousPeriodEarnings: number;
  growthPercentage: number;
}

export interface RevenueBreakdownItem {
  category: string;
  amount: number;
  orderCount: number;
  percentage: number;
}

export interface RevenueBreakdownResponse {
  byCategory: RevenueBreakdownItem[];
  totalRevenue: number;
  topCategory: string | null;
  topCategoryPercentage: number;
}

export interface TransactionSummaryResponse {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  incomeTransactionCount: number;
  expenseTransactionCount: number;
  ordersIncome: number;
  refundsExpense: number;
  payoutsExpense: number;
  feesExpense: number;
  availableBalance: number;
  pendingBalance: number;
  escrowBalance: number;
  previousPeriodIncome: number;
  incomeGrowthPercentage: number;
}

// ==================== API METHODS ====================

/**
 * Get earnings trend for a date range
 * Shows daily earnings, order count, and averages
 *
 * @param startDate Start date (YYYY-MM-DD)
 * @param endDate End date (YYYY-MM-DD)
 * @returns Earnings trend with growth comparison
 */
export async function getEarningsTrend(
  startDate: string,
  endDate: string
): Promise<EarningsTrendResponse> {
  const response = await apiClient.get<ApiResponse<EarningsTrendResponse>>(
    `/dashboard/analytics/earnings-trend?startDate=${startDate}&endDate=${endDate}`
  );

  return response.data;
}

/**
 * Get revenue breakdown by package category
 * Shows distribution across categories with percentages
 *
 * @param startDate Start date (YYYY-MM-DD)
 * @param endDate End date (YYYY-MM-DD)
 * @returns Revenue breakdown by category
 */
export async function getRevenueBreakdown(
  startDate: string,
  endDate: string
): Promise<RevenueBreakdownResponse> {
  const response = await apiClient.get<ApiResponse<RevenueBreakdownResponse>>(
    `/dashboard/analytics/revenue-breakdown?startDate=${startDate}&endDate=${endDate}`
  );

  return response.data;
}

/**
 * Get transaction summary with income vs expenses
 * Shows wallet balances, transaction counts, and growth
 *
 * @param startDate Start date (YYYY-MM-DD)
 * @param endDate End date (YYYY-MM-DD)
 * @returns Transaction summary with wallet balances
 */
export async function getTransactionSummary(
  startDate: string,
  endDate: string
): Promise<TransactionSummaryResponse> {
  const response = await apiClient.get<ApiResponse<TransactionSummaryResponse>>(
    `/dashboard/analytics/transaction-summary?startDate=${startDate}&endDate=${endDate}`
  );

  return response.data;
}
