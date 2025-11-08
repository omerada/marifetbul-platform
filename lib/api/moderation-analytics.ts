/**
 * ================================================
 * MODERATION ANALYTICS API
 * ================================================
 * API functions for moderator performance analytics and metrics
 *
 * Sprint: Sprint 3 - Day 4 (Moderator Dashboard Enhancement)
 * Features: SLA tracking, performance metrics, trend analysis, workload distribution
 * Backend: /api/v1/blog/admin/moderation/analytics
 *
 * @version 1.0.0
 * @author MarifetBul Development Team
 * @created November 2, 2025
 */

import { apiClient } from '@/lib/infrastructure/api/client';

// Sprint 1: formatPercentageCanonical import removed (no longer used)

// ================================================
// TYPES & INTERFACES
// ================================================

/**
 * Time period for analytics
 */
export type AnalyticsPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year';

/**
 * SLA (Service Level Agreement) metrics
 * Tracks response time and resolution time performance
 */
export interface SLAMetrics {
  // Response time metrics (time to first action)
  averageResponseTimeMinutes: number;
  medianResponseTimeMinutes: number;
  slaResponseTarget: number; // Target in minutes
  slaResponseComplianceRate: number; // Percentage (0-100)

  // Resolution time metrics (time to final decision)
  averageResolutionTimeMinutes: number;
  medianResolutionTimeMinutes: number;
  slaResolutionTarget: number; // Target in minutes
  slaResolutionComplianceRate: number; // Percentage (0-100)

  // Breakdown by priority
  highPrioritySLA: {
    responseTime: number;
    resolutionTime: number;
    complianceRate: number;
  };
  mediumPrioritySLA: {
    responseTime: number;
    resolutionTime: number;
    complianceRate: number;
  };
  lowPrioritySLA: {
    responseTime: number;
    resolutionTime: number;
    complianceRate: number;
  };
}

/**
 * Individual moderator performance metrics
 */
export interface ModeratorPerformance {
  moderatorId: string;
  moderatorName: string;
  moderatorAvatar?: string;

  // Volume metrics
  totalReviews: number;
  approvedCount: number;
  rejectedCount: number;
  escalatedCount: number;

  // Quality metrics
  approvalRate: number; // Percentage (0-100)
  overturnRate: number; // Percentage of decisions overturned by admins
  accuracyScore: number; // Percentage (0-100)

  // Speed metrics
  averageResponseTimeMinutes: number;
  averageResolutionTimeMinutes: number;

  // Activity metrics
  reviewsThisWeek: number;
  reviewsThisMonth: number;
  lastActiveAt: string;

  // SLA compliance
  slaComplianceRate: number; // Percentage (0-100)
}

/**
 * Workload distribution across moderators
 */
export interface WorkloadDistribution {
  totalPendingReviews: number;
  totalModerators: number;
  averageWorkloadPerModerator: number;

  // Distribution by moderator
  byModerator: Array<{
    moderatorId: string;
    moderatorName: string;
    assignedReviews: number;
    completedToday: number;
    pendingReviews: number;
    workloadPercentage: number; // Percentage of total workload
  }>;

  // Distribution by priority
  byPriority: {
    high: number;
    medium: number;
    low: number;
  };

  // Distribution by category
  byCategory: {
    spam: number;
    offensive: number;
    inappropriate: number;
    misinformation: number;
    harassment: number;
    other: number;
  };
}

/**
 * Trend data for charts and visualizations
 */
export interface ModerationTrends {
  // Daily activity over time
  dailyActivity: Array<{
    date: string; // ISO date
    pendingStart: number;
    reviewed: number;
    approved: number;
    rejected: number;
    pendingEnd: number;
  }>;

  // Response time trends
  responseTimeTrends: Array<{
    date: string;
    averageMinutes: number;
    target: number;
  }>;

  // Resolution time trends
  resolutionTimeTrends: Array<{
    date: string;
    averageMinutes: number;
    target: number;
  }>;

  // Category trends
  categoryTrends: Array<{
    date: string;
    spam: number;
    offensive: number;
    inappropriate: number;
    misinformation: number;
    harassment: number;
    other: number;
  }>;

  // Flag trends
  flagTrends: Array<{
    date: string;
    totalFlags: number;
    resolvedFlags: number;
    dismissedFlags: number;
  }>;
}

