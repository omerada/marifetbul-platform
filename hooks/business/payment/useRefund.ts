'use client';

/**
 * ================================================
 * USE REFUND HOOK
 * ================================================
 * Custom hook for processing refund requests
 *
 * Features:
 * - Request full refund
 * - Request partial refund
 * - Refund status tracking
 * - Error handling
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/infrastructure/api/client';
import { PAYMENT_ENDPOINTS } from '@/lib/api/endpoints';
import type { UseRefundReturn } from '@/types/business/features/payments';

/**
 * Hook for refund processing
 */
export function useRefund(): UseRefundReturn {
  const [isRefunding, setIsRefunding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Request a refund (full or partial)
   */
  const requestRefund = useCallback(
    async (
      paymentId: string,
      amount?: number,
      reason?: string
    ): Promise<boolean> => {
      if (amount !== undefined && amount <= 0) {
        setError("İade tutarı 0'dan büyük olmalıdır");
        return false;
      }

      setIsRefunding(true);
      setError(null);

      try {
        await apiClient.post(PAYMENT_ENDPOINTS.REQUEST_REFUND, {
          paymentId,
          refundType: amount ? 'PARTIAL' : 'FULL',
          amount,
          reason: reason || (amount ? 'Kısmi iade talebi' : 'Müşteri talebi'),
        });

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'İade talebi oluşturulamadı';
        setError(errorMessage);
        return false;
      } finally {
        setIsRefunding(false);
      }
    },
    []
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    requestRefund,
    isRefunding,
    error,
    clearError,
  };
}

export default useRefund;
