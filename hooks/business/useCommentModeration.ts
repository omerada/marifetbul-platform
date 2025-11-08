/**
 * ================================================
 * COMMENT MODERATION HOOK
 * ================================================
 * Business logic for comment moderation (admin)
 * Supports filtering, bulk operations, and moderation actions
 *
 * ⚠️ REFACTORED: Sprint 1 - Story 1.3
 * - Bulk operations: @/lib/services/moderation-service (centralized)
 * - Dashboard queries: @/lib/api/moderation (moderationApi)
 * - Production-ready, no duplicates
 *
 * @author MarifetBul Development Team
 * @version 3.0.0
 * @updated November 8, 2025
 */

import { useState, useCallback, useEffect } from 'react';
import { moderationApi } from '@/lib/api/moderation';
import * as blogApi from '@/lib/api/blog';
import * as moderationService from '@/lib/services/moderation-service';
import logger from '@/lib/infrastructure/monitoring/logger';
import { toast } from 'sonner';
import type { BlogComment } from '@/types/blog';
import type {
  PendingItem,
  ModerationItemStatus,
} from '@/types/business/moderation';

/**
 * Map backend ModerationItemStatus to BlogComment status
 */
function mapModerationStatusToCommentStatus(
  status: ModerationItemStatus
): BlogComment['status'] {
  const statusMap: Record<ModerationItemStatus, BlogComment['status']> = {
    PENDING: 'PENDING',
    IN_REVIEW: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    SPAM: 'SPAM',
    ESCALATED: 'PENDING', // Escalated items shown as pending
  };

  return statusMap[status] || 'PENDING';
}

// ================================================
// TYPES
// ================================================

export type CommentModerationStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'SPAM'
  | 'ALL';

export interface CommentModerationFilters {
  status?: CommentModerationStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
  postId?: number;
  hasReports?: boolean;
}

export interface CommentModerationData {
  comments: BlogComment[];
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  spam: number;
}

export interface UseCommentModerationReturn {
  // Data
  data: CommentModerationData | null;
  loading: boolean;
  error: string | null;

  // Filters
  filters: CommentModerationFilters;
  setFilters: (filters: CommentModerationFilters) => void;
  updateFilter: <K extends keyof CommentModerationFilters>(
    key: K,
    value: CommentModerationFilters[K]
  ) => void;
  clearFilters: () => void;

  // Pagination
  page: number;
  pageSize: number;
  totalPages: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;

  // Selection
  selectedComments: Set<string>;
  selectComment: (id: string) => void;
  deselectComment: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  isSelected: (id: string) => boolean;

  // Actions
  approveComment: (id: string) => Promise<boolean>;
  rejectComment: (id: string) => Promise<boolean>;
  markAsSpam: (id: string) => Promise<boolean>;
  escalateComment: (
    id: string,
    reason: string,
    priority?: 'LOW' | 'MEDIUM' | 'HIGH'
  ) => Promise<boolean>;
  flagComment: (
    id: string,
    flag: CommentFlagType,
    reason: string
  ) => Promise<boolean>;
  hasUserFlagged: (id: string) => Promise<boolean>;
  bulkApprove: (ids: string[]) => Promise<BulkActionResult>;
  bulkReject: (ids: string[]) => Promise<BulkActionResult>;
  bulkMarkAsSpam: (ids: string[]) => Promise<BulkActionResult>;
  bulkEscalate: (
    ids: string[],
    reason: string,
    priority?: 'LOW' | 'MEDIUM' | 'HIGH'
  ) => Promise<BulkActionResult>;

  // Refresh
  refresh: () => Promise<void>;
}

export type CommentFlagType =
  | 'SPAM'
  | 'INAPPROPRIATE'
  | 'OFFENSIVE'
  | 'HARASSMENT'
  | 'MISINFORMATION'
  | 'OTHER';

export interface BulkActionResult {
  success: number;
  failed: number;
  total: number;
  errors?: string[];
} // ================================================
// HOOK
// ================================================

