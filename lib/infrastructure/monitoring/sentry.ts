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

  if (process.env.NODE_ENV === 'development') {
    console.log('[Sentry] Setting user context', {
      userId: user.id,
      email: user.email,
    });
  }

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

  if (process.env.NODE_ENV === 'development') {
    console.log('[Sentry] Clearing user context');
  }
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

  if (process.env.NODE_ENV === 'development') {
    console.log('[Sentry] Adding context', { key, context });
  }
  Sentry.setContext(key, context);
}

/**
 * Add tags to errors
 */
export function setSentryTag(key: string, value: string): void {
  if (!SENTRY_ENABLED) return;

  if (process.env.NODE_ENV === 'development') {
    console.log('[Sentry] Adding tag', { key, value });
  }
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

  if (process.env.NODE_ENV === 'development') {
    console.log('[Sentry] Adding breadcrumb', breadcrumb);
  }
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
    console.error('[Sentry] Error captured (Sentry disabled)', error, context);
    return;
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[Sentry] Capturing error', error, context);
  }
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
    const consoleMethod =
      level === 'warning' ? 'warn' : level === 'debug' ? 'log' : level;
    if (level === 'error') {
      console[consoleMethod]('[Sentry] Message (disabled):', message, context);
    } else {
      console[consoleMethod]('[Sentry] Message (disabled):', message, context);
    }
    return;
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[Sentry] Capturing message:', message, context);
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

  if (process.env.NODE_ENV === 'development') {
    console.log('[Sentry] Starting span', { name, op });
  }
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

  if (process.env.NODE_ENV === 'development') {
    console.log('[Sentry] Starting async span', { name, op });
  }
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
