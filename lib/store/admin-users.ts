import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  AdminUserStore,
  AdminUserData,
  UserFilters,
  UserActionRequest,
  BulkUserActionRequest,
} from '@/types';

export const useAdminUserStore = create<AdminUserStore>()(
  devtools(
    immer((set, get) => ({
      // State
      users: [],
      selectedUser: null,
      isLoading: false,
      error: null,
      filters: {},
      pagination: null,
      bulkSelectedIds: [],

      // Actions
      fetchUsers: async (filters?: UserFilters) => {
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
            state.users = result.data.users;
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

      fetchUserById: async (userId: string): Promise<AdminUserData | null> => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const response = await fetch(`/api/v1/admin/users/${userId}`, {
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

          return result.data; // Return the user data
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Bilinmeyen hata';
            state.isLoading = false;
          });

          return null; // Return null on error
        }
      },

      performUserAction: async (userId: string, action: UserActionRequest) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const response = await fetch(`/api/v1/admin/users/${userId}/action`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(action),
          });

          if (!response.ok) {
            throw new Error('Kullanıcı işlemi gerçekleştirilemedi');
          }

          const result = await response.json();

          set((state) => {
            // Update user in list if exists
            const userIndex = state.users.findIndex(
              (user) => user.id === userId
            );
            if (userIndex !== -1 && result.data?.user) {
              state.users[userIndex] = result.data.user;
            }

            // Update selected user if it's the same
            if (state.selectedUser?.id === userId && result.data?.user) {
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

      performBulkAction: async (action: BulkUserActionRequest) => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const response = await fetch('/api/v1/admin/users/bulk-action', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(action),
          });

          if (!response.ok) {
            throw new Error('Toplu işlem gerçekleştirilemedi');
          }

          // Refresh users list after bulk action
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

      // Additional required methods
      selectedUserIds: [],
      getUserById: async (userId: string): Promise<AdminUserData | null> => {
        try {
          const response = await fetch(`/api/v1/admin/users/${userId}`);
          if (!response.ok) return null;
          const data = await response.json();
          return data.data;
        } catch {
          return null;
        }
      },
      updateUser: async (userId: string, updates: Partial<AdminUserData>) => {
        await fetch(`/api/v1/admin/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        await get().fetchUsers();
      },
      suspendUser: async (userId: string, reason: string) => {
        await fetch(`/api/v1/admin/users/${userId}/suspend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason }),
        });
        await get().fetchUsers();
      },
      unsuspendUser: async (userId: string) => {
        await fetch(`/api/v1/admin/users/${userId}/unsuspend`, {
          method: 'POST',
        });
        await get().fetchUsers();
      },
      banUser: async (userId: string, reason: string) => {
        await fetch(`/api/v1/admin/users/${userId}/ban`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason }),
        });
        await get().fetchUsers();
      },
      unbanUser: async (userId: string) => {
        await fetch(`/api/v1/admin/users/${userId}/unban`, {
          method: 'POST',
        });
        await get().fetchUsers();
      },
      verifyUser: async (userId: string) => {
        await fetch(`/api/v1/admin/users/${userId}/verify`, {
          method: 'POST',
        });
        await get().fetchUsers();
      },
      unverifyUser: async (userId: string) => {
        await fetch(`/api/v1/admin/users/${userId}/unverify`, {
          method: 'POST',
        });
        await get().fetchUsers();
      },
      bulkAction: async (action: BulkUserActionRequest) => {
        return get().performBulkAction(action);
      },
      clearFilters: () => {
        set((state) => {
          state.filters = {};
        });
      },
      clearSelection: () => {
        set((state) => {
          state.selectedUser = null;
          state.bulkSelectedIds = [];
        });
      },
      deleteUser: async (userId: string) => {
        await fetch(`/api/v1/admin/users/${userId}`, { method: 'DELETE' });
        await get().fetchUsers();
      },
      activateUser: async (userId: string) => {
        await get().updateUser(userId, { accountStatus: 'active' });
      },
      deactivateUser: async (userId: string) => {
        await get().updateUser(userId, { accountStatus: 'suspended' });
      },
      resetUserPassword: async (userId: string) => {
        await fetch(`/api/v1/admin/users/${userId}/reset-password`, {
          method: 'POST',
        });
      },
      exportUsers: async () => {
        const response = await fetch('/api/v1/admin/users/export');
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'users.csv';
        a.click();
      },
      importUsers: async (users: AdminUserData[]) => {
        await fetch('/api/v1/admin/users/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ users }),
        });
        await get().fetchUsers();
      },
      getUserAnalytics: async (userId: string) => {
        const response = await fetch(`/api/v1/admin/users/${userId}/analytics`);
        const data = await response.json();
        return data.data;
      },
      sendUserNotification: async (userId: string, message: string) => {
        await fetch(`/api/v1/admin/users/${userId}/notify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message }),
        });
      },
      // Computed properties
      get activeUsers() {
        return get().users.filter((user) => user.accountStatus === 'active');
      },
      get suspendedUsers() {
        return get().users.filter((user) => user.accountStatus === 'suspended');
      },
      get bannedUsers() {
        return get().users.filter((user) => user.accountStatus === 'banned');
      },
      get verifiedUsers() {
        return get().users.filter(
          (user) => user.verificationStatus === 'verified'
        );
      },
      get freelancers() {
        return get().users.filter((user) => user.userType === 'freelancer');
      },
      get employers() {
        return get().users.filter((user) => user.userType === 'employer');
      },

      clearError: () => {
        set((state) => {
          state.error = null;
        });
      },
    })),
    {
      name: 'admin-users',
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
