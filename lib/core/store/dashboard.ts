import { create } from 'zustand';
import { FreelancerDashboard, EmployerDashboard } from '@/types';
import useAuthStore from './auth';

interface DashboardStore {
  // State
  dashboardData: FreelancerDashboard | EmployerDashboard | null;
  isLoading: boolean;
  error: string | null;
  lastRefresh: Date | null;
  refreshInterval: NodeJS.Timeout | null;

  // Actions
  fetchDashboard: (userType: 'freelancer' | 'employer') => Promise<void>;
  refreshDashboard: () => Promise<void>;
  startAutoRefresh: () => void;
  stopAutoRefresh: () => void;
  clearError: () => void;
  resetDashboard: () => void;
}

const useDashboardStore = create<DashboardStore>((set, get) => ({
  // Initial state
  dashboardData: null,
  isLoading: false,
  error: null,
  lastRefresh: null,
  refreshInterval: null,

  // Fetch dashboard data
  fetchDashboard: async (userType: 'freelancer' | 'employer') => {
    set({ isLoading: true, error: null });

    try {
      const token = useAuthStore.getState().token;
      if (!token) {
        throw new Error('Kullanıcı girişi gerekli');
      }

      const response = await fetch(`/api/dashboard/${userType}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        set({
          dashboardData: data.data,
          isLoading: false,
          lastRefresh: new Date(),
          error: null,
        });
      } else {
        set({
          error: data.error || 'Dashboard verisi yüklenemedi',
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      set({
        error: 'Dashboard yüklenirken bir hata oluştu',
        isLoading: false,
      });
    }
  },

  // Refresh dashboard
  refreshDashboard: async () => {
    const { user } = useAuthStore.getState();
    if (user?.userType && user.userType !== 'admin') {
      await get().fetchDashboard(user.userType);
    }
  },

  // Start auto-refresh (every 5 minutes)
  startAutoRefresh: () => {
    const { refreshInterval } = get();

    // Clear existing interval
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }

    // Set new interval
    const newInterval = setInterval(
      () => {
        get().refreshDashboard();
      },
      5 * 60 * 1000 // 5 minutes
    );

    set({ refreshInterval: newInterval });
  },

  // Stop auto-refresh
  stopAutoRefresh: () => {
    const { refreshInterval } = get();
    if (refreshInterval) {
      clearInterval(refreshInterval);
      set({ refreshInterval: null });
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Reset dashboard state
  resetDashboard: () => {
    const { refreshInterval } = get();

    // Stop auto-refresh
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }

    set({
      dashboardData: null,
      isLoading: false,
      error: null,
      lastRefresh: null,
      refreshInterval: null,
    });
  },
}));

export default useDashboardStore;
