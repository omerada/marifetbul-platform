/**
 * ================================================
 * ADMIN ANALYTICS API CLIENT
 * ================================================
 * Client for admin-only analytics endpoints
 *
 * Endpoints:
 * - Revenue analytics (breakdown, forecast, comparison)
 * - User growth metrics
 * - Order analytics
 * - Export functionality
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 3 - Analytics & Reporting
 */

import { apiClient } from '../infrastructure/api/client';

const API_BASE = '/api/v1/admin/analytics';

// ================================================
// TYPES
// ================================================

export interface RevenueBreakdownDto {
  period: string;
  startDate: string;
  endDate: string;
  summary: {
    grossRevenue: number;
    netRevenue: number;
    platformFee: number;
    sellerEarnings: number;
    refundAmount: number;
  };
  growth: {
    previousPeriodRevenue: number;
    revenueChange: number;
    growthRate: number;
    trend: 'UP' | 'DOWN' | 'STABLE';
  };
  transactions: {
    orderCount: number;
    refundCount: number;
    averageOrderValue: number;
    medianOrderValue: number;
  };
  paymentMethods: {
    creditCard: {
      count: number;
      amount: number;
      percentage: number;
    };
    wallet: {
      count: number;
      amount: number;
      percentage: number;
    };
  };
  platformFees: {
    totalFees: number;
    feePercentage: number;
    averageFeeRate: number;
  };
  sellerStats: {
    activeSellers: number;
    topSellersCount: number;
    topSellersRevenue: number;
    averageRevenuePerSeller: number;
  };
  categoryStats: {
    categoryCount: number;
    topCategoriesCount: number;
    topCategoriesRevenue: number;
  };
  healthIndicators: {
    refundRate: number;
    averageTransactionSize: number;
    revenueConcentration: number;
  };
}

export interface RevenueForecastDto {
  forecastPeriod: string;
  startDate: string;
  endDate: string;
  basedOnDays: number;
  predicted: {
    revenue: number;
    orderCount: number;
    averageOrderValue: number;
  };
  confidence: {
    lower: number;
    upper: number;
    level: number;
  };
  trend: {
    direction: 'UP' | 'DOWN' | 'STABLE';
    strength: number;
    reliability: number;
  };
  historicalAverage: {
    dailyRevenue: number;
    dailyOrders: number;
  };
}

export interface RevenueComparisonDto {
  comparisonType:
    | 'DAY_OVER_DAY'
    | 'WEEK_OVER_WEEK'
    | 'MONTH_OVER_MONTH'
    | 'YEAR_OVER_YEAR'
    | 'CUSTOM';
  currentPeriod: {
    startDate: string;
    endDate: string;
    revenue: number;
    orders: number;
    averageOrderValue: number;
  };
  previousPeriod: {
    startDate: string;
    endDate: string;
    revenue: number;
    orders: number;
    averageOrderValue: number;
  };
  comparison: {
    revenueChange: number;
    revenueChangePercentage: number;
    ordersChange: number;
    ordersChangePercentage: number;
    aovChange: number;
    aovChangePercentage: number;
  };
  performance: {
    trend: 'IMPROVING' | 'DECLINING' | 'STABLE';
    significance: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  };
}

/**
 * Order Analytics DTOs
 */
export interface OrderAnalyticsDto {
  summary: {
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    cancelledOrders: number;
    activeOrders: number;
    totalValue: number;
    averageOrderValue: number;
    completionRate: number;
    cancellationRate: number;
  };
  statusDistribution: Record<
    string,
    {
      count: number;
      totalValue: number;
      percentage: number;
    }
  >;
  growth: {
    previousPeriodOrders: number;
    currentPeriodOrders: number;
    orderGrowthRate: number;
    previousPeriodValue: number;
    currentPeriodValue: number;
    valueGrowthRate: number;
  };
  performance: {
    averageCompletionTimeHours: number;
    onTimeDeliveryRate: number;
    customerSatisfactionScore: number;
    disputeCount: number;
    disputeRate: number;
  };
  dailyTrend: Array<{
    date: string;
    orderCount: number;
    orderValue: number;
    completedCount: number;
    cancelledCount: number;
  }>;
}

