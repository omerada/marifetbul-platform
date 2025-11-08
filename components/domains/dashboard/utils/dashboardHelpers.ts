/**
 * ================================================
 * DASHBOARD HELPERS - UTILITY FUNCTIONS
 * ================================================
 * Sprint 1 - Day 5: Helper functions for dashboard operations
 *
 * Features:
 * - Data formatting
 * - Date calculations
 * - Metric calculations
 * - Trend analysis
 * - Period helpers
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import {
  format,
  subDays,
  startOfDay,
  endOfDay,
  isWithinInterval,
} from 'date-fns';
import { tr } from 'date-fns/locale';
/**
 * Dashboard Helper Functions
 *
 * Pure utility functions for dashboard data processing and display
 */

import type { TimeRange } from '@/types/shared/analytics/dashboard';
import { isValidNumber as isValidNumberCanonical } from '@/lib/shared/formatters';
import { formatCurrency as formatCurrencyCanonical } from '@/lib/shared/formatters';

// ============================================================================
// DATE HELPERS
// ============================================================================

/**
 * Get date range for a period
 */
export function getDateRange(period: DashboardPeriod): {
  startDate: Date;
  endDate: Date;
  days: number;
} {
  const now = new Date();
  const endDate = endOfDay(now);

  let startDate: Date;
  let days: number;

  switch (period) {
    case 'week':
      days = 7;
      startDate = startOfDay(subDays(now, days - 1));
      break;
    case 'month':
      days = 30;
      startDate = startOfDay(subDays(now, days - 1));
      break;
    case 'quarter':
      days = 90;
      startDate = startOfDay(subDays(now, days - 1));
      break;
    case 'year':
      days = 365;
      startDate = startOfDay(subDays(now, days - 1));
      break;
    default:
      days = 30;
      startDate = startOfDay(subDays(now, days - 1));
  }

  return { startDate, endDate, days };
}

/**
 * Format date for display
 */
export function formatDashboardDate(
  date: Date | string,
  formatString: string = 'PP'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatString, { locale: tr });
}

/**
 * Get relative time string
 */
