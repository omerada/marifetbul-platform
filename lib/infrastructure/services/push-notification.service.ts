/**
 * ================================================
 * UNIFIED PUSH NOTIFICATION SERVICE
 * ================================================
 * Production-ready Firebase Cloud Messaging integration
 *
 * Features:
 * - FCM token management
 * - Device registration with backend
 * - Foreground & background notifications
 * - Permission management
 * - Multi-device support
 * - Graceful error handling
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Production Ready
 * @since Sprint: Push Notification System
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getMessaging,
  getToken,
  onMessage,
  deleteToken,
  Messaging,
  MessagePayload,
} from 'firebase/messaging';
import { apiClient } from '@/lib/infrastructure/api/client';
import { toast } from 'sonner';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// CONFIGURATION
// ============================================================================

const FIREBASE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
} as const;

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface DeviceTokenResponse {
  id: string;
  token: string;
  deviceType: 'WEB' | 'ANDROID' | 'IOS';
  deviceName: string;
  isActive: boolean;
  createdAt: string;
  lastUsedAt: string | null;
}

export interface PushSubscriptionResult {
  success: boolean;
  error?: string;
  deviceId?: string;
}

export type NotificationPermissionStatus = 'granted' | 'denied' | 'default';

// ============================================================================
// SINGLETON INSTANCES
// ============================================================================

let firebaseApp: FirebaseApp | null = null;
let messaging: Messaging | null = null;

// ============================================================================
// CONFIGURATION VALIDATION
// ============================================================================

/**
 * Check if Firebase is properly configured
 */
export function isFirebaseConfigured(): boolean {
  return !!(
    FIREBASE_CONFIG.apiKey &&
    FIREBASE_CONFIG.projectId &&
    FIREBASE_CONFIG.messagingSenderId &&
    FIREBASE_CONFIG.appId &&
    VAPID_KEY
  );
}

/**
 * Validate Firebase configuration and log warnings
 */
function validateConfiguration(): boolean {
  if (!isFirebaseConfigured()) {
    logger.warn('Firebase configuration incomplete', {
      hasApiKey: !!FIREBASE_CONFIG.apiKey,
      hasProjectId: !!FIREBASE_CONFIG.projectId,
      hasSenderId: !!FIREBASE_CONFIG.messagingSenderId,
      hasAppId: !!FIREBASE_CONFIG.appId,
      hasVapidKey: !!VAPID_KEY,
    });
    return false;
  }
  return true;
}

// ============================================================================
// FIREBASE INITIALIZATION
// ============================================================================

/**
 * Initialize Firebase app (singleton)
 */
function initializeFirebase(): FirebaseApp | null {
  // Server-side check
  if (typeof window === 'undefined') {
    return null;
  }

  // Configuration check
  if (!validateConfiguration()) {
    return null;
  }

  // Return existing instance
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    const existingApps = getApps();
    firebaseApp =
      existingApps.length > 0
        ? existingApps[0]
        : initializeApp(FIREBASE_CONFIG);

    logger.info('Firebase initialized successfully');
    return firebaseApp;
  } catch (error) {
    logger.error(
      'Firebase initialization failed',
      error instanceof Error ? error : undefined
    );
    return null;
  }
}

/**
 * Get Firebase Messaging instance (singleton)
 */
function getMessagingInstance(): Messaging | null {
  if (messaging) {
    return messaging;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  const app = initializeFirebase();
  if (!app) {
    return null;
  }

  try {
    messaging = getMessaging(app);
    return messaging;
  } catch (error) {
    logger.error(
      'Failed to get messaging instance',
      error instanceof Error ? error : undefined
    );
    return null;
  }
}

// ============================================================================
// BROWSER SUPPORT CHECKS
// ============================================================================

/**
 * Check if push notifications are supported
 */
export function isPushNotificationSupported(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return !!(
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
}

/**
 * Get detailed support information
 */
export function getSupportInfo(): {
  isSupported: boolean;
  hasNotificationAPI: boolean;
  hasServiceWorker: boolean;
  hasPushManager: boolean;
  currentPermission: NotificationPermissionStatus;
} {
  if (typeof window === 'undefined') {
    return {
      isSupported: false,
      hasNotificationAPI: false,
      hasServiceWorker: false,
      hasPushManager: false,
      currentPermission: 'default',
    };
  }

  return {
    isSupported: isPushNotificationSupported(),
    hasNotificationAPI: 'Notification' in window,
    hasServiceWorker: 'serviceWorker' in navigator,
    hasPushManager: 'PushManager' in window,
    currentPermission: Notification.permission as NotificationPermissionStatus,
  };
}

// ============================================================================
// PERMISSION MANAGEMENT
// ============================================================================

/**
 * Get current notification permission
 */
export function getNotificationPermission(): NotificationPermissionStatus {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'default';
  }
  return Notification.permission as NotificationPermissionStatus;
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermissionStatus> {
  if (!('Notification' in window)) {
    logger.warn('Notifications not supported');
    return 'denied';
  }

  const currentPermission =
    Notification.permission as NotificationPermissionStatus;

  if (currentPermission === 'granted') {
    return 'granted';
  }

  if (currentPermission === 'denied') {
    logger.info('Notification permission previously denied');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    logger.info('Notification permission result:', { permission });
    return permission as NotificationPermissionStatus;
  } catch (error) {
    logger.error(
      'Error requesting notification permission',
      error instanceof Error ? error : undefined
    );
    return 'denied';
  }
}

// ============================================================================
// SERVICE WORKER MANAGEMENT
// ============================================================================

/**
 * Register service worker for background notifications
 */
async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    logger.warn('Service Worker not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js',
      { scope: '/' }
    );

    logger.info('Service Worker registered', {
      scope: registration.scope,
      active: !!registration.active,
    });

    return registration;
  } catch (error) {
    logger.error(
      'Service Worker registration failed',
      error instanceof Error ? error : undefined
    );
    return null;
  }
}

