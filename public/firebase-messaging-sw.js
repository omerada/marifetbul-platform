// Firebase Cloud Messaging Service Worker
// This file handles background push notifications when app is not in focus

// Import Firebase scripts
importScripts(
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js'
);
importScripts(
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js'
);

// Firebase configuration
// Note: Replace these values with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

// Simple logger for service worker (can't use main app logger)
const isDev = self.location.hostname === 'localhost';
const swLog = isDev ? console.log.bind(console) : () => {};
const swError = console.error.bind(console); // Always log errors

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  swLog('[firebase-messaging-sw.js] Received background message:', payload);

  const notificationTitle =
    payload.notification?.title || 'MarifetBul Bildirimi';
  const notificationOptions = {
    body: payload.notification?.body || 'Yeni bir bildiriminiz var',
    icon: payload.notification?.icon || '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    image: payload.notification?.image,
    tag: payload.data?.notificationId || 'default',
    data: payload.data,
    actions: [],
    requireInteraction: false,
    silent: false,
  };

  // Add action buttons based on notification type
  if (payload.data?.type) {
    switch (payload.data.type) {
      case 'NEW_MESSAGE':
        notificationOptions.actions = [
          { action: 'open', title: 'Mesajı Aç', icon: '/icons/open.png' },
          { action: 'close', title: 'Kapat', icon: '/icons/close.png' },
        ];
        break;
      case 'NEW_ORDER':
      case 'ORDER_STATUS_CHANGED':
        notificationOptions.actions = [
          {
            action: 'view_order',
            title: 'Siparişi Görüntüle',
            icon: '/icons/order.png',
          },
          { action: 'close', title: 'Kapat', icon: '/icons/close.png' },
        ];
        break;
      case 'NEW_PROPOSAL':
        notificationOptions.actions = [
          {
            action: 'view_proposal',
            title: 'Teklifi Görüntüle',
            icon: '/icons/proposal.png',
          },
          { action: 'close', title: 'Kapat', icon: '/icons/close.png' },
        ];
        break;
      case 'REVIEW_RECEIVED':
        notificationOptions.actions = [
          {
            action: 'view_review',
            title: 'Değerlendirmeyi Gör',
            icon: '/icons/review.png',
          },
          { action: 'close', title: 'Kapat', icon: '/icons/close.png' },
        ];
        break;
      default:
        notificationOptions.actions = [
          { action: 'open', title: 'Aç', icon: '/icons/open.png' },
        ];
    }
  }

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

// Handle notification click events
self.addEventListener('notificationclick', (event) => {
  swLog(
    '[firebase-messaging-sw.js] Notification click:',
    event.notification.tag
  );

  event.notification.close();

  // Handle action button clicks
  if (event.action === 'close') {
    return;
  }

  // Get notification data
  const data = event.notification.data;
  let targetUrl = '/';

  // Determine target URL based on notification type
  if (data?.type) {
    switch (data.type) {
      case 'NEW_MESSAGE':
        targetUrl = `/messages${data.conversationId ? `/${data.conversationId}` : ''}`;
        break;
      case 'NEW_ORDER':
      case 'ORDER_STATUS_CHANGED':
        targetUrl = `/dashboard/orders${data.orderId ? `/${data.orderId}` : ''}`;
        break;
      case 'NEW_PROPOSAL':
        targetUrl = `/dashboard/proposals${data.proposalId ? `/${data.proposalId}` : ''}`;
        break;
      case 'REVIEW_RECEIVED':
        targetUrl = `/profile/${data.userId || ''}`;
        break;
      case 'PAYMENT_RECEIVED':
        targetUrl = '/dashboard/wallet';
        break;
      case 'NEW_FOLLOWER':
        targetUrl = `/profile/${data.followerId || ''}`;
        break;
      default:
        targetUrl = '/notifications';
    }
  }

  // Open or focus the app window
  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (
            client.url === new URL(targetUrl, self.location.origin).href &&
            'focus' in client
          ) {
            return client.focus();
          }
        }
        // Open new window if none exists
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// Handle push subscription changes
self.addEventListener('pushsubscriptionchange', (event) => {
  swLog('[firebase-messaging-sw.js] Push subscription changed');

  event.waitUntil(
    // Re-subscribe and send new token to backend
    self.registration.pushManager
      .subscribe(event.oldSubscription.options)
      .then((subscription) => {
        swLog('[firebase-messaging-sw.js] Re-subscribed:', subscription);
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
        swError('[firebase-messaging-sw.js] Re-subscription failed:', error);
      })
  );
});

// Log service worker activation
self.addEventListener('activate', (event) => {
  swLog('[firebase-messaging-sw.js] Service Worker activated');
});

// Log service worker installation
self.addEventListener('install', (event) => {
  swLog('[firebase-messaging-sw.js] Service Worker installed');
  self.skipWaiting();
});
