import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { AdminDashboardStore } from '@/types';

export const useAdminDashboardStore = create<AdminDashboardStore>()(
  devtools(
    immer((set, get) => ({
      // State
      data: null,
      isLoading: false,
      error: null,
      lastUpdated: null,

      // Actions
      fetchDashboard: async () => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          // Import auth store here to avoid circular dependency
          const { useAuthStore } = await import('./domains/auth/authStore');
          const token = useAuthStore.getState().token;

          if (!token) {
            throw new Error('Authentication required');
          }

          const response = await fetch('/api/v1/admin/dashboard', {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Dashboard verisi alınamadı');
          }

          const result = await response.json();

          set((state) => {
            state.data = result.data;
            state.isLoading = false;
            state.lastUpdated = new Date().toISOString();
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Bilinmeyen hata';
            state.isLoading = false;
          });
        }
      },

      refreshDashboard: async () => {
        const { fetchDashboard } = get();
        await fetchDashboard();
      },

      markAlertAsRead: async (alertId: string) => {
        try {
          const response = await fetch(`/api/v1/admin/alerts/${alertId}/read`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error('Alert okundu olarak işaretlenemedi');
          }

          set((state) => {
            if (state.data?.alerts) {
              const alertIndex = state.data.alerts.findIndex(
                (alert) => alert.id === alertId
              );
              if (alertIndex !== -1) {
                state.data.alerts[alertIndex].isRead = true;
              }
            }
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Bilinmeyen hata';
          });
        }
      },

      dismissAlert: async (alertId: string) => {
        try {
          const response = await fetch(
            `/api/v1/admin/alerts/${alertId}/dismiss`,
            {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          if (!response.ok) {
            throw new Error('Alert kapatılamadı');
          }

          set((state) => {
            if (state.data?.alerts) {
              state.data.alerts = state.data.alerts.filter(
                (alert) => alert.id !== alertId
              );
            }
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Bilinmeyen hata';
          });
        }
      },

      clearAllAlerts: async () => {
        try {
          const response = await fetch('/api/v1/admin/alerts/clear-all', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error('Tüm alertler temizlenemedi');
          }

          set((state) => {
            if (state.data?.alerts) {
              state.data.alerts = [];
            }
          });
        } catch (error) {
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Bilinmeyen hata';
          });
        }
      },

      clearError: () => {
        set((state) => {
          state.error = null;
        });
      },

      // Computed properties
      get unreadAlerts() {
        const state = get();
        return state.data?.alerts?.filter((alert) => !alert.isRead) || [];
      },

      get criticalAlerts() {
        const state = get();
        return (
          state.data?.alerts?.filter(
            (alert) =>
              alert.severity === 'critical' || alert.priority === 'critical'
          ) || []
        );
      },
    })),
    {
      name: 'admin-dashboard',
    }
  )
);

// Selectors
export const useAdminDashboardSelectors = () => {
  const store = useAdminDashboardStore();

  return {
    // Basic selectors
    stats: store.data?.stats,
    charts: store.data?.charts,
    alerts: store.data?.alerts || [],
    recentActivity: store.data?.recentActivity || [],
    systemHealth: store.data?.systemHealth,

    // Computed selectors
    unreadAlerts: store.data?.alerts?.filter((alert) => !alert.isRead) || [],
    criticalAlerts:
      store.data?.alerts?.filter(
        (alert) =>
          alert.severity === 'critical' || alert.priority === 'critical'
      ) || [],
    systemStatus: store.data?.systemHealth?.status || 'unknown',
    totalUsers: store.data?.stats?.totalUsers || 0,
    totalRevenue: store.data?.stats?.totalRevenue || 0,
    isHealthy: store.data?.systemHealth?.status === 'healthy',

    // State selectors
    isLoading: store.isLoading,
    error: store.error,
    lastUpdated: store.lastUpdated,
    hasData: !!store.data,
  };
};

export default useAdminDashboardStore;