export interface UserActivityStats {
  dau: number;
  mau: number;
  dauMauRatio: number;
}

// ================================================
// REVENUE ANALYTICS
// ================================================

/**
 * Get revenue breakdown for date range
 */
export async function getRevenueBreakdown(
  startDate: string,
  endDate: string
): Promise<RevenueBreakdownDto> {
  return apiClient.get<RevenueBreakdownDto>(
    `${API_BASE}/revenue/breakdown?startDate=${startDate}&endDate=${endDate}`
  );
}

/**
 * Get today's revenue breakdown
 */
export async function getTodaysRevenueBreakdown(): Promise<RevenueBreakdownDto> {
  return apiClient.get<RevenueBreakdownDto>(
    `${API_BASE}/revenue/breakdown/today`
  );
}

/**
 * Get this week's revenue breakdown
 */
export async function getThisWeekRevenueBreakdown(): Promise<RevenueBreakdownDto> {
  return apiClient.get<RevenueBreakdownDto>(
    `${API_BASE}/revenue/breakdown/week`
  );
}

/**
 * Get this month's revenue breakdown
 */
export async function getThisMonthRevenueBreakdown(): Promise<RevenueBreakdownDto> {
  return apiClient.get<RevenueBreakdownDto>(
    `${API_BASE}/revenue/breakdown/month`
  );
}

/**
 * Get seller revenue breakdown
 */
export async function getSellerRevenueBreakdown(
  sellerId: string,
  startDate: string,
  endDate: string
): Promise<RevenueBreakdownDto> {
  return apiClient.get<RevenueBreakdownDto>(
    `${API_BASE}/revenue/breakdown/seller/${sellerId}?startDate=${startDate}&endDate=${endDate}`
  );
}

/**
 * Get category revenue breakdown
 */
export async function getCategoryRevenueBreakdown(
  categoryId: string,
  startDate: string,
  endDate: string
): Promise<RevenueBreakdownDto> {
  return apiClient.get<RevenueBreakdownDto>(
    `${API_BASE}/revenue/breakdown/category/${categoryId}?startDate=${startDate}&endDate=${endDate}`
  );
}

// ================================================
// REVENUE FORECASTING
// ================================================

/**
 * Forecast revenue
 */
export async function forecastRevenue(
  forecastDays: number = 7,
  historicalDays: number = 30
): Promise<RevenueForecastDto> {
  return apiClient.get<RevenueForecastDto>(
    `${API_BASE}/revenue/forecast?forecastDays=${forecastDays}&historicalDays=${historicalDays}`
  );
}

/**
 * Get next week forecast
 */
export async function getNextWeekForecast(): Promise<RevenueForecastDto> {
  return apiClient.get<RevenueForecastDto>(
    `${API_BASE}/revenue/forecast/next-week`
  );
}

/**
 * Get next month forecast
 */
export async function getNextMonthForecast(): Promise<RevenueForecastDto> {
  return apiClient.get<RevenueForecastDto>(
    `${API_BASE}/revenue/forecast/next-month`
  );
}

// ================================================
// REVENUE COMPARISON
// ================================================

/**
 * Compare revenue periods
 */
export async function compareRevenuePeriods(
  currentStart: string,
  currentEnd: string,
  previousStart: string,
  previousEnd: string
): Promise<RevenueComparisonDto> {
  return apiClient.get<RevenueComparisonDto>(
    `${API_BASE}/revenue/compare?currentStart=${currentStart}&currentEnd=${currentEnd}&previousStart=${previousStart}&previousEnd=${previousEnd}`
  );
}

/**
 * Get day over day comparison
 */
export async function getDayOverDayComparison(
  date: string
): Promise<RevenueComparisonDto> {
  return apiClient.get<RevenueComparisonDto>(
    `${API_BASE}/revenue/compare/day-over-day?date=${date}`
  );
}

/**
 * Get week over week comparison
 */
