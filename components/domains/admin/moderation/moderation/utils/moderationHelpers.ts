/**
 * Moderation Helper Functions
 *
 * Pure utility functions for moderation system (colors, icons, formatting, API utils).
 */

import {
  STATUS_COLORS,
  STATUS_ICONS,
  PRIORITY_COLORS,
  TYPE_ICONS,
} from './moderationConstants';
import type { ModerationFilters } from '../types/moderationTypes';
import { formatDate as formatDateCanonical } from '@/lib/shared/formatters';

// ============================================================================
// Color & Style Helpers
// ============================================================================

/**
 * Get Tailwind color classes for moderation status
 */
export function getStatusColor(status: string): string {
  return STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Get Tailwind color classes for moderation priority
 */
export function getPriorityColor(priority: string): string {
  return PRIORITY_COLORS[priority] || 'bg-gray-100 text-gray-800';
}

/**
 * Get icon component type for moderation content type
 */
export function getTypeIconComponent(type: string) {
  return TYPE_ICONS[type] || TYPE_ICONS.default;
}

/**
 * Get icon component type for status
 */
export function getStatusIconComponent(status: string) {
  return STATUS_ICONS[status] || STATUS_ICONS.pending;
}

// ============================================================================
// Formatting Helpers
// ============================================================================

/**
 * Format date to Turkish locale
 *
 * @deprecated Sprint 6 - Use formatDate from @/lib/shared/formatters
 * Kept as wrapper for error handling during migration
 */
export function formatDate(dateString: string): string {
  try {
    return formatDateCanonical(dateString, 'SHORT');
  } catch {
    return 'Bilinmeyen tarih';
  }
}

/**
 * Format datetime to Turkish locale with time
 *
 * @deprecated Sprint 6 - Use formatDate(..., 'DATETIME') from @/lib/shared/formatters
 * Kept as wrapper for error handling during migration
 */
export function formatDateTime(dateString: string): string {
  try {
    return formatDateCanonical(dateString, 'DATETIME');
  } catch {
    return 'Bilinmeyen tarih';
  }
}

/**
 * Format status label for display
 */
export function formatStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Bekleyen',
    approved: 'Onaylandı',
    rejected: 'Reddedildi',
    escalated: 'Escalated',
  };
  return labels[status] || status;
}

/**
 * Format priority label for display
 */
export function formatPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    critical: 'Kritik',
    high: 'Yüksek',
    medium: 'Orta',
    low: 'Düşük',
  };
  return labels[priority] || priority;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (!text || text.length <= maxLength) return text || '';
  return `${text.substring(0, maxLength)}...`;
}

// ============================================================================
// API Utility Helpers
// ============================================================================

/**
 * Build URL query parameters from filters and pagination
 */
export function buildQueryParams(
  filters: ModerationFilters,
  page: number,
  limit: number
): URLSearchParams {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  // Add array filters
  filters.status.forEach((status) => params.append('status[]', status));
  filters.priority.forEach((priority) => params.append('priority[]', priority));
  filters.type.forEach((type) => params.append('type[]', type));

  // Add search query
  if (filters.search) {
    params.append('search', filters.search);
  }

  return params;
}

/**
 * Get auth header from cookie (auth_token)
 */
export function getAuthHeader(): HeadersInit {
  const authToken = document.cookie
    .split('; ')
    .find((row) => row.startsWith('auth_token='))
    ?.split('=')[1];

  if (!authToken) return {};

  return {
    Authorization: `Bearer ${authToken}`,
  };
}

/**
 * Build common fetch headers with auth
 */
export function buildFetchHeaders(): HeadersInit {
  return {
    ...getAuthHeader(),
    'Content-Type': 'application/json',
  };
}

// ============================================================================
// Data Processing Helpers
// ============================================================================

/**
 * Check if item has automated flags
 */
export function hasAutomatedFlags(item: {
  automatedFlags?: unknown[];
}): boolean {
  return Array.isArray(item.automatedFlags) && item.automatedFlags.length > 0;
}

/**
 * Get automated flags count
 */
export function getAutomatedFlagsCount(item: {
  automatedFlags?: unknown[];
}): number {
  return item.automatedFlags?.length || 0;
}

/**
 * Safely get reporter full name
 */
export function getReporterFullName(reporterInfo?: {
  firstName?: string;
  lastName?: string;
}): string {
  if (!reporterInfo) return 'Bilinmeyen';
  const firstName = reporterInfo.firstName || '';
  const lastName = reporterInfo.lastName || '';
  return `${firstName} ${lastName}`.trim() || 'Bilinmeyen';
}

/**
 * Format reason for display (replace underscores with spaces)
 */
export function formatReason(reason?: string): string {
  if (!reason) return 'Bilinmeyen sebep';
  return reason.replace(/_/g, ' ');
}
