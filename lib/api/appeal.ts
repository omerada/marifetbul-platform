/**
 * ================================================
 * APPEAL API CLIENT
 * ================================================
 * API client for moderation appeal system
 * 
 * Features:
 * - Create and submit appeals
 * - View and filter appeals
 * - Resolve appeals with decisions
 * - Escalate to admin
 * - Appeal statistics
 * 
 * Backend Routes:
 * - POST   /api/v1/moderation/appeals
 * - GET    /api/v1/moderation/appeals
 * - GET    /api/v1/moderation/appeals/my
 * - GET    /api/v1/moderation/appeals/{id}
 * - PUT    /api/v1/moderation/appeals/{id}/resolve
 * - PUT    /api/v1/moderation/appeals/{id}/escalate
 * - GET    /api/v1/moderation/appeals/stats
 * 
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 1 - EPIC 1: Appeal System
 * @created November 10, 2025
 */

import { getBackendApiUrl } from '@/lib/config/api';
import type { PageResponse } from '@/types/backend-aligned';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Content types that can be appealed
 */
export type AppealContentType =
  | 'REVIEW'
  | 'COMMENT'
  | 'JOB'
  | 'PACKAGE'
  | 'MESSAGE'
  | 'PROFILE'
  | 'PORTFOLIO'
  | 'USER_SUSPENSION';

/**
 * Reason/type for appeal
 */
export type AppealType =
  | 'INCORRECT_DECISION'
  | 'CONTENT_MISUNDERSTOOD'
  | 'POLICY_MISAPPLIED'
  | 'TECHNICAL_ERROR'
  | 'NEW_EVIDENCE'
  | 'EXCESSIVE_PENALTY'
  | 'OTHER';

/**
 * Appeal status
 */
export type AppealStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'PARTIALLY_UPHELD'
  | 'ESCALATED'
  | 'EXPIRED'
  | 'WITHDRAWN';

/**
 * Appeal priority
 */
export type AppealPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

/**
 * Appeal decision
 */
export type AppealDecision =
  | 'OVERTURN_DECISION'
  | 'UPHOLD_DECISION'
  | 'MODIFY_DECISION'
  | 'ESCALATE_TO_ADMIN'
  | 'REQUIRE_MORE_INFO';

/**
 * Appeal response from backend
 */
export interface Appeal {
  id: string;

  // Appellant Information
  appellantId: string;
  appellantName?: string;
  appellantEmail?: string;

  // Content Information
  contentType: AppealContentType;
  contentId: string;
  contentSummary?: string;

  // Appeal Details
  appealType: AppealType;
  reason: string;
  evidence?: string;

  // Status & Workflow
  status: AppealStatus;
  priority: AppealPriority;
  escalated: boolean;
  escalationCount: number;

  // Original Moderation
  originalModerationActionId?: string;
  originalModeratorId?: string;
  originalModeratorName?: string;
  originalDecisionReason?: string;

  // Review Information
  reviewerId?: string;
  reviewerName?: string;
  decision?: AppealDecision;
  decisionReason?: string;
  reviewedAt?: string;
  resolvedAt?: string;

  // Metadata
  createdAt: string;
  expiresAt: string;
  expired: boolean;
}

/**
 * Create appeal request
 */
export interface CreateAppealRequest {
  contentType: AppealContentType;
  contentId: string;
  appealType: AppealType;
  reason: string;
  evidence?: string;
  originalModerationActionId?: string;
}

/**
 * Resolve appeal request
 */
export interface ResolveAppealRequest {
  decision: AppealDecision;
  decisionReason: string;
  internalNotes?: string;
}

/**
 * Appeal statistics
 */
export interface AppealStatistics {
  // Overall Counts
  totalAppeals: number;
  pendingAppeals: number;
  underReviewAppeals: number;
  approvedAppeals: number;
  rejectedAppeals: number;
  escalatedAppeals: number;
  expiredAppeals: number;

  // Rates (percentages)
  approvalRate: number;
  rejectionRate: number;
  escalationRate: number;

  // Performance Metrics
  avgResolutionTimeHours: number;
  appealsExpiringSoon: number;

  // Priority Breakdown
  byPriority?: Record<string, number>;

  // Content Type Breakdown
  byContentType?: Record<string, number>;

  // Appeal Type Breakdown
  byAppealType?: Record<string, number>;

  // Time-based metrics
  appealsToday: number;
  appealsThisWeek: number;
  appealsThisMonth: number;
}

