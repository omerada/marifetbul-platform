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
import type { Order } from '@/lib/api/validators/order';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
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
      onActionComplete?.(updatedOrder);
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
      onActionComplete?.(updatedOrder);
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
      if (order.status === 'IN_PROGRESS' && !order.delivery?.submittedAt) {
        actions.push({
          label: 'İşe Başla',
          icon: <PlayCircle className="h-4 w-4" />,
          onClick: handleStartOrder,
          variant: 'primary',
          loading: isLoading === 'start',
        });
      }

      // Submit Delivery
      if (order.canSubmitDelivery) {
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
      if (order.canApproveDelivery) {
        actions.push({
          label: 'Teslimatı Onayla',
          icon: <CheckCircle className="h-4 w-4" />,
          onClick: () => setShowApproveModal(true),
          variant: 'primary',
        });
      }

      // Request Revision
      if (order.canRequestRevision && order.status === 'DELIVERED') {
        const revisionsLeft = order.revisions?.revisionsRemaining ?? 0;
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
  // RENDER
  // ================================================

  return (
    <>
      <div className={cn('flex flex-wrap gap-3', className)}>
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant}
            onClick={action.onClick}
            disabled={action.disabled || action.loading || !!isLoading}
            className="flex items-center gap-2"
          >
            {action.loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              action.icon
            )}
            {action.label}
          </Button>
        ))}
      </div>

      {/* Modals */}
      {showAcceptModal && (
        <AcceptOrderModal
          isOpen={showAcceptModal}
          onClose={() => setShowAcceptModal(false)}
          order={order}
          onSuccess={(updatedOrder) => {
            onActionComplete?.(updatedOrder);
            setShowAcceptModal(false);
          }}
        />
      )}

      {showDeliveryModal && (
        <DeliverySubmissionModal
          isOpen={showDeliveryModal}
          onClose={() => setShowDeliveryModal(false)}
          order={order}
          onSuccess={(updatedOrder) => {
            onActionComplete?.(updatedOrder);
            setShowDeliveryModal(false);
          }}
        />
      )}

      {showApproveModal && (
        <ApproveDeliveryModal
          isOpen={showApproveModal}
          onClose={() => setShowApproveModal(false)}
          order={order}
          onSuccess={(updatedOrder) => {
            onActionComplete?.(updatedOrder);
            setShowApproveModal(false);
          }}
        />
      )}

      {showRevisionModal && (
        <RequestRevisionModal
          isOpen={showRevisionModal}
          onClose={() => setShowRevisionModal(false)}
          order={order}
          onSuccess={(updatedOrder) => {
            onActionComplete?.(updatedOrder);
            setShowRevisionModal(false);
          }}
        />
      )}

      {showCancelModal && (
        <CancelOrderModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          order={order}
          userRole={userRole}
          onSuccess={(updatedOrder) => {
            onActionComplete?.(updatedOrder);
            setShowCancelModal(false);
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

            // Optimistic update - immediately update UI
            if (onActionComplete) {
              const optimisticOrder = {
                ...order,
                status: 'DISPUTED',
              };
              onActionComplete(optimisticOrder as typeof order);
            }

            toast.success('İhtilaf başarıyla oluşturuldu', {
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
