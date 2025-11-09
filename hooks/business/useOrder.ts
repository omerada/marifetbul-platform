'use client';

/**
 * Custom hook for order operations
 * Handles order lifecycle: accept, start, deliver, approve, revision
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/lib/core/store/domains/ui/uiStore';
import { ORDER_ENDPOINTS } from '@/lib/api/endpoints';
import logger from '@/lib/infrastructure/monitoring/logger';

interface DeliverOrderParams {
  deliveryNote: string;
  attachments: string[];
}

interface RevisionParams {
  revisionNote: string;
}

interface DisputeParams {
  reason: string;
  description: string;
}

interface UseOrderOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useOrder(options: UseOrderOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { addToast } = useUIStore();

  /**
   * Accept order (PAID → IN_PROGRESS)
   */
  const acceptOrder = useCallback(
    async (orderId: string) => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/v1${ORDER_ENDPOINTS.START(orderId)}`,
          {
            method: 'PUT',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Sipariş kabul edilemedi');
        }

        addToast({
          type: 'success',
          title: 'Sipariş başarıyla kabul edildi!',
          duration: 3000,
        });

        options.onSuccess?.();

        logger.info('Order accepted successfully', { orderId });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';

        addToast({
          type: 'error',
          title: errorMessage,
          duration: 5000,
        });

        options.onError?.(
          error instanceof Error ? error : new Error(errorMessage)
        );
        logger.error(
          'Error accepting order',
          error instanceof Error ? error : new Error(errorMessage)
        );
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [addToast, options]
  );

  /**
   * Deliver order (IN_PROGRESS → DELIVERED)
   */
  const deliverOrder = useCallback(
    async (orderId: string, params: DeliverOrderParams) => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/v1${ORDER_ENDPOINTS.DELIVER(orderId)}`,
          {
            method: 'PUT',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              deliveryNote: params.deliveryNote,
              attachments: params.attachments,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Teslimat gönderilemedi');
        }

        addToast({
          type: 'success',
          title: 'Teslimat başarıyla gönderildi! Müşteri onayını bekliyor.',
          duration: 4000,
        });

        options.onSuccess?.();

        // Redirect to order detail page after 1.5 seconds
        setTimeout(() => {
          router.push(`/dashboard/freelancer/orders/${orderId}`);
        }, 1500);

        logger.info('Order delivered successfully', { orderId, params });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';

        addToast({
          type: 'error',
          title: errorMessage,
          duration: 5000,
        });

        options.onError?.(
          error instanceof Error ? error : new Error(errorMessage)
        );
        logger.error(
          'Error delivering order',
          error instanceof Error ? error : new Error(errorMessage)
        );
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [addToast, router, options]
  );

  /**
   * Approve delivery (DELIVERED → COMPLETED) - Employer only
   */
  const approveDelivery = useCallback(
    async (orderId: string) => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/v1${ORDER_ENDPOINTS.ACCEPT_DELIVERY(orderId)}`,
          {
            method: 'PUT',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Teslimat onaylanamadı');
        }

        addToast({
          type: 'success',
          title: "Teslimat onaylandı! Ödeme freelancer'a aktarıldı.",
          duration: 4000,
        });

        options.onSuccess?.();

        logger.info('Delivery approved successfully', { orderId });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';

        addToast({
          type: 'error',
          title: errorMessage,
          duration: 5000,
        });

        options.onError?.(
          error instanceof Error ? error : new Error(errorMessage)
        );
        logger.error(
          'Error approving delivery',
          error instanceof Error ? error : new Error(errorMessage)
        );
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [addToast, options]
  );

  /**
   * Request revision (DELIVERED → IN_PROGRESS) - Employer only
   */
  const requestRevision = useCallback(
    async (orderId: string, params: RevisionParams) => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/v1${ORDER_ENDPOINTS.REQUEST_REVISION(orderId)}`,
          {
            method: 'PUT',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              revisionNote: params.revisionNote,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Revizyon talebi gönderilemedi');
        }

        addToast({
          type: 'success',
          title: 'Revizyon talebi gönderildi. Freelancer üzerinde çalışacak.',
          duration: 4000,
        });

        options.onSuccess?.();

        logger.info('Revision requested successfully', { orderId, params });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';

        addToast({
          type: 'error',
          title: errorMessage,
          duration: 5000,
        });

        options.onError?.(
          error instanceof Error ? error : new Error(errorMessage)
        );
        logger.error(
          'Error requesting revision',
          error instanceof Error ? error : new Error(errorMessage)
        );
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [addToast, options]
  );

  /**
   * Cancel order
   */
  const cancelOrder = useCallback(
    async (orderId: string, reason: string, note?: string) => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/v1${ORDER_ENDPOINTS.CANCEL(orderId)}`,
          {
            method: 'PUT',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              reason,
              note,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Sipariş iptal edilemedi');
        }

        addToast({
          type: 'success',
          title: 'Sipariş başarıyla iptal edildi.',
          duration: 3000,
        });

        options.onSuccess?.();

        logger.info('Order cancelled successfully', { orderId, reason });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';

        addToast({
          type: 'error',
          title: errorMessage,
          duration: 5000,
        });

        options.onError?.(
          error instanceof Error ? error : new Error(errorMessage)
        );
        logger.error(
          'Error cancelling order',
          error instanceof Error ? error : new Error(errorMessage)
        );
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [addToast, options]
  );

  /**
   * Open dispute for an order
   */
  const openDispute = useCallback(
    async (orderId: string, params: DisputeParams) => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/v1/orders/${orderId}/dispute`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Anlaşmazlık açılamadı');
        }

        addToast({
          type: 'success',
          title: 'Anlaşmazlık Açıldı',
          description: 'Destek ekibimiz en kısa sürede inceleyecektir.',
          duration: 5000,
        });

        options.onSuccess?.();

        logger.info('Dispute opened successfully', { orderId, reasonparamsreason,  });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';

        addToast({
          type: 'error',
          title: errorMessage,
          duration: 5000,
        });

        options.onError?.(
          error instanceof Error ? error : new Error(errorMessage)
        );
        logger.error(
          'Error opening dispute',
          error instanceof Error ? error : new Error(errorMessage)
        );
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [addToast, options]
  );

  return {
    acceptOrder,
    deliverOrder,
    approveDelivery,
    requestRevision,
    cancelOrder,
    openDispute,
    isLoading,
  };
}
