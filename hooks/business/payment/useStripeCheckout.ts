/**
 * ================================================
 * USE STRIPE CHECKOUT HOOK
 * ================================================
 * Custom hook for processing Stripe payments with Elements
 *
 * Features:
 * - Process payment with Stripe Elements
 * - Handle 3D Secure authentication
 * - Payment confirmation
 * - Error handling for card errors
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { useState, useCallback } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import type {
  UseStripeCheckoutReturn,
  StripePaymentResult,
  StripePaymentError,
} from '@/types/business/features/payments';

/**
 * Hook for Stripe checkout processing
 */
export function useStripeCheckout(): UseStripeCheckoutReturn {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Process payment with Stripe
   */
  const processPayment = useCallback(
    async (clientSecret: string): Promise<StripePaymentResult> => {
      if (!stripe || !elements) {
        const errorMessage = 'Stripe yüklenmedi. Lütfen sayfayı yenileyin.';
        const errorResult: StripePaymentResult = {
          success: false,
          error: {
            type: 'validation_error',
            message: errorMessage,
          },
        };
        setError(errorMessage);
        return errorResult;
      }

      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        const errorMessage = 'Kart bilgileri eksik';
        const errorResult: StripePaymentResult = {
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
        // Confirm card payment
        const { error: stripeError, paymentIntent } =
          await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
              card: cardElement,
            },
          });

        if (stripeError) {
          // Handle Stripe errors
          const paymentError: StripePaymentError = {
            type: stripeError.type as StripePaymentError['type'],
            code: stripeError.code,
            message: getLocalizedErrorMessage(stripeError),
            decline_code: stripeError.decline_code,
          };

          setError(paymentError.message);

          return {
            success: false,
            error: paymentError,
          };
        }

        if (paymentIntent) {
          return {
            success: true,
            paymentIntent: {
              id: paymentIntent.id,
              status: paymentIntent.status,
              amount: paymentIntent.amount,
              currency: paymentIntent.currency,
            },
          };
        }

        // Unexpected case
        const errorMessage = 'Ödeme işlemi tamamlanamadı';
        const unexpectedError: StripePaymentResult = {
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
    [stripe, elements]
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
 * Get localized error message from Stripe error
 */
function getLocalizedErrorMessage(error: {
  type?: string;
  code?: string;
  message?: string;
}): string {
  // Card errors
  if (error.type === 'card_error') {
    if (error.code === 'card_declined') {
      return 'Kartınız reddedildi. Lütfen farklı bir kart deneyin.';
    }
    if (error.code === 'insufficient_funds') {
      return 'Kartınızda yetersiz bakiye var.';
    }
    if (error.code === 'expired_card') {
      return 'Kartınızın süresi dolmuş.';
    }
    if (error.code === 'incorrect_cvc') {
      return 'CVC kodu hatalı.';
    }
    if (error.code === 'incorrect_number') {
      return 'Kart numarası hatalı.';
    }
    if (
      error.code === 'invalid_expiry_month' ||
      error.code === 'invalid_expiry_year'
    ) {
      return 'Son kullanma tarihi hatalı.';
    }
    if (error.code === 'processing_error') {
      return 'Ödeme işlenirken bir hata oluştu. Lütfen tekrar deneyin.';
    }
  }

  // Validation errors
  if (error.type === 'validation_error') {
    return 'Lütfen tüm bilgileri doğru girdiğinizden emin olun.';
  }

  // Authentication errors
  if (error.type === 'authentication_error') {
    return '3D Secure doğrulama başarısız oldu.';
  }

  // API errors
  if (error.type === 'api_error') {
    return 'Ödeme hizmeti şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.';
  }

  // Default
  return error.message || 'Ödeme işlemi sırasında bir hata oluştu';
}

export default useStripeCheckout;
