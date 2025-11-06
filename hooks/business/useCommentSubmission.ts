/**
 * ================================================
 * COMMENT SUBMISSION HOOK
 * ================================================
 * Hook for submitting and managing blog comments
 * Handles validation, submission, and optimistic updates
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { useState, useCallback } from 'react';
import { blogApi } from '@/lib/api/blog';
import logger from '@/lib/infrastructure/monitoring/logger';
import type { BlogComment } from '@/lib/api/blog';

// ================================================
// TYPES
// ================================================

export interface CommentSubmissionData {
  content: string;
  postId: number;
  parentId?: number;
}

export interface UseCommentSubmissionReturn {
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
  submitComment: (data: CommentSubmissionData) => Promise<BlogComment | null>;
  replyToComment: (
    postId: number,
    parentCommentId: number,
    content: string
  ) => Promise<BlogComment | null>;
  resetState: () => void;
  resetError: () => void;
}

// ================================================
// VALIDATION
// ================================================

const MIN_COMMENT_LENGTH = 10;
const MAX_COMMENT_LENGTH = 2000;

export function validateCommentContent(content: string): string | null {
  const trimmed = content.trim();

  if (trimmed.length === 0) {
    return 'Yorum boş olamaz.';
  }

  if (trimmed.length < MIN_COMMENT_LENGTH) {
    return `Yorum en az ${MIN_COMMENT_LENGTH} karakter olmalıdır.`;
  }

  if (trimmed.length > MAX_COMMENT_LENGTH) {
    return `Yorum en fazla ${MAX_COMMENT_LENGTH} karakter olabilir.`;
  }

  // Check for spam patterns
  const spamPatterns = [
    /(.)\1{10,}/i, // Repeated characters
    /https?:\/\//gi, // Multiple URLs
    /<script/i, // Script tags
    /viagra|cialis|casino|poker/i, // Common spam words
  ];

  for (const pattern of spamPatterns) {
    if (pattern.test(trimmed)) {
      return 'Yorumunuz spam olarak algılandı. Lütfen içeriğinizi kontrol edin.';
    }
  }

  return null;
}

// ================================================
// HOOK
// ================================================

export function useCommentSubmission(): UseCommentSubmissionReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submitComment = useCallback(
    async (data: CommentSubmissionData): Promise<BlogComment | null> => {
      // Reset state
      setError(null);
      setSuccess(false);

      // Validate content
      const validationError = validateCommentContent(data.content);
      if (validationError) {
        setError(validationError);
        return null;
      }

      setIsSubmitting(true);

      try {
        // Submit comment
        const comment = await blogApi.createComment(data.postId, {
          content: data.content,
          parentId: data.parentId,
        });

        setSuccess(true);
        return comment;
      } catch (err) {
        logger.error('Failed to submit comment:', err instanceof Error ? err : new Error(String(err)));

        // Handle specific error cases
        if (err instanceof Error) {
          if (
            err.message.includes('401') ||
            err.message.includes('unauthorized')
          ) {
            setError('Yorum yapmak için giriş yapmalısınız.');
          } else if (err.message.includes('429')) {
            setError('Çok fazla yorum gönderdiniz. Lütfen biraz bekleyin.');
          } else if (err.message.includes('403')) {
            setError('Bu işlem için yetkiniz bulunmamaktadır.');
          } else {
            setError('Yorum gönderilemedi. Lütfen tekrar deneyin.');
          }
        } else {
          setError('Beklenmeyen bir hata oluştu.');
        }

        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  const resetState = useCallback(() => {
    setError(null);
    setSuccess(false);
    setIsSubmitting(false);
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const replyToComment = useCallback(
    async (
      postId: number,
      parentCommentId: number,
      content: string
    ): Promise<BlogComment | null> => {
      return submitComment({
        postId,
        content,
        parentId: parentCommentId,
      });
    },
    [submitComment]
  );

  return {
    isSubmitting,
    error,
    success,
    submitComment,
    replyToComment,
    resetState,
    resetError,
  };
}

export default useCommentSubmission;
