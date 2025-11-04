/**
 * ================================================
 * USER ACTIVITY TYPES
 * ================================================
 * Type definitions for user activity tracking and timeline
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 2.3
 */

/**
 * Activity Type - Matches backend UserActivity.ActivityType enum
 */
export type ActivityType =
  | 'PAGE_VIEW'
  | 'API_CALL'
  | 'SEARCH'
  | 'PACKAGE_VIEW'
  | 'PROFILE_VIEW'
  | 'ORDER_CREATED'
  | 'PAYMENT'
  | 'MESSAGE_SENT'
  | 'REVIEW_POSTED'
  | 'FAVORITE_ADDED'
  | 'SHARE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'REGISTRATION'
  | 'PROFILE_UPDATE'
  | 'PACKAGE_CREATED'
  | 'PACKAGE_UPDATED'
  | 'OTHER';

/**
 * Activity Category - Matches backend UserActivity.ActivityCategory enum
 */
export type ActivityCategory =
  | 'NAVIGATION'
  | 'MARKETPLACE'
  | 'MESSAGING'
  | 'TRANSACTION'
  | 'AUTHENTICATION'
  | 'CONTENT'
  | 'SOCIAL'
  | 'PROFILE'
  | 'ADMIN'
  | 'OTHER';

/**
 * User Activity Log Entry - Matches backend UserActivityDto
 */
export interface UserActivityLog {
  id: string;
  userId?: string;
  sessionId?: string;

  // Activity Details
  activityType: ActivityType;
  activityCategory: ActivityCategory;
  endpoint?: string;
  httpMethod?: string;

  // Request Details
  requestPath?: string;
  queryParams?: string;
  userAgent?: string;
  ipAddress?: string;

  // Response Details
  statusCode?: number;
  responseTimeMs?: number;

  // Feature Usage
  featureName?: string;
  featureParams?: Record<string, unknown>;

  // Timestamps
  activityTimestamp: string;
  createdAt: string;
}

/**
 * Activity Log Filters
 */
export interface UserActivityFilters {
  userId?: string;
  activityType?: ActivityType;
  activityCategory?: ActivityCategory;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sort?: string;
}

/**
 * Activity Type Display Config
 */
export interface ActivityTypeConfig {
  label: string;
  icon: string;
  color: string;
  category: ActivityCategory;
}

/**
 * Activity Type Display Mapping
 */
export const ACTIVITY_TYPE_CONFIG: Record<ActivityType, ActivityTypeConfig> = {
  PAGE_VIEW: {
    label: 'Sayfa Görüntüleme',
    icon: 'Eye',
    color: 'text-blue-600',
    category: 'NAVIGATION',
  },
  API_CALL: {
    label: 'API İsteği',
    icon: 'Code',
    color: 'text-purple-600',
    category: 'OTHER',
  },
  SEARCH: {
    label: 'Arama',
    icon: 'Search',
    color: 'text-amber-600',
    category: 'MARKETPLACE',
  },
  PACKAGE_VIEW: {
    label: 'Paket Görüntüleme',
    icon: 'Package',
    color: 'text-green-600',
    category: 'MARKETPLACE',
  },
  PROFILE_VIEW: {
    label: 'Profil Görüntüleme',
    icon: 'User',
    color: 'text-indigo-600',
    category: 'PROFILE',
  },
  ORDER_CREATED: {
    label: 'Sipariş Oluşturuldu',
    icon: 'ShoppingCart',
    color: 'text-emerald-600',
    category: 'TRANSACTION',
  },
  PAYMENT: {
    label: 'Ödeme',
    icon: 'CreditCard',
    color: 'text-green-600',
    category: 'TRANSACTION',
  },
  MESSAGE_SENT: {
    label: 'Mesaj Gönderildi',
    icon: 'MessageSquare',
    color: 'text-blue-600',
    category: 'MESSAGING',
  },
  REVIEW_POSTED: {
    label: 'Yorum Yapıldı',
    icon: 'Star',
    color: 'text-yellow-600',
    category: 'SOCIAL',
  },
  FAVORITE_ADDED: {
    label: 'Favorilere Eklendi',
    icon: 'Heart',
    color: 'text-red-600',
    category: 'SOCIAL',
  },
  SHARE: {
    label: 'Paylaşım',
    icon: 'Share2',
    color: 'text-cyan-600',
    category: 'SOCIAL',
  },
  LOGIN: {
    label: 'Giriş Yapıldı',
    icon: 'LogIn',
    color: 'text-green-600',
    category: 'AUTHENTICATION',
  },
  LOGOUT: {
    label: 'Çıkış Yapıldı',
    icon: 'LogOut',
    color: 'text-gray-600',
    category: 'AUTHENTICATION',
  },
  REGISTRATION: {
    label: 'Kayıt Olundu',
    icon: 'UserPlus',
    color: 'text-emerald-600',
    category: 'AUTHENTICATION',
  },
  PROFILE_UPDATE: {
    label: 'Profil Güncellendi',
    icon: 'Edit',
    color: 'text-blue-600',
    category: 'PROFILE',
  },
  PACKAGE_CREATED: {
    label: 'Paket Oluşturuldu',
    icon: 'PackagePlus',
    color: 'text-green-600',
    category: 'CONTENT',
  },
  PACKAGE_UPDATED: {
    label: 'Paket Güncellendi',
    icon: 'PackageCheck',
    color: 'text-blue-600',
    category: 'CONTENT',
  },
  OTHER: {
    label: 'Diğer',
    icon: 'Activity',
    color: 'text-gray-600',
    category: 'OTHER',
  },
};

