/**
 * Custom Logger for Production Environment
 *
 * Features:
 * - Log levels (debug, info, warn, error)
 * - Structured logging
 * - Context tracking
 * - Production/development modes
 * - Integration with Sentry
 * - Console formatting
 *
 * @example
 * logger.info('User logged in', { userId: '123' });
 * logger.error('Payment failed', { orderId: '456', error });
 */

import { captureSentryError, captureSentryMessage } from './sentry';

// ============================================================================
// TYPES
// ============================================================================

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

interface LoggerOptions {
  level?: LogLevel;
  enableConsole?: boolean;
  enableSentry?: boolean;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const DEFAULT_OPTIONS: Required<LoggerOptions> = {
  level: IS_PRODUCTION ? 'info' : 'debug',
  enableConsole: true,
  enableSentry: IS_PRODUCTION,
};

// ============================================================================
// LOGGER CLASS
// ============================================================================

class Logger {
  private options: Required<LoggerOptions>;
  private context: LogContext;

  constructor(options: LoggerOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.context = {};
  }

  /**
   * Set global context that will be included in all logs
   */
  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Clear global context
   */
  clearContext(): void {
    this.context = {};
  }

  /**
   * Check if log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.options.level];
  }

  /**
   * Format log message
   */
  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): string {
    const timestamp = new Date().toISOString();
    const contextStr = context
      ? ` ${JSON.stringify({ ...this.context, ...context })}`
      : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  /**
   * Log to console
   */
  private logToConsole(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): void {
    if (!this.options.enableConsole) return;

    const formattedMessage = this.formatMessage(level, message, context);
    const consoleMethod = level === 'debug' ? 'log' : level;

    if (IS_PRODUCTION) {
      // Structured logging for production
      console[consoleMethod](
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level,
          message,
          context: { ...this.context, ...context },
        })
      );
    } else {
      // Formatted logging for development
      console[consoleMethod](formattedMessage);
    }
  }

  /**
   * Log to Sentry
   */
  private logToSentry(
    level: LogLevel,
    message: string,
    error?: Error,
    context?: LogContext
  ): void {
    if (!this.options.enableSentry) return;

    const fullContext = { ...this.context, ...context };

    if (error) {
      captureSentryError(error, fullContext);
    } else {
      // Map 'warn' to 'warning' for Sentry
      const sentryLevel = level === 'warn' ? 'warning' : level;
      captureSentryMessage(message, sentryLevel, fullContext);
    }
  }

  /**
   * Debug log
   */
  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog('debug')) return;
    this.logToConsole('debug', message, context);
  }

  /**
   * Info log
   */
  info(message: string, context?: LogContext): void {
    if (!this.shouldLog('info')) return;
    this.logToConsole('info', message, context);
    this.logToSentry('info', message, undefined, context);
  }

  /**
   * Warning log
   */
  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog('warn')) return;
    this.logToConsole('warn', message, context);
    this.logToSentry('warn', message, undefined, context);
  }

  /**
   * Error log
   */
  error(message: string, error?: Error, context?: LogContext): void {
    if (!this.shouldLog('error')) return;

    const errorContext = error
      ? {
          ...context,
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
        }
      : context;

    this.logToConsole('error', message, errorContext);
    this.logToSentry('error', message, error, context);
  }

  /**
   * Create child logger with additional context
   */
  child(context: LogContext): Logger {
    const childLogger = new Logger(this.options);
    childLogger.setContext({ ...this.context, ...context });
    return childLogger;
  }
}

// ============================================================================
// DEFAULT LOGGER INSTANCE
// ============================================================================

const logger = new Logger();

// ============================================================================
// SPECIALIZED LOGGERS
// ============================================================================

export const apiLogger = logger.child({ module: 'api' });
export const authLogger = logger.child({ module: 'auth' });
export const cacheLogger = logger.child({ module: 'cache' });
export const wsLogger = logger.child({ module: 'websocket' });
export const paymentLogger = logger.child({ module: 'payment' });
export const analyticsLogger = logger.child({ module: 'analytics' });

// ============================================================================
// PERFORMANCE LOGGING
// ============================================================================

/**
 * Performance timer for measuring execution time
 */
export class PerformanceTimer {
  private startTime: number;
  private label: string;

  constructor(label: string) {
    this.label = label;
    this.startTime = performance.now();
  }

  /**
   * End timer and log duration
   */
  end(context?: LogContext): void {
    const duration = performance.now() - this.startTime;
    logger.debug(`${this.label} completed`, {
      ...context,
      duration: `${duration.toFixed(2)}ms`,
    });
  }
}

/**
 * Measure async function execution time
 */
export async function measureAsync<T>(
  label: string,
  fn: () => Promise<T>,
  context?: LogContext
): Promise<T> {
  const timer = new PerformanceTimer(label);
  try {
    const result = await fn();
    timer.end({ ...context, status: 'success' });
    return result;
  } catch (error) {
    timer.end({ ...context, status: 'error' });
    throw error;
  }
}

/**
 * Measure sync function execution time
 */
export function measure<T>(
  label: string,
  fn: () => T,
  context?: LogContext
): T {
  const timer = new PerformanceTimer(label);
  try {
    const result = fn();
    timer.end({ ...context, status: 'success' });
    return result;
  } catch (error) {
    timer.end({ ...context, status: 'error' });
    throw error;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { Logger };
export type { LogLevel, LogContext, LoggerOptions };
export default logger;
