/**
 * Moderation Helpers
 *
 * Utility functions for moderation dashboard
 */

import {
  SEVERITY_COLORS,
  STATUS_COLORS,
  SEVERITY_LABELS,
  STATUS_LABELS,
} from './moderationConstants';
import type {
  ModerationItem,
  ModerationFilters,
} from '../types/moderationDashboardTypes';

// Sprint 1 Cleanup: formatDateCanonical import removed (no longer used)

/**
 * Get color class for severity level
 */
export function getSeverityColor(severity: string): string {
  return (
    SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS] ||
    'bg-gray-100 text-gray-800'
  );
}

/**
 * Get color class for status
 */
export function getStatusColor(status: string): string {
  return (
    STATUS_COLORS[status as keyof typeof STATUS_COLORS] ||
    'bg-gray-100 text-gray-800'
  );
}

/**
 * Get Turkish label for severity
 */
export function getSeverityLabel(severity: string): string {
  return SEVERITY_LABELS[severity as keyof typeof SEVERITY_LABELS] || severity;
}

/**
 * Get Turkish label for status
 */
export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status;
}

/**
 * Filter moderation items based on filters
 */
export function filterItems(
  items: ModerationItem[],
  filters: ModerationFilters
): ModerationItem[] {
  let filtered = items;

  // Filter by type
  if (filters.type !== 'all') {
    filtered = filtered.filter((item) => item.type === filters.type);
  }

  // Filter by severity
  if (filters.severity !== 'all') {
    filtered = filtered.filter((item) => item.severity === filters.severity);
  }

  // Filter by status
  if (filters.status !== 'all') {
    filtered = filtered.filter((item) => item.status === filters.status);
  }

  // Filter by search query
  if (filters.search) {
    const query = filters.search.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.reportedUser.name.toLowerCase().includes(query) ||
        item.reportReason.toLowerCase().includes(query)
    );
  }

  return filtered;
}

// Sprint 1 Cleanup: formatDate removed - use formatDate from @/lib/shared/formatters directly
