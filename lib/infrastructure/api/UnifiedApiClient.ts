// ================================================
// UNIFIED API CLIENT - PRODUCTION READY
// ================================================
// Single API client with standardized responses, error handling, and performance optimization
// Replaces: Multiple API client implementations and inconsistent response handling

// Types for standardized API responses
export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  errors?: ApiError[];
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, unknown>;
}

export interface ResponseMeta {
  timestamp: string;
  requestId: string;
  version: string;
  pagination?: PaginationMeta;
  cache?: CacheMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CacheMeta {
  cached: boolean;
  cacheKey: string;
  expiresAt: string;
}

// Request configuration
export interface RequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  cache?: 'no-cache' | 'force-cache' | 'only-if-cached' | 'reload';
  validateStatus?: (status: number) => boolean;
  transformRequest?: (data: unknown) => unknown;
  transformResponse?: (data: unknown) => unknown;
}

// API Client error types
export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public originalError: Error
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string = 'Request timeout') {
    super(message);
    this.name = 'TimeoutError';
  }
}

// ================================================
// UNIFIED API CLIENT CLASS
// ================================================

export class UnifiedApiClient {
  private baseURL: string;
  private defaultTimeout: number;
  private defaultRetries: number;
  private defaultRetryDelay: number;
  private requestInterceptors: ((
    config: RequestConfig
  ) => RequestConfig | Promise<RequestConfig>)[] = [];
  private responseInterceptors: ((
    response: Response
  ) => Response | Promise<Response>)[] = [];
  private cache: Map<string, { data: unknown; expiresAt: number }> = new Map();

  constructor(
    config: {
      baseURL?: string;
      timeout?: number;
      retries?: number;
      retryDelay?: number;
    } = {}
  ) {
    this.baseURL = config.baseURL || '/api';
    this.defaultTimeout = config.timeout || 30000; // 30 seconds
    this.defaultRetries = config.retries || 3;
    this.defaultRetryDelay = config.retryDelay || 1000; // 1 second
  }

  // ================================================
  // INTERCEPTORS
  // ================================================

  addRequestInterceptor(
    interceptor: (
      config: RequestConfig
    ) => RequestConfig | Promise<RequestConfig>
  ) {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(
    interceptor: (response: Response) => Response | Promise<Response>
  ) {
    this.responseInterceptors.push(interceptor);
  }

  // ================================================
  // CACHE MANAGEMENT
  // ================================================

  private getCacheKey(url: string, options: RequestConfig): string {
    const method = options.method || 'GET';
    const body = options.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`;
  }

  private getCachedResponse(cacheKey: string): unknown | null {
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }
    this.cache.delete(cacheKey);
    return null;
  }

  private setCachedResponse(
    cacheKey: string,
    data: unknown,
    ttl: number = 5 * 60 * 1000
  ) {
    this.cache.set(cacheKey, {
      data,
      expiresAt: Date.now() + ttl,
    });
  }

  clearCache() {
    this.cache.clear();
  }

  // ================================================
  // CORE REQUEST METHOD
  // ================================================

  private async makeRequest<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${this.baseURL}${endpoint}`;

    // Apply request interceptors
    let finalConfig = { ...config };
    for (const interceptor of this.requestInterceptors) {
      finalConfig = await interceptor(finalConfig);
    }

    // Setup request configuration
    const requestConfig: RequestInit = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...finalConfig.headers,
      },
      ...finalConfig,
    };

