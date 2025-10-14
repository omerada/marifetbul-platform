import { create } from 'zustand';
import { getCurrentUserId } from '@/lib/shared/utils/auth';
import { devtools } from 'zustand/middleware';
import { logger } from '@/lib/shared/utils/logger';
import type {
  ReputationScore,
  SecurityStatus,
  SecurityAlert,
  TrustIndicators,
  SecurityVerification,
  GetReputationResponse,
  GetSecurityAlertsResponse,
} from '@/types';

interface ReputationStore {
  // State
  reputationScore: ReputationScore | null;
  securityStatus: SecurityStatus | null;
  trustIndicators: TrustIndicators | null;
  securityAlerts: SecurityAlert[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;

  // Actions
  fetchReputation: (userId: string) => Promise<void>;
  fetchSecurityAlerts: (userId: string) => Promise<void>;
  dismissAlert: (alertId: string) => Promise<void>;
  startVerification: (type: SecurityVerification['type']) => Promise<void>;
  updateVerificationStatus: (
    type: SecurityVerification['type'],
    status: SecurityVerification['status']
  ) => void;
  markRecommendationCompleted: (recommendationId: string) => void;
  refreshReputation: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  reputationScore: null,
  securityStatus: null,
  trustIndicators: null,
  securityAlerts: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
};

export const useReputationStore = create<ReputationStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchReputation: async (userId: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`/api/v1/reputation?userId=${userId}`);

          if (!response.ok) {
            throw new Error('Reputation verisi alınamadı');
          }

          const data: GetReputationResponse = await response.json();

          if (data.success && data.data) {
            set({
              reputationScore: data.data.score,
              securityStatus: data.data.status,
              trustIndicators: data.data.trustIndicators,
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

      fetchSecurityAlerts: async (userId: string) => {
        try {
          const response = await fetch(
            `/api/v1/security/alerts?userId=${userId}`
          );

          if (!response.ok) {
            throw new Error('Güvenlik uyarıları alınamadı');
          }

          const data: GetSecurityAlertsResponse = await response.json();

          if (data.success && data.data) {
            set({ securityAlerts: data.data });
          } else {
            throw new Error(data.error || 'Bilinmeyen hata');
          }
        } catch (error) {
          logger.error(
            'Security alerts fetch error',
            error instanceof Error ? error : new Error(String(error))
          );
        }
      },

      dismissAlert: async (alertId: string) => {
        try {
          const response = await fetch(
            `/api/v1/security/alerts/${alertId}/dismiss`,
            {
              method: 'POST',
            }
          );

          if (!response.ok) {
            throw new Error('Uyarı kapatılamadı');
          }

          const result = await response.json();

          if (result.success) {
            // Alert'i listeden kaldır
            set((state) => ({
              securityAlerts: state.securityAlerts.filter(
                (alert) => alert.id !== alertId
              ),
            }));
          } else {
            throw new Error(result.error || 'Bilinmeyen hata');
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Bir hata oluştu',
          });
        }
      },

      startVerification: async (type: SecurityVerification['type']) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch('/api/v1/security/verification/start', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type }),
          });

          if (!response.ok) {
            throw new Error('Doğrulama başlatılamadı');
          }

          const result = await response.json();

          if (result.success) {
            // Security status'u güncelle
            set((state) => ({
              securityStatus: state.securityStatus
                ? {
                    ...state.securityStatus,
                    verifications: state.securityStatus.verifications.map(
                      (v) => (v.type === type ? { ...v, status: 'pending' } : v)
                    ),
                  }
                : null,
              isLoading: false,
            }));
          } else {
            throw new Error(result.error || 'Bilinmeyen hata');
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Bir hata oluştu',
            isLoading: false,
          });
        }
      },

      updateVerificationStatus: (
        type: SecurityVerification['type'],
        status: SecurityVerification['status']
      ) => {
        set((state) => ({
          securityStatus: state.securityStatus
            ? {
                ...state.securityStatus,
                verifications: state.securityStatus.verifications.map((v) =>
                  v.type === type ? { ...v, status } : v
                ),
              }
            : null,
        }));
      },

      markRecommendationCompleted: (recommendationId: string) => {
        set((state) => {
          if (!state.securityStatus || !state.securityStatus.recommendations) {
            return state;
          }

          const recommendations = state.securityStatus.recommendations;

          // Handle both string array and object array formats
          if (Array.isArray(recommendations)) {
            const updatedRecommendations = recommendations.map((r) => {
              if (
                typeof r === 'object' &&
                r &&
                'id' in r &&
                r.id === recommendationId
              ) {
                return {
                  ...r,
                  isCompleted: true,
                  completedAt: new Date().toISOString(),
                };
              }
              return r;
            });

            return {
              ...state,
              securityStatus: {
                ...state.securityStatus,
                recommendations:
                  updatedRecommendations as typeof recommendations,
              },
            };
          }

          return state;
        });
      },

      refreshReputation: async () => {
        // Refresh için kullanıcı ID'sini auth store'dan al
        const userId = await getCurrentUserId();
        if (!userId) {
          set({ error: 'Kullanıcı kimlik doğrulaması gerekli' });
          return;
        }

        await get().fetchReputation(userId);
        await get().fetchSecurityAlerts(userId);
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'reputation-store',
    }
  )
);
