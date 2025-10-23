/**
 * ================================================
 * REVIEW STORE - Zustand State Management
 * ================================================
 * Global state management for Review System
 * Handles review CRUD, voting, flagging, moderation
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Review System Sprint
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { reviewApi } from '@/lib/api/review';
import type {
  Review,
  CreateReviewRequest,
  UpdateReviewRequest,
  SellerResponseRequest,
  FlagReviewRequest,
  ModerateReviewRequest,
  ReviewQueryParams,
  PackageReviewsQueryParams,
  SellerReviewsQueryParams,
  AdminModerationQueryParams,
  ReviewImage,
  ReviewStats,
  VoteType,
} from '@/types/business/review';

// ========================================
// Store State Interface
// ========================================

interface ReviewState {
  // Review Data
  reviews: Review[];
  currentReview: Review | null;
  stats: ReviewStats | null;

  // Pagination
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
    hasPrevious: boolean;
  } | null;

  // UI State
  loading: boolean;
  error: string | null;
  uploadingImage: boolean;

  // Actions - CRUD
  fetchReviews: (params?: ReviewQueryParams) => Promise<void>;
  fetchPackageReviews: (params: PackageReviewsQueryParams) => Promise<void>;
  fetchSellerReviews: (params: SellerReviewsQueryParams) => Promise<void>;
  fetchReviewById: (reviewId: string) => Promise<void>;
  createReview: (data: CreateReviewRequest) => Promise<Review>;
  updateReview: (
    reviewId: string,
    data: UpdateReviewRequest
  ) => Promise<Review>;
  deleteReview: (reviewId: string) => Promise<void>;

  // Actions - Seller Response
  addResponse: (
    reviewId: string,
    data: SellerResponseRequest
  ) => Promise<Review>;
  updateResponse: (
    reviewId: string,
    data: SellerResponseRequest
  ) => Promise<Review>;
  deleteResponse: (reviewId: string) => Promise<Review>;

  // Actions - Voting
  voteReview: (reviewId: string, voteType: VoteType) => Promise<void>;
  removeVote: (reviewId: string) => Promise<void>;

  // Actions - Flagging
  flagReview: (reviewId: string, data: FlagReviewRequest) => Promise<void>;

  // Actions - Images
  uploadImage: (reviewId: string, file: File) => Promise<ReviewImage>;
  deleteImage: (reviewId: string, imageId: string) => Promise<void>;

  // Actions - Admin
  fetchReviewsForModeration: (
    params?: AdminModerationQueryParams
  ) => Promise<void>;
  moderateReview: (
    reviewId: string,
    data: ModerateReviewRequest
  ) => Promise<void>;
  fetchFlaggedReviews: (params?: ReviewQueryParams) => Promise<void>;

  // Utility Actions
  setCurrentReview: (review: Review | null) => void;
  clearError: () => void;
  reset: () => void;
}

// ========================================
// Initial State
// ========================================

const initialState = {
  reviews: [],
  currentReview: null,
  stats: null,
  pagination: null,
  loading: false,
  error: null,
  uploadingImage: false,
};

// ========================================
// Store Implementation
// ========================================

export const useReviewStore = create<ReviewState>()(
  devtools(
    (set) => ({
      ...initialState,

      // ========================================
      // CRUD Operations
      // ========================================

      fetchReviews: async (params) => {
        set({ loading: true, error: null });
        try {
          const response = await reviewApi.getUserReviews(params);
          set({
            reviews: response.reviews,
            pagination: response.pagination,
            stats: response.stats || null,
            loading: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch reviews',
            loading: false,
          });
        }
      },

      fetchPackageReviews: async (params) => {
        set({ loading: true, error: null });
        try {
          const response = await reviewApi.getPackageReviews(params);
          set({
            reviews: response.reviews,
            pagination: response.pagination,
            stats: response.stats || null,
            loading: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch package reviews',
            loading: false,
          });
        }
      },

      fetchSellerReviews: async (params) => {
        set({ loading: true, error: null });
        try {
          const response = await reviewApi.getSellerReviews(params);
          set({
            reviews: response.reviews,
            pagination: response.pagination,
            stats: response.stats || null,
            loading: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch seller reviews',
            loading: false,
          });
        }
      },

      fetchReviewById: async (reviewId) => {
        set({ loading: true, error: null });
        try {
          const review = await reviewApi.getById(reviewId);
          set({
            currentReview: review,
            loading: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Failed to fetch review',
            loading: false,
          });
        }
      },

      createReview: async (data) => {
        set({ loading: true, error: null });
        try {
          const review = await reviewApi.create(data);
          set((state) => ({
            reviews: [review, ...state.reviews],
            loading: false,
          }));
          return review;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to create review',
            loading: false,
          });
          throw error;
        }
      },

      updateReview: async (reviewId, data) => {
        set({ loading: true, error: null });
        try {
          const updatedReview = await reviewApi.update(reviewId, data);
          set((state) => ({
            reviews: state.reviews.map((r) =>
              r.id === reviewId ? updatedReview : r
            ),
            currentReview:
              state.currentReview?.id === reviewId
                ? updatedReview
                : state.currentReview,
            loading: false,
          }));
          return updatedReview;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to update review',
            loading: false,
          });
          throw error;
        }
      },

      deleteReview: async (reviewId) => {
        set({ loading: true, error: null });
        try {
          await reviewApi.delete(reviewId);
          set((state) => ({
            reviews: state.reviews.filter((r) => r.id !== reviewId),
            currentReview:
              state.currentReview?.id === reviewId ? null : state.currentReview,
            loading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to delete review',
            loading: false,
          });
          throw error;
        }
      },

      // ========================================
      // Seller Response
      // ========================================

      addResponse: async (reviewId, data) => {
        set({ loading: true, error: null });
        try {
          const updatedReview = await reviewApi.addResponse(reviewId, data);
          set((state) => ({
            reviews: state.reviews.map((r) =>
              r.id === reviewId ? updatedReview : r
            ),
            currentReview:
              state.currentReview?.id === reviewId
                ? updatedReview
                : state.currentReview,
            loading: false,
          }));
          return updatedReview;
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Failed to add response',
            loading: false,
          });
          throw error;
        }
      },

      updateResponse: async (reviewId, data) => {
        set({ loading: true, error: null });
        try {
          const updatedReview = await reviewApi.updateResponse(reviewId, data);
          set((state) => ({
            reviews: state.reviews.map((r) =>
              r.id === reviewId ? updatedReview : r
            ),
            currentReview:
              state.currentReview?.id === reviewId
                ? updatedReview
                : state.currentReview,
            loading: false,
          }));
          return updatedReview;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to update response',
            loading: false,
          });
          throw error;
        }
      },

      deleteResponse: async (reviewId) => {
        set({ loading: true, error: null });
        try {
          const updatedReview = await reviewApi.deleteResponse(reviewId);
          set((state) => ({
            reviews: state.reviews.map((r) =>
              r.id === reviewId ? updatedReview : r
            ),
            currentReview:
              state.currentReview?.id === reviewId
                ? updatedReview
                : state.currentReview,
            loading: false,
          }));
          return updatedReview;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to delete response',
            loading: false,
          });
          throw error;
        }
      },

      // ========================================
      // Voting
      // ========================================

      voteReview: async (reviewId, voteType) => {
        try {
          const updatedReview = await reviewApi.vote(reviewId, voteType);
          set((state) => ({
            reviews: state.reviews.map((r) =>
              r.id === reviewId ? updatedReview : r
            ),
            currentReview:
              state.currentReview?.id === reviewId
                ? updatedReview
                : state.currentReview,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to vote',
          });
          throw error;
        }
      },

      removeVote: async (reviewId) => {
        try {
          const updatedReview = await reviewApi.removeVote(reviewId);
          set((state) => ({
            reviews: state.reviews.map((r) =>
              r.id === reviewId ? updatedReview : r
            ),
            currentReview:
              state.currentReview?.id === reviewId
                ? updatedReview
                : state.currentReview,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Failed to remove vote',
          });
          throw error;
        }
      },

      // ========================================
      // Flagging
      // ========================================

      flagReview: async (reviewId, data) => {
        try {
          await reviewApi.flag(reviewId, data);
          // Optionally update UI to show flagged state
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Failed to flag review',
          });
          throw error;
        }
      },

      // ========================================
      // Images
      // ========================================

      uploadImage: async (reviewId, file) => {
        set({ uploadingImage: true, error: null });
        try {
          const image = await reviewApi.uploadImage(reviewId, file);
          set((state) => {
            const updatedReviews = state.reviews.map((r) =>
              r.id === reviewId
                ? { ...r, images: [...(r.images || []), image] }
                : r
            );
            const updatedCurrentReview =
              state.currentReview?.id === reviewId
                ? {
                    ...state.currentReview,
                    images: [...(state.currentReview.images || []), image],
                  }
                : state.currentReview;

            return {
              reviews: updatedReviews,
              currentReview: updatedCurrentReview,
              uploadingImage: false,
            };
          });
          return image;
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Failed to upload image',
            uploadingImage: false,
          });
          throw error;
        }
      },

      deleteImage: async (reviewId, imageId) => {
        try {
          await reviewApi.deleteImage(reviewId, imageId);
          set((state) => {
            const updatedReviews = state.reviews.map((r) =>
              r.id === reviewId
                ? {
                    ...r,
                    images: (r.images || []).filter(
                      (img) => img.id !== imageId
                    ),
                  }
                : r
            );
            const updatedCurrentReview =
              state.currentReview?.id === reviewId
                ? {
                    ...state.currentReview,
                    images: (state.currentReview.images || []).filter(
                      (img) => img.id !== imageId
                    ),
                  }
                : state.currentReview;

            return {
              reviews: updatedReviews,
              currentReview: updatedCurrentReview,
            };
          });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Failed to delete image',
          });
          throw error;
        }
      },

      // ========================================
      // Admin Operations
      // ========================================

      fetchReviewsForModeration: async (params) => {
        set({ loading: true, error: null });
        try {
          const response = await reviewApi.getForModeration(params);
          set({
            reviews: response.reviews,
            pagination: response.pagination,
            loading: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch reviews for moderation',
            loading: false,
          });
        }
      },

      moderateReview: async (reviewId, data) => {
        set({ loading: true, error: null });
        try {
          const updatedReview = await reviewApi.moderate(reviewId, data);
          set((state) => ({
            reviews: state.reviews.map((r) =>
              r.id === reviewId ? updatedReview : r
            ),
            loading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to moderate review',
            loading: false,
          });
          throw error;
        }
      },

      fetchFlaggedReviews: async (params) => {
        set({ loading: true, error: null });
        try {
          const response = await reviewApi.getFlagged(params);
          set({
            reviews: response.reviews,
            pagination: response.pagination,
            loading: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to fetch flagged reviews',
            loading: false,
          });
        }
      },

      // ========================================
      // Utility Actions
      // ========================================

      setCurrentReview: (review) => set({ currentReview: review }),

      clearError: () => set({ error: null }),

      reset: () => set(initialState),
    }),
    { name: 'ReviewStore' }
  )
);

// ========================================
// Selectors (Optional but Recommended)
// ========================================

export const selectReviews = (state: ReviewState) => state.reviews;
export const selectCurrentReview = (state: ReviewState) => state.currentReview;
export const selectStats = (state: ReviewState) => state.stats;
export const selectPagination = (state: ReviewState) => state.pagination;
export const selectLoading = (state: ReviewState) => state.loading;
export const selectError = (state: ReviewState) => state.error;
export const selectUploadingImage = (state: ReviewState) =>
  state.uploadingImage;
