'use client';

/**
 * ================================================
 * USE FOLLOW HOOK
 * ================================================
 * Custom hook for managing follow/unfollow state
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-10-26
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { followApi } from '@/lib/api/follow';
import type { FollowStatusResponse } from '@/types/core/base';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/shared/useAuth';
import logger from '@/lib/infrastructure/monitoring/logger';

interface UseFollowOptions {
  userId: string;
  onFollowChange?: (isFollowing: boolean) => void;
}

interface UseFollowReturn {
  isFollowing: boolean;
  followerCount: number;
  followingCount: number;
  isMutualFollow: boolean;
  isLoading: boolean;
  error: string | null;
  toggleFollow: () => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Hook for managing follow/unfollow functionality
 *
 * @example
 * ```tsx
 * const { isFollowing, followerCount, toggleFollow } = useFollow({
 *   userId: '123',
 *   onFollowChange: (following) => logger.debug('Follow changed:', following)
 * });
 * ```
 */
export function useFollow({
  userId,
  onFollowChange,
}: UseFollowOptions): UseFollowReturn {
  const { user: currentUser, isAuthenticated } = useAuth();
  const [followStatus, setFollowStatus] = useState<FollowStatusResponse>({
    isFollowing: false,
    followerCount: 0,
    followingCount: 0,
    isMutualFollow: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial follow status
  const fetchFollowStatus = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);
      const status = await followApi.getFollowStatus(userId);
      setFollowStatus(status);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load follow status';
      setError(errorMessage);
      logger.error('Error fetching follow status:', err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Load follow status on mount
  useEffect(() => {
    fetchFollowStatus();
  }, [fetchFollowStatus]);

  // Toggle follow/unfollow
  const toggleFollow = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error('Lütfen giriş yapın');
      return;
    }

    if (!userId) {
      toast.error('Geçersiz kullanıcı');
      return;
    }

    // Check if trying to follow self
    if (currentUser?.id === userId) {
      toast.error('Kendinizi takip edemezsiniz');
      return;
    }

    const previousStatus = { ...followStatus };

    // Optimistic update
    setFollowStatus((prev) => ({
      ...prev,
      isFollowing: !prev.isFollowing,
      followerCount: prev.isFollowing
        ? Math.max(0, prev.followerCount - 1)
        : prev.followerCount + 1,
    }));

    try {
      setIsLoading(true);
      setError(null);

      const newStatus = await followApi.toggleFollow(userId);
      setFollowStatus(newStatus);

      // Show success toast
      toast.success(
        newStatus.isFollowing ? 'Kullanıcı takip edildi' : 'Takip bırakıldı'
      );

      // Call callback if provided
      onFollowChange?.(newStatus.isFollowing);
    } catch (err) {
      // Revert optimistic update on error
      setFollowStatus(previousStatus);

      const errorMessage =
        err instanceof Error ? err.message : 'İşlem başarısız';
      setError(errorMessage);
      toast.error(errorMessage);
      logger.error('Error toggling follow:', err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, userId, currentUser?.id, followStatus, onFollowChange]);

  return {
    isFollowing: followStatus.isFollowing,
    followerCount: followStatus.followerCount,
    followingCount: followStatus.followingCount,
    isMutualFollow: followStatus.isMutualFollow,
    isLoading,
    error,
    toggleFollow,
    refetch: fetchFollowStatus,
  };
}
