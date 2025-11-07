// Simple logger for service worker (can't use main app logger)
const isDev = self.location.hostname === 'localhost';
const swLog = isDev ? console.log.bind(console) : () => {};
const swError = console.error.bind(console); // Always log errors

self.addEventListener('push', function (event) {
  if (!event.data) {
    return;
  }

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    return;
  }

  const options = {
    body: data.message || data.body,
    icon: data.icon || '/icons/notification-icon.png',
    badge: data.badge || '/icons/badge-icon.png',
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
    data: {
      url: data.url || data.actionUrl || '/',
      notificationId: data.notificationId,
      userId: data.userId,
      timestamp: Date.now(),
    },
    actions: data.actions || [
      {
        action: 'view',
        title: 'Görüntüle',
        icon: '/icons/view-icon.png',
      },
      {
        action: 'dismiss',
        title: 'Kapat',
        icon: '/icons/close-icon.png',
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', function (event) {
  swLog('Notification click received:', event);

  event.notification.close();

  const action = event.action;
  const data = event.notification.data;

  if (action === 'dismiss') {
    return;
  }

  // Default action or 'view' action
  const urlToOpen = data.url || '/';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(function (clientList) {
        // Check if there's already a window/tab open with the target URL
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }

        // If no existing window/tab, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );

  // Mark notification as clicked if notificationId exists
  if (data.notificationId) {
    fetch('/api/notifications/' + data.notificationId + '/clicked', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: action || 'click',
        timestamp: Date.now(),
      }),
    }).catch(function (error) {
      swError('Error tracking notification click:', error);
    });
  }
});

self.addEventListener('notificationclose', function (event) {
  swLog('Notification closed:', event);

  const data = event.notification.data;

  // Track notification dismissal
  if (data.notificationId) {
    fetch('/api/notifications/' + data.notificationId + '/dismissed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timestamp: Date.now(),
      }),
    }).catch(function (error) {
      swError('Error tracking notification dismissal:', error);
    });
  }
});

// Background sync for offline notifications
self.addEventListener('sync', function (event) {
  if (event.tag === 'background-sync-notifications') {
    event.waitUntil(
      fetch('/api/notifications/sync')
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          if (data.notifications && data.notifications.length > 0) {
            // Show offline notifications that were queued
            data.notifications.forEach(function (notification) {
              self.registration.showNotification(notification.title, {
                body: notification.message,
                icon: notification.icon || '/icons/notification-icon.png',
                badge: '/icons/badge-icon.png',
                tag: notification.tag || 'offline-sync',
                data: {
                  url: notification.url || '/',
                  notificationId: notification.id,
                  timestamp: Date.now(),
                },
              });
            });
          }
        })
        .catch(function (error) {
          swError('Background sync failed:', error);
        })
    );
  }
});

// Install event
self.addEventListener('install', function () {
  swLog('Service Worker installing');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', function (event) {
  swLog('Service Worker activating');
  event.waitUntil(self.clients.claim());
});

// Handle background sync registration
self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SYNC_NOTIFICATIONS') {
    self.registration.sync
      .register('background-sync-notifications')
      .catch(function (error) {
        swError('Background sync registration failed:', error);
      });
  }
});
