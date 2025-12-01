'use client';

/**
 * ================================================
 * MODERATION HOOKS
 * ================================================
 * React hooks for moderator operations
 *
 * Sprint: Moderator Dashboard Implementation
 * @version 1.0.0
 * @author MarifetBul Development Team
 * @created November 1, 2025
 */

import useSWR, { mutate } from 'swr';
import { useState } from 'react';
import {
  getModerationStats,
  getRecentActivities,
  getPendingComments,
  getCommentsByStatus,
  approveComment,
  rejectComment,
  markCommentAsSpam,
  bulkApproveComments,
  bulkRejectComments,
  bulkMarkCommentsAsSpam,
  getPendingReviews,
  getFlaggedReviews,
  approveReview,
  rejectReview,
  issueWarning,
  suspendUser,
  liftSuspension,
  getUserModerationHistory,
  getPendingReports,
  resolveReport,
  dismissReport,
} from '@/lib/api/moderation';
import type {
  ModerationStats,
  ModerationActivity,
  BlogCommentDto,
  ReviewDto,
  ReportDto,
  CommentStatus,
  UserModerationHistory,
} from '@/types/business/moderation';
import type { PageResponse } from '@/types/infrastructure/api';
import { useToast } from '@/hooks/core/useToast';

// ============================================================================
// MODERATION STATS HOOK
// ============================================================================

/**
 * Hook for fetching and managing moderation statistics
 *
 * @param refreshInterval - Auto-refresh interval in milliseconds (default: 30000)
 * @returns Moderation stats with loading state and refresh function
 */
export function useModerationStats(refreshInterval = 30000) {
  const {
    data,
    error,
    isLoading,
    mutate: refresh,
  } = useSWR<ModerationStats>('/api/v1/moderation/stats', getModerationStats, {
    refreshInterval,
    revalidateOnFocus: true,
    dedupingInterval: 10000, // Prevent duplicate requests within 10s
  });

  return {
    stats: data,
    isLoading,
    error,
    refresh,
  };
}

// ============================================================================
// RECENT ACTIVITIES HOOK
// ============================================================================

/**
 * Hook for fetching recent moderator activities
 *
 * REFACTORED: Sprint 1 - Uses production-ready ModerationActivity type
 * Backend: GET /api/v1/moderation/activities (returns PageResponse<ModerationActivity>)
 *
 * @param page - Page number (0-indexed, default: 0)
 * @param size - Items per page (default: 20)
 * @param allModerators - Include all moderators' activities (admin only, default: false)
 * @param refreshInterval - Auto-refresh interval in milliseconds (default: 60000)
 * @returns Recent activities with pagination info
 */
export function useRecentActivities(
  page = 0,
  size = 20,
  allModerators = false,
  refreshInterval = 60000
) {
  const {
    data,
    error,
    isLoading,
    mutate: refresh,
  } = useSWR<PageResponse<ModerationActivity>>(
    ['/api/v1/moderation/activities', page, size, allModerators],
    () => getRecentActivities(page, size, allModerators),
    {
      refreshInterval,
      revalidateOnFocus: true,
      dedupingInterval: 10000,
    }
  );

  return {
    activities: data?.content ?? [],
    total: data?.totalElements ?? 0,
    page: data?.page ?? 0,
    size: data?.size ?? size,
    totalPages: data?.totalPages ?? 0,
    isLoading,
    error,
    refresh,
  };
}

// ============================================================================
// COMMENT MODERATION HOOKS
// ============================================================================

/**
 * Hook for fetching pending comments
 */
export function usePendingComments(page = 0, size = 20) {
  const {
    data,
    error,
    isLoading,
    mutate: refresh,
  } = useSWR<{
    comments: BlogCommentDto[];
    total: number;
  }>(
    ['/api/v1/blog/admin/comments/pending', page, size],
    () => getPendingComments(page, size),
    {
      refreshInterval: 60000,
    }
  );

  return {
    comments: data?.comments ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    refresh,
  };
}

/**
 * Hook for fetching comments by status
 */
export function useCommentsByStatus(
  status: CommentStatus,
  page = 0,
  size = 20
) {
  const {
    data,
    error,
    isLoading,
    mutate: refresh,
  } = useSWR<{
    comments: BlogCommentDto[];
    total: number;
  }>(['/api/v1/blog/admin/comments', status, page, size], () =>
    getCommentsByStatus(status, page, size)
  );

  return {
    comments: data?.comments ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    refresh,
  };
}

/**
 * Hook for bulk comment moderation actions
 */
