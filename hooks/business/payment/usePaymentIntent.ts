'use client';

/**
 * ================================================
 * USE PAYMENT INTENT HOOK
 * ================================================
 * Custom hook for creating and managing Iyzico payment intents
 *
 * Features:
 * - Create payment intent for order
 * - Handle backend API integration
 * - Error handling and loading states
 * - Client secret management
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/infrastructure/api/client';
import { PAYMENT_ENDPOINTS } from '@/lib/api/endpoints';
import type {
  UsePaymentIntentReturn,
  IyzicoPaymentResponse,
  IyzicoPaymentRequest,
} from '@/types/business/features/payments';

/**
 * Hook for managing payment intents
 */
export function usePaymentIntent(): UsePaymentIntentReturn {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Create a new payment intent for an order
   */
  const createIntent = useCallback(
    async (
      orderId: string,
      _amount?: number
    ): Promise<IyzicoPaymentResponse> => {
      setIsCreating(true);
      setError(null);

      try {
        const request: IyzicoPaymentRequest = {
          orderId,
          returnUrl: `${window.location.origin}/checkout/callback`,
        };

        // Call new backend endpoint: POST /api/v1/payments/intent
        const response = await apiClient.post<IyzicoPaymentResponse>(
          PAYMENT_ENDPOINTS.CREATE_INTENT,
          request
        );

        if (!response) {
          throw new Error('Ödeme oluşturulamadı');
        }

        // Backend returns: { paymentId, clientSecret, amount, currency, status, requiresAction, nextActionUrl }
        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Ödeme işlemi başlatılamadı';

        setError(errorMessage);
        throw err;
      } finally {
        setIsCreating(false);
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
    createIntent,
    isCreating,
    error,
    clearError,
  };
}

export default usePaymentIntent;
