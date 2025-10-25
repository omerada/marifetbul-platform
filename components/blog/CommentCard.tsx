/**
 * ================================================
 * COMMENT CARD COMPONENT
 * ================================================
 * Displays a single comment with author info, actions, and replies
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React, { useState } from 'react';
import { Clock, ThumbsUp, MessageCircle, MoreVertical } from 'lucide-react';
import { CommentForm } from './CommentForm';
import { CommentEditForm } from './CommentEditForm';
import { CommentReportModal } from './CommentReportModal';
import type { BlogComment } from '@/lib/api/blog';
import { useAuth } from '@/hooks/shared/useAuth';
import { useCommentActions } from '@/hooks/business/useCommentActions';

// ================================================
// TYPES
// ================================================

export interface CommentCardProps {
  comment: BlogComment;
  postId: number;
  level?: number;
  maxLevel?: number;
  onReplySuccess?: (comment: BlogComment) => void;
  onCommentUpdated?: (commentId: number, newContent: string) => void;
  onCommentDeleted?: (commentId: number) => void;
  onEdit?: (commentId: number) => void;
  onDelete?: (commentId: number) => void;
  onReport?: (commentId: number) => void;
}

// ================================================
// COMPONENT
// ================================================

export function CommentCard({
  comment,
  postId,
  level = 0,
  maxLevel = 3,
  onReplySuccess,
  onCommentUpdated,
  onCommentDeleted,
  onEdit,
  onDelete,
  onReport,
}: CommentCardProps) {
  // ================================================
  // STATE
  // ================================================

  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [commentContent, setCommentContent] = useState(comment.content);
  const [showReportModal, setShowReportModal] = useState(false);

  // ================================================
  // HOOKS
  // ================================================

  const { user, isAuthenticated } = useAuth();
  const { deleteComment: deleteCommentAction } = useCommentActions();

  // ================================================
  // COMPUTED
  // ================================================

  const isAuthor = user?.id === comment.author.id;
  const canReply = level < maxLevel;
  const hasReplies = comment.replies && comment.replies.length > 0;

  // ================================================
  // HANDLERS
  // ================================================

  const handleReplySuccess = (newComment: BlogComment) => {
    setShowReplyForm(false);
    onReplySuccess?.(newComment);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setShowMenu(false);
    onEdit?.(comment.id);
  };

  const handleEditSuccess = (newContent: string) => {
    setCommentContent(newContent);
    setIsEditing(false);
    onCommentUpdated?.(comment.id, newContent);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };

  const handleDeleteClick = async () => {
    setShowMenu(false);

    if (!confirm('Bu yorumu silmek istediğinizden emin misiniz?')) {
      return;
    }

    const success = await deleteCommentAction(comment.id);

    if (success) {
      onCommentDeleted?.(comment.id);
      onDelete?.(comment.id);
    }
  };

  const handleReportClick = () => {
    setShowMenu(false);
    setShowReportModal(true);
    onReport?.(comment.id);
  };

  const handleReportSuccess = () => {
    // Optional: Show success message or refresh
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;

    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // ================================================
  // RENDER
  // ================================================

  return (
    <div className={`${level > 0 ? 'ml-8 md:ml-12' : ''}`}>
      <div className="group relative">
        {/* Left Border for Nested Comments */}
        {level > 0 && (
          <div className="absolute top-0 -left-4 h-full w-0.5 bg-gradient-to-b from-blue-200 to-transparent md:-left-6" />
        )}

        {/* Comment Content */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md">
          {/* Header */}
          <div className="mb-3 flex items-start justify-between">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-sm font-semibold text-white">
                {comment.author.fullName?.charAt(0).toUpperCase() ||
                  comment.author.username?.charAt(0).toUpperCase() ||
                  'U'}
              </div>

              {/* Author Info */}
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900">
                    {comment.author.fullName || comment.author.username}
                  </h4>
                  {isAuthor && (
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                      Siz
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <time dateTime={comment.createdAt}>
                    {formatDate(comment.createdAt)}
                  </time>
                  {comment.updatedAt !== comment.createdAt && (
                    <span className="ml-1">(düzenlendi)</span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions Menu */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Daha fazla seçenek"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>

                {showMenu && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                    />

                    {/* Menu */}
                    <div className="absolute top-8 right-0 z-20 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                      {isAuthor ? (
                        <>
                          <button
                            onClick={handleEditClick}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={handleDeleteClick}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                          >
                            Sil
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={handleReportClick}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Şikayet Et
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Comment Text or Edit Form */}
          {isEditing ? (
            <div className="mb-3">
              <CommentEditForm
                commentId={comment.id}
                initialContent={commentContent}
                onSuccess={handleEditSuccess}
                onCancel={handleEditCancel}
              />
            </div>
          ) : (
            <p className="mb-3 leading-relaxed whitespace-pre-wrap text-gray-700">
              {commentContent}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            {/* Like Button (Future) */}
            <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-blue-600">
              <ThumbsUp className="h-4 w-4" />
              <span>Beğen</span>
            </button>

            {/* Reply Button */}
            {canReply && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-blue-600"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Yanıtla</span>
              </button>
            )}

            {/* Show Replies Toggle */}
            {hasReplies && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="ml-auto text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                {showReplies ? 'Yanıtları Gizle' : 'Yanıtları Göster'} (
                {comment.replies.length})
              </button>
            )}
          </div>
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <div className="mt-3 ml-4 md:ml-8">
            <CommentForm
              postId={postId}
              parentCommentId={comment.id}
              onSuccess={handleReplySuccess}
              onCancel={() => setShowReplyForm(false)}
              placeholder={`${comment.author.fullName || comment.author.username} kullanıcısına yanıt yazın...`}
              autoFocus
              showGuidelines={false}
              compact
            />
          </div>
        )}

        {/* Replies */}
        {hasReplies && showReplies && (
          <div className="mt-4 space-y-4">
            {comment.replies.map((reply) => (
              <CommentCard
                key={reply.id}
                comment={reply}
                postId={postId}
                level={level + 1}
                maxLevel={maxLevel}
                onReplySuccess={onReplySuccess}
                onCommentUpdated={onCommentUpdated}
                onCommentDeleted={onCommentDeleted}
                onEdit={onEdit}
                onDelete={onDelete}
                onReport={onReport}
              />
            ))}
          </div>
        )}
      </div>

      {/* Report Modal */}
      <CommentReportModal
        commentId={comment.id}
        commentAuthor={comment.author.fullName || comment.author.username}
        commentPreview={commentContent}
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSuccess={handleReportSuccess}
      />
    </div>
  );
}

export default CommentCard;
