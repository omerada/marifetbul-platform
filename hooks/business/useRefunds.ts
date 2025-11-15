'use client';

/**
 * ================================================
 * USE REFUNDS HOOK
 * ================================================
 * React hook for refund management
 * Provides clean API for refund operations with SWR caching
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 2 - User Refund Flow
 */

import useSWR, { mutate } from 'swr';
import { useState } from 'react';
import { toast } from 'sonner';
import { refundApi } from '@/lib/api/refunds';
import type {
  RefundDto,
  CreateRefundRequest,
} from '@/types/business/features/refund';

// ==================== HOOK: useMyRefunds ====================

/**
 * Fetch all refunds for current user
 */
export function useMyRefunds() {
  const {
    data: refunds,
    error,
    isLoading,
    mutate: refetch,
  } = useSWR<RefundDto[]>('/api/v1/refunds/my-refunds', () =>
    refundApi.getMyRefunds()
  );

  return {
    refunds: refunds || [],
    isLoading,
    error,
    refetch,
  };
}

// ==================== HOOK: useRefund ====================

/**
 * Fetch single refund by ID
 */
export function useRefund(refundId?: string) {
  const {
    data: refund,
    error,
    isLoading,
    mutate: refetch,
  } = useSWR<RefundDto>(
    refundId ? `/api/v1/refunds/${refundId}` : null,
    refundId ? () => refundApi.getRefundById(refundId) : null
  );

  return {
    refund,
    isLoading,
    error,
    refetch,
  };
}

// ==================== HOOK: useOrderRefund ====================

/**
 * Fetch refund for specific order
 */
export function useOrderRefund(orderId?: string) {
  const {
    data: refund,
    error,
    isLoading,
    mutate: refetch,
  } = useSWR<RefundDto | null>(
    orderId ? `/api/v1/refunds/orders/${orderId}` : null,
    orderId ? () => refundApi.getRefundByOrderId(orderId) : null
  );

  return {
    refund,
    hasRefund: refund !== null,
    isLoading,
    error,
    refetch,
  };
}

// ==================== HOOK: useRefundActions ====================

/**
 * Refund CRUD and workflow actions
 */
export function useRefundActions() {
  const [isCreating, setIsCreating] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  // ========== CREATE ==========

  const createRefund = async (request: CreateRefundRequest) => {
    setIsCreating(true);
    try {
      const refund = await refundApi.createRefund(request);

      // Revalidate caches
      await mutate('/api/v1/refunds/my-refunds');
      await mutate(`/api/v1/refunds/orders/${request.orderId}`);

      toast.success('İade talebi oluşturuldu', {
        description: 'Talebiniz incelenmek üzere yöneticilere iletildi.',
      });

      return refund;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'İade talebi oluşturulamadı';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  // ========== CANCEL ==========

  const cancelRefund = async (refundId: string, orderId: string) => {
    setIsCanceling(true);
    try {
      await refundApi.cancelRefund(refundId);

      // Revalidate caches
      await mutate('/api/v1/refunds/my-refunds');
      await mutate(`/api/v1/refunds/orders/${orderId}`);
      await mutate(`/api/v1/refunds/${refundId}`);

      toast.success('İade talebi iptal edildi');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'İade talebi iptal edilemedi';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsCanceling(false);
    }
  };

  return {
    // Actions
    createRefund,
    cancelRefund,

    // Loading states
    isCreating,
    isCanceling,

    // Helper: Any action in progress
    isLoading: isCreating || isCanceling,
  };
}

// ==================== EXPORT ALL ====================

const refundHooks = {
  useMyRefunds,
  useRefund,
  useOrderRefund,
  useRefundActions,
};

export default refundHooks;