export function useCommentModeration(): UseCommentModerationReturn {
  // ================================================
  // STATE
  // ================================================

  const [data, setData] = useState<CommentModerationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<CommentModerationFilters>({
    status: 'ALL',
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedComments, setSelectedComments] = useState<Set<string>>(
    new Set()
  );

  // ================================================
  // FETCH DATA
  // ================================================

  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query params
      const params = new URLSearchParams({
        page: String(page),
        size: String(pageSize),
      });

      if (filters.status && filters.status !== 'ALL') {
        params.append('status', filters.status);
      }
      if (filters.search) {
        params.append('search', filters.search);
      }
      if (filters.startDate) {
        params.append('startDate', filters.startDate);
      }
      if (filters.endDate) {
        params.append('endDate', filters.endDate);
      }
      if (filters.postId) {
        params.append('postId', String(filters.postId));
      }
      if (filters.hasReports) {
        params.append('hasReports', 'true');
      }

      // Fetch comments using moderator service
      // Backend's getPendingItems returns PendingItemDto objects
      // We transform them to BlogComment format for UI consistency
      const response = await moderationApi.getPendingItems(
        page - 1, // Backend uses 0-based indexing
        pageSize
      );

      // Transform pending items to BlogComment format
      // Maps PendingItemDto from backend to frontend BlogComment interface
      const comments: BlogComment[] = (
        response.items as unknown as PendingItem[]
      )
        .filter(
          (item: PendingItem) =>
            item.itemType === 'COMMENT' || item.itemType === 'REVIEW'
        )
        .map((item: PendingItem) => ({
          id: item.itemId, // Already string from PendingItem
          postId: item.relatedEntityId || '',
          postTitle: item.relatedEntityTitle || 'Yükleniyor...',
          content: item.contentPreview || item.content,
          author: {
            id: item.authorId,
            name: item.authorName,
            username: item.authorName,
            avatar: undefined,
          },
          authorId: item.authorId,
          createdAt: item.submittedAt,
          status: mapModerationStatusToCommentStatus(item.status),
          reportCount: item.flagCount || 0,
          // Additional fields
          updatedAt: item.submittedAt,
          likes: 0,
          replies: [],
        }));

      setData({
        comments,
        total: response.total || response.items?.length || 0,
        pending: response.total || response.items?.length || 0,
        approved: 0,
        rejected: 0,
        spam: 0,
      });

      const calculatedTotalPages = Math.ceil(
        (response.total || 0) / (response.pageSize || 10)
      );
      setTotalPages(calculatedTotalPages || 1);

      logger.debug('[useCommentModeration] Comments fetched', {
        count: comments.length,
        total: response.total || 0,
        page,
      });
    } catch (err) {
      logger.error(
        '[useCommentModeration] Failed to fetch comments',
        err instanceof Error ? err : new Error(String(err))
      );
      setError('Yorumlar yüklenirken bir hata oluştu');
      toast.error('Yorumlar yüklenemedi', {
        description: 'Lütfen sayfayı yenileyerek tekrar deneyin',
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters]);

  // Auto-fetch when dependencies change
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // ================================================
  // FILTER HANDLERS
  // ================================================

  const updateFilter = useCallback(
    <K extends keyof CommentModerationFilters>(
      key: K,
      value: CommentModerationFilters[K]
    ) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setPage(1); // Reset to first page when filters change
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters({ status: 'ALL' });
    setPage(1);
  }, []);

  // ================================================
  // PAGINATION HANDLERS
  // ================================================

  const handleSetPage = useCallback((newPage: number) => {
    setPage(newPage);
    setSelectedComments(new Set()); // Clear selection on page change
  }, []);

  const handleSetPageSize = useCallback((size: number) => {
    setPageSize(size);
    setPage(1);
    setSelectedComments(new Set());
  }, []);

  // ================================================
  // SELECTION HANDLERS
  // ================================================

  const selectComment = useCallback((id: string) => {
    setSelectedComments((prev) => new Set(prev).add(id));
  }, []);

  const deselectComment = useCallback((id: string) => {
    setSelectedComments((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (data?.comments) {
      setSelectedComments(new Set(data.comments.map((c) => c.id)));
    }
  }, [data?.comments]);

  const deselectAll = useCallback(() => {
    setSelectedComments(new Set());
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedComments.has(id),
    [selectedComments]
  );

  // ================================================
  // MODERATION ACTIONS
  // ================================================

  const approveComment = useCallback(async (id: string): Promise<boolean> => {
    try {
      logger.debug('[useCommentModeration] Approving comment', { id });

      // Call moderatorService
      await moderationService.approveComment(id);

      // Update local data optimistically
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: prev.comments.map((c) =>
            c.id === id ? { ...c, approved: true, status: 'APPROVED' } : c
          ),
          pending: Math.max(0, prev.pending - 1),
          approved: prev.approved + 1,
        };
      });

      toast.success('Yorum onaylandı', {
        description: 'Yorum başarıyla onaylanarak yayına alındı',
      });

      return true;
    } catch (err) {
      logger.error(
        '[useCommentModeration] Failed to approve comment',
        err instanceof Error ? err : new Error(String(err))
      );
      setError('Yorum onaylanırken bir hata oluştu');
      toast.error('Yorum onaylanamadı', {
        description: 'Lütfen tekrar deneyin',
      });
      return false;
    }
  }, []);

  const rejectComment = useCallback(async (id: string): Promise<boolean> => {
    try {
      logger.debug('[useCommentModeration] Rejecting comment', { id });

      // Call moderatorService
      await moderationService.rejectComment(
        id,
        'Moderatör tarafından reddedildi'
      );

      // Update local data optimistically
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: prev.comments.map((c) =>
            c.id === id ? { ...c, approved: false, status: 'REJECTED' } : c
          ),
          pending: Math.max(0, prev.pending - 1),
          rejected: prev.rejected + 1,
        };
      });

      toast.success('Yorum reddedildi', {
        description: 'Yorum başarıyla reddedildi',
      });

      return true;
    } catch (err) {
      logger.error(
        '[useCommentModeration] Failed to reject comment',
        err instanceof Error ? err : new Error(String(err))
      );
      setError('Yorum reddedilirken bir hata oluştu');
      toast.error('Yorum reddedilemedi', {
        description: 'Lütfen tekrar deneyin',
      });
      return false;
    }
  }, []);

  const markAsSpam = useCallback(async (id: string): Promise<boolean> => {
    try {
      logger.debug('[useCommentModeration] Marking comment as spam', { id });

      // Call moderatorService
      await moderationService.markCommentAsSpam(id);

      // Update local data optimistically (remove from list)
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: prev.comments.filter((c) => c.id !== id),
          pending: Math.max(0, prev.pending - 1),
          spam: prev.spam + 1,
        };
      });

      toast.success('Yorum spam olarak işaretlendi', {
        description: 'Yorum spam klasörüne taşındı',
      });

      return true;
    } catch (err) {
      logger.error(
        '[useCommentModeration] Failed to mark as spam',
        err instanceof Error ? err : new Error(String(err))
      );
      setError('Yorum spam olarak işaretlenirken bir hata oluştu');
      toast.error('İşlem başarısız', {
        description: 'Yorum spam olarak işaretlenemedi',
      });
      return false;
    }
  }, []);

  /**
   * Escalate a comment to admin/senior moderator
   * Sprint 1 - Task 6: Comment Escalation Feature
   */
  const escalateComment = useCallback(
    async (
      id: string,
      reason: string,
      priority: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM'
    ): Promise<boolean> => {
      try {
        logger.info('[useCommentModeration] Escalating comment', {
          id,
          reason,
          priority,
        });

        // Call backend escalate API
        await blogApi.escalateComment(Number(id), reason, priority);

        // Show success toast
        toast.success('Yorum yükseltildi', {
          description: 'Yorum yöneticiye iletildi',
        });

        // Refresh data
        await fetchComments();

        return true;
      } catch (err) {
        logger.error(
          '[useCommentModeration] Failed to escalate comment',
          err as Error,
          {
            commentId: id,
          }
        );

        toast.error('İşlem başarısız', {
          description: 'Yorum yükseltilemedi',
        });
        return false;
      }
    },
    [fetchComments]
  );

  /**
   * Flag a comment for moderation
   * Sprint 2 - Story 2.6: Frontend Comment Flag Hook
   */
  const flagComment = useCallback(
    async (
      id: string,
      flag: CommentFlagType,
      reason: string
    ): Promise<boolean> => {
      try {
        logger.info('[useCommentModeration] Flagging comment', { id, flag });

        // Call flag endpoint
        const response = await fetch(`/api/v1/blog/comments/${id}/flag`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ flag, reason }),
        });

        if (!response.ok) {
          throw new Error('Failed to flag comment');
        }

        // Show success toast
        toast.success('Yorum işaretlendi', {
          description: 'Yorum moderatörlere bildirildi',
        });

        // Refresh data
        await fetchComments();

        return true;
      } catch (err) {
        logger.error(
          '[useCommentModeration] Failed to flag comment',
          err as Error,
          {
            commentId: id,
          }
        );

        toast.error('İşlem başarısız', {
          description: 'Yorum işaretlenemedi',
        });
        return false;
      }
    },
    [fetchComments]
  );

  /**
   * Check if user has already flagged a comment
   * Sprint 2 - Story 2.6: Frontend Comment Flag Hook
   */
  const hasUserFlagged = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/v1/blog/comments/${id}/flag/check`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return false;
      }

      const hasFlagged = await response.json();
      return hasFlagged === true;
    } catch (err) {
      logger.error(
        '[useCommentModeration] Failed to check flag status',
        err as Error,
        {
          commentId: id,
        }
      );
      return false;
    }
  }, []);

  // ================================================
  // BULK ACTIONS
  // ================================================

  const bulkApprove = useCallback(
    async (ids: string[]): Promise<BulkActionResult> => {
      try {
        logger.debug('[useCommentModeration] Bulk approving comments', {
          count: ids.length,
        });

        // Call moderatorService bulk approve
        const response = await moderationService.bulkApproveComments(ids);

        // Extract results from backend response
        const result = {
          success: response.successCount,
          failed: response.failureCount,
          total: response.totalRequested,
          errors: response.errors?.map((f) => f.error),
        };

        // Refresh data after bulk operation
        await fetchComments();
        setSelectedComments(new Set());

        // Show toast notifications
        if (result.success > 0) {
          toast.success(`${result.success} yorum onaylandı`, {
            description:
              result.failed > 0
                ? `${result.failed} yorum onaylanamadı`
                : 'Tüm yorumlar başarıyla onaylandı',
          });
        }

        if (result.failed > 0 && result.success === 0) {
          toast.error('Yorumlar onaylanamadı', {
            description: 'Lütfen tekrar deneyin',
          });
        }

        return result;
      } catch (err) {
        logger.error(
          '[useCommentModeration] Bulk approve failed',
          err instanceof Error ? err : new Error(String(err))
        );
        toast.error('Toplu onaylama başarısız', {
          description: 'Bir hata oluştu, lütfen tekrar deneyin',
        });

        return {
          success: 0,
          failed: ids.length,
          total: ids.length,
          errors: ['Sunucu hatası'],
        };
      }
    },
    [fetchComments]
  );

  const bulkReject = useCallback(
    async (ids: string[]): Promise<BulkActionResult> => {
      try {
        logger.debug('[useCommentModeration] Bulk rejecting comments', {
          count: ids.length,
        });

        // Call moderatorService bulk reject
        const response = await moderationService.bulkRejectComments(
          ids,
          'Moderatör tarafından toplu reddedildi'
        );

        // Extract results from backend response
        const result = {
          success: response.successCount,
          failed: response.failureCount,
          total: response.totalRequested,
          errors: response.errors?.map((f) => f.error),
        };

        // Refresh data after bulk operation
        await fetchComments();
        setSelectedComments(new Set());

        // Show toast notifications
        if (result.success > 0) {
          toast.success(`${result.success} yorum reddedildi`, {
            description:
              result.failed > 0
                ? `${result.failed} yorum reddedilemedi`
                : 'Tüm yorumlar başarıyla reddedildi',
          });
        }

        if (result.failed > 0 && result.success === 0) {
          toast.error('Yorumlar reddedilemedi', {
            description: 'Lütfen tekrar deneyin',
          });
        }

        return result;
      } catch (err) {
        logger.error(
          '[useCommentModeration] Bulk reject failed',
          err instanceof Error ? err : new Error(String(err))
        );
        toast.error('Toplu reddetme başarısız', {
          description: 'Bir hata oluştu, lütfen tekrar deneyin',
        });

        return {
          success: 0,
          failed: ids.length,
          total: ids.length,
          errors: ['Sunucu hatası'],
        };
      }
    },
    [fetchComments]
  );

  const bulkMarkAsSpam = useCallback(
    async (ids: string[]): Promise<BulkActionResult> => {
      try {
        logger.debug('[useCommentModeration] Bulk marking as spam', {
          count: ids.length,
        });

        // Call moderatorService bulk spam
        const response = await moderationService.bulkMarkCommentsAsSpam(ids);

        // Extract results from backend response
        const result = {
          success: response.successCount,
          failed: response.failureCount,
          total: response.totalRequested,
          errors: response.errors?.map((f) => f.error),
        };

        // Refresh data after bulk operation
        await fetchComments();
        setSelectedComments(new Set());

        // Show toast notifications
        if (result.success > 0) {
          toast.success(`${result.success} yorum spam olarak işaretlendi`, {
            description:
              result.failed > 0
                ? `${result.failed} yorum işaretlenemedi`
                : 'Tüm yorumlar spam klasörüne taşındı',
          });
        }

        if (result.failed > 0 && result.success === 0) {
          toast.error('Yorumlar işaretlenemedi', {
            description: 'Lütfen tekrar deneyin',
          });
        }

        return result;
      } catch (err) {
        logger.error(
          '[useCommentModeration] Bulk spam marking failed',
          err instanceof Error ? err : new Error(String(err))
        );
        toast.error('Toplu spam işaretleme başarısız', {
          description: 'Bir hata oluştu, lütfen tekrar deneyin',
        });

        return {
          success: 0,
          failed: ids.length,
          total: ids.length,
          errors: ['Sunucu hatası'],
        };
      }
    },
    [fetchComments]
  );

  /**
   * Bulk escalate comments to admin/senior moderator
   * Sprint 1 - Task 6: Comment Escalation Feature
   */
  const bulkEscalate = useCallback(
    async (
      ids: string[],
      reason: string,
      priority: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM'
    ): Promise<BulkActionResult> => {
      try {
        logger.debug('[useCommentModeration] Bulk escalating comments', {
          count: ids.length,
          reason,
          priority,
        });

        // Use real bulk escalate API
        const response = await moderationService.bulkEscalateComments(
          ids,
          reason,
          priority
        );

        // Extract results
        const result = {
          success: response.successCount,
          failed: response.failureCount,
          total: response.totalRequested,
          errors: response.errors?.map(
            (f: { itemId: string; error: string }) => f.error
          ),
        };

        // Refresh data
        await fetchComments();

        // Clear selections
        setSelectedComments(new Set());

        // Show toast notifications
        if (result.success > 0) {
          toast.success(`${result.success} yorum yükseltildi`, {
            description:
              result.failed > 0
                ? `${result.failed} yorum yükseltilemedi`
                : 'Tüm yorumlar yöneticiye iletildi',
          });
        }

        if (result.failed > 0 && result.success === 0) {
          toast.error('Yorumlar işaretlenemedi', {
            description: 'Lütfen tekrar deneyin',
          });
        }

        return result;
      } catch (err) {
        logger.error(
          '[useCommentModeration] Bulk escalate failed',
          err instanceof Error ? err : new Error(String(err))
        );
        toast.error('Toplu yükseltme başarısız', {
          description: 'Bir hata oluştu, lütfen tekrar deneyin',
        });

        return {
          success: 0,
          failed: ids.length,
          total: ids.length,
          errors: ['Sunucu hatası'],
        };
      }
    },
    [fetchComments]
  );

  // ================================================
  // RETURN
  // ================================================

  return {
    // Data
    data,
    loading,
    error,

    // Filters
    filters,
    setFilters,
    updateFilter,
    clearFilters,

    // Pagination
    page,
    pageSize,
    totalPages,
    setPage: handleSetPage,
    setPageSize: handleSetPageSize,

    // Selection
    selectedComments,
    selectComment,
    deselectComment,
    selectAll,
    deselectAll,
    isSelected,

    // Actions
    approveComment,
    rejectComment,
    markAsSpam,
    escalateComment,
    flagComment,
    hasUserFlagged,
    bulkApprove,
    bulkReject,
    bulkMarkAsSpam,
    bulkEscalate,

    // Refresh
    refresh: fetchComments,
  };
}

export default useCommentModeration;
