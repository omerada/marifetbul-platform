'use client';

/**
 * ================================================
 * USE MILESTONE WORKFLOW HOOK
 * ================================================
 * State machine-based milestone workflow management
 *
 * Sprint 2 - Task 2.4: Milestone Enhancement
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 25, 2025
 *
 * Features:
 * ✅ Milestone lifecycle management (PENDING → IN_PROGRESS → DELIVERED → ACCEPTED)
 * ✅ Validation for status transitions
 * ✅ Payment release tracking
 * ✅ Bulk operations (create/update multiple)
 * ✅ Progress calculation
 * ✅ Overdue detection
 * ✅ Error handling with rollback
 * ✅ Optimistic updates
 */

import { useState, useCallback, useMemo } from 'react';
import useSWR from 'swr';
import {
  milestoneApiEnhanced,
  MILESTONE_CACHE_KEYS,
  MilestoneApiError,
} from '@/lib/api/milestones-enhanced';
import useToast from '@/hooks/core/useToast';
import logger from '@/lib/infrastructure/monitoring/logger';
import type {
  OrderMilestone,
  MilestoneStatus,
  CreateOrderMilestoneRequest,
  UpdateOrderMilestoneRequest,
  DeliverMilestoneRequest,
} from '@/types/business/features/milestone';
import { MilestoneStatus as MS } from '@/types/business/features/milestone';

// ================================================
// TYPES
// ================================================

export interface MilestoneWorkflowOptions {
  /** Order ID */
  orderId: string;
  /** User role */
  userRole?: 'buyer' | 'seller';
  /** Auto-refresh interval (ms) */
  refreshInterval?: number;
  /** Enable optimistic updates */
  optimistic?: boolean;
}

export interface MilestoneWorkflowState {
  /** All milestones for the order */
  milestones: OrderMilestone[];
  /** Is loading milestones */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Is any operation in progress */
  isOperating: boolean;
  /** Progress percentage (0-100) */
  progress: number;
  /** Completed milestones count */
  completedCount: number;
  /** Total milestones count */
  totalCount: number;
  /** Overdue milestones */
  overdueMilestones: OrderMilestone[];
  /** Can create new milestone */
  canCreateMilestone: boolean;
}

export interface MilestoneWorkflowActions {
  /** Create a new milestone */
  createMilestone: (
    data: CreateOrderMilestoneRequest
  ) => Promise<OrderMilestone>;
  /** Create multiple milestones */
  createBulk: (
    milestones: CreateOrderMilestoneRequest[]
  ) => Promise<OrderMilestone[]>;
  /** Update milestone */
  updateMilestone: (
    milestoneId: string,
    data: UpdateOrderMilestoneRequest
  ) => Promise<OrderMilestone>;
  /** Delete milestone */
  deleteMilestone: (milestoneId: string) => Promise<void>;
  /** Start working on milestone */
  startMilestone: (milestoneId: string) => Promise<OrderMilestone>;
  /** Deliver milestone */
  deliverMilestone: (
    milestoneId: string,
    data: DeliverMilestoneRequest
  ) => Promise<OrderMilestone>;
  /** Accept milestone (release payment) */
  acceptMilestone: (milestoneId: string) => Promise<OrderMilestone>;
  /** Reject milestone */
  rejectMilestone: (
    milestoneId: string,
    reason: string
  ) => Promise<OrderMilestone>;
  /** Cancel milestone */
  cancelMilestone: (
    milestoneId: string,
    reason: string
  ) => Promise<OrderMilestone>;
  /** Refresh milestones */
  refresh: () => Promise<void>;
  /** Validate transition */
  canTransition: (milestoneId: string, toStatus: MilestoneStatus) => boolean;
}

export interface UseMilestoneWorkflowReturn {
  state: MilestoneWorkflowState;
  actions: MilestoneWorkflowActions;
}

// ================================================
// HELPER FUNCTIONS
// ================================================

const VALID_TRANSITIONS: Record<MilestoneStatus, MilestoneStatus[]> = {
  [MS.PENDING]: [MS.IN_PROGRESS, MS.CANCELED],
  [MS.IN_PROGRESS]: [MS.DELIVERED, MS.CANCELED],
  [MS.DELIVERED]: [MS.ACCEPTED, MS.REVISION_REQUESTED],
  [MS.ACCEPTED]: [], // Terminal state
  [MS.REVISION_REQUESTED]: [MS.IN_PROGRESS, MS.CANCELED],
  [MS.CANCELED]: [], // Terminal state
};

