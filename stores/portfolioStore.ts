/**
 * ================================================
 * PORTFOLIO STORE
 * ================================================
 * Sprint 1 - Story 1.2: Portfolio State Management
 *
 * Zustand store for managing portfolio state with:
 * - Optimistic updates for better UX
 * - Comprehensive error handling
 * - UI state management (loading, modals, etc.)
 * - CRUD operations for portfolio items
 * - Image management
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import * as portfolioApi from '@/lib/api/portfolio';
import type { PortfolioItem } from '@/types';
import type {
  CreatePortfolioRequest,
  UpdatePortfolioRequest,
  PortfolioResponse,
} from '@/lib/api/portfolio';

// ================================================
// TYPE DEFINITIONS
// ================================================

/**
 * UI state for portfolio components
 */
interface PortfolioUIState {
  isLoading: boolean;
  isSubmitting: boolean;
  isUploadingImage: boolean;
  isReordering: boolean;
  error: string | null;

  // Modal states
  createModalOpen: boolean;
  editModalOpen: boolean;
  viewModalOpen: boolean;
  deleteConfirmOpen: boolean;

  // Selected items
  selectedPortfolio: PortfolioItem | null;
  portfolioToDelete: string | null;
}

/**
 * Pagination state
 */
interface PaginationState {
  page: number;
  size: number;
  totalElements: number;
  hasMore: boolean;
}

/**
 * Main store interface
 */
interface PortfolioStore {
  // State
  portfolios: PortfolioItem[];
  myPortfolios: PortfolioItem[];
  currentPortfolio: PortfolioItem | null;
  pagination: PaginationState;
  ui: PortfolioUIState;

  // Portfolio CRUD Actions
  fetchMyPortfolios: () => Promise<void>;
  fetchUserPortfolios: (userId: string, page?: number) => Promise<void>;
  fetchPortfolio: (id: string) => Promise<void>;
  createPortfolio: (data: CreatePortfolioRequest) => Promise<PortfolioItem>;
  updatePortfolio: (id: string, data: UpdatePortfolioRequest) => Promise<void>;
  deletePortfolio: (id: string) => Promise<void>;
  reorderPortfolios: (portfolioIds: string[]) => Promise<void>;

  // Image Actions
  uploadImage: (
    portfolioId: string,
    file: File,
    isPrimary?: boolean
  ) => Promise<void>;
  deleteImage: (portfolioId: string, imageId: string) => Promise<void>;

