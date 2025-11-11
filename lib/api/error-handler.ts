/**
 * ================================================
 * CENTRALIZED API ERROR HANDLER
 * ================================================
 * Production-ready error handling with Sentry integration
 * Combines error transformation, logging, retry logic, and user-friendly messages
 *
 * Features:
 * - Type-safe error classes
 * - Automatic error transformation
 * - Sentry integration for production errors
 * - Retry logic with exponential backoff
 * - User-friendly Turkish error messages
 * - Validation error formatting
 * - Authentication error detection
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint 1
 */

import { apiLogger } from '@/lib/infrastructure/monitoring/logger';
import { captureSentryError } from '@/lib/infrastructure/monitoring/sentry';

// ============================================================================
// ERROR CLASSES
// ============================================================================

/**
 * Base API Error Class
 * All API errors extend from this
 */
export class ApiError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: Record<string, unknown>;
  public readonly timestamp: string;
  public readonly retriable: boolean;

  constructor(
    message: string,
    status: number = 500,
    code: string = 'UNKNOWN_ERROR',
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.retriable = this.determineRetriable(status);

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  private determineRetriable(status: number): boolean {
    // Network errors (0), timeouts (408), server errors (500-599), rate limits (429)
    return status === 0 || status === 408 || status === 429 || status >= 500;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      status: this.status,
      details: this.details,
      timestamp: this.timestamp,
      retriable: this.retriable,
    };
  }

  getUserMessage(): string {
    return ERROR_MESSAGES[this.code] || this.message || 'Bir hata oluştu';
  }
}

/**
 * Validation Error (400)
 * Used for invalid request data with field-specific errors
 */
export class ValidationError extends ApiError {
  constructor(
    message: string = 'Gönderilen veriler geçersiz.',
    public fields?: Record<string, string[]>
  ) {
    super(message, 400, 'VALIDATION_ERROR', { fields });
    this.name = 'ValidationError';
  }

  getFieldErrors(): Record<string, string[]> {
    return this.fields || {};
  }

  hasFieldError(fieldName: string): boolean {
    return !!this.fields && fieldName in this.fields;
  }

  getFieldError(fieldName: string): string[] {
    return this.fields?.[fieldName] || [];
  }

  getAllErrors(): string[] {
    if (!this.fields) return [this.message];

    const errors: string[] = [];
    Object.entries(this.fields).forEach(([field, messages]) => {
      messages.forEach((msg) => errors.push(`${field}: ${msg}`));
    });
    return errors;
  }
}

/**
 * Authentication Error (401)
 * User needs to log in or token is invalid
 */
