/**
 * Moderation Constants
 *
 * Sprint 8: Import shared constants from moderation-dashboard canonical
 * Keep only moderation-queue specific constants here
 */

import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Star,
  Briefcase,
  MessageSquare,
  User,
  Flag,
} from 'lucide-react';

// ============================================================================
// Sprint 8: Import from canonical moderation-dashboard constants
// ============================================================================
export {
  STATUS_OPTIONS,
  STATUS_COLORS,
  STATUS_LABELS,
  DEFAULT_FILTERS,
} from '../../moderation-dashboard/utils/moderationConstants';

// Alias: PRIORITY_OPTIONS -> SEVERITY_OPTIONS from canonical
export {
  SEVERITY_OPTIONS as PRIORITY_OPTIONS,
  SEVERITY_COLORS as PRIORITY_COLORS,
  SEVERITY_LABELS as PRIORITY_LABELS,
} from '../../moderation-dashboard/utils/moderationConstants';

// ============================================================================
// Moderation Queue Specific: Status Icons
// ============================================================================
// Note: Dashboard doesn't use STATUS_ICONS, but moderation queue does

export const STATUS_ICONS: Record<string, typeof CheckCircle> = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
  escalated: AlertTriangle,
} as const;

// ============================================================================
// Moderation Queue Specific: Type Options
// ============================================================================
// Note: Different from MODERATION_TYPE_OPTIONS in dashboard
// This is for content type filtering (review, job, package, etc.)

export const TYPE_OPTIONS = [
  { value: 'review', label: 'Yorum' },
  { value: 'job', label: 'İş İlanı' },
  { value: 'package', label: 'Paket' },
  { value: 'message', label: 'Mesaj' },
  { value: 'profile', label: 'Profil' },
] as const;

// ============================================================================
// Type Icon Mappings
// ============================================================================

export const TYPE_ICONS: Record<string, typeof Star> = {
  review: Star,
  job: Briefcase,
  package: MessageSquare,
  profile: User,
  default: Flag,
} as const;

// ============================================================================
// Pagination (moderation-queue specific)
// ============================================================================

export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
} as const;