// ============================================================================
// FCM TOKEN MANAGEMENT
// ============================================================================

/**
 * Get FCM token for this device
 */
export async function getFCMToken(): Promise<string | null> {
  const messagingInstance = getMessagingInstance();
  if (!messagingInstance) {
    logger.warn('Firebase Messaging not available');
    return null;
  }

  if (!VAPID_KEY) {
    logger.error('VAPID key not configured');
    return null;
  }

  try {
    // Request permission
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      logger.info('Notification permission not granted');
      return null;
    }

    // Register service worker
    const registration = await registerServiceWorker();
    if (!registration) {
      logger.error('Service worker registration required for FCM');
      return null;
    }

    // Get FCM token
    const token = await getToken(messagingInstance, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      logger.info('FCM token obtained', {
        tokenPrefix: token.substring(0, 20) + '...',
      });
      // Store locally for reference
      localStorage.setItem('fcm_token', token);
      localStorage.setItem('fcm_token_timestamp', Date.now().toString());
    }

    return token;
  } catch (error) {
    logger.error(
      'Failed to get FCM token',
      error instanceof Error ? error : undefined
    );
    return null;
  }
}

/**
 * Delete FCM token
 */
export async function deleteFCMToken(): Promise<boolean> {
  const messagingInstance = getMessagingInstance();
  if (!messagingInstance) {
    return false;
  }

  try {
    await deleteToken(messagingInstance);
    localStorage.removeItem('fcm_token');
    localStorage.removeItem('fcm_token_timestamp');
    logger.info('FCM token deleted');
    return true;
  } catch (error) {
    logger.error(
      'Failed to delete FCM token',
      error instanceof Error ? error : undefined
    );
    return false;
  }
}

/**
 * Check if token is stored locally
 */
export function hasStoredToken(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return !!localStorage.getItem('fcm_token');
}

// ============================================================================
// DEVICE REGISTRATION
// ============================================================================

/**
 * Detect device type
 */
function getDeviceType(): 'WEB' | 'ANDROID' | 'IOS' {
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return 'ANDROID';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'IOS';
  return 'WEB';
}

/**
 * Get device name
 */
function getDeviceName(): string {
  const platform = navigator.platform || 'Unknown';
  const browserMatch = navigator.userAgent.match(
    /(?:Chrome|Firefox|Safari|Edge)\/[\d.]+/
  );
  const browser = browserMatch ? browserMatch[0] : 'Browser';
  return `${platform} - ${browser}`;
}

/**
 * Subscribe to push notifications
 * Registers device with backend
 */
