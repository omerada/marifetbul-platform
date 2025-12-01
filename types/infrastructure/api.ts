/**
 * ================================================
 * CANONICAL API RESPONSE TYPES
 * ================================================
 * Single source of truth for all API response wrappers
 * Sprint 9: Infrastructure layer types
 *
 * @module types/infrastructure/api
 * @description Standardized API response types for the entire application
 */

// ============================================================================
// Generic API Response Wrapper
// ============================================================================

/**
 * Standard API response wrapper for all endpoints
 * Used by infrastructure layer API client
 *
 * @template T - Type of the response data
 * @example
 * ```typescript
 * const response: ApiResponse<User> = {
 *   data: { id: '123', name: 'John' },
 *   status: 'success',
 *   message: 'User retrieved successfully'
 * };
 * ```
 */
export interface ApiResponse<T = unknown> {
  /** Response data payload */
  data: T;
  /** Response status (success/error) */
  status: 'success' | 'error';
  /** Optional message (error description, info, etc.) */
  message?: string;
  /** Timestamp of response (ISO 8601) */
  timestamp?: string;
}

// ============================================================================
// Paginated Response
// ============================================================================

/**
 * Spring Boot PageResponse wrapper (matches backend com.marifetbul.api.common.dto.PageResponse)
 * Used for endpoints that return Page<T> from backend
 *
 * @template T - Type of items in the content array
 * @version 2.0.0 - Backend-compatible (aligned with backend-aligned.ts)
 * @see types/backend-aligned.ts for the canonical definition
 */
export interface PageResponse<T = unknown> {
  /** Array of items in current page */
  content: T[];
  /** Current page number (0-indexed, Spring Boot standard) */
  page: number;
  /** Items per page */
  size: number;
  /** Total number of items across all pages */
  totalElements: number;
  /** Total number of pages */
  totalPages: number;
  /** Is this the last page? */
  last: boolean;
  /** Is this the first page? */
  first: boolean;
  /** Is the content empty? */
  empty: boolean;
}

/**
 * Paginated API response wrapper
 * Used for list/collection endpoints
 *
 * @template T - Type of items in the data array
 * @example
 * ```typescript
 * const response: PaginatedResponse<Product> = {
 *   data: [{ id: '1', name: 'Product 1' }],
 *   pagination: {
 *     page: 1,
 *     pageSize: 20,
 *     total: 100,
 *     totalPages: 5,
 *     hasNext: true,
 *     hasPrev: false
 *   }
 * };
 * ```
 */
export interface PaginatedResponse<T = unknown> {
  /** Array of data items */
  data: T[];
  /** Pagination metadata */
  pagination: PaginationMeta;
  /** Optional additional metadata */
  meta?: {
    /** Total count (may differ from pagination.total in filtered results) */
    totalCount?: number;
    /** Applied filters */
    filters?: Record<string, unknown>;
    /** Search query string */
    searchQuery?: string;
    /** Sort field */
    sortBy?: string;
    /** Sort direction */
    sortOrder?: 'asc' | 'desc';
  };
}

/**
 * Pagination metadata
 * Reusable across all paginated responses
 */
export interface PaginationMeta {
  /** Current page number (1-based) */
  page: number;
  /** Items per page */
  pageSize: number;
  /** Total number of items */
  total: number;
  /** Total number of pages */
  totalPages: number;
  /** Has next page */
  hasNext: boolean;
  /** Has previous page */
  hasPrev: boolean;
}

// ============================================================================
// Error Response
// ============================================================================

/**
 * Standardized API error response
 *
 * @example
 * ```typescript
 * const error: ApiError = {
 *   message: 'Validation failed',
 *   statusCode: 400,
 *   code: 'VALIDATION_ERROR',
 *   fieldErrors: {
 *     email: ['Email is required', 'Email format is invalid'],
 *     password: ['Password must be at least 8 characters']
 *   }
 * };
 * ```
 */
export interface ApiError {
  /** Error message */
  message: string;
  /** HTTP status code */
  statusCode?: number;
  /** Error code (e.g., 'VALIDATION_ERROR', 'NOT_FOUND', 'UNAUTHORIZED') */
  code?: string;
  /** Additional error details */
  details?: Record<string, unknown>;
  /** Field-specific errors for validation */
  fieldErrors?: Record<string, string[]>;
  /** Stack trace (development only) */
  stack?: string;
}

// ============================================================================
// Single Entity Response
// ============================================================================

/**
 * Response wrapper for single entity operations (GET, POST, PUT)
 * Extends ApiResponse with entity-specific metadata
 *
 * @template T - Type of the entity
 */
export interface SingleEntityResponse<T> extends ApiResponse<T> {
  /** Entity-specific metadata */
  meta?: {
    /** Last modified timestamp */
    lastModified?: string;
    /** ETag for caching */
    etag?: string;
    /** Version number for optimistic locking */
    version?: number;
  };
}

// ============================================================================
// Bulk Operation Response
// ============================================================================

/**
 * Response for bulk operations (batch create, update, delete)
 *
 * @template T - Type of items being processed
 */
export interface BulkOperationResponse<T = unknown> {
  /** Successfully processed items */
  succeeded: T[];
  /** Failed items with error details */
  failed: Array<{
    item: T;
    error: string;
  }>;
  /** Total number of items processed */
  total: number;
  /** Number of successful operations */
  successCount: number;
  /** Number of failed operations */
  failureCount: number;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if response is successful
 *
 * @param response - API response to check
 * @returns True if response status is 'success'
 */
export function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is ApiResponse<T> & { status: 'success' } {
  return response.status === 'success';
}

/**
 * Type guard to check if response is an error
 *
 * @param response - API response to check
 * @returns True if response status is 'error'
 */
export function isErrorResponse<T>(
  response: ApiResponse<T>
): response is ApiResponse<T> & { status: 'error'; message: string } {
  return response.status === 'error';
}

/**
 * Type guard to check if response is paginated
 *
 * @param response - Response to check
 * @returns True if response has pagination property
 */
export function isPaginatedResponse<T>(
  response: unknown
): response is PaginatedResponse<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    Array.isArray((response as PaginatedResponse<T>).data) &&
    'pagination' in response
  );
}
