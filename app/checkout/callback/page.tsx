/**
 * ================================================
 * IYZICO PAYMENT CALLBACK PAGE
 * ================================================
 * Handles 3D Secure authentication callback from Iyzico
 *
 * Flow:
 * 1. User completes 3D Secure on Iyzico page
 * 2. Iyzico redirects back with token in URL
 * 3. This page extracts token and confirms payment
 * 4. Redirects to success or error page
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useIyzicoCheckout } from '@/hooks/business/payment/useIyzicoCheckout';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function CheckoutCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { processPayment } = useIyzicoCheckout();

  const [status, setStatus] = useState<'processing' | 'success' | 'error'>(
    'processing'
  );
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const confirmPayment = async () => {
      try {
        // Get token from URL query params
        const token = searchParams.get('token');

        if (!token) {
          throw new Error('Ödeme tokeni bulunamadı');
        }

        // Confirm payment with backend
        const result = await processPayment(token);

        if (result.success && result.payment) {
          setStatus('success');

          // Redirect to success page after 2 seconds
          setTimeout(() => {
            router.push(
              `/checkout/success?paymentId=${result.payment!.id}&orderId=${searchParams.get('orderId') || ''}`
            );
          }, 2000);
        } else {
          throw new Error(result.error?.message || 'Ödeme doğrulama başarısız');
        }
      } catch (error) {
        console.error('Payment confirmation error:', error);
        setStatus('error');
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Ödeme doğrulama sırasında bir hata oluştu'
        );

        // Redirect to cancel page after 3 seconds
        setTimeout(() => {
          router.push('/checkout/cancel');
        }, 3000);
      }
    };

    confirmPayment();
  }, [searchParams, processPayment, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          {/* Processing State */}
          {status === 'processing' && (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-gray-900">
                Ödeme Doğrulanıyor
              </h1>
              <p className="text-gray-600">
                Ödemeniz işleniyor, lütfen bekleyin...
              </p>
              <div className="mt-6">
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div className="h-full animate-pulse rounded-full bg-indigo-600"></div>
                </div>
              </div>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-gray-900">
                Ödeme Başarılı!
              </h1>
              <p className="text-gray-600">
                Ödemeniz başarıyla tamamlandı. Yönlendiriliyorsunuz...
              </p>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-gray-900">
                Ödeme Başarısız
              </h1>
              <p className="mb-4 text-gray-600">{errorMessage}</p>
              <button
                onClick={() => router.push('/checkout/cancel')}
                className="rounded-lg bg-gray-600 px-6 py-2 font-medium text-white transition-colors hover:bg-gray-700"
              >
                Geri Dön
              </button>
            </div>
          )}

          {/* Security Notice */}
          <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="text-center text-xs text-blue-800">
              🔒 Bu sayfayı kapatmayın veya yenilemeyin
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
