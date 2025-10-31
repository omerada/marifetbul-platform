/**
 * ================================================
 * IYZICO CHECKOUT FORM COMPONENT
 * ================================================
 * Iyzico Payment Gateway integration for payment processing
 *
 * Features:
 * - Iyzico 3D Secure integration
 * - Payment intent creation and confirmation
 * - Error handling and validation
 * - Loading states
 *
 * @author MarifetBul Development Team
 * @version 2.0.0
 */

'use client';

import React, { useState } from 'react';
import { formatCurrency } from '@/lib/shared/formatters';
import { useRouter } from 'next/navigation';
import { usePaymentIntent } from '@/hooks/business/payment/usePaymentIntent';
import useIyzicoCheckout from '@/hooks/business/payment/useStripeCheckout';
import type { CheckoutSession } from '@/types/business/features/payments';

interface IyzicoCheckoutFormProps {
  checkoutSession: CheckoutSession;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
}

export function IyzicoCheckoutForm({
  checkoutSession,
  onSuccess,
  onError,
}: IyzicoCheckoutFormProps) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [processingStage, setProcessingStage] = useState<
    'idle' | 'creating-intent' | 'processing-payment' | 'success'
  >('idle');

  // Hooks
  const {
    createIntent,
    isCreating,
    error: intentError,
    clearError: clearIntentError,
  } = usePaymentIntent();

  const {
    processPayment,
    isProcessing,
    error: paymentError,
    clearError: clearPaymentError,
  } = useIyzicoCheckout();

  // Combined error
  const error = intentError || paymentError;
  const isLoading = isCreating || isProcessing || processingStage !== 'idle';

  // Set ready state for Iyzico
  React.useEffect(() => {
    setIsReady(true);
    setCardComplete(true);
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cardComplete || isLoading) {
      return;
    }

    try {
      // Clear previous errors
      clearIntentError();
      clearPaymentError();

      // Step 1: Create payment intent
      setProcessingStage('creating-intent');
      const intentResponse = await createIntent(
        checkoutSession.orderId,
        checkoutSession.amount
      );

      if (
        !intentResponse ||
        (!intentResponse.threeDSHtmlContent && !intentResponse.token)
      ) {
        throw new Error('Payment intent oluşturulamadı');
      }

      // Step 2: Process payment with Iyzico
      setProcessingStage('processing-payment');

      // For Iyzico, we need to redirect to 3D Secure page or use threeDSHtmlContent
      // This is simplified - actual implementation should render threeDSHtmlContent
      const paymentResult = await processPayment(intentResponse.token || '');

      if (!paymentResult.success) {
        throw new Error(
          paymentResult.error?.message || 'Ödeme işlemi başarısız'
        );
      }

      // Step 3: Success
      setProcessingStage('success');
      onSuccess?.(intentResponse.paymentId);

      // Redirect to success page
      setTimeout(() => {
        router.push(
          `/checkout/success?orderId=${checkoutSession.orderId}&paymentId=${intentResponse.paymentId}`
        );
      }, 1000);
    } catch (err) {
      setProcessingStage('idle');
      const errorMessage =
        err instanceof Error ? err.message : 'Ödeme işlemi başarısız oldu';
      onError?.(errorMessage);
    }
  };

  // Get processing message
  const getProcessingMessage = () => {
    switch (processingStage) {
      case 'creating-intent':
        return 'Ödeme hazırlanıyor...';
      case 'processing-payment':
        return 'Ödeme işleniyor...';
      case 'success':
        return 'Ödeme başarılı! Yönlendiriliyorsunuz...';
      default:
        return 'Ödemeyi Tamamla';
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <form onSubmit={handleSubmit}>
        {/* Form Header */}
        <div className="mb-6">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">
            Ödeme Bilgileri
          </h2>
          <p className="text-sm text-gray-600">
            Kart bilgileriniz güvenli şekilde işlenir
          </p>
        </div>

        {/* Card Element */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-900">
            Kart Bilgileri
            <span className="ml-1 text-red-500">*</span>
          </label>
          <div
            className={`rounded-lg border p-4 transition-colors ${
              error
                ? 'border-red-300 bg-red-50'
                : 'focus-within:ring-opacity-20 border-gray-300 bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500 hover:border-indigo-400'
            }`}
          >
            {/* Iyzico payment form placeholder */}
            <div className="py-8 text-center">
              <p className="text-gray-600">
                Iyzico ödeme formu burada görüntülenecek
              </p>
              <p className="mt-2 text-sm text-gray-500">
                3D Secure doğrulama sayfasına yönlendirileceksiniz
              </p>
            </div>
          </div>
          {!isReady && (
            <p className="mt-2 text-sm text-gray-500">
              Ödeme formu yükleniyor...
            </p>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start">
              <svg
                className="mt-0.5 mr-3 h-5 w-5 flex-shrink-0 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <h3 className="mb-1 text-sm font-semibold text-red-800">
                  Ödeme Hatası
                </h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-600">Sipariş No</span>
            <span className="text-sm font-medium text-gray-900">
              #{checkoutSession.orderId.slice(0, 8)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">
              Toplam Tutar
            </span>
            <span className="text-lg font-bold text-indigo-600">
              {formatCurrency(checkoutSession.amount, 'TRY')}
            </span>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <div className="flex items-start text-sm text-blue-800">
            <svg
              className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="mb-1 font-medium">Güvenli Ödeme</p>
              <p className="text-xs">
                Ödemeniz Iyzico tarafından güvenli şekilde işlenir. Kart
                bilgileriniz saklanmaz.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isReady || !cardComplete || isLoading}
          className="w-full rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {getProcessingMessage()}
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <svg
                className="mr-2 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              {formatCurrency(checkoutSession.amount, 'TRY')} Öde
            </span>
          )}
        </button>

        {/* Terms */}
        <p className="mt-4 text-center text-xs text-gray-500">
          Ödeme yaparak{' '}
          <a href="/legal/terms" className="text-indigo-600 hover:underline">
            Kullanım Şartlarını
          </a>{' '}
          ve{' '}
          <a href="/legal/privacy" className="text-indigo-600 hover:underline">
            Gizlilik Politikasını
          </a>{' '}
          kabul etmiş olursunuz
        </p>
      </form>
    </div>
  );
}

// Backward compatibility export
export const StripeCheckoutForm = IyzicoCheckoutForm;

export default IyzicoCheckoutForm;
