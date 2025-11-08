/**
 * ================================================
 * MODERATION CONSTANTS
 * ================================================
 * Shared constants for moderation system
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 8, 2025
 */

// ================================================
// REJECTION REASONS
// ================================================

export const REJECTION_REASONS = [
  { value: 'spam', label: 'Spam içerik' },
  { value: 'offensive', label: 'Rahatsız edici içerik' },
  { value: 'off_topic', label: 'Konu dışı' },
  { value: 'inappropriate', label: 'Uygunsuz dil veya içerik' },
  { value: 'misleading', label: 'Yanıltıcı bilgi' },
  { value: 'duplicate', label: 'Tekrarlanan içerik' },
  { value: 'other', label: 'Diğer' },
] as const;

export type RejectionReason = (typeof REJECTION_REASONS)[number]['value'];

// ================================================
// MODERATION STATUS LABELS
// ================================================

export const MODERATION_STATUS_LABELS = {
  PENDING: 'Beklemede',
  APPROVED: 'Onaylandı',
  REJECTED: 'Reddedildi',
  SPAM: 'Spam',
  ESCALATED: 'Yöneticiye İletildi',
} as const;

// ================================================
// MODERATION STATUS COLORS
// ================================================

export const MODERATION_STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  SPAM: 'bg-orange-100 text-orange-800',
  ESCALATED: 'bg-purple-100 text-purple-800',
} as const;

// ================================================
// MODERATION PRIORITIES
// ================================================

export const MODERATION_PRIORITIES = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
} as const;

export type ModerationPriority =
  (typeof MODERATION_PRIORITIES)[keyof typeof MODERATION_PRIORITIES];
