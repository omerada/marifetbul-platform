import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { logger } from '@/lib/shared/utils/logger';
import type {
  AdminUserStore,
  AdminUserData,
  UserFilters,
  UserActionRequest,
  BulkUserActionRequest,
} from '@/types';

// Request tracking to prevent duplicate calls
let lastFetchRequest: string | null = null;
let lastFetchTime = 0;
const MIN_FETCH_INTERVAL = 500; // Minimum 500ms between requests

export const useAdminUserStore = create<AdminUserStore>()(
  devtools(
    immer((set, get) => ({
      // State
      users: [],
      currentUser: null,
      selectedUser: null,
      totalUsers: 0,
      isLoading: false,
      error: null,
      filters: {},
      pagination: null,
      bulkSelectedIds: [],
      sortBy: '',
      sortOrder: 'asc',

      // Actions
      fetchUsers: async (filters?: UserFilters) => {
        // Prevent duplicate requests
        const currentFilters = { ...get().filters, ...filters };
        const requestKey = JSON.stringify(currentFilters);
        const now = Date.now();

        // Skip if same request within interval
        if (
          lastFetchRequest === requestKey &&
          now - lastFetchTime < MIN_FETCH_INTERVAL
        ) {
          logger.debug('[useAdminUserStore] Skipping duplicate request');
          return;
        }

        // Skip if already loading
        if (get().isLoading) {
          logger.debug('[useAdminUserStore] Already loading, skipping request');
          return;
        }

        lastFetchRequest = requestKey;
        lastFetchTime = now;

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
            `/api/v1/admin/users?${queryParams.toString()}`,
            {
              method: 'GET',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          if (!response.ok) {
            throw new Error('Kullanıcı listesi alınamadı');
          }

          const result = await response.json();

          set((state) => {
            state.users = result.data || [];
            state.pagination = result.pagination || null;
            state.totalUsers = result.pagination?.total || 0;
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

      fetchUserById: async (userId: string): Promise<void> => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const response = await fetch(`/api/v1/admin/users/${userId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error('Kullanıcı bilgisi alınamadı');
          }

          const result = await response.json();

          set((state) => {
            state.selectedUser = result.data;
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

      performUserAction: async (request: UserActionRequest) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const response = await fetch(
            `/api/v1/admin/users/${request.userId}/action`,
            {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(request),
            }
          );

          if (!response.ok) {
            throw new Error('Kullanıcı işlemi gerçekleştirilemedi');
          }

          const result = await response.json();

          set((state) => {
            // Update user in list if exists
            const userIndex = state.users.findIndex(
              (user) => user.id === request.userId
            );
            if (userIndex !== -1 && result.data?.user) {
              state.users[userIndex] = result.data.user;
            }

            // Update selected user if it's the same
            if (
              state.selectedUser?.id === request.userId &&
              result.data?.user
            ) {
              state.selectedUser = result.data.user;
            }

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

      updateUser: async (userId: string, data: Partial<AdminUserData>) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const response = await fetch(`/api/v1/admin/users/${userId}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            throw new Error('Kullanıcı güncellenemedi');
          }

          const result = await response.json();

          set((state) => {
            // Update user in list
            const userIndex = state.users.findIndex(
              (user) => user.id === userId
            );
            if (userIndex !== -1 && result.data) {
              state.users[userIndex] = {
                ...state.users[userIndex],
                ...result.data,
              };
            }

            // Update selected user if it's the same
            if (state.selectedUser?.id === userId && result.data) {
              state.selectedUser = { ...state.selectedUser, ...result.data };
            }

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

      performBulkAction: async (action: BulkUserActionRequest) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const response = await fetch('/api/v1/admin/users/bulk-action', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(action),
          });

          if (!response.ok) {
            throw new Error('Toplu işlem gerçekleştirilemedi');
          }

          // Refresh users after bulk action
          await get().fetchUsers();

          set((state) => {
            state.bulkSelectedIds = [];
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

      setFilters: (filters: Partial<UserFilters>) => {
        set((state) => {
          state.filters = { ...state.filters, ...filters };
        });
      },

      selectUser: (user: AdminUserData | null) => {
        set((state) => {
          state.selectedUser = user;
        });
      },

      toggleBulkSelection: (userId: string) => {
        set((state) => {
          const index = state.bulkSelectedIds.indexOf(userId);
          if (index > -1) {
            state.bulkSelectedIds.splice(index, 1);
          } else {
            state.bulkSelectedIds.push(userId);
          }
        });
      },

      selectAllUsers: () => {
        set((state) => {
          state.bulkSelectedIds = state.users.map((user) => user.id);
        });
      },

      clearBulkSelection: () => {
        set((state) => {
          state.bulkSelectedIds = [];
        });
      },

      clearError: () => {
        set((state) => {
          state.error = null;
        });
      },
    })),
    {
      name: 'admin-user-store',
    }
  )
);

// Selectors
export const useAdminUserSelectors = () => {
  const store = useAdminUserStore();

  return {
    // Basic selectors
    users: store.users,
    selectedUser: store.selectedUser,
    filters: store.filters,
    pagination: store.pagination,
    bulkSelectedIds: store.bulkSelectedIds,

    // Computed selectors
    totalUsers: store.pagination?.total || 0,
    currentPage: store.pagination?.page || 1,
    totalPages: store.pagination?.totalPages || 1,
    hasNextPage: store.pagination?.hasNext || false,
    hasPrevPage: store.pagination?.hasPrev || false,
    selectedCount: store.bulkSelectedIds.length,
    isAllSelected:
      store.bulkSelectedIds.length === store.users.length &&
      store.users.length > 0,

    // User statistics
    activeUsers: store.users.filter((user) => user.accountStatus === 'active')
      .length,
    suspendedUsers: store.users.filter(
      (user) => user.accountStatus === 'suspended'
    ).length,
    bannedUsers: store.users.filter((user) => user.accountStatus === 'banned')
      .length,
    verifiedUsers: store.users.filter(
      (user) => user.verificationStatus === 'verified'
    ).length,
    freelancers: store.users.filter((user) => user.userType === 'freelancer')
      .length,
    employers: store.users.filter((user) => user.userType === 'employer')
      .length,

    // State selectors
    isLoading: store.isLoading,
    error: store.error,
    hasData: store.users.length > 0,
  };
};

export default useAdminUserStore;
