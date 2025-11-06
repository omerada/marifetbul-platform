/**
 * ================================================
 * USE REVIEW MODERATION HOOK
 * ================================================
 * Dedicated hook for moderator review management
 *
 * Features:
 * - Fetch pending/flagged reviews
 * - Approve/reject reviews with reasons
 * - Bulk moderation actions
 * - Real-time stats updates
 * - Optimistic UI updates
 *
 * Sprint 1 - Story 1.1: Review Moderation System
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 3, 2025
 */

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { toast } from 'sonner';
import logger from '@/lib/infrastructure/monitoring/logger';
import type { ReviewData } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

export interface ReviewModerationFilters {
  status?: 'pending' | 'approved' | 'rejected' | 'flagged';
  priority?: 'high' | 'medium' | 'low';
  reportedOnly?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface ReviewModerationStats {
  pending: number;
  approved: number;
  rejected: number;
  flagged: number;
  totalReports: number;
}

export interface ReviewModerationResponse {
  reviews: ReviewData[];
  stats: ReviewModerationStats;
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
  };
}

export interface ModerationAction {
  reviewId: string;
  action: 'approve' | 'reject';
  reason?: string;
  moderatorNotes?: string;
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export interface UseReviewModerationOptions {
  autoFetch?: boolean;
  filters?: ReviewModerationFilters;
  pageSize?: number;
}

export interface UseReviewModerationReturn {
  // Data
  reviews: ReviewData[];
  stats: ReviewModerationStats | null;
  pagination: {
    page: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
  } | null;

  // State
  isLoading: boolean;
  error: Error | null;
  isProcessing: boolean;
  selectedReviews: string[];

  // Actions
  approveReview: (reviewId: string) => Promise<boolean>;
  rejectReview: (reviewId: string, reason: string) => Promise<boolean>;
  escalateReview: (
    reviewId: string,
    reason: string,
    priority: 'HIGH' | 'MEDIUM' | 'LOW'
  ) => Promise<boolean>;
  bulkApprove: (reviewIds: string[]) => Promise<boolean>;
  bulkReject: (reviewIds: string[], reason: string) => Promise<boolean>;
  bulkEscalate: (
    reviewIds: string[],
    reason: string,
    priority: 'HIGH' | 'MEDIUM' | 'LOW'
  ) => Promise<boolean>;
  refresh: () => void;

  // Selection
  toggleSelection: (reviewId: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  isSelected: (reviewId: string) => boolean;

  // Pagination
  currentPage: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
}

export function useReviewModeration(
  options: UseReviewModerationOptions = {}
): UseReviewModerationReturn {
  const { autoFetch = true, filters = {}, pageSize = 20 } = options;

  const [currentPage, setCurrentPage] = useState(0);
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Build cache key with filters
  const cacheKey = [
    '/api/v1/reviews/moderation',
    currentPage,
    pageSize,
    JSON.stringify(filters),
  ];

  // Fetch reviews with SWR
  const {
    data,
    error,
    isLoading,
    mutate: refresh,
  } = useSWR<ReviewModerationResponse>(
    autoFetch ? cacheKey : null,
    () => fetchReviewsForModeration(currentPage, pageSize, filters),
    {
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );

  // ============================================================================
  // API FUNCTIONS
  // ============================================================================

  /**
   * Fetch reviews for moderation
   */
  async function fetchReviewsForModeration(
    page: number,
    size: number,
    filters: ReviewModerationFilters
  ): Promise<ReviewModerationResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...(filters.status && { status: filters.status }),
      ...(filters.priority && { priority: filters.priority }),
      ...(filters.reportedOnly && { reportedOnly: 'true' }),
      ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
      ...(filters.dateTo && { dateTo: filters.dateTo }),
    });

