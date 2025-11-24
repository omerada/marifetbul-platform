// ================================================
// NOTIFICATIONS DOMAIN COMPONENTS - PRODUCTION READY
// ================================================
// Sprint 1: Notification & Real-time System
// Sprint 6: Notification Batching System (Story 6.1)
// Clean, maintainable, no duplicates
// @version 2.1.0

// Core Notification Components
export { NotificationBell } from './NotificationBell';
export { NotificationCenter } from './NotificationCenter';
export { NotificationModal } from './NotificationModal';
export { NotificationListItem } from './NotificationListItem';

// Batch Notification Components (Sprint 6 - Story 6.1)
export {
  BatchedNotificationItem,
  groupNotificationsByBatchType,
  generateBatchTitle,
  generateBatchMessage,
  createBatchFromNotifications,
  type NotificationBatchData,
  type NotificationBatchType,
} from './BatchedNotificationItem';

// Notification Helpers
export {
  getNotificationIcon,
  getNotificationBadge,
  getBadgeVariant,
  formatTimeAgo,
  NOTIFICATION_FILTERS,
  type NotificationFilterType,
  type BadgeVariant,
} from './notificationHelpers';

// Notification Settings
export { NotificationSettingsPanel } from './NotificationSettings';
// Note: PushNotificationToggle removed - integrated into NotificationSettings
