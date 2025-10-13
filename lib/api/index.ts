/**
 * ================================================
 * API MODULE - PUBLIC EXPORTS
 * ================================================
 * Central export point for all API-related functionality
 *
 * @author MarifetBul Development Team
 * @version 2.0.0
 */

// Export API Client
export { default as apiClient } from './client';
export { default } from './client';

// Export fetchers for SWR
export { fetcher, fetcherWithParams, fetcherWithResponse } from './client';

// Export types
export type {
  ApiResponse,
  ErrorDetails,
  PageMetadata,
  RequestOptions,
} from './client';

// Export error classes
export {
  ApiError,
  NetworkError,
  TimeoutError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
} from './client';

// Export endpoints
export { default as API_ENDPOINTS } from './endpoints';
export * from './endpoints';
