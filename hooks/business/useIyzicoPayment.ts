'use client';

/**
 * ================================================
 * USE IYZICO PAYMENT HOOK
 * ================================================
 * Unified hook for complete Iyzico payment flow
 * Replaces: usePaymentIntent + useIyzicoCheckout (deprecated)
 *
 * Features:
 * - Create payment intent
 * - Handle 3D Secure redirect
 * - Process payment confirmation
 * - Callback handling
 * - Comprehensive error handling
 * - Loading state management
 *
 * Sprint 1: Payment System Consolidation
 * @author MarifetBul Development Team
 * @version 2.0.0
 * @created 2025-11-11
 */

import { useState, useCallback, useRef } from 'react';
import { apiClient } from '@/lib/infrastructure/api/client';
import { PAYMENT_ENDPOINTS } from '@/lib/api/endpoints';
import logger from '@/lib/infrastructure/monitoring/logger';
import type {
  IyzicoPaymentRequest,
  IyzicoPaymentResponse,
  IyzicoPaymentError,
  IyzicoCardOptions,
} from '@/types/business/features/payments';

// ================================================
// TYPES
// ================================================

export interface UseIyzicoPaymentOptions {
  /** Auto-redirect to 3D Secure page if required */
  autoRedirect?: boolean;
  /** Custom return URL for 3D Secure callback */
  returnUrl?: string;
  /** Enable debug logging */
  debug?: boolean;
}

export interface PaymentIntentData {
  orderId: string;
  cardOptions: IyzicoCardOptions;
}

export interface ConfirmPaymentData {
  paymentIntentId: string;
  conversationId?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  status?: 'pending' | 'succeeded' | 'failed' | 'requires_action';
  error?: IyzicoPaymentError;
  requiresAction?: boolean;
  nextActionUrl?: string;
}

export interface UseIyzicoPaymentReturn {
  /** Create payment intent and handle 3D Secure if needed */
  initiatePayment: (data: PaymentIntentData) => Promise<PaymentResult>;

  /** Confirm payment after 3D Secure callback */
  confirmPayment: (data: ConfirmPaymentData) => Promise<PaymentResult>;

  /** Handle callback from 3D Secure page */
  handleCallback: (paymentIntentId: string) => Promise<PaymentResult>;

  /** Check payment status */
  checkStatus: (paymentId: string) => Promise<PaymentResult>;

  /** Current payment state */
  isProcessing: boolean;

  /** Error message if any */
  error: IyzicoPaymentError | null;

  /** Clear error state */
  clearError: () => void;

  /** Current payment intent ID */
  currentPaymentIntentId: string | null;
}

// ================================================
// ERROR MESSAGES
// ================================================

const IYZICO_ERROR_MESSAGES: Record<string, string> = {
  // Card errors
  '10051': 'Kart numarası geçersiz',
  '10005': 'Kartın son kullanma tarihi geçersiz',
  '10012': 'Güvenlik kodu (CVV) geçersiz',
  '10041': 'Kart limitiniz yetersiz',
  '10042': 'Kart limiti aşıldı',
  '10053': 'Kartınız çevrimiçi işlemlere kapalı',

  // 3D Secure errors
  '10047': 'İşleminiz 3D Secure doğrulaması gerektirmektedir',
  '10048': '3D Secure doğrulama başarısız',

  // Bank errors
  '10084': 'İşleminiz banka tarafından reddedildi',
  '10093': 'İşlem tekrar edilemez',

  // General errors
  '10000': 'Genel bir hata oluştu',
  '10001': 'Zorunlu alanlar eksik',
};

// ================================================
// UTILITY FUNCTIONS
// ================================================

