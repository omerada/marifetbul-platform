/**
 * ================================================
 * ERROR TYPES
 * ================================================
 * Type definitions for application errors
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 2 - Story 2.3: Error Handling Enhancement
 */

/**
 * Base application error interface
 */
export interface AppError {
  category: ErrorCategory;
  /** Error code for identification */
  code: string;
  /** User-friendly error message */
  message: string;
  /** Technical error details (for logging) */
  details?: unknown;
  /** HTTP status code */
  statusCode?: number;
  /** Whether error can be retried */
  retryable?: boolean;
  /** Original error object */
  originalError?: unknown;
  /** Timestamp when error occurred */
  timestamp?: Date;
  /** Additional context */
  context?: Record<string, unknown>;
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * Error categories
 */
export enum ErrorCategory {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Network error
 */
export interface NetworkError extends AppError {
  category: ErrorCategory.NETWORK;
  retryable: true;
}

/**
 * Validation error
 */
export interface ValidationError extends AppError {
  category: ErrorCategory.VALIDATION;
  retryable: false;
  fields?: Record<string, string[]>;
}

/**
 * Authentication error
 */
export interface AuthenticationError extends AppError {
  category: ErrorCategory.AUTHENTICATION;
  retryable: false;
}

/**
 * Authorization error
 */
export interface AuthorizationError extends AppError {
  category: ErrorCategory.AUTHORIZATION;
  retryable: false;
}

/**
 * Not found error
 */
export interface NotFoundError extends AppError {
  category: ErrorCategory.NOT_FOUND;
  retryable: false;
  resourceType?: string;
  resourceId?: string;
}

/**
 * Server error
 */
export interface ServerError extends AppError {
  category: ErrorCategory.SERVER;
  retryable: boolean;
}

/**
 * Error log entry
 */
export interface ErrorLogEntry {
  error: AppError;
  severity: ErrorSeverity;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  stackTrace?: string;
}
