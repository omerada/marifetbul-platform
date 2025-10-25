/**
 * ================================================
 * CHECKOUT SUCCESS PAGE
 * ================================================
 * Payment confirmation and order success page
 *
 * Features:
 * - Payment confirmation
 * - Order details
 * - Next steps
 * - Order tracking link
 *
 * Route: /checkout/success
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/infrastructure/api/client';
import { ORDER_ENDPOINTS } from '@/lib/api/endpoints';

interface OrderDetails {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  packageTitle: string;
  sellerName: string;
  estimatedDelivery: string;
}

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const paymentId = searchParams.get('paymentId');

  const [isLoading, setIsLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load order details
  useEffect(() => {
    const loadOrderDetails = async () => {
      if (!orderId) {
        setError('Sipariş bulunamadı');
        setIsLoading(false);
        return;
      }

      try {
        const order = await apiClient.get<OrderDetails>(
          ORDER_ENDPOINTS.GET_BY_ID(orderId)
        );
        setOrderDetails(order);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Sipariş bilgileri yüklenemedi';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrderDetails();
  }, [orderId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Error state
  if (error || !orderDetails) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <h2 className="mb-2 text-2xl font-bold text-red-800">
              Bir Sorun Oluştu
            </h2>
            <p className="mb-4 text-red-600">{error || 'Sipariş bulunamadı'}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="rounded-lg bg-red-600 px-6 py-2 text-white transition-colors hover:bg-red-700"
            >
              Dashboard&apos;a Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          {/* Success Icon */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-12 w-12 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              Ödeme Başarılı!
            </h1>
            <p className="text-gray-600">
              Siparişiniz başarıyla oluşturuldu ve ödemeniz alındı
            </p>
          </div>

          {/* Order Details Card */}
          <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Sipariş Detayları
            </h2>

            <div className="space-y-3 border-b border-gray-200 pb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Sipariş Numarası</span>
                <span className="font-medium text-gray-900">
                  #{orderDetails.orderNumber || orderDetails.id.slice(0, 8)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Paket</span>
                <span className="font-medium text-gray-900">
                  {orderDetails.packageTitle}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Satıcı</span>
                <span className="font-medium text-gray-900">
                  {orderDetails.sellerName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tahmini Teslimat</span>
                <span className="font-medium text-gray-900">
                  {new Date(orderDetails.estimatedDelivery).toLocaleDateString(
                    'tr-TR',
                    {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    }
                  )}
                </span>
              </div>
            </div>

            <div className="pt-4">
              <div className="flex justify-between">
                <span className="text-lg font-semibold text-gray-900">
                  Toplam Ödenen
                </span>
                <span className="text-2xl font-bold text-indigo-600">
                  ₺{orderDetails.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {paymentId && (
              <div className="mt-4 rounded-lg bg-gray-50 p-3">
                <p className="text-sm text-gray-600">
                  Ödeme ID:{' '}
                  <span className="font-mono text-xs">{paymentId}</span>
                </p>
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="mb-6 rounded-lg bg-blue-50 p-6">
            <h3 className="mb-3 flex items-center text-lg font-semibold text-blue-900">
              <svg
                className="mr-2 h-6 w-6"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              Sırada Ne Var?
            </h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start">
                <svg
                  className="mt-1 mr-2 h-5 w-5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  Satıcı siparişinizi 24 saat içinde inceleyecek ve başlatacak
                </span>
              </li>
              <li className="flex items-start">
                <svg
                  className="mt-1 mr-2 h-5 w-5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  Ödemeniz güvende tutulur, teslimat onayına kadar satıcıya
                  aktarılmaz
                </span>
              </li>
              <li className="flex items-start">
                <svg
                  className="mt-1 mr-2 h-5 w-5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  Satıcıyla mesajlaşma sistemi üzerinden iletişime
                  geçebilirsiniz
                </span>
              </li>
              <li className="flex items-start">
                <svg
                  className="mt-1 mr-2 h-5 w-5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>
                  Teslimat sonrası yorum ve değerlendirme yapabilirsiniz
                </span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Link
              href={`/dashboard/orders/${orderId}`}
              className="rounded-lg bg-indigo-600 px-6 py-3 text-center font-medium text-white transition-colors hover:bg-indigo-700"
            >
              Siparişi Görüntüle
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg border-2 border-indigo-600 px-6 py-3 text-center font-medium text-indigo-600 transition-colors hover:bg-indigo-50"
            >
              Dashboard&apos;a Dön
            </Link>
          </div>

          {/* Email Confirmation Notice */}
          <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 text-center">
            <p className="text-sm text-gray-600">
              <svg
                className="mr-1 inline h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Sipariş onay e-postası e-posta adresinize gönderildi
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
