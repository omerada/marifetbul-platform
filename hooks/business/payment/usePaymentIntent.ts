/**
 * ================================================
 * USE PAYMENT INTENT HOOK
 * ================================================
 * Custom hook for creating and managing Stripe payment intents
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
  StripePaymentIntentResponse,
  StripePaymentIntentRequest,
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
      amount: number
    ): Promise<StripePaymentIntentResponse> => {
      setIsCreating(true);
      setError(null);

      try {
        const request: StripePaymentIntentRequest = {
          orderId,
          amount,
          currency: 'TRY',
          metadata: {
            orderId,
            source: 'web-checkout',
            timestamp: new Date().toISOString(),
          },
        };

        const response = await apiClient.post<{
          data: StripePaymentIntentResponse;
        }>(PAYMENT_ENDPOINTS.CREATE_INTENT, request);

        if (!response.data) {
          throw new Error('Ödeme oluşturulamadı');
        }

        return response.data;
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
