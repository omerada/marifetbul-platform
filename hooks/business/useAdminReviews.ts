'use client';

import { useState, useCallback } from 'react';
import { ReviewStatus } from '@/types/business/review';
import type { Review } from '@/types/business/review';
import logger from '@/lib/infrastructure/monitoring/logger';

export interface AdminReviewsResponse {
  content: Review[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface AdminReviewStats {
  totalReviews: number;
  pendingReviews: number;
  approvedReviews: number;
  rejectedReviews: number;
  flaggedReviews: number;
  averageRating: number;
  averageModerationTime: number;
}

export interface UseAdminReviewsOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface UseAdminReviews {
  reviews: Review[];
  stats: AdminReviewStats | null;
  pagination: {
    totalPages: number;
    totalElements: number;
    currentPage: number;
    pageSize: number;
  } | null;
  isLoading: boolean;
  error: string | null;
  fetchPendingReviews: (page: number, size?: number) => Promise<void>;
  fetchFlaggedReviews: (page: number, size?: number) => Promise<void>;
  fetchAllReviews: (
    page: number,
    size?: number,
    filters?: {
      status?: ReviewStatus;
      sortBy?: string;
      direction?: 'ASC' | 'DESC';
    }
  ) => Promise<void>;
  fetchStats: () => Promise<void>;
  approveReview: (reviewId: string, note?: string) => Promise<void>;
  rejectReview: (reviewId: string, reason: string) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for admin review moderation operations
 * Handles fetching pending/flagged reviews, stats, and moderation actions
 */
export function useAdminReviews(
  options: UseAdminReviewsOptions = {}
): UseAdminReviews {
  const { onSuccess, onError } = options;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<AdminReviewStats | null>(null);
  const [pagination, setPagination] = useState<{
    totalPages: number;
    totalElements: number;
    currentPage: number;
    pageSize: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback(
    (err: Error | unknown, defaultMessage: string) => {
      const errorMessage = err instanceof Error ? err.message : defaultMessage;
      setError(errorMessage);
      logger.error(
        defaultMessage,
        err instanceof Error ? err : new Error(errorMessage)
      );
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    },
    [onError]
  );

  const fetchPendingReviews = useCallback(
    async (page: number, size = 20) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `/api/v1/admin/reviews/pending?page=${page}&size=${size}`,
          {
            credentials: 'include',
            headers: {
              Accept: 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Bekleyen değerlendirmeler yüklenemedi');
        }

        const data: AdminReviewsResponse = await response.json();
        setReviews(data.content || []);
        setPagination({
          totalPages: data.totalPages,
          totalElements: data.totalElements,
          currentPage: data.number,
          pageSize: data.size,
        });

        logger.debug('Pending reviews fetched', {
          count: data?.content?.length || 0,
          page,
        });
      } catch (err) {
        handleError(err, 'Bekleyen değerlendirmeler yüklenemedi');
      } finally {
        setIsLoading(false);
      }
    },
    [handleError]
  );

  const fetchFlaggedReviews = useCallback(
    async (page: number, size = 20) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `/api/v1/admin/reviews/flagged?page=${page}&size=${size}`,
          {
            credentials: 'include',
            headers: {
              Accept: 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Şikayetli değerlendirmeler yüklenemedi');
        }

        const data: AdminReviewsResponse = await response.json();
        setReviews(data.content || []);
        setPagination({
          totalPages: data.totalPages,
          totalElements: data.totalElements,
          currentPage: data.number,
          pageSize: data.size,
        });

        logger.debug('Flagged reviews fetched', {
          count: data?.content?.length || 0,
          page,
        });
      } catch (err) {
        handleError(err, 'Şikayetli değerlendirmeler yüklenemedi');
      } finally {
        setIsLoading(false);
      }
    },
    [handleError]
  );

  const fetchAllReviews = useCallback(
    async (
      page: number,
      size = 20,
      filters?: {
        status?: ReviewStatus;
        sortBy?: string;
        direction?: 'ASC' | 'DESC';
      }
    ) => {
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: page.toString(),
          size: size.toString(),
        });

        if (filters?.status) {
          params.append('status', filters.status);
        }
        if (filters?.sortBy) {
          params.append('sortBy', filters.sortBy);
        }
        if (filters?.direction) {
          params.append('direction', filters.direction);
        }

        const response = await fetch(
          `/api/v1/admin/reviews?${params.toString()}`,
          {
            credentials: 'include',
            headers: {
              Accept: 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Değerlendirmeler yüklenemedi');
        }

        const data: AdminReviewsResponse = await response.json();
        setReviews(data.content || []);
        setPagination({
          totalPages: data.totalPages,
          totalElements: data.totalElements,
          currentPage: data.number,
          pageSize: data.size,
        });

        logger.debug('All reviews fetched', {
          count: data?.content?.length || 0,
          page,
          filters,
        });
      } catch (err) {
        handleError(err, 'Değerlendirmeler yüklenemedi');
      } finally {
        setIsLoading(false);
      }
    },
    [handleError]
  );

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/admin/reviews/stats', {
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('İstatistikler yüklenemedi');
      }

      const data: AdminReviewStats = await response.json();
      setStats(data);

      logger.debug('Admin stats fetched', {
        component: 'useAdminReviews',
        data,
      });
    } catch (err) {
      logger.error(
        'Failed to fetch stats',
        err instanceof Error ? err : new Error('Unknown error')
      );
      // Don't set error state for stats failure - it's not critical
    }
  }, []);

  const approveReview = useCallback(
    async (reviewId: string, note?: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const url = note
          ? `/api/v1/admin/reviews/${reviewId}/approve?note=${encodeURIComponent(note)}`
          : `/api/v1/admin/reviews/${reviewId}/approve`;

        const response = await fetch(url, {
          method: 'POST',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Değerlendirme onaylanamadı');
        }

        logger.info('Review approved', { reviewId, note });
        onSuccess?.();
      } catch (err) {
        handleError(err, 'Değerlendirme onaylanamadı');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [handleError, onSuccess]
  );

  const rejectReview = useCallback(
    async (reviewId: string, reason: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `/api/v1/admin/reviews/${reviewId}/reject?reason=${encodeURIComponent(reason)}`,
          {
            method: 'POST',
            credentials: 'include',
            headers: {
              Accept: 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Değerlendirme reddedilemedi');
        }

        logger.info('Review rejected', { reviewId, reason });
        onSuccess?.();
      } catch (err) {
        handleError(err, 'Değerlendirme reddedilemedi');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [handleError, onSuccess]
  );

  const deleteReview = useCallback(
    async (reviewId: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/v1/admin/reviews/${reviewId}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Değerlendirme silinemedi');
        }

        logger.info('Review deleted', { reviewId });
        onSuccess?.();
      } catch (err) {
        handleError(err, 'Değerlendirme silinemedi');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [handleError, onSuccess]
  );

  return {
    reviews,
    stats,
    pagination,
    isLoading,
    error,
    fetchPendingReviews,
    fetchFlaggedReviews,
    fetchAllReviews,
    fetchStats,
    approveReview,
    rejectReview,
    deleteReview,
    clearError,
  };
}
