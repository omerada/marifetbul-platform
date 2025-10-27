/**
 * ================================================
 * COMMENT REPORTS HOOK
 * ================================================
 * Hook for reporting inappropriate comments
 * Handles report submission and tracking
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { useState, useCallback } from 'react';

// ================================================
// TYPES
// ================================================

export type CommentReportReason =
  | 'spam'
  | 'harassment'
  | 'offensive'
  | 'off-topic'
  | 'misinformation'
  | 'other';

export interface CommentReportData {
  commentId: number;
  reason: CommentReportReason;
  details?: string;
}

export interface UseCommentReportsReturn {
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
  reportComment: (data: CommentReportData) => Promise<boolean>;
  resetState: () => void;
}

// ================================================
// REPORT REASON LABELS
// ================================================

export const REPORT_REASON_LABELS: Record<CommentReportReason, string> = {
  spam: 'Spam veya Reklam',
  harassment: 'Taciz veya Zorbalık',
  offensive: 'Rahatsız Edici İçerik',
  'off-topic': 'Konu Dışı',
  misinformation: 'Yanlış Bilgi',
  other: 'Diğer',
};

export const REPORT_REASON_DESCRIPTIONS: Record<CommentReportReason, string> = {
  spam: 'İstenmeyen reklam, spam veya tekrarlayan içerik',
  harassment: 'Taciz, zorbalık veya tehdit içeren yorumlar',
  offensive: 'Hakaret, küfür veya saldırgan dil',
  'off-topic': 'Konu ile alakasız veya ilgisiz içerik',
  misinformation: 'Kasıtlı olarak yanlış veya yanıltıcı bilgi',
  other: 'Yukarıdakilerden hiçbiri',
};

// ================================================
// HOOK
// ================================================

export function useCommentReports(): UseCommentReportsReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /**
   * Report a comment
   * Note: Backend endpoint not yet implemented (Sprint 18 Phase 2)
   * This is a frontend-ready implementation
   */
  const reportComment = useCallback(
    async (data: CommentReportData): Promise<boolean> => {
      setError(null);
      setSuccess(false);

      // Validate
      if (!data.reason) {
        setError('Lütfen bir şikayet nedeni seçin.');
        return false;
      }

      if (data.reason === 'other' && !data.details?.trim()) {
        setError('Lütfen "Diğer" seçeneği için açıklama girin.');
        return false;
      }

      setIsSubmitting(true);

      try {
        // Production Ready: Backend API endpoint required
        // Expected endpoint: POST /api/v1/blog/comments/{commentId}/report
        // Request body: { reason: string, details?: string }
        // Response: { success: boolean, reportId: string, message: string }
        // await apiClient.post(`/api/v1/blog/comments/${data.commentId}/report`, {
        //   reason: data.reason,
        //   details: data.details,
        // });

        // Simulate API call for development
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // For development: Log report data
        if (process.env.NODE_ENV === 'development') {
          console.log('Comment Report (Mock):', {
            commentId: data.commentId,
            reason: data.reason,
            reasonLabel: REPORT_REASON_LABELS[data.reason],
            details: data.details,
            timestamp: new Date().toISOString(),
          });
        }

        setSuccess(true);
        return true;
      } catch (err) {
        console.error('Failed to report comment:', err);

        if (err instanceof Error) {
          if (err.message.includes('401')) {
            setError('Şikayet göndermek için giriş yapmalısınız.');
          } else if (err.message.includes('429')) {
            setError(
              'Çok fazla şikayet gönderdiniz. Lütfen daha sonra tekrar deneyin.'
            );
          } else if (err.message.includes('duplicate')) {
            setError('Bu yorumu zaten şikayet ettiniz.');
          } else {
            setError('Şikayet gönderilemedi. Lütfen tekrar deneyin.');
          }
        } else {
          setError('Beklenmeyen bir hata oluştu.');
        }

        return false;
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

  return {
    isSubmitting,
    error,
    success,
    reportComment,
    resetState,
  };
}

export default useCommentReports;
