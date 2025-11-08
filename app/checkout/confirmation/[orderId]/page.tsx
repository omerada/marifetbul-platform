/**
 * ================================================
 * ORDER CONFIRMATION PAGE
 * ================================================
 * Order success confirmation page
 *
 * Route: /checkout/confirmation/[orderId]
 *
 * Features:
 * - Order summary
 * - Payment confirmation
 * - Next steps
 * - Seller contact info
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 26
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  CheckCircle,
  Clock,
  MessageCircle,
  Download,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui';
import {
  orderApi,
  enrichOrder,
  unwrapOrderResponse,
  type OrderWithComputed,
} from '@/lib/api/orders';
import logger from '@/lib/infrastructure/monitoring/logger';

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<OrderWithComputed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load order details
  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        const response = await orderApi.getOrder(orderId);
        const data = unwrapOrderResponse(response);
        setOrder(enrichOrder(data));
      } catch (err) {
        logger.error(
          'Failed to load order for confirmation page',
          err instanceof Error ? err : new Error(String(err)),
          {
            orderId,
            component: 'OrderConfirmationPage',
            action: 'load-order',
          }
        );
        setError('Sipariş bilgileri yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <h2 className="mb-2 text-2xl font-bold text-red-800">
              Hata Oluştu
            </h2>
            <p className="mb-4 text-red-600">{error || 'Sipariş bulunamadı'}</p>
            <Button onClick={() => router.push('/dashboard/employer/orders')}>
              Siparişlerime Git
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          {/* Success Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              Siparişiniz Alındı!
            </h1>
            <p className="text-lg text-gray-600">
              Sipariş No:{' '}
              <span className="font-semibold">{order.orderNumber}</span>
            </p>
          </div>

          {/* Order Summary Card */}
          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Sipariş Özeti
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-gray-200 pb-3">
                <span className="text-gray-600">Paket</span>
                <span className="font-medium text-gray-900">
                  {order.packageDetails?.packageTitle ||
                    order.customDescription ||
                    'Özel Sipariş'}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-3">
                <span className="text-gray-600">Satıcı</span>
                <span className="font-medium text-gray-900">
                  {order.seller?.fullName || order.seller?.username || 'Satıcı'}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-3">
                <span className="text-gray-600">Tutar</span>
                <span className="font-medium text-gray-900">
                  {formatPrice(order.financials.total)}
                </span>
              </div>
              {order.deadline && (
                <div className="flex justify-between border-b border-gray-200 pb-3">
                  <span className="text-gray-600">Teslim Tarihi</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(order.deadline)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Sipariş Tarihi</span>
                <span className="font-medium text-gray-900">
                  {formatDate(order.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Sıradaki Adımlar
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-purple-100">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    Satıcı Siparişi İnceleyecek
                  </h3>
                  <p className="text-sm text-gray-600">
                    Satıcı siparişinizi 24 saat içinde kabul edecek ve işe
                    başlayacak.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    Satıcıyla İletişime Geçin
                  </h3>
                  <p className="text-sm text-gray-600">
                    Mesajlaşma sistemi üzerinden satıcıyla iletişime geçebilir
                    ve süreç hakkında bilgi alabilirsiniz.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                  <Download className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    Teslimatı Bekleyin
                  </h3>
                  <p className="text-sm text-gray-600">
                    Satıcı işi tamamladığında size bildirim gelecek ve teslimatı
                    inceleyebileceksiniz.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Requirements Section */}
          {order.requirements && (
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Gereksinimleriniz
              </h2>
              <p className="whitespace-pre-wrap text-gray-700">
                {order.requirements}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/employer/orders')}
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Siparişlerime Git
            </Button>
            <Button
              onClick={() => router.push(`/messages?user=${order.sellerId}`)}
              className="w-full sm:w-auto"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Satıcıyla Mesajlaş
            </Button>
          </div>

          {/* Support Info */}
          <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
            <p className="text-sm text-blue-800">
              Sorunuz mu var?{' '}
              <button
                onClick={() => router.push('/support')}
                className="font-medium underline hover:no-underline"
              >
                Destek Ekibimizle İletişime Geçin
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
