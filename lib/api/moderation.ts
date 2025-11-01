/**
 * ================================================
 * MODERATION API CLIENT
 * ================================================
 * API client for moderator endpoints
 *
 * Sprint 2.1: Moderator Dashboard - Real-time Stats
 * @version 1.0.0
 * @author MarifetBul Development Team
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import type {
  ModerationStats,
  PendingItemsResponse,
  ModeratorActivitiesResponse,
} from '@/types/business/moderation';

/**
 * API Response wrapper
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

// ============================================================================
// STATS & DASHBOARD
// ============================================================================

/**
 * Get moderation statistics
 * Backend: GET /api/v1/moderator/stats
 */
export async function getModerationStats(): Promise<ModerationStats> {
  const response = await apiClient.get<ApiResponse<ModerationStats>>(
    '/api/v1/moderator/stats'
  );
  return response.data;
}

/**
 * Get pending items queue
 * Backend: GET /api/v1/moderator/pending-items
 */
export async function getPendingItems(
  page = 1,
  pageSize = 10
): Promise<PendingItemsResponse> {
  const response = await apiClient.get<ApiResponse<PendingItemsResponse>>(
    '/api/v1/moderator/pending-items',
    { page: page.toString(), pageSize: pageSize.toString() }
  );
  return response.data;
}

/**
 * Get recent moderator activities
 * Backend: GET /api/v1/moderator/recent-activity
 */
export async function getRecentActivities(
  page = 1,
  pageSize = 20
): Promise<ModeratorActivitiesResponse> {
  const response = await apiClient.get<
    ApiResponse<ModeratorActivitiesResponse>
  >('/api/v1/moderator/recent-activity', {
    page: page.toString(),
    pageSize: pageSize.toString(),
  });
  return response.data;
}

// ============================================================================
// EXPORT API OBJECT
// ============================================================================

export const moderationApi = {
  // Stats & Dashboard
  getStats: getModerationStats,
  getPendingItems,
  getRecentActivities,
};

export default moderationApi;
