/**
 * Error Tracking Service
 * Centralized error tracking and reporting
 *
 * Production Ready: Integrate with Sentry, Rollbar, or similar service
 *
 * Setup Instructions:
 * 1. Install: npm install @sentry/nextjs
 * 2. Configure: Add sentry.client.config.ts and sentry.server.config.ts
 * 3. Add environment variables: NEXT_PUBLIC_SENTRY_DSN
 * 4. Uncomment Sentry integration code below
 *
 * @module ErrorTracking
 */

// import * as Sentry from '@sentry/nextjs';

export interface ErrorContext {
  user?: {
    id: string;
    email?: string;
    username?: string;
  };
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
}

/**
 * Initialize error tracking
 */
export function initErrorTracking(): void {
  if (process.env.NODE_ENV === 'production') {
    // Production: Initialize Sentry
    // Sentry.init({
    //   dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    //   environment: process.env.NODE_ENV,
    //   tracesSampleRate: 1.0,
    //   debug: false,
    // });
    console.log('Error tracking initialized (production mode)');
  } else {
    console.log('Error tracking initialized (development mode)');
  }
}

/**
 * Capture an exception
 */
export function captureException(error: Error, context?: ErrorContext): void {
  if (process.env.NODE_ENV === 'production') {
    // Production: Send to Sentry
    // if (context?.user) {
    //   Sentry.setUser({
    //     id: context.user.id,
    //     email: context.user.email,
    //     username: context.user.username,
    //   });
    // }
    // if (context?.tags) {
    //   Sentry.setTags(context.tags);
    // }
    // if (context?.extra) {
    //   Sentry.setContext('additional', context.extra);
    // }
    // Sentry.captureException(error);
  }

  // Development: Log to console
  console.error('[Error Tracking]', error);
  if (context) {
    console.error('[Context]', context);
  }
}

/**
 * Capture a message
 */
export function captureMessage(message: string, context?: ErrorContext): void {
  if (process.env.NODE_ENV === 'production') {
    // Production: Send to Sentry
    // Sentry.captureMessage(message, context?.level || 'info');
  }

  // Development: Log to console
  console.log('[Error Tracking Message]', message);
  if (context) {
    console.log('[Context]', context);
  }
}

/**
 * Set user context
 */
export function setUser(
  _user: {
    id: string;
    email?: string;
    username?: string;
  } | null
): void {
  if (process.env.NODE_ENV === 'production') {
    // Production: Set Sentry user
    // Sentry.setUser(_user);
  }
}

/**
 * Add breadcrumb
 */
export function addBreadcrumb(
  _message: string,
  _category: string,
  _data?: Record<string, unknown>
): void {
  if (process.env.NODE_ENV === 'production') {
    // Production: Add Sentry breadcrumb
    // Sentry.addBreadcrumb({
    //   message: _message,
    //   category: _category,
    //   data: _data,
    //   level: 'info',
    // });
  }
}

/**
 * Clear user context
 */
export function clearUser(): void {
  if (process.env.NODE_ENV === 'production') {
    // Production: Clear Sentry user
    // Sentry.setUser(null);
  }
}
