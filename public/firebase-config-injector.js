/**
 * ================================================
 * FIREBASE CONFIG INJECTOR
 * ================================================
 * Injects Firebase configuration into service worker context
 *
 * This script must be loaded BEFORE firebase-messaging-sw.js
 * It sets up the Firebase config in the global scope so the
 * service worker can access it.
 *
 * Usage in HTML:
 * <script src="/firebase-config-injector.js"></script>
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Production Ready
 */

(function () {
  'use strict';

  // Firebase configuration from environment variables
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  };

  // Register service worker with config
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/firebase-messaging-sw.js').then(
      (registration) => {
        // Send config to service worker
        if (registration.active) {
          registration.active.postMessage({
            type: 'FIREBASE_CONFIG',
            config: firebaseConfig,
          });
        }

        // Listen for service worker to become active
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated') {
                newWorker.postMessage({
                  type: 'FIREBASE_CONFIG',
                  config: firebaseConfig,
                });
              }
            });
          }
        });

        console.log('Firebase service worker registered with config');
      },
      (error) => {
        console.error('Firebase service worker registration failed:', error);
      }
    );
  }

  // Make config available globally for service worker
  if (typeof self !== 'undefined') {
    self.firebaseConfig = firebaseConfig;
  }
})();
