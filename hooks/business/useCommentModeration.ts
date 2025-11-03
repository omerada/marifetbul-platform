/**
 * ================================================
 * COMMENT MODERATION HOOK
 * ================================================
 * Business logic for comment moderation (admin)
 * Supports filtering, bulk operations, and moderation actions
 *
 * REFACTORED: Now uses moderatorService.production.ts for clean API calls
 *
 * @author MarifetBul Development Team
 * @version 2.0.0
 * @updated November 3, 2025
 */

import { useState, useCallback, useEffect } from 'react';
import { moderatorService } from '@/lib/infrastructure/services/api/moderatorService.production';
import { logger } from '@/lib/shared/utils/logger';
import { toast } from 'sonner';
import type { BlogComment } from '@/types/blog';

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
      // Note: Backend's getPendingItems returns basic info only
      // Full comment details would require a separate endpoint or enhancement
      const response = await moderatorService.getPendingItems(
        page - 1, // Backend uses 0-based indexing
        pageSize
      );

      // Transform pending items to BlogComment format
      // Note: Some fields may be incomplete - this is a limitation of current backend API
      const comments: BlogComment[] = response.data.items
        .filter((item) => item.type === 'COMMENT' || item.type === 'REVIEW')
        .map((item) => ({
          id: item.id,
          postId: item.relatedEntityId, // relatedEntityId is the blog post/order id
          postTitle: 'Loading...', // Not available in pending items API
          content: item.contentPreview,
          author: {
            id: item.reporterUsername || 'unknown', // Limited author info
            name: item.reporterUsername || 'Anonim',
            username: item.reporterUsername || 'unknown',
            avatar: undefined,
          },
          authorId: item.reporterUsername || 'unknown',
          createdAt: item.submittedAt || item.createdAt,
          status: item.status as unknown as BlogComment['status'], // Convert pending status to comment status
          reportCount: item.flagCount || 0,
          // Additional fields
          updatedAt: item.createdAt,
          likes: 0,
          replies: [],
        }));

      setData({
        comments,
        total: response.data.totalItems,
        pending: response.data.totalItems, // All items in queue are pending
        approved: 0,
        rejected: 0,
        spam: 0,
      });

      setTotalPages(response.data.totalPages);

      logger.debug('[useCommentModeration] Comments fetched', {
        count: comments.length,
        total: response.data.totalItems,
        page,
      });
    } catch (err) {
      logger.error('[useCommentModeration] Failed to fetch comments', err);
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
      await moderatorService.approveComment(id);

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
      logger.error('[useCommentModeration] Failed to approve comment', err);
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
      await moderatorService.rejectComment(
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
      logger.error('[useCommentModeration] Failed to reject comment', err);
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
      await moderatorService.markCommentAsSpam(id);

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
      logger.error('[useCommentModeration] Failed to mark as spam', err);
      setError('Yorum spam olarak işaretlenirken bir hata oluştu');
      toast.error('İşlem başarısız', {
        description: 'Yorum spam olarak işaretlenemedi',
      });
      return false;
    }
  }, []);

  // TODO: Backend'de comment escalation endpoint'i yok
  // Dispute escalation var ama comment escalation için endpoint eklenecek
  // Şimdilik bu özellik devre dışı
  const escalateComment = useCallback(
    async (
      id: string,
      reason: string,
      priority: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM'
    ): Promise<boolean> => {
      logger.warn(
        '[useCommentModeration] Escalate feature not implemented yet',
        { id, reason, priority }
      );
      toast.error('Bu özellik henüz aktif değil', {
        description: 'Yorum yükseltme özelliği yakında eklenecek',
      });
      return false;
    },
    []
  );

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
        const response = await moderatorService.bulkApproveComments(ids);

        // Extract results from backend response
        const result = {
          success: response.data.successCount,
          failed: response.data.failureCount,
          total: response.data.totalProcessed,
          errors: response.data.failures?.map((f) => f.errorMessage),
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
        logger.error('[useCommentModeration] Bulk approve failed', err);
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
        const response = await moderatorService.bulkRejectComments(
          ids,
          'Moderatör tarafından toplu reddedildi'
        );

        // Extract results from backend response
        const result = {
          success: response.data.successCount,
          failed: response.data.failureCount,
          total: response.data.totalProcessed,
          errors: response.data.failures?.map((f) => f.errorMessage),
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
        logger.error('[useCommentModeration] Bulk reject failed', err);
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
        const response = await moderatorService.bulkMarkCommentsAsSpam(ids);

        // Extract results from backend response
        const result = {
          success: response.data.successCount,
          failed: response.data.failureCount,
          total: response.data.totalProcessed,
          errors: response.data.failures?.map((f) => f.errorMessage),
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
        logger.error('[useCommentModeration] Bulk spam marking failed', err);
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

  // TODO: Backend'de comment escalation endpoint'i yok
  // Şimdilik bu özellik devre dışı
  const bulkEscalate = useCallback(
    async (
      ids: string[],
      reason: string,
      priority: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM'
    ): Promise<BulkActionResult> => {
      logger.warn(
        '[useCommentModeration] Bulk escalate feature not implemented yet',
        { count: ids.length, reason, priority }
      );
      toast.error('Bu özellik henüz aktif değil', {
        description: 'Toplu yükseltme özelliği yakında eklenecek',
      });

      return {
        success: 0,
        failed: ids.length,
        total: ids.length,
        errors: ['Özellik henüz aktif değil'],
      };
    },
    []
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
    bulkApprove,
    bulkReject,
    bulkMarkAsSpam,
    bulkEscalate,

    // Refresh
    refresh: fetchComments,
  };
}

export default useCommentModeration;
