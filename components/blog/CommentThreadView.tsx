/**
 * ================================================
 * COMMENT THREAD VIEW COMPONENT
 * ================================================
 * Recursive component for displaying nested comment threads
 * Supports collapsing, expanding, and max depth control
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import { CommentCard } from './CommentCard';
import { CommentReplyForm } from './CommentReplyForm';
import type { BlogComment } from '@/lib/api/blog';

// ================================================
// TYPES
// ================================================

export interface CommentThreadViewProps {
  comment: BlogComment;
  postId: number;
  depth?: number;
  maxDepth?: number;
  onReply?: (reply: BlogComment) => void;
  onReport?: (commentId: number) => void;
  onEdit?: (commentId: number) => void;
  onDelete?: (commentId: number) => void;
  currentUserId?: string;
  isAdmin?: boolean;
}

// ================================================
// COMPONENT
// ================================================

export function CommentThreadView({
  comment,
  postId,
  depth = 0,
  maxDepth = 5,
  onReply,
  onReport,
  onEdit,
  onDelete,
  currentUserId,
  isAdmin = false,
}: CommentThreadViewProps) {
  // ================================================
  // STATE
  // ================================================

  const [isExpanded, setIsExpanded] = useState(true);
  const [showReplyForm, setShowReplyForm] = useState(false);

  // ================================================
  // COMPUTED
  // ================================================

  const hasReplies = comment.replies && comment.replies.length > 0;
  const replyCount = comment.replies?.length || 0;
  const canReply = depth < maxDepth;

  const authorName =
    typeof comment.author === 'string'
      ? comment.author
      : comment.author.fullName || comment.author.username;

  const isAuthor = currentUserId === comment.author.id;
  const canEdit = isAuthor || isAdmin;
  const canDelete = isAuthor || isAdmin;

  // ================================================
  // HANDLERS
  // ================================================

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleReplyClick = () => {
    if (canReply) {
      setShowReplyForm(!showReplyForm);
    }
  };

  const handleReplySuccess = (reply: BlogComment) => {
    setShowReplyForm(false);
    onReply?.(reply);
  };

  const handleReport = () => {
    onReport?.(comment.id);
  };

  const handleEdit = () => {
    onEdit?.(comment.id);
  };

  const handleDelete = () => {
    onDelete?.(comment.id);
  };

  // ================================================
  // RENDER
  // ================================================

  return (
    <div
      className={`relative ${depth > 0 ? 'border-l-2 border-gray-200 pl-4' : ''}`}
      data-comment-depth={depth}
    >
      {/* Main Comment Card */}
      <div className="mb-2">
        <CommentCard
          comment={comment}
          onReply={canReply ? handleReplyClick : undefined}
          onReport={handleReport}
          onEdit={canEdit ? handleEdit : undefined}
          onDelete={canDelete ? handleDelete : undefined}
          showReplyButton={canReply}
          depth={depth}
        />
      </div>

      {/* Reply Form */}
      {showReplyForm && canReply && (
        <div className="mb-4">
          <CommentReplyForm
            postId={postId}
            parentCommentId={comment.id}
            parentAuthor={authorName}
            onSuccess={handleReplySuccess}
            onCancel={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {/* Nested Replies */}
      {hasReplies && (
        <div className="mt-2">
          {/* Collapse/Expand Button */}
          {replyCount > 0 && (
            <button
              onClick={handleToggleExpand}
              className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
              aria-label={isExpanded ? 'Yanıtları gizle' : 'Yanıtları göster'}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  <span>{replyCount} yanıtı gizle</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  <span>{replyCount} yanıtı göster</span>
                </>
              )}
            </button>
          )}

          {/* Replies List */}
          {isExpanded && (
            <div className="space-y-2">
              {comment.replies.map((reply) => (
                <CommentThreadView
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                  onReply={onReply}
                  onReport={onReport}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  currentUserId={currentUserId}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Max Depth Warning */}
      {depth >= maxDepth && hasReplies && (
        <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
          <MessageCircle className="mr-2 inline h-4 w-4" />
          Bu konuşma çok derinleşti. Daha fazla yanıt görmek için yorumu
          genişletin.
        </div>
      )}
    </div>
  );
}
