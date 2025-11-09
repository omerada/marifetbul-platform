'use client';

import { useState, useEffect, useCallback } from 'react';
import logger from '@/lib/infrastructure/monitoring/logger';

interface ProposalEligibility {
  canPropose: boolean;
  reason?: string;
  hasExistingProposal: boolean;
  existingProposalId?: string;
}

interface UseProposalEligibilityOptions {
  jobId: string;
  enabled?: boolean;
}

interface UseProposalEligibilityResult {
  eligibility: ProposalEligibility | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to check if user can submit a proposal for a job
 *
 * @param options - Job ID and options
 * @returns Eligibility check result with loading/error states
 */
export function useProposalEligibility({
  jobId,
  enabled = true,
}: UseProposalEligibilityOptions): UseProposalEligibilityResult {
  const [eligibility, setEligibility] = useState<ProposalEligibility | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEligibility = useCallback(async () => {
    if (!enabled || !jobId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/jobs/${jobId}/can-propose`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Uygunluk kontrolü yapılamadı');
      }

      setEligibility(data.data);
      logger.debug('[useProposalEligibility] Eligibility fetched:', data.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Bir hata oluştu';
      setError(errorMessage);
      logger.error('[useProposalEligibility] Error:', err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [jobId, enabled]);

  useEffect(() => {
    fetchEligibility();
  }, [fetchEligibility]);

  return {
    eligibility,
    isLoading,
    error,
    refetch: fetchEligibility,
  };
}
