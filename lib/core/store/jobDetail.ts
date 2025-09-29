import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { JobDetail } from '@/types';
import { Proposal } from '@/types/core/jobs';
import { ProposalFormData } from '@/lib/core/validations/details';

// Cache timeout for preventing excessive API calls
const CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

interface JobDetailCache {
  jobId: string;
  data: JobDetail;
  timestamp: number;
}

interface JobDetailStore {
  // State properties
  currentJob: JobDetail | null;
  proposals: Proposal[];
  isLoading: boolean;
  isSubmittingProposal: boolean;
  error: string | null;

  // Cache management
  cache: Record<string, JobDetailCache>;
  lastFetchTime: number | null;

  // Actions
  fetchJobDetail: (jobId: string, forceRefresh?: boolean) => Promise<void>;
  fetchProposals: (jobId: string) => Promise<void>;
  submitProposal: (proposalData: ProposalFormData) => Promise<void>;
  updateProposalStatus: (
    proposalId: string,
    status: 'accepted' | 'rejected',
    note?: string
  ) => Promise<void>;
  clearError: () => void;
  clearJobDetail: () => void;
  invalidateCache: (jobId?: string) => void;
  shouldRefresh: (jobId: string) => boolean;
}

// Utility function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return typeof window !== 'undefined'
      ? localStorage.getItem('auth_token')
      : null;
  } catch (error) {
    console.warn('Failed to access localStorage:', error);
    return null;
  }
};

export const useJobDetailStore = create<JobDetailStore>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      currentJob: null,
      proposals: [],
      isLoading: false,
      isSubmittingProposal: false,
      error: null,
      cache: {},
      lastFetchTime: null,

      // Cache methods
      shouldRefresh: (jobId: string) => {
        const cached = get().cache[jobId];
        if (!cached) return true;
        return Date.now() - cached.timestamp > CACHE_TIMEOUT;
      },

      invalidateCache: (jobId) => {
        set((state) => {
          if (jobId) {
            delete state.cache[jobId];
          } else {
            state.cache = {};
          }
          state.lastFetchTime = null;
        });
      },

      // Actions
      fetchJobDetail: async (jobId: string, forceRefresh = false) => {
        const { shouldRefresh, cache } = get();

        // Check cache first
        if (!forceRefresh && !shouldRefresh(jobId)) {
          const cached = cache[jobId];
          if (cached) {
            set((state) => {
              state.currentJob = cached.data;
            });
            return;
          }
        }

        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          const response = await fetch(`/api/jobs/${jobId}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          if (data.success) {
            set((state) => {
              state.currentJob = data.data;
              state.isLoading = false;
              state.lastFetchTime = Date.now();

              // Cache the result
              state.cache[jobId] = {
                jobId,
                data: data.data,
                timestamp: Date.now(),
              };
            });
          } else {
            throw new Error(data.error || 'İş ilanı yüklenemedi');
          }
        } catch (error) {
          console.error('Job detail fetch error:', error);
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'İş ilanı yüklenemedi';
            state.isLoading = false;
          });
        }
      },

      fetchProposals: async (jobId: string) => {
        try {
          const token = getAuthToken();
          if (!token) {
            throw new Error("Yetkilendirme token'ı bulunamadı");
          }

          const response = await fetch(`/api/jobs/${jobId}/proposals`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          if (data.success) {
            set((state) => {
              state.proposals = data.data;
            });
          } else {
            throw new Error(data.error || 'Teklifler yüklenemedi');
          }
        } catch (error) {
          console.error('Proposals fetch error:', error);
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Teklifler yüklenemedi';
          });
        }
      },

      submitProposal: async (proposalData: ProposalFormData) => {
        set((state) => {
          state.isSubmittingProposal = true;
          state.error = null;
        });

        try {
          const token = getAuthToken();
          if (!token) {
            throw new Error("Yetkilendirme token'ı bulunamadı");
          }

          const response = await fetch(
            `/api/jobs/${proposalData.jobId}/proposals`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(proposalData),
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          if (data.success) {
            set((state) => {
              state.isSubmittingProposal = false;
              // Add new proposal to the list if available
              if (data.data) {
                state.proposals.push(data.data);
              }
            });

            // Invalidate cache for this job since new proposal affects it
            get().invalidateCache(proposalData.jobId);

            // Proposal sent successfully
          } else {
            throw new Error(data.error || 'Teklif gönderilemedi');
          }
        } catch (error) {
          console.error('Proposal submission error:', error);
          set((state) => {
            state.error =
              error instanceof Error ? error.message : 'Teklif gönderilemedi';
            state.isSubmittingProposal = false;
          });
        }
      },

      updateProposalStatus: async (
        proposalId: string,
        status: 'accepted' | 'rejected',
        note?: string
      ) => {
        try {
          const token = getAuthToken();
          if (!token) {
            throw new Error("Yetkilendirme token'ı bulunamadı");
          }

          const response = await fetch(`/api/proposals/${proposalId}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status, note }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          if (data.success) {
            // Update local proposals state
            set((state) => {
              const proposalIndex = state.proposals.findIndex(
                (proposal) => proposal.id === proposalId
              );

              if (proposalIndex !== -1) {
                state.proposals[proposalIndex] = {
                  ...state.proposals[proposalIndex],
                  status,
                  updatedAt: data.data.updatedAt,
                };
              }
            });
          } else {
            throw new Error(data.error || 'Teklif durumu güncellenemedi');
          }
        } catch (error) {
          console.error('Proposal status update error:', error);
          set((state) => {
            state.error =
              error instanceof Error
                ? error.message
                : 'Teklif durumu güncellenemedi';
          });
        }
      },

      clearError: () => {
        set((state) => {
          state.error = null;
        });
      },

      clearJobDetail: () => {
        set((state) => {
          state.currentJob = null;
          state.proposals = [];
          state.error = null;
          state.isLoading = false;
          state.isSubmittingProposal = false;
        });
      },
    })),
    {
      name: 'job-detail-store',
    }
  )
);

// Optimized hooks for easier usage
export const useJobDetailCurrentJob = () =>
  useJobDetailStore((state) => state.currentJob);
export const useJobDetailProposals = () =>
  useJobDetailStore((state) => state.proposals);
export const useJobDetailLoading = () =>
  useJobDetailStore((state) => state.isLoading);
export const useJobDetailSubmitting = () =>
  useJobDetailStore((state) => state.isSubmittingProposal);
export const useJobDetailError = () =>
  useJobDetailStore((state) => state.error);

export const useJobDetailActions = () =>
  useJobDetailStore((state) => ({
    fetchJobDetail: state.fetchJobDetail,
    fetchProposals: state.fetchProposals,
    submitProposal: state.submitProposal,
    updateProposalStatus: state.updateProposalStatus,
    clearError: state.clearError,
    clearJobDetail: state.clearJobDetail,
    invalidateCache: state.invalidateCache,
  }));
