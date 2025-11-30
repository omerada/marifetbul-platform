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
import dynamic from 'next/dynamic';
import logger from '@/lib/infrastructure/monitoring/logger';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import {
  ChevronLeft,
  Package,
  User,
  Calendar,
  DollarSign,
  FileText,
  AlertCircle,
  Flag,
  RefreshCcw,
} from 'lucide-react';
import {
  OrderWorkflowStepper,
  OrderActions,
  OrderMessagingPanel,
  ManualPaymentConfirmationForm,
  PaymentModeDisplay,
  UnifiedDeliveryButton,
  OrderDetailTabs,
  type OrderTab,
} from '@/components/domains/orders';
import { RefundCreationForm } from '@/components/domains/refunds';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { orderApi } from '@/lib/api/orders';
import { PaymentRetryStatus } from '@/components/domains/payments/PaymentRetryStatus';
import { PaymentRetryHistory } from '@/components/domains/payments/PaymentRetryHistory';
import { PaymentRetryButton } from '@/components/domains/payments';
import { formatCurrency, formatDate } from '@/lib/shared/formatters';
import type { OrderResponse, MilestoneResponse } from '@/types/backend-aligned';
import { enrichOrder, type OrderWithComputed } from '@/types/backend-aligned';
import type { OrderMilestone } from '@/types/business/features/milestone';
import { useWebSocket, useAuth, useOrderUpdates } from '@/hooks';
import { MilestoneList } from '@/components/domains/milestones';
import { useMilestoneWebSocket } from '@/hooks/business/useMilestoneWebSocket';
import Link from 'next/link';
import { toast } from 'sonner';
import { getDisputeByOrderId } from '@/lib/api/disputes';
import type { DisputeResponse } from '@/types/dispute';
import { getRefundByOrderId } from '@/lib/api/refunds';
import type { RefundDto } from '@/types/business/features/refund';

