'use client';

/**
 * Profile Completion Hook
 * Sprint 1 - Story 1.1: Profile Completion System
 *
 * Production-ready hook for fetching and managing profile completion status
 * Replaces duplicate useProfileValidation implementations
 *
 * @version 1.0.0
 * @since 2025-11-25
 */

import useSWR from 'swr';
import { toast } from 'sonner';
import {
  getMyProfileCompletion,
  getUserProfileCompletion,
} from '@/lib/api/profile-completion';
import { useAuthStore } from '@/lib/core/store/domains/auth/unifiedAuthStore';
import logger from '@/lib/infrastructure/monitoring/logger';
import type { ProfileCompletionData } from '@/types/profile-completion';

export interface UseProfileCompletionReturn {
  /** Profile completion data */
  completion: ProfileCompletionData | undefined;

  /** Loading state */
  isLoading: boolean;

  /** Error state */
  error: Error | undefined;

  /** Manually refresh completion data */
  refresh: () => Promise<void>;

  /** Check if profile is complete (>= 90%) */
  isComplete: boolean;

  /** Check if profile needs attention (< 70%) */
  needsAttention: boolean;
}

/**
 * Hook for fetching profile completion status
 *
 * @param userId - User ID (optional, defaults to current user)
 * @returns Profile completion data and utilities
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { completion, isLoading, refresh } = useProfileCompletion();
 *
 *   if (isLoading) return <Loading />;
 *
 *   return (
 *     <div>
 *       <p>Profile: {completion?.completionPercentage}% complete</p>
 *       <button onClick={refresh}>Refresh</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useProfileCompletion(
  userId?: string
): UseProfileCompletionReturn {
  const currentUser = useAuthStore((state) => state.user);
  const targetUserId = userId || currentUser?.id;
  const isOwnProfile = !userId || userId === currentUser?.id;

  // SWR cache key
  const cacheKey = targetUserId
    ? `/users/${targetUserId}/profile-completion`
    : null;

  // Fetcher function
  const fetcher = async () => {
    if (!targetUserId) {
      throw new Error('User ID required');
    }

    try {
      // Use appropriate API based on whether it's own profile
      if (isOwnProfile) {
        return await getMyProfileCompletion();
      } else {
        return await getUserProfileCompletion(targetUserId);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('[useProfileCompletion] Fetch failed', err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  };

  // SWR hook with configuration
  const { data, error, isLoading, mutate } = useSWR<ProfileCompletionData>(
    cacheKey,
    fetcher,
    {
      // Cache configuration
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 10000, // 10 seconds
      errorRetryCount: 3,
      errorRetryInterval: 5000,

      // Error handling
      onError: (err) => {
        logger.error('[useProfileCompletion] SWR error', err instanceof Error ? err : new Error(String(err)));
        toast.error('Profil tamamlanma durumu yüklenemedi');
      },
    }
  );

  // Refresh function with toast notification
  const refresh = async () => {
    try {
      logger.debug('[useProfileCompletion] Refreshing completion data');
      await mutate();
      toast.success('Profil durumu güncellendi');
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('[useProfileCompletion] Refresh failed', error instanceof Error ? error : new Error(String(error)));
      toast.error('Yenileme başarısız oldu');
    }
  };

  // Computed values
  const isComplete = (data?.completionPercentage ?? 0) >= 90;
  const needsAttention = (data?.completionPercentage ?? 0) < 70;

  return {
    completion: data,
    isLoading,
    error: error as Error | undefined,
    refresh,
    isComplete,
    needsAttention,
  };
}

/**
 * Legacy compatibility wrapper
 * @deprecated Use useProfileCompletion instead
 */
export function useProfileValidation(userId?: string) {
  const { completion } = useProfileCompletion(userId);

  return {
    completeness: completion?.completionPercentage ?? 0,
    missingFields: completion?.missingFields ?? [],
    suggestions: completion?.suggestions ?? [],
    isComplete: (completion?.completionPercentage ?? 0) === 100,
    needsAttention: (completion?.completionPercentage ?? 0) < 70,
  };
}

export default useProfileCompletion;
