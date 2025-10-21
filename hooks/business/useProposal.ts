import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/lib/core/store/domains/ui/uiStore';
import { logger } from '@/lib/shared/utils/logger';

interface UseProposalOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
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

        logger.info(
          '[useProposal] Proposal accepted successfully:',
          proposalId
        );

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

        logger.error('[useProposal] Accept proposal error:', err);

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

        logger.info(
          '[useProposal] Proposal rejected successfully:',
          proposalId
        );

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

        logger.error('[useProposal] Reject proposal error:', err);

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [addToast, options]
  );

  return {
    acceptProposal,
    rejectProposal,
    isLoading,
    error,
  };
}
