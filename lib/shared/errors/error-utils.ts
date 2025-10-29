/**
 * ================================================
 * ERROR UTILITIES
 * ================================================
 * Utility functions for error handling, logging, and normalization
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 2 - Story 2.3: Error Handling Enhancement
 */

import { toast } from 'sonner';
import {
  AppError,
  ErrorCategory,
  ErrorSeverity,
  NetworkError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ServerError,
} from './error-types';

/**
 * Axios error response structure
 */
interface AxiosErrorResponse {
  data?: {
    message?: string;
    error?: string;
    errors?: Record<string, string[]>;
    statusCode?: number;
  };
  status?: number;
  statusText?: string;
}

interface AxiosError {
  response?: AxiosErrorResponse;
  message: string;
  code?: string;
  isAxiosError?: boolean;
}

/**
 * User-friendly error messages by category
 */
const ERROR_MESSAGES: Record<ErrorCategory, string> = {
  [ErrorCategory.NETWORK]:
    'İnternet bağlantınızı kontrol edin ve tekrar deneyin.',
  [ErrorCategory.VALIDATION]: 'Lütfen formu doğru şekilde doldurun.',
  [ErrorCategory.AUTHENTICATION]:
    'Oturum süreniz doldu. Lütfen tekrar giriş yapın.',
  [ErrorCategory.AUTHORIZATION]: 'Bu işlemi yapmaya yetkiniz yok.',
  [ErrorCategory.NOT_FOUND]: 'Aradığınız içerik bulunamadı.',
  [ErrorCategory.SERVER]:
    'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.',
  [ErrorCategory.CLIENT]: 'Bir hata oluştu. Lütfen tekrar deneyin.',
  [ErrorCategory.UNKNOWN]: 'Beklenmeyen bir hata oluştu.',
};

/**
 * Retryable error codes (reserved for future use)
 */
const _RETRYABLE_ERROR_CODES = [
  'ECONNREFUSED',
  'ETIMEDOUT',
  'ENOTFOUND',
  'ENETUNREACH',
  'ERR_NETWORK',
];

/**
 * Retryable HTTP status codes
 */
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

/**
 * Normalize any error to AppError format
 */
export function normalizeError(error: unknown): AppError {
  // Already normalized
  if (isAppError(error)) {
    return error;
  }

  // Axios error
  if (isAxiosError(error)) {
    return normalizeAxiosError(error as AxiosError);
  }

  // Standard Error
  if (error instanceof Error) {
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message,
      details: error,
      category: ErrorCategory.UNKNOWN,
      retryable: false,
      originalError: error,
      timestamp: new Date(),
    };
  }

  // String error
  if (typeof error === 'string') {
    return {
      code: 'STRING_ERROR',
      message: error,
      category: ErrorCategory.UNKNOWN,
      retryable: false,
      originalError: error,
      timestamp: new Date(),
    };
  }

  // Unknown error
  return {
    code: 'UNKNOWN_ERROR',
    message: 'Beklenmeyen bir hata oluştu.',
    details: error,
    category: ErrorCategory.UNKNOWN,
    retryable: false,
    originalError: error,
    timestamp: new Date(),
  };
}

/**
 * Normalize Axios error
 */
function normalizeAxiosError(error: AxiosError): AppError {
  const response = error.response;
  const status = response?.status;

  // Network error
  if (!response || error.code === 'ERR_NETWORK') {
    return {
      code: 'NETWORK_ERROR',
      message: ERROR_MESSAGES[ErrorCategory.NETWORK],
      statusCode: 0,
      category: ErrorCategory.NETWORK,
      retryable: true,
      originalError: error,
      timestamp: new Date(),
    } as NetworkError;
  }

  // Validation error (400)
  if (status === 400) {
    return {
      code: 'VALIDATION_ERROR',
      message:
        response.data?.message ||
        response.data?.error ||
        ERROR_MESSAGES[ErrorCategory.VALIDATION],
      statusCode: status,
      category: ErrorCategory.VALIDATION,
      retryable: false,
      fields: response.data?.errors,
      originalError: error,
      timestamp: new Date(),
    } as ValidationError;
  }

  // Authentication error (401)
  if (status === 401) {
    return {
      code: 'AUTHENTICATION_ERROR',
      message: ERROR_MESSAGES[ErrorCategory.AUTHENTICATION],
      statusCode: status,
      category: ErrorCategory.AUTHENTICATION,
      retryable: false,
      originalError: error,
      timestamp: new Date(),
    } as AuthenticationError;
  }

  // Authorization error (403)
  if (status === 403) {
    return {
      code: 'AUTHORIZATION_ERROR',
      message: ERROR_MESSAGES[ErrorCategory.AUTHORIZATION],
      statusCode: status,
      category: ErrorCategory.AUTHORIZATION,
      retryable: false,
      originalError: error,
      timestamp: new Date(),
    } as AuthorizationError;
  }

  // Not found error (404)
  if (status === 404) {
    return {
      code: 'NOT_FOUND_ERROR',
      message:
        response.data?.message || ERROR_MESSAGES[ErrorCategory.NOT_FOUND],
      statusCode: status,
      category: ErrorCategory.NOT_FOUND,
      retryable: false,
      originalError: error,
      timestamp: new Date(),
    } as NotFoundError;
  }

  // Server error (5xx)
  if (status && status >= 500) {
    return {
      code: 'SERVER_ERROR',
      message: response.data?.message || ERROR_MESSAGES[ErrorCategory.SERVER],
      statusCode: status,
      category: ErrorCategory.SERVER,
      retryable: RETRYABLE_STATUS_CODES.includes(status),
      originalError: error,
      timestamp: new Date(),
    } as ServerError;
  }

  // Generic error
  return {
    code: 'HTTP_ERROR',
    message: response?.data?.message || error.message || 'Bir hata oluştu.',
    statusCode: status,
    category: ErrorCategory.CLIENT,
    retryable: false,
    originalError: error,
    timestamp: new Date(),
  };
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  const normalized = normalizeError(error);
  return normalized.message;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  // Check for ApiError with retriable property
  if (error && typeof error === 'object' && 'retriable' in error) {
    return !!(error as { retriable?: boolean }).retriable;
  }

  // Check HTTP status codes
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { status?: number } }).response;
    const status = response?.status;
    if (status !== undefined) {
      return RETRYABLE_STATUS_CODES.includes(status) || status === 0;
    }
  }

  // Check normalized error
  const normalized = normalizeError(error);
  return normalized.retryable ?? false;
}

