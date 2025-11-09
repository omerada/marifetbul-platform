/**
 * ================================================
 * USE REVIEW MODERATION HOOK
 * ================================================
 * SWR hook for fetching pending/flagged reviews
 *
 * SPRINT 1 - STORY 4: Review Moderation Integration
 * Backend: GET /api/v1/moderation/reviews/pending|flagged
 *
 * @version 1.0.0
 * @author MarifetBul Development Team
 * @created Sprint 1 - Story 4
 */

import useSWR from 'swr';
import { getPendingReviews, getFlaggedReviews } from '@/lib/api/moderation';

// ============================================================================
// PENDING REVIEWS
// ============================================================================

/**
 * Hook to fetch pending reviews (awaiting moderation)
 *
 * @param page - Page number (0-indexed)
 * @param size - Page size (default 20)
 * @returns SWR response with pending reviews
 */
export function usePendingReviews(page = 0, size = 20) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/v1/moderation/reviews/pending?page=${page}&size=${size}`,
    () => getPendingReviews(page, size),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000, // Prevent duplicate requests within 5s
    }
  );

  return {
    reviews: data?.content || [],
    pageNumber: data?.pageNumber ?? page,
    pageSize: data?.pageSize ?? size,
    totalElements: data?.totalElements ?? 0,
    totalPages: data?.totalPages ?? 0,
    isFirst: data?.first ?? true,
    isLast: data?.last ?? true,
    hasNext: data?.hasNext ?? false,
    hasPrevious: data?.hasPrevious ?? false,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

// ============================================================================
// FLAGGED REVIEWS
// ============================================================================

/**
 * Hook to fetch flagged reviews (need moderation)
 *
 * @param page - Page number (0-indexed)
 * @param size - Page size (default 20)
 * @returns SWR response with flagged reviews sorted by priority
 */
export function useFlaggedReviews(page = 0, size = 20) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/v1/moderation/reviews/flagged?page=${page}&size=${size}`,
    () => getFlaggedReviews(page, size),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  return {
    reviews: data?.content || [],
    pageNumber: data?.pageNumber ?? page,
    pageSize: data?.pageSize ?? size,
    totalElements: data?.totalElements ?? 0,
    totalPages: data?.totalPages ?? 0,
    isFirst: data?.first ?? true,
    isLast: data?.last ?? true,
    hasNext: data?.hasNext ?? false,
    hasPrevious: data?.hasPrevious ?? false,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

// ============================================================================
// COMBINED HOOK (Optional - for tabs)
// ============================================================================

export type ReviewModerationTab = 'pending' | 'flagged';

/**
 * Hook to fetch reviews based on selected tab
 *
 * @param tab - 'pending' or 'flagged'
 * @param page - Page number (0-indexed)
 * @param size - Page size (default 20)
 * @returns SWR response with reviews for selected tab
 */
export function useReviewModeration(
  tab: ReviewModerationTab = 'pending',
  page = 0,
  size = 20
) {
  const pendingResult = usePendingReviews(page, size);
  const flaggedResult = useFlaggedReviews(page, size);

  // Return data based on selected tab
  return tab === 'pending' ? pendingResult : flaggedResult;
}

export default useReviewModeration;
