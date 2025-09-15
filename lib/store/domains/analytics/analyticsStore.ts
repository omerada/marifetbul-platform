import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  FreelancerAnalytics,
  EmployerAnalytics,
  AnalyticsTimeframe,
  AnalyticsFilters,
  AnalyticsExport,
  AnalyticsExportResponse,
  GetAnalyticsResponse,
} from '@/types';

interface AnalyticsStore {
  // State
  analytics: FreelancerAnalytics | EmployerAnalytics | null;
  timeframe: AnalyticsTimeframe;
  filters: AnalyticsFilters;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;

  // Actions
  fetchAnalytics: (
    userType: 'freelancer' | 'employer',
    timeframe?: AnalyticsTimeframe
  ) => Promise<void>;
  updateTimeframe: (timeframe: AnalyticsTimeframe) => void;
  updateFilters: (filters: Partial<AnalyticsFilters>) => void;
  exportAnalytics: (
    options: AnalyticsExport
  ) => Promise<AnalyticsExportResponse>;
  refreshAnalytics: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  analytics: null,
  timeframe: {
    period: 'month' as const,
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date(),
  },
  filters: {
    timeframe: {
      period: 'month' as const,
      start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      end: new Date(),
    },
  },
  isLoading: false,
  error: null,
  lastUpdated: null,
};

export const useAnalyticsStore = create<AnalyticsStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchAnalytics: async (
        userType: 'freelancer' | 'employer',
        timeframe?: AnalyticsTimeframe
      ) => {
        set({ isLoading: true, error: null });

        try {
          const queryParams = new URLSearchParams();
          queryParams.append('userType', userType);

          const currentTimeframe = timeframe || get().timeframe;
          queryParams.append('period', currentTimeframe.period);

          if (currentTimeframe.startDate) {
            queryParams.append('startDate', currentTimeframe.startDate);
          }
          if (currentTimeframe.endDate) {
            queryParams.append('endDate', currentTimeframe.endDate);
          }

          const response = await fetch(`/api/v1/analytics?${queryParams}`);

          if (!response.ok) {
            throw new Error('Analytics verisi alınamadı');
          }

          const data: GetAnalyticsResponse = await response.json();

          if (data.success && data.data) {
            // Extract specific analytics based on user type
            const analytics = (data.data.freelancer ||
              data.data.employer ||
              null) as FreelancerAnalytics | EmployerAnalytics | null;

            set({
              analytics,
              timeframe: currentTimeframe,
              filters: { ...get().filters, timeframe: currentTimeframe },
              isLoading: false,
              lastUpdated: new Date().toISOString(),
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

      updateTimeframe: (timeframe: AnalyticsTimeframe) => {
        set((state) => ({
          timeframe,
          filters: { ...state.filters, timeframe },
        }));
      },

      updateFilters: (filters: Partial<AnalyticsFilters>) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
        }));
      },

      exportAnalytics: async (options: AnalyticsExport) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch('/api/v1/analytics/export', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(options),
          });

          if (!response.ok) {
            throw new Error('Export işlemi başarısız');
          }

          const result: AnalyticsExportResponse = await response.json();

          if (result.success) {
            set({ isLoading: false });
            return result;
          } else {
            throw new Error(result.error || 'Export hatası');
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

      refreshAnalytics: async () => {
        const { timeframe } = get();
        const analytics = get().analytics;

        // Analytics tipini kontrol et
        const userType =
          analytics && 'earnings' in analytics ? 'freelancer' : 'employer';

        await get().fetchAnalytics(userType, timeframe);
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'analytics-store',
    }
  )
);
