/**
 * ================================================
 * MODERATOR DASHBOARD API
 * ================================================
 * API functions for moderator dashboard operations
 *
 * Backend Controller: ModeratorDashboardController.java
 * Base Path: /api/v1/dashboard/moderator
 *
 * Sprint 1 - Story 2: Moderator Dashboard Implementation
 *
 * @created 2025-11-14
 * @author MarifetBul Development Team
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import { DASHBOARD_ENDPOINTS } from './endpoints';
import type {
  ModeratorDashboardApiResponse,
  ModerationStatsDto,
  PendingItemsResponse,
  ActivityLogDto,
} from '@/types/backend/dashboard';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get moderator dashboard statistics
 *
 * Returns aggregated moderation statistics including:
 * - Pending items count (comments, reviews, reports, tickets)
 * - Today's actions (approvals, rejections)
 * - Performance metrics (response time, accuracy)
 *
 * @returns Moderation statistics
 */
export async function getModeratorStats(): Promise<ModerationStatsDto> {
  logger.debug('[ModeratorDashboardAPI] Fetching moderator stats');

  const response = await apiClient.get<ModerationStatsDto>(
    DASHBOARD_ENDPOINTS.MODERATOR_STATS
  );

  logger.info('[ModeratorDashboardAPI] Stats fetched successfully', {
    pendingItems: response.totalPendingItems,
    actionsToday: response.totalActionsToday,
  });

  return response;
}

/**
 * Get pending moderation items
 *
 * Returns paginated list of pending items across all categories:
 * - Comments (pending, flagged)
 * - Reviews (pending, flagged)
 * - Reports
 * - Support tickets
 *
 * Items are sorted by priority (HIGH > MEDIUM > LOW) and waiting time.
 *
 * @param page - Page number (0-based, default: 0)
 * @param size - Page size (default: 20, max: 100)
 * @returns Paginated pending items
 */
export async function getPendingItems(
  page = 0,
  size = 20
): Promise<PendingItemsResponse> {
  logger.debug('[ModeratorDashboardAPI] Fetching pending items', {
    page,
    size,
  });

  const url = `${DASHBOARD_ENDPOINTS.MODERATOR_PENDING_ITEMS}?page=${page}&size=${size}`;
  const response = await apiClient.get<PendingItemsResponse>(url);

  logger.info('[ModeratorDashboardAPI] Pending items fetched', {
    totalCount: response.totalCount,
    currentPage: response.currentPage,
  });

  return response;
}

/**
 * Get recent moderator activity
 *
 * Returns chronological list of recent moderation actions:
 * - Approvals
 * - Rejections
 * - Spam markings
 * - User warnings/bans
 * - Ticket resolutions
 *
 * @param limit - Number of activities to return (default: 20, max: 100)
 * @returns Recent activity logs
 */
export async function getRecentActivity(limit = 20): Promise<ActivityLogDto[]> {
  logger.debug('[ModeratorDashboardAPI] Fetching recent activity', { limit });

  const url = `${DASHBOARD_ENDPOINTS.MODERATOR_RECENT_ACTIVITY}?limit=${limit}`;
  const response = await apiClient.get<ActivityLogDto[]>(url);

  logger.info('[ModeratorDashboardAPI] Recent activity fetched', {
    count: response.length,
  });

  return response;
}

/**
 * Get complete moderator dashboard data
 *
 * Fetches all dashboard data in parallel:
 * - Statistics
 * - Pending items (first page)
 * - Recent activities
 *
 * This is the main function used by the dashboard.
 *
 * @returns Complete moderator dashboard data
 */
export async function getModeratorDashboard(): Promise<ModeratorDashboardApiResponse> {
  logger.debug('[ModeratorDashboardAPI] Fetching complete dashboard');

  try {
    // Fetch all data in parallel for better performance
    const [stats, pendingItems, activities] = await Promise.all([
      getModeratorStats(),
      getPendingItems(0, 10), // First 10 items for dashboard
      getRecentActivity(10), // Last 10 activities for dashboard
    ]);

    // Combine into complete dashboard response
    const dashboard: ModeratorDashboardApiResponse = {
      stats,
      pendingItems,
      recentActivities: {
        activities,
        totalCount: activities.length,
      },
      moderatorId: '', // Will be filled by store from auth
      moderatorName: '', // Will be filled by store from auth
      generatedAt: new Date().toISOString(),
      fromCache: false,
      cacheAgeSeconds: 0,
    };

    logger.info(
      '[ModeratorDashboardAPI] Complete dashboard fetched successfully'
    );

    return dashboard;
  } catch (error) {
    logger.error(
      '[ModeratorDashboardAPI] Failed to fetch dashboard',
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const moderatorDashboardApi = {
  getStats: getModeratorStats,
  getPendingItems,
  getRecentActivity,
  getDashboard: getModeratorDashboard,
};

export default moderatorDashboardApi;