// Lazy load dispute modal - Sprint 4 Performance Optimization
const DisputeCreationModal = dynamic(
  () =>
    import('@/components/domains/disputes').then((mod) => ({
      default: mod.DisputeCreationModal,
    })),
  { ssr: false }
);

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
  const [dispute, setDispute] = useState<DisputeResponse | null>(null);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [refund, setRefund] = useState<RefundDto | null>(null);
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [showRetryHistory, setShowRetryHistory] = useState(false);

  // Story 1.1: Tab navigation state
  const [activeTab, setActiveTab] = useState<OrderTab>('details');
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  // Milestone management moved to dedicated page:
  // /dashboard/orders/[id]/milestones

  // Get authenticated user
  const { user } = useAuth();

  // WebSocket for real-time updates
  const socket = useWebSocket();

  // Real-time order updates with toast notifications
  useOrderUpdates({
    orderId: orderId || '',
    enableToast: true,
    onStatusChange: (updatedOrder) => {
      // Convert Order to OrderResponse by casting (they're compatible)
      setOrder(enrichOrder(updatedOrder as unknown as OrderResponse));
    },
    onDelivered: (_data) => {
      // Reload order to get full updated data
      loadOrder();
    },
    onAccepted: (_data) => {
      // Reload order to get full updated data
      loadOrder();
    },
    onRevisionRequested: (_data) => {
      // Reload order to get full updated data
      loadOrder();
    },
    onCompleted: (updatedOrder) => {
      setOrder(enrichOrder(updatedOrder as unknown as OrderResponse));
    },
  });

  // STORY 1.4: Real-time milestone notifications
  useMilestoneWebSocket({
    orderId: orderId || undefined,
    autoRevalidate: true,
    showToasts: true,
    onMilestoneDelivered: (data) => {
      logger.info('[OrderDetail] Milestone delivered', {
        milestoneId: data.milestone.id,
        deliveryNotes: data.deliveryNotes,
      });
      loadOrder(); // Refresh order data
    },
    onMilestoneAccepted: (data) => {
      logger.info('[OrderDetail] Milestone accepted', {
        milestoneId: data.milestone.id,
        paymentReleased: data.paymentReleased,
      });
      loadOrder(); // Refresh order data
    },
    onMilestoneRevisionRequested: (data) => {
      logger.info('[OrderDetail] Milestone revision requested', {
        milestoneId: data.id,
        orderId: orderId,
      });
      loadOrder(); // Refresh order data
    },
    onMilestoneStatusChanged: (data) => {
      logger.info('[OrderDetail] Milestone status changed', {
        milestoneId: data.id,
        status: data.status,
      });
      loadOrder(); // Refresh order data
    },
  });

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

      // Determine user role based on authenticated user ID
      if (user) {
        const isSeller = data.sellerId === user.id;
        setUserRole(isSeller ? 'seller' : 'buyer');
      } else {
        // Fallback: determine role from URL path
        const isSeller = window.location.pathname.includes('/freelancer/');
        setUserRole(isSeller ? 'seller' : 'buyer');
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Sipariş yüklenemedi';
      setError(message);
      toast.error('Hata', { description: message });
    } finally {
      setIsLoading(false);
    }
  }, [orderId, user]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  // Load dispute information if order is in disputed status
  const loadDispute = useCallback(async () => {
    if (!orderId || !order || order.status !== 'DISPUTED') return;

    try {
      const disputeData = await getDisputeByOrderId(orderId);
      setDispute(disputeData);
    } catch (_err) {
      // No dispute found is OK - user might be about to create one
      logger.debug('No dispute found for order', { orderId });
    }
  }, [orderId, order]);

  useEffect(() => {
    if (order?.status === 'DISPUTED') {
      loadDispute();
    }
  }, [order?.status, loadDispute]);

  // Load refund information if exists
  const loadRefund = useCallback(async () => {
    if (!orderId) return;

    try {
      const refundData = await getRefundByOrderId(orderId);
      setRefund(refundData);
    } catch (_err) {
      // No refund found is OK
      setRefund(null);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      loadRefund();
    }
  }, [orderId, loadRefund]);

  // Handle dispute events from WebSocket
  const handleDisputeEvent = useCallback(
    (payload: {
      type: string;
      orderId: string;
      orderNumber: string;
      reason?: string;
      reasonLabel?: string;
      resolutionType?: string;
      status: string;
    }) => {
      if (payload.type === 'DISPUTE_CREATED') {
        toast.warning('İhtilaf Açıldı', {
          description: `Sipariş #${payload.orderNumber} için ihtilaf açıldı: ${payload.reasonLabel || payload.reason}`,
          duration: 5000,
        });

        // Update order status to DISPUTED
        if (order) {
          setOrder({
            ...order,
            status: 'DISPUTED',
          });
        }

        // Reload dispute information
        loadDispute();
      } else if (payload.type === 'DISPUTE_RESOLVED') {
        toast.success('İhtilaf Çözüldü', {
          description: `Sipariş #${payload.orderNumber} için ihtilaf çözüldü. Sipariş durumu: ${payload.status}`,
          duration: 5000,
        });

        // Update order with new status
        if (order) {
          setOrder({
            ...order,
            status: payload.status as typeof order.status,
          });
        }

        // Clear dispute information
        setDispute(null);
      }
    },
    [order, loadDispute]
  );

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
          const payload = JSON.parse(msgBody);

          // Check if this is a dispute event
          if (
            payload.type === 'DISPUTE_CREATED' ||
            payload.type === 'DISPUTE_RESOLVED'
          ) {
            handleDisputeEvent(payload);
            return;
          }

          // Handle regular order updates
          const updatedOrder = payload as OrderResponse;
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
          logger.error(
            'Failed to parse order WebSocket update',
            err instanceof Error ? err : new Error(String(err)),
            {
              orderId,
              component: 'OrderDetailPage',
              action: 'websocket-update',
            }
          );
        }
      }
    );

    return () => {
      socket.unsubscribe(subscriptionId);
    };
  }, [socket, orderId, order?.status, handleDisputeEvent]);

  // Handle action completion
  const handleActionComplete = (updatedOrder: OrderResponse) => {
    // Extract data from ApiResponse if needed
    const data =
      'data' in updatedOrder
        ? (updatedOrder as unknown as { data: OrderResponse }).data
        : updatedOrder;
    setOrder(enrichOrder(data));
  };

  // Handle manual payment confirmation success
  const handleManualPaymentSuccess = (updatedOrder: OrderResponse) => {
    setOrder(enrichOrder(updatedOrder));
    toast.success('Ödeme Onaylandı', {
      description:
        'Manuel ödeme başarıyla onaylandı. Artık işe başlayabilirsiniz.',
    });
  };

  // Check if user can raise a dispute
  const canRaiseDispute = useCallback(() => {
    if (!order) return false;

    // Cannot raise dispute if already disputed
    if (order.status === 'DISPUTED') return false;

    // Can only raise dispute for certain statuses
    const allowedStatuses = [
      'IN_PROGRESS',
      'IN_REVIEW',
      'DELIVERED',
      'COMPLETED',
    ];
    return allowedStatuses.includes(order.status);
  }, [order]);

  // Handle dispute button click
  const handleDisputeClick = () => {
    setShowDisputeModal(true);
  };

  // Handle dispute creation success
  const handleDisputeCreated = () => {
    toast.success('İtiraz Açıldı', {
      description:
        'İtirazınız başarıyla oluşturuldu. Yönetim ekibi inceleyecektir.',
    });
    setShowDisputeModal(false);
    // Reload order to get updated status
    loadOrder();
  };

  // Check if user can request refund
  const canRequestRefund = useCallback(() => {
    if (!order || !user) return false;

    // Only buyer can request refund
    if (userRole !== 'buyer') return false;

    // Cannot request if already has a refund
    if (refund) return false;

    // Cannot request if order is not paid
    if (order.paymentStatus !== 'COMPLETED') return false;

    // Can request refund for certain statuses
    const allowedStatuses = [
      'PAID',
      'IN_PROGRESS',
      'IN_REVIEW',
      'DELIVERED',
      'COMPLETED',
    ];
    return allowedStatuses.includes(order.status);
  }, [order, user, userRole, refund]);

  // Handle refund request success
  const handleRefundSuccess = () => {
    toast.success('İade Talebi Oluşturuldu', {
      description:
        'İade talebiniz başarıyla oluşturuldu. Yönetim ekibi inceleyecektir.',
    });
    setShowRefundForm(false);
    // Reload refund information
    loadRefund();
  };

  // ================================================
  // MILESTONE MANAGEMENT
  // ================================================
  // Milestone CRUD operations moved to dedicated page:
  // /dashboard/orders/[id]/milestones
  // This keeps order detail page focused and maintainable

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center gap-4">
          <div className="bg-muted h-10 w-10 animate-pulse rounded" />
          <div className="bg-muted h-8 w-48 animate-pulse rounded" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Order details skeleton */}
            <div className="rounded-lg border p-6">
              <div className="space-y-4">
                <div className="bg-muted h-6 w-32 animate-pulse rounded" />
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="bg-muted h-4 w-24 animate-pulse rounded" />
                      <div className="bg-muted h-4 w-32 animate-pulse rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline skeleton */}
            <div className="rounded-lg border p-6">
              <div className="bg-muted mb-4 h-6 w-40 animate-pulse rounded" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="bg-muted h-10 w-10 animate-pulse rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
                      <div className="bg-muted h-3 w-1/2 animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Actions skeleton */}
            <div className="rounded-lg border p-6">
              <div className="bg-muted mb-4 h-6 w-24 animate-pulse rounded" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-muted h-10 w-full animate-pulse rounded"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
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
          href="/dashboard/orders"
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
            <div className="flex items-center gap-3">
              <p className="text-gray-600">
                {orderApi.getOrderStatusLabel(order.status)}
              </p>
              {order.status === 'DISPUTED' && (
                <Badge variant="warning" size="md">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  İHTİLAF VAR
                </Badge>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Refund Button */}
            {canRequestRefund() && (
              <Button variant="outline" onClick={() => setShowRefundForm(true)}>
                <DollarSign className="mr-2 h-4 w-4" />
                İade Talebi
              </Button>
            )}

            {/* Dispute Actions */}
            {order.status === 'DISPUTED' && dispute && (
              <Button
                variant="outline"
                onClick={() => router.push(`/disputes/${dispute.id}`)}
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                İtiraz Detayı
              </Button>
            )}
            {canRaiseDispute() && (
              <Button variant="destructive" onClick={handleDisputeClick}>
                <Flag className="mr-2 h-4 w-4" />
                İtiraz Aç
              </Button>
            )}
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

      {/* Story 1.1: Tab Navigation ✅ */}
      <Card className="mb-6">
        <OrderDetailTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          hasMilestones={(order.milestones?.length ?? 0) > 0}
          unreadMessages={unreadMessagesCount}
          pendingMilestones={
            order.milestones?.filter(
              (m: MilestoneResponse) => m.status === 'DELIVERED'
            ).length ?? 0
          }
        />
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - 2 columns */}
        <div className="space-y-6 lg:col-span-2">
          {/* ================================================
               TAB CONTENT - Story 1.1 ✅
               ================================================ */}

          {/* DETAILS TAB */}
          {activeTab === 'details' && (
            <>
              {/* Payment Mode Display - Show payment info for all payment modes */}
              <PaymentModeDisplay
                paymentMode={order.paymentMode}
                orderStatus={order.status}
                paymentProofUrl={order.paymentProofUrl}
                paymentConfirmedAt={order.paymentConfirmedAt}
                buyerConfirmed={order.buyerPaymentConfirmed}
                sellerConfirmed={order.sellerPaymentConfirmed}
                userRole={userRole}
                onViewProof={() => {
                  logger.info('Payment proof viewed', { orderId: order.id });
                }}
              />

              {/* Payment Retry UI - Sprint 1.3: Show retry button for failed payments */}
              {order.paymentId &&
                order.paymentStatus === 'FAILED' &&
                userRole === 'buyer' && (
                  <PaymentRetryButton
                    paymentId={order.paymentId}
                    onRetrySuccess={() => {
                      logger.info('Payment retry succeeded', {
                        orderId: order.id,
                      });
                      toast.success('Ödeme başarılı!', {
                        description: 'Ödemeniz başarıyla tamamlandı.',
                      });
                      // Reload order to reflect payment status change
                      loadOrder();
                    }}
                    onRetryFailure={(reason) => {
                      logger.warn('Payment retry failed', {
                        orderId: order.id,
                        reason,
                      });
                    }}
                  />
                )}

              {/* IBAN Display - Show for manual payment pending */}
              {order.paymentMode === 'MANUAL_IBAN' &&
                order.status === 'PENDING_PAYMENT' &&
                order.sellerIban && (
                  <IBANDisplayCard
                    iban={order.sellerIban}
                    orderStatus={order.status}
                    userRole={userRole}
                    sellerName={
                      order.seller?.fullName || order.seller?.username
                    }
                    orderAmount={order.financials.total}
                    currency={order.financials.currency}
                    orderNumber={order.orderNumber}
                    isPaymentConfirmed={false}
                  />
                )}

              {/* Manual Payment Confirmation - Show for seller when payment pending */}
              {order.paymentMode === 'MANUAL_IBAN' &&
                order.status === 'PENDING_PAYMENT' &&
                userRole === 'seller' && (
                  <ManualPaymentConfirmationForm
                    orderId={order.id}
                    orderNumber={order.orderNumber}
                    orderAmount={order.financials.total}
                    currency={order.financials.currency}
                    buyerName={order.buyer?.fullName || order.buyer?.username}
                    onSuccess={handleManualPaymentSuccess}
                  />
                )}

              {/* Dispute Information - Show if disputed */}
              {order.status === 'DISPUTED' && dispute && (
                <Card className="border-2 border-yellow-300 bg-yellow-50 p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-200">
                        <AlertCircle className="h-5 w-5 text-yellow-700" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-yellow-900">
                          İtiraz Durumu
                        </h2>
                        <p className="text-sm text-yellow-700">
                          Bu sipariş için bir itiraz açılmıştır
                        </p>
                      </div>
                    </div>
                    <Badge variant="warning" size="md">
                      {dispute.status}
                    </Badge>
                  </div>

                  <div className="space-y-3 border-t border-yellow-200 pt-4">
                    <div>
                      <label className="text-sm font-medium text-yellow-800">
                        İtiraz Nedeni
                      </label>
                      <p className="text-yellow-900">
                        {dispute.reasonDisplayName || dispute.reason}
                      </p>
                    </div>

                    {dispute.description && (
                      <div>
                        <label className="text-sm font-medium text-yellow-800">
                          Açıklama
                        </label>
                        <p className="text-sm text-yellow-900">
                          {dispute.description}
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium text-yellow-800">
                        Oluşturulma Tarihi
                      </label>
                      <p className="text-sm text-yellow-900">
                        {formatDate(dispute.createdAt)}
                      </p>
                    </div>

                    {dispute.resolvedAt && (
                      <div>
                        <label className="text-sm font-medium text-yellow-800">
                          Çözüm Tarihi
                        </label>
                        <p className="text-sm text-yellow-900">
                          {formatDate(dispute.resolvedAt)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/disputes/${dispute.id}`)}
                      className="w-full"
                    >
                      İtiraz Detaylarını Görüntüle
                    </Button>
                  </div>
                </Card>
              )}

              {/* Payment Retry Status - Show if payment failed and retry exists */}
              {order.paymentId && (
                <div className="space-y-4">
                  <PaymentRetryStatus
                    paymentId={order.paymentId}
                    showDetails={true}
                    onRetrySuccess={() => {
                      toast.success('Ödeme Başarılı', {
                        description:
                          'Ödemeniz başarıyla tamamlandı. Sipariş durumu güncelleniyor...',
                      });
                      loadOrder();
                    }}
                  />

                  {/* Toggle for Retry History */}
                  {showRetryHistory && (
                    <PaymentRetryHistory
                      paymentId={order.paymentId}
                      className="mt-4"
                    />
                  )}

                  <button
                    onClick={() => setShowRetryHistory(!showRetryHistory)}
                    className="text-primary-600 hover:text-primary-700 w-full py-2 text-center text-sm font-medium"
                  >
                    {showRetryHistory
                      ? 'Deneme Geçmişini Gizle'
                      : 'Deneme Geçmişini Göster'}
                  </button>
                </div>
              )}

              {/* Refund Information - Show if refund exists */}
              {refund && (
                <Card className="border-2 border-blue-300 bg-blue-50 p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-200">
                        <DollarSign className="h-5 w-5 text-blue-700" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-blue-900">
                          İade Talebi
                        </h2>
                        <p className="text-sm text-blue-700">
                          Bu sipariş için iade talebi oluşturulmuştur
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        refund.status === 'APPROVED'
                          ? 'success'
                          : refund.status === 'REJECTED'
                            ? 'destructive'
                            : refund.status === 'COMPLETED'
                              ? 'success'
                              : 'warning'
                      }
                      size="md"
                    >
                      {refund.status}
                    </Badge>
                  </div>

                  <div className="space-y-3 border-t border-blue-200 pt-4">
                    <div>
                      <label className="text-sm font-medium text-blue-800">
                        İade Tutarı
                      </label>
                      <p className="text-blue-900">
                        {formatCurrency(refund.amount, refund.currency)}
                      </p>
                    </div>

                    {refund.reason && (
                      <div>
                        <label className="text-sm font-medium text-blue-800">
                          İade Nedeni
                        </label>
                        <p className="text-blue-900">{refund.reason}</p>
                      </div>
                    )}

                    {refund.description && (
                      <div>
                        <label className="text-sm font-medium text-blue-800">
                          Açıklama
                        </label>
                        <p className="text-sm text-blue-900">
                          {refund.description}
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium text-blue-800">
                        Oluşturulma Tarihi
                      </label>
                      <p className="text-sm text-blue-900">
                        {formatDate(refund.createdAt)}
                      </p>
                    </div>

                    {refund.processedAt && (
                      <div>
                        <label className="text-sm font-medium text-blue-800">
                          İşlem Tarihi
                        </label>
                        <p className="text-sm text-blue-900">
                          {formatDate(refund.processedAt)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <Button
                      variant="outline"
                      onClick={() =>
                        router.push(`/dashboard/refunds/${refund.id}`)
                      }
                      className="w-full"
                    >
                      İade Detaylarını Görüntüle
                    </Button>
                  </div>
                </Card>
              )}

              {/* Order Information - Details Tab */}
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
                              {order.packageDetails.features.map(
                                (feature, i) => (
                                  <li key={i}>{feature}</li>
                                )
                              )}
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
            </>
          )}
          {/* End Details Tab */}

          {/* ================================================
               MILESTONES TAB - Story 1.1 ✅
               ================================================ */}
          {activeTab === 'milestones' && (
            <>
              {order.milestones && order.milestones.length > 0 ? (
                <Card className="p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      <Package className="mr-2 inline-block h-5 w-5" />
                      Milestone Yönetimi
                    </h2>
                    <Link href={`/dashboard/orders/${order.id}/milestones`}>
                      <Button variant="outline" size="sm">
                        Detaylı Yönetim →
                      </Button>
                    </Link>
                  </div>

                  {/* Clean MilestoneList Component - Single Source of Truth */}
                  <MilestoneList
                    orderId={order.id}
                    userRole={userRole === 'seller' ? 'FREELANCER' : 'EMPLOYER'}
                    showCreateButton={false}
                  />
                </Card>
              ) : (
                /* Milestone Feature Available Notice (No Milestones Yet) */
                <Card className="border-purple-100 bg-purple-50 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-purple-100">
                      <Package className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1 font-semibold text-gray-900">
                        Milestone Bazlı Ödeme Kullanılabilir
                      </h3>
                      <p className="mb-4 text-sm text-gray-600">
                        Bu siparişi milestone'lara bölerek adım adım ödeme
                        alabilirsiniz. Her milestone teslim edilip
                        onaylandığında ödeme otomatik serbest bırakılır.
                      </p>
                      <Link href={`/dashboard/orders/${order.id}/milestones`}>
                        <Button variant="default" size="sm">
                          Milestone Oluştur →
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}
          {/* End Milestones Tab */}

          {/* ================================================
               MESSAGES TAB - Story 1.1 ✅
               ================================================ */}
          {activeTab === 'messages' && (
            <Card className="p-6">
              <OrderMessagingPanel
                orderId={order.id}
                userRole={userRole}
                onNewMessage={() => {
                  // Update unread count
                  setUnreadMessagesCount(0);
                }}
              />
            </Card>
          )}
          {/* End Messages Tab */}
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

            {/* Refund Actions */}
            {userRole === 'buyer' && (
              <div className="mt-4 space-y-3 border-t pt-4">
                {refund ? (
                  // Show refund status if exists
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        İade Durumu
                      </span>
                      <StatusBadge
                        status={refund.status}
                        type="REFUND"
                        size="sm"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/dashboard/refunds')}
                      className="w-full"
                    >
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      İade Detaylarını Gör
                    </Button>
                  </div>
                ) : canRequestRefund() ? (
                  // Show refund request button if eligible
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRefundForm(true)}
                    className="w-full"
                  >
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    İade Talebi Oluştur
                  </Button>
                ) : null}
              </div>
            )}

            {/* Dispute Actions */}
            {canRaiseDispute() && (
              <div className="mt-4 border-t pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisputeClick}
                  className="w-full text-yellow-700 hover:bg-yellow-50"
                >
                  <Flag className="mr-2 h-4 w-4" />
                  İtiraz Oluştur
                </Button>
              </div>
            )}
          </Card>

          {/* Refund Request Form Modal */}
          {showRefundForm && order && (
            <RefundCreationForm
              isOpen={showRefundForm}
              onClose={() => setShowRefundForm(false)}
              orderId={order.id}
              orderNumber={order.orderNumber}
              maxAmount={order.financials.total}
              onSuccess={handleRefundSuccess}
            />
          )}

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

      {/* Dispute Creation Modal */}
      {showDisputeModal && (
        <DisputeCreationModal
          orderId={orderId}
          orderNumber={order.orderNumber}
          isOpen={showDisputeModal}
          onClose={() => setShowDisputeModal(false)}
          onSuccess={handleDisputeCreated}
        />
      )}
    </div>
  );
}
