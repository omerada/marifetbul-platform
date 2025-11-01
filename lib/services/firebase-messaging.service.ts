// Firebase Cloud Messaging Service
// Handles FCM token generation, subscription, and foreground notifications

/* eslint-disable no-console */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getMessaging,
  getToken,
  onMessage,
  Messaging,
  MessagePayload,
} from 'firebase/messaging';
import {
  firebaseConfig,
  vapidKey,
  isFirebaseConfigured,
} from '@/lib/config/firebase.config';
import { apiClient } from '@/lib/infrastructure/api/client';
import { toast } from 'sonner';

let firebaseApp: FirebaseApp | null = null;
let messaging: Messaging | null = null;

/**
 * Initialize Firebase app
 */
function initializeFirebase(): FirebaseApp | null {
  if (!isFirebaseConfigured()) {
    console.warn(
      'Firebase is not configured. Push notifications will be disabled.'
    );
    return null;
  }

  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    // Check if already initialized
    const existingApps = getApps();
    if (existingApps.length > 0) {
      firebaseApp = existingApps[0];
    } else {
      firebaseApp = initializeApp(firebaseConfig);
    }
    return firebaseApp;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return null;
  }
}

/**
 * Get Firebase Messaging instance
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
    console.error('Error getting messaging instance:', error);
    return null;
  }
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
}

/**
 * Register service worker
 */
async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers are not supported in this browser');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js',
      {
        scope: '/',
      }
    );
    console.log('Service Worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Get FCM token for this device
 */
export async function getFCMToken(): Promise<string | null> {
  const messagingInstance = getMessagingInstance();
  if (!messagingInstance) {
    console.warn('Firebase Messaging not available');
    return null;
  }

  if (!vapidKey) {
    console.error('VAPID key is not configured');
    return null;
  }

  try {
    // Request notification permission
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return null;
    }

    // Register service worker
    const registration = await registerServiceWorker();
    if (!registration) {
      return null;
    }

    // Get FCM token
    const token = await getToken(messagingInstance, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    console.log('FCM Token obtained:', token.substring(0, 20) + '...');
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

/**
 * Subscribe to push notifications
 * Registers device token with backend
 */
export async function subscribeToPushNotifications(): Promise<boolean> {
  try {
    const token = await getFCMToken();
    if (!token) {
      return false;
    }

    // Get device info
    const deviceName = `${navigator.platform} - ${navigator.userAgent.match(/(?:Chrome|Firefox|Safari|Edge)\/[\d.]+/)?.[0] || 'Browser'}`;

    // Determine device type
    let deviceType: 'WEB' | 'ANDROID' | 'IOS' = 'WEB';
    if (/Android/i.test(navigator.userAgent)) {
      deviceType = 'ANDROID';
    } else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      deviceType = 'IOS';
    }

    // Send token to backend
    const response = await apiClient.post<ApiResponse<DeviceTokenResponse>>(
      '/notifications/push/subscribe',
      {
        token,
        deviceType,
        deviceName,
      }
    );

    if (response.success) {
      console.log('Successfully subscribed to push notifications');
      toast.success('Push bildirimleri aktif edildi');
      return true;
    } else {
      console.error('Failed to subscribe:', response.message);
      toast.error('Push bildirim kaydı başarısız oldu');
      return false;
    }
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    toast.error('Push bildirimlere abone olurken hata oluştu');
    return false;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  try {
    const token = await getFCMToken();
    if (!token) {
      return false;
    }

    const response = await apiClient.delete<ApiResponse<void>>(
      `/notifications/push/unsubscribe?token=${encodeURIComponent(token)}`
    );

    if (response.success) {
      console.log('Successfully unsubscribed from push notifications');
      toast.success('Push bildirimleri devre dışı bırakıldı');
      return true;
    } else {
      console.error('Failed to unsubscribe:', response.message);
      toast.error('Push bildirim kaydı kaldırılamadı');
      return false;
    }
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    toast.error('Push bildirimlerden çıkarken hata oluştu');
    return false;
  }
}

/**
 * Check if push notifications are supported
 */
export function isPushNotificationSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission | null {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }
  return Notification.permission;
}

/**
 * Setup foreground message listener
 * Shows notifications when app is in focus
 */
export function setupForegroundMessageListener(
  onNotification?: (payload: MessagePayload) => void
): (() => void) | null {
  const messagingInstance = getMessagingInstance();
  if (!messagingInstance) {
    return null;
  }

  const unsubscribe = onMessage(messagingInstance, (payload) => {
    console.log('Foreground message received:', payload);

    // Show toast notification
    if (payload.notification) {
      toast(payload.notification.title || 'Yeni Bildirim', {
        description: payload.notification.body,
        duration: 5000,
        action: payload.data?.url
          ? {
              label: 'Aç',
              onClick: () => {
                window.location.href = payload.data!.url as string;
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

  return unsubscribe;
}

/**
 * Send test notification
 */
export async function sendTestNotification(): Promise<boolean> {
  try {
    const response = await apiClient.post<ApiResponse<unknown>>(
      '/notifications/push/test',
      {}
    );

    if (response.success) {
      toast.success('Test bildirimi gönderildi');
      return true;
    } else {
      toast.error(response.message || 'Test bildirimi gönderilemedi');
      return false;
    }
  } catch (error) {
    console.error('Error sending test notification:', error);
    toast.error('Test bildirimi gönderilirken hata oluştu');
    return false;
  }
}

/**
 * API Response wrapper from backend
 */
interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  timestamp?: string;
}

/**
 * Device token response from backend
 */
interface DeviceTokenResponse {
  id: string;
  token: string;
  deviceType: string;
  deviceName?: string;
  isActive: boolean;
  createdAt: string;
  lastUsedAt?: string;
}

/**
 * Get registered devices
 */
export async function getRegisteredDevices(): Promise<DeviceTokenResponse[]> {
  try {
    const response = await apiClient.get<ApiResponse<DeviceTokenResponse[]>>(
      '/notifications/push/devices'
    );
    if (response.success) {
      return response.data || [];
    }
    return [];
  } catch (error) {
    console.error('Error getting registered devices:', error);
    return [];
  }
}

/**
 * Check if current device is registered
 */
export async function isCurrentDeviceRegistered(): Promise<boolean> {
  try {
    const token = await getFCMToken();
    if (!token) {
      return false;
    }

    const devices = await getRegisteredDevices();
    return devices.some((device) => device.token === token);
  } catch (error) {
    console.error('Error checking device registration:', error);
    return false;
  }
}
