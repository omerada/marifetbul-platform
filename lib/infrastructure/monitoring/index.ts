/**
 * Monitoring Infrastructure
 *
 * Central export for all monitoring, logging, and analytics functionality
 */

// Logger
export { default as logger } from './logger';
export {
  Logger,
  PerformanceTimer,
  measureAsync,
  measure,
  apiLogger,
  authLogger,
  cacheLogger,
  wsLogger,
  paymentLogger,
  analyticsLogger,
} from './logger';
export type { LogLevel, LogContext, LoggerOptions } from './logger';

// Sentry Error Tracking
export {
  default as Sentry,
  setSentryUser,
  clearSentryUser,
  setSentryContext,
  setSentryTag,
  addSentryBreadcrumb,
  captureSentryError,
  captureSentryMessage,
  // startSentryTransaction - REMOVED (not exported from sentry module)
  // createSentrySpan - REMOVED (not exported from sentry module)
} from './sentry';

// Google Analytics
export { default as analytics } from './analytics';
export {
  initGA,
  trackPageView,
  trackEvent,
  setUserProperties,
  setUserId,
  trackProductView,
  trackAddToCart,
  trackPurchase,
  trackBeginCheckout,
  trackJobApplication,
  trackServiceOrder,
  trackUserRegistration,
  trackUserLogin,
  trackSearch,
  trackMessageSent,
  trackProfileView,
  trackReviewSubmission,
  trackShare,
  trackDownload,
  trackVideoPlay,
  trackError,
  trackTiming,
  isGAEnabled,
  getGATrackingId,
} from './analytics';
