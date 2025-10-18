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
          const { useAuthStore } = await import('./domains/auth/authStore');
          const authState = useAuthStore.getState();

          if (!authState.isAuthenticated) {
            throw new Error('Yetkisiz erişim: Lütfen giriş yapın');
          }

          // Fetch real dashboard data from backend with timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

          try {
            const response = await fetch('/api/v1/dashboard/admin', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
              if (response.status === 401) {
                throw new Error(
                  'Oturum süresi dolmuş. Lütfen tekrar giriş yapın.'
                );
              } else if (response.status === 403) {
                throw new Error('Bu işlem için yetkiniz bulunmuyor.');
              } else if (response.status >= 500) {
                throw new Error(
                  'Sunucu hatası. Lütfen daha sonra tekrar deneyin.'
                );
              }
              throw new Error(
                `Dashboard verisi alınamadı: ${response.status} ${response.statusText}`
              );
            }

            const apiResponse = await response.json();

            if (!apiResponse.success) {
              throw new Error(
                apiResponse.message || 'Dashboard verisi alınamadı'
              );
            }

            const backendData = apiResponse.data;

            // Transform backend DTO to frontend format
            const dashboardData = {
              stats: {
                totalUsers: backendData.userMetrics?.totalUsers || 0,
                activeUsers: backendData.userMetrics?.activeUsers || 0,
                totalJobs: backendData.packageMetrics?.totalPackages || 0,
                activeJobs: backendData.packageMetrics?.activePackages || 0,
                totalRevenue:
                  Number(backendData.revenueMetrics?.totalRevenue) || 0,
                pendingPayouts: 0, // Not in backend DTO yet
                newUsersToday: backendData.userMetrics?.newUsers || 0,
                monthlyRevenue:
                  Number(backendData.revenueMetrics?.totalRevenue) || 0,
                revenueGrowth:
                  backendData.revenueMetrics?.revenueGrowthRate || 0,
                pendingOrders: backendData.orderMetrics?.pendingOrders || 0,
                completedOrders: backendData.orderMetrics?.completedOrders || 0,
                conversionRate:
                  backendData.businessMetrics?.conversionRate || 0,
                userRetentionRate:
                  backendData.businessMetrics?.repeatPurchaseRate || 0,
              },
              recentActivity: [], // Can be populated from activityMetrics if needed
              systemHealth: {
                status:
                  backendData.systemHealth?.systemStatus === 'HEALTHY'
                    ? ('healthy' as const)
                    : backendData.systemHealth?.systemStatus === 'DEGRADED'
                      ? ('warning' as const)
                      : ('critical' as const),
                uptime: backendData.systemHealth?.uptimeSeconds || 0,
                responseTime: 0, // Can be calculated from activityMetrics
                lastCheck: backendData.generatedAt || new Date().toISOString(),
              },
              lastUpdated: backendData.generatedAt || new Date().toISOString(),
            };

            set((state) => {
              state.data = dashboardData;
              state.isLoading = false;
              state.lastUpdated = new Date().toISOString();
            });
          } catch (fetchError: unknown) {
            clearTimeout(timeoutId);

            if (
              fetchError instanceof Error &&
              fetchError.name === 'AbortError'
            ) {
              throw new Error(
                'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.'
              );
            }

            throw fetchError;
          }
        } catch (error) {
          console.error('[Admin Dashboard] Error fetching dashboard:', error);

          set((state) => {
            state.error =
              error instanceof Error
                ? error.message
                : 'Bilinmeyen bir hata oluştu';
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
