/**
 * Moderation Constants
 *
 * Centralized constants for moderation status, priorities, types, and mappings.
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
// Status Options
// ============================================================================

export const STATUS_OPTIONS = [
  { value: 'pending', label: 'Bekleyen' },
  { value: 'approved', label: 'Onaylandı' },
  { value: 'rejected', label: 'Reddedildi' },
  { value: 'escalated', label: 'Escalated' },
] as const;

// ============================================================================
// Priority Options
// ============================================================================

export const PRIORITY_OPTIONS = [
  { value: 'critical', label: 'Kritik' },
  { value: 'high', label: 'Yüksek' },
  { value: 'medium', label: 'Orta' },
  { value: 'low', label: 'Düşük' },
] as const;

// ============================================================================
// Type Options
// ============================================================================

export const TYPE_OPTIONS = [
  { value: 'review', label: 'Yorum' },
  { value: 'job', label: 'İş İlanı' },
  { value: 'package', label: 'Paket' },
  { value: 'message', label: 'Mesaj' },
  { value: 'profile', label: 'Profil' },
] as const;

// ============================================================================
// Status Color Mappings
// ============================================================================

export const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  escalated: 'bg-purple-100 text-purple-800',
} as const;

export const STATUS_ICONS: Record<string, typeof CheckCircle> = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
  escalated: AlertTriangle,
} as const;

// ============================================================================
// Priority Color Mappings
// ============================================================================

export const PRIORITY_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-gray-100 text-gray-800',
} as const;

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
// Default Values
// ============================================================================

export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
} as const;

export const DEFAULT_FILTERS = {
  status: [],
  priority: [],
  type: [],
  search: '',
} as const;
