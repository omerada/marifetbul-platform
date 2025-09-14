/**
 * Base Repository
 * Provides common functionality for all repositories including caching, error handling, and request management
 */

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface RequestConfig {
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  signal?: AbortSignal;
  timeout?: number;
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in milliseconds
  key?: string;
}

export interface RequestOptions {
  cache?: CacheConfig;
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

export class RepositoryError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errors?: string[]
  ) {
    super(message);
    this.name = 'RepositoryError';
  }
}

export abstract class BaseRepository {
  protected baseUrl: string;
  private cache = new Map<string, { data: unknown; expires: number }>();
  private requestQueue = new Map<string, Promise<unknown>>();

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Make HTTP request with caching, retry logic, and error handling
   */
  protected async request<T>(
    endpoint: string,
    config: RequestConfig = { method: 'GET' },
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const cacheKey = this.generateCacheKey(url, config);

    // Check cache if enabled
    if (options.cache?.enabled && config.method === 'GET') {
      const cached = this.getFromCache<T>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Check if request is already in flight
    if (this.requestQueue.has(cacheKey)) {
      return this.requestQueue.get(cacheKey) as Promise<ApiResponse<T>>;
    }

    // Create request promise
    const requestPromise = this.executeRequest<T>(url, config, options);
    this.requestQueue.set(cacheKey, requestPromise);

    try {
      const response = await requestPromise;

      // Cache successful GET responses
      if (
        options.cache?.enabled &&
        config.method === 'GET' &&
        response.success
      ) {
        this.setCache(cacheKey, response, options.cache.ttl);
      }

      return response;
    } finally {
      this.requestQueue.delete(cacheKey);
    }
  }

  /**
   * Execute HTTP request with retry logic
   */
  private async executeRequest<T>(
    url: string,
    config: RequestConfig,
    options: RequestOptions
  ): Promise<ApiResponse<T>> {
    const retries = options.retries ?? 3;
    const retryDelay = options.retryDelay ?? 1000;
    const timeout = options.timeout ?? 10000;

    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        // Add authentication headers
        const headers = await this.addAuthHeaders(config.headers || {});

        const response = await fetch(url, {
          ...config,
          headers,
          body: config.body ? JSON.stringify(config.body) : undefined,
          signal: config.signal || controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new RepositoryError(
            errorData.message || `HTTP ${response.status}`,
            response.status,
            errorData.errors
          );
        }

        const data = await response.json();
        return data;
      } catch (error) {
        lastError = error as Error;

        // Don't retry on client errors (4xx) or abort
        if (
          error instanceof RepositoryError &&
          error.statusCode &&
          error.statusCode >= 400 &&
          error.statusCode < 500
        ) {
          throw error;
        }

        if ((error as Error).name === 'AbortError') {
          throw new RepositoryError('Request timeout');
        }

        // Wait before retry (except last attempt)
        if (attempt < retries) {
          await new Promise((resolve) =>
            setTimeout(resolve, retryDelay * (attempt + 1))
          );
        }
      }
    }

    throw lastError!;
  }

  /**
   * Add authentication headers
   */
  private async addAuthHeaders(
    headers: Record<string, string>
  ): Promise<Record<string, string>> {
    const finalHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Add auth token if available and not already set
    if (!finalHeaders['Authorization'] && typeof window !== 'undefined') {
      try {
        const authData =
          typeof window !== 'undefined'
            ? localStorage.getItem('marifeto-auth')
            : null;
        if (authData) {
          const parsed = JSON.parse(authData);
          if (parsed.state?.token) {
            finalHeaders['Authorization'] = `Bearer ${parsed.state.token}`;
          }
        }
      } catch (error) {
        console.warn('Failed to parse auth data:', error);
      }
    }

    return finalHeaders;
  }

  /**
   * GET request helper
   */
  protected async get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const url = params
      ? `${endpoint}?${new URLSearchParams(
          Object.entries(params).map(([k, v]) => [k, String(v)])
        )}`
      : endpoint;

    return this.request<T>(url, { method: 'GET' }, options);
  }

  /**
   * POST request helper
   */
  protected async post<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body }, options);
  }

  /**
   * PUT request helper
   */
  protected async put<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body }, options);
  }

  /**
   * DELETE request helper
   */
  protected async delete<T>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' }, options);
  }

  /**
   * PATCH request helper
   */
  protected async patch<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body }, options);
  }

  /**
   * Generate cache key for request
   */
  private generateCacheKey(url: string, config: RequestConfig): string {
    const bodyStr = config.body ? JSON.stringify(config.body) : '';
    const headersStr = JSON.stringify(config.headers || {});
    return `${config.method}:${url}:${bodyStr}:${headersStr}`;
  }

  /**
   * Get data from cache
   */
  private getFromCache<T>(key: string): ApiResponse<T> | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.expires) {
      return cached.data as ApiResponse<T>;
    }

    if (cached) {
      this.cache.delete(key);
    }

    return null;
  }

  /**
   * Set data in cache
   */
  private setCache(key: string, data: unknown, ttl: number): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl,
    });
  }

  /**
   * Clear cache
   */
  protected clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  /**
   * Public method to clear cache
   */
  public clearRepositoryCache(pattern?: string): void {
    this.clearCache(pattern);
  }

  /**
   * Get cache stats
   */
  protected getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Public method to get cache stats
   */
  public getRepositoryCacheStats(): { size: number; keys: string[] } {
    return this.getCacheStats();
  }
}
