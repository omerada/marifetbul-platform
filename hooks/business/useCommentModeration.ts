/**
 * ================================================
 * COMMENT MODERATION HOOK
 * ================================================
 * Business logic for comment moderation (admin)
 * Supports filtering, bulk operations, and moderation actions
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { BLOG_ENDPOINTS } from '@/lib/api/endpoints';
import { logger } from '@/lib/shared/utils/logger';
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
  bulkApprove: (ids: string[]) => Promise<BulkActionResult>;
  bulkReject: (ids: string[]) => Promise<BulkActionResult>;
  bulkMarkAsSpam: (ids: string[]) => Promise<BulkActionResult>;

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

      // Fetch from API
      // Note: Using existing blog comments endpoint until admin endpoint is added
      const response = await apiClient.get<{
        content: BlogComment[];
        totalElements: number;
        totalPages: number;
        stats: {
          pending: number;
          approved: number;
          rejected: number;
          spam: number;
        };
      }>(`/blog/comments/admin?${params.toString()}`);

      setData({
        comments: response.content || [],
        total: response.totalElements || 0,
        pending: response.stats?.pending || 0,
        approved: response.stats?.approved || 0,
        rejected: response.stats?.rejected || 0,
        spam: response.stats?.spam || 0,
      });

      setTotalPages(response.totalPages || 1);
    } catch (err) {
      logger.error('Failed to fetch comments:', err);
      setError('Yorumlar yüklenirken bir hata oluştu');
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
      await apiClient.post(BLOG_ENDPOINTS.APPROVE_COMMENT(id));

      // Update local data optimistically
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: prev.comments.map((c) =>
            c.id === id ? { ...c, approved: true } : c
          ),
          pending: Math.max(0, prev.pending - 1),
          approved: prev.approved + 1,
        };
      });

      return true;
    } catch (err) {
      logger.error('Failed to approve comment:', err);
      setError('Yorum onaylanırken bir hata oluştu');
      return false;
    }
  }, []);

  const rejectComment = useCallback(async (id: string): Promise<boolean> => {
    try {
      await apiClient.post(BLOG_ENDPOINTS.REJECT_COMMENT(id));

      // Update local data optimistically
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: prev.comments.map((c) =>
            c.id === id ? { ...c, approved: false } : c
          ),
          pending: Math.max(0, prev.pending - 1),
          rejected: prev.rejected + 1,
        };
      });

      return true;
    } catch (err) {
      logger.error('Failed to reject comment:', err);
      setError('Yorum reddedilirken bir hata oluştu');
      return false;
    }
  }, []);

  const markAsSpam = useCallback(async (id: string): Promise<boolean> => {
    try {
      await apiClient.post(BLOG_ENDPOINTS.SPAM_COMMENT(id));

      // Update local data optimistically
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: prev.comments.filter((c) => c.id !== id),
          pending: Math.max(0, prev.pending - 1),
          spam: prev.spam + 1,
        };
      });

      return true;
    } catch (err) {
      logger.error('Failed to mark as spam:', err);
      setError('Yorum spam olarak işaretlenirken bir hata oluştu');
      return false;
    }
  }, []);

  // ================================================
  // BULK ACTIONS
  // ================================================

  const bulkApprove = useCallback(
    async (ids: string[]): Promise<BulkActionResult> => {
      const results = await Promise.allSettled(
        ids.map((id) => apiClient.post(BLOG_ENDPOINTS.APPROVE_COMMENT(id)))
      );

      const success = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;
      const errors = results
        .filter((r) => r.status === 'rejected')
        .map(
          (r) =>
            (r as PromiseRejectedResult).reason?.message || 'Bilinmeyen hata'
        );

      // Refresh data after bulk operation
      await fetchComments();
      setSelectedComments(new Set());

      return {
        success,
        failed,
        total: ids.length,
        errors: errors.length > 0 ? errors : undefined,
      };
    },
    [fetchComments]
  );

  const bulkReject = useCallback(
    async (ids: string[]): Promise<BulkActionResult> => {
      const results = await Promise.allSettled(
        ids.map((id) => apiClient.post(BLOG_ENDPOINTS.REJECT_COMMENT(id)))
      );

      const success = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;
      const errors = results
        .filter((r) => r.status === 'rejected')
        .map(
          (r) =>
            (r as PromiseRejectedResult).reason?.message || 'Bilinmeyen hata'
        );

      // Refresh data after bulk operation
      await fetchComments();
      setSelectedComments(new Set());

      return {
        success,
        failed,
        total: ids.length,
        errors: errors.length > 0 ? errors : undefined,
      };
    },
    [fetchComments]
  );

  const bulkMarkAsSpam = useCallback(
    async (ids: string[]): Promise<BulkActionResult> => {
      const results = await Promise.allSettled(
        ids.map((id) => apiClient.post(BLOG_ENDPOINTS.SPAM_COMMENT(id)))
      );

      const success = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;
      const errors = results
        .filter((r) => r.status === 'rejected')
        .map(
          (r) =>
            (r as PromiseRejectedResult).reason?.message || 'Bilinmeyen hata'
        );

      // Refresh data after bulk operation
      await fetchComments();
      setSelectedComments(new Set());

      return {
        success,
        failed,
        total: ids.length,
        errors: errors.length > 0 ? errors : undefined,
      };
    },
    [fetchComments]
  ); // ================================================
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
    bulkApprove,
    bulkReject,
    bulkMarkAsSpam,

    // Refresh
    refresh: fetchComments,
  };
}

export default useCommentModeration;
