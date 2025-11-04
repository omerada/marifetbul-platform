import { apiClient } from '@/lib/infrastructure/api/client';

/**
 * Admin Report API Client
 * Provides methods for generating and exporting admin analytics reports
 *
 * @module lib/api/admin-reports
 */

// ==================== Types ====================

export type ReportType = 'REVENUE' | 'ORDERS' | 'USERS' | 'REFUNDS' | 'CUSTOM';
export type GroupByPeriod = 'DAY' | 'WEEK' | 'MONTH';
export type TrendDirection = 'UP' | 'DOWN' | 'STABLE';

export interface ReportFilters {
  categories?: string[];
  statuses?: string[];
  userTypes?: string[];
  minAmount?: number;
  maxAmount?: number;
  customFilters?: Record<string, unknown>;
}

export interface ReportRequest {
  reportType: ReportType;
  metrics?: string[];
  startDate: string; // ISO date format: YYYY-MM-DD
  endDate: string;
  groupBy?: GroupByPeriod;
  filters?: ReportFilters;
}

export interface ReportDataPoint {
  date: string;
  metrics: Record<string, number>;
}

export interface ReportSummary {
  total: number;
  average: number;
  min: number;
  max: number;
  trend: TrendDirection;
  percentageChange: number;
  count: number;
}

export interface ReportMetadata {
  generatedAt: string;
  startDate: string;
  endDate: string;
  groupBy: GroupByPeriod;
  appliedFilters: Record<string, unknown>;
  generationTimeMs: number;
}

export interface ReportResponse {
  reportType: ReportType;
  data: ReportDataPoint[];
  summary: ReportSummary;
  metadata: ReportMetadata;
}

export interface ReportTypeInfo {
  type: ReportType;
  metrics: string[];
}

export interface ReportTypesResponse {
  reportTypes: ReportTypeInfo[];
  groupByOptions: GroupByPeriod[];
}

// ==================== API Methods ====================

/**
 * Generate analytics report based on provided criteria
 *
 * @param request - Report generation parameters
 * @returns Promise resolving to report data with metrics and summary
 * @throws Error if report generation fails
 *
 * @example
 * ```typescript
 * const report = await generateReport({
 *   reportType: 'REVENUE',
 *   startDate: '2024-01-01',
 *   endDate: '2024-01-31',
 *   groupBy: 'DAY'
 * });
 * ```
 */
export async function generateReport(
  request: ReportRequest
): Promise<ReportResponse> {
  try {
    const response = await apiClient.post<ReportResponse>(
      '/api/v1/admin/reports/generate',
      request
    );
    return response;
  } catch (error: unknown) {
    console.error('Failed to generate report:', error);
    const err = error as { response?: { data?: { message?: string } } };
    throw new Error(
      err.response?.data?.message || 'Rapor oluşturulurken bir hata oluştu'
    );
  }
}

/**
 * Get available report types and their supported metrics
 * Useful for building dynamic UI report builders
 *
 * @returns Promise resolving to report types configuration
 * @throws Error if fetch fails
 *
 * @example
 * ```typescript
 * const { reportTypes, groupByOptions } = await getReportTypes();
 * ```
 */
export async function getReportTypes(): Promise<ReportTypesResponse> {
  try {
    const response = await apiClient.get<ReportTypesResponse>(
      '/api/v1/admin/reports/types'
    );
    return response;
  } catch (error: unknown) {
    console.error('Failed to fetch report types:', error);
    const err = error as { response?: { data?: { message?: string } } };
    throw new Error(
      err.response?.data?.message || 'Rapor tipleri yüklenirken bir hata oluştu'
    );
  }
}

// ==================== Helper Functions ====================

/**
 * Format date for API request (YYYY-MM-DD)
 */
export function formatDateForAPI(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get date range for common periods
 */
export function getDateRange(
  period: 'today' | 'week' | 'month' | 'quarter' | 'year'
): {
  startDate: string;
  endDate: string;
} {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case 'today':
      // Today only
      break;
    case 'week':
      start.setDate(start.getDate() - 7);
      break;
    case 'month':
      start.setMonth(start.getMonth() - 1);
      break;
    case 'quarter':
      start.setMonth(start.getMonth() - 3);
      break;
    case 'year':
      start.setFullYear(start.getFullYear() - 1);
      break;
  }

  return {
    startDate: formatDateForAPI(start),
    endDate: formatDateForAPI(end),
  };
}

/**
 * Get trend direction emoji/icon
 */
export function getTrendIcon(trend: TrendDirection): string {
  switch (trend) {
    case 'UP':
      return '↗️';
    case 'DOWN':
      return '↘️';
    case 'STABLE':
      return '→';
  }
}

/**
 * Get trend color class for styling
 */
export function getTrendColor(trend: TrendDirection): string {
  switch (trend) {
    case 'UP':
      return 'text-green-600';
    case 'DOWN':
      return 'text-red-600';
    case 'STABLE':
      return 'text-gray-600';
  }
}

/**
 * Format metric value based on type
 */
export function formatMetricValue(value: number, metricName: string): string {
  // Revenue/Amount metrics - format as currency
  if (
    metricName.toLowerCase().includes('revenue') ||
    metricName.toLowerCase().includes('amount') ||
    metricName.toLowerCase().includes('value')
  ) {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(value);
  }

  // Rate/Percentage metrics - format as percentage
  if (
    metricName.toLowerCase().includes('rate') ||
    metricName.toLowerCase().includes('percentage')
  ) {
    return `${value.toFixed(2)}%`;
  }

  // Count metrics - format as integer
  if (
    metricName.toLowerCase().includes('count') ||
    metricName.toLowerCase().includes('orders') ||
    metricName.toLowerCase().includes('users')
  ) {
    return new Intl.NumberFormat('tr-TR').format(Math.round(value));
  }

  // Default - format with 2 decimals
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}