const canTransitionToStatus = (
  current: MilestoneStatus,
  target: MilestoneStatus
): boolean => {
  return VALID_TRANSITIONS[current]?.includes(target) ?? false;
};

const calculateProgress = (milestones: OrderMilestone[]): number => {
  if (milestones.length === 0) return 0;

  const completedCount = milestones.filter(
    (m) => m.status === 'ACCEPTED'
  ).length;

  return Math.round((completedCount / milestones.length) * 100);
};

const getOverdueMilestones = (
  milestones: OrderMilestone[]
): OrderMilestone[] => {
  const now = new Date();
  return milestones.filter((m) => {
    if (m.status === 'ACCEPTED' || m.status === 'CANCELED') return false;
    if (!m.dueDate) return false;
    return new Date(m.dueDate) < now;
  });
};

// ================================================
// HOOK
// ================================================

export function useMilestoneWorkflow({
  orderId,
  userRole = 'buyer',
  refreshInterval = 0,
  optimistic = true,
}: MilestoneWorkflowOptions): UseMilestoneWorkflowReturn {
  const toast = useToast();
  const [isOperating, setIsOperating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==================== DATA FETCHING ====================

  const cacheKey = MILESTONE_CACHE_KEYS.orderMilestones(orderId);

  const {
    data: milestones = [],
    isLoading,
    mutate: refetch,
  } = useSWR<OrderMilestone[]>(
    cacheKey,
    () => milestoneApiEnhanced.getOrderMilestones(orderId),
    {
      refreshInterval,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    }
  );

  // ==================== COMPUTED STATE ====================

  const state: MilestoneWorkflowState = useMemo(() => {
    const progress = calculateProgress(milestones);
    const completedCount = milestones.filter(
      (m) => m.status === 'ACCEPTED'
    ).length;
    const overdueMilestones = getOverdueMilestones(milestones);
    const canCreateMilestone = userRole === 'seller';

    return {
      milestones,
      isLoading,
      error,
      isOperating,
      progress,
      completedCount,
      totalCount: milestones.length,
      overdueMilestones,
      canCreateMilestone,
    };
  }, [milestones, isLoading, error, isOperating, userRole]);

  // ==================== ACTIONS ====================

  const handleOperation = useCallback(
    async <T>(
      operation: () => Promise<T>,
      successMessage: string,
      optimisticUpdate?: () => void
    ): Promise<T> => {
      setIsOperating(true);
      setError(null);

      // Optimistic update
      if (optimistic && optimisticUpdate) {
        optimisticUpdate();
      }

      try {
        const result = await operation();
        await refetch();
        toast.success(successMessage);
        return result;
      } catch (err) {
        const error = err as MilestoneApiError | Error;
        const errorMessage =
          error instanceof MilestoneApiError
            ? error.message
            : 'İşlem başarısız oldu.';

        setError(errorMessage);
        toast.error('İşlem Başarısız', errorMessage);

        logger.error('[useMilestoneWorkflow] Operation failed', error instanceof Error ? error : new Error(String(error)));

        // Rollback optimistic update
        if (optimistic && optimisticUpdate) {
          await refetch();
        }

        throw error;
      } finally {
        setIsOperating(false);
      }
    },
    [optimistic, refetch, toast]
  );

  // ==================== CREATE ====================

  const createMilestone = useCallback(
    async (data: CreateOrderMilestoneRequest): Promise<OrderMilestone> => {
      return handleOperation(
        () => milestoneApiEnhanced.createMilestone(orderId, data),
        'Milestone oluşturuldu.'
      );
    },
    [orderId, handleOperation]
  );

  const createBulk = useCallback(
    async (data: CreateOrderMilestoneRequest[]): Promise<OrderMilestone[]> => {
      return handleOperation(
        () => milestoneApiEnhanced.createMilestonesBatch(orderId, data),
        `${data.length} milestone oluşturuldu.`
      );
    },
    [orderId, handleOperation]
  );

  // ==================== UPDATE ====================

  const updateMilestone = useCallback(
    async (
      milestoneId: string,
      data: UpdateOrderMilestoneRequest
    ): Promise<OrderMilestone> => {
      return handleOperation(
        () => milestoneApiEnhanced.updateMilestone(milestoneId, data),
        'Milestone güncellendi.'
      );
    },
    [handleOperation]
  );

  // ==================== DELETE ====================

  const deleteMilestone = useCallback(
    async (milestoneId: string): Promise<void> => {
      return handleOperation(
        () => milestoneApiEnhanced.deleteMilestone(milestoneId),
        'Milestone silindi.'
      );
    },
    [handleOperation]
  );

  // ==================== WORKFLOW TRANSITIONS ====================

  const startMilestone = useCallback(
    async (milestoneId: string): Promise<OrderMilestone> => {
      const milestone = milestones.find((m) => m.id === milestoneId);
      if (!milestone) {
        throw new Error('Milestone bulunamadı.');
      }

      if (!canTransitionToStatus(milestone.status, MS.IN_PROGRESS)) {
        throw new Error('Bu milestone başlatılamaz.');
      }

      return handleOperation(
        () => milestoneApiEnhanced.startMilestone(milestoneId),
        'Milestone çalışması başlatıldı.'
      );
    },
    [milestones, handleOperation]
  );

  const deliverMilestone = useCallback(
    async (
      milestoneId: string,
      data: DeliverMilestoneRequest
    ): Promise<OrderMilestone> => {
      const milestone = milestones.find((m) => m.id === milestoneId);
      if (!milestone) {
        throw new Error('Milestone bulunamadı.');
      }

      if (!canTransitionToStatus(milestone.status, MS.DELIVERED)) {
        throw new Error('Bu milestone teslim edilemez.');
      }

      return handleOperation(
        () => milestoneApiEnhanced.deliverMilestone(milestoneId, data),
        'Milestone teslim edildi.'
      );
    },
    [milestones, handleOperation]
  );

  const acceptMilestone = useCallback(
    async (milestoneId: string): Promise<OrderMilestone> => {
      const milestone = milestones.find((m) => m.id === milestoneId);
      if (!milestone) {
        throw new Error('Milestone bulunamadı.');
      }

      if (!canTransitionToStatus(milestone.status, MS.ACCEPTED)) {
        throw new Error('Bu milestone kabul edilemez.');
      }

      return handleOperation(
        () => milestoneApiEnhanced.acceptMilestone(milestoneId),
        'Milestone kabul edildi. Ödeme serbest bırakıldı.'
      );
    },
    [milestones, handleOperation]
  );

  const rejectMilestone = useCallback(
    async (milestoneId: string, reason: string): Promise<OrderMilestone> => {
      const milestone = milestones.find((m) => m.id === milestoneId);
      if (!milestone) {
        throw new Error('Milestone bulunamadı.');
      }

      if (!canTransitionToStatus(milestone.status, MS.REVISION_REQUESTED)) {
        throw new Error('Bu milestone için revizyon istenemez.');
      }

      return handleOperation(
        () => milestoneApiEnhanced.rejectMilestone(milestoneId, reason),
        'Milestone reddedildi. Revizyon talep edildi.'
      );
    },
    [milestones, handleOperation]
  );

  const cancelMilestone = useCallback(
    async (milestoneId: string, reason: string): Promise<OrderMilestone> => {
      const milestone = milestones.find((m) => m.id === milestoneId);
      if (!milestone) {
        throw new Error('Milestone bulunamadı.');
      }

      if (!canTransitionToStatus(milestone.status, MS.CANCELED)) {
        throw new Error('Bu milestone iptal edilemez.');
      }

      return handleOperation(
        () => milestoneApiEnhanced.cancelMilestone(milestoneId, reason),
        'Milestone iptal edildi.'
      );
    },
    [milestones, handleOperation]
  );

  // ==================== VALIDATION ====================

  const canTransition = useCallback(
    (milestoneId: string, toStatus: MilestoneStatus): boolean => {
      const milestone = milestones.find((m) => m.id === milestoneId);
      if (!milestone) return false;
      return canTransitionToStatus(milestone.status, toStatus);
    },
    [milestones]
  );

  // ==================== REFRESH ====================

  const refresh = useCallback(async () => {
    setError(null);
    await refetch();
  }, [refetch]);

  // ==================== RETURN ====================

  const actions: MilestoneWorkflowActions = useMemo(
    () => ({
      createMilestone,
      createBulk,
      updateMilestone,
      deleteMilestone,
      startMilestone,
      deliverMilestone,
      acceptMilestone,
      rejectMilestone,
      cancelMilestone,
      refresh,
      canTransition,
    }),
    [
      createMilestone,
      createBulk,
      updateMilestone,
      deleteMilestone,
      startMilestone,
      deliverMilestone,
      acceptMilestone,
      rejectMilestone,
      cancelMilestone,
      refresh,
      canTransition,
    ]
  );

  return { state, actions };
}

export default useMilestoneWorkflow;
