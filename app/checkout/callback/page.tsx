/**
 * ================================================
 * IYZICO PAYMENT CALLBACK PAGE
 * ================================================
 * Handles 3D Secure authentication callback from Iyzico
 *
 * Flow:
 * 1. User completes 3D Secure on Iyzico page
 * 2. Iyzico redirects back with paymentIntentId in URL
 * 3. This page confirms payment and shows status
 * 4. Redirects to success or error page
 *
 * Sprint 1: Enhanced with unified payment hook
 * @author MarifetBul Development Team
 * @version 2.0.0
 * @updated 2025-11-11
 */

'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useIyzicoPayment } from '@/hooks/business/useIyzicoPayment';
import {
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import logger from '@/lib/infrastructure/monitoring/logger';

type CallbackStatus = 'processing' | 'success' | 'error' | 'timeout';

function CheckoutCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleCallback, isProcessing } = useIyzicoPayment();

  const [status, setStatus] = useState<CallbackStatus>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const [countdown, setCountdown] = useState(5);

  const maxRetries = 2;

  useEffect(() => {
    const confirmPayment = async () => {
      try {
        // Get payment intent ID from URL
        const paymentIntentId =
          searchParams.get('paymentIntentId') || searchParams.get('token');
        const orderId = searchParams.get('orderId');

        if (!paymentIntentId) {
          throw new Error('Ödeme bilgisi bulunamadı');
        }

        logger.info('CheckoutCallback: Processing payment callback', {
          paymentIntentId,
          orderId,
        });

        // Confirm payment after 3D Secure
        const result = await handleCallback(paymentIntentId);

        if (result.success && result.paymentId) {
          setStatus('success');

          logger.info('CheckoutCallback: Payment confirmed successfully', {
            paymentId: result.paymentId,
          });

          // Countdown before redirect
          let counter = 3;
          setCountdown(counter);

          const timer = setInterval(() => {
            counter--;
            setCountdown(counter);

            if (counter === 0) {
              clearInterval(timer);
              router.push(
                `/orders/${orderId || result.paymentId}?payment=success`
              );
            }
          }, 1000);

          return () => clearInterval(timer);
        } else {
          throw new Error(
            result.error?.message || 'Ödeme doğrulaması başarısız'
          );
        }
      } catch (error) {
        logger.error('CheckoutCallback: Payment confirmation failed', error, {
          paymentIntentId: searchParams.get('paymentIntentId'),
          orderId: searchParams.get('orderId'),
          retryCount,
        });

        setStatus('error');
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Ödeme doğrulama sırasında bir hata oluştu'
        );
      }
    };

    if (status === 'processing') {
      confirmPayment();
    }
  }, [searchParams, handleCallback, router, status, retryCount]);

  // Handle retry
  const handleRetry = () => {
    if (retryCount < maxRetries) {
      setRetryCount((prev) => prev + 1);
      setStatus('processing');
      setErrorMessage('');
    } else {
      setStatus('timeout');
    }
  };

  // Handle cancel
  const handleCancel = () => {
    const orderId = searchParams.get('orderId');
    router.push(orderId ? `/orders/${orderId}?payment=cancelled` : '/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-xl bg-white p-8 shadow-2xl">
          {/* Processing State */}
          {status === 'processing' && (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                <Loader2 className="h-10 w-10 animate-spin text-white" />
              </div>
              <h1 className="mb-3 text-2xl font-bold text-gray-900">
                Ödeme Doğrulanıyor
              </h1>
              <p className="mb-6 text-gray-600">
                {retryCount > 0
                  ? 'Tekrar deneniyor...'
                  : 'Ödemeniz işleniyor, lütfen bekleyin...'}
              </p>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                </div>
              </div>

              {retryCount > 0 && (
                <p className="text-sm text-gray-500">
                  Deneme {retryCount + 1} / {maxRetries + 1}
                </p>
              )}
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h1 className="mb-3 text-2xl font-bold text-gray-900">
                Ödeme Başarılı! 🎉
              </h1>
              <p className="mb-2 text-gray-600">
                Ödemeniz başarıyla tamamlandı.
              </p>
              <p className="text-sm text-gray-500">
                {countdown} saniye içinde yönlendiriliyorsunuz...
              </p>

              {/* Success animation */}
              <div className="mt-6">
                <div className="mx-auto h-1 w-32 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all duration-1000"
                    style={{ width: `${(1 - countdown / 3) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-lg">
                <XCircle className="h-10 w-10 text-white" />
              </div>
              <h1 className="mb-3 text-2xl font-bold text-gray-900">
                Ödeme Başarısız
              </h1>
              <p className="mb-6 text-gray-600">{errorMessage}</p>

              <div className="space-y-3">
                {retryCount < maxRetries && (
                  <Button
                    onClick={handleRetry}
                    variant="primary"
                    className="w-full"
                    disabled={isProcessing}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Tekrar Dene
                  </Button>
                )}

                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="w-full"
                >
                  İptal Et ve Geri Dön
                </Button>
              </div>
            </div>
          )}

          {/* Timeout State */}
          {status === 'timeout' && (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg">
                <AlertTriangle className="h-10 w-10 text-white" />
              </div>
              <h1 className="mb-3 text-2xl font-bold text-gray-900">
                İşlem Zaman Aşımına Uğradı
              </h1>
              <p className="mb-6 text-gray-600">
                Ödeme doğrulanamadı. Lütfen sipariş durumunuzu kontrol edin veya
                destek ekibiyle iletişime geçin.
              </p>

              <Button
                onClick={handleCancel}
                variant="primary"
                className="w-full"
              >
                Siparişlerime Git
              </Button>
            </div>
          )}

          {/* Security Notice */}
          <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Güvenli Ödeme
                </p>
                <p className="mt-1 text-xs text-blue-700">
                  {status === 'processing'
                    ? 'Bu sayfayı kapatmayın veya yenilemeyin.'
                    : 'Ödeme işlemi Iyzico altyapısıyla güvenle gerçekleştirildi.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      }
    >
      <CheckoutCallbackContent />
    </Suspense>
  );
}
