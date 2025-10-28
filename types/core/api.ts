/**
 * Core API Response Types
 * @module types/core/api
 * @description Additional API error types (ApiResponse and PaginatedResponse are in base.ts)
 */

/**
 * API error response
 */
export interface ApiError {
  message: string;
  code: string;
  field?: string;
  details?: Record<string, unknown>;
}

/**
 * API validation error response
 */
export interface ValidationError extends ApiError {
  field: string;
  constraint: string;
  value?: unknown;
}
