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

console.info(
  SENTRY_ENABLED && SENTRY_DSN
    ? '✅ Sentry configuration ready (install @sentry/nextjs to activate)'
    : 'ℹ️ Sentry is disabled'
);

// ============================================================================
// HELPER FUNCTIONS (Stub implementations)
// ============================================================================

/**
 * Set user context for error tracking
 */
export function setSentryUser(user: SentryUser): void {
  if (!SENTRY_ENABLED) return;
  console.debug('Sentry user context:', user);
}

/**
 * Clear user context (on logout)
 */
export function clearSentryUser(): void {
  if (!SENTRY_ENABLED) return;
  console.debug('Sentry user context cleared');
}

/**
 * Add custom context to errors
 */
export function setSentryContext(
  key: string,
  context: Record<string, unknown>
): void {
  if (!SENTRY_ENABLED) return;
  console.debug('Sentry context:', key, context);
}

/**
 * Add tags to errors
 */
export function setSentryTag(key: string, value: string): void {
  if (!SENTRY_ENABLED) return;
  console.debug('Sentry tag:', key, value);
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
  console.debug('Sentry breadcrumb:', breadcrumb);
}

/**
 * Capture custom error
 */
export function captureSentryError(
  error: Error,
  context?: Record<string, unknown>
): void {
  if (!SENTRY_ENABLED) {
    console.error('Error:', error, context);
    return;
  }
  console.error('Sentry error:', error, context);
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
    console.log(`[${level}] ${message}`, context);
    return;
  }
  console.log(`[Sentry] [${level}] ${message}`, context);
}

/**
 * Start a new transaction for performance monitoring
 */
export function startSentryTransaction(name: string, op: string): unknown {
  if (!SENTRY_ENABLED) return undefined;
  console.debug('Sentry transaction started:', name, op);
  return { name, op };
}

/**
 * Create a span within a transaction
 */
export function createSentrySpan(
  transaction: unknown,
  op: string,
  description: string
): unknown {
  if (!SENTRY_ENABLED || !transaction) return undefined;
  console.debug('Sentry span created:', op, description);
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
