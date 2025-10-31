/**
 * ================================================
 * USE IYZICO CHECKOUT HOOK
 * ================================================
 * Custom hook for processing Iyzico payments
 *
 * Features:
 * - Process payment with Iyzico Payment Gateway
 * - Handle 3D Secure authentication
 * - Payment confirmation
 * - Error handling for payment errors
 *
 * @author MarifetBul Development Team
 * @version 2.0.0
 */

'use client';

import { useState, useCallback } from 'react';
import type {
  UseIyzicoCheckoutReturn,
  IyzicoPaymentResult,
  IyzicoPaymentError,
} from '@/types/business/features/payments';

/**
 * Hook for Iyzico checkout processing
 */
export function useIyzicoCheckout(): UseIyzicoCheckoutReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Process payment with Iyzico
   */
  const processPayment = useCallback(
    async (token: string): Promise<IyzicoPaymentResult> => {
      if (!token) {
        const errorMessage = 'Ödeme tokeni bulunamadı.';
        const errorResult: IyzicoPaymentResult = {
          success: false,
          error: {
            type: 'validation_error',
            message: errorMessage,
          },
        };
        setError(errorMessage);
        return errorResult;
      }

      setIsProcessing(true);
      setError(null);

      try {
        // Call backend to complete Iyzico payment
        const response = await fetch('/api/payments/iyzico/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          // Handle API errors
          const paymentError: IyzicoPaymentError = {
            type: 'api_error',
            code: data.errorCode,
            message: getLocalizedErrorMessage(data),
            errorCode: data.errorCode,
            errorMessage: data.errorMessage,
          };

          setError(paymentError.message);

          return {
            success: false,
            error: paymentError,
          };
        }

        if (data.success && data.payment) {
          return {
            success: true,
            payment: {
              id: data.payment.id,
              status: data.payment.status,
              amount: data.payment.amount,
              currency: data.payment.currency,
              conversationId: data.payment.conversationId,
            },
          };
        }

        // Unexpected case
        const errorMessage = 'Ödeme işlemi tamamlanamadı';
        const unexpectedError: IyzicoPaymentResult = {
          success: false,
          error: {
            type: 'api_error',
            message: errorMessage,
          },
        };
        setError(errorMessage);
        return unexpectedError;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Ödeme işlemi sırasında bir hata oluştu';

        setError(errorMessage);

        return {
          success: false,
          error: {
            type: 'api_error',
            message: errorMessage,
          },
        };
      } finally {
        setIsProcessing(false);
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
    processPayment,
    isProcessing,
    error,
    clearError,
  };
}

/**
 * Get localized error message from Iyzico error
 */
function getLocalizedErrorMessage(error: {
  errorCode?: string;
  errorMessage?: string;
  message?: string;
}): string {
  // Common Iyzico error codes
  const errorMessages: Record<string, string> = {
    '10051': 'Kart numarası geçersiz.',
    '10005': 'Kartın son kullanma tarihi geçersiz.',
    '10012': 'Güvenlik kodu (CVV) geçersiz.',
    '10041': 'Kart limitiniz yetersiz.',
    '10042': 'Kart limiti aşıldı.',
    '10047': 'İşleminiz 3D Secure doğrulaması gerektirmektedir.',
    '10048': '3D Secure doğrulama başarısız.',
    '10053': 'Kartınız çevrimiçi işlemlere kapalı.',
    '10084': 'İşleminiz banka tarafından reddedildi.',
    '10093': 'İşlem tekrar edilemez.',
  };

  if (error.errorCode && errorMessages[error.errorCode]) {
    return errorMessages[error.errorCode];
  }

  // Return original message or default
  return (
    error.errorMessage ||
    error.message ||
    'Ödeme işlemi sırasında bir hata oluştu'
  );
}

// Backward compatibility export
export const useStripeCheckout = useIyzicoCheckout;

export default useIyzicoCheckout;
