'use client';

/**
 * ================================================
 * USE MILESTONES HOOK
 * ================================================
 * React hook for milestone management
 * Provides clean API for milestone operations with SWR caching
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Story 1.2: Enhanced with better error handling
 * @since Sprint 1 - Milestone Payment System
 * @updated Sprint 1 - Story 1.2 (Enhanced API Client)
 */

import useSWR, { mutate } from 'swr';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  milestoneApiEnhanced,
  MILESTONE_CACHE_KEYS,
  MilestoneApiError,
} from '@/lib/api/milestones-enhanced';
import logger from '@/lib/infrastructure/monitoring/logger';
import type {
  OrderMilestone,
  CreateOrderMilestoneRequest,
  UpdateOrderMilestoneRequest,
  DeliverMilestoneRequest,
} from '@/types/business/features/milestone';

// ==================== HOOK: useOrderMilestones ====================

/**
 * Fetch and manage milestones for an order
 * Story 1.2: Uses enhanced cache keys
 */
export function useOrderMilestones(orderId?: string) {
  const cacheKey = orderId
    ? MILESTONE_CACHE_KEYS.orderMilestones(orderId)
    : null;

  const {
    data: milestones,
    error,
    isLoading,
    mutate: refetch,
  } = useSWR<OrderMilestone[]>(
    cacheKey,
    orderId ? () => milestoneApiEnhanced.getOrderMilestones(orderId) : null,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 2000, // Prevent duplicate requests within 2s
    }
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
 * Story 1.2: Uses enhanced cache keys
 */
export function useMilestone(milestoneId?: string) {
  const cacheKey = milestoneId
    ? MILESTONE_CACHE_KEYS.milestone(milestoneId)
    : null;

  const {
    data: milestone,
    error,
    isLoading,
    mutate: refetch,
  } = useSWR<OrderMilestone>(
    cacheKey,
    milestoneId ? () => milestoneApiEnhanced.getMilestone(milestoneId) : null,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    }
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
 * Story 1.2: Enhanced error handling with MilestoneApiError
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
      const milestone = await milestoneApiEnhanced.createMilestone(
        orderId,
        data
      );
      await mutate(MILESTONE_CACHE_KEYS.orderMilestones(orderId));
      toast.success('Milestone oluşturuldu');
      return milestone;
    } catch (error) {
      const errorMessage =
        error instanceof MilestoneApiError
          ? error.message
          : 'Milestone oluşturulamadı';

      logger.error('[useMilestones] Create failed', error as Error);
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
      const created = await milestoneApiEnhanced.createMilestonesBatch(
        orderId,
        milestones
      );
      await mutate(MILESTONE_CACHE_KEYS.orderMilestones(orderId));
      toast.success(`${created.length} milestone oluşturuldu`);
      return created;
    } catch (error) {
      const errorMessage =
        error instanceof MilestoneApiError
          ? error.message
          : "Milestone'lar oluşturulamadı";
      logger.error('[useMilestones] Batch create failed', error as Error);
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
      const updated = await milestoneApiEnhanced.updateMilestone(
        milestoneId,
        data
      );
      await mutate(MILESTONE_CACHE_KEYS.milestone(milestoneId));
      await mutate(MILESTONE_CACHE_KEYS.orderMilestones(updated.orderId));
      toast.success('Milestone güncellendi');
      return updated;
    } catch (error) {
      const errorMessage =
        error instanceof MilestoneApiError
          ? error.message
          : 'Milestone güncellenemedi';
      logger.error('[useMilestones] Update failed', error as Error);
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
      await milestoneApiEnhanced.deleteMilestone(milestoneId);
      await mutate(MILESTONE_CACHE_KEYS.orderMilestones(orderId));
      toast.success('Milestone silindi');
    } catch (error) {
      const errorMessage =
        error instanceof MilestoneApiError
          ? error.message
          : 'Milestone silinemedi';
      logger.error('[useMilestones] Delete failed', error as Error);
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
      const milestone = await milestoneApiEnhanced.startMilestone(milestoneId);
      await mutate(MILESTONE_CACHE_KEYS.milestone(milestoneId));
      await mutate(MILESTONE_CACHE_KEYS.orderMilestones(milestone.orderId));
      toast.success('Milestone başlatıldı');
      return milestone;
    } catch (error) {
      const errorMessage =
        error instanceof MilestoneApiError
          ? error.message
          : 'Milestone başlatılamadı';
      logger.error('[useMilestones] Start failed', error as Error);
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
      const milestone = await milestoneApiEnhanced.deliverMilestone(
        milestoneId,
        data
      );
      await mutate(MILESTONE_CACHE_KEYS.milestone(milestoneId));
      await mutate(MILESTONE_CACHE_KEYS.orderMilestones(milestone.orderId));
      toast.success('Milestone teslim edildi');
      return milestone;
    } catch (error) {
      const errorMessage =
        error instanceof MilestoneApiError
          ? error.message
          : 'Milestone teslim edilemedi';
      logger.error('[useMilestones] Delivery failed', error as Error);
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
      const milestone = await milestoneApiEnhanced.acceptMilestone(milestoneId);
      await mutate(MILESTONE_CACHE_KEYS.milestone(milestoneId));
      await mutate(MILESTONE_CACHE_KEYS.orderMilestones(milestone.orderId));
      toast.success('Milestone onaylandı, ödeme serbest bırakıldı');
      return milestone;
    } catch (error) {
      const errorMessage =
        error instanceof MilestoneApiError
          ? error.message
          : 'Milestone onaylandı';
      logger.error('[useMilestones] Acceptance failed', error as Error);
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
      const milestone = await milestoneApiEnhanced.rejectMilestone(
        milestoneId,
        reason
      );
      await mutate(MILESTONE_CACHE_KEYS.milestone(milestoneId));
      await mutate(MILESTONE_CACHE_KEYS.orderMilestones(milestone.orderId));
      toast.success('Milestone reddedildi, revizyon istendi');
      return milestone;
    } catch (error) {
      const errorMessage =
        error instanceof MilestoneApiError
          ? error.message
          : 'Milestone reddedilemedi';
      logger.error('[useMilestones] Rejection failed', error as Error);
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
      const milestone = await milestoneApiEnhanced.cancelMilestone(
        milestoneId,
        reason
      );
      await mutate(MILESTONE_CACHE_KEYS.milestone(milestoneId));
      await mutate(MILESTONE_CACHE_KEYS.orderMilestones(milestone.orderId));
      toast.success('Milestone iptal edildi');
      return milestone;
    } catch (error) {
      const errorMessage =
        error instanceof MilestoneApiError
          ? error.message
          : 'Milestone iptal edilemedi';
      logger.error('[useMilestones] Cancellation failed', error as Error);
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
