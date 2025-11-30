/**
 * Moderation Constants
 *
 * Configuration data for moderation dashboard
 */

// ============================================================================
// Filter Options
// ============================================================================

export const MODERATION_TYPE_OPTIONS = [
  { value: 'all', label: 'Tüm Türler' },
  { value: 'user_report', label: 'Kullanıcı Raporu' },
  { value: 'auto_flagged', label: 'Otomatik Algılanan' },
  { value: 'manual_review', label: 'Manuel İnceleme' },
] as const;

export const SEVERITY_OPTIONS = [
  { value: 'all', label: 'Tüm Öncelikler' },
  { value: 'low', label: 'Düşük' },
  { value: 'medium', label: 'Orta' },
  { value: 'high', label: 'Yüksek' },
  { value: 'critical', label: 'Kritik' },
] as const;

export const STATUS_OPTIONS = [
  { value: 'all', label: 'Tüm Durumlar' },
  { value: 'pending', label: 'Bekleyen' },
  { value: 'approved', label: 'Onaylanan' },
  { value: 'rejected', label: 'Reddedilen' },
  { value: 'escalated', label: 'Yükseltilen' },
] as const;

// ============================================================================
// Color Configurations
// ============================================================================

export const SEVERITY_COLORS = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
} as const;

export const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  escalated: 'bg-purple-100 text-purple-800',
} as const;

export const STAT_ICON_COLORS = {
  totalReports: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
  },
  pendingReports: {
    bg: 'bg-orange-100',
    text: 'text-orange-600',
  },
  resolvedToday: {
    bg: 'bg-green-100',
    text: 'text-green-600',
  },
  autoFlagged: {
    bg: 'bg-purple-100',
    text: 'text-purple-600',
  },
} as const;

export const ACTIVITY_DOT_COLORS = {
  green: 'bg-green-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  yellow: 'bg-yellow-500',
} as const;

// ============================================================================
// Label Mappings
// ============================================================================

export const SEVERITY_LABELS = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
  critical: 'Kritik',
} as const;

export const STATUS_LABELS = {
  pending: 'Bekleyen',
  approved: 'Onaylanan',
  rejected: 'Reddedilen',
  escalated: 'Yükseltilen',
} as const;

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULT_FILTERS = {
  type: [] as string[],
  severity: [] as string[],
  status: [] as string[],
  priority: [] as string[],
  search: '',
};

export const DEFAULT_ACTIVITIES = [
  { color: 'green' as const, text: 'Spam raporu onaylandı' },
  { color: 'red' as const, text: 'Kullanıcı hesabı askıya alındı' },
  { color: 'blue' as const, text: 'Yeni moderasyon kuralı eklendi' },
  { color: 'yellow' as const, text: 'İtiraz süreci başlatıldı' },
];

export const EMPTY_STATS: import('../types/moderationDashboardTypes').ModerationStats =
  {
    totalReports: 0,
    pendingReports: 0,
    resolvedToday: 0,
    autoFlagged: 0,
    averageResponseTime: 0,
    moderationAccuracy: 0,
    trendsData: [],
    categoryBreakdown: [],
  };
