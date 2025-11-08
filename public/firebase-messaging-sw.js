/**
 * ================================================
 * FIREBASE CLOUD MESSAGING SERVICE WORKER
 * ================================================
 * Production-ready service worker for background push notifications
 * 
 * Handles:
 * - Background message delivery
 * - Notification click events
 * - Push subscription management
 * - Deep linking to app routes
 * 
 * Note: This file runs in a separate worker context.
 * It cannot access window, localStorage, or main app modules.
 * 
 * @author MarifetBul Development Team
 * @version 1.0.0 - Production Ready
 */

// ============================================================================
// FIREBASE SCRIPTS
// ============================================================================

importScripts(
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js'
);
importScripts(
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js'
);

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Firebase Configuration
 * 
 * This configuration is injected during build time from environment variables.
 * In production, Next.js replaces process.env.* with actual values.
 * 
 * Required environment variables:
 * - NEXT_PUBLIC_FIREBASE_API_KEY
 * - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
 * - NEXT_PUBLIC_FIREBASE_PROJECT_ID
 * - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
 * - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
 * - NEXT_PUBLIC_FIREBASE_APP_ID
 */
const firebaseConfig = {
  apiKey: self.firebaseConfig?.apiKey || '',
  authDomain: self.firebaseConfig?.authDomain || '',
  projectId: self.firebaseConfig?.projectId || '',
  storageBucket: self.firebaseConfig?.storageBucket || '',
  messagingSenderId: self.firebaseConfig?.messagingSenderId || '',
  appId: self.firebaseConfig?.appId || '',
};

// ============================================================================
// LOGGING
// ============================================================================

const isDev = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

const swLog = isDev 
  ? (...args) => console.log('[SW]', new Date().toISOString(), ...args)
  : () => {};

const swError = (...args) => console.error('[SW ERROR]', new Date().toISOString(), ...args);

// ============================================================================
// FIREBASE INITIALIZATION
// ============================================================================

try {
  // Validate configuration
  const missingKeys = Object.entries(firebaseConfig)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length > 0) {
    swError('Firebase configuration incomplete. Missing keys:', missingKeys);
    swError('Make sure environment variables are set and firebase-config is injected');
  } else {
    firebase.initializeApp(firebaseConfig);
    swLog('Firebase initialized successfully');
  }
} catch (error) {
  swError('Firebase initialization failed:', error);
}

// ============================================================================
// BACKGROUND MESSAGE HANDLER
// ============================================================================

/**
 * Get messaging instance safely
 */
function getMessaging() {
  try {
    return firebase.messaging();
  } catch (error) {
    swError('Failed to get messaging instance:', error);
    return null;
  }
}

const messaging = getMessaging();

if (messaging) {
  /**
   * Handle background messages when app is not in focus
   */
  messaging.onBackgroundMessage((payload) => {
    swLog('Received background message:', payload);

    const notificationTitle =
      payload.notification?.title || 'MarifetBul Bildirimi';
    
    const notificationOptions = {
      body: payload.notification?.body || 'Yeni bir bildiriminiz var',
      icon: payload.notification?.icon || '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      image: payload.notification?.image,
      tag: payload.data?.notificationId || `notification-${Date.now()}`,
      data: payload.data || {},
      requireInteraction: false,
      silent: false,
    };

    // Add action buttons based on notification type
    if (payload.data?.type) {
      notificationOptions.actions = getNotificationActions(payload.data.type);
    }

    return self.registration.showNotification(
      notificationTitle,
      notificationOptions
    );
  });
}

// ============================================================================
// NOTIFICATION ACTIONS
// ============================================================================

/**
 * Get notification actions based on type
 */
function getNotificationActions(type) {
  switch (type) {
    case 'NEW_MESSAGE':
      return [
        { action: 'open', title: 'Mesajı Aç' },
        { action: 'close', title: 'Kapat' },
      ];
    
    case 'NEW_ORDER':
    case 'ORDER_STATUS_CHANGED':
      return [
        { action: 'view_order', title: 'Siparişi Görüntüle' },
        { action: 'close', title: 'Kapat' },
      ];
    
    case 'NEW_PROPOSAL':
      return [
        { action: 'view_proposal', title: 'Teklifi Görüntüle' },
        { action: 'close', title: 'Kapat' },
      ];
    
    case 'REVIEW_RECEIVED':
      return [
        { action: 'view_review', title: 'Değerlendirmeyi Gör' },
        { action: 'close', title: 'Kapat' },
      ];
    
    default:
      return [{ action: 'open', title: 'Aç' }];
  }
}

/**
 * Get target URL based on notification type and data
 */
function getTargetUrl(data) {
  if (!data?.type) return '/notifications';

  switch (data.type) {
    case 'NEW_MESSAGE':
      return `/messages${data.conversationId ? `/${data.conversationId}` : ''}`;
    
    case 'NEW_ORDER':
    case 'ORDER_STATUS_CHANGED':
      return `/dashboard/orders${data.orderId ? `/${data.orderId}` : ''}`;
    
    case 'NEW_PROPOSAL':
      return `/dashboard/proposals${data.proposalId ? `/${data.proposalId}` : ''}`;
    
    case 'REVIEW_RECEIVED':
      return `/profile/${data.userId || ''}`;
    
    case 'PAYMENT_RECEIVED':
      return '/dashboard/wallet';
    
    case 'NEW_FOLLOWER':
      return `/profile/${data.followerId || ''}`;
    
    default:
      return '/notifications';
  }
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================
/**
 * Handle notification click events
 */
self.addEventListener('notificationclick', (event) => {
  swLog('Notification clicked:', event.notification.tag, 'action:', event.action);

  event.notification.close();

  // Handle close action
  if (event.action === 'close') {
    return;
  }

  // Get target URL
  const data = event.notification.data;
  const targetUrl = getTargetUrl(data);

  // Open or focus the app window
  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      .then((clientList) => {
        const targetFullUrl = new URL(targetUrl, self.location.origin).href;
        
        // Check if there's already a window open with this URL
        for (const client of clientList) {
          if (client.url === targetFullUrl && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window if none exists
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
      .catch((error) => {
        swError('Failed to handle notification click:', error);
      })
  );
});

/**
 * Handle push subscription changes
 * Re-subscribes and sends new token to backend
 */
self.addEventListener('pushsubscriptionchange', (event) => {
  swLog('Push subscription changed');

  event.waitUntil(
    self.registration.pushManager
      .subscribe(event.oldSubscription?.options || { userVisibleOnly: true })
      .then((subscription) => {
        swLog('Re-subscribed successfully');
        
        // Send new subscription to backend
        return fetch('/api/v1/notifications/push/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: subscription.endpoint,
            deviceType: 'WEB',
          }),
        });
      })
      .catch((error) => {
        swError('Re-subscription failed:', error);
      })
  );
});

/**
 * Service worker activation
 */
self.addEventListener('activate', (event) => {
  swLog('Service Worker activated');
  event.waitUntil(clients.claim());
});

/**
 * Service worker installation
 */
self.addEventListener('install', (event) => {
  swLog('Service Worker installed');
  self.skipWaiting();
});
