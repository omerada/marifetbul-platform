/**
 * Sentry Integration for Error Tracking and Performance Monitoring
 *
 * Features:
 * - Error tracking with detailed context
 * - Performance monitoring with traces
 * - Session replay for debugging
 * - Custom error filtering
 * - Breadcrumb tracking
 * - User context
 * - Release tracking
 *
 * Documentation: https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from '@sentry/nextjs';

// ============================================================================
// TYPES
// ============================================================================

interface SentryUser {
  id: string;
  email?: string;
  username?: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const SENTRY_ENABLED = process.env.NEXT_PUBLIC_ENABLE_SENTRY === 'true';
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

// eslint-disable-next-line no-console
console.log(
  SENTRY_ENABLED && SENTRY_DSN
    ? '✅ Sentry integration active'
    : 'ℹ️ Sentry is disabled'
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Set user context for error tracking
 */
export function setSentryUser(user: SentryUser): void {
  if (!SENTRY_ENABLED) return;

  logger.debug('Setting Sentry user context', { userIduserid, emailuseremail });

  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
}

/**
 * Clear user context (on logout)
 */
export function clearSentryUser(): void {
  if (!SENTRY_ENABLED) return;

  logger.debug('Clearing Sentry user context');
  Sentry.setUser(null);
}

/**
 * Add custom context to errors
 */
export function setSentryContext(
  key: string,
  context: Record<string, unknown>
): void {
  if (!SENTRY_ENABLED) return;

  logger.debug('Adding Sentry context', { key, context });
  Sentry.setContext(key, context);
}

/**
 * Add tags to errors
 */
export function setSentryTag(key: string, value: string): void {
  if (!SENTRY_ENABLED) return;

  logger.debug('Adding Sentry tag', { key, value });
  Sentry.setTag(key, value);
}

/**
 * Add breadcrumb manually
 */
export function addSentryBreadcrumb(breadcrumb: {
  message: string;
  category?: string;
  level?: 'debug' | 'info' | 'warning' | 'error';
  data?: Record<string, unknown>;
}): void {
  if (!SENTRY_ENABLED) return;

  logger.debug('Adding Sentry breadcrumb', breadcrumb);
  Sentry.addBreadcrumb({
    message: breadcrumb.message,
    category: breadcrumb.category,
    level: breadcrumb.level,
    data: breadcrumb.data,
  });
}

/**
 * Capture custom error
 */
export function captureSentryError(
  error: Error,
  context?: Record<string, unknown>
): void {
  if (!SENTRY_ENABLED) {
    logger.error('Error captured (Sentry disabled)', error, context);
    return;
  }

  logger.error('Capturing error to Sentry', error, context);
  Sentry.captureException(error, { extra: context });
}

/**
 * Capture custom message
 */
export function captureSentryMessage(
  message: string,
  level: 'debug' | 'info' | 'warning' | 'error' = 'info',
  context?: Record<string, unknown>
): void {
  if (!SENTRY_ENABLED) {
    const logLevel = level === 'warning' ? 'warn' : level;
    if (logLevel === 'error') {
      logger[logLevel](message, undefined, context);
    } else {
      logger[logLevel](message, context);
    }
    return;
  }

  const logLevel = level === 'warning' ? 'warn' : level;
  if (logLevel === 'error') {
    logger[logLevel](`Sentry message: ${message}`, undefined, context);
  } else {
    logger[logLevel](`Sentry message: ${message}`, context);
  }

  Sentry.captureMessage(message, {
    level: level as Sentry.SeverityLevel,
    extra: context,
  });
}

/**
 * Start a performance span for tracing
 * Uses modern Sentry v8 API
 */
export function withSentrySpan<T>(
  name: string,
  op: string,
  callback: () => T
): T {
  if (!SENTRY_ENABLED) return callback();

  logger.debug('Starting Sentry span', { name, op });
  return Sentry.startSpan({ name, op }, callback);
}

/**
 * Start an async performance span
 */
export async function withSentrySpanAsync<T>(
  name: string,
  op: string,
  callback: () => Promise<T>
): Promise<T> {
  if (!SENTRY_ENABLED) return callback();

  logger.debug('Starting Sentry async span', { name, op });
  return Sentry.startSpan({ name, op }, callback);
}

const sentryModule = {
  setSentryUser,
  clearSentryUser,
  setSentryContext,
  setSentryTag,
  addSentryBreadcrumb,
  captureSentryError,
  captureSentryMessage,
  withSentrySpan,
  withSentrySpanAsync,
};

export default sentryModule;
