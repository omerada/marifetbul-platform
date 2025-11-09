'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/lib/core/store/domains/ui/uiStore';
import logger from '@/lib/infrastructure/monitoring/logger';
import type { ProposalResponse } from '@/types/backend-aligned';

export interface SubmitProposalData {
  jobId: string;
  coverLetter: string;
  bidAmount: number;
  estimatedDuration: number;
  attachments?: string[];
}

interface UseProposalOptions {
  onSuccess?: (proposal?: ProposalResponse) => void;
  onError?: (error: Error | string) => void;
}

export function useProposal(options: UseProposalOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { addToast } = useUIStore();

  const acceptProposal = useCallback(
    async (proposalId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/v1/proposals/${proposalId}/accept`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Teklif kabul edilemedi');
        }

        // Success toast
        addToast({
          title: 'Başarılı',
          description:
            'Teklif kabul edildi. Sipariş sayfasına yönlendiriliyorsunuz...',
          type: 'success',
          duration: 3000,
        });

        // Call success callback
        options.onSuccess?.();

        // Redirect to orders page after short delay
        setTimeout(() => {
          router.push('/dashboard/employer/orders');
        }, 1500);

        logger.info('[useProposal] Proposal accepted successfully', {
          proposalId,
        });

        return data.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Bir hata oluştu';
        setError(errorMessage);

        addToast({
          title: 'Hata',
          description: errorMessage,
          type: 'error',
          duration: 5000,
        });

        options.onError?.(errorMessage);

        logger.error(
          '[useProposal] Accept proposal error:',
          err instanceof Error ? err : new Error(String(err))
        );

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [router, addToast, options]
  );

  const rejectProposal = useCallback(
    async (proposalId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/v1/proposals/${proposalId}/reject`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Teklif reddedilemedi');
        }

        addToast({
          title: 'Başarılı',
          description: 'Teklif reddedildi',
          type: 'success',
          duration: 3000,
        });

        options.onSuccess?.();

        logger.info('[useProposal] Proposal rejected successfully', {
          proposalId,
        });

        return data.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Bir hata oluştu';
        setError(errorMessage);

        addToast({
          title: 'Hata',
          description: errorMessage,
          type: 'error',
          duration: 5000,
        });

        options.onError?.(errorMessage);

        logger.error(
          '[useProposal] Reject proposal error:',
          err instanceof Error ? err : new Error(String(err))
        );

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [addToast, options]
  );

  const submitProposal = useCallback(
    async (data: SubmitProposalData) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/v1/proposals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(data),
        });

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.message || 'Teklif gönderilemedi');
        }

        addToast({
          title: 'Başarılı',
          description: 'Teklif başarıyla gönderildi',
          type: 'success',
          duration: 3000,
        });

        options.onSuccess?.(responseData.data);

        logger.info(
          '[useProposal] Proposal submitted successfully:',
          responseData.data
        );

        return responseData.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Bir hata oluştu';
        const errorObj = err instanceof Error ? err : new Error(errorMessage);
        setError(errorMessage);

        addToast({
          title: 'Hata',
          description: errorMessage,
          type: 'error',
          duration: 5000,
        });

        options.onError?.(errorObj);

        logger.error('[useProposal] Submit proposal error:', errorObj);

        throw errorObj;
      } finally {
        setIsLoading(false);
      }
    },
    [addToast, options]
  );

  return {
    submitProposal,
    acceptProposal,
    rejectProposal,
    isLoading,
    error,
  };
}
