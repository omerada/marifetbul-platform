/**
 * ================================================
 * USE MILESTONES HOOK
 * ================================================
 * React hook for milestone management
 * Provides clean API for milestone operations with SWR caching
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 1 - Milestone Payment System
 */

import useSWR, { mutate } from 'swr';
import { useState } from 'react';
import { toast } from 'sonner';
import { milestoneApi } from '@/lib/api/milestones';
import type {
  OrderMilestone,
  CreateOrderMilestoneRequest,
  UpdateOrderMilestoneRequest,
  DeliverMilestoneRequest,
} from '@/types/business/features/milestone';

// ==================== HOOK: useOrderMilestones ====================

/**
 * Fetch and manage milestones for an order
 */
export function useOrderMilestones(orderId?: string) {
  const {
    data: milestones,
    error,
    isLoading,
    mutate: refetch,
  } = useSWR<OrderMilestone[]>(
    orderId ? `/api/v1/orders/${orderId}/milestones` : null,
    orderId ? () => milestoneApi.getOrderMilestones(orderId) : null
  );

  return {
    milestones: milestones || [],
    isLoading,
    error,
    refetch,
  };
}

// ==================== HOOK: useMilestone ====================

/**
 * Fetch single milestone by ID
 */
export function useMilestone(milestoneId?: string) {
  const {
    data: milestone,
    error,
    isLoading,
    mutate: refetch,
  } = useSWR<OrderMilestone>(
    milestoneId ? `/api/v1/milestones/${milestoneId}` : null,
    milestoneId ? () => milestoneApi.getMilestone(milestoneId) : null
  );

  return {
    milestone,
    isLoading,
    error,
    refetch,
  };
}

// ==================== HOOK: useMilestoneActions ====================

/**
 * Milestone CRUD and workflow actions
 */
export function useMilestoneActions() {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isDelivering, setIsDelivering] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  // ========== CREATE ==========

  const createMilestone = async (
    orderId: string,
    data: CreateOrderMilestoneRequest
  ) => {
    setIsCreating(true);
    try {
      const milestone = await milestoneApi.createMilestone(orderId, data);
      await mutate(`/api/v1/orders/${orderId}/milestones`);
      toast.success('Milestone oluşturuldu');
      return milestone;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Milestone oluşturulamadı';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const createMilestonesBatch = async (
    orderId: string,
    milestones: CreateOrderMilestoneRequest[]
  ) => {
    setIsCreating(true);
    try {
      const created = await milestoneApi.createMilestonesBatch(
        orderId,
        milestones
      );
      await mutate(`/api/v1/orders/${orderId}/milestones`);
      toast.success(`${created.length} milestone oluşturuldu`);
      return created;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Milestone'lar oluşturulamadı";
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  // ========== UPDATE ==========

  const updateMilestone = async (
    milestoneId: string,
    data: UpdateOrderMilestoneRequest
  ) => {
    setIsUpdating(true);
    try {
      const updated = await milestoneApi.updateMilestone(milestoneId, data);
      await mutate(`/api/v1/milestones/${milestoneId}`);
      await mutate(`/api/v1/orders/${updated.orderId}/milestones`);
      toast.success('Milestone güncellendi');
      return updated;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Milestone güncellenemedi';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  // ========== DELETE ==========

  const deleteMilestone = async (milestoneId: string, orderId: string) => {
    setIsDeleting(true);
    try {
      await milestoneApi.deleteMilestone(milestoneId);
      await mutate(`/api/v1/orders/${orderId}/milestones`);
      toast.success('Milestone silindi');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Milestone silinemedi';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  // ========== START WORK ==========

  const startMilestone = async (milestoneId: string) => {
    setIsStarting(true);
    try {
      const milestone = await milestoneApi.startMilestone(milestoneId);
      await mutate(`/api/v1/milestones/${milestoneId}`);
      await mutate(`/api/v1/orders/${milestone.orderId}/milestones`);
      toast.success('Milestone başlatıldı');
      return milestone;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Milestone başlatılamadı';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsStarting(false);
    }
  };

  // ========== DELIVER ==========

  const deliverMilestone = async (
    milestoneId: string,
    data: DeliverMilestoneRequest
  ) => {
    setIsDelivering(true);
    try {
      const milestone = await milestoneApi.deliverMilestone(milestoneId, data);
      await mutate(`/api/v1/milestones/${milestoneId}`);
      await mutate(`/api/v1/orders/${milestone.orderId}/milestones`);
      toast.success('Milestone teslim edildi');
      return milestone;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Milestone teslim edilemedi';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsDelivering(false);
    }
  };

  // ========== ACCEPT ==========

  const acceptMilestone = async (milestoneId: string) => {
    setIsAccepting(true);
    try {
      const milestone = await milestoneApi.acceptMilestone(milestoneId);
      await mutate(`/api/v1/milestones/${milestoneId}`);
      await mutate(`/api/v1/orders/${milestone.orderId}/milestones`);
      toast.success('Milestone onaylandı, ödeme serbest bırakıldı');
      return milestone;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Milestone onaylanamadı';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsAccepting(false);
    }
  };

  // ========== REJECT ==========

  const rejectMilestone = async (milestoneId: string, reason: string) => {
    setIsRejecting(true);
    try {
      const milestone = await milestoneApi.rejectMilestone(milestoneId, reason);
      await mutate(`/api/v1/milestones/${milestoneId}`);
      await mutate(`/api/v1/orders/${milestone.orderId}/milestones`);
      toast.success('Milestone reddedildi, revizyon istendi');
      return milestone;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Milestone reddedilemedi';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsRejecting(false);
    }
  };

  // ========== CANCEL ==========

  const cancelMilestone = async (milestoneId: string, reason: string) => {
    setIsCanceling(true);
    try {
      const milestone = await milestoneApi.cancelMilestone(milestoneId, reason);
      await mutate(`/api/v1/milestones/${milestoneId}`);
      await mutate(`/api/v1/orders/${milestone.orderId}/milestones`);
      toast.success('Milestone iptal edildi');
      return milestone;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Milestone iptal edilemedi';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsCanceling(false);
    }
  };

  return {
    // Actions
    createMilestone,
    createMilestonesBatch,
    updateMilestone,
    deleteMilestone,
    startMilestone,
    deliverMilestone,
    acceptMilestone,
    rejectMilestone,
    cancelMilestone,

    // Loading states
    isCreating,
    isUpdating,
    isDeleting,
    isStarting,
    isDelivering,
    isAccepting,
    isRejecting,
    isCanceling,

    // Helper: Any action in progress
    isLoading:
      isCreating ||
      isUpdating ||
      isDeleting ||
      isStarting ||
      isDelivering ||
      isAccepting ||
      isRejecting ||
      isCanceling,
  };
}

// ==================== EXPORT ALL ====================

const milestoneHooks = {
  useOrderMilestones,
  useMilestone,
  useMilestoneActions,
};

export default milestoneHooks;
