import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { JobDetail } from '@/types';
import { Proposal } from '@/types/core/jobs';
import { ProposalFormData } from '@/lib/validations/details';

interface JobDetailStore {
  // State properties
  currentJob: JobDetail | null;
  proposals: Proposal[];
  isLoading: boolean;
  isSubmittingProposal: boolean;
  error: string | null;

  // Actions
  fetchJobDetail: (jobId: string) => Promise<void>;
  fetchProposals: (jobId: string) => Promise<void>;
  submitProposal: (proposalData: ProposalFormData) => Promise<void>;
  updateProposalStatus: (
    proposalId: string,
    status: 'accepted' | 'rejected',
    note?: string
  ) => Promise<void>;
  clearError: () => void;
  clearJobDetail: () => void;
}

export const useJobDetailStore = create<JobDetailStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentJob: null,
      proposals: [],
      isLoading: false,
      isSubmittingProposal: false,
      error: null,

      // Actions
      fetchJobDetail: async (jobId: string) => {
        set({ isLoading: true, error: null }, false, 'jobDetail/fetchStart');

        try {
          const response = await fetch(`/api/jobs/${jobId}`);
          const data = await response.json();

          if (data.success) {
            set(
              {
                currentJob: data.data,
                isLoading: false,
              },
              false,
              'jobDetail/fetchSuccess'
            );
          } else {
            set(
              { error: data.error || 'İş ilanı yüklenemedi', isLoading: false },
              false,
              'jobDetail/fetchError'
            );
          }
        } catch (error) {
          console.error('Job detail fetch error:', error);
          set(
            { error: 'İş ilanı yüklenemedi', isLoading: false },
            false,
            'jobDetail/fetchError'
          );
        }
      },

      fetchProposals: async (jobId: string) => {
        try {
          const token = localStorage.getItem('auth_token');
          const response = await fetch(`/api/jobs/${jobId}/proposals`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await response.json();

          if (data.success) {
            set(
              { proposals: data.data },
              false,
              'jobDetail/proposalsFetchSuccess'
            );
          } else {
            console.error('Failed to fetch proposals:', data.error);
          }
        } catch (error) {
          console.error('Proposals fetch error:', error);
        }
      },

      submitProposal: async (proposalData: ProposalFormData) => {
        set(
          { isSubmittingProposal: true, error: null },
          false,
          'jobDetail/proposalSubmitStart'
        );

        try {
          const token = localStorage.getItem('auth_token');
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

          const data = await response.json();

          if (data.success) {
            set(
              { isSubmittingProposal: false },
              false,
              'jobDetail/proposalSubmitSuccess'
            );

            // Show success notification (you can implement toast here)
            console.log('Teklifiniz başarıyla gönderildi!');
          } else {
            set(
              {
                error: data.error || 'Teklif gönderilemedi',
                isSubmittingProposal: false,
              },
              false,
              'jobDetail/proposalSubmitError'
            );
          }
        } catch (error) {
          console.error('Proposal submission error:', error);
          set(
            { error: 'Teklif gönderilemedi', isSubmittingProposal: false },
            false,
            'jobDetail/proposalSubmitError'
          );
        }
      },

      updateProposalStatus: async (
        proposalId: string,
        status: 'accepted' | 'rejected',
        note?: string
      ) => {
        try {
          const token = localStorage.getItem('auth_token');
          const response = await fetch(`/api/proposals/${proposalId}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status, note }),
          });

          const data = await response.json();

          if (data.success) {
            // Update local proposals state
            const { proposals } = get();
            const updatedProposals = proposals.map((proposal) =>
              proposal.id === proposalId
                ? { ...proposal, status, updatedAt: data.data.updatedAt }
                : proposal
            );

            set(
              { proposals: updatedProposals },
              false,
              'jobDetail/proposalStatusUpdated'
            );

            console.log(
              `Teklif ${status === 'accepted' ? 'kabul edildi' : 'reddedildi'}`
            );
          } else {
            set(
              { error: data.error || 'Teklif durumu güncellenemedi' },
              false,
              'jobDetail/proposalStatusError'
            );
          }
        } catch (error) {
          console.error('Proposal status update error:', error);
          set(
            { error: 'Teklif durumu güncellenemedi' },
            false,
            'jobDetail/proposalStatusError'
          );
        }
      },

      clearError: () => {
        set({ error: null }, false, 'jobDetail/clearError');
      },

      clearJobDetail: () => {
        set(
          {
            currentJob: null,
            proposals: [],
            error: null,
            isLoading: false,
            isSubmittingProposal: false,
          },
          false,
          'jobDetail/clear'
        );
      },
    }),
    {
      name: 'job-detail-store',
    }
  )
);
