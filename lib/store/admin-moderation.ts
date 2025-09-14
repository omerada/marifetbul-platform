import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  AdminModerationStore,
  ModerationItem,
  ModerationFilters,
  ModerationActionRequest,
} from '@/types';

export const useAdminModerationStore = create<AdminModerationStore>()(
  devtools(
    immer((set, get) => ({
      // State
      items: [],
      selectedItem: null,
      selectedItems: [],
      stats: null,
      isLoading: false,
      error: null,
      filters: {},
      pagination: null,

      // Computed properties (using getters)
      get pendingItems() {
        return get().items.filter((item) => item.status === 'pending');
      },
      get approvedItems() {
        return get().items.filter((item) => item.status === 'approved');
      },
      get rejectedItems() {
        return get().items.filter((item) => item.status === 'rejected');
      },
      get escalatedItems() {
        return get().items.filter((item) => item.status === 'escalated');
      },
      get highPriorityItems() {
        return get().items.filter(
          (item) => item.priority === 'high' || item.priority === 'urgent'
        );
      },
      get urgentItems() {
        return get().items.filter((item) => item.priority === 'urgent');
      },

      // Actions
      fetchModerationQueue: async (filters?: ModerationFilters) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
          if (filters) {
            state.filters = { ...state.filters, ...filters };
          }
        });

        try {
          const queryParams = new URLSearchParams();
          const currentFilters = get().filters;

          Object.entries(currentFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              if (Array.isArray(value)) {
                value.forEach((v) => queryParams.append(`${key}[]`, String(v)));
              } else {
                queryParams.append(key, String(value));
              }
            }
          });

          const response = await fetch(
            `/api/v1/admin/moderation/queue?${queryParams.toString()}`,
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          if (!response.ok) {
            throw new Error('Moderasyon kuyruğu alınamadı');
          }

          const result = await response.json();

          set((state) => {
            state.items = result.data.items;
            state.pagination = result.data.pagination;
            state.isLoading = false;
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Bilinmeyen hata';
            state.isLoading = false;
          });
        }
      },

      fetchModerationStats: async () => {
        try {
          const response = await fetch('/api/v1/admin/moderation/stats', {
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error('Moderasyon istatistikleri alınamadı');
          }

          const result = await response.json();

          set((state) => {
            state.stats = result.data;
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Bilinmeyen hata';
          });
        }
      },

      performModerationAction: async (
        itemId: string,
        action: ModerationActionRequest
      ) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const response = await fetch(
            `/api/v1/admin/moderation/${itemId}/action`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(action),
            }
          );

          if (!response.ok) {
            throw new Error('Moderasyon işlemi gerçekleştirilemedi');
          }

          const result = await response.json();

          set((state) => {
            // Update item in list if exists
            const itemIndex = state.items.findIndex(
              (item) => item.id === itemId
            );
            if (itemIndex !== -1 && result.data?.item) {
              state.items[itemIndex] = result.data.item;
            }

            // Update selected item if it's the same
            if (state.selectedItem?.id === itemId && result.data?.item) {
              state.selectedItem = result.data.item;
            }

            state.isLoading = false;
          });

          // Refresh stats after action
          // fetchModerationStats will be called separately if needed
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Bilinmeyen hata';
            state.isLoading = false;
          });
        }
      },

      assignModerator: async (itemId: string, moderatorId: string) => {
        try {
          const response = await fetch(
            `/api/v1/admin/moderation/${itemId}/assign`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ moderatorId }),
            }
          );

          if (!response.ok) {
            throw new Error('Moderatör ataması yapılamadı');
          }

          const result = await response.json();

          set((state) => {
            const itemIndex = state.items.findIndex(
              (item) => item.id === itemId
            );
            if (itemIndex !== -1 && result.data?.item) {
              state.items[itemIndex] = result.data.item;
            }

            if (state.selectedItem?.id === itemId && result.data?.item) {
              state.selectedItem = result.data.item;
            }
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Bilinmeyen hata';
          });
        }
      },

      escalateItem: async (itemId: string, reason: string) => {
        try {
          const response = await fetch(
            `/api/v1/admin/moderation/${itemId}/escalate`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ reason }),
            }
          );

          if (!response.ok) {
            throw new Error('Escalation işlemi gerçekleştirilemedi');
          }

          const result = await response.json();

          set((state) => {
            const itemIndex = state.items.findIndex(
              (item) => item.id === itemId
            );
            if (itemIndex !== -1 && result.data?.item) {
              state.items[itemIndex] = result.data.item;
            }

            if (state.selectedItem?.id === itemId && result.data?.item) {
              state.selectedItem = result.data.item;
            }
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Bilinmeyen hata';
          });
        }
      },

      setFilters: (filters: Partial<ModerationFilters>) => {
        set((state) => {
          state.filters = { ...state.filters, ...filters };
        });
      },

      selectItem: (item: ModerationItem | null) => {
        set((state) => {
          state.selectedItem = item;
        });
      },

      clearError: () => {
        set((state) => {
          state.error = null;
        });
      },

      // Missing required methods
      fetchItems: async (filters?: ModerationFilters) => {
        await get().fetchModerationQueue(filters);
      },

      approveItem: async (itemId: string, reason?: string) => {
        try {
          set((state) => {
            state.isLoading = true;
          });

          const response = await fetch(
            `/api/v1/admin/moderation/items/${itemId}/approve`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reason }),
            }
          );

          if (!response.ok) throw new Error('Onay işlemi başarısız');

          set((state) => {
            const item = state.items.find((i) => i.id === itemId);
            if (item) item.status = 'approved';
            state.isLoading = false;
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Hata oluştu';
            state.isLoading = false;
          });
        }
      },

      rejectItem: async (itemId: string, reason: string) => {
        try {
          set((state) => {
            state.isLoading = true;
          });

          const response = await fetch(
            `/api/v1/admin/moderation/items/${itemId}/reject`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reason }),
            }
          );

          if (!response.ok) throw new Error('Reddetme işlemi başarısız');

          set((state) => {
            const item = state.items.find((i) => i.id === itemId);
            if (item) item.status = 'rejected';
            state.isLoading = false;
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Hata oluştu';
            state.isLoading = false;
          });
        }
      },

      bulkAction: async (
        action: 'approve' | 'reject' | 'escalate',
        itemIds: string[],
        reason?: string
      ) => {
        try {
          set((state) => {
            state.isLoading = true;
          });

          const response = await fetch('/api/v1/admin/moderation/bulk-action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, itemIds, reason }),
          });

          if (!response.ok) throw new Error('Toplu işlem başarısız');

          set((state) => {
            itemIds.forEach((itemId) => {
              const item = state.items.find((i) => i.id === itemId);
              if (item) {
                if (action === 'approve') item.status = 'approved';
                else if (action === 'reject') item.status = 'rejected';
                else if (action === 'escalate') item.status = 'escalated';
              }
            });
            state.isLoading = false;
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Hata oluştu';
            state.isLoading = false;
          });
        }
      },

      selectAllItems: () => {
        set((state) => {
          state.selectedItems = state.items.map((item) => item.id);
        });
      },

      clearSelection: () => {
        set((state) => {
          state.selectedItems = [];
        });
      },

      clearFilters: () => {
        set((state) => {
          state.filters = {};
        });
      },
    })),
    {
      name: 'admin-moderation',
    }
  )
);

