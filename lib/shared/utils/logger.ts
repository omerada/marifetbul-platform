/**
 * Production-ready Logger Utility
 * Conditionally logs based on environment
 */

/* eslint-disable no-console */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDevelopment = process.env.NODE_ENV === 'development';
const isDebugEnabled = process.env.NEXT_PUBLIC_DEBUG === 'true';

class Logger {
  private shouldLog(level: LogLevel): boolean {
    // Always log errors
    if (level === 'error') return true;

    // Log warnings in development
    if (level === 'warn' && isDevelopment) return true;

    // Log info and debug only in development or when debug is enabled
    if (
      (level === 'info' || level === 'debug') &&
      (isDevelopment || isDebugEnabled)
    ) {
      return true;
    }

    return false;
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.log(`[INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }

  // Group logging for complex objects
  group(label: string, callback: () => void): void {
    if (isDevelopment || isDebugEnabled) {
      console.group(label);
      callback();
      console.groupEnd();
    }
  }

  // Table logging for arrays
  table(data: unknown): void {
    if (isDevelopment || isDebugEnabled) {
      console.table(data);
    }
  }
}

export const logger = new Logger();

// Re-export for convenience
export const { debug, info, warn, error, group, table } = logger;

export default logger;
