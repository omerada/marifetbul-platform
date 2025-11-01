/**
 * ================================================
 * USE FOLLOWING LIST HOOK
 * ================================================
 * Custom hook for fetching and managing following list
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-10-26
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { followApi } from '@/lib/api/follow';
import type { User } from '@/types/core/base';
import type { PaginationMeta } from '@/types';
import { transformUserResponses } from '@/lib/transformers/user.transformer';
import { logger } from '@/lib/shared/utils/logger';

interface UseFollowingListOptions {
  userId: string;
  pageSize?: number;
  enabled?: boolean;
}

interface UseFollowingListReturn {
  following: User[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching following list with pagination
 *
 * @example
 * ```tsx
 * const { following, isLoading, loadMore, hasMore } = useFollowingList({
 *   userId: '123',
 *   pageSize: 20
 * });
 * ```
 */
export function useFollowingList({
  userId,
  pageSize = 20,
  enabled = true,
}: UseFollowingListOptions): UseFollowingListReturn {
  const [following, setFollowing] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  // Fetch following list
  const fetchFollowing = useCallback(
    async (page: number, append = false) => {
      if (!userId || !enabled) return;

      try {
        setIsLoading(true);
        setError(null);

        const response = await followApi.getFollowing(userId, page, pageSize);

        // Transform backend users to frontend User type
        const transformedUsers = transformUserResponses(response.data);

        if (append) {
          setFollowing((prev) => [...prev, ...transformedUsers]);
        } else {
          setFollowing(transformedUsers);
        }

        setPagination(response.pagination);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load following';
        setError(errorMessage);
        logger.error('Error fetching following:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [userId, pageSize, enabled]
  );

  // Initial load
  useEffect(() => {
    if (enabled) {
      fetchFollowing(0, false);
    }
  }, [enabled, fetchFollowing]);

  // Load more (next page)
  const loadMore = useCallback(async () => {
    if (!pagination?.hasNext || isLoading) return;

    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    await fetchFollowing(nextPage, true);
  }, [pagination, currentPage, isLoading, fetchFollowing]);

  // Refetch (reset to first page)
  const refetch = useCallback(async () => {
    setCurrentPage(0);
    await fetchFollowing(0, false);
  }, [fetchFollowing]);

  const hasMore = pagination?.hasNext ?? false;

  return {
    following,
    pagination,
    isLoading,
    error,
    hasMore,
    loadMore,
    refetch,
  };
}
