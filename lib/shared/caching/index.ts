// Production-ready caching system with multiple strategies
export interface CacheConfig {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items
  strategy?: 'lru' | 'lfu' | 'fifo';
  persistent?: boolean; // Use localStorage for persistence
  namespace?: string; // Cache namespace
}

export interface CacheItem<T> {
  value: T;
  timestamp: number;
  ttl: number;
  hits: number;
  lastAccessed: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

// Base cache interface
export interface ICache<T> {
  get(key: string): T | null;
  set(key: string, value: T, ttl?: number): void;
  delete(key: string): boolean;
  clear(): void;
  has(key: string): boolean;
  keys(): string[];
  size(): number;
  stats(): CacheStats;
}

// In-memory cache with multiple eviction strategies
export class MemoryCache<T> implements ICache<T> {
  private cache = new Map<string, CacheItem<T>>();
  private accessOrder: string[] = []; // For LRU
  private cacheStats = { hits: 0, misses: 0 };

  constructor(private config: CacheConfig = {}) {
    this.config = {
      ttl: 5 * 60 * 1000, // 5 minutes default
      maxSize: 1000,
      strategy: 'lru',
      persistent: false,
      namespace: 'default',
      ...config,
    };

    if (this.config.persistent) {
      this.loadFromPersistent();
    }

    // Cleanup expired items periodically
    setInterval(() => this.cleanup(), 60000); // Every minute
  }

  get(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      this.cacheStats.misses++;
      return null;
    }

    // Check if expired
    if (this.isExpired(item)) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      this.cacheStats.misses++;
      return null;
    }

    // Update access statistics
    item.hits++;
    item.lastAccessed = Date.now();
    this.updateAccessOrder(key);
    this.cacheStats.hits++;

    return item.value;
  }

  set(key: string, value: T, ttl?: number): void {
    const now = Date.now();
    const itemTtl = ttl || this.config.ttl!;

    const item: CacheItem<T> = {
      value,
      timestamp: now,
      ttl: itemTtl,
      hits: 0,
      lastAccessed: now,
    };

    // Remove existing item if it exists
    if (this.cache.has(key)) {
      this.removeFromAccessOrder(key);
    }

    // Check if we need to evict items
    if (this.cache.size >= this.config.maxSize!) {
      this.evict();
    }

    this.cache.set(key, item);
    this.updateAccessOrder(key);

    if (this.config.persistent) {
      this.saveToPersistent();
    }
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.removeFromAccessOrder(key);
      if (this.config.persistent) {
        this.saveToPersistent();
      }
    }
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.cacheStats = { hits: 0, misses: 0 };

    if (this.config.persistent) {
      this.clearPersistent();
    }
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    return item ? !this.isExpired(item) : false;
  }

  keys(): string[] {
    this.cleanup();
    return Array.from(this.cache.keys());
  }

  size(): number {
    this.cleanup();
    return this.cache.size;
  }

  stats(): CacheStats {
    return {
      ...this.cacheStats,
      size: this.cache.size,
      hitRate:
        this.cacheStats.hits /
          (this.cacheStats.hits + this.cacheStats.misses) || 0,
    };
  }

  private isExpired(item: CacheItem<T>): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
    });

    if (keysToDelete.length > 0 && this.config.persistent) {
      this.saveToPersistent();
    }
  }

  private evict(): void {
    if (this.cache.size === 0) return;

    let keyToEvict: string;

    switch (this.config.strategy) {
      case 'lru':
        keyToEvict = this.accessOrder[0];
        break;
      case 'lfu':
        keyToEvict = this.getLFUKey();
        break;
      case 'fifo':
      default:
        const firstKey = this.cache.keys().next().value;
        keyToEvict = firstKey || '';
        break;
    }

    this.delete(keyToEvict);
  }

  private getLFUKey(): string {
    let minHits = Infinity;
    let keyToEvict = '';

    for (const [key, item] of this.cache.entries()) {
      if (item.hits < minHits) {
        minHits = item.hits;
        keyToEvict = key;
      }
    }

    return keyToEvict;
  }

  private updateAccessOrder(key: string): void {
    if (this.config.strategy === 'lru') {
      this.removeFromAccessOrder(key);
      this.accessOrder.push(key);
    }
  }

  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  private loadFromPersistent(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(`cache:${this.config.namespace}`);
      if (stored) {
        const data = JSON.parse(stored);
        const now = Date.now();

        for (const [key, item] of Object.entries(data.cache || {})) {
          const cacheItem = item as CacheItem<T>;
          if (now - cacheItem.timestamp < cacheItem.ttl) {
            this.cache.set(key, cacheItem);
          }
        }

        this.accessOrder = data.accessOrder || [];
        this.cacheStats = data.stats || { hits: 0, misses: 0 };
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
    }
  }

  private saveToPersistent(): void {
    if (typeof window === 'undefined') return;

    try {
      const data = {
        cache: Object.fromEntries(this.cache.entries()),
        accessOrder: this.accessOrder,
        stats: this.cacheStats,
      };

      localStorage.setItem(
        `cache:${this.config.namespace}`,
        JSON.stringify(data)
      );
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error);
    }
  }

  private clearPersistent(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(`cache:${this.config.namespace}`);
    } catch (error) {
      console.warn('Failed to clear cache from localStorage:', error);
    }
  }
}

// Query cache for API responses
export class QueryCache<T> extends MemoryCache<T> {
  private pendingQueries = new Map<string, Promise<T>>();

