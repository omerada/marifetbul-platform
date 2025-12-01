'use client';

/**
 * ================================================
 * USE PACKAGE REVIEWS HOOK
 * ================================================
 * Custom hook for fetching and managing package reviews
 * Similar to useSellerReviews but for packages
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Review System Sprint
 */

import { useState, useEffect, useCallback } from 'react';
import { reviewApi } from '@/lib/api/review';
import logger from '@/lib/infrastructure/monitoring/logger';
import type {
  Review,
  ReviewStats,
  ReviewsResponse,
  PackageReviewsQueryParams,
} from '@/types/business/review';

interface UsePackageReviewsParams {
  packageId: string;
  autoFetch?: boolean;
  pageSize?: number;
  initialPage?: number;
}

interface UsePackageReviewsReturn {
  reviews: Review[];
  stats: ReviewStats | null;
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  fetchReviews: (page?: number) => Promise<void>;
  filterByRating: (rating: number) => void;
  sortReviews: (sortBy: string, sortDirection: 'ASC' | 'DESC') => void;
  refresh: () => Promise<void>;
}

/**
 * Hook for fetching and managing package reviews
 *
 * @example
 * ```tsx
 * const {
 *   reviews,
 *   stats,
 *   loading,
 *   fetchReviews,
 *   filterByRating,
 * } = usePackageReviews({
 *   packageId: 'package-uuid',
 *   autoFetch: true,
 *   pageSize: 10,
 * });
 * ```
 */
export function usePackageReviewsHook({
  packageId,
  autoFetch = true,
  pageSize: initialPageSize = 10,
  initialPage = 0,
}: UsePackageReviewsParams): UsePackageReviewsReturn {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('DESC');

  /**
   * Fetch package reviews
   */
  const fetchReviews = useCallback(
    async (page = currentPage) => {
      if (!packageId) {
        logger.warn('usePackageReviewsHook: packageId is required');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const params: PackageReviewsQueryParams = {
          packageId,
          page,
          pageSize,
          sortBy: sortBy as 'CREATED_AT' | 'RATING' | 'HELPFUL_COUNT',
          sortDirection: sortDirection as 'ASC' | 'DESC',
        };

        if (minRating !== undefined) {
          params.minRating = minRating;
        }

        const response: ReviewsResponse =
          await reviewApi.getPackageReviews(params);

        setReviews(response.reviews);
        setCurrentPage(response.pagination.page);
        setTotalPages(response.pagination.totalPages);
        setTotalElements(response.pagination.totalElements);
        setPageSize(response.pagination.pageSize);

        // Stats are usually included in the response
        if (response.stats) {
          setStats(response.stats);
        }

        logger.info('usePackageReviewsHook: Reviews fetched', {
          packageId,
          page,
          total: response.pagination.totalElements,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch reviews';
        setError(errorMessage);
        logger.error(
          'usePackageReviewsHook: Error fetching reviews',
          err as Error,
          {
            hook: 'usePackageReviewsHook',
            packageId,
          }
        );
      } finally {
        setLoading(false);
      }
    },
    [packageId, pageSize, sortBy, sortDirection, minRating, currentPage]
  );

  /**
   * Filter reviews by minimum rating
   */
  const filterByRating = useCallback((rating: number) => {
    setMinRating(rating);
    setCurrentPage(0); // Reset to first page
  }, []);

  /**
   * Sort reviews
   */
  const sortReviews = useCallback(
    (newSortBy: string, newSortDirection: 'ASC' | 'DESC') => {
      setSortBy(newSortBy);
      setSortDirection(newSortDirection);
      setCurrentPage(0); // Reset to first page
    },
    []
  );

  /**
   * Refresh reviews (re-fetch current page)
   */
  const refresh = useCallback(async () => {
    await fetchReviews(currentPage);
  }, [fetchReviews, currentPage]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch && packageId) {
      fetchReviews(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packageId]); // Only on packageId change

  // Re-fetch when filters/sort change
  useEffect(() => {
    if (packageId) {
      fetchReviews(currentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minRating, sortBy, sortDirection]);

  return {
    reviews,
    stats,
    loading,
    error,
    currentPage,
    totalPages,
    totalElements,
    pageSize,
    fetchReviews,
    filterByRating,
    sortReviews,
    refresh,
  };
}
