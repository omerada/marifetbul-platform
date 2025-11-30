'use client';

/**
 * ================================================
 * USE COMMENT MODERATION HOOK
 * ================================================
 * Dedicated hook for moderator comment management
 *
 * Features:
 * - Fetch pending/flagged comments
 * - Approve/reject/spam comments with reasons
 * - Bulk moderation actions
 * - Escalation workflow
 * - Real-time stats updates
 * - Optimistic UI updates
 *
 * Sprint: Moderation System Production Ready
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 13, 2025
 */

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { toast } from 'sonner';
import logger from '@/lib/infrastructure/monitoring/logger';
import { getBackendApiUrl } from '@/lib/config/api';

// ============================================================================
// TYPES
// ============================================================================

export type CommentModerationStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'spam'
  | 'all';

export interface CommentModerationFilters {
  status?: CommentModerationStatus;
  priority?: 'high' | 'medium' | 'low';
  escalatedOnly?: boolean;
  flaggedOnly?: boolean;
  hasReports?: boolean;
  dateFrom?: string;
  dateTo?: string;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
  search?: string;
  postId?: string;
  userId?: string;
}

export interface CommentModerationStats {
  pending: number;
  approved: number;
  rejected: number;
  spam: number;
  flagged: number;
  escalated: number;
}

export interface BlogCommentData {
  id: number;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM';
  author: {
    id: string;
    fullName: string;
    username: string;
    avatarUrl?: string;
  };
  postTitle: string;
  postSlug: string;
  postId: number;
  flaggedCount: number;
  flagReasons: string[];
  isEscalated: boolean;
  escalationReason?: string;
  createdAt: string;
  approvedAt?: string;
  moderatorNotes?: string;
}

export interface CommentModerationResponse {
  comments: BlogCommentData[];
  stats: CommentModerationStats;
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
  };
}

// ============================================================================
// API FETCHER
// ============================================================================

const fetcher = async (url: string) => {
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: 'Failed to fetch comments' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
};

// ============================================================================
// MAIN HOOK
// ============================================================================

export interface UseCommentModerationOptions {
  autoFetch?: boolean;
  filters?: CommentModerationFilters;
  pageSize?: number;
}

export interface UseCommentModerationReturn {
  // Data
  comments: BlogCommentData[];
  stats: CommentModerationStats | null;
  pagination: {
    page: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
  } | null;

  // State
  isLoading: boolean;
  error: Error | null;
  isProcessing: boolean;
  selectedComments: number[];

  // Actions
  approveComment: (commentId: number, notes?: string) => Promise<boolean>;
  rejectComment: (
    commentId: number,
    reason: string,
    notes?: string
  ) => Promise<boolean>;
  markAsSpam: (commentId: number, notes?: string) => Promise<boolean>;
  escalateComment: (commentId: number, reason: string) => Promise<boolean>;
  bulkApprove: (commentIds: number[]) => Promise<boolean>;
  bulkReject: (commentIds: number[], reason: string) => Promise<boolean>;
  bulkMarkAsSpam: (commentIds: number[]) => Promise<boolean>;
  bulkEscalate: (commentIds: number[], reason: string) => Promise<boolean>;

  // Selection
  toggleSelection: (commentId: number) => void;
  selectAll: () => void;
  clearSelection: () => void;

  // Fetch
  fetchComments: (page?: number) => Promise<void>;
  refresh: () => void;
}