export function getRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Az önce';
  if (diffMins < 60) return `${diffMins} dakika önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  if (diffDays === 1) return 'Dün';
  if (diffDays < 7) return `${diffDays} gün önce`;

  return formatDashboardDate(dateObj, 'd MMM');
}

/**
 * Check if date is within period
 */
export function isDateInPeriod(
  date: Date | string,
  period: DashboardPeriod
): boolean {
  const { startDate, endDate } = getDateRange(period);
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return isWithinInterval(dateObj, { start: startDate, end: endDate });
}

// ============================================================================
// NUMBER FORMATTING
// ============================================================================

/**
 * Format currency value
 *
 * @deprecated Sprint 6 - Use canonical formatCurrency from @/lib/shared/formatters
 * Kept as wrapper for backward compatibility during migration
 */
export function formatCurrency(
  amount: number,
  currency: string = 'TRY',
  showSymbol: boolean = true
): string {
  return formatCurrencyCanonical(amount, currency, {
    useSymbol: showSymbol,
  });
}

/**
 * Format percentage value
 */
export function formatPercentage(
  value: number,
  decimals: number = 1,
  showSign: boolean = true
): string {
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format large numbers (K, M, B)
 */
export function formatCompactNumber(num: number): string {
  if (num === 0) return '0';

  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (absNum >= 1000000000) {
    return `${sign}${(absNum / 1000000000).toFixed(1)}B`;
  }
  if (absNum >= 1000000) {
    return `${sign}${(absNum / 1000000).toFixed(1)}M`;
  }
  if (absNum >= 1000) {
    return `${sign}${(absNum / 1000).toFixed(1)}K`;
  }

  return `${sign}${absNum}`;
}

/**
 * Format stat value with appropriate suffix
 */
export function formatStatValue(
  value: number,
  type: 'currency' | 'percentage' | 'number' | 'compact' = 'number',
  currency?: string
): string {
  switch (type) {
    case 'currency':
      return formatCurrency(value, currency);
    case 'percentage':
      return formatPercentage(value);
    case 'compact':
      return formatCompactNumber(value);
    case 'number':
    default:
      return new Intl.NumberFormat('tr-TR').format(value);
  }
}

// ============================================================================
// TREND CALCULATIONS
// ============================================================================
import type { TrendDirection, TrendIndicator } from '../types/dashboard.types';

/**
 * Calculate trend between two values
 */
export function calculateTrend(
  current: number,
  previous: number,
  isPositiveUp: boolean = true
): TrendIndicator {
  if (previous === 0) {
    return {
      percentage: current > 0 ? 100 : 0,
      direction: current > 0 ? 'up' : 'neutral',
      isPositive: current > 0 ? isPositiveUp : !isPositiveUp,
      label: 'vs önceki dönem',
    };
  }

  const percentage = ((current - previous) / previous) * 100;
  const direction: TrendDirection =
    percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral';

  const isPositive =
    direction === 'up'
      ? isPositiveUp
      : direction === 'down'
        ? !isPositiveUp
        : false;

  return {
    percentage: Math.abs(percentage),
    direction,
    isPositive,
    label: 'vs önceki dönem',
  };
}

/**
 * Calculate average
 */
export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

/**
 * Calculate growth rate
 */
export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// ============================================================================
// METRIC CALCULATIONS
// ============================================================================

/**
 * Calculate completion rate
 */
export function calculateCompletionRate(
  completed: number,
  total: number
): number {
  if (total === 0) return 0;
  return (completed / total) * 100;
}

/**
 * Calculate success rate
 */
export function calculateSuccessRate(
  successful: number,
  total: number
): number {
  return calculateCompletionRate(successful, total);
}

/**
 * Calculate average order value
 */
export function calculateAverageValue(total: number, count: number): number {
  if (count === 0) return 0;
  return total / count;
}

/**
 * Calculate conversion rate
 */
export function calculateConversionRate(
  conversions: number,
  visitors: number
): number {
  if (visitors === 0) return 0;
  return (conversions / visitors) * 100;
}

// ============================================================================
// DATA GROUPING
// ============================================================================

/**
 * Group data by date
 */
export function groupByDate<T extends { createdAt: string | Date }>(
  items: T[]
): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const date = format(
      typeof item.createdAt === 'string'
        ? new Date(item.createdAt)
        : item.createdAt,
      'yyyy-MM-dd'
    );

    if (!acc[date]) {
      acc[date] = [];
    }

    acc[date].push(item);
    return acc;
  }, {});
}

/**
 * Group data by period
 */
export function groupByPeriod<T extends { createdAt: string | Date }>(
  items: T[],
  period: 'day' | 'week' | 'month'
): Record<string, T[]> {
  const formatString =
    period === 'day' ? 'yyyy-MM-dd' : period === 'week' ? 'yyyy-ww' : 'yyyy-MM';

  return items.reduce<Record<string, T[]>>((acc, item) => {
    const key = format(
      typeof item.createdAt === 'string'
        ? new Date(item.createdAt)
        : item.createdAt,
      formatString
    );

    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(item);
    return acc;
  }, {});
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Check if value is valid number
 */
/**
 * Type guard for valid number
 * @deprecated Sprint 7 - Use isValidNumber from @/lib/shared/formatters
 */
export function isValidNumber(value: unknown): value is number {
  return isValidNumberCanonical(value);
}

/**
 * Check if stat data is empty
 */
export function isEmptyStats(
  stats: Record<string, unknown> | null | undefined
): boolean {
  if (!stats) return true;
  return Object.keys(stats).length === 0;
}

/**
 * Check if data is stale
 */
export function isDataStale(
  lastUpdated: Date | null,
  staleTimeMs: number = 5 * 60 * 1000
): boolean {
  if (!lastUpdated) return true;
  return Date.now() - lastUpdated.getTime() > staleTimeMs;
}

// ============================================================================
// CHART DATA HELPERS
// ============================================================================

/**
 * Prepare chart data from raw values
 */
export function prepareChartData(
  data: Record<string, number>,
  labelFormatter?: (key: string) => string
): Array<{ label: string; value: number }> {
  return Object.entries(data).map(([key, value]) => ({
    label: labelFormatter ? labelFormatter(key) : key,
    value,
  }));
}

/**
 * Calculate chart domain (min/max values)
 */
export function calculateChartDomain(values: number[]): [number, number] {
  if (values.length === 0) return [0, 100];

  const min = Math.min(...values);
  const max = Math.max(...values);

  // Add 10% padding
  const padding = (max - min) * 0.1;

  return [Math.max(0, min - padding), max + padding];
}

/**
 * Fill missing dates in time series
 */
export function fillMissingDates(
  data: Array<{ date: string; value: number }>,
  period: DashboardPeriod
): Array<{ date: string; value: number }> {
  const { startDate, endDate } = getDateRange(period);
  const filledData: Array<{ date: string; value: number }> = [];

  let currentDate = startDate;
  while (currentDate <= endDate) {
    const dateString = format(currentDate, 'yyyy-MM-dd');
    const existing = data.find((d) => d.date === dateString);

    filledData.push({
      date: dateString,
      value: existing?.value ?? 0,
    });

    currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
  }

  return filledData;
}

// ============================================================================
// COLOR HELPERS
// ============================================================================

/**
 * Get color for trend
 */
export function getTrendColor(
  direction: TrendDirection,
  isPositive: boolean
): string {
  if (direction === 'neutral') return 'text-gray-500';

  return isPositive
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-600 dark:text-red-400';
}

/**
 * Get background color for trend
 */
export function getTrendBgColor(
  direction: TrendDirection,
  isPositive: boolean
): string {
  if (direction === 'neutral') return 'bg-gray-100 dark:bg-gray-800';

  return isPositive
    ? 'bg-green-100 dark:bg-green-900/20'
    : 'bg-red-100 dark:bg-red-900/20';
}

// ============================================================================
// PERIOD HELPERS
// ============================================================================

/**
 * Get period label
 */
export function getPeriodLabel(period: DashboardPeriod): string {
  const labels: Record<DashboardPeriod, string> = {
    week: 'Son 7 Gün',
    month: 'Son 30 Gün',
    quarter: 'Son 90 Gün',
    year: 'Son 365 Gün',
  };

  return labels[period];
}

/**
 * Get period options for selector
 */
export function getPeriodOptions(): Array<{
  value: DashboardPeriod;
  label: string;
}> {
  return [
    { value: 'week', label: 'Son 7 Gün' },
    { value: 'month', label: 'Son 30 Gün' },
    { value: 'quarter', label: 'Son 90 Gün' },
    { value: 'year', label: 'Son 365 Gün' },
  ];
}