/**
 * Check if error is AppError
 */
function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}

/**
 * Check if error is Axios error
 */
function isAxiosError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('isAxiosError' in error || ('response' in error && 'config' in error))
  );
}

/**
 * Get error severity
 */
export function getErrorSeverity(error: unknown): ErrorSeverity {
  const normalized = normalizeError(error);

  // Authentication/Authorization are high severity
  if (
    normalized.category === ErrorCategory.AUTHENTICATION ||
    normalized.category === ErrorCategory.AUTHORIZATION
  ) {
    return ErrorSeverity.HIGH;
  }

  // Server errors are medium to high
  if (normalized.category === ErrorCategory.SERVER) {
    if (normalized.statusCode && normalized.statusCode >= 500) {
      return ErrorSeverity.HIGH;
    }
    return ErrorSeverity.MEDIUM;
  }

  // Network errors are medium
  if (normalized.category === ErrorCategory.NETWORK) {
    return ErrorSeverity.MEDIUM;
  }

  // Validation errors are low
  if (normalized.category === ErrorCategory.VALIDATION) {
    return ErrorSeverity.LOW;
  }

  return ErrorSeverity.MEDIUM;
}

/**
 * Log error to console and external service
 */
export function logError(
  error: unknown,
  context?: Record<string, unknown>
): void {
  const normalized = normalizeError(error);
  const severity = getErrorSeverity(error);

  // Console logging
  console.error('[Error]', {
    code: normalized.code,
    message: normalized.message,
    severity,
    statusCode: normalized.statusCode,
    category: normalized.category,
    timestamp: normalized.timestamp,
    context,
    details: normalized.details,
  });

  // TODO: Send to external logging service (e.g., Sentry, LogRocket)
  // if (severity === ErrorSeverity.HIGH || severity === ErrorSeverity.CRITICAL) {
  //   sentryLogError(normalized, context);
  // }
}

/**
 * Show error toast notification
 */
export function showErrorToast(error: unknown, customMessage?: string): void {
  const message = customMessage || getErrorMessage(error);
  toast.error(message, {
    duration: 5000,
    position: 'top-right',
  });
}

/**
 * Handle async operation with error handling
 */
export async function handleAsyncOperation<T>(
  operation: () => Promise<T>,
  options?: {
    errorMessage?: string;
    onError?: (error: AppError) => void;
    showToast?: boolean;
    logError?: boolean;
    context?: Record<string, unknown>;
  }
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    const normalized = normalizeError(error);

    // Log error
    if (options?.logError !== false) {
      logError(normalized, options?.context);
    }

    // Show toast
    if (options?.showToast !== false) {
      showErrorToast(normalized, options?.errorMessage);
    }

    // Custom error handler
    if (options?.onError) {
      options.onError(normalized);
    }

    return null;
  }
}

/**
 * Retry operation with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  options?: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
    onRetry?: (attempt: number, error: AppError) => void;
  }
): Promise<T> {
  const maxRetries = options?.maxRetries ?? 3;
  const initialDelay = options?.initialDelay ?? 1000;
  const maxDelay = options?.maxDelay ?? 10000;
  const backoffMultiplier = options?.backoffMultiplier ?? 2;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const normalized = normalizeError(error);

      // Don't retry if not retryable
      if (!normalized.retryable || attempt === maxRetries) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        initialDelay * Math.pow(backoffMultiplier, attempt),
        maxDelay
      );

      // Notify retry
      if (options?.onRetry) {
        options.onRetry(attempt + 1, normalized);
      }

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