    const response = await fetch(`/api/v1/reviews/moderation?${params}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to fetch reviews');
    }

    return response.json();
  }

  /**
   * Approve a review
   */
  const approveReview = useCallback(
    async (reviewId: string, reason?: string) => {
      setIsProcessing(true);

      try {
        const response = await fetch(`/api/v1/reviews/${reviewId}/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ reason }),
        });

        if (!response.ok) {
          throw new Error('Failed to approve review');
        }

        // Optimistic update
        await refresh();

        toast.success('İnceleme onaylandı');
        logger.info('Review approved', { reviewId, reason });

        return true;
      } catch (error) {
        logger.error('Failed to approve review', error instanceof Error ? error : new Error(String(error)));
        toast.error('İnceleme onaylanamadı');
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [refresh]
  );

  /**
   * Reject a review
   */
  const rejectReview = useCallback(
    async (reviewId: string, reason: string) => {
      if (!reason || reason.length < 10) {
        toast.error('Red nedeni en az 10 karakter olmalıdır');
        return false;
      }

      setIsProcessing(true);

      try {
        const response = await fetch(`/api/v1/reviews/${reviewId}/reject`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ reason }),
        });

        if (!response.ok) {
          throw new Error('Failed to reject review');
        }

        // Optimistic update
        await refresh();

        toast.success('İnceleme reddedildi');
        logger.info('Review rejected', { reviewId, reason });

        return true;
      } catch (error) {
        logger.error('Failed to reject review', error instanceof Error ? error : new Error(String(error)));
        toast.error('İnceleme reddedilemedi');
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [refresh]
  );

  /**
   * Bulk approve reviews
   */
  const bulkApprove = useCallback(
    async (reviewIds: string[], reason?: string) => {
      if (reviewIds.length === 0) {
        toast.error('Lütfen en az bir inceleme seçin');
        return false;
      }

      setIsProcessing(true);

      try {
        const response = await fetch('/api/v1/reviews/bulk-moderate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            reviewIds,
            action: 'approve',
            reason,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to bulk approve reviews');
        }

        await refresh();
        setSelectedReviews([]);

        toast.success(`${reviewIds.length} inceleme onaylandı`);
        logger.info('Bulk approve completed', { count: reviewIds.length });

        return true;
      } catch (error) {
        logger.error('Failed to bulk approve reviews', error instanceof Error ? error : new Error(String(error)));
        toast.error('Toplu onaylama başarısız');
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [refresh]
  );

  /**
   * Bulk reject reviews
   */
  const bulkReject = useCallback(
    async (reviewIds: string[], reason: string) => {
      if (reviewIds.length === 0) {
        toast.error('Lütfen en az bir inceleme seçin');
        return false;
      }

      if (!reason || reason.length < 10) {
        toast.error('Red nedeni en az 10 karakter olmalıdır');
        return false;
      }

      setIsProcessing(true);

      try {
        const response = await fetch('/api/v1/reviews/bulk-moderate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            reviewIds,
            action: 'reject',
            reason,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to bulk reject reviews');
        }

        await refresh();
        setSelectedReviews([]);

        toast.success(`${reviewIds.length} inceleme reddedildi`);
        logger.info('Bulk reject completed', { count: reviewIds.length });

        return true;
      } catch (error) {
        logger.error('Failed to bulk reject reviews', error instanceof Error ? error : new Error(String(error)));
        toast.error('Toplu reddetme başarısız');
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [refresh]
  );

  /**
   * Escalate a review to admin
   * Sprint 1 - Story 1.2: Review Escalation
   */
  const escalateReview = useCallback(
    async (
      reviewId: string,
      reason: string,
      priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM'
    ) => {
      if (!reason || reason.length < 10) {
        toast.error('Yükseltme nedeni en az 10 karakter olmalıdır');
        return false;
      }

      setIsProcessing(true);

      try {
        const response = await fetch(
          `/api/v1/reviews/moderation/${reviewId}/escalate?reason=${encodeURIComponent(reason)}&priority=${priority}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          }
        );

        if (!response.ok) {
          throw new Error('Failed to escalate review');
        }

        // Optimistic update
        await refresh();

        toast.success('İnceleme yöneticiye yükseltildi');
        logger.info('Review escalated', { reviewId, reason, priority });

        return true;
      } catch (error) {
        logger.error('Failed to escalate review', error instanceof Error ? error : new Error(String(error)));
        toast.error('İnceleme yükseltilemedi');
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [refresh]
  );

  /**
   * Bulk escalate reviews to admin
   * Sprint 1 - Story 1.2: Review Escalation
   */
  const bulkEscalate = useCallback(
    async (
      reviewIds: string[],
      reason: string,
      priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM'
    ) => {
      if (reviewIds.length === 0) {
        toast.error('Lütfen en az bir inceleme seçin');
        return false;
      }

      if (!reason || reason.length < 10) {
        toast.error('Yükseltme nedeni en az 10 karakter olmalıdır');
        return false;
      }

      setIsProcessing(true);

      try {
        const response = await fetch(
          '/api/v1/reviews/moderation/bulk/escalate',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              reviewIds,
              reason,
              priority,
            }),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to bulk escalate reviews');
        }

        await refresh();
        setSelectedReviews([]);

        toast.success(`${reviewIds.length} inceleme yöneticiye yükseltildi`);
        logger.info('Bulk escalate completed', { countreviewIdslength, priority,  });

        return true;
      } catch (error) {
        logger.error('Failed to bulk escalate reviews', error instanceof Error ? error : new Error(String(error)));
        toast.error('Toplu yükseltme başarısız');
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [refresh]
  );

  // ============================================================================
  // SELECTION MANAGEMENT
  // ============================================================================

  const toggleSelection = useCallback((reviewId: string) => {
    setSelectedReviews((prev) =>
      prev.includes(reviewId)
        ? prev.filter((id) => id !== reviewId)
        : [...prev, reviewId]
    );
  }, []);

  const selectAll = useCallback(() => {
    if (data?.reviews) {
      setSelectedReviews(data.reviews.map((r) => r.id));
    }
  }, [data]);

  const clearSelection = useCallback(() => {
    setSelectedReviews([]);
  }, []);

  const isSelected = useCallback(
    (reviewId: string) => selectedReviews.includes(reviewId),
    [selectedReviews]
  );

  // ============================================================================
  // PAGINATION
  // ============================================================================

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
    setSelectedReviews([]);
  }, []);

  const nextPage = useCallback(() => {
    if (data && currentPage < data.pagination.totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
      setSelectedReviews([]);
    }
  }, [currentPage, data]);

  const previousPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
      setSelectedReviews([]);
    }
  }, [currentPage]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Data
    reviews: data?.reviews ?? [],
    stats: data?.stats ?? null,
    pagination: data?.pagination ?? null,

    // State
    isLoading,
    error,
    isProcessing,
    selectedReviews,

    // Actions
    approveReview,
    rejectReview,
    escalateReview,
    bulkApprove,
    bulkReject,
    bulkEscalate,
    refresh,

    // Selection
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,

    // Pagination
    currentPage,
    goToPage,
    nextPage,
    previousPage,
  };
}

// ============================================================================
// STATS ONLY HOOK
// ============================================================================

/**
 * Lightweight hook for just fetching stats
 * Use this for dashboard widgets
 */
export function useReviewModerationStats() {
  const {
    data,
    error,
    isLoading,
    mutate: refresh,
  } = useSWR<ReviewModerationStats>(
    '/api/v1/reviews/moderation/stats',
    async () => {
      const response = await fetch('/api/v1/reviews/moderation/stats', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      return response.json();
    },
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );

  return {
    stats: data ?? null,
    isLoading,
    error,
    refresh,
  };
}
