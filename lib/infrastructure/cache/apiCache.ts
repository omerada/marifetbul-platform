/**
 * API Response Caching System
 * Implements intelligent caching for API responses
 * - Time-based expiration
 * - Memory management
 * - Request deduplication
 * - Cache invalidation
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheConfig {
  ttl?: number; // Time to live in milliseconds (default: 5 minutes)
  maxSize?: number; // Maximum cache size (default: 100 entries)
  enabled?: boolean; // Enable/disable caching (default: true)
}

interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

type CacheParams = Record<string, unknown>;

class ApiCacheManager {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private pendingRequests: Map<string, PendingRequest<unknown>> = new Map();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes
  private maxSize = 100;
  private enabled = true;

  constructor(config?: CacheConfig) {
    if (config?.ttl) this.defaultTTL = config.ttl;
    if (config?.maxSize) this.maxSize = config.maxSize;
    if (config?.enabled !== undefined) this.enabled = config.enabled;
  }

  /**
   * Generate cache key from URL and params
   */
  private generateKey(url: string, params?: CacheParams): string {
    const paramsString = params ? JSON.stringify(params) : '';
    return `${url}:${paramsString}`;
  }

  /**
   * Check if cache entry is still valid
   */
  private isValid(entry: CacheEntry<unknown>): boolean {
    return Date.now() < entry.expiresAt;
  }

  /**
   * Clean expired entries
   */
  private cleanExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now >= entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Enforce max cache size by removing oldest entries
   */
  private enforceMaxSize(): void {
    if (this.cache.size <= this.maxSize) return;

    const entries = Array.from(this.cache.entries()).sort(
      (a, b) => a[1].timestamp - b[1].timestamp
    );

    const toRemove = entries.slice(0, this.cache.size - this.maxSize);
    toRemove.forEach(([key]) => this.cache.delete(key));
  }

  /**
   * Get cached data if available and valid
   */
  get<T>(url: string, params?: CacheParams): T | null {
    if (!this.enabled) return null;

    const key = this.generateKey(url, params);
    const entry = this.cache.get(key);

    if (!entry) return null;

    if (!this.isValid(entry)) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set data in cache
   */
  set<T>(url: string, data: T, params?: CacheParams, ttl?: number): void {
    if (!this.enabled) return;

    const key = this.generateKey(url, params);
    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt,
    });

    this.cleanExpired();
    this.enforceMaxSize();
  }

  /**
   * Invalidate specific cache entry
   */
  invalidate(url: string, params?: CacheParams): void {
    const key = this.generateKey(url, params);
    this.cache.delete(key);
  }

  /**
   * Invalidate all cache entries matching a pattern
   */
  invalidatePattern(pattern: string | RegExp): void {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      enabled: this.enabled,
      pendingRequests: this.pendingRequests.size,
    };
  }

  /**
   * Request deduplication - prevents duplicate in-flight requests
   */
  async deduplicate<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    // Check if there's already a pending request
    const pending = this.pendingRequests.get(key);
    if (pending) {
      return pending.promise as Promise<T>;
    }

    // Create new request
    const promise = fetcher().finally(() => {
      // Clean up after request completes
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now(),
    });

    return promise;
  }

  /**
   * Cached fetch with deduplication
   */
  async fetch<T>(
    url: string,
    fetcher: () => Promise<T>,
    options?: {
      params?: CacheParams;
      ttl?: number;
      forceRefresh?: boolean;
    }
  ): Promise<T> {
    const { params, ttl, forceRefresh = false } = options || {};

    // Check cache first
    if (!forceRefresh) {
      const cached = this.get<T>(url, params);
      if (cached) {
        return cached;
      }
    }

    // Deduplicate request
    const key = this.generateKey(url, params);
    const data = await this.deduplicate(key, fetcher);

    // Store in cache
    this.set(url, data, params, ttl);

    return data;
  }
}

// Singleton instance
export const apiCache = new ApiCacheManager({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 100,
  enabled: true,
});

// Cache configuration presets
export const CachePresets = {
  SHORT: 1 * 60 * 1000, // 1 minute
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 15 * 60 * 1000, // 15 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 hour
  NO_CACHE: 0,
} as const;

// Cache tags for invalidation
export const CacheTags = {
  JOBS: '/jobs',
  PACKAGES: '/packages',
  USERS: '/users',
  MESSAGES: '/messages',
  NOTIFICATIONS: '/notifications',
  PAYMENTS: '/payments',
  CATEGORIES: '/categories',
} as const;

// Helper functions
export const invalidateJobsCache = () => {
  apiCache.invalidatePattern(CacheTags.JOBS);
};

export const invalidatePackagesCache = () => {
  apiCache.invalidatePattern(CacheTags.PACKAGES);
};

export const invalidateUserCache = (userId?: string) => {
  if (userId) {
    apiCache.invalidate(`${CacheTags.USERS}/${userId}`);
  } else {
    apiCache.invalidatePattern(CacheTags.USERS);
  }
};

export const clearAllCache = () => {
  apiCache.clear();
};

export default apiCache;
