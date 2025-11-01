/**
 * ================================================
 * MODERATION TYPES
 * ================================================
 * Types for content moderation system
 *
 * Sprint 2: Moderasyon Sistemi UI/UX
 * @version 1.0.0
 * @author MarifetBul Development Team
 */

/**
 * Moderation statistics for dashboard
 */
export interface ModerationStats {
  pendingComments: number;
  flaggedReviews: number;
  userReports: number;
  openTickets: number;
  // Additional metrics
  todayModerated: number;
  weekModerated: number;
  averageResponseTime: number; // in minutes
}

/**
 * Pending item types
 */
export enum PendingItemType {
  COMMENT = 'COMMENT',
  REVIEW = 'REVIEW',
  REPORT = 'REPORT',
  TICKET = 'TICKET',
}

/**
 * Pending moderation item
 */
export interface PendingItem {
  id: string;
  type: PendingItemType;
  title: string;
  description: string;
  createdAt: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  url: string; // Link to detailed view
}

/**
 * Recent activity item
 */
export interface ModeratorActivity {
  id: string;
  moderatorId: string;
  moderatorName: string;
  action: string; // "approved", "rejected", "banned", etc.
  targetType: PendingItemType;
  targetId: string;
  targetTitle: string;
  timestamp: string;
  reason?: string;
}

/**
 * API response for pending items
 */
export interface PendingItemsResponse {
  items: PendingItem[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * API response for recent activities
 */
export interface ModeratorActivitiesResponse {
  activities: ModeratorActivity[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Real-time update event
 */
export interface ModerationUpdateEvent {
  type: 'stats_update' | 'new_item' | 'item_resolved';
  data: Partial<ModerationStats> | PendingItem | { id: string };
  timestamp: string;
}
