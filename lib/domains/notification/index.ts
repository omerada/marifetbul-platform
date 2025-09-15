/**
 * Notification Domain - Clean Architecture
 * Handles all notification-related business logic
 */

// Domain services
export * from './service';

// Domain utilities
export * from './push-notifications';

// Store (main export)
export { useNotificationStore } from '../../core/store/notification';
