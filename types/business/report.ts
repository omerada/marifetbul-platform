/**
 * ================================================
 * USER REPORT TYPES
 * ================================================
 * Types for user reporting system
 *
 * Sprint 2.4: User Reports System
 * @version 1.0.0
 * @author MarifetBul Development Team
 */

/**
 * Report reason
 */
export enum ReportReason {
  SPAM = 'SPAM',
  SCAM = 'SCAM',
  ABUSIVE_BEHAVIOR = 'ABUSIVE_BEHAVIOR',
  HARASSMENT = 'HARASSMENT',
  FAKE_PROFILE = 'FAKE_PROFILE',
  COPYRIGHT_VIOLATION = 'COPYRIGHT_VIOLATION',
  INAPPROPRIATE_CONTENT = 'INAPPROPRIATE_CONTENT',
  OTHER = 'OTHER',
}

/**
 * Report status
 */
export enum ReportStatus {
  PENDING = 'PENDING',
  IN_REVIEW = 'IN_REVIEW',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED',
}

/**
 * Report priority
 */
export enum ReportPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

/**
 * User report
 */
export interface UserReport {
  id: string;
  reporterId: string;
  reporterName: string;
  reportedUserId: string;
  reportedUserName: string;
  reportedUserAvatar?: string;
  reason: ReportReason;
  description: string;
  evidence?: string[]; // URLs to evidence (screenshots, links)
  status: ReportStatus;
  priority: ReportPriority;
  createdAt: string;
  updatedAt: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  resolution?: string;
  resolutionNote?: string;
}

/**
 * Generic Report type for moderation system
 */
export type ReportType =
  | 'USER'
  | 'CONTENT'
  | 'REVIEW'
  | 'COMMENT'
  | 'PACKAGE'
  | 'OTHER';
export type ReportAction =
  | 'WARN'
  | 'SUSPEND'
  | 'BAN'
  | 'REMOVE_CONTENT'
  | 'EDIT_CONTENT'
  | 'NO_ACTION';

export interface Report {
  id: string;
  type: ReportType;
  contentType?: string;
  contentId?: string;
  reporter: {
    id: string;
    username?: string;
    email?: string;
  };
  status: ReportStatus;
  priority: ReportPriority;
  reason: ReportReason | string;
  description: string;
  reporterId: string;
  reporterUsername?: string;
  reporterEmail?: string;
  entityType?: string;
  entityId?: string;
  entityDescription?: string;
  assignedModeratorId?: string;
  assignedModeratorUsername?: string;
  moderatorNotes?: string;
  actionTaken?: ReportAction;
  reporterNotified?: boolean;
  entityOwnerNotified?: boolean;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  resolution?: string;
  resolutionNote?: string;
}

/**
 * Create report request
 */
export interface CreateReportRequest {
  reportedUserId: string;
  reason: ReportReason;
  description: string;
  evidence?: string[];
}

/**
 * Resolve report request
 */
export interface ResolveReportRequest {
  resolution: 'SUSPEND' | 'BAN' | 'WARN' | 'DISMISS';
  note?: string;
  banDuration?: number; // days, undefined = permanent
}

/**
 * Suspend/Ban user request
 */
export interface UserActionRequest {
  userId: string;
  action: 'SUSPEND' | 'BAN' | 'WARN';
  reason: string;
  duration?: number; // days
  note?: string;
}

/**
 * Reports response
 */
export interface ReportsResponse {
  reports: UserReport[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Report filters
 */
export interface ReportFilters {
  status?: ReportStatus;
  priority?: ReportPriority;
  reason?: ReportReason;
  dateFrom?: string;
  dateTo?: string;
  reportedUserId?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Report statistics
 */
export interface ReportStatistics {
  total: number;
  pending: number;
  inReview: number;
  resolved: number;
  dismissed: number;
  byReason: Array<{
    reason: ReportReason;
    count: number;
    percentage: number;
  }>;
  byPriority: Array<{
    priority: ReportPriority;
    count: number;
  }>;
  averageResolutionTime: number; // hours
  trend: Array<{
    date: string;
    count: number;
  }>;
}
