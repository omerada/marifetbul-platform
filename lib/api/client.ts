/**
 * ================================================
 * UNIFIED API CLIENT - PRODUCTION READY
 * ================================================
 * Single API client connecting to Spring Boot backend
 * Matches Spring Boot's ApiResponse<T> format exactly
 *
 * Features:
 * - Spring Boot ApiResponse<T> compatibility
 * - Automatic retry with exponential backoff
 * - Request/response interceptors
 * - Cache support for GET requests
 * - CSRF protection for state-changing requests
 * - httpOnly cookie-based authentication
 * - Comprehensive error handling
 * - SWR integration
 *
 * @author MarifetBul Development Team
 * @version 2.0.0
 */

import { apiCache, CachePresets } from '../infrastructure/cache/apiCache';
import {
  retryManager,
  RetryPresets,
} from '../infrastructure/retry/retryManager';
import { apiLogger } from '../infrastructure/monitoring/logger';
import { captureSentryError } from '../infrastructure/monitoring/sentry';
import {
  addCsrfTokenToHeaders,
  requiresCsrfProtection,
} from '../infrastructure/security/csrf';

// ================================================
// TYPES - Match Spring Boot's ApiResponse<T>
// ================================================

/**
 * Standard API Response from Spring Boot backend
 * @see com.marifetbul.api.common.dto.ApiResponse
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: ErrorDetails;
  timestamp?: string; // ISO 8601 format from Spring Boot
}

/**
 * Error details from Spring Boot backend
 * @see com.marifetbul.api.common.dto.ApiResponse.ErrorDetails
 */
export interface ErrorDetails {
  code?: string;
  field?: string;
  rejectedValue?: unknown;
  details?: string;
}

/**
 * Pagination metadata (when backend returns paginated data)
 */
export interface PageMetadata {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

/**
 * Request configuration options
 */
export interface RequestOptions extends RequestInit {
  caching?: {
    enabled?: boolean;
    ttl?: number;
    forceRefresh?: boolean;
  };
  retry?: {
    enabled?: boolean;
    maxRetries?: number;
    shouldRetry?: (error: unknown) => boolean;
  };
  timeout?: number;
}

// ================================================
// CUSTOM ERROR CLASSES
// ================================================

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: ErrorDetails
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class NetworkError extends Error {
  constructor(
    message: string,
    public originalError: Error
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

class TimeoutError extends Error {
  constructor(message: string = 'Request timeout') {
    super(message);
    this.name = 'TimeoutError';
  }
}

class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_REQUIRED');
    this.name = 'AuthenticationError';
  }
}

class AuthorizationError extends ApiError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'ACCESS_DENIED');
    this.name = 'AuthorizationError';
  }
}

class ValidationError extends ApiError {
  constructor(
    message: string = 'Validation failed',
    public validationErrors?: Record<string, string>
  ) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

// ================================================
// UNIFIED API CLIENT CLASS
// ================================================

class ApiClient {
  private baseURL: string;
  private defaultTimeout: number;
  private requestInterceptors: ((
    config: RequestInit
  ) => RequestInit | Promise<RequestInit>)[] = [];
  private responseInterceptors: ((
    response: Response
  ) => Response | Promise<Response>)[] = [];

  constructor(baseURL?: string, defaultTimeout: number = 30000) {
    // Priority: explicit baseURL > env var > Next.js proxy (dev) > direct backend (prod)
    this.baseURL =
      baseURL ||
      process.env.NEXT_PUBLIC_API_URL ||
      (typeof window !== 'undefined' && process.env.NODE_ENV === 'development'
        ? '/api/v1' // Use Next.js proxy in development
        : 'http://localhost:8080/api/v1'); // Direct connection in production

    this.defaultTimeout = defaultTimeout;

    // Log initialization
    if (process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true') {
      console.log('🔌 API Client initialized:', {
        baseURL: this.baseURL,
        timeout: this.defaultTimeout,
        environment: process.env.NODE_ENV,
      });
    }
  }

  // ================================================
  // INTERCEPTORS
  // ================================================