export async function getWeekOverWeekComparison(
  weekStart: string
): Promise<RevenueComparisonDto> {
  return apiClient.get<RevenueComparisonDto>(
    `${API_BASE}/revenue/compare/week-over-week?weekStart=${weekStart}`
  );
}

/**
 * Get month over month comparison
 */
export async function getMonthOverMonthComparison(
  year: number,
  month: number
): Promise<RevenueComparisonDto> {
  return apiClient.get<RevenueComparisonDto>(
    `${API_BASE}/revenue/compare/month-over-month?year=${year}&month=${month}`
  );
}

/**
 * Get today vs yesterday comparison
 */
export async function getTodayVsYesterdayComparison(): Promise<RevenueComparisonDto> {
  return apiClient.get<RevenueComparisonDto>(
    `${API_BASE}/revenue/compare/today-vs-yesterday`
  );
}

/**
 * Get this week vs last week comparison
 */
export async function getThisWeekVsLastWeekComparison(): Promise<RevenueComparisonDto> {
  return apiClient.get<RevenueComparisonDto>(
    `${API_BASE}/revenue/compare/this-week-vs-last-week`
  );
}

/**
 * Get this month vs last month comparison
 */
export async function getThisMonthVsLastMonthComparison(): Promise<RevenueComparisonDto> {
  return apiClient.get<RevenueComparisonDto>(
    `${API_BASE}/revenue/compare/this-month-vs-last-month`
  );
}

// ================================================
// USER ACTIVITY ANALYTICS
// ================================================

/**
 * Get daily active users
 */
export async function getDailyActiveUsers(date: string): Promise<number> {
  const response = await apiClient.get<number>(
    `${API_BASE}/users/activity/dau?date=${date}`
  );
  return response;
}

/**
 * Get monthly active users
 */
export async function getMonthlyActiveUsers(
  year: number,
  month: number
): Promise<number> {
  const response = await apiClient.get<number>(
    `${API_BASE}/users/activity/mau?year=${year}&month=${month}`
  );
  return response;
}

/**
 * Get activity statistics
 */
export async function getActivityStatistics(
  start: string,
  end: string
): Promise<Record<string, unknown>> {
  return apiClient.get<Record<string, unknown>>(
    `${API_BASE}/users/activity/statistics?start=${start}&end=${end}`
  );
}

// ================================================
// ORDER ANALYTICS
// ================================================

/**
 * Get comprehensive order analytics for date range
 */
export async function getOrderAnalytics(
  startDate: string,
  endDate: string
): Promise<OrderAnalyticsDto> {
  return apiClient.get<OrderAnalyticsDto>(
    `${API_BASE}/orders/analytics?startDate=${startDate}&endDate=${endDate}`
  );
}

/**
 * Get today's order analytics
 */
export async function getTodaysOrderAnalytics(): Promise<OrderAnalyticsDto> {
  return apiClient.get<OrderAnalyticsDto>(`${API_BASE}/orders/analytics/today`);
}

/**
 * Get this week's order analytics
 */
export async function getThisWeekOrderAnalytics(): Promise<OrderAnalyticsDto> {
  return apiClient.get<OrderAnalyticsDto>(`${API_BASE}/orders/analytics/week`);
}

/**
 * Get this month's order analytics
 */
export async function getThisMonthOrderAnalytics(): Promise<OrderAnalyticsDto> {
  return apiClient.get<OrderAnalyticsDto>(`${API_BASE}/orders/analytics/month`);
}

// ================================================
// HELPER FUNCTIONS
// ================================================

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format number for display
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('tr-TR').format(num);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Get trend icon/color based on trend type
 */
export function getTrendIndicator(trend: 'UP' | 'DOWN' | 'STABLE'): {
  icon: string;
  color: string;
  label: string;
} {
  switch (trend) {
    case 'UP':
      return { icon: '↑', color: 'text-green-600', label: 'Artış' };
    case 'DOWN':
      return { icon: '↓', color: 'text-red-600', label: 'Düşüş' };
    case 'STABLE':
      return { icon: '→', color: 'text-gray-600', label: 'Sabit' };
  }
}
