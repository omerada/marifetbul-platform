/**
 * ================================================
 * MODERATOR API - INDEX
 * ================================================
 * Central export for all moderator API functions
 *
 * NOTE: Comment and Review moderation APIs are located in
 * components/domains/moderation/shared and hooks/business/moderation
 * This file only exports Report-specific moderator APIs.
 *
 * Sprint 1: Moderator System Implementation
 * @author MarifetBul Development Team
 * @version 2.0.0 - Deduplicated
 * @created November 20, 2025
 */

// Report Moderation API
export * from './reports';
export type {
  ReportModerationFilters,
  Report,
  ReportModerationStats,
  ReportType,
  ReportStatus,
  ReportPriority,
  ReportedContentType,
  ReportResolution,
} from './reports';
