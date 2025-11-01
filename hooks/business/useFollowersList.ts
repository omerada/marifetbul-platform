/**
 * ================================================
 * USE FOLLOWERS LIST HOOK
 * ================================================
 * Custom hook for fetching and managing followers list
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

interface UseFollowersListOptions {
  userId: string;
  pageSize?: number;
  enabled?: boolean;
}

interface UseFollowersListReturn {
  followers: User[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching followers list with pagination
 *
 * @example
 * ```tsx
 * const { followers, isLoading, loadMore, hasMore } = useFollowersList({
 *   userId: '123',
 *   pageSize: 20
 * });
 * ```
 */
export function useFollowersList({
  userId,
  pageSize = 20,
  enabled = true,
}: UseFollowersListOptions): UseFollowersListReturn {
  const [followers, setFollowers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  // Fetch followers
  const fetchFollowers = useCallback(
    async (page: number, append = false) => {
      if (!userId || !enabled) return;

      try {
        setIsLoading(true);
        setError(null);

        const response = await followApi.getFollowers(userId, page, pageSize);

        // Transform backend users to frontend User type
        const transformedUsers = transformUserResponses(response.data);

        if (append) {
          setFollowers((prev) => [...prev, ...transformedUsers]);
        } else {
          setFollowers(transformedUsers);
        }

        setPagination(response.pagination);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load followers';
        setError(errorMessage);
        logger.error('Error fetching followers:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [userId, pageSize, enabled]
  );

  // Initial load
  useEffect(() => {
    if (enabled) {
      fetchFollowers(0, false);
    }
  }, [enabled, fetchFollowers]);

  // Load more (next page)
  const loadMore = useCallback(async () => {
    if (!pagination?.hasNext || isLoading) return;

    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    await fetchFollowers(nextPage, true);
  }, [pagination, currentPage, isLoading, fetchFollowers]);

  // Refetch (reset to first page)
  const refetch = useCallback(async () => {
    setCurrentPage(0);
    await fetchFollowers(0, false);
  }, [fetchFollowers]);

  const hasMore = pagination?.hasNext ?? false;

  return {
    followers,
    pagination,
    isLoading,
    error,
    hasMore,
    loadMore,
    refetch,
  };
}