  addRequestInterceptor(
    interceptor: (config: RequestInit) => RequestInit | Promise<RequestInit>
  ) {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(
    interceptor: (response: Response) => Response | Promise<Response>
  ) {
    this.responseInterceptors.push(interceptor);
  }

  // ================================================
  // CORE REQUEST METHOD
  // ================================================

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    // Separate custom options from fetch options
    const {
      caching: cacheOptions,
      retry: retryOptions,
      timeout,
      ...fetchOptions
    } = options;

    // Build request configuration
    let config: RequestInit = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...fetchOptions.headers,
      },
      credentials: 'include', // CRITICAL: Include httpOnly cookies for authentication
      ...fetchOptions,
    };

    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      config = await interceptor(config);
    }

    // Add CSRF token for state-changing requests
    const method = (config.method || 'GET').toUpperCase();
    if (requiresCsrfProtection(method)) {
      try {
        const headersWithCsrf = addCsrfTokenToHeaders(
          config.headers as Record<string, string>
        );
        config.headers = headersWithCsrf;

        apiLogger.debug('CSRF token added to request', {
          endpoint,
          method,
        });
      } catch (error) {
        apiLogger.warn('Failed to add CSRF token', {
          endpoint,
          method,
          error: error instanceof Error ? error.message : String(error),
        });
        // Continue without CSRF - backend will validate
      }
    }

    // Check cache for GET requests
    const isGetRequest = method === 'GET';
    if (isGetRequest && cacheOptions?.enabled !== false) {
      const cached = apiCache.get<ApiResponse<T>>(endpoint);
      if (cached && !cacheOptions?.forceRefresh) {
        apiLogger.debug('API request served from cache', {
          endpoint,
          method: 'GET',
          cached: true,
        });
        return cached;
      }
    }

    // Setup timeout
    const requestTimeout = timeout || this.defaultTimeout;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), requestTimeout);

    config.signal = controller.signal;

    // Define the fetch function for retry
    const fetchFn = async (): Promise<ApiResponse<T>> => {
      const startTime = performance.now();

      try {
        apiLogger.debug('API request started', {
          endpoint,
          method: config.method || 'GET',
          url,
        });

        // Execute fetch
        let response = await fetch(url, config);

        // Apply response interceptors
        for (const interceptor of this.responseInterceptors) {
          response = await interceptor(response);
        }

        const duration = performance.now() - startTime;

        // Handle non-OK responses
        if (!response.ok) {
          const error = await this.handleErrorResponse(
            response,
            endpoint,
            duration
          );
          throw error;
        }

        // Parse successful response
        const result = await this.parseResponse<T>(
          response,
          endpoint,
          duration
        );

        // Cache successful GET requests
        if (isGetRequest && cacheOptions?.enabled !== false && result.success) {
          apiCache.set(
            endpoint,
            result,
            undefined,
            cacheOptions?.ttl || CachePresets.MEDIUM
          );
        }

        return result;
      } catch (error) {
        const duration = performance.now() - startTime;

        // Handle timeout
        if (error instanceof Error && error.name === 'AbortError') {
          const timeoutError = new TimeoutError(
            `Request timeout after ${requestTimeout}ms`
          );
          apiLogger.error('API request timeout', timeoutError, {
            endpoint,
            method,
            timeout: requestTimeout,
          });
          captureSentryError(timeoutError, {
            endpoint,
            method,
            timeout: requestTimeout,
          });
          throw timeoutError;
        }

        // Handle network errors
        if (error instanceof TypeError) {
          const networkError = new NetworkError(
            'Network request failed',
            error
          );
          apiLogger.error('API network error', networkError, {
            endpoint,
            method,
            duration: `${duration.toFixed(2)}ms`,
          });
          captureSentryError(networkError, { endpoint, method, duration });
          throw networkError;
        }

        // Re-throw API errors
        if (error instanceof ApiError) {
          throw error;
        }

        // Handle unexpected errors
        apiLogger.error('API unexpected error', error as Error, {
          endpoint,
          method,
          duration: `${duration.toFixed(2)}ms`,
        });
        captureSentryError(error as Error, { endpoint, method, duration });
        throw error;
      } finally {
        clearTimeout(timeoutId);
      }
    };

    // Execute with retry if enabled
    if (retryOptions?.enabled !== false) {
      return retryManager.execute(fetchFn, endpoint, {
        ...RetryPresets.STANDARD,
        ...retryOptions,
      });
    }

    return fetchFn();
  }

  // ================================================
  // RESPONSE PARSING
  // ================================================

  private async parseResponse<T>(
    response: Response,
    endpoint: string,
    duration: number
  ): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');

    // Parse JSON response
    if (contentType?.includes('application/json')) {
      const json = await response.json();

      // Spring Boot returns ApiResponse<T> format
      if (this.isApiResponse(json)) {
        apiLogger.debug('API request completed', {
          endpoint,
          method: response.url,
          status: response.status,
          duration: `${duration.toFixed(2)}ms`,
          success: json.success,
        });

        return json as ApiResponse<T>;
      }

      // Fallback: Wrap raw data in ApiResponse format
      return {
        success: true,
        data: json as T,
        message: 'Success',
        timestamp: new Date().toISOString(),
      };
    }

    // Handle non-JSON responses
    const text = await response.text();
    return {
      success: true,
      data: text as unknown as T,
      message: 'Success',
      timestamp: new Date().toISOString(),
    };
  }

  private isApiResponse(data: unknown): data is ApiResponse {
    return (
      typeof data === 'object' &&
      data !== null &&
      'success' in data &&
      typeof (data as ApiResponse).success === 'boolean'
    );
  }

  // ================================================
  // ERROR HANDLING
  // ================================================

  private async handleErrorResponse(
    response: Response,
    endpoint: string,
    duration: number
  ): Promise<ApiError> {
    const status = response.status;
    let errorData: ApiResponse<unknown> | null = null;

    // Try to parse error response
    try {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        errorData = await response.json();
      }
    } catch {
      // Ignore JSON parse errors
    }

    // Extract error details
    const message =
      errorData?.message || response.statusText || 'Request failed';
    const code = errorData?.error?.code;
    const details = errorData?.error;

    // Create appropriate error
    let error: ApiError;

    switch (status) {
      case 401:
        error = new AuthenticationError(message);
        break;
      case 403:
        error = new AuthorizationError(message);
        break;
      case 400:
        error = new ValidationError(message);
        break;
      default:
        error = new ApiError(message, status, code, details);
    }

    // Log error
    apiLogger.error('API request failed', error, {
      endpoint,
      status,
      duration: `${duration.toFixed(2)}ms`,
      errorCode: code,
    });

    captureSentryError(error, {
      endpoint,
      status,
      duration,
      errorCode: code,
      errorDetails: details,
    });

    return error;
  }

  // ================================================
  // HTTP METHODS
  // ================================================

  async get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const searchParams = params ? this.buildQueryString(params) : '';
    const url = searchParams ? `${endpoint}?${searchParams}` : endpoint;

    return this.request<T>(url, {
      method: 'GET',
      ...options,
    });
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async delete<T>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      ...options,
    });
  }

  // ================================================
  // FILE UPLOAD
  // ================================================

  async uploadFile<T>(
    endpoint: string,
    file: File,
    fieldName: string = 'file',
    additionalFields?: Record<string, string>,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append(fieldName, file);

    if (additionalFields) {
      Object.entries(additionalFields).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    // Remove Content-Type header for FormData (browser sets it with boundary)
    const { headers, ...restOptions } = options || {};
    const filteredHeaders = { ...headers };
    delete (filteredHeaders as Record<string, string>)['Content-Type'];

    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: filteredHeaders,
      ...restOptions,
    });
  }

  // ================================================
  // CACHE MANAGEMENT
  // ================================================

  invalidateCache(endpoint: string) {
    apiCache.invalidate(endpoint);
    apiLogger.debug('Cache invalidated', { endpoint });
  }

  invalidateCachePattern(pattern: string | RegExp) {
    apiCache.invalidatePattern(pattern);
    apiLogger.debug('Cache pattern invalidated', {
      pattern: pattern.toString(),
    });
  }

  clearCache() {
    apiCache.clear();
    apiLogger.debug('All cache cleared');
  }

  getCacheStats() {
    return apiCache.getStats();
  }

  // ================================================
  // RETRY MANAGEMENT
  // ================================================

  getRetryStats() {
    return retryManager.getStats();
  }

  resetRetryCircuit(endpoint: string) {
    retryManager.resetCircuit(endpoint);
    apiLogger.debug('Retry circuit reset', { endpoint });
  }

  resetAllRetryCircuits() {
    retryManager.resetAllCircuits();
    apiLogger.debug('All retry circuits reset');
  }

  // ================================================
  // UTILITY METHODS
  // ================================================

  private buildQueryString(
    params: Record<string, string | number | boolean | undefined>
  ): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    return searchParams.toString();
  }

  // Get base URL (useful for debugging)
  getBaseURL(): string {
    return this.baseURL;
  }

  // Update base URL (useful for testing)
  setBaseURL(url: string) {
    this.baseURL = url;
    apiLogger.debug('Base URL updated', { baseURL: url });
  }
}

