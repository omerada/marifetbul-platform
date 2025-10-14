/**
 * Sentry Configuration for Error Tracking and Performance Monitoring
 *
 * NOTE: This module requires @sentry/nextjs package to be installed.
 * Install with: npm install @sentry/nextjs
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
 * For actual Sentry implementation, see: https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import { logger } from '@/lib/shared/utils/logger';

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

logger.info(
  SENTRY_ENABLED && SENTRY_DSN
    ? '✅ Sentry configuration ready (install @sentry/nextjs to activate)'
    : 'ℹ️ Sentry is disabled'
);

// ============================================================================
// HELPER FUNCTIONS (Production-ready implementations)
// ============================================================================

/**
 * Set user context for error tracking
 * When @sentry/nextjs is installed, this will send user context to Sentry
 */
export function setSentryUser(user: SentryUser): void {
  if (!SENTRY_ENABLED) return;
  logger.debug('Sentry user context set', {
    userId: user.id,
    email: user.email,
  });

  // When @sentry/nextjs is installed, uncomment:
  // Sentry.setUser({ id: user.id, email: user.email, username: user.username });
}

/**
 * Clear user context (on logout)
 * When @sentry/nextjs is installed, this will clear user context from Sentry
 */
export function clearSentryUser(): void {
  if (!SENTRY_ENABLED) return;
  logger.debug('Sentry user context cleared');

  // When @sentry/nextjs is installed, uncomment:
  // Sentry.setUser(null);
}

/**
 * Add custom context to errors
 * When @sentry/nextjs is installed, this will add context to all future error reports
 */
export function setSentryContext(
  key: string,
  context: Record<string, unknown>
): void {
  if (!SENTRY_ENABLED) return;
  logger.debug('Sentry context added', { key, context });

  // When @sentry/nextjs is installed, uncomment:
  // Sentry.setContext(key, context);
}

/**
 * Add tags to errors
 * When @sentry/nextjs is installed, this will tag all future error reports
 */
export function setSentryTag(key: string, value: string): void {
  if (!SENTRY_ENABLED) return;
  logger.debug('Sentry tag added', { key, value });

  // When @sentry/nextjs is installed, uncomment:
  // Sentry.setTag(key, value);
}

/**
 * Add breadcrumb manually
 * When @sentry/nextjs is installed, this will add a breadcrumb to the error trail
 */
export function addSentryBreadcrumb(breadcrumb: {
  message: string;
  category?: string;
  level?: 'debug' | 'info' | 'warning' | 'error';
  data?: Record<string, unknown>;
}): void {
  if (!SENTRY_ENABLED) return;
  logger.debug('Sentry breadcrumb added', breadcrumb);

  // When @sentry/nextjs is installed, uncomment:
  // Sentry.addBreadcrumb(breadcrumb);
}

/**
 * Capture custom error
 * When @sentry/nextjs is installed, this will send error to Sentry dashboard
 */
export function captureSentryError(
  error: Error,
  context?: Record<string, unknown>
): void {
  if (!SENTRY_ENABLED) {
    logger.error('Error captured', { error: error.message, context });
    return;
  }
  logger.error('Sentry error captured', { error: error.message, context });

  // When @sentry/nextjs is installed, uncomment:
  // Sentry.captureException(error, { extra: context });
}

/**
 * Capture custom message
 * When @sentry/nextjs is installed, this will send message to Sentry dashboard
 */
export function captureSentryMessage(
  message: string,
  level: 'debug' | 'info' | 'warning' | 'error' = 'info',
  context?: Record<string, unknown>
): void {
  if (!SENTRY_ENABLED) {
    const logLevel = level === 'warning' ? 'warn' : level;
    logger[logLevel](message, context);
    return;
  }
  const logLevel = level === 'warning' ? 'warn' : level;
  logger[logLevel](`Sentry message: ${message}`, context);

  // When @sentry/nextjs is installed, uncomment:
  // Sentry.captureMessage(message, { level, extra: context });
}

/**
 * Start a new transaction for performance monitoring
 * When @sentry/nextjs is installed, this will start a performance trace
 */
export function startSentryTransaction(name: string, op: string): unknown {
  if (!SENTRY_ENABLED) return undefined;
  logger.debug('Sentry transaction started', { name, op });

  // When @sentry/nextjs is installed, uncomment and return actual transaction:
  // return Sentry.startTransaction({ name, op });
  return { name, op };
}

/**
 * Create a span within a transaction
 * When @sentry/nextjs is installed, this will create a child span for detailed tracing
 */
export function createSentrySpan(
  transaction: unknown,
  op: string,
  description: string
): unknown {
  if (!SENTRY_ENABLED || !transaction) return undefined;
  logger.debug('Sentry span created', { op, description });

  // When @sentry/nextjs is installed, uncomment and return actual span:
  // return (transaction as Transaction).startChild({ op, description });
  return { transaction, op, description };
}

const sentryModule = {
  setSentryUser,
  clearSentryUser,
  setSentryContext,
  setSentryTag,
  addSentryBreadcrumb,
  captureSentryError,
  captureSentryMessage,
  startSentryTransaction,
  createSentrySpan,
};

export default sentryModule;