/**
 * Overview statistics for the dashboard
 */
export interface ModerationOverviewStats {
  // Current state
  totalPending: number;
  totalInReview: number;
  totalFlagged: number;
  totalEscalated: number;

  // Today's activity
  reviewedToday: number;
  approvedToday: number;
  rejectedToday: number;
  flagsReceivedToday: number;

  // Period comparison (vs previous period)
  pendingChange: number; // Percentage change
  reviewedChange: number; // Percentage change
  flagsChange: number; // Percentage change

  // Quality metrics
  averageAccuracyScore: number;
  overturnRate: number;
  escalationRate: number;

  // Active moderators
  activeModerators: number;
  totalModerators: number;
}

/**
 * Complete analytics dashboard data
 */
export interface ModerationAnalytics {
  period: AnalyticsPeriod;
  startDate: string;
  endDate: string;

  overview: ModerationOverviewStats;
  slaMetrics: SLAMetrics;
  workload: WorkloadDistribution;
  trends: ModerationTrends;
  topPerformers: ModeratorPerformance[];

  // Metadata
  generatedAt: string;
  dataQuality: 'complete' | 'partial' | 'incomplete';
}

/**
 * Analytics filters
 */
export interface AnalyticsFilters {
  period?: AnalyticsPeriod;
  startDate?: string;
  endDate?: string;
  moderatorId?: string;
  categoryFilter?: string[];
  includeWeekends?: boolean;
}

// ================================================
// API FUNCTIONS
// ================================================

/**
 * Get comprehensive moderation analytics
 *
 * @param filters - Analytics filters
 * @returns Complete analytics dashboard data
 *
 * @endpoint GET /api/v1/blog/admin/moderation/analytics
 */
export async function getModerationAnalytics(
  filters: AnalyticsFilters = {}
): Promise<ModerationAnalytics> {
  const params: Record<string, string> = {};

  if (filters.period) params.period = filters.period;
  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;
  if (filters.moderatorId) params.moderatorId = filters.moderatorId;
  if (filters.includeWeekends !== undefined) {
    params.includeWeekends = filters.includeWeekends.toString();
  }
  if (filters.categoryFilter && filters.categoryFilter.length > 0) {
    params.categories = filters.categoryFilter.join(',');
  }

  return apiClient.get<ModerationAnalytics>(
    '/api/v1/blog/admin/moderation/analytics',
    params
  );
}

/**
 * Get SLA metrics only
 *
 * @param period - Time period
 * @returns SLA metrics
 *
 * @endpoint GET /api/v1/blog/admin/moderation/analytics/sla
 */
export async function getSLAMetrics(
  period: AnalyticsPeriod = 'week'
): Promise<SLAMetrics> {
  return apiClient.get<SLAMetrics>(
    '/api/v1/blog/admin/moderation/analytics/sla',
    { period }
  );
}

/**
 * Get workload distribution
 *
 * @returns Current workload distribution
 *
 * @endpoint GET /api/v1/blog/admin/moderation/analytics/workload
 */
export async function getWorkloadDistribution(): Promise<WorkloadDistribution> {
  return apiClient.get('/api/v1/blog/admin/moderation/analytics/workload');
}

/**
 * Get moderator performance metrics
 *
 * @param period - Time period
 * @param moderatorId - Optional specific moderator ID
 * @returns Array of moderator performance data
 *
 * @endpoint GET /api/v1/blog/admin/moderation/analytics/moderators
 */
export async function getModeratorPerformance(
  period: AnalyticsPeriod = 'month',
  moderatorId?: string
): Promise<ModeratorPerformance[]> {
  const params: Record<string, string> = { period };
  if (moderatorId) params.moderatorId = moderatorId;

  return apiClient.get<ModeratorPerformance[]>(
    '/api/v1/blog/admin/moderation/analytics/moderators',
    params
  );
}

/**
 * Get moderation trends for charts
 *
 * @param period - Time period
 * @param startDate - Optional start date
 * @param endDate - Optional end date
 * @returns Trend data for visualizations
 *
 * @endpoint GET /api/v1/blog/admin/moderation/analytics/trends
 */
export async function getModerationTrends(
  period: AnalyticsPeriod = 'month',
  startDate?: string,
  endDate?: string
): Promise<ModerationTrends> {
  const params: Record<string, string> = { period };
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  return apiClient.get<ModerationTrends>(
    '/api/v1/blog/admin/moderation/analytics/trends',
    params
  );
}

