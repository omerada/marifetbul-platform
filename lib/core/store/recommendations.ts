import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  RecommendationsRequest,
  RecommendationsResponse,
  Recommendation,
  RecommendationFeedback,
} from '@/types';

interface RecommendationStore {
  // State properties
  recommendations: Recommendation[];
  isLoading: boolean;
  error: string | null;
  lastRequest: RecommendationsRequest | null;
  lastUpdated: string | null;

  // Actions
  fetchRecommendations: (request: RecommendationsRequest) => Promise<void>;
  refreshRecommendations: () => Promise<void>;
  provideFeedback: (feedback: RecommendationFeedback) => Promise<void>;
  clearRecommendations: () => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  recommendations: [],
  isLoading: false,
  error: null,
  lastRequest: null,
  lastUpdated: null,
};

export const useRecommendationStore = create<RecommendationStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchRecommendations: async (request: RecommendationsRequest) => {
        set(
          {
            isLoading: true,
            error: null,
            lastRequest: request,
          },
          false,
          'fetchRecommendations/start'
        );

        try {
          const params = new URLSearchParams();
          params.append('type', request.type);

          if (request.userId) params.append('userId', request.userId);
          if (request.basedOn) params.append('basedOn', request.basedOn);
          if (request.targetItemId)
            params.append('targetItemId', request.targetItemId);
          if (request.limit) params.append('limit', request.limit.toString());
          if (request.excludeIds) {
            request.excludeIds.forEach((id) => params.append('excludeIds', id));
          }

          const response = await fetch(
            `/api/v1/recommendations?${params.toString()}`
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data: RecommendationsResponse = await response.json();

          if (data.success && data.data) {
            set(
              {
                recommendations: data.data,
                isLoading: false,
                lastUpdated: new Date().toISOString(),
              },
              false,
              'fetchRecommendations/success'
            );
          } else {
            throw new Error(data.error || 'Öneriler alınamadı');
          }
        } catch (error) {
          set(
            {
              error:
                error instanceof Error ? error.message : 'Öneriler yüklenemedi',
              isLoading: false,
            },
            false,
            'fetchRecommendations/error'
          );
        }
      },

      refreshRecommendations: async () => {
        const { lastRequest } = get();
        if (lastRequest) {
          await get().fetchRecommendations(lastRequest);
        }
      },

      provideFeedback: async (feedback: RecommendationFeedback) => {
        try {
          const response = await fetch('/api/v1/recommendations/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(feedback),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          if (!data.success) {
            throw new Error(data.error || 'Geri bildirim gönderilemedi');
          }

          // Feedback submitted successfully - could refresh recommendations if needed
        } catch (error) {
          set(
            {
              error:
                error instanceof Error
                  ? error.message
                  : 'Geri bildirim gönderilemedi',
            },
            false,
            'provideFeedback/error'
          );
        }
      },

      clearRecommendations: () => {
        set(
          {
            recommendations: [],
            lastRequest: null,
            lastUpdated: null,
          },
          false,
          'clearRecommendations'
        );
      },

      clearError: () => {
        set({ error: null }, false, 'clearError');
      },

      reset: () => {
        set(initialState, false, 'reset');
      },
    }),
    {
      name: 'recommendation-store',
    }
  )
);
