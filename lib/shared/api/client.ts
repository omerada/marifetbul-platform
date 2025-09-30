// Production-ready API client with advanced features
export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
  interceptors?: {
    request?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
    response?: (
      response: ApiResponse<unknown>
    ) => ApiResponse<unknown> | Promise<ApiResponse<unknown>>;
    error?: (error: ApiError) => Promise<never> | ApiError;
  };
  cache?: {
    enabled: boolean;
    ttl: number;
    maxSize: number;
  };
}

export interface RequestConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: unknown;
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  signal?: AbortSignal;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: RequestConfig;
}

export interface ApiError extends Error {
  response?: {
    data: unknown;
    status: number;
    statusText: string;
    headers: Record<string, string>;
  };
  request?: RequestConfig;
  code?: string;
  isNetworkError: boolean;
  isTimeoutError: boolean;
  isRetryableError: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Request queue for managing concurrent requests
class RequestQueue {
  private queue: Array<() => Promise<unknown>> = [];
  private running = 0;
  private maxConcurrent = 6;

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          this.running++;
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.running--;
          this.processQueue();
        }
      });

      this.processQueue();
    });
  }

  private processQueue(): void {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const request = this.queue.shift();
    if (request) {
      request();
    }
  }

  clear(): void {
    this.queue = [];
  }

  get stats() {
    return {
      running: this.running,
      queued: this.queue.length,
      maxConcurrent: this.maxConcurrent,
    };
  }
}

// Advanced API client
export class ApiClient {
  private config: ApiClientConfig;
  private requestQueue = new RequestQueue();
  private cache = new Map<
    string,
    { data: unknown; timestamp: number; ttl: number }
  >();
  private abortControllers = new Map<string, AbortController>();

  constructor(config: ApiClientConfig) {
    this.config = {
      timeout: 10000,
      retries: 3,
      retryDelay: 1000,
      headers: {
        'Content-Type': 'application/json',
      },
      cache: {
        enabled: true,
        ttl: 5 * 60 * 1000, // 5 minutes
        maxSize: 100,
      },
      ...config,
    };
  }

  // Main request method
  async request<T>(config: RequestConfig): Promise<ApiResponse<T>> {
    const fullConfig = this.mergeConfig(config);

    // Check cache for GET requests
    if (
      fullConfig.method === 'GET' &&
      fullConfig.cache !== false &&
      this.config.cache?.enabled
    ) {
      const cached = this.getFromCache<T>(this.getCacheKey(fullConfig));
      if (cached) {
        return cached;
      }
    }

    // Add to request queue
    return this.requestQueue.add(() => this.executeRequest<T>(fullConfig));
  }

