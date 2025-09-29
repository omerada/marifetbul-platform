'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useRecommendationStore } from '@/lib/core/store';
import { RecommendationsRequest, RecommendationFeedback } from '@/types';

export function useRecommendations() {
  const store = useRecommendationStore();

  // Fetch recommendations based on criteria
  const fetchRecommendations = useCallback(
    async (options?: Partial<RecommendationsRequest>) => {
      const request: RecommendationsRequest = {
        type: 'jobs',
        limit: 10,
        ...options,
      };

      await store.fetchRecommendations(request);
    },
    [store]
  );

  // Fetch job recommendations specifically
  const fetchJobRecommendations = useCallback(
    async (options?: Partial<RecommendationsRequest>) => {
      await fetchRecommendations({
        type: 'jobs',
        ...options,
      });
    },
    [fetchRecommendations]
  );

  // Fetch service recommendations specifically
  const fetchServiceRecommendations = useCallback(
    async (options?: Partial<RecommendationsRequest>) => {
      await fetchRecommendations({
        type: 'packages',
        ...options,
      });
    },
    [fetchRecommendations]
  );

  // Fetch freelancer recommendations specifically
  const fetchFreelancerRecommendations = useCallback(
    async (options?: Partial<RecommendationsRequest>) => {
      await fetchRecommendations({
        type: 'freelancers',
        ...options,
      });
    },
    [fetchRecommendations]
  );

  // Provide feedback on recommendation
  const provideFeedback = useCallback(
    async (feedback: RecommendationFeedback) => {
      await store.provideFeedback(feedback);
    },
    [store]
  );

  // Mark recommendation as viewed
  const markAsViewed = useCallback(async () => {
    // This will be implemented in the store
    // Mark recommendation as viewed
  }, []);

  // Dismiss recommendation
  const dismissRecommendation = useCallback(async () => {
    // This will be implemented in the store
    // Dismiss recommendation
  }, []);

  // Refresh recommendations
  const refreshRecommendations = useCallback(
    async (type: 'freelancers' | 'jobs' | 'packages' = 'jobs') => {
      await store.fetchRecommendations({ type });
    },
    [store]
  );

  // Get recommendation statistics
  const stats = useMemo(() => {
    const total = store.recommendations.length;
    const viewed = 0; // Will be implemented when store supports this
    const positive = 0; // Will be implemented when store supports this
    const dismissed = 0; // Will be implemented when store supports this

    return {
      total,
      viewed,
      unviewed: total - viewed,
      positive,
      dismissed,
      engagement: total > 0 ? Math.round((viewed / total) * 100) : 0,
      satisfaction: positive > 0 ? Math.round((positive / viewed) * 100) : 0,
    };
  }, [store.recommendations]);

  // Check if there are new recommendations
  const hasNewRecommendations = useMemo(() => {
    return store.recommendations.length > 0;
  }, [store.recommendations]);

  // Auto-refresh recommendations on mount if empty
  useEffect(() => {
    if (store.recommendations.length === 0 && !store.isLoading) {
      fetchRecommendations();
    }
  }, [store.recommendations.length, store.isLoading, fetchRecommendations]);

  return {
    // State
    recommendations: store.recommendations,
    isLoading: store.isLoading,
    error: store.error,
    lastUpdated: store.lastUpdated,

    // Statistics
    stats,
    hasNewRecommendations,

    // Actions
    fetchRecommendations,
    fetchJobRecommendations,
    fetchServiceRecommendations,
    fetchFreelancerRecommendations,
    provideFeedback,
    markAsViewed,
    dismissRecommendation,
    refreshRecommendations,
    clearError: store.clearError,
    reset: store.reset,
  };
}
