'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { logger } from '@/lib/shared/utils/logger';

export interface UseInfiniteScrollOptions<T> {
  initialData?: T[];
  pageSize?: number;
  fetchPage: (
    page: number,
    pageSize: number
  ) => Promise<{
    data: T[];
    hasMore: boolean;
    total?: number;
  }>;
  enabled?: boolean;
}

export interface UseInfiniteScrollResult<T> {
  data: T[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  observerRef: (node: HTMLElement | null) => void;
}

/**
 * Custom hook for infinite scroll pagination
 *
 * Features:
 * - Intersection Observer API for auto-loading
 * - Manual load more support
 * - Refresh functionality
 * - Loading states (initial, load more)
 * - Error handling
 *
 * @example
 * ```tsx
 * const { data, isLoading, observerRef } = useInfiniteScroll({
 *   fetchPage: async (page, pageSize) => {
 *     const response = await fetch(`/api/items?page=${page}&size=${pageSize}`);
 *     return await response.json();
 *   },
 *   pageSize: 20,
 * });
 *
 * return (
 *   <div>
 *     {data.map(item => <Item key={item.id} data={item} />)}
 *     <div ref={observerRef}>Loading...</div>
 *   </div>
 * );
 * ```
 */
export function useInfiniteScroll<T>({
  initialData = [],
  pageSize = 20,
  fetchPage,
  enabled = true,
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollResult<T> {
  const [data, setData] = useState<T[]>(initialData);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const observerTarget = useRef<HTMLElement | null>(null);
  const isInitialMount = useRef(true);

  /**
   * Load next page of data
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || !enabled) return;

    try {
      setIsLoadingMore(true);
      setError(null);

      const nextPage = page + 1;
      const result = await fetchPage(nextPage, pageSize);

      setData((prev) => [...prev, ...result.data]);
      setPage(nextPage);
      setHasMore(result.hasMore);

      logger.debug('useInfiniteScroll: Loaded page', {
        page: nextPage,
        itemsLoaded: result.data.length,
        hasMore: result.hasMore,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load more data';
      setError(errorMessage);
      logger.error(
        'useInfiniteScroll: Error loading more',
        err instanceof Error ? err : undefined,
        {
          page,
          pageSize,
        }
      );
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, pageSize, hasMore, isLoadingMore, enabled, fetchPage]);

  /**
   * Refresh data from beginning
   */
  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setPage(0);

      const result = await fetchPage(0, pageSize);

      setData(result.data);
      setHasMore(result.hasMore);

      logger.debug('useInfiniteScroll: Refreshed data', {
        itemsLoaded: result.data.length,
        hasMore: result.hasMore,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to refresh data';
      setError(errorMessage);
      logger.error(
        'useInfiniteScroll: Error refreshing',
        err instanceof Error ? err : undefined,
        {
          pageSize,
        }
      );
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, fetchPage]);

  /**
   * Setup Intersection Observer for auto-loading
   */
  useEffect(() => {
    if (!enabled || !hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: '100px', // Start loading 100px before reaching the bottom
        threshold: 0.1,
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [enabled, hasMore, isLoadingMore, loadMore]);

  /**
   * Initial data load
   */
  useEffect(() => {
    if (isInitialMount.current && enabled) {
      isInitialMount.current = false;
      refresh();
    }
  }, [enabled, refresh]);

  /**
   * Ref callback for the observer target element
   */
  const observerRef = useCallback((node: HTMLElement | null) => {
    observerTarget.current = node;
  }, []);

  return {
    data,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refresh,
    observerRef,
  };
}
