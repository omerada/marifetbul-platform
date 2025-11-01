/**
 * ================================================
 * COMMENT ACTIONS HOOK
 * ================================================
 * Hook for managing comment actions: edit, delete, update
 * Handles optimistic updates and error recovery
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { useState, useCallback } from 'react';
import { blogApi } from '@/lib/api/blog';
import type { BlogComment } from '@/lib/api/blog';
import { validateCommentContent } from './useCommentSubmission';
import { logger } from '@/lib/shared/utils/logger';

// ================================================
// TYPES
// ================================================

export interface UseCommentActionsReturn {
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  updateComment: (
    commentId: number,
    content: string
  ) => Promise<BlogComment | null>;
  deleteComment: (commentId: number) => Promise<boolean>;
  resetError: () => void;
}

// ================================================
// HOOK
// ================================================

export function useCommentActions(): UseCommentActionsReturn {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Update comment content
   */
  const updateComment = useCallback(
    async (commentId: number, content: string): Promise<BlogComment | null> => {
      setError(null);

      // Validate content
      const validationError = validateCommentContent(content);
      if (validationError) {
        setError(validationError);
        return null;
      }

      setIsUpdating(true);

      try {
        const updatedComment = await blogApi.updateComment(commentId, {
          content,
        });
        return updatedComment;
      } catch (err) {
        logger.error('Failed to update comment:', err);

        if (err instanceof Error) {
          if (err.message.includes('403')) {
            setError('Bu yorumu düzenleme yetkiniz yok.');
          } else if (err.message.includes('404')) {
            setError('Yorum bulunamadı.');
          } else {
            setError('Yorum güncellenemedi. Lütfen tekrar deneyin.');
          }
        } else {
          setError('Beklenmeyen bir hata oluştu.');
        }

        return null;
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  /**
   * Delete comment
   */
  const deleteComment = useCallback(
    async (commentId: number): Promise<boolean> => {
      setError(null);
      setIsDeleting(true);

      try {
        await blogApi.deleteComment(commentId);
        return true;
      } catch (err) {
        logger.error('Failed to delete comment:', err);

        if (err instanceof Error) {
          if (err.message.includes('403')) {
            setError('Bu yorumu silme yetkiniz yok.');
          } else if (err.message.includes('404')) {
            setError('Yorum bulunamadı.');
          } else {
            setError('Yorum silinemedi. Lütfen tekrar deneyin.');
          }
        } else {
          setError('Beklenmeyen bir hata oluştu.');
        }

        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    []
  );

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isUpdating,
    isDeleting,
    error,
    updateComment,
    deleteComment,
    resetError,
  };
}

export default useCommentActions;