/**
 * Activity Category Display Config
 */
export const ACTIVITY_CATEGORY_CONFIG: Record<
  ActivityCategory,
  { label: string; color: string }
> = {
  NAVIGATION: { label: 'Gezinme', color: 'bg-blue-100 text-blue-800' },
  MARKETPLACE: { label: 'Pazar Yeri', color: 'bg-green-100 text-green-800' },
  MESSAGING: { label: 'Mesajlaşma', color: 'bg-purple-100 text-purple-800' },
  TRANSACTION: {
    label: 'İşlemler',
    color: 'bg-emerald-100 text-emerald-800',
  },
  AUTHENTICATION: {
    label: 'Kimlik Doğrulama',
    color: 'bg-indigo-100 text-indigo-800',
  },
  CONTENT: { label: 'İçerik', color: 'bg-amber-100 text-amber-800' },
  SOCIAL: { label: 'Sosyal', color: 'bg-pink-100 text-pink-800' },
  PROFILE: { label: 'Profil', color: 'bg-cyan-100 text-cyan-800' },
  ADMIN: { label: 'Admin', color: 'bg-red-100 text-red-800' },
  OTHER: { label: 'Diğer', color: 'bg-gray-100 text-gray-800' },
};

/**
 * Helper to get activity type config
 */
export const getActivityTypeConfig = (
  type: ActivityType
): ActivityTypeConfig => {
  return ACTIVITY_TYPE_CONFIG[type] || ACTIVITY_TYPE_CONFIG.OTHER;
};

/**
 * Helper to get activity category config
 */
export const getActivityCategoryConfig = (
  category: ActivityCategory
): { label: string; color: string } => {
  return ACTIVITY_CATEGORY_CONFIG[category] || ACTIVITY_CATEGORY_CONFIG.OTHER;
};

/**
 * Helper to format activity description
 */
export const formatActivityDescription = (
  activity: UserActivityLog
): string => {
  const config = getActivityTypeConfig(activity.activityType);
  const parts: string[] = [config.label];

  if (activity.endpoint) {
    parts.push(`(${activity.endpoint})`);
  }

  if (activity.featureName) {
    parts.push(`- ${activity.featureName}`);
  }

  return parts.join(' ');
};

/**
 * Helper to check if activity is an error
 */
export const isActivityError = (activity: UserActivityLog): boolean => {
  return (activity.statusCode ?? 0) >= 400;
};

/**
 * Helper to check if activity is slow
 */
export const isActivitySlow = (activity: UserActivityLog): boolean => {
  return (activity.responseTimeMs ?? 0) > 1000;
};