// Selectors
export const useAdminModerationSelectors = () => {
  const store = useAdminModerationStore();

  return {
    // Basic selectors
    items: store.items,
    selectedItem: store.selectedItem,
    stats: store.stats,
    filters: store.filters,
    pagination: store.pagination,

    // Computed selectors
    totalItems: store.stats?.totalItems || 0,
    pendingItems: store.items.filter((item) => item.status === 'pending')
      .length,
    approvedItems: store.items.filter((item) => item.status === 'approved')
      .length,
    rejectedItems: store.items.filter((item) => item.status === 'rejected')
      .length,
    escalatedItems: store.items.filter((item) => item.status === 'escalated')
      .length,

    // Priority based items
    highPriorityItems: store.items.filter(
      (item) => item.priority === 'high' || item.priority === 'urgent'
    ).length,
    urgentItems: store.items.filter((item) => item.priority === 'urgent')
      .length,

    // Type based items
    reviewItems: store.items.filter((item) => item.type === 'review').length,
    jobItems: store.items.filter((item) => item.type === 'job').length,
    serviceItems: store.items.filter((item) => item.type === 'service').length,
    profileItems: store.items.filter((item) => item.type === 'profile').length,

    // Moderation performance
    averageReviewTime: store.stats?.averageReviewTime || 0,
    automatedFlagAccuracy: store.stats?.automatedFlagAccuracy || 0,

    // State selectors
    isLoading: store.isLoading,
    error: store.error,
    hasData: store.items.length > 0,
    hasStats: !!store.stats,
  };
};

export default useAdminModerationStore;
