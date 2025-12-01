'use client';

/**
 * useDisputeResolution Hook
 * Handle dispute resolution by admin
 */

import { useState } from 'react';
import { resolveDispute } from '@/lib/api/disputes';
import type {
  DisputeResolutionRequest,
  DisputeResponse,
} from '@/types/dispute';
import { toast } from 'sonner';
import logger from '@/lib/infrastructure/monitoring/logger';

export function useDisputeResolution() {
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolve = async (
    disputeId: string,
    resolution: DisputeResolutionRequest
  ): Promise<DisputeResponse | null> => {
    setIsResolving(true);
    setError(null);

    try {
      const result = await resolveDispute(disputeId, resolution);
      logger.info('Dispute resolved', {
        disputeId,
        resolutionType: resolution.resolutionType,
      });
      toast.success('İtiraz başarıyla çözümlendi');
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'İtiraz çözümlenemedi';
      setError(errorMessage);
      logger.error('Failed to resolve dispute', err as Error, {
        hook: 'useDisputeResolution',
      });
      toast.error(errorMessage);
      return null;
    } finally {
      setIsResolving(false);
    }
  };

  return {
    resolve,
    isResolving,
    error,
  };
}
