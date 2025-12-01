// Production-ready error reporting and monitoring system
'use client';

import React, { useCallback } from 'react';
import logger from '@/lib/infrastructure/monitoring/logger';

export interface ErrorReport {
  id: string;
  timestamp: number;
  message: string;
  stack?: string;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId: string;
  level: 'error' | 'warning' | 'info';
  context?: Record<string, unknown>;
  handled: boolean;
}

export interface ErrorReportingConfig {
  apiEndpoint?: string;
  apiKey?: string;
  environment: 'development' | 'staging' | 'production';
  enableConsoleLogging: boolean;
  enableRemoteReporting: boolean;
  maxReportsPerSession: number;
  reportingCooldown: number; // milliseconds
}

class ErrorReportingService {
  private config: ErrorReportingConfig;
  private reportCount = 0;
  private lastReportTime = 0;
  private sessionId: string;

  constructor(config: ErrorReportingConfig) {
    this.config = config;
    this.sessionId = this.generateSessionId();
    this.setupGlobalErrorHandlers();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupGlobalErrorHandlers(): void {
    if (typeof window === 'undefined') return;

    // Handle uncaught JavaScript errors
    window.addEventListener('error', (event) => {
      this.reportError({
        message: event.message,
        stack: event.error?.stack,
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
        handled: false,
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        handled: false,
      });
    });

    // Handle React errors (if using React error boundaries)
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Check if it's a React error
      if (args[0]?.includes?.('React') || args[0]?.includes?.('Component')) {
        this.reportError({
          message: args.join(' '),
          handled: true,
          level: 'error',
        });
      }
      originalConsoleError.apply(console, args);
    };
  }

  public reportError(errorData: Partial<ErrorReport>): void {
    // Rate limiting
    const now = Date.now();
    if (
      this.reportCount >= this.config.maxReportsPerSession ||
      now - this.lastReportTime < this.config.reportingCooldown
    ) {
      return;
    }

    const report: ErrorReport = {
      id: this.generateErrorId(),
      timestamp: now,
      message: errorData.message || 'Unknown error',
      stack: errorData.stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      sessionId: this.sessionId,
      level: errorData.level || 'error',
      context: errorData.context,
      handled: errorData.handled ?? true,
      ...errorData,
    };

    this.reportCount++;
    this.lastReportTime = now;

    // Console logging
    if (this.config.enableConsoleLogging) {
      this.logToConsole(report);
    }

    // Remote reporting
    if (this.config.enableRemoteReporting && this.config.apiEndpoint) {
      this.sendToRemote(report);
    }

    // Store locally for debugging
    this.storeLocally(report);
  }

  private generateErrorId(): string {
    return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private logToConsole(report: ErrorReport): void {
    const logLevel =
      report.level === 'error'
        ? 'error'
        : report.level === 'warning'
          ? 'warn'
          : 'info';

    const errorObj = new Error(report.message);
    if (report.stack) {
      errorObj.stack = report.stack;
    }

    if (logLevel === 'error') {
      logger.error(
        `[${report.level.toUpperCase()}] ${report.message}`,
        errorObj,
        {
          id: report.id,
          timestamp: new Date(report.timestamp).toISOString(),
          context: report.context,
          handled: report.handled,
        }
      );
    } else if (logLevel === 'warn') {
      logger.warn(`[${report.level.toUpperCase()}] ${report.message}`, {
        component: 'ErrorReporting',
        error: errorObj,
      });
    } else {
      logger.info('Error report', {
        id: report.id,
        timestamp: new Date(report.timestamp).toISOString(),
        context: report.context,
        handled: report.handled,
      });
    }
  }

  private async sendToRemote(report: ErrorReport): Promise<void> {
    try {
      const response = await fetch(this.config.apiEndpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && {
            Authorization: `Bearer ${this.config.apiKey}`,
          }),
        },
        body: JSON.stringify({
          ...report,
          environment: this.config.environment,
          version: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
        }),
      });

