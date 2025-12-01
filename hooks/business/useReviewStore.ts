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
import { toast } from 'sonner';
import { reviewApi } from '@/lib/api/review';
import { moderationApi } from '@/lib/api/moderation';
import { getErrorMessage, logError } from '@/lib/shared/errors';
import {
  transformReviewResponse,
  transformReviewResponses,
} from '@/lib/transformers/review.transformer';
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
  fetchUserReviews: (params?: ReviewQueryParams) => Promise<void>;
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
  addSellerResponse: (
    reviewId: string,
    data: SellerResponseRequest
  ) => Promise<Review>;
  updateSellerResponse: (
    reviewId: string,
    data: SellerResponseRequest
  ) => Promise<Review>;
  deleteSellerResponse: (reviewId: string) => Promise<Review>;

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
          const errorMessage = getErrorMessage(error);
          logError(error, { action: 'fetchReviews', params });

          set({
            error: errorMessage,
            loading: false,
          });

          toast.error(errorMessage);
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
          const errorMessage = getErrorMessage(error);
          logError(error, { action: 'fetchPackageReviews', params });

          set({
            error: errorMessage,
            loading: false,
          });

          toast.error(errorMessage);
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
          const errorMessage = getErrorMessage(error);
          logError(error, { action: 'fetchSellerReviews', params });

          set({
            error: errorMessage,
            loading: false,
          });

          toast.error(errorMessage);
        }
      },

      fetchReviewById: async (reviewId) => {
        set({ loading: true, error: null });
        try {
          const backendReview = await reviewApi.getById(reviewId);
          const transformedReview = transformReviewResponse(backendReview);
          set({
            currentReview: transformedReview,
            loading: false,
          });
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          logError(error, { action: 'fetchReviewById', reviewId });

          set({
            error: errorMessage,
            loading: false,
          });

          toast.error(errorMessage);
        }
      },

      createReview: async (data) => {
        set({ loading: true, error: null });
        try {
          const backendReview = await reviewApi.create(data);
          const transformedReview = transformReviewResponse(backendReview);
          set((state) => ({
            ...state,
            reviews: [transformedReview, ...state.reviews],
            loading: false,
          }));

          toast.success('Değerlendirmeniz başarıyla oluşturuldu');
          return backendReview;
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          logError(error, { action: 'createReview', data });

          set({
            error: errorMessage,
            loading: false,
          });

          toast.error(errorMessage || 'Değerlendirme oluşturulamadı');
          throw error;
        }
      },

      updateReview: async (reviewId, data) => {
        set({ loading: true, error: null });
        try {
          const backendReview = await reviewApi.update(reviewId, data);
          const transformedReview = transformReviewResponse(backendReview);
          set((state: ReviewState) => ({
            ...state,
            reviews: state.reviews.map((r) =>
              r.id === reviewId ? transformedReview : r
            ),
            currentReview:
              state.currentReview?.id === reviewId
                ? transformedReview
                : state.currentReview,
            loading: false,
          }));

          toast.success('Değerlendirmeniz güncellendi');
          return backendReview;
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          logError(error, { action: 'updateReview', reviewId, data });

          set({
            error: errorMessage,
            loading: false,
          });

          toast.error(errorMessage || 'Değerlendirme güncellenemedi');
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

          toast.success('Değerlendirme silindi');
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          logError(error, { action: 'deleteReview', reviewId });

          set({
            error: errorMessage,
            loading: false,
          });

          toast.error(errorMessage || 'Değerlendirme silinemedi');
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

          toast.success('Yanıtınız eklendi');
          return updatedReview;
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          logError(error, { action: 'addResponse', reviewId, data });

          set({
            error: errorMessage,
            loading: false,
          });

          toast.error(errorMessage || 'Yanıt eklenemedi');
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

          toast.success('Yanıtınız güncellendi');
          return updatedReview;
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          logError(error, { action: 'updateResponse', reviewId, data });

          set({
            error: errorMessage,
            loading: false,
          });

          toast.error(errorMessage || 'Yanıt güncellenemedi');
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

          toast.success('Yanıt silindi');
          return updatedReview;
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          logError(error, { action: 'deleteResponse', reviewId });

          set({
            error: errorMessage,
            loading: false,
          });

          toast.error(errorMessage || 'Yanıt silinemedi');
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

          toast.success('Oyunuz kaydedildi');
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          logError(error, { action: 'voteReview', reviewId, voteType });

          set({ error: errorMessage });
          toast.error(errorMessage || 'Oy kullanılamadı');
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

          toast.success('Oyunuz kaldırıldı');
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          logError(error, { action: 'removeVote', reviewId });

          set({ error: errorMessage });
          toast.error(errorMessage || 'Oy kaldırılamadı');
          throw error;
        }
      },

      // ========================================
      // Flagging
      // ========================================

      flagReview: async (reviewId, data) => {
        try {
          await reviewApi.flag(reviewId, data);
          toast.success('Değerlendirme bildirildi');
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          logError(error, { action: 'flagReview', reviewId, data });

          set({ error: errorMessage });
          toast.error(errorMessage || 'Bildirim gönderilemedi');
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

          toast.success('Görsel yüklendi');
          return image;
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          logError(error, {
            action: 'uploadImage',
            reviewId,
            fileName: file.name,
          });

          set({
            error: errorMessage,
            uploadingImage: false,
          });

          toast.error(errorMessage || 'Görsel yüklenemedi');
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

          toast.success('Görsel silindi');
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          logError(error, { action: 'deleteImage', reviewId, imageId });

          set({ error: errorMessage });
          toast.error(errorMessage || 'Görsel silinemedi');
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
          const errorMessage = getErrorMessage(error);
          logError(error, { action: 'fetchReviewsForModeration', params });

          set({
            error: errorMessage,
            loading: false,
          });

          toast.error(errorMessage);
        }
      },

      moderateReview: async (reviewId, data) => {
        set({ loading: true, error: null });
        try {
          // data.action APPROVE veya REJECT olabilir
          const updatedReview =
            data.action === 'APPROVE'
              ? await reviewApi.approve(reviewId)
              : await reviewApi.reject(
                  reviewId,
                  data.reason ?? 'No reason provided'
                );
          set((state) => ({
            reviews: state.reviews.map((r) =>
              r.id === reviewId ? updatedReview : r
            ),
            loading: false,
          }));

          toast.success('Değerlendirme moderasyonu tamamlandı');
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          logError(error, { action: 'moderateReview', reviewId, data });

          set({
            error: errorMessage,
            loading: false,
          });

          toast.error(errorMessage || 'Moderasyon işlemi başarısız');
          throw error;
        }
      },

      fetchFlaggedReviews: async (params) => {
        set({ loading: true, error: null });
        try {
          const response = await moderationApi.getFlaggedReviews(
            params?.page ?? 0,
            params?.pageSize ?? 20
          );
          set({
            reviews: (response.content as any).map(transformReviewResponse),
            pagination: {
              page: response.page,
              pageSize: response.size,
              totalElements: response.totalElements,
              totalPages: response.totalPages,
              hasNext: !response.last,
              hasPrevious: !response.first,
            },
            loading: false,
          });
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          logError(error, { action: 'fetchFlaggedReviews', params });

          set({
            error: errorMessage,
            loading: false,
          });

          toast.error(errorMessage);
        }
      },

      // ========================================
      // Utility Actions
      // ========================================

      setCurrentReview: (review) => set({ currentReview: review }),

      clearError: () => set({ error: null }),

      reset: () => set(initialState),

      // ========================================
      // Aliases for backwards compatibility
      // ========================================

      fetchUserReviews: async (params) => {
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
          const errorMessage = getErrorMessage(error);
          logError(error, { action: 'fetchUserReviews', params });

          set({
            error: errorMessage,
            loading: false,
          });

          toast.error(errorMessage);
        }
      },

      addSellerResponse: async (reviewId, data) => {
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

          toast.success('Yanıt eklendi');
          return updatedReview;
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          logError(error, { action: 'addSellerResponse', reviewId, data });

          set({
            error: errorMessage,
            loading: false,
          });

          toast.error(errorMessage || 'Yanıt eklenemedi');
          throw error;
        }
      },

      updateSellerResponse: async (reviewId, data) => {
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

          toast.success('Yanıt güncellendi');
          return updatedReview;
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          logError(error, { action: 'updateSellerResponse', reviewId, data });

          set({
            error: errorMessage,
            loading: false,
          });

          toast.error(errorMessage || 'Yanıt güncellenemedi');
          throw error;
        }
      },

      deleteSellerResponse: async (reviewId) => {
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

          toast.success('Yanıt silindi');
          return updatedReview;
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          logError(error, { action: 'deleteSellerResponse', reviewId });

          set({
            error: errorMessage,
            loading: false,
          });

          toast.error(errorMessage || 'Yanıt silinemedi');
          throw error;
        }
      },
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