/**
 * Appeal filter parameters
 */
export interface AppealFilters {
  status?: AppealStatus;
  contentType?: AppealContentType;
  priority?: AppealPriority;
  escalated?: boolean;
  appellantId?: string;
  reviewerId?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'ASC' | 'DESC';
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Helper to make authenticated API calls
 */
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
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
    logger.error('Appeal API error', new Error(`${endpoint} - ${response.status}: ${error.message || 'Unknown error'}`));
    throw new Error(error.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data || data;
}

/**
 * Create a new appeal
 * 
 * @param request Appeal creation request
 * @returns Created appeal
 */
export async function createAppeal(
  request: CreateAppealRequest
): Promise<Appeal> {
  return apiCall<Appeal>('/api/v1/moderation/appeals', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Get appeals with filtering
 * Admin/Moderator only
 * 
 * @param filters Filter parameters
 * @returns Paginated appeal list
 */
export async function getAppeals(
  filters: AppealFilters = {}
): Promise<PageResponse<Appeal>> {
  const params = new URLSearchParams();

  if (filters.status) params.append('status', filters.status);
  if (filters.contentType) params.append('contentType', filters.contentType);
  if (filters.priority) params.append('priority', filters.priority);
  if (filters.escalated !== undefined)
    params.append('escalated', String(filters.escalated));
  if (filters.appellantId) params.append('appellantId', filters.appellantId);
  if (filters.reviewerId) params.append('reviewerId', filters.reviewerId);

  params.append('page', String(filters.page || 0));
  params.append('size', String(filters.size || 20));
  params.append('sortBy', filters.sortBy || 'createdAt');
  params.append('direction', filters.direction || 'DESC');

  return apiCall<PageResponse<Appeal>>(
    `/api/v1/moderation/appeals?${params.toString()}`
  );
}

/**
 * Get current user's own appeals
 * 
 * @param page Page number
 * @param size Page size
 * @returns Paginated appeal list
 */
export async function getMyAppeals(
  page: number = 0,
  size: number = 20
): Promise<PageResponse<Appeal>> {
  return apiCall<PageResponse<Appeal>>(
    `/api/v1/moderation/appeals/my?page=${page}&size=${size}`
  );
}

/**
 * Get appeals assigned to current moderator
 * 
 * @param page Page number
 * @param size Page size
 * @returns Paginated appeal list
 */
export async function getAssignedAppeals(
  page: number = 0,
  size: number = 20
): Promise<PageResponse<Appeal>> {
  return apiCall<PageResponse<Appeal>>(
    `/api/v1/moderation/appeals/assigned?page=${page}&size=${size}`
  );
}

/**
 * Get appeal by ID
 * 
 * @param appealId Appeal ID
 * @returns Appeal details
 */
export async function getAppealById(appealId: string): Promise<Appeal> {
  return apiCall<Appeal>(`/api/v1/moderation/appeals/${appealId}`);
}

/**
 * Resolve appeal with decision
 * Moderator/Admin only
 * 
 * @param appealId Appeal ID
 * @param request Resolution request
 * @returns Updated appeal
 */
export async function resolveAppeal(
  appealId: string,
  request: ResolveAppealRequest
): Promise<Appeal> {
  return apiCall<Appeal>(
    `/api/v1/moderation/appeals/${appealId}/resolve`,
    {
      method: 'PUT',
      body: JSON.stringify(request),
    }
  );
}

/**
 * Escalate appeal to admin
 * Moderator only
 * 
 * @param appealId Appeal ID
 * @param reason Escalation reason
 * @returns Updated appeal
 */
export async function escalateAppeal(
  appealId: string,
  reason: string
): Promise<Appeal> {
  return apiCall<Appeal>(
    `/api/v1/moderation/appeals/${appealId}/escalate?reason=${encodeURIComponent(reason)}`,
    {
      method: 'PUT',
    }
  );
}

/**
 * Get appeal statistics
 * Admin only
 * 
 * @returns Appeal statistics
 */
export async function getAppealStatistics(): Promise<AppealStatistics> {
  return apiCall<AppealStatistics>('/api/v1/moderation/appeals/stats');
}

// ============================================================================
// EXPORT API OBJECT
// ============================================================================

export const appealApi = {
  createAppeal,
  getAppeals,
  getMyAppeals,
  getAssignedAppeals,
  getAppealById,
  resolveAppeal,
  escalateAppeal,
  getAppealStatistics,
};

export default appealApi;
