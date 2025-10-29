/**
 * ================================================
 * COMMENT LIST COMPONENT
 * ================================================
 * Displays list of comments with sorting and pagination
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, Loader2, AlertCircle } from 'lucide-react';
import { CommentThreadView } from './CommentThreadView';
import { CommentForm } from './CommentForm';
import { ReportCommentModal } from './ReportCommentModal';
import { blogApi } from '@/lib/api/blog';
import { logger } from '@/lib/shared/utils/logger';
import type { BlogComment } from '@/lib/api/blog';

// ================================================
// TYPES
// ================================================

export interface CommentListProps {
  postId: number;
  initialComments?: BlogComment[];
  autoRefresh?: boolean;
  refreshInterval?: number;
}

type SortOption = 'newest' | 'oldest';

// ================================================
// COMPONENT
// ================================================

export function CommentList({
  postId,
  initialComments = [],
  autoRefresh = false,
  refreshInterval = 60000, // 1 minute
}: CommentListProps) {
  // ================================================
  // STATE
  // ================================================

  const [comments, setComments] = useState<BlogComment[]>(initialComments);
  const [isLoading, setIsLoading] = useState(!initialComments.length);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showForm, setShowForm] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportingCommentId, setReportingCommentId] = useState<number | null>(
    null
  );

  // ================================================
  // COMPUTED
  // ================================================

  // Count total comments including nested replies
  const countTotalComments = (commentsList: BlogComment[]): number => {
    return commentsList.reduce((total, comment) => {
      const replyCount = comment.replies
        ? countTotalComments(comment.replies)
        : 0;
      return total + 1 + replyCount;
    }, 0);
  };

  const totalCommentCount = countTotalComments(comments);

  // ================================================
  // EFFECTS
  // ================================================

  // Initial fetch
  useEffect(() => {
    if (!initialComments.length) {
      fetchComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchComments(true);
    }, refreshInterval);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, refreshInterval, postId]);

  // ================================================
  // HANDLERS
  // ================================================

  const fetchComments = async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await blogApi.getApprovedComments(postId);
      // Handle PageResponse structure
      const data = Array.isArray(response) ? response : response.content || [];
      setComments(data);
    } catch (err) {
      logger.error('Failed to fetch comments', { postId, error: err });
      setError('Yorumlar yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommentSuccess = (_comment: BlogComment) => {
    setShowForm(false);
    // Don't add to list since it needs moderation
    // Just refresh after a short delay
    setTimeout(() => {
      fetchComments(true);
    }, 1000);
  };

  const handleReplySuccess = (_comment: BlogComment) => {
    // Refresh comments to show new reply (after moderation)
    setTimeout(() => {
      fetchComments(true);
    }, 1000);
  };

  const handleEdit = (_commentId: number) => {
    // Edit is handled inline in CommentCard
    // No-op: editing is managed within CommentCard component
  };

  const handleDelete = async (_commentId: number) => {
    // Delete is handled in CommentCard, this is just for legacy support
    // No-op: deletion is managed within CommentCard component
  };

  const handleReport = (commentId: number) => {
    setReportingCommentId(commentId);
    setReportModalOpen(true);
  };

  // ================================================
  // COMPUTED
  // ================================================

  const sortedComments = [...comments].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
  });

  // ================================================
  // RENDER - Loading
  // ================================================

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="mb-4 h-12 w-12 animate-spin text-blue-600" />
          <p className="text-gray-500">Yorumlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  // ================================================
  // RENDER - Error
  // ================================================

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-red-600" />
          <div>
            <h4 className="font-semibold text-red-900">Hata</h4>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
        <button
          onClick={() => fetchComments()}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  // ================================================
  // RENDER - Main
  // ================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Yorumlar ({totalCommentCount})
          </h2>
        </div>

        {/* Sort Dropdown */}
        {comments.length > 0 && (
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="newest">En Yeni</option>
            <option value="oldest">En Eski</option>
          </select>
        )}
      </div>

      {/* Comment Form Toggle */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-4 text-left text-gray-500 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
        >
          Yorum yazmak için tıklayın...
        </button>
      )}

      {/* Comment Form */}
      {showForm && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <CommentForm
            postId={postId}
            onSuccess={handleCommentSuccess}
            onCancel={() => setShowForm(false)}
            autoFocus
          />
        </div>
      )}

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white py-12 text-center">
          <MessageCircle className="mx-auto mb-4 h-16 w-16 text-gray-300" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Henüz yorum yapılmamış
          </h3>
          <p className="text-sm text-gray-500">İlk yorumu sen yap!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedComments.map((comment) => (
            <CommentThreadView
              key={comment.id}
              comment={comment}
              postId={postId}
              onReply={handleReplySuccess}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onReport={handleReport}
            />
          ))}
        </div>
      )}

      {/* Pagination - Production Ready: Implement with backend pagination */}
      {/* Expected params: page, limit, sort */}
      {/* {data.total > limit && (
        <CommentPagination
          currentPage={page}
          totalPages={Math.ceil(data.total / limit)}
          onPageChange={handlePageChange}
        />
      )} */}

      {/* Report Comment Modal */}
      {reportingCommentId && (
        <ReportCommentModal
          commentId={reportingCommentId}
          isOpen={reportModalOpen}
          onClose={() => {
            setReportModalOpen(false);
            setReportingCommentId(null);
          }}
          onReportSubmitted={() => {
            // Optionally refresh comments or show a message
            logger.info('Comment reported successfully', {
              commentId: reportingCommentId,
            });
          }}
        />
      )}
    </div>
  );
}

export default CommentList;