/**
 * Get overview statistics
 *
 * @returns Current overview statistics
 *
 * @endpoint GET /api/v1/blog/admin/moderation/analytics/overview
 */
export async function getOverviewStats(): Promise<ModerationOverviewStats> {
  return apiClient.get('/api/v1/blog/admin/moderation/analytics/overview');
}

/**
 * Export analytics report
 *
 * @param filters - Analytics filters
 * @param format - Export format (pdf, excel, csv)
 * @returns Blob containing the report
 *
 * @endpoint GET /api/v1/blog/admin/moderation/analytics/export
 */
export async function exportAnalyticsReport(
  filters: AnalyticsFilters = {},
  format: 'pdf' | 'excel' | 'csv' = 'pdf'
): Promise<Blob> {
  const params: Record<string, string> = { format };

  if (filters.period) params.period = filters.period;
  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;

  return apiClient.get<Blob>(
    '/api/v1/blog/admin/moderation/analytics/export',
    params
  );
}

/**
 * Get real-time dashboard data
 * Lightweight endpoint for frequent polling
 *
 * @returns Current real-time statistics
 *
 * @endpoint GET /api/v1/blog/admin/moderation/analytics/realtime
 */
export async function getRealtimeStats(): Promise<{
  pendingCount: number;
  inReviewCount: number;
  flaggedCount: number;
  activeModerators: number;
  lastUpdate: string;
}> {
  return apiClient.get('/api/v1/blog/admin/moderation/analytics/realtime');
}

// ================================================
// HELPER FUNCTIONS
// ================================================

/**
 * Get period label in Turkish
 */
export function getPeriodLabel(period: AnalyticsPeriod): string {
  const labels: Record<AnalyticsPeriod, string> = {
    day: 'Bugün',
    week: 'Bu Hafta',
    month: 'Bu Ay',
    quarter: 'Bu Çeyrek',
    year: 'Bu Yıl',
  };
  return labels[period];
}

/**
 * Get SLA status color based on compliance rate
 */
export function getSLAStatusColor(complianceRate: number): string {
  if (complianceRate >= 95) return 'text-green-600 bg-green-100';
  if (complianceRate >= 85) return 'text-yellow-600 bg-yellow-100';
  if (complianceRate >= 70) return 'text-orange-600 bg-orange-100';
  return 'text-red-600 bg-red-100';
}

/**
 * Get performance tier based on accuracy score
 */
export function getPerformanceTier(accuracyScore: number): {
  tier: string;
  color: string;
} {
  if (accuracyScore >= 95) {
    return { tier: 'Mükemmel', color: 'text-green-600' };
  }
  if (accuracyScore >= 85) {
    return { tier: 'Çok İyi', color: 'text-blue-600' };
  }
  if (accuracyScore >= 75) {
    return { tier: 'İyi', color: 'text-yellow-600' };
  }
  if (accuracyScore >= 60) {
    return { tier: 'Orta', color: 'text-orange-600' };
  }
  return { tier: 'Geliştirilmeli', color: 'text-red-600' };
}

/**
 * Calculate trend direction
 */
export function getTrendDirection(change: number): {
  direction: 'up' | 'down' | 'stable';
  color: string;
  icon: string;
} {
  if (change > 5) {
    return { direction: 'up', color: 'text-red-600', icon: '↑' };
  }
  if (change < -5) {
    return { direction: 'down', color: 'text-green-600', icon: '↓' };
  }
  return { direction: 'stable', color: 'text-gray-600', icon: '→' };
}

/**
 * Format time duration
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)} dk`;
  }
  if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hours}s ${mins}dk` : `${hours}s`;
  }
  const days = Math.floor(minutes / 1440);
  const hours = Math.round((minutes % 1440) / 60);
  return hours > 0 ? `${days}g ${hours}s` : `${days}g`;
}

// Sprint 1 Cleanup: formatPercentage removed - use @/lib/shared/formatters

/**
 * Get workload status color
 */
export function getWorkloadStatusColor(workloadPercentage: number): string {
  if (workloadPercentage < 15) return 'text-green-600 bg-green-100';
  if (workloadPercentage < 25) return 'text-blue-600 bg-blue-100';
  if (workloadPercentage < 35) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
}