export async function subscribeToPushNotifications(): Promise<PushSubscriptionResult> {
  try {
    // Get FCM token
    const token = await getFCMToken();
    if (!token) {
      return {
        success: false,
        error:
          'FCM token alınamadı. Lütfen tarayıcı ayarlarınızı kontrol edin.',
      };
    }

    // Prepare device info
    const deviceInfo = {
      token,
      deviceType: getDeviceType(),
      deviceName: getDeviceName(),
    };

    logger.info('Registering device with backend', {
      deviceType: deviceInfo.deviceType,
      tokenPrefix: token.substring(0, 20) + '...',
    });

    // Register with backend
    const response = await apiClient.post<{
      success: boolean;
      data?: DeviceTokenResponse;
      message?: string;
    }>('/notifications/push/subscribe', deviceInfo);

    if (response.success && response.data) {
      logger.info('Device registered successfully', {
        deviceId: response.data.id,
      });
      toast.success('Push bildirimleri başarıyla etkinleştirildi');
      return {
        success: true,
        deviceId: response.data.id,
      };
    } else {
      const errorMessage = response.message || 'Cihaz kaydı başarısız oldu';
      logger.error('Device registration failed', undefined, {
        message: errorMessage,
      });
      toast.error(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Bilinmeyen hata';
    logger.error(
      'Subscribe to push failed',
      error instanceof Error ? error : undefined
    );
    toast.error('Push bildirimlere abone olurken hata oluştu');
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<PushSubscriptionResult> {
  try {
    const token = localStorage.getItem('fcm_token');
    if (!token) {
      logger.info('No FCM token found, already unsubscribed');
      return { success: true };
    }

    logger.info('Unsubscribing from push notifications');

    // Unregister from backend
    const response = await apiClient.delete<{
      success: boolean;
      message?: string;
    }>(`/notifications/push/unsubscribe?token=${encodeURIComponent(token)}`);

    if (response.success) {
      // Delete local token
      await deleteFCMToken();
      logger.info('Successfully unsubscribed from push notifications');
      toast.success('Push bildirimleri kapatıldı');
      return { success: true };
    } else {
      const errorMessage = response.message || 'Abonelik iptali başarısız oldu';
      logger.error('Unsubscribe failed', undefined, { message: errorMessage });
      toast.error(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Bilinmeyen hata';
    logger.error(
      'Unsubscribe from push failed',
      error instanceof Error ? error : undefined
    );
    toast.error('Abonelikten çıkarken hata oluştu');
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Check if device is currently subscribed
 */
export async function isDeviceSubscribed(): Promise<boolean> {
  try {
    const token = localStorage.getItem('fcm_token');
    if (!token) {
      return false;
    }

    // Verify with backend
    const devices = await getRegisteredDevices();
    return devices.some((device) => device.token === token && device.isActive);
  } catch (error) {
    logger.error(
      'Failed to check subscription status',
      error instanceof Error ? error : undefined
    );
    return false;
  }
}

// ============================================================================
// DEVICE MANAGEMENT
// ============================================================================

/**
 * Get list of registered devices
 */
export async function getRegisteredDevices(): Promise<DeviceTokenResponse[]> {
  try {
    const response = await apiClient.get<{
      success: boolean;
      data?: DeviceTokenResponse[];
    }>('/notifications/push/devices');
    return response.data || [];
  } catch (error) {
    logger.error(
      'Failed to get registered devices',
      error instanceof Error ? error : undefined
    );
    return [];
  }
}

// ============================================================================
// FOREGROUND NOTIFICATIONS
// ============================================================================

/**
 * Setup foreground message listener
 * Shows notifications when app is in focus
 */
export function setupForegroundMessageListener(
  onNotification?: (payload: MessagePayload) => void
): (() => void) | null {
  const messagingInstance = getMessagingInstance();
  if (!messagingInstance) {
    logger.warn('Cannot setup foreground listener: messaging not available');
    return null;
  }

  const unsubscribe = onMessage(messagingInstance, (payload) => {
    logger.info('Foreground notification received', {
      title: payload.notification?.title,
      hasData: !!payload.data,
    });

    // Show toast notification
    if (payload.notification) {
      toast(payload.notification.title || 'Yeni Bildirim', {
        description: payload.notification.body,
        duration: 5000,
        action: payload.data?.url
          ? {
              label: 'Aç',
              onClick: () => {
                if (payload.data?.url) {
                  window.location.href = payload.data.url as string;
                }
              },
            }
          : undefined,
      });
    }

    // Call custom handler
    if (onNotification) {
      onNotification(payload);
    }
  });

  logger.info('Foreground message listener setup complete');
  return unsubscribe;
}

// ============================================================================
// TESTING & DEBUGGING
// ============================================================================

/**
 * Send test notification
 */
export async function sendTestNotification(): Promise<boolean> {
  try {
    const response = await apiClient.post<{
      success: boolean;
      message?: string;
    }>('/notifications/push/test', {});

    if (response.success) {
      toast.success('Test bildirimi gönderildi');
      return true;
    } else {
      toast.error(response.message || 'Test bildirimi gönderilemedi');
      return false;
    }
  } catch (error) {
    logger.error(
      'Test notification failed',
      error instanceof Error ? error : undefined
    );
    toast.error('Test bildirimi gönderilirken hata oluştu');
    return false;
  }
}

/**
 * Get diagnostics information
 */
export async function getDiagnostics(): Promise<{
  configuration: {
    isConfigured: boolean;
    hasAllKeys: boolean;
  };
  support: ReturnType<typeof getSupportInfo>;
  token: {
    hasToken: boolean;
    tokenAge: number | null;
  };
  subscription: {
    isSubscribed: boolean;
    deviceCount: number;
  };
}> {
  const hasToken = hasStoredToken();
  const tokenTimestamp = localStorage.getItem('fcm_token_timestamp');
  const tokenAge = tokenTimestamp
    ? Date.now() - parseInt(tokenTimestamp)
    : null;
  const devices = await getRegisteredDevices();

  return {
    configuration: {
      isConfigured: isFirebaseConfigured(),
      hasAllKeys: validateConfiguration(),
    },
    support: getSupportInfo(),
    token: {
      hasToken,
      tokenAge,
    },
    subscription: {
      isSubscribed: await isDeviceSubscribed(),
      deviceCount: devices.length,
    },
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if push notifications are supported
 */
export async function isSupported(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  return !!(
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
}

/**
 * Get current permission status
 */
export async function getPermissionStatus(): Promise<NotificationPermission> {
  if (typeof window === 'undefined') return 'default';

  return 'Notification' in window ? Notification.permission : 'default';
}

/**
 * Check if currently subscribed
 */
export async function isSubscribed(): Promise<boolean> {
  return await isDeviceSubscribed();
}