  // HTTP method shortcuts
  async get<T>(
    url: string,
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'GET' });
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'POST', data });
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'PUT', data });
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'PATCH', data });
  }

  async delete<T>(
    url: string,
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'DELETE' });
  }

  // Paginated requests
  async getAllPages<T>(
    url: string,
    config?: Partial<RequestConfig>
  ): Promise<T[]> {
    const allData: T[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await this.get<PaginatedResponse<T>>(url, {
        ...config,
        params: { ...config?.params, page, pageSize: 50 },
      });

      allData.push(...response.data.data);
      hasMore = response.data.pagination.hasNext;
      page++;
    }

    return allData;
  }

  // Upload file
  async uploadFile<T>(
    url: string,
    file: File | Blob,
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    if (config?.data && typeof config.data === 'object') {
      Object.entries(config.data as Record<string, unknown>).forEach(
        ([key, value]) => {
          formData.append(key, String(value));
        }
      );
    }

    return this.request<T>({
      ...config,
      url,
      method: 'POST',
      data: formData,
      headers: {
        ...config?.headers,
        // Remove Content-Type to let browser set it with boundary
      },
    });
  }

  // Cancel request
  cancelRequest(requestId: string): void {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
    }
  }

  // Cancel all requests
  cancelAllRequests(): void {
    this.abortControllers.forEach((controller) => controller.abort());
    this.abortControllers.clear();
    this.requestQueue.clear();
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Get client stats
  getStats() {
    return {
      queue: this.requestQueue.stats,
      cache: {
        size: this.cache.size,
        maxSize: this.config.cache?.maxSize || 0,
      },
      activeRequests: this.abortControllers.size,
    };
  }

  private async executeRequest<T>(
    config: RequestConfig
  ): Promise<ApiResponse<T>> {
    const url = this.buildURL(config.url, config.params);
    const headers = { ...this.config.headers, ...config.headers };

    // Remove Content-Type header for FormData
    if (config.data instanceof FormData) {
      delete headers['Content-Type'];
    }

    const requestId = this.generateRequestId();
    const abortController = new AbortController();
    this.abortControllers.set(requestId, abortController);

    try {
      // Apply request interceptor
      if (this.config.interceptors?.request) {
        config = await this.config.interceptors.request(config);
      }

      const fetchOptions: RequestInit = {
        method: config.method,
        headers,
        signal: config.signal || abortController.signal,
        body: config.data
          ? config.data instanceof FormData
            ? config.data
            : JSON.stringify(config.data)
          : undefined,
      };

      const response = await this.retryRequest(
        () => fetch(url, fetchOptions),
        config.retries || this.config.retries!
      );

      if (!response.ok) {
        throw await this.createApiError(response, config);
      }

      const responseHeaders = this.parseHeaders(response.headers);
      const data = await this.parseResponse<T>(response);

      const apiResponse: ApiResponse<T> = {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        config,
      };

      // Apply response interceptor
      if (this.config.interceptors?.response) {
        return (await this.config.interceptors.response(
          apiResponse
        )) as ApiResponse<T>;
      }

      // Cache GET requests
      if (
        config.method === 'GET' &&
        config.cache !== false &&
        this.config.cache?.enabled
      ) {
        this.setCache(this.getCacheKey(config), apiResponse);
      }

      return apiResponse;
    } catch (error) {
      // Apply error interceptor
      if (this.config.interceptors?.error) {
        throw await this.config.interceptors.error(error as ApiError);
      }
      throw error;
    } finally {
      this.abortControllers.delete(requestId);
    }
  }

  private async retryRequest<T>(
    request: () => Promise<T>,
    retries: number
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await request();
      } catch (error) {
        lastError = error as Error;

        if (attempt === retries || !this.isRetryableError(error as Error)) {
          break;
        }

        // Wait before retry with exponential backoff
        const delay = this.config.retryDelay! * Math.pow(2, attempt);
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  private async createApiError(
    response: Response,
    config: RequestConfig
  ): Promise<ApiError> {
    let data: unknown;
    try {
      data = await response.json();
    } catch {
      data = await response.text();
    }

    const error = new Error(
      `Request failed with status ${response.status}: ${response.statusText}`
    ) as ApiError;

    error.response = {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: this.parseHeaders(response.headers),
    };
    error.request = config;
    error.isNetworkError = false;
    error.isTimeoutError = false;
    error.isRetryableError = this.isRetryableStatus(response.status);

    return error;
  }

  private isRetryableError(error: Error): boolean {
    if ('name' in error && error.name === 'AbortError') return false;
    if ('response' in error) {
      const status = (error as ApiError).response?.status;
      return this.isRetryableStatus(status);
    }
    return true; // Network errors are retryable
  }

  private isRetryableStatus(status?: number): boolean {
    if (!status) return true;
    return status >= 500 || status === 408 || status === 429;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private mergeConfig(config: RequestConfig): RequestConfig {
    return {
      timeout: this.config.timeout,
      retries: this.config.retries,
      cache: true,
      ...config,
      headers: { ...this.config.headers, ...config.headers },
    };
  }

  private buildURL(
    url: string,
    params?: Record<string, string | number | boolean>
  ): string {
    const fullURL = url.startsWith('http')
      ? url
      : `${this.config.baseURL}${url}`;

    if (!params) return fullURL;

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });

    return `${fullURL}?${searchParams.toString()}`;
  }

  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      return await response.json();
    }

    if (contentType?.includes('text/')) {
      return (await response.text()) as unknown as T;
    }

    return (await response.blob()) as unknown as T;
  }

  private parseHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  private getCacheKey(config: RequestConfig): string {
    const url = this.buildURL(config.url, config.params);
    return `${config.method}:${url}`;
  }

  private getFromCache<T>(key: string): ApiResponse<T> | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as ApiResponse<T>;
  }

  private setCache<T>(key: string, data: ApiResponse<T>): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.config.cache!.maxSize!) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: this.config.cache!.ttl!,
    });
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Factory function for creating configured API clients
export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config);
}

// Pre-configured client for the main API
export const apiClient = createApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 10000,
  retries: 3,
  retryDelay: 1000,
  interceptors: {
    request: async (config) => {
      // Add auth token
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('auth_token')
          : null;
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }

      // Add CSRF token
      const csrfToken =
        typeof window !== 'undefined'
          ? document
              .querySelector('meta[name="csrf-token"]')
              ?.getAttribute('content')
          : null;
      if (csrfToken) {
        config.headers = {
          ...config.headers,
          'X-CSRF-Token': csrfToken,
        };
      }

      return config;
    },
    response: async (response) => {
      // Handle token refresh
      if (response.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
      return response;
    },
    error: async (error) => {
      // Log errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('API Error:', error);
      }

      // Report errors to monitoring service
      if (
        process.env.NODE_ENV === 'production' &&
        error.response?.status &&
        error.response.status >= 500
      ) {
        // Send to error reporting service
      }

      throw error;
    },
  },
});

export default apiClient;
