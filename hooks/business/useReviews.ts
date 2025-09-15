import { useCallback, useEffect } from 'react';
import { useReviewStore } from '@/lib/core/store/reviewStore';
import type { ReviewFilters, CreateReviewRequest } from '@/types';

export function useReviews(userId?: string, initialFilters?: ReviewFilters) {
  const {
    reviews,
    reviewSummary,
    isLoading,
    error,
    filters,
    fetchReviews,
    createReview,
    replyToReview,
    reportReview,
    markHelpful,
    updateFilters,
    clearError,
    reset,
  } = useReviewStore();

  // Load reviews when userId changes or component mounts
  useEffect(() => {
    if (userId) {
      fetchReviews(userId, initialFilters);
    }
  }, [userId, fetchReviews, initialFilters]);

  // Memoized functions to prevent unnecessary re-renders
  const handleCreateReview = useCallback(
    async (data: CreateReviewRequest) => {
      return await createReview(data);
    },
    [createReview]
  );

  const handleReplyToReview = useCallback(
    async (reviewId: string, content: string) => {
      await replyToReview(reviewId, content);
    },
    [replyToReview]
  );

  const handleReportReview = useCallback(
    async (reviewId: string, reason: string, description?: string) => {
      await reportReview(reviewId, reason, description);
    },
    [reportReview]
  );

  const handleMarkHelpful = useCallback(
    async (reviewId: string) => {
      await markHelpful(reviewId);
    },
    [markHelpful]
  );

  const handleUpdateFilters = useCallback(
    (newFilters: Partial<ReviewFilters>) => {
      updateFilters(newFilters);
      if (userId) {
        fetchReviews(userId, { ...filters, ...newFilters });
      }
    },
    [updateFilters, fetchReviews, userId, filters]
  );

  const handleRefresh = useCallback(() => {
    if (userId) {
      fetchReviews(userId, filters);
    }
  }, [fetchReviews, userId, filters]);

  // Cleanup function
  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  return {
    // State
    reviews,
    reviewSummary,
    isLoading,
    error,
    filters,

    // Actions
    createReview: handleCreateReview,
    replyToReview: handleReplyToReview,
    reportReview: handleReportReview,
    markHelpful: handleMarkHelpful,
    updateFilters: handleUpdateFilters,
    refresh: handleRefresh,
    clearError,
    reset: handleReset,

    // Computed values
    hasReviews: reviews.length > 0,
    averageRating: reviewSummary?.averageRating || 0,
    totalReviews: reviewSummary?.totalReviews || 0,
  };
}

// Simplified hook for read-only review data
export function useReviewSummary(userId: string) {
  const { reviewSummary, isLoading, error, fetchReviews } = useReviewStore();

  useEffect(() => {
    if (userId) {
      fetchReviews(userId);
    }
  }, [userId, fetchReviews]);

  return {
    summary: reviewSummary,
    isLoading,
    error,
    averageRating: reviewSummary?.averageRating || 0,
    totalReviews: reviewSummary?.totalReviews || 0,
    categoryAverages: reviewSummary?.categoryAverages,
    ratingDistribution: reviewSummary?.ratingDistribution,
  };
}

// Hook for review form specific operations
export function useReviewForm() {
  const { createReview, isLoading, error, clearError } = useReviewStore();

  const submitReview = useCallback(
    async (data: CreateReviewRequest) => {
      clearError();
      return await createReview(data);
    },
    [createReview, clearError]
  );

  return {
    submitReview,
    isSubmitting: isLoading,
    submitError: error,
    clearError,
  };
}