export class AuthenticationError extends ApiError {
  constructor(
    message: string = 'Oturum süreniz doldu. Lütfen tekrar giriş yapın.'
  ) {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization Error (403)
 * User doesn't have permission
 */
export class AuthorizationError extends ApiError {
  constructor(message: string = 'Bu işlem için yetkiniz yok.') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends ApiError {
  constructor(resource: string = 'İçerik', message?: string) {
    const defaultMessage = `${resource} bulunamadı.`;
    super(message || defaultMessage, 404, 'NOT_FOUND', { resource });
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict Error (409)
 * Resource already exists or state conflict
 */
export class ConflictError extends ApiError {
  constructor(message: string = 'Bu işlem şu anda gerçekleştirilemiyor.') {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

/**
 * Rate Limit Error (429)
 */
export class RateLimitError extends ApiError {
  constructor(
    message: string = 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.',
    public retryAfter?: number
  ) {
    super(message, 429, 'RATE_LIMIT_ERROR', { retryAfter });
    this.name = 'RateLimitError';
  }
}

/**
 * Server Error (500+)
 */
export class ServerError extends ApiError {
  constructor(
    message: string = 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
    statusCode: number = 500
  ) {
    super(message, statusCode, 'SERVER_ERROR');
    this.name = 'ServerError';
  }
}

/**
 * Network Error (no response)
 */
export class NetworkError extends ApiError {
  constructor(
    message: string = 'İnternet bağlantısı kesildi. Lütfen bağlantınızı kontrol edin.'
  ) {
    super(message, 0, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

/**
 * Timeout Error (408)
 */
export class TimeoutError extends ApiError {
  constructor(
    message: string = 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.'
  ) {
    super(message, 408, 'TIMEOUT_ERROR');
    this.name = 'TimeoutError';
  }
}

// ============================================================================
// ERROR CODES & MESSAGES
// ============================================================================

export const ERROR_CODES = {
  // Network
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  CONNECTION_REFUSED: 'CONNECTION_REFUSED',

  // Authentication
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  SESSION_EXPIRED: 'SESSION_EXPIRED',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // Resources
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  ALREADY_EXISTS: 'ALREADY_EXISTS',

  // Business Logic
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  ORDER_NOT_CANCELLABLE: 'ORDER_NOT_CANCELLABLE',
  INVALID_ORDER_STATUS: 'INVALID_ORDER_STATUS',
  PAYOUT_ALREADY_PROCESSED: 'PAYOUT_ALREADY_PROCESSED',

  // Server
  SERVER_ERROR: 'SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',

  // Rate Limiting
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',

  // Unknown
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

const ERROR_MESSAGES: Record<string, string> = {
  // Network
  [ERROR_CODES.NETWORK_ERROR]: 'İnternet bağlantınızı kontrol edin',
  [ERROR_CODES.TIMEOUT_ERROR]: 'İstek zaman aşımına uğradı',
  [ERROR_CODES.CONNECTION_REFUSED]: 'Sunucuya bağlanılamadı',

  // Authentication
  [ERROR_CODES.AUTHENTICATION_ERROR]: 'Giriş yapmanız gerekiyor',
  [ERROR_CODES.AUTHORIZATION_ERROR]: 'Bu işlem için yetkiniz yok',
  [ERROR_CODES.TOKEN_EXPIRED]: 'Oturumunuz sonlandı, lütfen tekrar giriş yapın',
  [ERROR_CODES.INVALID_TOKEN]: 'Geçersiz oturum',
  [ERROR_CODES.SESSION_EXPIRED]: 'Oturumunuz sonlandı',

  // Validation
  [ERROR_CODES.VALIDATION_ERROR]: 'Girdiğiniz bilgileri kontrol edin',
  [ERROR_CODES.INVALID_INPUT]: 'Geçersiz bilgi',
  [ERROR_CODES.MISSING_REQUIRED_FIELD]: 'Gerekli alanları doldurun',

  // Resources
  [ERROR_CODES.NOT_FOUND]: 'İstenen kaynak bulunamadı',
  [ERROR_CODES.CONFLICT]: 'İşlem çakışması',
  [ERROR_CODES.ALREADY_EXISTS]: 'Bu kayıt zaten mevcut',

  // Business Logic
  [ERROR_CODES.INSUFFICIENT_BALANCE]: 'Yetersiz bakiye',
  [ERROR_CODES.ORDER_NOT_CANCELLABLE]: 'Bu sipariş iptal edilemez',
  [ERROR_CODES.INVALID_ORDER_STATUS]: 'Geçersiz sipariş durumu',
  [ERROR_CODES.PAYOUT_ALREADY_PROCESSED]: 'Ödeme zaten işlendi',

  // Server
  [ERROR_CODES.SERVER_ERROR]: 'Sunucu hatası oluştu',
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 'Servis şu anda kullanılamıyor',
  [ERROR_CODES.DATABASE_ERROR]: 'Veritabanı hatası',

  // Rate Limiting
  [ERROR_CODES.RATE_LIMIT_ERROR]: 'Çok fazla istek gönderdiniz',
  [ERROR_CODES.TOO_MANY_REQUESTS]: 'Lütfen daha sonra tekrar deneyin',

  // Unknown
  [ERROR_CODES.UNKNOWN_ERROR]: 'Bilinmeyen bir hata oluştu',
};

// ============================================================================
// ERROR TRANSFORMATION
// ============================================================================

/**
 * Transform any error to ApiError
 */
export function transformError(error: unknown): ApiError {
  // Already an ApiError
  if (error instanceof ApiError) {
    return error;
  }

  // Network/Fetch errors
  if (error instanceof TypeError) {
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return new NetworkError();
    }
    if (error.message.includes('timeout')) {
      return new TimeoutError();
    }
  }

  // HTTP Response error
  if (error && typeof error === 'object' && 'status' in error) {
    const httpError = error as {
      status: number;
      message?: string;
      code?: string;
      fields?: Record<string, string[]>;
      retryAfter?: number;
    };

    const status = httpError.status;
    const message = httpError.message || 'Bir hata oluştu';
    const code = httpError.code;

    switch (status) {
      case 400:
        return new ValidationError(message, httpError.fields);
      case 401:
        return new AuthenticationError(message);
      case 403:
        return new AuthorizationError(message);
      case 404:
        return new NotFoundError(undefined, message);
      case 408:
        return new TimeoutError(message);
      case 409:
        return new ConflictError(message);
      case 429:
        return new RateLimitError(message, httpError.retryAfter);
      case 500:
      case 502:
      case 503:
      case 504:
        return new ServerError(message, status);
      default:
        return new ApiError(message, status, code);
    }
  }

  // Backend error format: { error: { code, message, details } }
  if (
    error &&
    typeof error === 'object' &&
    'error' in error &&
    typeof (error as { error: unknown }).error === 'object'
  ) {
    const backendError = (
      error as { error: { code: string; message: string; details?: unknown } }
    ).error;
    const status = getStatusFromCode(backendError.code);
    return new ApiError(
      backendError.message,
      status,
      backendError.code,
      backendError.details as Record<string, unknown>
    );
  }

  // Standard Error
  if (error instanceof Error) {
    return new ApiError(error.message, 500, ERROR_CODES.UNKNOWN_ERROR);
  }

  // Unknown
  const message =
    typeof error === 'string' ? error : 'Bilinmeyen bir hata oluştu';
  return new ApiError(message, 500, ERROR_CODES.UNKNOWN_ERROR);
}

function getStatusFromCode(code: string): number {
  if (code.includes('UNAUTHORIZED') || code.includes('TOKEN')) return 401;
  if (code.includes('FORBIDDEN') || code.includes('AUTHORIZATION')) return 403;
  if (code.includes('NOT_FOUND')) return 404;
  if (code.includes('VALIDATION') || code.includes('INVALID')) return 400;
  if (code.includes('CONFLICT') || code.includes('EXISTS')) return 409;
  if (code.includes('RATE_LIMIT')) return 429;
  if (code.includes('UNAVAILABLE')) return 503;
  if (code.includes('TIMEOUT')) return 408;
  return 500;
}

// ============================================================================
// ERROR HANDLER CLASS
// ============================================================================

export class ErrorHandler {
  /**
   * Handle any error with logging and Sentry integration
   */
  handle(error: unknown, context?: Record<string, unknown>): ApiError {
    const apiError = transformError(error);
    this.log(apiError, context);
    return apiError;
  }

  /**
   * Log error with appropriate level
   */
  private log(error: ApiError, context?: Record<string, unknown>): void {
    const logContext = {
      code: error.code,
      status: error.status,
      details: error.details,
      ...context,
    };

    // Client errors (4xx) - warning level
    if (error.status >= 400 && error.status < 500) {
      apiLogger.warn(error.message, logContext);
    }
    // Server errors (5xx) - error level + Sentry
    else if (error.status >= 500) {
      apiLogger.error(error.message, error, logContext);

      // Send to Sentry only in production
      if (process.env.NODE_ENV === 'production') {
        captureSentryError(error, logContext);
      }
    }
    // Network/unknown errors
    else {
      apiLogger.error(error.message, error, logContext);
    }
  }

  /**
   * Wrap async function with error handling
   */
  async withErrorHandling<T>(
    fn: () => Promise<T>,
    context?: Record<string, unknown>
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      throw this.handle(error, context);
    }
  }

  /**
   * Retry function with exponential backoff
   */
  async retry<T>(
    fn: () => Promise<T>,
    options: {
      maxAttempts?: number;
      initialDelay?: number;
      maxDelay?: number;
      backoffFactor?: number;
      retryableErrors?: string[];
      context?: Record<string, unknown>;
    } = {}
  ): Promise<T> {
    const {
      maxAttempts = 3,
      initialDelay = 1000,
      maxDelay = 10000,
      backoffFactor = 2,
      retryableErrors,
      context,
    } = options;

    let lastError: ApiError | undefined;
    let delay = initialDelay;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = this.handle(error, { ...context, attempt });

        // Check if error is retryable
        const shouldRetry =
          lastError.retriable &&
          attempt < maxAttempts &&
          (!retryableErrors || retryableErrors.includes(lastError.code));

        if (!shouldRetry) {
          throw lastError;
        }

        // Wait before retry
        await this.sleep(delay);
        delay = Math.min(delay * backoffFactor, maxDelay);

        apiLogger.info(
          `Retrying request (attempt ${attempt + 1}/${maxAttempts})`,
          {
            code: lastError.code,
            delay,
          }
        );
      }
    }

    throw lastError;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const errorHandler = new ErrorHandler();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get user-friendly error message
 */
export function getUserErrorMessage(error: unknown): string {
  const apiError = transformError(error);
  return apiError.getUserMessage();
}

/**
 * Check if error requires re-authentication
 */
export function requiresReauth(error: unknown): boolean {
  return error instanceof AuthenticationError;
}

/**
 * Check if error is retriable
 */
export function isRetriable(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.retriable;
  }
  return false;
}

/**
 * Check if error is client error (4xx)
 */
export function isClientError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status >= 400 && error.status < 500;
  }
  return false;
}

/**
 * Check if error is server error (5xx)
 */
export function isServerError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status >= 500;
  }
  return false;
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(error: unknown): string[] {
  if (error instanceof ValidationError) {
    return error.getAllErrors();
  }
  return [getUserErrorMessage(error)];
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

export function isAuthenticationError(
  error: unknown
): error is AuthenticationError {
  return error instanceof AuthenticationError;
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

export function isTimeoutError(error: unknown): error is TimeoutError {
  return error instanceof TimeoutError;
}

// ============================================================================
// API ERROR HANDLER FOR ROUTES
// ============================================================================

/**
 * Handle API errors in Next.js API routes
 * Logs error and returns appropriate Response
 *
 * @param error - Error object (any type)
 * @param request - Request object for context
 * @param context - Additional context for logging
 * @returns Response with error details
 */
export function handleApiError(
  error: unknown,
  request?: { url?: string; method?: string },
  context?: Record<string, unknown>
): Response {
  const transformedError = transformError(error);

  // Log error with context
  const logContext = {
    ...context,
    url: request?.url,
    method: request?.method,
    errorCode: transformedError.code,
    status: transformedError.status,
  };

  if (transformedError.status >= 500) {
    apiLogger.error(
      transformedError.message,
      error,
      logContext
    );

    // Capture in Sentry for server errors
    if (error instanceof Error) {
      captureSentryError(error, logContext);
    }
  } else {
    apiLogger.warn(transformedError.message, logContext);
  }

  // Return standardized error response
  return new Response(
    JSON.stringify({
      success: false,
      error: transformedError.message,
      code: transformedError.code,
      details: transformedError.details,
      timestamp: transformedError.timestamp,
    }),
    {
      status: transformedError.status,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default errorHandler;

export type {
  ApiError as ApiErrorType,
  ValidationError as ValidationErrorType,
};
