import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { apiClient } from '@/lib/infrastructure/api/client';

/**
 * Notification Analytics API Hooks
 *
 * React Query hooks for notification analytics API including:
 * - System-wide analytics (admin only)
 * - User-specific statistics
 * - Flexible period selection
 * - Automatic caching and refetching
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-11-24
 */

// ========================================================================
// Type Definitions
// ========================================================================

export interface NotificationAnalyticsData {
  periodStart: string;
  periodEnd: string;
  totalSent: number;
  totalRead: number;
  totalUnread: number;
  readRate: number;
  avgReadTimeMinutes: number;
  emailStats: EmailStats;
  pushStats: PushStats;
  inAppStats: InAppStats;
  typeBreakdown: TypeBreakdown[];
  priorityBreakdown: PriorityBreakdown[];
  dailyTrends: DailyTrend[];
  hourlyDistribution: Record<number, number>;
  topPerformingTypes: TypePerformance[];
  generatedAt: string;
}

export interface EmailStats {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalFailed: number;
  totalBounced: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  avgSendTimeMs: number;
}

export interface PushStats {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  deliveryRate: number;
  avgDevicesPerUser: number;
}

export interface InAppStats {
  totalCreated: number;
  totalRead: number;
  totalUnread: number;
  readRate: number;
  avgReadTimeMinutes: number;
}

export interface TypeBreakdown {
  type: string;
  count: number;
  percentage: number;
  readCount: number;
  readRate: number;
}

export interface PriorityBreakdown {
  priority: string;
  count: number;
  percentage: number;
  avgReadTimeMinutes: number;
}

export interface DailyTrend {
  date: string;
  totalSent: number;
  totalRead: number;
  readRate: number;
  emailSent: number;
  pushSent: number;
}

export interface TypePerformance {
  type: string;
  totalSent: number;
  engagementScore: number;
  avgReadTimeMinutes: number;
}

export interface UserNotificationStats {
  userId: string;
  totalReceived: number;
  totalUnread: number;
  totalRead: number;
  readRate: number;
  avgReadTimeMinutes: number;
  byType: Record<string, number>;
  unreadByType: Record<string, number>;
  byPriority: Record<string, number>;
  last7Days: number;
  last30Days: number;
  emailSent: number;
  pushSent: number;
  lastNotificationAt: string | null;
  lastReadAt: string | null;
  mostActiveHour: number | null;
  generatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

// ========================================================================
// API Functions
// ========================================================================

/**
 * Fetch system-wide notification analytics
 *
 * @param startDate Optional start date (ISO string)
 * @param endDate Optional end date (ISO string)
 * @returns Promise<NotificationAnalyticsData>
 */
async function fetchSystemAnalytics(
  startDate?: string,
  endDate?: string
): Promise<NotificationAnalyticsData> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const response = await apiClient.get<ApiResponse<NotificationAnalyticsData>>(
    `/notifications/analytics/system${params.toString() ? `?${params.toString()}` : ''}`
  );

  return response.data;
}

/**
 * Fetch system analytics for last N days
 *
 * @param days Number of days (7, 30, 90)
 * @returns Promise<NotificationAnalyticsData>
 */
async function fetchSystemAnalyticsForDays(
  days: number
): Promise<NotificationAnalyticsData> {
  const response = await apiClient.get<ApiResponse<NotificationAnalyticsData>>(
    `/notifications/analytics/system/last-days/${days}`
  );

  return response.data;
}

/**
 * Fetch weekly system analytics
 *
 * @returns Promise<NotificationAnalyticsData>
 */
async function fetchWeeklySystemAnalytics(): Promise<NotificationAnalyticsData> {
  const response = await apiClient.get<ApiResponse<NotificationAnalyticsData>>(
    '/notifications/analytics/system/week'
  );

  return response.data;
}

/**
 * Fetch monthly system analytics
 *
 * @returns Promise<NotificationAnalyticsData>
 */
async function fetchMonthlySystemAnalytics(): Promise<NotificationAnalyticsData> {
  const response = await apiClient.get<ApiResponse<NotificationAnalyticsData>>(
    '/notifications/analytics/system/month'
  );

  return response.data;
}

/**
 * Fetch quarterly system analytics
 *
 * @returns Promise<NotificationAnalyticsData>
 */
async function fetchQuarterlySystemAnalytics(): Promise<NotificationAnalyticsData> {
  const response = await apiClient.get<ApiResponse<NotificationAnalyticsData>>(
    '/notifications/analytics/system/quarter'
  );

  return response.data;
}

/**
 * Fetch current user's notification statistics
 *
 * @returns Promise<UserNotificationStats>
 */
async function fetchMyNotificationStats(): Promise<UserNotificationStats> {
  const response = await apiClient.get<ApiResponse<UserNotificationStats>>(
    '/notifications/analytics/me'
  );

  return response.data;
}

/**
 * Fetch notification statistics for a specific user
 *
 * @param userId User UUID
 * @returns Promise<UserNotificationStats>
 */
async function fetchUserNotificationStats(
  userId: string
): Promise<UserNotificationStats> {
  const response = await apiClient.get<ApiResponse<UserNotificationStats>>(
    `/notifications/analytics/user/${userId}`
  );

  return response.data;
}

// ========================================================================
// React Query Hooks
// ========================================================================

/**
 * Hook to fetch system-wide notification analytics
 *
 * @param options Query options
 * @returns UseQueryResult<NotificationAnalyticsData>
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useSystemNotificationAnalytics({
 *   period: '30d',
 *   enabled: isAdmin
 * });
 * ```
 */
export function useSystemNotificationAnalytics(options?: {
  period?: '7d' | '30d' | '90d' | 'custom';
  startDate?: string;
  endDate?: string;
  enabled?: boolean;
}): UseQueryResult<NotificationAnalyticsData> {
  const { period = '30d', startDate, endDate, enabled = true } = options || {};

  return useQuery({
    queryKey: ['notificationAnalytics', 'system', period, startDate, endDate],
    queryFn: async () => {
      if (period === 'custom' && startDate && endDate) {
        return fetchSystemAnalytics(startDate, endDate);
      }

      switch (period) {
        case '7d':
          return fetchWeeklySystemAnalytics();
        case '30d':
          return fetchMonthlySystemAnalytics();
        case '90d':
          return fetchQuarterlySystemAnalytics();
        default:
          return fetchMonthlySystemAnalytics();
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

/**
 * Hook to fetch current user's notification statistics
 *
 * @param enabled Optional enable flag
 * @returns UseQueryResult<UserNotificationStats>
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useMyNotificationStats();
 * ```
 */
export function useMyNotificationStats(
  enabled = true
): UseQueryResult<UserNotificationStats> {
  return useQuery({
    queryKey: ['notificationStats', 'me'],
    queryFn: fetchMyNotificationStats,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch notification statistics for a specific user
 *
 * @param userId User UUID
 * @param enabled Optional enable flag
 * @returns UseQueryResult<UserNotificationStats>
 *
 * @example
 * ```tsx
 * const { data } = useUserNotificationStats(userId, isAdmin);
 * ```
 */
export function useUserNotificationStats(
  userId: string,
  enabled = true
): UseQueryResult<UserNotificationStats> {
  return useQuery({
    queryKey: ['notificationStats', 'user', userId],
    queryFn: () => fetchUserNotificationStats(userId),
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
