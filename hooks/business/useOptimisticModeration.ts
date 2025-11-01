/**
 * ================================================
 * OPTIMISTIC MODERATION HOOK
 * ================================================
 * Provides optimistic UI updates for comment moderation
 * with automatic rollback on error
 *
 * Features:
 * - Instant UI feedback
 * - Automatic state rollback on failure
 * - Toast notifications
 * - Error handling
 * - Activity logging integration
 *
 * Day 2 Story 2.3 & 2.4 - Sprint 2
 */

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/core/useToast';
import * as activityLogger from '@/lib/api/moderation-activity';
import type {
  BlogCommentResponse,
  CommentStatus,
} from '@/types/backend-aligned';

/**
 * Optimistic update action types
 */
export type OptimisticAction = 'approve' | 'reject' | 'spam' | 'restore';

/**
 * Optimistic update result
 */
export interface OptimisticUpdateResult {
  success: boolean;
  error?: string;
  rolledBack?: boolean;
}

/**
 * Hook return type
 */
export interface UseOptimisticModerationReturn {
  // State
  optimisticComments: Map<number, BlogCommentResponse>;
  isProcessing: boolean;

  // Actions
  performOptimisticUpdate: <T>(
    action: OptimisticAction,
    commentIds: number[],
    apiCall: () => Promise<T>,
    onSuccess?: (result: T) => void,
    onError?: (error: Error) => void
  ) => Promise<OptimisticUpdateResult>;

  resetOptimisticState: () => void;
}

/**
 * Get new status based on action
 */
const getNewStatus = (action: OptimisticAction): CommentStatus => {
  const statusMap: Record<OptimisticAction, CommentStatus> = {
    approve: 'APPROVED',
    reject: 'REJECTED',
    spam: 'SPAM',
    restore: 'PENDING',
  };
  return statusMap[action];
};

/**
 * Get toast messages based on action
 */
const getToastMessages = (action: OptimisticAction, count: number) => {
  const messages = {
    approve: {
      success: count === 1 ? 'Yorum onaylandı' : `${count} yorum onaylandı`,
      error:
        count === 1
          ? 'Yorum onaylanırken hata oluştu'
          : `${count} yorum onaylanırken hata oluştu`,
    },
    reject: {
      success: count === 1 ? 'Yorum reddedildi' : `${count} yorum reddedildi`,
      error:
        count === 1
          ? 'Yorum reddedilirken hata oluştu'
          : `${count} yorum reddedilirken hata oluştu`,
    },
    spam: {
      success:
        count === 1
          ? 'Yorum spam olarak işaretlendi'
          : `${count} yorum spam olarak işaretlendi`,
      error:
        count === 1
          ? 'Spam işaretlenirken hata oluştu'
          : `${count} yorum spam işaretlenirken hata oluştu`,
    },
    restore: {
      success:
        count === 1 ? 'Yorum geri yüklendi' : `${count} yorum geri yüklendi`,
      error:
        count === 1
          ? 'Geri yüklenirken hata oluştu'
          : `${count} yorum geri yüklenirken hata oluştu`,
    },
  };
  return messages[action];
};

/**
 * Log moderation activity (async, non-blocking)
 */
const logActivity = async (
  action: OptimisticAction,
  commentIds: number[]
): Promise<void> => {
  try {
    const isBulk = commentIds.length > 1;
    const commentIdStrings = commentIds.map(String);

    switch (action) {
      case 'approve':
        if (isBulk) {
          await activityLogger.logBulkApproval(commentIdStrings);
        } else {
          await activityLogger.logCommentApproval(commentIdStrings[0], false);
        }
        break;
      case 'reject':
        if (isBulk) {
          await activityLogger.logBulkRejection(
            commentIdStrings,
            'INAPPROPRIATE',
            'Bulk rejection'
          );
        } else {
          await activityLogger.logCommentRejection(
            commentIdStrings[0],
            'INAPPROPRIATE',
            undefined,
            false
          );
        }
        break;
      case 'spam':
        if (isBulk) {
          await activityLogger.logBulkSpam(commentIdStrings);
        } else {
          await activityLogger.logSpamMarking(commentIdStrings[0], false);
        }
        break;
      case 'restore':
        // Restore action can be logged as approval
        await activityLogger.logCommentApproval(commentIdStrings[0], false);
        break;
    }
  } catch (error) {
    // Activity logging failure should not break the main flow
    console.warn('Activity logging failed:', error);
  }
};

/**
 * Optimistic Moderation Hook
 */
export function useOptimisticModeration(
  comments: BlogCommentResponse[]
): UseOptimisticModerationReturn {
  const toast = useToast();
  const [optimisticComments, setOptimisticComments] = useState<
    Map<number, BlogCommentResponse>
  >(new Map());
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Perform optimistic update with automatic rollback
   */
  const performOptimisticUpdate = useCallback(
    async <T>(
      action: OptimisticAction,
      commentIds: number[],
      apiCall: () => Promise<T>,
      onSuccess?: (result: T) => void,
      onError?: (error: Error) => void
    ): Promise<OptimisticUpdateResult> => {
      // Validation
      if (commentIds.length === 0) {
        return { success: false, error: 'Hiçbir yorum seçilmedi' };
      }

      // Store original states for rollback
      const originalStates = new Map<number, BlogCommentResponse>();
      commentIds.forEach((id) => {
        const comment = comments.find((c) => c.id === id);
        if (comment) {
          originalStates.set(id, { ...comment });
        }
      });

      // Apply optimistic updates
      const newStatus = getNewStatus(action);
      const optimisticUpdates = new Map<number, BlogCommentResponse>();

      commentIds.forEach((id) => {
        const comment = comments.find((c) => c.id === id);
        if (comment) {
          optimisticUpdates.set(id, {
            ...comment,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          });
        }
      });

      setOptimisticComments(optimisticUpdates);
      setIsProcessing(true);

      try {
        // Execute API call
        const result = await apiCall();

        // Success - log activity (async, non-blocking)
        logActivity(action, commentIds).catch((err: Error) => {
          console.warn('Failed to log activity:', err);
        });

        // Show toast
        const messages = getToastMessages(action, commentIds.length);
        toast.success(messages.success);

        // Clear optimistic state
        setOptimisticComments(new Map());

        // Call success callback
        onSuccess?.(result);

        return { success: true };
      } catch (error) {
        console.error(`Optimistic ${action} failed:`, error);

        // Rollback - restore original states
        setOptimisticComments(new Map());

        // Show error toast
        const messages = getToastMessages(action, commentIds.length);
        const errorMessage =
          error instanceof Error ? error.message : messages.error;
        toast.error(messages.error, errorMessage);

        // Call error callback
        onError?.(error instanceof Error ? error : new Error('Unknown error'));

        return {
          success: false,
          error: errorMessage,
          rolledBack: true,
        };
      } finally {
        setIsProcessing(false);
      }
    },
    [comments, toast]
  );

  /**
   * Reset optimistic state
   */
  const resetOptimisticState = useCallback(() => {
    setOptimisticComments(new Map());
    setIsProcessing(false);
  }, []);

  return {
    optimisticComments,
    isProcessing,
    performOptimisticUpdate,
    resetOptimisticState,
  };
}

export default useOptimisticModeration;
