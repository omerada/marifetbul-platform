/**
 * ================================================
 * USE SELLER REVIEWS HOOK
 * ================================================
 * Fetches reviews received by a seller/freelancer
 * Used in profile pages to display seller ratings
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Review System Sprint - Day 7-8
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/shared/utils/logger';
import {
  type Review,
  type ReviewStats,
  ReviewStatus,
} from '@/types/business/review';

interface UseSellerReviewsParams {
  sellerId: string;
  autoFetch?: boolean;
  pageSize?: number;
}

interface UseSellerReviewsReturn {
  reviews: Review[];
  stats: ReviewStats | null;
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;

  fetchReviews: (page?: number) => Promise<void>;
  fetchStats: () => Promise<void>;
  filterByRating: (minRating: number) => void;
  sortReviews: (sortBy: string, sortDirection: 'ASC' | 'DESC') => void;
  clearError: () => void;
}

interface ReviewsResponse {
  success: boolean;
  message?: string;
  data: {
    content: Review[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

interface StatsResponse {
  success: boolean;
  message?: string;
  data: ReviewStats;
}

export function useSellerReviews({
  sellerId,
  autoFetch = true,
  pageSize = 10,
}: UseSellerReviewsParams): UseSellerReviewsReturn {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState<{
    minRating?: number;
    status?: ReviewStatus;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
  }>({
    status: ReviewStatus.APPROVED,
    sortBy: 'CREATED_AT',
    sortDirection: 'DESC',
  });

  /**
   * Fetch reviews for the seller
   */
  const fetchReviews = useCallback(
    async (page: number = 0) => {
      if (!sellerId) {
        logger.warn('useSellerReviews: sellerId is required');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Build query parameters
        const params = new URLSearchParams({
          page: page.toString(),
          size: pageSize.toString(),
          status: filters.status || ReviewStatus.APPROVED,
          sortBy: filters.sortBy || 'CREATED_AT',
          sortDirection: filters.sortDirection || 'DESC',
        });

        if (filters.minRating) {
          params.append('minRating', filters.minRating.toString());
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/reviews/seller/${sellerId}?${params}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Satıcı bulunamadı');
          }
          throw new Error('Değerlendirmeler yüklenirken bir hata oluştu');
        }

        const result: ReviewsResponse = await response.json();

        if (!result.success) {
          throw new Error(result.message || 'İşlem başarısız');
        }

        setReviews(result.data.content);
        setCurrentPage(result.data.page);
        setTotalPages(result.data.totalPages);
        setTotalElements(result.data.totalElements);

        logger.info('useSellerReviews: Reviews fetched', {
          sellerId,
          page,
          count: result.data.content.length,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Bir hata oluştu';
        setError(errorMessage);
        logger.error('useSellerReviews: Error fetching reviews', {
          error: err,
          sellerId,
        });
      } finally {
        setLoading(false);
      }
    },
    [sellerId, pageSize, filters]
  );

  /**
   * Fetch review statistics
   */
  const fetchStats = useCallback(async () => {
    if (!sellerId) {
      logger.warn('useSellerReviews: sellerId is required for stats');
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/reviews/seller/${sellerId}/stats`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        logger.warn('useSellerReviews: Failed to fetch stats', {
          status: response.status,
        });
        return;
      }

      const result: StatsResponse = await response.json();

      if (result.success && result.data) {
        setStats(result.data);
        logger.info('useSellerReviews: Stats fetched', { sellerId });
      }
    } catch (err) {
      logger.error('useSellerReviews: Error fetching stats', {
        error: err,
        sellerId,
      });
    }
  }, [sellerId]);

  /**
   * Filter reviews by minimum rating
   */
  const filterByRating = useCallback((minRating: number) => {
    setFilters((prev) => ({ ...prev, minRating }));
    setCurrentPage(0);
  }, []);

  /**
   * Sort reviews
   */
  const sortReviews = useCallback(
    (sortBy: string, sortDirection: 'ASC' | 'DESC') => {
      setFilters((prev) => ({ ...prev, sortBy, sortDirection }));
      setCurrentPage(0);
    },
    []
  );

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Auto-fetch reviews and stats on mount or when dependencies change
   */
  useEffect(() => {
    if (autoFetch && sellerId) {
      fetchReviews(currentPage);
      fetchStats();
    }
  }, [autoFetch, sellerId, fetchReviews, fetchStats, currentPage]);

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
    fetchStats,
    filterByRating,
    sortReviews,
    clearError,
  };
}
