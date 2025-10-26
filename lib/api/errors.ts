/**
 * ================================================
 * API ERROR CLASSES
 * ================================================
 * Custom error classes for API operations
 * Provides type-safe, user-friendly error handling
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 3
 */

/**
 * Base API Error
 * All API errors extend from this class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Check if this error is retriable
   */
  isRetriable(): boolean {
    return (
      this.statusCode >= 500 || this.statusCode === 408 || this.statusCode === 0
    );
  }

  /**
   * Convert to plain object for logging
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      details: this.details,
    };
  }
}

/**
 * Validation Error (400)
 * Used for invalid request data
 */
export class ValidationError extends ApiError {
  constructor(
    message: string = 'Gönderilen veriler geçersiz.',
    public fields?: Record<string, string[]>
  ) {
    super(message, 400, 'VALIDATION_ERROR', fields);
    this.name = 'ValidationError';
  }

  /**
   * Get field-specific error messages
   */
  getFieldErrors(): Record<string, string[]> {
    return this.fields || {};
  }

  /**
   * Check if a specific field has errors
   */
  hasFieldError(fieldName: string): boolean {
    return !!this.fields && fieldName in this.fields;
  }

  /**
   * Get errors for a specific field
   */
  getFieldError(fieldName: string): string[] {
    return this.fields?.[fieldName] || [];
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
 * User doesn't have permission for this action
 */
export class AuthorizationError extends ApiError {
  constructor(message: string = 'Bu işlem için yetkiniz yok.') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

/**
 * Not Found Error (404)
 * Requested resource doesn't exist
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
 * Too many requests
 */
export class RateLimitError extends ApiError {
  constructor(
    message: string = 'Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.',
    public retryAfter?: number
  ) {
    super(message, 429, 'RATE_LIMIT', { retryAfter });
    this.name = 'RateLimitError';
  }
}

/**
 * Server Error (500+)
 * Internal server error or service unavailable
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
 * Connection failed or timeout
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
 * Timeout Error (408 or client timeout)
 * Request took too long
 */
export class TimeoutError extends ApiError {
  constructor(
    message: string = 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.'
  ) {
    super(message, 408, 'TIMEOUT_ERROR');
    this.name = 'TimeoutError';
  }
}

// ================================================
// ERROR TRANSFORMATION UTILITIES
// ================================================

/**
 * Transform any error to user-friendly ApiError
 * This is the main entry point for error handling
 */
export function transformApiError(error: unknown): ApiError {
  // Already an ApiError
  if (error instanceof ApiError) {
    return error;
  }

  // Fetch/Network errors (no response)
  if (error instanceof TypeError) {
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return new NetworkError();
    }
  }

  // HTTP error with status code
  if (error && typeof error === 'object' && 'status' in error) {
    const httpError = error as {
      status: number;
      message?: string;
      fields?: Record<string, string[]>;
      retryAfter?: number;
    };

    const status = httpError.status;
    const message = httpError.message || 'Bir hata oluştu';

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
        if (status >= 500) {
          return new ServerError(message, status);
        }
        return new ApiError(message, status);
    }
  }

  // Standard Error object
  if (error instanceof Error) {
    return new ApiError(error.message, 500, 'UNKNOWN_ERROR');
  }

  // Unknown error type
  const message =
    typeof error === 'string' ? error : 'Bilinmeyen bir hata oluştu';
  return new ApiError(message, 500, 'UNKNOWN_ERROR');
}

/**
 * Get user-friendly error message from any error
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  const apiError = transformApiError(error);
  return apiError.message;
}

/**
 * Check if error requires re-authentication
 * Used to redirect user to login page
 */
export function requiresReauth(error: unknown): boolean {
  return error instanceof AuthenticationError;
}

/**
 * Check if error is retriable
 * Used to show "Retry" button to user
 */
export function isRetriableError(error: unknown): boolean {
  if (error instanceof NetworkError) return true;
  if (error instanceof TimeoutError) return true;
  if (error instanceof ServerError) return true;
  if (error instanceof RateLimitError) return true;

  if (error instanceof ApiError) {
    return error.isRetriable();
  }

  return false;
}

/**
 * Check if error is a client error (4xx)
 */
export function isClientError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.statusCode >= 400 && error.statusCode < 500;
  }
  return false;
}

/**
 * Check if error is a server error (5xx)
 */
export function isServerError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.statusCode >= 500;
  }
  return false;
}

/**
 * Get error status code
 */
export function getErrorStatusCode(error: unknown): number {
  if (error instanceof ApiError) {
    return error.statusCode;
  }
  return 500;
}

/**
 * Get error code (e.g., 'VALIDATION_ERROR', 'NOT_FOUND')
 */
export function getErrorCode(error: unknown): string | undefined {
  if (error instanceof ApiError) {
    return error.code;
  }
  return undefined;
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(error: unknown): string[] {
  if (error instanceof ValidationError) {
    const errors: string[] = [];
    const fieldErrors = error.getFieldErrors();

    Object.entries(fieldErrors).forEach(([field, messages]) => {
      messages.forEach((msg) => {
        errors.push(`${field}: ${msg}`);
      });
    });

    return errors;
  }

  return [getUserFriendlyErrorMessage(error)];
}

/**
 * Type guard: check if error is ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Type guard: check if error is ValidationError
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * Type guard: check if error is AuthenticationError
 */
export function isAuthenticationError(
  error: unknown
): error is AuthenticationError {
  return error instanceof AuthenticationError;
}

/**
 * Type guard: check if error is NetworkError
 */
export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}
