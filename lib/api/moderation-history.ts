/**
 * ================================================
 * MODERATION HISTORY API CLIENT
 * ================================================
 * API client for moderation audit trail system
 * 
 * Features:
 * - Record moderation actions
 * - Search history with filters
 * - Moderator performance analytics
 * - Content/User moderation tracking
 * - Reversal operations
 * 
 * Backend Routes:
 * - POST   /api/v1/moderation/history
 * - GET    /api/v1/moderation/history
 * - GET    /api/v1/moderation/history/{id}
 * - GET    /api/v1/moderation/history/moderator/{moderatorId}
 * - GET    /api/v1/moderation/history/content/{contentType}/{contentId}
 * - GET    /api/v1/moderation/history/target-user/{userId}
 * - GET    /api/v1/moderation/history/appeal/{appealId}
 * - PUT    /api/v1/moderation/history/{id}/reverse
 * - PUT    /api/v1/moderation/history/{id}/link-appeal
 * - GET    /api/v1/moderation/history/stats/moderator/{moderatorId}
 * 
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 1 - EPIC 1: Moderation System
 * @created November 10, 2025
 */

import { getBackendApiUrl } from '@/lib/config/api';
import type { PageResponse } from '@/types/backend-aligned';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type ContentType =
  | 'REVIEW'
  | 'COMMENT'
  | 'JOB'
  | 'PACKAGE'
  | 'MESSAGE'
  | 'PROFILE'
  | 'PORTFOLIO'
  | 'USER_ACCOUNT';

export type ModerationAction =
  // Content Actions
  | 'CONTENT_APPROVED'
  | 'CONTENT_REJECTED'
  | 'CONTENT_HIDDEN'
  | 'CONTENT_DELETED'
  | 'CONTENT_EDITED'
  | 'CONTENT_FLAGGED'
  // User Actions
  | 'USER_WARNING'
  | 'USER_SUSPENDED'
  | 'USER_BANNED'
  | 'USER_RESTRICTED'
  | 'USER_VERIFIED'
  // Appeal Actions
  | 'APPEAL_APPROVED'
  | 'APPEAL_REJECTED'
  | 'APPEAL_ESCALATED'
  // System Actions
  | 'AUTO_FLAGGED'
  | 'AUTO_HIDDEN'
  | 'MANUAL_REVIEW';

export type ActionSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ModerationHistory {
  id: string;

  // Moderator Information
  moderatorId: string;
  moderatorName?: string;
  moderatorRole?: string;

  // Content Information
  contentType: ContentType;
  contentId: string;
  contentSummary?: string;
  targetUserId?: string;
  targetUserName?: string;

  // Action Details
  actionType: ModerationAction;
  severity: ActionSeverity;
  reason: string;
  internalNotes?: string;
  publicMessage?: string;

  // State Tracking
  beforeState?: Record<string, any>;
  afterState?: Record<string, any>;
  isReversed: boolean;
  reversedAt?: string;
  reversedBy?: string;
  reversalReason?: string;

  // Appeal Linkage
  appealId?: string;
  hasAppeal: boolean;

  // Metadata
  metadata?: Record<string, any>;
  processingDurationMs?: number;
  isAutomated: boolean;
  confidenceScore?: number;

  // Timestamps
  createdAt: string;
}

export interface RecordModerationRequest {
  moderatorId: string;
  moderatorName?: string;
  moderatorRole?: string;
  contentType: ContentType;
  contentId: string;
  contentSummary?: string;
  targetUserId?: string;
  targetUserName?: string;
  actionType: ModerationAction;
  severity?: ActionSeverity;
  reason: string;
  internalNotes?: string;
  publicMessage?: string;
  beforeState?: Record<string, any>;
  afterState?: Record<string, any>;
  metadata?: Record<string, any>;
  isAutomated?: boolean;
  confidenceScore?: number;
  processingDurationMs?: number;
}

export interface ReverseActionRequest {
  reversedBy: string;
  reason: string;
}

export interface ModerationStats {
  moderatorId?: string;
  moderatorName?: string;
  actionCount?: number;
  totalActions: number;
  reversedActions: number;
  appealedActions: number;
  severeActions: number;
  avgProcessingTime: number;
  reversalRate: number;
  appealRate: number;
}

export interface HistoryFilters {
  moderatorId?: string;
  contentType?: ContentType;
  actionType?: ModerationAction;
  severity?: ActionSeverity;
  isReversed?: boolean;
  hasAppeal?: boolean;
  targetUserId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'ASC' | 'DESC';
}

// ============================================================================
// API HELPER
// ============================================================================

