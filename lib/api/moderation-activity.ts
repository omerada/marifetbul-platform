/**
 * ================================================
 * MODERATION ACTIVITY LOGGER
 * ================================================
 * Logs moderation actions for audit trail
 * Integrates with backend activity logging system
 *
 * Day 2 Story 2.4 - Sprint 2
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import { ActionType } from '@/types/business/moderation';
import logger from '@/lib/infrastructure/monitoring/logger';

/**
 * Activity log entry
 */
export interface ModerationActivityLog {
  actionType: ActionType;
  targetType: 'COMMENT' | 'REVIEW' | 'USER' | 'REPORT';
  targetId: string;
  targetIds?: string[];
  reason?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Activity log response
 */
export interface ActivityLogResponse {
  activityId: string;
  timestamp: string;
  success: boolean;
}

/**
 * Log a moderation action
 * @throws {ValidationError} Invalid action data
 * @throws {AuthorizationError} Insufficient permissions
 */
export async function logModerationActivity(
  activity: ModerationActivityLog
): Promise<ActivityLogResponse> {
  try {
    const response = await apiClient.post<ActivityLogResponse>(
      '/api/v1/moderator/activity/log',
      {
        actionType: activity.actionType,
        targetType: activity.targetType,
        targetId: activity.targetId,
        targetIds: activity.targetIds,
        reason: activity.reason,
        notes: activity.notes,
        metadata: activity.metadata,
        timestamp: new Date().toISOString(),
      }
    );

    logger.info('Moderation activity logged', {
      activityId: response.activityId,
      actionType: activity.actionType,
      targetType: activity.targetType,
    });

    return response;
  } catch (error) {
    logger.error('Failed to log moderation activity', {
      error,
      activity,
    });
    // Don't throw - activity logging should not break main flow
    return {
      activityId: 'local_' + Date.now(),
      timestamp: new Date().toISOString(),
      success: false,
    };
  }
}

/**
 * Log comment approval
 */
export async function logCommentApproval(
  commentId: string,
  isBulk = false
): Promise<ActivityLogResponse> {
  return logModerationActivity({
    actionType: isBulk ? ActionType.BULK_APPROVE : ActionType.APPROVE,
    targetType: 'COMMENT',
    targetId: commentId,
    notes: isBulk ? 'Bulk approval action' : 'Single comment approved',
  });
}

/**
 * Log comment rejection
 */
export async function logCommentRejection(
  commentId: string,
  reason: string,
  message?: string,
  isBulk = false
): Promise<ActivityLogResponse> {
  return logModerationActivity({
    actionType: isBulk ? ActionType.BULK_REJECT : ActionType.REJECT,
    targetType: 'COMMENT',
    targetId: commentId,
    reason,
    notes: message,
  });
}

/**
 * Log spam marking
 */
export async function logSpamMarking(
  commentId: string,
  isBulk = false
): Promise<ActivityLogResponse> {
  return logModerationActivity({
    actionType: isBulk ? ActionType.BULK_SPAM : ActionType.SPAM,
    targetType: 'COMMENT',
    targetId: commentId,
    notes: isBulk ? 'Bulk spam marking' : 'Comment marked as spam',
  });
}

/**
 * Log bulk approval
 */
export async function logBulkApproval(
  commentIds: string[]
): Promise<ActivityLogResponse> {
  return logModerationActivity({
    actionType: ActionType.BULK_APPROVE,
    targetType: 'COMMENT',
    targetId: commentIds[0], // First ID as primary
    targetIds: commentIds,
    notes: `Bulk approved ${commentIds.length} comments`,
    metadata: {
      count: commentIds.length,
      commentIds,
    },
  });
}

/**
 * Log bulk rejection
 */
export async function logBulkRejection(
  commentIds: string[],
  reason: string,
  message?: string
): Promise<ActivityLogResponse> {
  return logModerationActivity({
    actionType: ActionType.BULK_REJECT,
    targetType: 'COMMENT',
    targetId: commentIds[0],
    targetIds: commentIds,
    reason,
    notes: message || `Bulk rejected ${commentIds.length} comments`,
    metadata: {
      count: commentIds.length,
      commentIds,
    },
  });
}

/**
 * Log bulk spam marking
 */
export async function logBulkSpam(
  commentIds: string[]
): Promise<ActivityLogResponse> {
  return logModerationActivity({
    actionType: ActionType.BULK_SPAM,
    targetType: 'COMMENT',
    targetId: commentIds[0],
    targetIds: commentIds,
    notes: `Bulk marked ${commentIds.length} comments as spam`,
    metadata: {
      count: commentIds.length,
      commentIds,
    },
  });
}

/**
 * Get moderator activity history
 */
export async function getModeratorActivityHistory(filters?: {
  startDate?: string;
  endDate?: string;
  actionType?: ActionType;
  targetType?: string;
  page?: number;
  size?: number;
}): Promise<{
  activities: Array<{
    activityId: string;
    actionType: ActionType;
    targetType: string;
    targetId: string;
    reason?: string;
    notes?: string;
    timestamp: string;
    moderatorName: string;
  }>;
  total: number;
  page: number;
  size: number;
}> {
  const params = new URLSearchParams();

  if (filters?.startDate) params.set('startDate', filters.startDate);
  if (filters?.endDate) params.set('endDate', filters.endDate);
  if (filters?.actionType) params.set('actionType', filters.actionType);
  if (filters?.targetType) params.set('targetType', filters.targetType);
  if (filters?.page !== undefined) params.set('page', filters.page.toString());
  if (filters?.size !== undefined) params.set('size', filters.size.toString());

  const queryString = params.toString();
  const url = `/api/v1/moderator/activity/history${queryString ? `?${queryString}` : ''}`;

  return apiClient.get(url);
}

/**
 * Get activity statistics
 */
export async function getActivityStatistics(
  startDate?: string,
  endDate?: string
): Promise<{
  totalActions: number;
  actionsByType: Record<ActionType, number>;
  actionsByDay: Array<{ date: string; count: number }>;
  topModerators: Array<{ moderatorName: string; actionCount: number }>;
}> {
  const params = new URLSearchParams();

  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);

  const queryString = params.toString();
  const url = `/api/v1/moderator/activity/statistics${queryString ? `?${queryString}` : ''}`;

  return apiClient.get(url);
}

const moderationActivityAPI = {
  logModerationActivity,
  logCommentApproval,
  logCommentRejection,
  logSpamMarking,
  logBulkApproval,
  logBulkRejection,
  logBulkSpam,
  getModeratorActivityHistory,
  getActivityStatistics,
};

export default moderationActivityAPI;
