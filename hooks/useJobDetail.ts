import { useEffect } from 'react';
import { useJobDetailStore } from '@/lib/store';
import { useAuth } from './useAuth';

export function useJobDetail(jobId: string) {
  const store = useJobDetailStore();
  const { user } = useAuth();

  useEffect(() => {
    if (jobId) {
      store.fetchJobDetail(jobId);

      // If user is the job owner (employer), also fetch proposals
      if (user?.userType === 'employer') {
        store.fetchProposals(jobId);
      }
    }

    // Cleanup when unmounting or jobId changes
    return () => {
      if (jobId) {
        store.clearJobDetail();
      }
    };
  }, [jobId, user?.userType, store]);

  // Derived state
  const isJobOwner = user?.id === store.currentJob?.employer.id;
  const canPropose = user?.userType === 'freelancer' && !isJobOwner;

  return {
    // State
    currentJob: store.currentJob,
    proposals: store.proposals,
    isLoading: store.isLoading,
    isSubmittingProposal: store.isSubmittingProposal,
    error: store.error,

    // Derived state
    isJobOwner,
    canPropose,

    // Actions
    submitProposal: store.submitProposal,
    updateProposalStatus: store.updateProposalStatus,
    clearError: store.clearError,
    fetchProposals: () => store.fetchProposals(jobId),
    refreshJobDetail: () => store.fetchJobDetail(jobId),
  };
}