async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const backendUrl = getBackendApiUrl();
  const url = `${backendUrl}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    logger.error('Moderation History API error', new Error(`${endpoint} - ${response.status}: ${error.message || 'Unknown error'}`));
    throw new Error(error.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data || data;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Record a moderation action
 * Admin/Moderator only
 */
export async function recordModerationAction(
  request: RecordModerationRequest
): Promise<ModerationHistory> {
  return apiCall<ModerationHistory>('/api/v1/moderation/history', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Search moderation history with filters
 * Admin/Moderator only
 */
export async function searchHistory(
  filters: HistoryFilters = {}
): Promise<PageResponse<ModerationHistory>> {
  const params = new URLSearchParams();

  if (filters.moderatorId) params.append('moderatorId', filters.moderatorId);
  if (filters.contentType) params.append('contentType', filters.contentType);
  if (filters.actionType) params.append('actionType', filters.actionType);
  if (filters.severity) params.append('severity', filters.severity);
  if (filters.isReversed !== undefined)
    params.append('isReversed', String(filters.isReversed));
  if (filters.hasAppeal !== undefined)
    params.append('hasAppeal', String(filters.hasAppeal));
  if (filters.targetUserId) params.append('targetUserId', filters.targetUserId);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);

  params.append('page', String(filters.page || 0));
  params.append('size', String(filters.size || 20));
  params.append('sortBy', filters.sortBy || 'createdAt');
  params.append('direction', filters.direction || 'DESC');

  return apiCall<PageResponse<ModerationHistory>>(
    `/api/v1/moderation/history?${params.toString()}`
  );
}

/**
 * Get moderation history by ID
 */
export async function getHistoryById(id: string): Promise<ModerationHistory> {
  return apiCall<ModerationHistory>(`/api/v1/moderation/history/${id}`);
}

/**
 * Get moderator's action history
 */
export async function getModeratorHistory(
  moderatorId: string,
  page: number = 0,
  size: number = 20
): Promise<PageResponse<ModerationHistory>> {
  return apiCall<PageResponse<ModerationHistory>>(
    `/api/v1/moderation/history/moderator/${moderatorId}?page=${page}&size=${size}`
  );
}

/**
 * Get content moderation history
 */
export async function getContentHistory(
  contentType: ContentType,
  contentId: string,
  page: number = 0,
  size: number = 20
): Promise<PageResponse<ModerationHistory>> {
  return apiCall<PageResponse<ModerationHistory>>(
    `/api/v1/moderation/history/content/${contentType}/${contentId}?page=${page}&size=${size}`
  );
}

/**
 * Get user's moderation history (as target)
 */
export async function getTargetUserHistory(
  userId: string,
  page: number = 0,
  size: number = 20
): Promise<PageResponse<ModerationHistory>> {
  return apiCall<PageResponse<ModerationHistory>>(
    `/api/v1/moderation/history/target-user/${userId}?page=${page}&size=${size}`
  );
}

/**
 * Get appeal-related moderation history
 */
export async function getAppealHistory(appealId: string): Promise<ModerationHistory[]> {
  return apiCall<ModerationHistory[]>(
    `/api/v1/moderation/history/appeal/${appealId}`
  );
}

/**
 * Reverse a moderation action
 * Admin only
 */
export async function reverseAction(
  historyId: string,
  request: ReverseActionRequest
): Promise<ModerationHistory> {
  return apiCall<ModerationHistory>(
    `/api/v1/moderation/history/${historyId}/reverse`,
    {
      method: 'PUT',
      body: JSON.stringify(request),
    }
  );
}

/**
 * Link history to appeal
 */
export async function linkToAppeal(
  historyId: string,
  appealId: string
): Promise<ModerationHistory> {
  return apiCall<ModerationHistory>(
    `/api/v1/moderation/history/${historyId}/link-appeal?appealId=${appealId}`,
    {
      method: 'PUT',
    }
  );
}

/**
 * Get moderator statistics
 * Admin only
 */
export async function getModeratorStats(
  moderatorId: string,
  days: number = 30
): Promise<ModerationStats> {
  return apiCall<ModerationStats>(
    `/api/v1/moderation/history/stats/moderator/${moderatorId}?days=${days}`
  );
}

// ============================================================================
// EXPORT API OBJECT
// ============================================================================

export const moderationHistoryApi = {
  recordModerationAction,
  searchHistory,
  getHistoryById,
  getModeratorHistory,
  getContentHistory,
  getTargetUserHistory,
  getAppealHistory,
  reverseAction,
  linkToAppeal,
  getModeratorStats,
};

export default moderationHistoryApi;
