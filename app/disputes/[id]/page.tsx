/**
 * ================================================
 * DISPUTE DETAIL PAGE
 * ================================================
 * Detailed view of a dispute for users and admins
 *
 * Features:
 * - Dispute information and status
 * - Order details
 * - Evidence gallery
 * - Timeline/history
 * - Real-time updates via WebSocket
 * - Resolution details (if resolved)
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Story 2.1: Dispute Detail Page
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ChevronLeft,
  AlertCircle,
  Package,
  User,
  Calendar,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Button, Loading } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { getDispute } from '@/lib/api/disputes';
import { orderApi } from '@/lib/api/orders';
import type { DisputeResponse } from '@/types/dispute';
import type { OrderResponse } from '@/types/backend-aligned';
import {
  disputeStatusLabels,
  disputeReasonLabels,
  disputeResolutionTypeLabels,
} from '@/types/dispute';
import { useWebSocket } from '@/hooks';
import {
  DisputeTimeline,
  createTimelineEvents,
} from '@/components/domains/disputes';

// ================================================
// HELPER FUNCTIONS
// ================================================

function formatCurrency(amount: number, currency: string = 'TRY'): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
  }).format(amount);
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    OPEN: 'bg-red-100 text-red-800',
    UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
    AWAITING_BUYER_RESPONSE: 'bg-blue-100 text-blue-800',
    AWAITING_SELLER_RESPONSE: 'bg-purple-100 text-purple-800',
    RESOLVED: 'bg-green-100 text-green-800',
    CLOSED: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

// ================================================
// COMPONENT
// ================================================

export default function DisputeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const disputeId = params?.id as string;

  const [dispute, setDispute] = useState<DisputeResponse | null>(null);
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const socket = useWebSocket();

  // Load dispute details
  const loadDispute = useCallback(async () => {
    if (!disputeId) return;

    try {
      setIsLoading(true);
      setError(null);

      const disputeData = await getDispute(disputeId);
      setDispute(disputeData);

      // Load order details
      if (disputeData.orderId) {
        try {
          const orderResponse = await orderApi.getOrder(disputeData.orderId);
          const orderData =
            'data' in orderResponse ? orderResponse.data : orderResponse;
          setOrder(orderData);
        } catch (orderErr) {
          console.error('Failed to load order:', orderErr);
          // Continue even if order fails to load
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'İtiraz yüklenemedi';
      setError(message);
      toast.error('Hata', { description: message });
    } finally {
      setIsLoading(false);
    }
  }, [disputeId]);

  useEffect(() => {
    loadDispute();
  }, [loadDispute]);

  // WebSocket real-time updates
  useEffect(() => {
    if (!socket.isConnected || !disputeId) return;

    const subscriptionId = socket.subscribe(
      '/user/queue/disputes',
      (message: unknown) => {
        try {
          if (!message || typeof message !== 'object' || !('body' in message)) {
            return;
          }

          const msgBody = (message as { body: string }).body;
          const payload = JSON.parse(msgBody);

          if (
            payload.disputeId === disputeId &&
            payload.type === 'DISPUTE_RESOLVED'
          ) {
            toast.success('İtiraz Çözüldü', {
              description: 'İtiraz yönetim ekibi tarafından çözümlendi.',
            });
            loadDispute();
          }
        } catch (_err) {
          console.error('Failed to parse dispute update');
        }
      }
    );

    return () => {
      socket.unsubscribe(subscriptionId);
    };
  }, [socket, disputeId, loadDispute]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  // Error state
  if (error || !dispute) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <Card className="p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-xl font-semibold">İtiraz Bulunamadı</h2>
          <p className="mb-6 text-gray-600">{error || 'Bir hata oluştu'}</p>
          <Button onClick={() => router.back()}>Geri Dön</Button>
        </Card>
      </div>
    );
  }

  const isResolved =
    dispute.status === 'RESOLVED' || dispute.status === 'CLOSED';

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={order ? `/dashboard/orders/${order.id}` : '/dashboard'}
          className="mb-4 inline-flex items-center text-sm text-purple-600 hover:text-purple-700"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Siparişe Dön
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              İtiraz Detayları
            </h1>
            <p className="text-gray-600">
              İtiraz ID: {dispute.id.slice(0, 8)}...
            </p>
          </div>
          <Badge className={getStatusColor(dispute.status)} size="lg">
            {disputeStatusLabels[dispute.status] || dispute.status}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - 2 columns */}
        <div className="space-y-6 lg:col-span-2">
          {/* Status Card */}
          <Card
            className={`border-2 p-6 ${isResolved ? 'border-green-300 bg-green-50' : 'border-yellow-300 bg-yellow-50'}`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${isResolved ? 'bg-green-200' : 'bg-yellow-200'}`}
              >
                {isResolved ? (
                  <CheckCircle className="h-5 w-5 text-green-700" />
                ) : (
                  <Clock className="h-5 w-5 text-yellow-700" />
                )}
              </div>
              <div className="flex-1">
                <h2
                  className={`text-lg font-semibold ${isResolved ? 'text-green-900' : 'text-yellow-900'}`}
                >
                  {isResolved ? 'İtiraz Çözümlendi' : 'İtiraz İnceleniyor'}
                </h2>
                <p
                  className={`mt-1 text-sm ${isResolved ? 'text-green-700' : 'text-yellow-700'}`}
                >
                  {isResolved
                    ? 'Bu itiraz yönetim ekibi tarafından çözümlenmiştir.'
                    : 'İtirazınız inceleniyor. Lütfen bekleyin.'}
                </p>
              </div>
            </div>
          </Card>

          {/* Dispute Information */}
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              <AlertCircle className="mr-2 inline-block h-5 w-5" />
              İtiraz Bilgileri
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  İtiraz Nedeni
                </label>
                <p className="text-gray-900">
                  {disputeReasonLabels[dispute.reason] || dispute.reason}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Açıklama
                </label>
                <p className="whitespace-pre-wrap text-gray-900">
                  {dispute.description}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  İtiraz Açan
                </label>
                <p className="text-gray-900">{dispute.raisedByUserFullName}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Oluşturulma Tarihi
                </label>
                <p className="text-gray-900">{formatDate(dispute.createdAt)}</p>
              </div>
            </div>
          </Card>

          {/* Evidence Gallery */}
          {dispute.evidenceUrls && dispute.evidenceUrls.length > 0 && (
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                <ImageIcon className="mr-2 inline-block h-5 w-5" />
                Kanıtlar ({dispute.evidenceUrls.length})
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {dispute.evidenceUrls.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100 transition-transform hover:scale-105"
                  >
                    <div className="relative h-full w-full">
                      <Image
                        src={url}
                        alt={`Kanıt ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                  </a>
                ))}
              </div>
            </Card>
          )}

          {/* Resolution Details */}
          {isResolved && dispute.resolution && (
            <Card className="border-2 border-green-300 bg-green-50 p-6">
              <h2 className="mb-4 text-lg font-semibold text-green-900">
                <CheckCircle className="mr-2 inline-block h-5 w-5" />
                Çözüm Detayları
              </h2>
              <div className="space-y-4">
                {dispute.resolutionType && (
                  <div>
                    <label className="text-sm font-medium text-green-800">
                      Çözüm Tipi
                    </label>
                    <p className="text-green-900">
                      {disputeResolutionTypeLabels[dispute.resolutionType] ||
                        dispute.resolutionType}
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-green-800">
                    Çözüm Açıklaması
                  </label>
                  <p className="whitespace-pre-wrap text-green-900">
                    {dispute.resolution}
                  </p>
                </div>

                {dispute.refundAmount !== null && dispute.refundAmount > 0 && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-green-800">
                        İade Tutarı
                      </label>
                      <p className="text-xl font-semibold text-green-900">
                        {formatCurrency(dispute.refundAmount)}
                      </p>
                    </div>

                    <div className="rounded-lg border border-green-300 bg-green-100 p-4">
                      <div className="flex gap-3">
                        <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
                        <div className="text-sm">
                          <p className="font-medium text-green-900">
                            İade İşlendi
                          </p>
                          <p className="mt-1 text-green-700">
                            İade tutarı cüzdanınıza otomatik olarak
                            aktarılmıştır. Detaylar için Cüzdan sayfanızı
                            kontrol edebilirsiniz.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {dispute.resolvedByUserFullName && (
                  <div>
                    <label className="text-sm font-medium text-green-800">
                      Çözümleyen
                    </label>
                    <p className="text-green-900">
                      {dispute.resolvedByUserFullName}
                    </p>
                  </div>
                )}

                {dispute.resolvedAt && (
                  <div>
                    <label className="text-sm font-medium text-green-800">
                      Çözüm Tarihi
                    </label>
                    <p className="text-green-900">
                      {formatDate(dispute.resolvedAt)}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Order Information */}
          {order && (
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                <Package className="mr-2 inline-block h-5 w-5" />
                Sipariş Bilgileri
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Sipariş No
                  </label>
                  <p className="text-gray-900">{order.orderNumber}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Durum
                  </label>
                  <p className="text-gray-900">
                    {orderApi.getOrderStatusLabel(order.status)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Tutar
                  </label>
                  <p className="text-lg font-semibold text-purple-600">
                    {formatCurrency(order.totalAmount, 'TRY')}
                  </p>
                </div>

                <div className="pt-3">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                    className="w-full"
                  >
                    Siparişi Görüntüle
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Timeline */}
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              <Calendar className="mr-2 inline-block h-5 w-5" />
              Zaman Çizelgesi
            </h2>
            <DisputeTimeline events={createTimelineEvents(dispute)} />
          </Card>

          {/* Actions */}
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              İşlemler
            </h2>
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="w-full"
              >
                Geri Dön
              </Button>
              {!isResolved && (
                <Button
                  variant="outline"
                  onClick={() => {
                    toast.info('Yakında', {
                      description: 'Mesajlaşma özelliği yakında eklenecek.',
                    });
                  }}
                  className="w-full"
                >
                  <User className="mr-2 h-4 w-4" />
                  Destek ile İletişime Geç
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