      if (!response.ok) {
        logger.warn('Failed to send error report', {
          component: 'ErrorReporting',
          error: new Error(`Status: ${response.status}`),
        });
      }
    } catch (err) {
      // Silently fail - don't create infinite error loops
      if (this.config.enableConsoleLogging) {
        logger.warn('Error reporting service failed', {
          component: 'ErrorReporting',
          error: err instanceof Error ? err : new Error(String(err)),
        });
      }
    }
  }

  private storeLocally(report: ErrorReport): void {
    try {
      const key = `error_reports_${this.sessionId}`;
      const existingReports = JSON.parse(localStorage.getItem(key) || '[]');
      existingReports.push(report);

      // Keep only last 50 reports
      if (existingReports.length > 50) {
        existingReports.splice(0, existingReports.length - 50);
      }

      localStorage.setItem(key, JSON.stringify(existingReports));
    } catch {
      // localStorage might be full or unavailable
    }
  }

  public getLocalReports(): ErrorReport[] {
    try {
      const key = `error_reports_${this.sessionId}`;
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      return [];
    }
  }

  public clearLocalReports(): void {
    try {
      const key = `error_reports_${this.sessionId}`;
      localStorage.removeItem(key);
    } catch {
      // Ignore errors
    }
  }
}

// Default configuration
const defaultConfig: ErrorReportingConfig = {
  environment:
    (process.env.NODE_ENV as 'development' | 'staging' | 'production') ||
    'development',
  enableConsoleLogging: process.env.NODE_ENV === 'development',
  enableRemoteReporting: process.env.NODE_ENV === 'production',
  maxReportsPerSession: 50,
  reportingCooldown: 1000, // 1 second
};

// Global instance
export const errorReporting = new ErrorReportingService(defaultConfig);

// React hook for error reporting

export function useErrorReporting() {
  const reportError = useCallback(
    (error: Error | string, context?: Record<string, unknown>) => {
      if (typeof error === 'string') {
        errorReporting.reportError({
          message: error,
          context,
          handled: true,
        });
      } else {
        errorReporting.reportError({
          message: error.message,
          stack: error.stack,
          context,
          handled: true,
        });
      }
    },
    []
  );

  const reportWarning = useCallback(
    (message: string, context?: Record<string, unknown>) => {
      errorReporting.reportError({
        message,
        level: 'warning',
        context,
        handled: true,
      });
    },
    []
  );

  const reportInfo = useCallback(
    (message: string, context?: Record<string, unknown>) => {
      errorReporting.reportError({
        message,
        level: 'info',
        context,
        handled: true,
      });
    },
    []
  );

  return {
    reportError,
    reportWarning,
    reportInfo,
    getLocalReports: errorReporting.getLocalReports.bind(errorReporting),
    clearLocalReports: errorReporting.clearLocalReports.bind(errorReporting),
  };
}

// Development error overlay component
export function ErrorReportingDebugPanel({
  enabled = process.env.NODE_ENV === 'development',
}: {
  enabled?: boolean;
}) {
  const [reports, setReports] = React.useState<ErrorReport[]>([]);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      setReports(errorReporting.getLocalReports());
    }, 2000);

    return () => clearInterval(interval);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`mb-2 rounded px-3 py-2 text-sm text-white shadow-lg ${
          reports.length > 0
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-gray-600 hover:bg-gray-700'
        }`}
      >
        Errors ({reports.length}) {isVisible ? '−' : '+'}
      </button>

      {isVisible && (
        <div className="max-h-96 w-96 overflow-y-auto rounded-lg border bg-white p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Error Reports</h3>
            <button
              onClick={() => {
                errorReporting.clearLocalReports();
                setReports([]);
              }}
              className="rounded bg-gray-100 px-2 py-1 text-xs hover:bg-gray-200"
            >
              Clear
            </button>
          </div>

          {reports.length === 0 ? (
            <p className="text-sm text-gray-500">No errors reported</p>
          ) : (
            <div className="space-y-2">
              {reports
                .slice(-10)
                .reverse()
                .map((report) => (
                  <div
                    key={report.id}
                    className={`rounded border-l-4 p-2 text-xs ${
                      report.level === 'error'
                        ? 'border-red-500 bg-red-50'
                        : report.level === 'warning'
                          ? 'border-yellow-500 bg-yellow-50'
                          : 'border-blue-500 bg-blue-50'
                    }`}
                  >
                    <div className="font-medium">{report.message}</div>
                    <div className="mt-1 text-xs text-gray-500">
                      {new Date(report.timestamp).toLocaleTimeString()}
                      {report.handled ? '' : ' (Unhandled)'}
                    </div>
                    {report.stack && (
                      <details className="mt-1">
                        <summary className="cursor-pointer text-gray-600">
                          Stack trace
                        </summary>
                        <pre className="mt-1 overflow-x-auto text-xs whitespace-pre-wrap">
                          {report.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ErrorReportingService;