function getErrorMessage(
  error: unknown,
  fallback = 'Ödeme işlemi başarısız oldu'
): string {
  if (typeof error === 'object' && error !== null) {
    const err = error as {
      errorCode?: string;
      errorMessage?: string;
      message?: string;
    };

    // Check if we have a known Iyzico error code
    if (err.errorCode && IYZICO_ERROR_MESSAGES[err.errorCode]) {
      return IYZICO_ERROR_MESSAGES[err.errorCode];
    }

    // Return error message from response
    if (err.errorMessage) return err.errorMessage;
    if (err.message) return err.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

function createPaymentError(
  type: IyzicoPaymentError['type'],
  error: unknown,
  message?: string
): IyzicoPaymentError {
  const errorObj = error as { errorCode?: string; errorMessage?: string };

  return {
    type,
    message: message || getErrorMessage(error),
    code: errorObj?.errorCode,
    errorCode: errorObj?.errorCode,
    errorMessage: errorObj?.errorMessage,
  };
}

// ================================================
// HOOK IMPLEMENTATION
// ================================================

export function useIyzicoPayment(
  options: UseIyzicoPaymentOptions = {}
): UseIyzicoPaymentReturn {
  const { autoRedirect = true, returnUrl, debug = false } = options;

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<IyzicoPaymentError | null>(null);
  const [currentPaymentIntentId, setCurrentPaymentIntentId] = useState<
    string | null
  >(null);

  // Prevent duplicate requests
  const processingRef = useRef(false);

  const log = useCallback(
    (message: string, data?: unknown) => {
      if (debug) {
        logger.debug(`[useIyzicoPayment] ${message}`, { data });
      }
    },
    [debug]
  );

  /**
   * Initiate payment - creates intent and handles 3D Secure
   */
  const initiatePayment = useCallback(
    async (data: PaymentIntentData): Promise<PaymentResult> => {
      // Prevent duplicate calls
      if (processingRef.current) {
        log('Payment already in progress, skipping...');
        return {
          success: false,
          error: createPaymentError(
            'validation_error',
            new Error('Ödeme işlemi devam ediyor')
          ),
        };
      }

      processingRef.current = true;
      setIsProcessing(true);
      setError(null);

      log('Initiating payment...', data);

      try {
        // Create payment intent
        const request: IyzicoPaymentRequest = {
          orderId: data.orderId,
          returnUrl: returnUrl || `${window.location.origin}/checkout/callback`,
        };

        log('Creating payment intent...', request);

        const response = await apiClient.post<IyzicoPaymentResponse>(
          PAYMENT_ENDPOINTS.CREATE_INTENT,
          request
        );

        if (!response) {
          throw new Error('Ödeme oluşturulamadı');
        }

        log('Payment intent created', response);

        setCurrentPaymentIntentId(response.paymentId);

        // Check if 3D Secure is required
        if (response.requiresAction && response.nextActionUrl) {
          log('3D Secure required, redirecting...', response.nextActionUrl);

          if (autoRedirect) {
            // Redirect to 3D Secure page
            window.location.href = response.nextActionUrl;
          }

          return {
            success: false,
            paymentId: response.paymentId,
            status: response.status,
            requiresAction: true,
            nextActionUrl: response.nextActionUrl,
          };
        }

        // Payment succeeded without 3D Secure
        log('Payment succeeded without 3D Secure');

        return {
          success: true,
          paymentId: response.paymentId,
          status: response.status,
          requiresAction: false,
        };
      } catch (err) {
        log('Payment initiation failed', err);

        const paymentError = createPaymentError('api_error', err);
        setError(paymentError);

        return {
          success: false,
          error: paymentError,
        };
      } finally {
        setIsProcessing(false);
        processingRef.current = false;
      }
    },
    [autoRedirect, returnUrl, log]
  );

  /**
   * Confirm payment after 3D Secure callback
   */
  const confirmPayment = useCallback(
    async (data: ConfirmPaymentData): Promise<PaymentResult> => {
      if (processingRef.current) {
        log('Confirmation already in progress, skipping...');
        return {
          success: false,
          error: createPaymentError(
            'validation_error',
            new Error('Ödeme onayı devam ediyor')
          ),
        };
      }

      processingRef.current = true;
      setIsProcessing(true);
      setError(null);

      log('Confirming payment...', data);

      try {
        const response = await apiClient.post<IyzicoPaymentResponse>(
          PAYMENT_ENDPOINTS.CONFIRM_INTENT(data.paymentIntentId),
          { conversationId: data.conversationId || data.paymentIntentId }
        );

        if (!response) {
          throw new Error('Ödeme onaylanamadı');
        }

        log('Payment confirmed', response);

        // Check final status
        if (response.status === 'succeeded') {
          return {
            success: true,
            paymentId: response.paymentId,
            status: response.status,
          };
        }

        // Payment failed
        return {
          success: false,
          paymentId: response.paymentId,
          status: response.status,
          error: createPaymentError(
            'api_error',
            new Error('Ödeme başarısız oldu')
          ),
        };
      } catch (err) {
        log('Payment confirmation failed', err);

        const paymentError = createPaymentError('api_error', err);
        setError(paymentError);

        return {
          success: false,
          error: paymentError,
        };
      } finally {
        setIsProcessing(false);
        processingRef.current = false;
      }
    },
    [log]
  );

  /**
   * Handle callback from 3D Secure page
   * This is called when user returns from bank's 3D Secure page
   */
  const handleCallback = useCallback(
    async (paymentIntentId: string): Promise<PaymentResult> => {
      log('Handling 3D Secure callback...', paymentIntentId);

      if (!paymentIntentId) {
        const error = createPaymentError(
          'validation_error',
          new Error('Ödeme ID bulunamadı')
        );
        setError(error);
        return { success: false, error };
      }

      // Confirm the payment after 3D Secure
      return confirmPayment({
        paymentIntentId,
        conversationId: paymentIntentId,
      });
    },
    [confirmPayment, log]
  );

  /**
   * Check payment status
   */
  const checkStatus = useCallback(
    async (paymentId: string): Promise<PaymentResult> => {
      log('Checking payment status...', paymentId);

      setIsProcessing(true);
      setError(null);

      try {
        const response = await apiClient.get<IyzicoPaymentResponse>(
          PAYMENT_ENDPOINTS.GET_BY_ID(paymentId)
        );

        if (!response) {
          throw new Error('Ödeme bilgisi alınamadı');
        }

        log('Payment status retrieved', response);

        return {
          success: response.status === 'succeeded',
          paymentId: response.paymentId,
          status: response.status,
        };
      } catch (err) {
        log('Status check failed', err);

        const paymentError = createPaymentError('api_error', err);
        setError(paymentError);

        return {
          success: false,
          error: paymentError,
        };
      } finally {
        setIsProcessing(false);
      }
    },
    [log]
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    initiatePayment,
    confirmPayment,
    handleCallback,
    checkStatus,
    isProcessing,
    error,
    clearError,
    currentPaymentIntentId,
  };
}

export default useIyzicoPayment;