    // Add authentication if available
    if (typeof window !== 'undefined') {
      const authData =
        typeof window !== 'undefined'
          ? localStorage.getItem('marifetbul-auth')
          : null;
      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          if (parsed.state?.token) {
            requestConfig.headers = {
              ...requestConfig.headers,
              Authorization: `Bearer ${parsed.state.token}`,
            };
          }
        } catch (error) {
          console.warn('Failed to parse auth data:', error);
        }
      }
    }

    // Check cache for GET requests
    const cacheKey = this.getCacheKey(url, finalConfig);
    if (finalConfig.method === 'GET' || !finalConfig.method) {
      const cachedResponse = this.getCachedResponse(cacheKey);
      if (cachedResponse) {
        return cachedResponse as ApiResponse<T>;
      }
    }

    // Setup timeout
    const timeout = finalConfig.timeout || this.defaultTimeout;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    requestConfig.signal = controller.signal;

    try {
      const response = await this.executeWithRetry(
        url,
        requestConfig,
        finalConfig
      );

      clearTimeout(timeoutId);

      // Apply response interceptors
      let finalResponse = response;
      for (const interceptor of this.responseInterceptors) {
        finalResponse = await interceptor(finalResponse);
      }

      // Handle response
      const result = await this.processResponse<T>(finalResponse, finalConfig);

      // Cache successful GET requests
      if (
        (finalConfig.method === 'GET' || !finalConfig.method) &&
        result.success
      ) {
        this.setCachedResponse(cacheKey, result);
      }

      return result;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new TimeoutError('Request timeout');
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new NetworkError('Network error occurred', error);
      }

      throw error;
    }
  }

  // ================================================
  // RETRY MECHANISM
  // ================================================

  private async executeWithRetry(
    url: string,
    config: RequestInit,
    options: RequestConfig
  ): Promise<Response> {
    const retries = options.retries ?? this.defaultRetries;
    const retryDelay = options.retryDelay ?? this.defaultRetryDelay;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, config);

        // Check if response status should trigger retry
        const validateStatus =
          options.validateStatus ||
          ((status: number) => status >= 200 && status < 300);

        if (validateStatus(response.status)) {
          return response;
        }

        // If status validation fails, treat as error for retry logic
        throw new ApiClientError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          'HTTP_ERROR'
        );
      } catch (error) {
        lastError = error as Error;

        // Don't retry on certain errors
        if (
          error instanceof ApiClientError &&
          error.status >= 400 &&
          error.status < 500
        ) {
          break; // Client errors shouldn't be retried
        }

        if (attempt < retries) {
          await this.delay(retryDelay * Math.pow(2, attempt)); // Exponential backoff
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ================================================
  // RESPONSE PROCESSING
  // ================================================

  private async processResponse<T>(
    response: Response,
    config: RequestConfig
  ): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');

    let data: unknown;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Apply response transformation
    if (config.transformResponse) {
      data = config.transformResponse(data);
    }

    // Standardize response format
    if (this.isStandardApiResponse(data)) {
      return data as ApiResponse<T>;
    }

    // Convert non-standard responses to standard format
    return {
      data: data as T,
      success: response.ok,
      message: response.ok ? 'Success' : 'Request failed',
      meta: {
        timestamp: new Date().toISOString(),
        requestId: response.headers.get('x-request-id') || 'unknown',
        version: response.headers.get('x-api-version') || '1.0',
      },
    };
  }

  private isStandardApiResponse(data: unknown): data is ApiResponse {
    return (
      typeof data === 'object' &&
      data !== null &&
      'data' in data &&
      'success' in data
    );
  }

  // ================================================
  // HTTP METHODS
  // ================================================

  async get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const queryString = params ? this.buildQueryString(params) : '';
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    return this.makeRequest<T>(url, { ...config, method: 'GET' });
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const requestConfig: RequestConfig = {
      ...config,
      method: 'POST',
      body: data
        ? JSON.stringify(
            config?.transformRequest ? config.transformRequest(data) : data
          )
        : undefined,
    };

    return this.makeRequest<T>(endpoint, requestConfig);
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const requestConfig: RequestConfig = {
      ...config,
      method: 'PUT',
      body: data
        ? JSON.stringify(
            config?.transformRequest ? config.transformRequest(data) : data
          )
        : undefined,
    };

    return this.makeRequest<T>(endpoint, requestConfig);
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const requestConfig: RequestConfig = {
      ...config,
      method: 'PATCH',
      body: data
        ? JSON.stringify(
            config?.transformRequest ? config.transformRequest(data) : data
          )
        : undefined,
    };

    return this.makeRequest<T>(endpoint, requestConfig);
  }

  async delete<T>(
    endpoint: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...config, method: 'DELETE' });
  }

  // ================================================
  // UTILITY METHODS
  // ================================================

  private buildQueryString(
    params: Record<string, string | number | boolean>
  ): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });

    return searchParams.toString();
  }

  // ================================================
  // FILE UPLOAD SUPPORT
  // ================================================

  async uploadFile<T>(
    endpoint: string,
    file: File,
    fieldName: string = 'file',
    additionalFields?: Record<string, string>,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append(fieldName, file);

    if (additionalFields) {
      Object.entries(additionalFields).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const requestConfig: RequestConfig = {
      ...config,
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type, let browser set it with boundary
        ...config?.headers,
      },
    };

    // Remove Content-Type to let browser handle it for FormData
    if (requestConfig.headers && 'Content-Type' in requestConfig.headers) {
      delete (requestConfig.headers as Record<string, string>)['Content-Type'];
    }

    return this.makeRequest<T>(endpoint, requestConfig);
  }

  // ================================================
  // BATCH REQUESTS
  // ================================================

  async batch<T>(
    requests: Array<{
      endpoint: string;
      method?: string;
      data?: unknown;
      config?: RequestConfig;
    }>
  ): Promise<ApiResponse<T[]>> {
    const promises = requests.map(
      ({ endpoint, method = 'GET', data, config }) => {
        switch (method.toUpperCase()) {
          case 'GET':
            return this.get(endpoint, undefined, config);
          case 'POST':
            return this.post(endpoint, data, config);
          case 'PUT':
            return this.put(endpoint, data, config);
          case 'PATCH':
            return this.patch(endpoint, data, config);
          case 'DELETE':
            return this.delete(endpoint, config);
          default:
            throw new Error(`Unsupported method: ${method}`);
        }
      }
    );

    const results = await Promise.allSettled(promises);

    const successfulResults = results
      .filter(
        (result): result is PromiseFulfilledResult<ApiResponse<unknown>> =>
          result.status === 'fulfilled'
      )
      .map((result) => result.value.data);

    const errors = results
      .filter(
        (result): result is PromiseRejectedResult =>
          result.status === 'rejected'
      )
      .map((result) => ({
        code: 'BATCH_REQUEST_FAILED',
        message: result.reason.message || 'Batch request failed',
        details: { error: result.reason },
      }));

    return {
      data: successfulResults as T[],
      success: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: `batch_${Date.now()}`,
        version: '1.0',
      },
    };
  }
}

