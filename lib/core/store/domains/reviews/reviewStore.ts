import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import logger from '@/lib/infrastructure/monitoring/logger';
import type {
  ReviewData,
  ReviewSummary,
  CreateReviewRequest,
  CreateReviewResponse,
  ReviewFilters,
  ReviewsResponse,
} from '@/types';

interface ReviewStore {
  // State
  reviews: ReviewData[];
  reviewSummary: ReviewSummary | null;
  isLoading: boolean;
  error: string | null;
  filters: ReviewFilters;

  // Actions
  fetchReviews: (userId: string, filters?: ReviewFilters) => Promise<void>;
  createReview: (data: CreateReviewRequest) => Promise<CreateReviewResponse>;
  replyToReview: (reviewId: string, content: string) => Promise<void>;
  reportReview: (
    reviewId: string,
    reason: string,
    description?: string
  ) => Promise<void>;
  markHelpful: (reviewId: string) => Promise<void>;
  updateFilters: (filters: Partial<ReviewFilters>) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  reviews: [],
  reviewSummary: null,
  isLoading: false,
  error: null,
  filters: {},
};

export const useReviewStore = create<ReviewStore>()(
  devtools(
    (set) => ({
      ...initialState,

      fetchReviews: async (userId: string, filters?: ReviewFilters) => {
        set({ isLoading: true, error: null });

        try {
          const queryParams = new URLSearchParams();
          queryParams.append('userId', userId);

          if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                queryParams.append(key, String(value));
              }
            });
          }

          // Updated: Public endpoint for querying reviews by seller
          const response = await fetch(
            `/api/v1/reviews/public/seller/${userId}?${queryParams}`
          );

          if (!response.ok) {
            throw new Error('Reviews fetch edilemedi');
          }

          const data: ReviewsResponse = await response.json();

          if (data.success && data.data) {
            set({
              reviews: data.data.reviews,
              reviewSummary: data.data.summary,
              filters: filters || {},
              isLoading: false,
            });
          } else {
            throw new Error(data.error || 'Bilinmeyen hata');
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Bir hata oluştu',
            isLoading: false,
          });
        }
      },

      createReview: async (data: CreateReviewRequest) => {
        set({ isLoading: true, error: null });

        try {
          // Updated: New authenticated review management endpoint
          const response = await fetch('/api/v1/reviews/manage', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            throw new Error('Review oluşturulamadı');
          }

          const result: CreateReviewResponse = await response.json();

          if (result.success && result.data) {
            // Yeni review'i listeye ekle
            set((state) => ({
              reviews: [result.data!, ...state.reviews],
              isLoading: false,
            }));

            return result;
          } else {
            throw new Error(result.error || 'Bilinmeyen hata');
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Bir hata oluştu';
          set({
            error: errorMessage,
            isLoading: false,
          });

          return {
            success: false,
            error: errorMessage,
          };
        }
      },

      replyToReview: async (reviewId: string, content: string) => {
        set({ isLoading: true, error: null });

        try {
          // Updated: New seller response endpoint
          const response = await fetch(
            `/api/v1/reviews/response/${reviewId}/respond`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ content }),
            }
          );

          if (!response.ok) {
            throw new Error('Reply gönderilemedi');
          }

          const result = await response.json();

          if (result.success) {
            // Review'i güncelle
            set((state) => ({
              reviews: state.reviews.map((review) =>
                review.id === reviewId
                  ? { ...review, reply: result.data }
                  : review
              ),
              isLoading: false,
            }));
          } else {
            throw new Error(result.error || 'Bilinmeyen hata');
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Bir hata oluştu',
            isLoading: false,
          });
        }
      },

      reportReview: async (
        reviewId: string,
        reason: string,
        description?: string
      ) => {
        set({ isLoading: true, error: null });

        try {
          // Updated: New flag endpoint
          const response = await fetch(
            `/api/v1/reviews/manage/${reviewId}/flag`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ reason, description }),
            }
          );

          if (!response.ok) {
            throw new Error('Şikayet gönderilemedi');
          }

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error || 'Bilinmeyen hata');
          }

          set({ isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Bir hata oluştu',
            isLoading: false,
          });
        }
      },

      markHelpful: async (reviewId: string) => {
        try {
          // Updated: New helpful voting endpoint
          const response = await fetch(
            `/api/v1/reviews/manage/${reviewId}/helpful`,
            {
              method: 'POST',
            }
          );

          if (!response.ok) {
            throw new Error('İşlem gerçekleştirilemedi');
          }

          const result = await response.json();

          if (result.success) {
            // Review'in helpful count'unu güncelle
            set((state) => ({
              reviews: state.reviews.map((review) =>
                review.id === reviewId
                  ? { ...review, helpfulCount: (review.helpfulCount || 0) + 1 }
                  : review
              ),
            }));
          }
        } catch (error) {
          logger.error(
            'Helpful mark error',
            error
          );
        }
      },

      updateFilters: (filters: Partial<ReviewFilters>) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
        }));
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'review-store',
    }
  )
);
