import { apiClient } from '@/lib/infrastructure/api/client';

/**
 * Notification Preferences API Client
 * Handles user notification delivery preferences (email, push, DND)
 */

export interface NotificationPreferences {
  // Email preferences per type
  messageEmail: boolean;
  jobEmail: boolean;
  proposalEmail: boolean;
  orderEmail: boolean;
  paymentEmail: boolean;
  reviewEmail: boolean;
  systemEmail: boolean;
  followEmail: boolean;

  // Push preferences per type
  messagePush: boolean;
  jobPush: boolean;
  proposalPush: boolean;
  orderPush: boolean;
  paymentPush: boolean;
  reviewPush: boolean;
  systemPush: boolean;
  followPush: boolean;

  // Do Not Disturb settings
  doNotDisturb: boolean;
  dndStartTime?: string; // "22:00"
  dndEndTime?: string; // "08:00"
}

export type NotificationPreferencesUpdate = Partial<NotificationPreferences>;

/**
 * Get user's notification preferences
 */
export async function getNotificationPreferences() {
  return apiClient.get<NotificationPreferences>('/notifications/preferences');
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  preferences: NotificationPreferencesUpdate
) {
  return apiClient.put<NotificationPreferences>(
    '/notifications/preferences',
    preferences
  );
}

/**
 * Reset preferences to defaults
 */
export async function resetNotificationPreferences() {
  return apiClient.post<NotificationPreferences>(
    '/notifications/preferences/reset'
  );
}

/**
 * Enable all email notifications
 */
export async function enableAllEmails() {
  return updateNotificationPreferences({
    messageEmail: true,
    jobEmail: true,
    proposalEmail: true,
    orderEmail: true,
    paymentEmail: true,
    reviewEmail: true,
    systemEmail: true,
    followEmail: true,
  });
}

/**
 * Disable all email notifications
 */
export async function disableAllEmails() {
  return updateNotificationPreferences({
    messageEmail: false,
    jobEmail: false,
    proposalEmail: false,
    orderEmail: false,
    paymentEmail: false,
    reviewEmail: false,
    systemEmail: false,
    followEmail: false,
  });
}

/**
 * Enable all push notifications
 */
export async function enableAllPush() {
  return updateNotificationPreferences({
    messagePush: true,
    jobPush: true,
    proposalPush: true,
    orderPush: true,
    paymentPush: true,
    reviewPush: true,
    systemPush: true,
    followPush: true,
  });
}

/**
 * Disable all push notifications
 */
export async function disableAllPush() {
  return updateNotificationPreferences({
    messagePush: false,
    jobPush: false,
    proposalPush: false,
    orderPush: false,
    paymentPush: false,
    reviewPush: false,
    systemPush: false,
    followPush: false,
  });
}
