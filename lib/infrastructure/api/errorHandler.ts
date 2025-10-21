/**
 * ===================================================================================
 * API ERROR HANDLER - Production-Ready Error Management
 * ===================================================================================
 * Centralized error handling for API responses matching backend error format
 *
 * Backend Error Format: ApiResponse<T> with error field
 * {
 *   success: false,
 *   data: null,
 *   error: {
 *     code: "ERROR_CODE",
 *     message: "Human-readable message",
 *     details: {...}
 *   },
 *   timestamp: "2025-10-21T12:00:00Z"
 * }
 *
 * @version 2.0.0
 * @author MarifetBul Development Team
 */

import { apiLogger } from '@/lib/infrastructure/monitoring/logger';
import { captureSentryError } from '@/lib/infrastructure/monitoring/sentry';
import type { ErrorDetail } from '@/types/backend-aligned';

// ================================================
// ERROR TYPES
// ================================================

export class ApiError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: Record<string, unknown>;
  public readonly timestamp: string;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    status: number = 500,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Convert to JSON-serializable format
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      status: this.status,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    return ERROR_MESSAGES[this.code] || this.message || 'Bir hata oluştu';
  }
}

// ================================================
// ERROR CODES
// ================================================

export const ERROR_CODES = {
  // Network Errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  CONNECTION_REFUSED: 'CONNECTION_REFUSED',

  // Authentication Errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  SESSION_EXPIRED: 'SESSION_EXPIRED',

  // Validation Errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // Resource Errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',

  // Business Logic Errors
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  ORDER_NOT_CANCELLABLE: 'ORDER_NOT_CANCELLABLE',
  PROPOSAL_ALREADY_ACCEPTED: 'PROPOSAL_ALREADY_ACCEPTED',
  INVALID_ORDER_STATUS: 'INVALID_ORDER_STATUS',

  // Server Errors
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',

  // Unknown
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// ================================================
// USER-FRIENDLY ERROR MESSAGES (Turkish)
// ================================================

const ERROR_MESSAGES: Record<string, string> = {
  // Network Errors
  [ERROR_CODES.NETWORK_ERROR]: 'İnternet bağlantınızı kontrol edin',
  [ERROR_CODES.TIMEOUT_ERROR]: 'İstek zaman aşımına uğradı',
  [ERROR_CODES.CONNECTION_REFUSED]: 'Sunucuya bağlanılamadı',

  // Authentication Errors
  [ERROR_CODES.UNAUTHORIZED]: 'Giriş yapmanız gerekiyor',
  [ERROR_CODES.FORBIDDEN]: 'Bu işlemi yapmaya yetkiniz yok',
  [ERROR_CODES.TOKEN_EXPIRED]: 'Oturumunuz sonlandı, lütfen tekrar giriş yapın',
  [ERROR_CODES.INVALID_TOKEN]: 'Geçersiz oturum, lütfen tekrar giriş yapın',
  [ERROR_CODES.SESSION_EXPIRED]: 'Oturumunuz sonlandı',

  // Validation Errors
  [ERROR_CODES.VALIDATION_ERROR]: 'Girdiğiniz bilgileri kontrol edin',
  [ERROR_CODES.INVALID_INPUT]: 'Geçersiz bilgi',
  [ERROR_CODES.MISSING_REQUIRED_FIELD]: 'Gerekli alanları doldurun',

  // Resource Errors
  [ERROR_CODES.NOT_FOUND]: 'İstenen kaynak bulunamadı',
  [ERROR_CODES.ALREADY_EXISTS]: 'Bu kayıt zaten mevcut',
  [ERROR_CODES.RESOURCE_CONFLICT]: 'Kayıt çakışması',

  // Business Logic Errors
  [ERROR_CODES.INSUFFICIENT_BALANCE]: 'Yetersiz bakiye',
  [ERROR_CODES.ORDER_NOT_CANCELLABLE]: 'Bu sipariş iptal edilemez',
  [ERROR_CODES.PROPOSAL_ALREADY_ACCEPTED]: 'Teklif zaten kabul edilmiş',
  [ERROR_CODES.INVALID_ORDER_STATUS]: 'Geçersiz sipariş durumu',

  // Server Errors
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: 'Sunucu hatası oluştu',
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 'Servis şu anda kullanılamıyor',
  [ERROR_CODES.DATABASE_ERROR]: 'Veritabanı hatası',

  // Rate Limiting
  [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Çok fazla istek gönderdiniz',
  [ERROR_CODES.TOO_MANY_REQUESTS]: 'Lütfen daha sonra tekrar deneyin',
};

// ================================================
// ERROR HANDLER CLASS
// ================================================

class ApiErrorHandler {
  /**
   * Handle API response error
   */
  handleError(error: unknown, context?: Record<string, unknown>): ApiError {
    // If already an ApiError, return it
    if (error instanceof ApiError) {
      this.logError(error, context);
      return error;
    }

    // Handle HTTP errors
    if (error instanceof Error && 'status' in error) {
      const httpError = error as Error & { status: number };
      const apiError = this.createErrorFromHttpStatus(
        httpError.status,
        httpError.message
      );
      this.logError(apiError, context);
      return apiError;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const apiError = new ApiError(
        ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR],
        ERROR_CODES.NETWORK_ERROR,
        0
      );
      this.logError(apiError, context);
      return apiError;
    }

    // Handle backend error response
    if (this.isBackendError(error)) {
      const apiError = this.createErrorFromBackend(error);
      this.logError(apiError, context);
      return apiError;
    }

    // Unknown error
    const apiError = new ApiError(
      error instanceof Error ? error.message : 'Bilinmeyen hata',
      ERROR_CODES.UNKNOWN_ERROR,
      500
    );
    this.logError(apiError, context);
    return apiError;
  }

  /**
   * Create ApiError from HTTP status code
   */
  private createErrorFromHttpStatus(
    status: number,
    message?: string
  ): ApiError {
    let code: string;
    let defaultMessage: string;

    switch (status) {
      case 400:
        code = ERROR_CODES.VALIDATION_ERROR;
        defaultMessage = ERROR_MESSAGES[code];
        break;
      case 401:
        code = ERROR_CODES.UNAUTHORIZED;
        defaultMessage = ERROR_MESSAGES[code];
        break;
      case 403:
        code = ERROR_CODES.FORBIDDEN;
        defaultMessage = ERROR_MESSAGES[code];
        break;
      case 404:
        code = ERROR_CODES.NOT_FOUND;
        defaultMessage = ERROR_MESSAGES[code];
        break;
      case 409:
        code = ERROR_CODES.RESOURCE_CONFLICT;
        defaultMessage = ERROR_MESSAGES[code];
        break;
      case 429:
        code = ERROR_CODES.RATE_LIMIT_EXCEEDED;
        defaultMessage = ERROR_MESSAGES[code];
        break;
      case 500:
        code = ERROR_CODES.INTERNAL_SERVER_ERROR;
        defaultMessage = ERROR_MESSAGES[code];
        break;
      case 503:
        code = ERROR_CODES.SERVICE_UNAVAILABLE;
        defaultMessage = ERROR_MESSAGES[code];
        break;
      default:
        code = ERROR_CODES.UNKNOWN_ERROR;
        defaultMessage = ERROR_MESSAGES[code];
    }

    return new ApiError(message || defaultMessage, code, status);
  }

  /**
   * Check if error is from backend
   */
  private isBackendError(error: unknown): error is {
    error: ErrorDetail;
  } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'error' in error &&
      typeof (error as { error: unknown }).error === 'object'
    );
  }

  /**
   * Create ApiError from backend error response
   */
  private createErrorFromBackend(error: { error: ErrorDetail }): ApiError {
    const { code, message, details } = error.error;
    const status = this.getStatusFromErrorCode(code);

    return new ApiError(message, code, status, details);
  }

  /**
   * Get HTTP status from error code
   */
  private getStatusFromErrorCode(code: string): number {
    if (code.includes('UNAUTHORIZED') || code.includes('TOKEN')) return 401;
    if (code.includes('FORBIDDEN')) return 403;
    if (code.includes('NOT_FOUND')) return 404;
    if (code.includes('VALIDATION') || code.includes('INVALID')) return 400;
    if (code.includes('CONFLICT') || code.includes('EXISTS')) return 409;
    if (code.includes('RATE_LIMIT')) return 429;
    if (code.includes('UNAVAILABLE')) return 503;
    return 500;
  }

  /**
   * Log error
   */
  private logError(error: ApiError, context?: Record<string, unknown>): void {
    const logContext = {
      code: error.code,
      status: error.status,
      details: error.details,
      ...context,
    };

    apiLogger.error(error.message, error, logContext);

    // Send to Sentry for server errors
    if (error.status >= 500) {
      captureSentryError(error, logContext);
    }
  }

  /**
   * Handle async errors with try-catch
   */
  async withErrorHandling<T>(
    fn: () => Promise<T>,
    context?: Record<string, unknown>
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      throw this.handleError(error, context);
    }
  }

  /**
   * Check if error requires re-authentication
   */
  isAuthError(error: ApiError): boolean {
    const authErrorCodes = [
      ERROR_CODES.UNAUTHORIZED,
      ERROR_CODES.TOKEN_EXPIRED,
      ERROR_CODES.INVALID_TOKEN,
      ERROR_CODES.SESSION_EXPIRED,
    ];
    return authErrorCodes.includes(
      error.code as (typeof authErrorCodes)[number]
    );
  }

  /**
   * Check if error is retryable
   */
  isRetryable(error: ApiError): boolean {
    const retryableCodes = [
      ERROR_CODES.NETWORK_ERROR,
      ERROR_CODES.TIMEOUT_ERROR,
      ERROR_CODES.SERVICE_UNAVAILABLE,
      ERROR_CODES.INTERNAL_SERVER_ERROR,
    ];
    return retryableCodes.includes(
      error.code as (typeof retryableCodes)[number]
    );
  }
}

// ================================================
// SINGLETON INSTANCE
// ================================================

export const apiErrorHandler = new ApiErrorHandler();

// ================================================
// CONVENIENCE FUNCTIONS
// ================================================

/**
 * Handle API error and return user-friendly message
 */
export function handleApiError(
  error: unknown,
  context?: Record<string, unknown>
): string {
  const apiError = apiErrorHandler.handleError(error, context);
  return apiError.getUserMessage();
}

/**
 * Check if error requires re-authentication
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return apiErrorHandler.isAuthError(error);
  }
  return false;
}

/**
 * Check if error is retryable
 */
export function isRetryable(error: unknown): boolean {
  if (error instanceof ApiError) {
    return apiErrorHandler.isRetryable(error);
  }
  return false;
}

// ================================================
// EXPORTS
// ================================================

export default apiErrorHandler;
export { ApiErrorHandler, ERROR_MESSAGES };
export type { ErrorDetail };