  constructor(config: CacheConfig = {}) {
    super({
      ttl: 5 * 60 * 1000, // 5 minutes for API responses
      maxSize: 500,
      ...config,
    });
  }

  async fetch(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Check cache first
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    // Check if query is already pending
    const pending = this.pendingQueries.get(key);
    if (pending) {
      return pending;
    }

    // Start new query
    const queryPromise = fetcher()
      .then((result) => {
        this.set(key, result, ttl);
        this.pendingQueries.delete(key);
        return result;
      })
      .catch((error) => {
        this.pendingQueries.delete(key);
        throw error;
      });

    this.pendingQueries.set(key, queryPromise);
    return queryPromise;
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.clear();
      return;
    }

    const regex = new RegExp(pattern);
    const keysToDelete = this.keys().filter((key) => regex.test(key));

    keysToDelete.forEach((key) => this.delete(key));
  }

  prefetch(key: string, fetcher: () => Promise<T>, ttl?: number): void {
    if (!this.has(key)) {
      this.fetch(key, fetcher, ttl).catch(() => {
        // Ignore prefetch errors
      });
    }
  }
}

// React hooks for caching
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo as reactUseMemo,
} from 'react';

// Global cache instances
const queryCache = new QueryCache();
const componentCache = new MemoryCache({ maxSize: 200, ttl: 60000 }); // 1 minute for components

export function useCache<T>(config?: CacheConfig): ICache<T> {
  return reactUseMemo(() => new MemoryCache<T>(config), [config]);
}

export function useQuery<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number;
    enabled?: boolean;
    staleTime?: number;
    refetchOnMount?: boolean;
  } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetched, setLastFetched] = useState<number>(0);

  const { enabled = true, staleTime = 0, refetchOnMount = true } = options;

  const fetchData = useCallback(async () => {
    if (!key || !enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await queryCache.fetch(key, fetcher, options.ttl);
      setData(result as T);
      setLastFetched(Date.now());
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, enabled, options.ttl]);

  // Initial fetch
  useEffect(() => {
    if (!key || !enabled) return;

    // Check if we have cached data
    const cached = queryCache.get(key);
    if (cached !== null) {
      setData(cached as T);

      // Check if data is stale
      const isStale = staleTime > 0 && Date.now() - lastFetched > staleTime;
      if (!isStale && !refetchOnMount) {
        return;
      }
    }

    fetchData();
  }, [key, enabled, fetchData, staleTime, lastFetched, refetchOnMount]);

  const invalidate = useCallback(() => {
    if (key) {
      queryCache.delete(key);
      fetchData();
    }
  }, [key, fetchData]);

  const mutate = useCallback(
    (newData: T) => {
      if (key) {
        queryCache.set(key, newData, options.ttl);
        setData(newData);
      }
    },
    [key, options.ttl]
  );

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    invalidate,
    mutate,
  };
}

export function useMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  cacheKey?: string
): T {
  const memoRef = useRef<{ value: T; deps: React.DependencyList }>();

  return reactUseMemo(() => {
    // If we have a cache key, try to get from component cache
    if (cacheKey) {
      const cached = componentCache.get(cacheKey);
      if (cached !== null) {
        return cached as T;
      }
    }

    // Check if deps have changed
    if (
      memoRef.current &&
      memoRef.current.deps.length === deps.length &&
      memoRef.current.deps.every((dep, index) => Object.is(dep, deps[index]))
    ) {
      return memoRef.current.value;
    }

    // Compute new value
    const value = factory();
    memoRef.current = { value, deps };

    // Cache if key provided
    if (cacheKey) {
      componentCache.set(cacheKey, value as unknown);
    }

    return value;
  }, [factory, ...deps, cacheKey]);
}

// Cache invalidation utilities
export class CacheInvalidation {
  private static patterns = new Map<string, RegExp>();

  static invalidatePattern(pattern: string): void {
    queryCache.invalidate(pattern);
  }

  static invalidateByTags(tags: string[]): void {
    tags.forEach((tag) => {
      this.invalidatePattern(`.*:${tag}:.*`);
    });
  }

  static invalidateUser(userId: string): void {
    this.invalidatePattern(`.*user:${userId}.*`);
  }

  static invalidateResource(resource: string, id?: string): void {
    if (id) {
      this.invalidatePattern(`${resource}:${id}.*`);
    } else {
      this.invalidatePattern(`${resource}:.*`);
    }
  }
}

// Cache warming utilities
export class CacheWarming {
  static warmCommonQueries(): void {
    // Warm up commonly accessed data
    queryCache.prefetch('user:profile', async () => {
      // Fetch user profile
      return fetch('/api/user/profile').then((r) => r.json());
    });

    queryCache.prefetch('categories', async () => {
      // Fetch categories
      return fetch('/api/categories').then((r) => r.json());
    });
  }

  static warmUserData(userId: string): void {
    const queries = [
      { key: `user:${userId}:profile`, endpoint: `/api/users/${userId}` },
      { key: `user:${userId}:stats`, endpoint: `/api/users/${userId}/stats` },
      {
        key: `user:${userId}:recent-jobs`,
        endpoint: `/api/users/${userId}/jobs?recent=true`,
      },
    ];

    queries.forEach(({ key, endpoint }) => {
      queryCache.prefetch(key, async () => {
        return fetch(endpoint).then((r) => r.json());
      });
    });
  }
}

export { queryCache, componentCache };

const CachingSystem = {
  MemoryCache,
  QueryCache,
  useCache,
  useQuery,
  useMemo,
  CacheInvalidation,
  CacheWarming,
  queryCache,
  componentCache,
};

export default CachingSystem;
