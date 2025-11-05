// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.NODE_ENV || 'development';
const SENTRY_ENABLED = process.env.NEXT_PUBLIC_ENABLE_SENTRY === 'true';

if (SENTRY_ENABLED && SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Environment
    environment: SENTRY_ENVIRONMENT,

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: SENTRY_ENVIRONMENT === 'production' ? 0.1 : 1.0,

    // Capture Replay for 10% of all sessions,
    // plus 100% of sessions with an error
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,

    // Note: if you want to override the automatic release value, do not set a
    // `release` value here - use the environment variable `SENTRY_RELEASE`, so
    // that it will also get attached to your source maps

    // Ignore common client-side errors
    ignoreErrors: [
      // Random plugins/extensions
      'top.GLOBALS',
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      "Can't find variable: ZiteReader",
      'jigsaw is not defined',
      'ComboSearch is not defined',
      'atomicFindClose',
      // Facebook
      'fb_xd_fragment',
      // ISP optimizing proxy
      'bmi_SafeAddOnload',
      'EBCallBackMessageReceived',
      'conduitPage',
      // Network errors
      'NetworkError',
      'Network request failed',
      'Failed to fetch',
      'Load failed',
      // ResizeObserver errors (browser bugs)
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      // Chrome extensions
      'chrome-extension://',
      'moz-extension://',
    ],

    // Filter unwanted events before sending
    beforeSend(event, hint) {
      // Don't send events in development
      if (
        SENTRY_ENVIRONMENT === 'development' &&
        !process.env.NEXT_PUBLIC_SENTRY_DEBUG
      ) {
        return null;
      }

      const error = hint.originalException;
      if (error && typeof error === 'object' && 'message' in error) {
        const message = String(error.message);

        // Ignore chunk loading errors
        if (message.match(/Loading chunk [\d]+ failed/)) {
          return null;
        }

        // Ignore hydration errors
        if (message.includes('Hydration failed')) {
          return null;
        }

        // Ignore extension errors
        if (
          message.includes('chrome-extension://') ||
          message.includes('moz-extension://')
        ) {
          return null;
        }
      }

      return event;
    },

    // Integrated tunnel to avoid ad-blockers
    // tunnel: '/api/monitoring/sentry-tunnel',
  });

  // eslint-disable-next-line no-console
  console.log('✅ Sentry Client initialized');
} else {
  // eslint-disable-next-line no-console
  console.log('ℹ️ Sentry Client is disabled');
}
