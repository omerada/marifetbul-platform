/**
 * ================================================
 * ORDER DETAIL PAGE
 * ================================================
 * Unified order detail page for buyers and sellers
 *
 * Features:
 * - Backend-aligned Order types
 * - Real-time WebSocket updates
 * - Role-based action buttons
 * - Order workflow visualization
 * - Complete order information
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Story 1: Backend-Aligned Types
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button, Loading } from '@/components/ui';
import {
  ChevronLeft,
  Package,
  User,
  Calendar,
  DollarSign,
  FileText,
  AlertCircle,
} from 'lucide-react';
import {
  OrderWorkflowStepper,
  OrderActions,
  OrderMessagingPanel,
} from '@/components/dashboard/orders';
import { orderApi } from '@/lib/api/orders';
import type { OrderResponse } from '@/types/backend-aligned';
import { enrichOrder, type OrderWithComputed } from '@/types/backend-aligned';
import { useWebSocket } from '@/hooks';
import Link from 'next/link';
import { toast } from 'sonner';

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

// ================================================
// COMPONENT
// ================================================

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<OrderWithComputed | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'buyer' | 'seller'>('buyer');

  // WebSocket for real-time updates
  const socket = useWebSocket();

  // Load order details
  const loadOrder = useCallback(async () => {
    if (!orderId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await orderApi.getOrder(orderId);
      // Extract data from ApiResponse wrapper
      const data = 'data' in response ? response.data : response;
      // Enrich order with computed properties for backward compatibility
      setOrder(enrichOrder(data));

      // TODO: Get actual user ID from auth context
      // For now, determine role from URL or assume buyer
      const isSeller = window.location.pathname.includes('/freelancer/');
      setUserRole(isSeller ? 'seller' : 'buyer');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Sipariş yüklenemedi';
      setError(message);
      toast.error('Hata', { description: message });
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  // Real-time WebSocket updates
  useEffect(() => {
    if (!socket.isConnected || !orderId) return;

    // Subscribe to order-specific updates
    const subscriptionId = socket.subscribe(
      `/user/queue/orders/${orderId}`,
      (message: unknown) => {
        try {
          // Type guard for message with body
          if (!message || typeof message !== 'object' || !('body' in message)) {
            return;
          }

          const msgBody = (message as { body: string }).body;
          const updatedOrder = JSON.parse(msgBody) as OrderResponse;

          // Only update if it's our order
          if (updatedOrder.id === orderId) {
            const previousStatus = order?.status;
            // Enrich updated order before setting state
            setOrder(enrichOrder(updatedOrder));

            // Show notification based on update type
            if (previousStatus && updatedOrder.status !== previousStatus) {
              toast.info('Sipariş Güncellendi', {
                description: `Sipariş durumu güncellendi`,
              });
            }
          }
        } catch (err) {
          console.error('Failed to parse order update:', err);
        }
      }
    );

    return () => {
      socket.unsubscribe(subscriptionId);
    };
  }, [socket, orderId, order?.status]);

  // Handle action completion
  const handleActionComplete = (updatedOrder: OrderResponse) => {
    // Extract data from ApiResponse if needed
    const data =
      'data' in updatedOrder
        ? (updatedOrder as unknown as { data: OrderResponse }).data
        : updatedOrder;
    setOrder(enrichOrder(data));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <Card className="p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-xl font-semibold">Sipariş Bulunamadı</h2>
          <p className="mb-6 text-gray-600">{error || 'Bir hata oluştu'}</p>
          <Button onClick={() => router.back()}>Geri Dön</Button>
        </Card>
      </div>
    );
  }

  // ================================================
  // RENDER
  // ================================================

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={
            userRole === 'seller'
              ? '/dashboard/freelancer/orders'
              : '/dashboard/employer/orders'
          }
          className="text-primary-600 hover:text-primary-700 mb-4 inline-flex items-center text-sm"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Siparişlere Dön
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              Sipariş #{order.orderNumber}
            </h1>
            <p className="text-gray-600">
              {orderApi.getOrderStatusLabel(order.status)}
            </p>
          </div>
        </div>
      </div>

      {/* Workflow Stepper */}
      <Card className="mb-6 p-6">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">
          Sipariş Durumu
        </h2>
        <OrderWorkflowStepper
          currentStatus={order.status}
          createdAt={order.createdAt}
          paidAt={
            order.paymentStatus === 'COMPLETED' ? order.createdAt : undefined
          }
          completedAt={order.completedAt}
          canceledAt={order.cancellation?.canceledAt}
        />
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - 2 columns */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Information */}
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              <Package className="mr-2 inline-block h-5 w-5" />
              Sipariş Bilgileri
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Paket/Hizmet
                </label>
                <p className="text-gray-900">
                  {order.packageDetails?.packageTitle ||
                    order.customDescription ||
                    'Özel Sipariş'}
                </p>
              </div>

              {order.requirements && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Gereksinimler
                  </label>
                  <p className="whitespace-pre-wrap text-gray-900">
                    {order.requirements}
                  </p>
                </div>
              )}

              {order.packageDetails && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Paket Seviyesi
                      </label>
                      <p className="text-gray-900">
                        {order.packageDetails.tier}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Teslimat Süresi
                      </label>
                      <p className="text-gray-900">
                        {order.packageDetails.deliveryDays} gün
                      </p>
                    </div>
                  </div>
                  {order.packageDetails.features &&
                    order.packageDetails.features.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Özellikler
                        </label>
                        <ul className="mt-2 list-inside list-disc text-gray-900">
                          {order.packageDetails.features.map((feature, i) => (
                            <li key={i}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                </>
              )}
            </div>
          </Card>

          {/* Delivery Information */}
          {order.delivery?.deliveryNote && (
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                <FileText className="mr-2 inline-block h-5 w-5" />
                Teslimat Bilgileri
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Teslimat Notu
                  </label>
                  <p className="whitespace-pre-wrap text-gray-900">
                    {order.delivery.deliveryNote}
                  </p>
                </div>
                {order.delivery.submittedAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Teslim Tarihi
                    </label>
                    <p className="text-gray-900">
                      {formatDate(order.delivery.submittedAt)}
                    </p>
                  </div>
                )}
                {order.delivery.attachments &&
                  order.delivery.attachments.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Ekler ({order.delivery.attachments.length})
                      </label>
                      <div className="mt-2 space-y-2">
                        {order.delivery.attachments.map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700 block text-sm underline"
                          >
                            Ek #{i + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </Card>
          )}

          {/* Revisions */}
          {order.revisions && (
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Revizyon Bilgileri
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Kullanılan
                  </label>
                  <p className="text-2xl font-semibold text-gray-900">
                    {order.revisions.revisionsUsed}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Kalan
                  </label>
                  <p className="text-2xl font-semibold text-gray-900">
                    {order.revisions.revisionsRemaining}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Toplam
                  </label>
                  <p className="text-2xl font-semibold text-gray-900">
                    {order.revisions.revisionLimit}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Actions */}
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              İşlemler
            </h2>
            <OrderActions
              order={order}
              userRole={userRole}
              onActionComplete={handleActionComplete}
              className="flex-col"
            />
          </Card>

          {/* Financial Details */}
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              <DollarSign className="mr-2 inline-block h-5 w-5" />
              Finansal Bilgiler
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Alt Toplam</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(
                    order.financials.subtotal,
                    order.financials.currency
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Hizmet Bedeli</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(
                    order.financials.serviceFee,
                    order.financials.currency
                  )}
                </span>
              </div>
              {order.financials.tax && order.financials.tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">KDV</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(
                      order.financials.tax || 0,
                      order.financials.currency
                    )}
                  </span>
                </div>
              )}
              {order.financials.discount && order.financials.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="text-sm">İndirim</span>
                  <span className="font-medium">
                    -
                    {formatCurrency(
                      order.financials.discount,
                      order.financials.currency
                    )}
                  </span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Toplam</span>
                  <span className="text-xl font-bold text-purple-600">
                    {formatCurrency(
                      order.financials.total,
                      order.financials.currency
                    )}
                  </span>
                </div>
              </div>
              {userRole === 'seller' && order.financials.sellerEarnings && (
                <div className="mt-4 rounded-lg bg-green-50 p-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-green-800">
                      Kazancınız
                    </span>
                    <span className="font-semibold text-green-800">
                      {formatCurrency(
                        order.financials.sellerEarnings || 0,
                        order.financials.currency
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Parties */}
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              <User className="mr-2 inline-block h-5 w-5" />
              Taraflar
            </h2>
            <div className="space-y-4">
              {order.buyer && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Alıcı
                  </label>
                  <p className="text-gray-900">
                    {order.buyer.fullName || order.buyer.username}
                  </p>
                </div>
              )}
              {order.seller && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Satıcı
                  </label>
                  <p className="text-gray-900">
                    {order.seller.fullName || order.seller.username}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Timeline */}
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              <Calendar className="mr-2 inline-block h-5 w-5" />
              Tarihler
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <label className="font-medium text-gray-600">Oluşturulma</label>
                <p className="text-gray-900">{formatDate(order.createdAt)}</p>
              </div>
              {order.deadline && (
                <div>
                  <label className="font-medium text-gray-600">Son Tarih</label>
                  <p className="text-gray-900">{formatDate(order.deadline)}</p>
                </div>
              )}
              {order.completedAt && (
                <div>
                  <label className="font-medium text-gray-600">
                    Tamamlanma
                  </label>
                  <p className="text-gray-900">
                    {formatDate(order.completedAt)}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Messaging Section */}
      <div className="mt-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Mesajlaşma</h2>
        <OrderMessagingPanel
          order={order}
          currentUserId="current-user-id" // TODO: Get from auth context
          userRole={userRole}
          conversationId={order.id} // Using order ID as conversation ID for now
        />
      </div>
    </div>
  );
}
