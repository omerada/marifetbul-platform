import { apiCache, CachePresets } from '../cache/apiCache';
import { retryManager, RetryPresets } from '../retry/retryManager';
import { apiLogger } from '../monitoring/logger';
import { captureSentryError } from '../monitoring/sentry';
import { getBackendApiUrl } from '@/lib/config/api';
import {
  addCsrfTokenToHeaders,
  requiresCsrfProtection,
} from '../security/csrf';
import { transformError, isRetriable } from '@/lib/api/errors';

interface RequestOptions extends RequestInit {
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
}

// Base API client for making HTTP requests with caching and retry support
class ApiClient {
  private baseURL: string;
  private refreshTokenPromise: Promise<boolean> | null = null;
  private isRefreshing = false;

  constructor(baseURL?: string) {
    // Use environment variable or centralized config
    this.baseURL = baseURL || getBackendApiUrl();
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    // Separate custom options from fetch options
    const {
      caching: cacheOptions,
      retry: retryOptions,
      ...fetchOptions
    } = options;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
      credentials: 'include', // IMPORTANT: Include httpOnly cookies in all requests
      ...fetchOptions,
    };

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
        // Continue without CSRF token - let server handle validation
      }
    }

    // NOTE: Authentication is now handled by httpOnly cookies
    // No need to manually add Authorization header
    // Cookies are automatically sent with credentials: 'include'

    // Check cache for GET requests
    const isGetRequest = !config.method || config.method === 'GET';
    if (isGetRequest && cacheOptions?.enabled !== false) {
      const cached = apiCache.get<T>(endpoint);
      if (cached && !cacheOptions?.forceRefresh) {
        apiLogger.debug('API request served from cache', {
          endpoint,
          method: 'GET',
          cached: true,
        });
        return cached;
      }
    }

    // Define the fetch function
    const fetchFn = async (): Promise<T> => {
      const startTime = performance.now();

      try {
        // Log request start
        apiLogger.debug('API request started', {
          endpoint,
          method: config.method || 'GET',
          url,
        });

        const response = await fetch(url, config);
        const duration = performance.now() - startTime;

        // Handle 401 Unauthorized - Token expired, attempt refresh
        if (
          response.status === 401 &&
          endpoint !== '/auth/refresh' &&
          endpoint !== '/auth/login'
        ) {
          apiLogger.warn('API request returned 401, attempting token refresh', {
            endpoint,
            method: config.method || 'GET',
          });

          // Attempt token refresh
          const refreshSuccess = await this.handleTokenRefresh();

          if (refreshSuccess) {
            // Retry the original request after successful refresh
            apiLogger.debug('Retrying request after token refresh', {
              endpoint,
            });
            const retryResponse = await fetch(url, config);

            if (!retryResponse.ok) {
              const errorData = await retryResponse.json().catch(() => ({}));
              const apiError = transformError({
                status: retryResponse.status,
                message: errorData.message || errorData.error,
                code: errorData.code,
                details: errorData.details,
              });
              throw apiError;
            }

            const retryData = await retryResponse.json();

            // Cache successful GET requests
            if (isGetRequest && cacheOptions?.enabled !== false) {
              apiCache.set(
                endpoint,
                retryData,
                undefined,
                cacheOptions?.ttl || CachePresets.MEDIUM
              );
            }

            return retryData;
          } else {
            // Refresh failed, redirect to login
            apiLogger.error('Token refresh failed, redirecting to login');
            if (typeof window !== 'undefined') {
              window.location.href = '/login?session=expired';
            }
            throw transformError({
              status: 401,
              message: 'Session expired. Please login again.',
              code: 'SESSION_EXPIRED',
            });
          }
        }

        if (!response.ok) {
          // Transform HTTP errors to custom error classes
          const errorData = await response.json().catch(() => ({}));
          const apiError = transformError({
            status: response.status,
            message: errorData.message || errorData.error,
            code: errorData.code,
            details: errorData.details,
          });

          // Log structured error
          apiLogger.error('API request failed', apiError, {
            endpoint,
            method: config.method || 'GET',
            status: response.status,
            duration: `${duration.toFixed(2)}ms`,
            errorCode: apiError.code,
            errorDetails: apiError.details,
          });

          // Capture in Sentry with structured context
          captureSentryError(apiError, {
            endpoint,
            method: config.method || 'GET',
            status: response.status,
            duration,
            errorCode: apiError.code,
          });

          throw apiError;
        }

        const data = await response.json();

        // Log successful request
        apiLogger.debug('API request completed', {
          endpoint,
          method: config.method || 'GET',
          status: response.status,
          duration: `${duration.toFixed(2)}ms`,
          cached: false,
        });

        // Cache successful GET requests
        if (isGetRequest && cacheOptions?.enabled !== false) {
          apiCache.set(
            endpoint,
            data,
            undefined,
            cacheOptions?.ttl || CachePresets.MEDIUM
          );
        }

        return data;
      } catch (error) {
        const duration = performance.now() - startTime;

        // Transform unknown errors to ApiError
        const apiError = transformError(error);

        // Log structured error
        apiLogger.error('API request exception', apiError, {
          endpoint,
          method: config.method || 'GET',
          duration: `${duration.toFixed(2)}ms`,
          errorType: apiError.name,
          errorCode: apiError.code,
        });

        // Capture in Sentry
        captureSentryError(apiError, {
          endpoint,
          method: config.method || 'GET',
          duration,
          errorType: apiError.name,
        });

        throw apiError;
      }
    };

    // Execute with retry if enabled
    if (retryOptions?.enabled !== false) {
      return retryManager.execute(fetchFn, endpoint, {
        ...RetryPresets.STANDARD,
        ...retryOptions,
        // Use our custom retry logic for API errors
        shouldRetry: (error) => {
          if (retryOptions?.shouldRetry) {
            return retryOptions.shouldRetry(error);
          }
          return isRetriable(error);
        },
      });
    }

    return fetchFn();
  }

  /**
   * Handle token refresh with single-flight pattern
   * Prevents multiple simultaneous refresh requests
   */
  private async handleTokenRefresh(): Promise<boolean> {
    // If already refreshing, wait for existing refresh to complete
    if (this.isRefreshing && this.refreshTokenPromise) {
      apiLogger.debug('Token refresh already in progress, waiting...');
      await this.refreshTokenPromise;
      return !this.isRefreshing; // Return true if refresh completed successfully
    }

    this.isRefreshing = true;
    this.refreshTokenPromise = (async () => {
      try {
        const response = await fetch(`${this.baseURL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies
        });

        if (response.ok) {
          apiLogger.info('Token refresh successful');
          this.isRefreshing = false;
          return true;
        } else {
          apiLogger.error(
            'Token refresh failed with status',
            new Error(`Status: ${response.status}`)
          );
          this.isRefreshing = false;
          return false;
        }
      } catch (error) {
        apiLogger.error('Token refresh exception', error as Error);
        this.isRefreshing = false;
        return false;
      } finally {
        this.refreshTokenPromise = null;
      }
    })();

    const result = await this.refreshTokenPromise;
    return result;
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, string>,
    options?: RequestOptions
  ): Promise<T> {
    const searchParams = params ? new URLSearchParams(params).toString() : '';
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
  ): Promise<T> {
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
  ): Promise<T> {
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
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      ...options,
    });
  }

  // Cache management methods
  invalidateCache(endpoint: string) {
    apiCache.invalidate(endpoint);
  }

  invalidateCachePattern(pattern: string | RegExp) {
    apiCache.invalidatePattern(pattern);
  }

  clearCache() {
    apiCache.clear();
  }

  getCacheStats() {
    return apiCache.getStats();
  }

  // Retry management methods
  getRetryStats() {
    return retryManager.getStats();
  }

  resetRetryCircuit(endpoint: string) {
    retryManager.resetCircuit(endpoint);
  }

  resetAllRetryCircuits() {
    retryManager.resetAllCircuits();
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Generic fetcher for SWR
export const fetcher = async (url: string) => {
  return apiClient.get(url);
};

// Fetcher with params
export const fetcherWithParams = async ([url, params]: [
  string,
  Record<string, string>,
]) => {
  return apiClient.get(url, params);
};