// ================================================
// SINGLETON INSTANCE AND EXPORTS
// ================================================

// Create singleton instance
export const unifiedApiClient = new UnifiedApiClient({
  baseURL: '/api',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
});

// Add default auth interceptor
unifiedApiClient.addRequestInterceptor(async (config) => {
  // Add request timestamp for debugging
  config.headers = {
    ...config.headers,
    'X-Request-Timestamp': new Date().toISOString(),
  };

  return config;
});

// Add default response interceptor for error handling
unifiedApiClient.addResponseInterceptor(async (response) => {
  // Log response for debugging in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`API Response: ${response.status} ${response.url}`);
  }

  return response;
});

// ================================================
// CONVENIENCE FUNCTIONS FOR SWR
// ================================================

export const swrFetcher = async (url: string) => {
  const response = await unifiedApiClient.get(url);
  if (!response.success) {
    throw new Error(response.message || 'Request failed');
  }
  return response.data;
};

export const swrFetcherWithParams = async ([url, params]: [
  string,
  Record<string, string | number | boolean>,
]) => {
  const response = await unifiedApiClient.get(url, params);
  if (!response.success) {
    throw new Error(response.message || 'Request failed');
  }
  return response.data;
};

// ================================================
// LEGACY COMPATIBILITY
// ================================================

// Maintain backward compatibility
export const apiClient = {
  get: <T>(endpoint: string, params?: Record<string, string>) =>
    unifiedApiClient.get<T>(endpoint, params).then((response) => response.data),
  post: <T>(endpoint: string, data?: unknown) =>
    unifiedApiClient.post<T>(endpoint, data).then((response) => response.data),
  put: <T>(endpoint: string, data?: unknown) =>
    unifiedApiClient.put<T>(endpoint, data).then((response) => response.data),
  patch: <T>(endpoint: string, data?: unknown) =>
    unifiedApiClient.patch<T>(endpoint, data).then((response) => response.data),
  delete: <T>(endpoint: string) =>
    unifiedApiClient.delete<T>(endpoint).then((response) => response.data),
};

export const fetcher = swrFetcher;
export const fetcherWithParams = swrFetcherWithParams;

export default unifiedApiClient;