export function useCommentModeration(
  options: UseCommentModerationOptions = {}
): UseCommentModerationReturn {
  const { autoFetch = true, filters = {}, pageSize = 20 } = options;

  // ========================================================================
  // STATE
  // ========================================================================

  const [page, setPage] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedComments, setSelectedComments] = useState<number[]>([]);

  // ========================================================================
  // DATA FETCHING
  // ========================================================================

  const buildUrl = useCallback(
    (currentPage: number) => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: pageSize.toString(),
        ...(filters.status && { status: filters.status.toUpperCase() }),
        ...(filters.escalatedOnly && { escalatedOnly: 'true' }),
        ...(filters.flaggedOnly && { flaggedOnly: 'true' }),
        ...(filters.dateFrom && { createdFrom: filters.dateFrom }),
        ...(filters.dateTo && { createdTo: filters.dateTo }),
        ...(filters.searchQuery && { searchQuery: filters.searchQuery }),
      });

      return `${getBackendApiUrl()}/api/v1/moderation/comments?${params}`;
    },
    [filters, pageSize]
  );

  const { data, error, mutate, isLoading } = useSWR<CommentModerationResponse>(
    autoFetch ? buildUrl(page) : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  // ========================================================================
  // SINGLE ACTIONS
  // ========================================================================

  const approveComment = useCallback(
    async (commentId: number, notes?: string): Promise<boolean> => {
      setIsProcessing(true);
      try {
        const response = await fetch(
          `${getBackendApiUrl()}/api/v1/moderation/comments/${commentId}/approve`,
          {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notes }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to approve comment');
        }

        toast.success('Yorum onaylandı');
        await mutate();
        return true;
      } catch (error) {
        logger.error(
          'Failed to approve comment',
          error instanceof Error ? error : new Error(String(error))
        );
        toast.error(
          error instanceof Error ? error.message : 'Yorum onaylanamadı'
        );
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [mutate]
  );

  const rejectComment = useCallback(
    async (
      commentId: number,
      reason: string,
      notes?: string
    ): Promise<boolean> => {
      if (!reason?.trim()) {
        toast.error('Reddetme sebebi gereklidir');
        return false;
      }

      setIsProcessing(true);
      try {
        const response = await fetch(
          `${getBackendApiUrl()}/api/v1/moderation/comments/${commentId}/reject`,
          {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason, notes }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to reject comment');
        }

        toast.success('Yorum reddedildi');
        await mutate();
        return true;
      } catch (error) {
        logger.error(
          'Failed to reject comment',
          error instanceof Error ? error : new Error(String(error))
        );
        toast.error(
          error instanceof Error ? error.message : 'Yorum reddedilemedi'
        );
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [mutate]
  );

  const markAsSpam = useCallback(
    async (commentId: number, notes?: string): Promise<boolean> => {
      setIsProcessing(true);
      try {
        const response = await fetch(
          `${getBackendApiUrl()}/api/v1/moderation/comments/${commentId}/spam`,
          {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notes }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to mark as spam');
        }

        toast.success('Yorum spam olarak işaretlendi');
        await mutate();
        return true;
      } catch (error) {
        logger.error(
          'Failed to mark comment as spam',
          error instanceof Error ? error : new Error(String(error))
        );
        toast.error(
          error instanceof Error
            ? error.message
            : 'Yorum spam olarak işaretlenemedi'
        );
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [mutate]
  );

  const escalateComment = useCallback(
    async (commentId: number, reason: string): Promise<boolean> => {
      if (!reason?.trim()) {
        toast.error('Yükseltme sebebi gereklidir');
        return false;
      }

      setIsProcessing(true);
      try {
        const response = await fetch(
          `${getBackendApiUrl()}/api/v1/moderation/comments/${commentId}/escalate`,
          {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to escalate comment');
        }

        toast.success('Yorum yöneticiye yükseltildi');
        await mutate();
        return true;
      } catch (error) {
        logger.error(
          'Failed to escalate comment',
          error instanceof Error ? error : new Error(String(error))
        );
        toast.error(
          error instanceof Error ? error.message : 'Yorum yükseltilemedi'
        );
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [mutate]
  );

  // ========================================================================
  // BULK ACTIONS
  // ========================================================================

  const bulkApprove = useCallback(
    async (commentIds: number[]): Promise<boolean> => {
      if (commentIds.length === 0) {
        toast.error('Lütfen en az bir yorum seçin');
        return false;
      }

      setIsProcessing(true);
      try {
        const response = await fetch(
          `${getBackendApiUrl()}/api/v1/moderation/comments/bulk/approve`,
          {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ commentIds }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Bulk approve failed');
        }

        const result = await response.json();
        toast.success(
          `${result.successCount}/${commentIds.length} yorum onaylandı`
        );
        setSelectedComments([]);
        await mutate();
        return true;
      } catch (error) {
        logger.error(
          'Bulk approve failed',
          error instanceof Error ? error : new Error(String(error))
        );
        toast.error(
          error instanceof Error ? error.message : 'Toplu onaylama başarısız'
        );
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [mutate]
  );

  const bulkReject = useCallback(
    async (commentIds: number[], reason: string): Promise<boolean> => {
      if (commentIds.length === 0) {
        toast.error('Lütfen en az bir yorum seçin');
        return false;
      }

      if (!reason?.trim()) {
        toast.error('Reddetme sebebi gereklidir');
        return false;
      }

      setIsProcessing(true);
      try {
        const response = await fetch(
          `${getBackendApiUrl()}/api/v1/moderation/comments/bulk/reject`,
          {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ commentIds, reason }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Bulk reject failed');
        }

        const result = await response.json();
        toast.success(
          `${result.successCount}/${commentIds.length} yorum reddedildi`
        );
        setSelectedComments([]);
        await mutate();
        return true;
      } catch (error) {
        logger.error(
          'Bulk reject failed',
          error instanceof Error ? error : new Error(String(error))
        );
        toast.error(
          error instanceof Error ? error.message : 'Toplu reddetme başarısız'
        );
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [mutate]
  );

  const bulkMarkAsSpam = useCallback(
    async (commentIds: number[]): Promise<boolean> => {
      if (commentIds.length === 0) {
        toast.error('Lütfen en az bir yorum seçin');
        return false;
      }

      setIsProcessing(true);
      try {
        const response = await fetch(
          `${getBackendApiUrl()}/api/v1/moderation/comments/bulk/spam`,
          {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ commentIds }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Bulk spam marking failed');
        }

        const result = await response.json();
        toast.success(
          `${result.successCount}/${commentIds.length} yorum spam olarak işaretlendi`
        );
        setSelectedComments([]);
        await mutate();
        return true;
      } catch (error) {
        logger.error(
          'Bulk spam marking failed',
          error instanceof Error ? error : new Error(String(error))
        );
        toast.error(
          error instanceof Error
            ? error.message
            : 'Toplu spam işaretleme başarısız'
        );
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [mutate]
  );

  const bulkEscalate = useCallback(
    async (commentIds: number[], reason: string): Promise<boolean> => {
      if (commentIds.length === 0) {
        toast.error('Lütfen en az bir yorum seçin');
        return false;
      }

      if (!reason?.trim()) {
        toast.error('Yükseltme sebebi gereklidir');
        return false;
      }

      setIsProcessing(true);
      try {
        const response = await fetch(
          `${getBackendApiUrl()}/api/v1/moderation/comments/bulk/escalate`,
          {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ commentIds, reason }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Bulk escalation failed');
        }

        const result = await response.json();
        toast.success(
          `${result.successCount}/${commentIds.length} yorum yükseltildi`
        );
        setSelectedComments([]);
        await mutate();
        return true;
      } catch (error) {
        logger.error(
          'Bulk escalation failed',
          error instanceof Error ? error : new Error(String(error))
        );
        toast.error(
          error instanceof Error ? error.message : 'Toplu yükseltme başarısız'
        );
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [mutate]
  );

  // ========================================================================
  // SELECTION MANAGEMENT
  // ========================================================================

  const toggleSelection = useCallback((commentId: number) => {
    setSelectedComments((prev: number[]) =>
      prev.includes(commentId)
        ? prev.filter((id: number) => id !== commentId)
        : [...prev, commentId]
    );
  }, []);

  const selectAll = useCallback(() => {
    if (data?.comments) {
      setSelectedComments(data.comments.map((c) => c.id));
    }
  }, [data?.comments]);

  const clearSelection = useCallback(() => {
    setSelectedComments([]);
  }, []);

  // ========================================================================
  // FETCH & REFRESH
  // ========================================================================

  const fetchComments = useCallback(
    async (targetPage?: number) => {
      const nextPage = targetPage ?? page + 1;
      setPage(nextPage);
      await mutate();
    },
    [page, mutate]
  );

  const refresh = useCallback(() => {
    mutate();
  }, [mutate]);

  // ========================================================================
  // RETURN
  // ========================================================================

  return {
    // Data
    comments: data?.comments || [],
    stats: data?.stats || null,
    pagination: data?.pagination || null,

    // State
    isLoading,
    error: error || null,
    isProcessing,
    selectedComments,

    // Single actions
    approveComment,
    rejectComment,
    markAsSpam,
    escalateComment,

    // Bulk actions
    bulkApprove,
    bulkReject,
    bulkMarkAsSpam,
    bulkEscalate,

    // Selection
    toggleSelection,
    selectAll,
    clearSelection,

    // Fetch
    fetchComments,
    refresh,
  };
}

export default useCommentModeration;
