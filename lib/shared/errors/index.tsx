// Production-ready error handling system
'use client';

import { logger } from '@/lib/shared/utils/logger';

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date();
    this.context = context;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      isOperational: this.isOperational,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      stack: this.stack,
    };
  }
}

// Predefined error types
export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, true, context);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTH_ERROR', 401, true);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403, true);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND', 404, true);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'CONFLICT_ERROR', 409, true, context);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT', 429, true);
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network request failed') {
    super(message, 'NETWORK_ERROR', 0, true);
  }
}

// Error logging interface
export interface ErrorLogger {
  error(error: Error | AppError, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
}

// Console logger implementation
export class ConsoleLogger implements ErrorLogger {
  error(error: Error | AppError, context?: Record<string, unknown>): void {
    logger.error('[ERROR]', error, {
      ...(error instanceof AppError ? error.toJSON() : {}),
      context,
    });
  }

  warn(message: string, context?: Record<string, unknown>): void {
    logger.warn(
      `[WARN] ${message}`,
      new Error(
        JSON.stringify({ context, timestamp: new Date().toISOString() })
      )
    );
  }

  info(message: string, context?: Record<string, unknown>): void {
    logger.info(`[INFO] ${message}`, {
      context,
      timestamp: new Date().toISOString(),
    });
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`[DEBUG] ${message}`, {
        context,
        timestamp: new Date().toISOString(),
      });
    }
  }
}

// Error boundary for React components
export class ErrorBoundaryError extends AppError {
  constructor(error: Error, errorInfo: { componentStack: string }) {
    super(`Component error: ${error.message}`, 'COMPONENT_ERROR', 500, true, {
      originalError: error.name,
      componentStack: errorInfo.componentStack,
    });
  }
}

// Global error handler
export class GlobalErrorHandler {
  private logger: ErrorLogger;

  constructor(logger: ErrorLogger = new ConsoleLogger()) {
    this.logger = logger;
  }

  handleError(error: Error | AppError): void {
    this.logger.error(error);

    // Only report operational errors in production
    if (error instanceof AppError && !error.isOperational) {
      // Report to external service (Sentry, LogRocket, etc.)
      this.reportError(error);
    }

    // Trigger error recovery if needed
    this.attemptRecovery(error);
  }

  private reportError(error: AppError): void {
    // Integration with error reporting service
    if (typeof window !== 'undefined' && window.navigator.sendBeacon) {
      const errorData = JSON.stringify(error.toJSON());
      window.navigator.sendBeacon('/api/errors', errorData);
    }
  }

  private attemptRecovery(error: Error | AppError): void {
    // Basic recovery strategies
    if (error instanceof NetworkError) {
      // Retry logic could be implemented here
      this.logger.info('Attempting network recovery...');
    }
  }
}

// Singleton instance
export const globalErrorHandler = new GlobalErrorHandler();

// Error handling utilities
export const handleAsyncError = <T extends unknown[]>(
  fn: (...args: T) => Promise<unknown>
) => {
  return async (...args: T) => {
    try {
      return await fn(...args);
    } catch (error) {
      globalErrorHandler.handleError(error as Error);
      throw error;
    }
  };
};

export const withErrorBoundary = <T extends Record<string, unknown>>(
  Component: React.ComponentType<T>
) => {
  return function WithErrorBoundaryComponent(props: T) {
    return (
      <ErrorBoundary>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

// React Error Boundary Component
import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const boundaryError = new ErrorBoundaryError(error, {
      componentStack: errorInfo.componentStack || '',
    });
    globalErrorHandler.handleError(boundaryError);

    this.setState({
      error,
      errorInfo,
    });
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 p-3">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="mb-2 text-lg font-semibold text-gray-900">
                Bir hata oluştu
              </h2>
              <p className="mb-4 text-sm text-gray-600">
                Beklenmeyen bir hata meydana geldi. Lütfen sayfayı yenileyin
                veya daha sonra tekrar deneyin.
              </p>
              <div className="space-x-3">
                <button
                  onClick={() => window.location.reload()}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Sayfayı Yenile
                </button>
                <button
                  onClick={() => (window.location.href = '/')}
                  className="rounded-md bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-400"
                >
                  Ana Sayfaya Git
                </button>
              </div>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700">
                    Hata Detayları (Geliştirme)
                  </summary>
                  <pre className="mt-2 overflow-auto rounded bg-gray-100 p-2 text-xs">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
