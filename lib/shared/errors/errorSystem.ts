// ================================================
// UNIFIED ERROR HANDLING SYSTEM
// ================================================
// Production-ready error handling with monitoring and recovery

import { ErrorInfo, ReactNode } from 'react';
import { logger } from '@/lib/shared/utils/logger';
import { getBackendApiUrl } from '@/lib/config/api';

// ================================
// ERROR TYPES
// ================================

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ErrorCategory =
  | 'ui'
  | 'api'
  | 'auth'
  | 'network'
  | 'business'
  | 'system';

export interface AppError extends Error {
  id?: string;
  code?: string | number;
  severity: ErrorSeverity;
  category: ErrorCategory;
  metadata?: Record<string, unknown>;
  recoverable?: boolean;
  userMessage?: string;
  timestamp?: Date;
  userId?: string;
  sessionId?: string;
  url?: string;
  stackTrace?: string;
  componentStack?: string;
}

export interface ErrorContextType {
  reportError: (error: AppError) => void;
  clearErrors: () => void;
  errors: AppError[];
  isLoading: boolean;
}

// ================================
// ERROR UTILITIES
// ================================

export function createAppError(
  message: string,
  options: Partial<AppError> = {}
): AppError {
  const error = new Error(message) as AppError;

  error.id =
    options.id ||
    `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  error.code = options.code;
  error.severity = options.severity || 'medium';
  error.category = options.category || 'system';
  error.metadata = options.metadata || {};
  error.recoverable = options.recoverable ?? true;
  error.userMessage =
    options.userMessage || 'Bir hata oluştu. Lütfen tekrar deneyin.';
  error.timestamp = new Date();
  error.url = typeof window !== 'undefined' ? window.location.href : undefined;
  error.stackTrace = error.stack;

  return error;
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof Error && 'severity' in error && 'category' in error;
}

export function enhanceError(
  error: unknown,
  context?: Partial<AppError>
): AppError {
  if (isAppError(error)) {
    return { ...error, ...context };
  }

  const message = error instanceof Error ? error.message : String(error);
  return createAppError(message, {
    severity: 'medium',
    category: 'system',
    ...context,
  });
}

// ================================
// ERROR RECOVERY STRATEGIES
// ================================

export interface RecoveryAction {
  label: string;
  action: () => void | Promise<void>;
  type: 'primary' | 'secondary';
}

export function getRecoveryActions(error: AppError): RecoveryAction[] {
  const actions: RecoveryAction[] = [];

  // Common recovery actions
  actions.push({
    label: 'Yeniden Dene',
    action: () => window.location.reload(),
    type: 'primary',
  });

  // Category-specific actions
  switch (error.category) {
    case 'network':
      actions.push({
        label: 'Bağlantıyı Kontrol Et',
        action: () => {
          // Open network diagnostic or show network status
          logger.debug('Checking network connection...');
        },
        type: 'secondary',
      });
      break;

    case 'auth':
      actions.push({
        label: 'Giriş Yap',
        action: () => {
          window.location.href = '/login';
        },
        type: 'primary',
      });
      break;

    case 'api':
      if (error.recoverable) {
        actions.push({
          label: 'Tekrar Dene',
          action: async () => {
            // Retry the failed API call
            logger.debug('Retrying API call...');
          },
          type: 'primary',
        });
      }
      break;
  }

  return actions;
}

// ================================
// ERROR MONITORING
// ================================

export interface ErrorMonitorConfig {
  enableConsoleLogging: boolean;
  enableRemoteLogging: boolean;
  maxErrorsPerSession: number;
  autoReport: boolean;
  excludeCategories: ErrorCategory[];
}

export class ErrorMonitor {
  private config: ErrorMonitorConfig;
  private sessionErrors: AppError[] = [];

  constructor(config: Partial<ErrorMonitorConfig> = {}) {
    this.config = {
      enableConsoleLogging: true,
      enableRemoteLogging: false,
      maxErrorsPerSession: 50,
      autoReport: true,
      excludeCategories: [],
      ...config,
    };
  }

  public reportError(error: AppError): void {
    // Prevent spam
    if (this.sessionErrors.length >= this.config.maxErrorsPerSession) {
      return;
    }

    // Skip excluded categories
    if (this.config.excludeCategories.includes(error.category)) {
      return;
    }

    // Add to session errors
    this.sessionErrors.push(error);

    // Console logging
    if (this.config.enableConsoleLogging) {
      this.logToConsole(error);
    }

    // Remote logging
    if (this.config.enableRemoteLogging && this.config.autoReport) {
      this.sendToRemote(error);
    }
  }

  private logToConsole(error: AppError): void {
    const logLevel = this.getLogLevel(error.severity);
    const message = `[${error.category.toUpperCase()}] ${error.message}`;

    console[logLevel]('🚨 Application Error:', {
      message,
      id: error.id,
      code: error.code,
      severity: error.severity,
      category: error.category,
      metadata: error.metadata,
      stack: error.stackTrace,
      url: error.url,
      timestamp: error.timestamp,
    });
  }

  private async sendToRemote(error: AppError): Promise<void> {
    try {
      // Send to backend error reporting API
      const endpoint =
        typeof window !== 'undefined'
          ? '/api/v1/errors/report'
          : `${getBackendApiUrl()}/errors/report`;

      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: error.id,
          message: error.message,
          code: error.code,
          severity: error.severity,
          category: error.category,
          metadata: error.metadata,
          stackTrace: error.stackTrace,
          url: error.url,
          timestamp: error.timestamp?.toISOString(),
          userAgent:
            typeof window !== 'undefined'
              ? window.navigator.userAgent
              : undefined,
        }),
      });
    } catch (sendError) {
      logger.error('Failed to send error to remote service', sendError);
    }
  }

  private getLogLevel(severity: ErrorSeverity): 'log' | 'warn' | 'error' {
    switch (severity) {
      case 'low':
        return 'log';
      case 'medium':
        return 'warn';
      case 'high':
      case 'critical':
        return 'error';
      default:
        return 'warn';
    }
  }

  public getSessionErrors(): AppError[] {
    return [...this.sessionErrors];
  }

  public clearSessionErrors(): void {
    this.sessionErrors = [];
  }

  public getErrorStats() {
    const stats = {
      total: this.sessionErrors.length,
      byCategory: {} as Record<ErrorCategory, number>,
      bySeverity: {} as Record<ErrorSeverity, number>,
    };

    this.sessionErrors.forEach((error) => {
      stats.byCategory[error.category] =
        (stats.byCategory[error.category] || 0) + 1;
      stats.bySeverity[error.severity] =
        (stats.bySeverity[error.severity] || 0) + 1;
    });

    return stats;
  }
}

// ================================
// GLOBAL ERROR MONITOR INSTANCE
// ================================

export const globalErrorMonitor = new ErrorMonitor({
  enableConsoleLogging: true,
  enableRemoteLogging: process.env.NODE_ENV === 'production',
  maxErrorsPerSession: 100,
  autoReport: true,
  excludeCategories: process.env.NODE_ENV === 'development' ? ['ui'] : [],
});

// ================================
// ERROR BOUNDARY HELPERS
// ================================

export interface ErrorBoundaryState {
  hasError: boolean;
  error: AppError | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

export function createErrorBoundaryState(): ErrorBoundaryState {
  return {
    hasError: false,
    error: null,
    errorInfo: null,
    retryCount: 0,
  };
}

export function handleErrorBoundaryError(
  error: Error,
  errorInfo: ErrorInfo,
  context?: Partial<AppError>
): AppError {
  const appError = enhanceError(error, {
    severity: 'high',
    category: 'ui',
    componentStack: errorInfo.componentStack || undefined,
    ...context,
  });

  globalErrorMonitor.reportError(appError);

  return appError;
}

// ================================
// ASYNC ERROR HANDLING
// ================================

export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: Partial<AppError>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const appError = enhanceError(error, {
      severity: 'medium',
      category: 'api',
      ...context,
    });

    globalErrorMonitor.reportError(appError);
    throw appError;
  }
}

export function createAsyncErrorHandler(context?: Partial<AppError>) {
  return <T>(operation: () => Promise<T>) =>
    withErrorHandling(operation, context);
}

// ================================
// ERROR BOUNDARIES FACTORY
// ================================

export interface ErrorBoundaryConfig {
  fallbackComponent?: React.ComponentType<{
    error: AppError;
    retry: () => void;
  }>;
  onError?: (error: AppError, errorInfo: ErrorInfo) => void;
  enableRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

export function createErrorBoundaryConfig(
  config: ErrorBoundaryConfig = {}
): ErrorBoundaryConfig {
  return {
    enableRetry: true,
    maxRetries: 3,
    retryDelay: 1000,
    ...config,
  };
}

// ================================
// ================================
// EXPORTS
// ================================

export default {
  createAppError,
  isAppError,
  enhanceError,
  getRecoveryActions,
  ErrorMonitor,
  globalErrorMonitor,
  withErrorHandling,
  createAsyncErrorHandler,
  createErrorBoundaryConfig,
};
