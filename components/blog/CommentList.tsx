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
import { CommentCard } from './CommentCard';
import { CommentForm } from './CommentForm';
import { blogApi } from '@/lib/api/blog';
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
      console.error('Failed to fetch comments:', err);
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
    // Refresh comments to show new reply
    fetchComments(true);
  };

  const handleCommentUpdated = (commentId: number, newContent: string) => {
    // Update comment in list optimistically
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              content: newContent,
              updatedAt: new Date().toISOString(),
            }
          : comment
      )
    );
  };

  const handleCommentDeleted = (commentId: number) => {
    // Remove from list
    setComments((prev) => removeCommentById(prev, commentId));
  };

  // Recursive function to remove comment from nested structure
  const removeCommentById = (
    commentsList: BlogComment[],
    idToRemove: number
  ): BlogComment[] => {
    return commentsList
      .filter((comment) => comment.id !== idToRemove)
      .map((comment) => ({
        ...comment,
        replies: comment.replies
          ? removeCommentById(comment.replies, idToRemove)
          : [],
      }));
  };

  const handleEdit = (commentId: number) => {
    // Edit is handled inline in CommentCard
    console.log('Edit comment:', commentId);
  };

  const handleDelete = async (commentId: number) => {
    // Delete is handled in CommentCard, this is just for legacy support
    console.log('Delete comment:', commentId);
  };

  const handleReport = (commentId: number) => {
    // TODO: Implement report functionality in Day 5-6
    console.log('Report comment:', commentId);
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
            Yorumlar ({comments.length})
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
            <CommentCard
              key={comment.id}
              comment={comment}
              postId={postId}
              onReplySuccess={handleReplySuccess}
              onCommentUpdated={handleCommentUpdated}
              onCommentDeleted={handleCommentDeleted}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onReport={handleReport}
            />
          ))}
        </div>
      )}

      {/* Load More (Future Implementation) */}
      {/* TODO: Add pagination in Day 3-4 */}
    </div>
  );
}

export default CommentList;