  // UI Actions
  setCreateModalOpen: (open: boolean) => void;
  setEditModalOpen: (open: boolean, portfolio?: PortfolioItem | null) => void;
  setViewModalOpen: (open: boolean, portfolio?: PortfolioItem | null) => void;
  setDeleteConfirmOpen: (open: boolean, portfolioId?: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

// ================================================
// INITIAL STATE
// ================================================

const initialUIState: PortfolioUIState = {
  isLoading: false,
  isSubmitting: false,
  isUploadingImage: false,
  isReordering: false,
  error: null,
  createModalOpen: false,
  editModalOpen: false,
  viewModalOpen: false,
  deleteConfirmOpen: false,
  selectedPortfolio: null,
  portfolioToDelete: null,
};

const initialPagination: PaginationState = {
  page: 0,
  size: 20,
  totalElements: 0,
  hasMore: false,
};

// ================================================
// HELPER FUNCTIONS
// ================================================

/**
 * Convert PortfolioResponse to PortfolioItem
 */
function convertToPortfolioItem(response: PortfolioResponse): PortfolioItem {
  return portfolioApi.convertToPortfolioItem(response);
}

// ================================================
// ZUSTAND STORE
// ================================================

export const usePortfolioStore = create<PortfolioStore>()(
  devtools(
    (set, get) => ({
      // Initial State
      portfolios: [],
      myPortfolios: [],
      currentPortfolio: null,
      pagination: initialPagination,
      ui: initialUIState,

      // ==================== FETCH ACTIONS ====================

      /**
       * Fetch current user's portfolios
       */
      fetchMyPortfolios: async () => {
        set((state) => ({
          ui: { ...state.ui, isLoading: true, error: null },
        }));

        try {
          const data = await portfolioApi.getMyPortfolio();
          const portfolioItems = data.map(convertToPortfolioItem);

          set({
            myPortfolios: portfolioItems,
            ui: { ...get().ui, isLoading: false },
          });
        } catch (error) {
          set((state) => ({
            ui: {
              ...state.ui,
              isLoading: false,
              error:
                error instanceof Error
                  ? error.message
                  : 'Portföy öğeleri yüklenemedi',
            },
          }));
          throw error;
        }
      },

      /**
       * Fetch another user's portfolios (for public profile view)
       */
      fetchUserPortfolios: async (userId: string, page = 0) => {
        set((state) => ({
          ui: { ...state.ui, isLoading: true, error: null },
        }));

        try {
          const response = await portfolioApi.getUserPortfolio(
            userId,
            page,
            get().pagination.size
          );

          const portfolioItems = response.content.map(convertToPortfolioItem);

          set({
            portfolios: portfolioItems,
            pagination: {
              page,
              size: get().pagination.size,
              totalElements: response.totalElements,
              hasMore:
                (page + 1) * get().pagination.size < response.totalElements,
            },
            ui: { ...get().ui, isLoading: false },
          });
        } catch (error) {
          set((state) => ({
            ui: {
              ...state.ui,
              isLoading: false,
              error:
                error instanceof Error
                  ? error.message
                  : 'Kullanıcı portföyü yüklenemedi',
            },
          }));
          throw error;
        }
      },

      /**
       * Fetch a single portfolio item
       */
      fetchPortfolio: async (id: string) => {
        set((state) => ({
          ui: { ...state.ui, isLoading: true, error: null },
        }));

        try {
          const data = await portfolioApi.getPortfolio(id);
          const portfolioItem = convertToPortfolioItem(data);

          set({
            currentPortfolio: portfolioItem,
            ui: { ...get().ui, isLoading: false },
          });
        } catch (error) {
          set((state) => ({
            ui: {
              ...state.ui,
              isLoading: false,
              error:
                error instanceof Error
                  ? error.message
                  : 'Portföy öğesi yüklenemedi',
            },
          }));
          throw error;
        }
      },

      // ==================== CREATE/UPDATE/DELETE ACTIONS ====================

      /**
       * Create new portfolio item
       */
      createPortfolio: async (data: CreatePortfolioRequest) => {
        set((state) => ({
          ui: { ...state.ui, isSubmitting: true, error: null },
        }));

        try {
          const response = await portfolioApi.createPortfolio(data);
          const newPortfolio = convertToPortfolioItem(response);

          // Add to myPortfolios list
          set((state) => ({
            myPortfolios: [newPortfolio, ...state.myPortfolios],
            ui: {
              ...state.ui,
              isSubmitting: false,
              createModalOpen: false,
            },
          }));

          return newPortfolio;
        } catch (error) {
          set((state) => ({
            ui: {
              ...state.ui,
              isSubmitting: false,
              error:
                error instanceof Error
                  ? error.message
                  : 'Portföy öğesi oluşturulamadı',
            },
          }));
          throw error;
        }
      },

      /**
       * Update existing portfolio item
       */
      updatePortfolio: async (id: string, data: UpdatePortfolioRequest) => {
        set((state) => ({
          ui: { ...state.ui, isSubmitting: true, error: null },
        }));

        try {
          const response = await portfolioApi.updatePortfolio(id, data);
          const updatedPortfolio = convertToPortfolioItem(response);

          // Update in myPortfolios list
          set((state) => ({
            myPortfolios: state.myPortfolios.map((p) =>
              p.id === id ? updatedPortfolio : p
            ),
            currentPortfolio:
              state.currentPortfolio?.id === id
                ? updatedPortfolio
                : state.currentPortfolio,
            ui: {
              ...state.ui,
              isSubmitting: false,
              editModalOpen: false,
              selectedPortfolio: null,
            },
          }));
        } catch (error) {
          set((state) => ({
            ui: {
              ...state.ui,
              isSubmitting: false,
              error:
                error instanceof Error
                  ? error.message
                  : 'Portföy öğesi güncellenemedi',
            },
          }));
          throw error;
        }
      },

      /**
       * Delete portfolio item
       */
      deletePortfolio: async (id: string) => {
        set((state) => ({
          ui: { ...state.ui, isSubmitting: true, error: null },
        }));

        try {
          await portfolioApi.deletePortfolio(id);

          // Remove from myPortfolios list
          set((state) => ({
            myPortfolios: state.myPortfolios.filter((p) => p.id !== id),
            currentPortfolio:
              state.currentPortfolio?.id === id ? null : state.currentPortfolio,
            ui: {
              ...state.ui,
              isSubmitting: false,
              deleteConfirmOpen: false,
              portfolioToDelete: null,
            },
          }));
        } catch (error) {
          set((state) => ({
            ui: {
              ...state.ui,
              isSubmitting: false,
              error:
                error instanceof Error
                  ? error.message
                  : 'Portföy öğesi silinemedi',
            },
          }));
          throw error;
        }
      },

      /**
       * Reorder portfolio items
       */
      reorderPortfolios: async (portfolioIds: string[]) => {
        // Store original order for rollback
        const originalOrder = [...get().myPortfolios];

        // Optimistic update - reorder immediately in UI
        set((state) => {
          const reordered = portfolioIds
            .map((id) => state.myPortfolios.find((p) => p.id === id))
            .filter((p): p is PortfolioItem => p !== undefined);

          return {
            myPortfolios: reordered,
            ui: { ...state.ui, isReordering: true, error: null },
          };
        });

        try {
          await portfolioApi.reorderPortfolio(portfolioIds);

          set((state) => ({
            ui: { ...state.ui, isReordering: false },
          }));
        } catch (error) {
          // Rollback on error
          set((state) => ({
            myPortfolios: originalOrder,
            ui: {
              ...state.ui,
              isReordering: false,
              error:
                error instanceof Error
                  ? error.message
                  : 'Portföy sıralaması güncellenemedi',
            },
          }));
          throw error;
        }
      },

      // ==================== IMAGE ACTIONS ====================

      /**
       * Upload image to portfolio
       */
      uploadImage: async (
        portfolioId: string,
        file: File,
        isPrimary = false
      ) => {
        set((state) => ({
          ui: { ...state.ui, isUploadingImage: true, error: null },
        }));

        try {
          const imageResponse = await portfolioApi.uploadPortfolioImage(
            portfolioId,
            file,
            isPrimary
          );

          // Update the portfolio with new image
          set((state) => ({
            myPortfolios: state.myPortfolios.map((p) => {
              if (p.id === portfolioId) {
                return {
                  ...p,
                  images: [...(p.images || []), imageResponse.imageUrl],
                  imageUrl: isPrimary ? imageResponse.imageUrl : p.imageUrl,
                  image: isPrimary ? imageResponse.imageUrl : p.image,
                };
              }
              return p;
            }),
            currentPortfolio:
              state.currentPortfolio?.id === portfolioId
                ? {
                    ...state.currentPortfolio,
                    images: [
                      ...(state.currentPortfolio.images || []),
                      imageResponse.imageUrl,
                    ],
                    imageUrl: isPrimary
                      ? imageResponse.imageUrl
                      : state.currentPortfolio.imageUrl,
                    image: isPrimary
                      ? imageResponse.imageUrl
                      : state.currentPortfolio.image,
                  }
                : state.currentPortfolio,
            ui: { ...state.ui, isUploadingImage: false },
          }));
        } catch (error) {
          set((state) => ({
            ui: {
              ...state.ui,
              isUploadingImage: false,
              error:
                error instanceof Error ? error.message : 'Resim yüklenemedi',
            },
          }));
          throw error;
        }
      },

      /**
       * Delete image from portfolio
       */
      deleteImage: async (portfolioId: string, imageId: string) => {
        set((state) => ({
          ui: { ...state.ui, isSubmitting: true, error: null },
        }));

        try {
          await portfolioApi.deletePortfolioImage(portfolioId, imageId);

          // Remove image from portfolio (we need to refetch to get updated state)
          // In a real scenario, we'd need the image URL to filter it out
          // For now, we'll just refetch the portfolio
          await get().fetchMyPortfolios();

          set((state) => ({
            ui: { ...state.ui, isSubmitting: false },
          }));
        } catch (error) {
          set((state) => ({
            ui: {
              ...state.ui,
              isSubmitting: false,
              error:
                error instanceof Error ? error.message : 'Resim silinemedi',
            },
          }));
          throw error;
        }
      },

      // ==================== UI ACTIONS ====================

      setCreateModalOpen: (open: boolean) => {
        set((state) => ({
          ui: { ...state.ui, createModalOpen: open, error: null },
        }));
      },

      setEditModalOpen: (
        open: boolean,
        portfolio: PortfolioItem | null = null
      ) => {
        set((state) => ({
          ui: {
            ...state.ui,
            editModalOpen: open,
            selectedPortfolio: portfolio,
            error: null,
          },
        }));
      },

      setViewModalOpen: (
        open: boolean,
        portfolio: PortfolioItem | null = null
      ) => {
        set((state) => ({
          ui: {
            ...state.ui,
            viewModalOpen: open,
            selectedPortfolio: portfolio,
            error: null,
          },
        }));
      },

      setDeleteConfirmOpen: (
        open: boolean,
        portfolioId: string | null = null
      ) => {
        set((state) => ({
          ui: {
            ...state.ui,
            deleteConfirmOpen: open,
            portfolioToDelete: portfolioId,
            error: null,
          },
        }));
      },

      clearError: () => {
        set((state) => ({
          ui: { ...state.ui, error: null },
        }));
      },

      reset: () => {
        set({
          portfolios: [],
          myPortfolios: [],
          currentPortfolio: null,
          pagination: initialPagination,
          ui: initialUIState,
        });
      },
    }),
    { name: 'PortfolioStore' }
  )
);

// ================================================
// SELECTOR HOOKS (Optional - for performance)
// ================================================

/**
 * Hook to get only UI state (prevents unnecessary re-renders)
 */
export const usePortfolioUI = () => usePortfolioStore((state) => state.ui);

/**
 * Hook to get only portfolios data
 */
export const useMyPortfolios = () =>
  usePortfolioStore((state) => state.myPortfolios);

/**
 * Hook to get only loading state
 */
export const usePortfolioLoading = () =>
  usePortfolioStore((state) => state.ui.isLoading);