export function useBulkCommentActions() {
  const { success, error } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBulkApprove = async (commentIds: string[]) => {
    setIsProcessing(true);
    try {
      const result = await bulkApproveComments(commentIds);

      // Refresh comment list and stats
      await Promise.all([
        mutate('/api/v1/blog/admin/comments/pending'),
        mutate('/api/v1/moderator/stats'),
      ]);

      success(
        `${result.successCount} yorum onaylandı${
          result.failureCount > 0 ? `, ${result.failureCount} başarısız` : ''
        }`
      );

      return result;
    } catch (err) {
      error('Yorumlar onaylanırken hata oluştu');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkReject = async (commentIds: string[], reason?: string) => {
    setIsProcessing(true);
    try {
      const result = await bulkRejectComments(commentIds, reason);

      // Refresh lists
      await Promise.all([
        mutate('/api/v1/blog/admin/comments/pending'),
        mutate('/api/v1/moderator/stats'),
      ]);

      success(
        `${result.successCount} yorum reddedildi${
          result.failureCount > 0 ? `, ${result.failureCount} başarısız` : ''
        }`
      );

      return result;
    } catch (err) {
      error('Yorumlar reddedilirken hata oluştu');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkSpam = async (commentIds: string[]) => {
    setIsProcessing(true);
    try {
      const result = await bulkMarkCommentsAsSpam(commentIds);

      // Refresh lists
      await Promise.all([
        mutate('/api/v1/blog/admin/comments/pending'),
        mutate('/api/v1/moderator/stats'),
      ]);

      success(
        `${result.successCount} yorum spam olarak işaretlendi${
          result.failureCount > 0 ? `, ${result.failureCount} başarısız` : ''
        }`
      );

      return result;
    } catch (err) {
      error('Yorumlar spam olarak işaretlenirken hata oluştu');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    bulkApprove: handleBulkApprove,
    bulkReject: handleBulkReject,
    bulkSpam: handleBulkSpam,
    isProcessing,
  };
}

/**
 * Hook for single comment moderation actions
 */
export function useCommentActions() {
  const { success, error: showError } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async (commentId: string) => {
    setIsProcessing(true);
    try {
      const result = await approveComment(commentId);

      // Refresh lists
      await Promise.all([
        mutate('/api/v1/blog/admin/comments/pending'),
        mutate('/api/v1/moderator/stats'),
      ]);

      success('Yorum onaylandı');

      return result;
    } catch (err) {
      showError('Yorum onaylanırken hata oluştu');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (commentId: string, reason?: string) => {
    setIsProcessing(true);
    try {
      const result = await rejectComment(commentId, reason);

      // Refresh lists
      await Promise.all([
        mutate('/api/v1/blog/admin/comments/pending'),
        mutate('/api/v1/moderator/stats'),
      ]);

      success('Yorum reddedildi');

      return result;
    } catch (err) {
      showError('Yorum reddedilirken hata oluştu');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSpam = async (commentId: string) => {
    setIsProcessing(true);
    try {
      const result = await markCommentAsSpam(commentId);

      // Refresh lists
      await Promise.all([
        mutate('/api/v1/blog/admin/comments/pending'),
        mutate('/api/v1/moderator/stats'),
      ]);

      success('Yorum spam olarak işaretlendi');

      return result;
    } catch (err) {
      showError('Yorum spam olarak işaretlenirken hata oluştu');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    approve: handleApprove,
    reject: handleReject,
    spam: handleSpam,
    isProcessing,
  };
}

// ============================================================================
// REVIEW MODERATION HOOKS
// ============================================================================

/**
 * Hook for fetching pending reviews
 *
 * REFACTORED: Sprint 1 - Uses PageResponse<ReviewDto>
 * Backend: GET /api/v1/moderation/reviews/pending
 */
export function usePendingReviews(page = 0, size = 20) {
  const {
    data,
    error,
    isLoading,
    mutate: refresh,
  } = useSWR<PageResponse<ReviewDto>>(
    ['/api/v1/moderation/reviews/pending', page, size],
    () => getPendingReviews(page, size),
    {
      refreshInterval: 60000,
    }
  );

  return {
    reviews: data?.content ?? [],
    total: data?.totalElements ?? 0,
    isLoading,
    error,
    refresh,
  };
}

/**
 * Hook for fetching flagged reviews
 *
 * REFACTORED: Sprint 1 - Uses PageResponse<ReviewDto>
 * Backend: GET /api/v1/moderation/reviews/flagged
 */
export function useFlaggedReviews(page = 0, size = 20) {
  const {
    data,
    error,
    isLoading,
    mutate: refresh,
  } = useSWR<PageResponse<ReviewDto>>(
    ['/api/v1/moderation/reviews/flagged', page, size],
    () => getFlaggedReviews(page, size),
    {
      refreshInterval: 60000,
    }
  );

  return {
    reviews: data?.content ?? [],
    total: data?.totalElements ?? 0,
    isLoading,
    error,
    refresh,
  };
}

/**
 * Hook for review moderation actions
 */
export function useReviewActions() {
  const { success, error: showError } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async (reviewId: string) => {
    setIsProcessing(true);
    try {
      const result = await approveReview(reviewId);

      // Refresh lists
      await Promise.all([
        mutate('/api/v1/reviews/admin/pending'),
        mutate('/api/v1/reviews/admin/flagged'),
        mutate('/api/v1/moderator/stats'),
      ]);

      success('Değerlendirme onaylandı');

      return result;
    } catch (err) {
      showError('Değerlendirme onaylanırken hata oluştu');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (reviewId: string, reason: string) => {
    setIsProcessing(true);
    try {
      const result = await rejectReview(reviewId, reason);

      // Refresh lists
      await Promise.all([
        mutate('/api/v1/reviews/admin/pending'),
        mutate('/api/v1/reviews/admin/flagged'),
        mutate('/api/v1/moderator/stats'),
      ]);

      success('Değerlendirme reddedildi');

      return result;
    } catch (err) {
      showError('Değerlendirme reddedilirken hata oluştu');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    approve: handleApprove,
    reject: handleReject,
    isProcessing,
  };
}

// ============================================================================
// USER MODERATION HOOKS
// ============================================================================

/**
 * Hook for user moderation history
 */
export function useUserModerationHistory(userId: string) {
  const { data, error, isLoading } = useSWR<UserModerationHistory>(
    userId ? `/api/v1/admin/users/${userId}/moderation-history` : null,
    () => getUserModerationHistory(userId)
  );

  return {
    history: data,
    isLoading,
    error,
  };
}

/**
 * Hook for user moderation actions (warnings and suspensions)
 */
export function useUserModerationActions() {
  const { success, error: showError } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleIssueWarning = async (
    userId: string,
    reason: string,
    details: string,
    relatedContentRef?: string
  ) => {
    setIsProcessing(true);
    try {
      const result = await issueWarning({
        userId,
        reason,
        details,
        relatedContentRef,
      });

      // Refresh stats
      await mutate('/api/v1/moderator/stats');

      success('Kullanıcıya uyarı gönderildi');

      return result;
    } catch (err) {
      showError('Uyarı gönderilirken hata oluştu');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuspend = async (
    userId: string,
    suspensionType:
      | 'TEMPORARY'
      | 'PERMANENT'
      | 'SELLER_RESTRICTED'
      | 'BUYER_RESTRICTED',
    reason: string,
    details: string,
    durationDays?: number
  ) => {
    setIsProcessing(true);
    try {
      const result = await suspendUser({
        userId,
        suspensionType,
        reason,
        details,
        durationDays,
      });

      // Refresh stats
      await mutate('/api/v1/moderator/stats');

      const message =
        suspensionType === 'PERMANENT'
          ? 'Kullanıcı kalıcı olarak askıya alındı'
          : durationDays
            ? `Kullanıcı ${durationDays} gün askıya alındı`
            : 'Kullanıcı askıya alındı';

      success(message);

      return result;
    } catch (err) {
      showError('Kullanıcı askıya alınırken hata oluştu');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLiftSuspension = async (suspensionId: string, reason: string) => {
    setIsProcessing(true);
    try {
      const result = await liftSuspension(suspensionId, reason);

      // Refresh stats
      await mutate('/api/v1/moderator/stats');

      success('Kullanıcı askıdan kaldırıldı');

      return result;
    } catch (err) {
      showError('Askı kaldırılırken hata oluştu');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    issueWarning: handleIssueWarning,
    suspend: handleSuspend,
    liftSuspension: handleLiftSuspension,
    isProcessing,
  };
}

// ============================================================================
// REPORT MODERATION HOOKS
// ============================================================================

/**
 * Hook for fetching pending reports
 */
export function usePendingReports(page = 0, size = 20) {
  const {
    data,
    error,
    isLoading,
    mutate: refresh,
  } = useSWR<{
    reports: ReportDto[];
    total: number;
  }>(
    ['/api/v1/moderator/reports/pending', page, size],
    () => getPendingReports(page, size),
    {
      refreshInterval: 60000,
    }
  );

  return {
    reports: data?.reports ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    refresh,
  };
}

/**
 * Hook for report moderation actions
 */
export function useReportActions() {
  const { success, error: showError } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleResolve = async (
    reportId: string,
    action: string,
    notes?: string
  ) => {
    setIsProcessing(true);
    try {
      const result = await resolveReport(reportId, action, notes);

      // Refresh lists
      await Promise.all([
        mutate('/api/v1/moderator/reports/pending'),
        mutate('/api/v1/moderator/stats'),
      ]);

      success('Şikayet çözümlendi');

      return result;
    } catch (err) {
      showError('Şikayet çözümlenirken hata oluştu');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDismiss = async (reportId: string, reason?: string) => {
    setIsProcessing(true);
    try {
      const result = await dismissReport(reportId, reason);

      // Refresh lists
      await Promise.all([
        mutate('/api/v1/moderator/reports/pending'),
        mutate('/api/v1/moderator/stats'),
      ]);

      success('Şikayet reddedildi');

      return result;
    } catch (err) {
      showError('Şikayet reddedilirken hata oluştu');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    resolve: handleResolve,
    dismiss: handleDismiss,
    isProcessing,
  };
}
