'use client';

/**
 * ================================================
 * USE MODERATION ACTIONS HOOK
 * ================================================
 * Hook for handling moderation action operations
 *
 * Sprint: Moderator System Completion - Day 2
 * @version 1.0.0
 * @author MarifetBul Development Team
 * @updated November 1, 2025
 */

'use client';

import { useCallback, useState } from 'react';
import { moderationApi } from '@/lib/api/moderation';
import logger from '@/lib/infrastructure/monitoring/logger';
import { toast } from 'sonner';
import { ActionType } from '@/types/business/moderation';

// ============================================================================
// TYPES
// ============================================================================

interface ActionState {
  isProcessing: boolean;
  lastAction: ActionType | null;
  lastActionTime: Date | null;
  actionCount: number;
}

interface UseModerationActionsReturn {
  actionState: ActionState;
  approveComment: (commentId: string) => Promise<void>;
  rejectComment: (commentId: string, reason: string) => Promise<void>;
  markCommentAsSpam: (commentId: string) => Promise<void>;
  approveReview: (reviewId: string) => Promise<void>;
  rejectReview: (reviewId: string, reason: string) => Promise<void>;
  resolveReport: (
    reportId: string,
    action: string,
    notes?: string
  ) => Promise<void>;
  dismissReport: (reportId: string, reason?: string) => Promise<void>;
  issueWarning: (
    userId: string,
    reason: string,
    details: string
  ) => Promise<void>;
  suspendUser: (request: {
    userId: string;
    suspensionType:
      | 'TEMPORARY'
      | 'PERMANENT'
      | 'SELLER_RESTRICTED'
      | 'BUYER_RESTRICTED';
    reason: string;
    details: string;
    durationDays?: number;
  }) => Promise<void>;
  resetActionState: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook for handling moderation actions
 * Provides action handlers with loading states and error handling
 */
export function useModerationActions(): UseModerationActionsReturn {
  const [actionState, setActionState] = useState<ActionState>({
    isProcessing: false,
    lastAction: null,
    lastActionTime: null,
    actionCount: 0,
  });

  // Helper to update action state
  const updateActionState = useCallback((action: ActionType) => {
    setActionState((prev) => ({
      isProcessing: false,
      lastAction: action,
      lastActionTime: new Date(),
      actionCount: prev.actionCount + 1,
    }));
  }, []);

  // Helper to start processing
  const startProcessing = useCallback(() => {
    setActionState((prev) => ({ ...prev, isProcessing: true }));
  }, []);

  // Helper to stop processing
  const stopProcessing = useCallback(() => {
    setActionState((prev) => ({ ...prev, isProcessing: false }));
  }, []);

  // ================================================
  // COMMENT ACTIONS
  // ================================================

  const approveComment = useCallback(
    async (commentId: string) => {
      try {
        startProcessing();
        await moderationApi.approveComment(commentId);
        updateActionState(ActionType.APPROVE);
        toast.success('Yorum onaylandı');
        logger.info('Comment approved:', commentId);
      } catch (error) {
        stopProcessing();
        logger.error('Failed to approve comment:', error instanceof Error ? error : new Error(String(error)));
        toast.error('Yorum onaylanamadı');
        throw error;
      }
    },
    [startProcessing, updateActionState, stopProcessing]
  );

  const rejectComment = useCallback(
    async (commentId: string, reason: string) => {
      try {
        startProcessing();
        await moderationApi.rejectComment(commentId, reason);
        updateActionState(ActionType.REJECT);
        toast.success('Yorum reddedildi');
        logger.info('Comment rejected:', { commentId, reason });
      } catch (error) {
        stopProcessing();
        logger.error('Failed to reject comment:', error instanceof Error ? error : new Error(String(error)));
        toast.error('Yorum reddedilemedi');
        throw error;
      }
    },
    [startProcessing, updateActionState, stopProcessing]
  );

  const markCommentAsSpam = useCallback(
    async (commentId: string) => {
      try {
        startProcessing();
        await moderationApi.markCommentAsSpam(commentId);
        updateActionState(ActionType.SPAM);
        toast.success('Yorum spam olarak işaretlendi');
        logger.info('Comment marked as spam:', commentId);
      } catch (error) {
        stopProcessing();
        logger.error('Failed to mark comment as spam:', error instanceof Error ? error : new Error(String(error)));
        toast.error('Yorum spam olarak işaretlenemedi');
        throw error;
      }
    },
    [startProcessing, updateActionState, stopProcessing]
  );

  // ================================================
  // REVIEW ACTIONS
  // ================================================

  const approveReview = useCallback(
    async (reviewId: string) => {
      try {
        startProcessing();
        await moderationApi.approveReview(reviewId);
        updateActionState(ActionType.APPROVE);
        toast.success('Değerlendirme onaylandı');
        logger.info('Review approved:', reviewId);
      } catch (error) {
        stopProcessing();
        logger.error('Failed to approve review:', error instanceof Error ? error : new Error(String(error)));
        toast.error('Değerlendirme onaylanamadı');
        throw error;
      }
    },
    [startProcessing, updateActionState, stopProcessing]
  );

  const rejectReview = useCallback(
    async (reviewId: string, reason: string) => {
      try {
        startProcessing();
        await moderationApi.rejectReview(reviewId, reason);
        updateActionState(ActionType.REJECT);
        toast.success('Değerlendirme reddedildi');
        logger.info('Review rejected:', { reviewId, reason });
      } catch (error) {
        stopProcessing();
        logger.error('Failed to reject review:', error instanceof Error ? error : new Error(String(error)));
        toast.error('Değerlendirme reddedilemedi');
        throw error;
      }
    },
    [startProcessing, updateActionState, stopProcessing]
  );

  // ================================================
  // REPORT ACTIONS
  // ================================================

  const resolveReport = useCallback(
    async (reportId: string, action: string, notes?: string) => {
      try {
        startProcessing();
        await moderationApi.resolveReport(reportId, action, notes);
        updateActionState(ActionType.RESOLVE);
        toast.success('Şikayet çözüldü');
        logger.info('Report resolved:', { reportId, action });
      } catch (error) {
        stopProcessing();
        logger.error('Failed to resolve report:', error instanceof Error ? error : new Error(String(error)));
        toast.error('Şikayet çözülemedi');
        throw error;
      }
    },
    [startProcessing, updateActionState, stopProcessing]
  );

  const dismissReport = useCallback(
    async (reportId: string, reason?: string) => {
      try {
        startProcessing();
        await moderationApi.dismissReport(reportId, reason);
        updateActionState(ActionType.REJECT);
        toast.success('Şikayet reddedildi');
        logger.info('Report dismissed:', { reportId, reason });
      } catch (error) {
        stopProcessing();
        logger.error('Failed to dismiss report:', error instanceof Error ? error : new Error(String(error)));
        toast.error('Şikayet reddedilemedi');
        throw error;
      }
    },
    [startProcessing, updateActionState, stopProcessing]
  );

  // ================================================
  // USER MODERATION ACTIONS
  // ================================================

  const issueWarning = useCallback(
    async (userId: string, reason: string, details: string) => {
      try {
        startProcessing();
        await moderationApi.issueWarning({ userId, reason, details });
        updateActionState(ActionType.WARN);
        toast.success('Kullanıcıya uyarı verildi');
        logger.info('Warning issued to user:', userId);
      } catch (error) {
        stopProcessing();
        logger.error('Failed to issue warning:', error instanceof Error ? error : new Error(String(error)));
        toast.error('Uyarı verilemedi');
        throw error;
      }
    },
    [startProcessing, updateActionState, stopProcessing]
  );

  const suspendUser = useCallback(
    async (request: {
      userId: string;
      suspensionType:
        | 'TEMPORARY'
        | 'PERMANENT'
        | 'SELLER_RESTRICTED'
        | 'BUYER_RESTRICTED';
      reason: string;
      details: string;
      durationDays?: number;
    }) => {
      try {
        startProcessing();
        await moderationApi.suspendUser(request);
        updateActionState(ActionType.BAN);
        toast.success('Kullanıcı askıya alındı');
        logger.info('User suspended:', { request: userId, request: suspensionType });
      } catch (error) {
        stopProcessing();
        logger.error('Failed to suspend user:', error instanceof Error ? error : new Error(String(error)));
        toast.error('Kullanıcı askıya alınamadı');
        throw error;
      }
    },
    [startProcessing, updateActionState, stopProcessing]
  );

  // ================================================
  // UTILITY
  // ================================================

  const resetActionState = useCallback(() => {
    setActionState({
      isProcessing: false,
      lastAction: null,
      lastActionTime: null,
      actionCount: 0,
    });
  }, []);

  return {
    actionState,
    approveComment,
    rejectComment,
    markCommentAsSpam,
    approveReview,
    rejectReview,
    resolveReport,
    dismissReport,
    issueWarning,
    suspendUser,
    resetActionState,
  };
}

export default useModerationActions;