// ================================================
// SINGLETON INSTANCE
// ================================================

export const apiClient = new ApiClient();

// Add default request interceptor for debugging
if (process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true') {
  apiClient.addRequestInterceptor((config) => {
    console.log('📤 API Request:', {
      method: config.method,
      headers: config.headers,
      body: config.body,
    });
    return config;
  });

  apiClient.addResponseInterceptor((response) => {
    console.log('📥 API Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    });
    return response;
  });
}

// ================================================
// SWR INTEGRATION
// ================================================

/**
 * Generic fetcher for SWR - returns data directly or throws error
 */
export const fetcher = async <T>(url: string): Promise<T> => {
  const response = await apiClient.get<T>(url);

  if (!response.success) {
    throw new ApiError(
      response.message || 'Request failed',
      0,
      response.error?.code,
      response.error
    );
  }

  return response.data as T;
};

/**
 * Fetcher with params for SWR
 */
export const fetcherWithParams = async <T>([url, params]: [
  string,
  Record<string, string | number | boolean>,
]): Promise<T> => {
  const response = await apiClient.get<T>(url, params);

  if (!response.success) {
    throw new ApiError(
      response.message || 'Request failed',
      0,
      response.error?.code,
      response.error
    );
  }

  return response.data as T;
};

/**
 * Fetcher that returns full ApiResponse (useful when you need metadata)
 */
export const fetcherWithResponse = async <T>(
  url: string
): Promise<ApiResponse<T>> => {
  return apiClient.get<T>(url);
};

// ================================================
// EXPORTS
// ================================================

export default apiClient;

// Export error classes
export {
  ApiError,
  NetworkError,
  TimeoutError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
};
