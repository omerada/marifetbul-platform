// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
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

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,

    // Capture Replay for 10% of all sessions,
    // plus for 100% of sessions with an error
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,

    // Ignore common errors
    ignoreErrors: [
      // Random plugins/extensions
      'top.GLOBALS',
      // See: http://blog.errorception.com/2012/03/tale-of-unfindable-js-error.html
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      'http://tt.epicplay.com',
      "Can't find variable: ZiteReader",
      'jigsaw is not defined',
      'ComboSearch is not defined',
      'http://loading.retry.widdit.com/',
      'atomicFindClose',
      // Facebook borked
      'fb_xd_fragment',
      // ISP "optimizing" proxy - `Cache-Control: no-transform` seems to reduce this. (thanks @acdha)
      // See http://stackoverflow.com/questions/4113268/how-to-stop-javascript-injection-from-vodafone-proxy
      'bmi_SafeAddOnload',
      'EBCallBackMessageReceived',
      // See http://toolbar.conduit.com/Developer/HtmlAndGadget/Methods/JSInjection.aspx
      'conduitPage',
      // Network errors
      'NetworkError',
      'Network request failed',
      'Failed to fetch',
      'Load failed',
    ],

    // Filter out unwanted events
    beforeSend(event, hint) {
      // Don't send events in development unless explicitly enabled
      if (SENTRY_ENVIRONMENT === 'development' && !process.env.SENTRY_DEBUG) {
        return null;
      }

      // Filter out certain errors
      const error = hint.originalException;
      if (error && typeof error === 'object' && 'message' in error) {
        const message = String(error.message);

        // Ignore chunk loading errors (common in hot reload)
        if (message.match(/Loading chunk [\d]+ failed/)) {
          return null;
        }

        // Ignore hydration errors (typically dev-only)
        if (message.includes('Hydration failed')) {
          return null;
        }
      }

      return event;
    },

    // Integrated tunnel endpoint to avoid ad-blockers
    // tunnel: '/api/monitoring/sentry-tunnel',
  });

  // Only log in development or when explicitly enabled
  if (SENTRY_ENVIRONMENT === 'development' || process.env.SENTRY_DEBUG) {
    // eslint-disable-next-line no-console
    console.log('✅ Sentry Server initialized');
  }
} else if (SENTRY_ENVIRONMENT === 'development' || process.env.SENTRY_DEBUG) {
  // eslint-disable-next-line no-console
  console.log('ℹ️ Sentry Server is disabled');
}
