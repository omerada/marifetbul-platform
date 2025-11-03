/**
 * ================================================
 * ORDER ACTIONS COMPONENT
 * ================================================
 * Context-aware action buttons for order management
 *
 * Features:
 * - Role-based actions (buyer vs seller)
 * - Status-based button visibility
 * - Action modals (delivery, revision, cancel)
 * - Real-time action feedback
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Story 1: Order Detail Page
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  Package,
  PlayCircle,
  MessageCircle,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { orderApi } from '@/lib/api/orders';
import type { OrderResponse as Order } from '@/types/backend-aligned';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  normalizeOrder,
  canSubmitDelivery,
  canApproveDelivery,
  canRequestRevision,
  getDeliveryInfo,
} from '@/lib/utils/order-normalization';
import { AcceptOrderModal } from './AcceptOrderModal';
import { DeliverySubmissionModal } from './DeliverySubmissionModal';
import { ApproveDeliveryModal } from './ApproveDeliveryModal';
import { RequestRevisionModal } from './RequestRevisionModal';
import { CancelOrderModal } from './CancelOrderModal';
import { DisputeModal } from '@/components/domains/orders/DisputeModal';

// ================================================
// TYPES
// ================================================

export interface OrderActionsProps {
  order: Order;
  userRole: 'buyer' | 'seller';
  onActionComplete?: (order: Order) => void;
  className?: string;
}

interface ActionButton {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'outline' | 'destructive';
  loading?: boolean;
  disabled?: boolean;
}

// ================================================
// COMPONENT
// ================================================

export function OrderActions({
  order,
  userRole,
  onActionComplete,
  className,
}: OrderActionsProps) {
  // Normalize order for consistent property access
  const orderData = normalizeOrder(order);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);

  // ================================================
  // ACTION HANDLERS
  // ================================================
  // Action Handlers (kept for non-modal actions)
  // ================================================

  const handleStartOrder = async () => {
    try {
      setIsLoading('start');
      const updatedOrder = await orderApi.startOrder(order.id);
      toast.success('İş başlatıldı!', {
        description: 'Başarılar dileriz.',
      });
      onActionComplete?.(updatedOrder as unknown as Order);
    } catch (error) {
      toast.error('Hata', {
        description:
          error instanceof Error ? error.message : 'İş başlatılamadı.',
      });
    } finally {
      setIsLoading(null);
    }
  };

  // Complete order handler (for future use)
  const _handleCompleteOrder = async () => {
    try {
      setIsLoading('complete');
      const updatedOrder = await orderApi.completeOrder(order.id);
      toast.success('Sipariş tamamlandı!', {
        description: 'Ödeme serbest bırakıldı.',
      });
      onActionComplete?.(updatedOrder as unknown as Order);
    } catch (error) {
      toast.error('Hata', {
        description:
          error instanceof Error ? error.message : 'Sipariş tamamlanamadı.',
      });
    } finally {
      setIsLoading(null);
    }
  };

  // ================================================
  // ACTION BUTTON CONFIGURATION
  // ================================================

  const getAvailableActions = (): ActionButton[] => {
    const actions: ActionButton[] = [];

    // Seller Actions
    if (userRole === 'seller') {
      // Accept Order (PAID -> IN_PROGRESS)
      if (order.status === 'PAID' && order.canCancel !== false) {
        actions.push({
          label: 'Siparişi Kabul Et',
          icon: <CheckCircle className="h-4 w-4" />,
          onClick: () => setShowAcceptModal(true),
          variant: 'primary',
        });
      }

      // Start Working (IN_PROGRESS)
      if (order.status === 'IN_PROGRESS' && !orderData.delivery?.submittedAt) {
        actions.push({
          label: 'İşe Başla',
          icon: <PlayCircle className="h-4 w-4" />,
          onClick: handleStartOrder,
          variant: 'primary',
          loading: isLoading === 'start',
        });
      }

      // Submit Delivery
      if (canSubmitDelivery(orderData)) {
        actions.push({
          label: 'Teslim Et',
          icon: <Package className="h-4 w-4" />,
          onClick: () => setShowDeliveryModal(true),
          variant: 'primary',
        });
      }
    }

    // Buyer Actions
    if (userRole === 'buyer') {
      // Approve Delivery
      if (canApproveDelivery(orderData)) {
        actions.push({
          label: 'Teslimatı Onayla',
          icon: <CheckCircle className="h-4 w-4" />,
          onClick: () => setShowApproveModal(true),
          variant: 'primary',
        });
      }

      // Request Revision
      if (canRequestRevision(orderData) && order.status === 'DELIVERED') {
        const revisionsLeft = orderData.revisions?.revisionsRemaining ?? 0;
        actions.push({
          label: `Revizyon İste (${revisionsLeft} kaldı)`,
          icon: <RefreshCw className="h-4 w-4" />,
          onClick: () => setShowRevisionModal(true),
          variant: 'outline',
          disabled: revisionsLeft === 0,
        });
      }
    }

    // Common Actions
    // Message Seller/Buyer
    actions.push({
      label: userRole === 'buyer' ? 'Satıcıya Mesaj' : 'Alıcıya Mesaj',
      icon: <MessageCircle className="h-4 w-4" />,
      onClick: () => {
        const recipientId =
          userRole === 'buyer' ? order.sellerId : order.buyerId;
        window.location.href = `/messages?user=${recipientId}`;
      },
      variant: 'outline',
    });

    // Cancel Order
    if (order.canCancel) {
      actions.push({
        label: 'İptal Et',
        icon: <XCircle className="h-4 w-4" />,
        onClick: () => setShowCancelModal(true),
        variant: 'destructive',
      });
    }

    // Dispute
    if (
      ['IN_PROGRESS', 'IN_REVIEW', 'DELIVERED', 'COMPLETED'].includes(
        order.status
      ) &&
      order.status !== 'DISPUTED' &&
      order.status !== 'CANCELED' &&
      order.status !== 'REFUNDED'
    ) {
      actions.push({
        label: 'İhtilaf Aç',
        icon: <AlertTriangle className="h-4 w-4" />,
        onClick: () => setShowDisputeModal(true),
        variant: 'outline',
      });
    }

    return actions;
  };

  const actions = getAvailableActions();

  if (actions.length === 0) {
    return null;
  }

  // ================================================
  // RENDER - Mobile optimized
  // ================================================

  return (
    <>
      <div
        className={cn(
          'flex flex-col flex-wrap gap-2 sm:flex-row sm:gap-3',
          className
        )}
      >
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant}
            onClick={action.onClick}
            disabled={action.disabled || action.loading || !!isLoading}
            className="flex w-full items-center justify-center gap-2 text-sm sm:w-auto"
            size="sm"
          >
            {action.loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              action.icon
            )}
            <span className="truncate">{action.label}</span>
          </Button>
        ))}
      </div>

      {/* Modals - Using normalized order data */}
      {showAcceptModal && (
        <AcceptOrderModal
          isOpen={showAcceptModal}
          onClose={() => setShowAcceptModal(false)}
          order={order as any}
          onSuccess={() => {
            setShowAcceptModal(false);
            if (onActionComplete) {
              onActionComplete(order);
            }
          }}
        />
      )}

      {showDeliveryModal && (
        <DeliverySubmissionModal
          isOpen={showDeliveryModal}
          onClose={() => setShowDeliveryModal(false)}
          order={order as any}
          onSuccess={() => {
            setShowDeliveryModal(false);
            if (onActionComplete) {
              onActionComplete(order);
            }
          }}
        />
      )}

      {showApproveModal && (
        <ApproveDeliveryModal
          isOpen={showApproveModal}
          onClose={() => setShowApproveModal(false)}
          orderId={order.id}
          order={order as any}
          deliveryNote={getDeliveryInfo(orderData).notes}
          attachments={getDeliveryInfo(orderData).files}
          onSuccess={() => {
            setShowApproveModal(false);
            if (onActionComplete) {
              onActionComplete(order);
            }
          }}
        />
      )}

      {showRevisionModal && (
        <RequestRevisionModal
          isOpen={showRevisionModal}
          onClose={() => setShowRevisionModal(false)}
          orderId={order.id}
          order={order as any}
          deliveryNote={getDeliveryInfo(orderData).notes}
          onSuccess={() => {
            setShowRevisionModal(false);
            if (onActionComplete) {
              onActionComplete(order);
            }
          }}
        />
      )}

      {showCancelModal && (
        <CancelOrderModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          order={order as any}
          userRole={userRole}
          onSuccess={() => {
            setShowCancelModal(false);
            if (onActionComplete) {
              onActionComplete(order);
            }
          }}
        />
      )}

      {showDisputeModal && (
        <DisputeModal
          isOpen={showDisputeModal}
          onClose={() => setShowDisputeModal(false)}
          orderId={order.id}
          orderNumber={order.orderNumber}
          onSuccess={() => {
            setShowDisputeModal(false);
            // Refresh order data
            if (onActionComplete) {
              const optimisticOrder: typeof order = {
                ...order,
                status: 'DISPUTED',
              };
              onActionComplete(optimisticOrder);
            }
            toast.success('İtiraz başarıyla oluşturuldu', {
              description:
                'Müşteri destek ekibimiz en kısa sürede inceleyecektir.',
            });
          }}
        />
      )}
    </>
  );
}

export default OrderActions;
