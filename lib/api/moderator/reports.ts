/**
 * ================================================
 * MODERATOR API - REPORTS
 * ================================================
 * API client for moderator report management operations
 *
 * Backend: ModerationController.java / ReportController.java
 * Base Path: /api/v1/moderation/reports
 *
 * Sprint 1 - Story 3: Report Queue Management
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 20, 2025
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import logger from '@/lib/infrastructure/monitoring/logger';
import type { PageResponse } from '@/types/backend-aligned';

// ============================================================================
// TYPES
// ============================================================================

export type ReportType =
  | 'SPAM'
  | 'HARASSMENT'
  | 'INAPPROPRIATE_CONTENT'
  | 'FRAUD'
  | 'COPYRIGHT_VIOLATION'
  | 'FAKE_PROFILE'
  | 'SCAM'
  | 'OTHER';

export type ReportStatus =
  | 'PENDING'
  | 'INVESTIGATING'
  | 'RESOLVED'
  | 'DISMISSED'
  | 'ESCALATED';

export type ReportPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export type ReportedContentType =
  | 'USER'
  | 'COMMENT'
  | 'REVIEW'
  | 'PACKAGE'
  | 'MESSAGE'
  | 'OTHER';

export interface ReportModerationFilters {
  status?: ReportStatus;
  type?: ReportType;
  priority?: ReportPriority;
  contentType?: ReportedContentType;
  dateFrom?: string;
  dateTo?: string;
  searchQuery?: string;
  page?: number;
  size?: number;
}

// Alias for backward compatibility
export type ReportFilters = ReportModerationFilters;

export interface Report {
  id: string;
  type: ReportType;
  status: ReportStatus;
  priority: ReportPriority;
  contentType: ReportedContentType;
  contentId: string;
  reason: string;
  description?: string;
  reporter: {
    id: string;
    fullName: string;
    username: string;
    avatarUrl?: string;
  };
  reportedUser?: {
    id: string;
    fullName: string;
    username: string;
    avatarUrl?: string;
  };
  reportedContent?: {
    title?: string;
    preview?: string;
    url?: string;
  };
  evidence?: string[];
  createdAt: string;
  assignedTo?: {
    id: string;
    fullName: string;
  };
  resolvedAt?: string;
  resolution?: string;
  moderatorNotes?: string;
}

export interface ReportModerationStats {
  pending: number;
  investigating: number;
  resolved: number;
  dismissed: number;
  escalated: number;
  totalReports: number;
  highPriority: number;
}

export interface ReportResolution {
  action:
    | 'VALID'
    | 'INVALID'
    | 'WARNING_ISSUED'
    | 'CONTENT_REMOVED'
    | 'USER_SUSPENDED'
    | 'USER_BANNED';
  notes: string;
}

// ============================================================================
// API ENDPOINTS BASE
// ============================================================================

const BASE_PATH = '/moderation/reports';

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get all reports (pending + investigating)
 *
 * GET /api/v1/moderation/reports
 */
export async function getReports(
  filters: ReportModerationFilters = {}
): Promise<PageResponse<Report>> {
  logger.debug('[ModeratorReportsAPI] Fetching reports', { filters });

  const params: Record<string, string> = {
    page: String(filters.page ?? 0),
    size: String(filters.size ?? 20),
  };

  if (filters.status) params.status = filters.status;
  if (filters.type) params.type = filters.type;
  if (filters.priority) params.priority = filters.priority;
  if (filters.contentType) params.contentType = filters.contentType;
  if (filters.searchQuery) params.search = filters.searchQuery;
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;

  const response = await apiClient.get<PageResponse<Report>>(BASE_PATH, params);

  logger.info('[ModeratorReportsAPI] Reports fetched', {
    total: response.totalElements,
  });

  return response;
}

/**
 * Get report details by ID
 *
 * GET /api/v1/moderation/reports/{reportId}
 */
export async function getReportDetails(reportId: string): Promise<Report> {
  logger.debug('[ModeratorReportsAPI] Fetching report details', { reportId });

  const response = await apiClient.get<Report>(`${BASE_PATH}/${reportId}`);

  logger.info('[ModeratorReportsAPI] Report details fetched', { reportId });

  return response;
}

/**
 * Get report moderation statistics
 *
 * GET /api/v1/moderation/reports/stats
 */
export async function getReportStats(): Promise<ReportModerationStats> {
  logger.debug('[ModeratorReportsAPI] Fetching report stats');

  const response = await apiClient.get<ReportModerationStats>(
    `${BASE_PATH}/stats`
  );

  logger.info('[ModeratorReportsAPI] Stats fetched', { stats: response });

  return response;
}

/**
 * Assign report to self
 *
 * POST /api/v1/moderation/reports/{reportId}/assign
 */
export async function assignReportToSelf(reportId: string): Promise<Report> {
  logger.debug('[ModeratorReportsAPI] Assigning report to self', { reportId });

  const response = await apiClient.post<Report>(
    `${BASE_PATH}/${reportId}/assign`
  );

  logger.info('[ModeratorReportsAPI] Report assigned', { reportId });

  return response;
}

/**
 * Resolve a report
 *
 * POST /api/v1/moderation/reports/{reportId}/resolve
 */
export async function resolveReport(
  reportId: string,
  resolution: ReportResolution
): Promise<Report> {
  logger.debug('[ModeratorReportsAPI] Resolving report', {
    reportId,
    resolution,
  });

  const response = await apiClient.post<Report>(
    `${BASE_PATH}/${reportId}/resolve`,
    resolution
  );

  logger.info('[ModeratorReportsAPI] Report resolved', { reportId });

  return response;
}

/**
 * Dismiss a report (mark as invalid)
 *
 * POST /api/v1/moderation/reports/{reportId}/dismiss
 */
export async function dismissReport(
  reportId: string,
  reason: string
): Promise<Report> {
  logger.debug('[ModeratorReportsAPI] Dismissing report', {
    reportId,
    reason,
  });

  const response = await apiClient.post<Report>(
    `${BASE_PATH}/${reportId}/dismiss`,
    { reason }
  );

  logger.info('[ModeratorReportsAPI] Report dismissed', { reportId });

  return response;
}

/**
 * Escalate report to admin
 *
 * POST /api/v1/moderation/reports/{reportId}/escalate
 */
export async function escalateReport(
  reportId: string,
  reason: string
): Promise<Report> {
  logger.debug('[ModeratorReportsAPI] Escalating report', {
    reportId,
    reason,
  });

  const response = await apiClient.post<Report>(
    `${BASE_PATH}/${reportId}/escalate`,
    { reason }
  );

  logger.info('[ModeratorReportsAPI] Report escalated', { reportId });

  return response;
}
