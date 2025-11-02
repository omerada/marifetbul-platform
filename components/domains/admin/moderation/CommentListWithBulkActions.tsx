/**
 * ================================================
 * COMMENT LIST WITH BULK ACTIONS
 * ================================================
 * Enhanced comment list with checkbox selection
 * Integrates with BulkActionToolbar for moderation
 *
 * Sprint 1 - EPIC 2.1: Bulk Comment Actions
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React, { useState, useCallback } from 'react';
import { BulkActionToolbar } from './BulkActionToolbar';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Clock, User, MessageSquare } from 'lucide-react';
import type { BlogComment } from '@/types/blog';

// ================================================
// TYPES
// ================================================

export interface CommentListWithBulkActionsProps {
  comments: BlogComment[];
  loading?: boolean;
  onRefresh: () => void;
}

// ================================================
// COMPONENT
// ================================================

export function CommentListWithBulkActions({
  comments,
  loading = false,
  onRefresh,
}: CommentListWithBulkActionsProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // ================================================
  // SELECTION HANDLERS
  // ================================================

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        const allIds = comments.map((c) => Number(c.id));
        setSelectedIds(allIds);
      } else {
        setSelectedIds([]);
      }
    },
    [comments]
  );

  const handleSelectComment = useCallback(
    (commentId: number, checked: boolean) => {
      setSelectedIds((prev) => {
        if (checked) {
          return [...prev, commentId];
        } else {
          return prev.filter((id) => id !== commentId);
        }
      });
    },
    []
  );

  const handleClearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const handleInvertSelection = useCallback(() => {
    const allIds = comments.map((c) => Number(c.id));
    const inverted = allIds.filter((id) => !selectedIds.includes(id));
    setSelectedIds(inverted);
  }, [comments, selectedIds]);

  const handleActionComplete = useCallback(() => {
    setSelectedIds([]);
    onRefresh();
  }, [onRefresh]);

  // ================================================
  // COMPUTED
  // ================================================

  const allSelected =
    comments.length > 0 && selectedIds.length === comments.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  // ================================================
  // RENDER - Loading
  // ================================================

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-gray-200 p-4"
          >
            <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
            <div className="h-3 w-1/2 rounded bg-gray-200"></div>
          </div>
        ))}
      </div>
    );
  }

  // ================================================
  // RENDER - Empty
  // ================================================

  if (comments.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
        <MessageSquare className="mx-auto mb-3 h-12 w-12 text-gray-400" />
        <p className="text-sm text-gray-600">Henüz yorum yok</p>
      </div>
    );
  }

  // ================================================
  // RENDER - Main List
  // ================================================

  return (
    <div className="space-y-4">
      {/* Enhanced Select Header */}
      <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
        <input
          type="checkbox"
          ref={(el) => {
            if (el) {
              el.indeterminate = someSelected;
            }
          }}
          checked={allSelected}
          onChange={(e) => handleSelectAll(e.target.checked)}
          className="h-4 w-4 rounded border-2 border-gray-300"
        />
        <span className="text-sm font-medium text-gray-700">
          {selectedIds.length > 0
            ? `${selectedIds.length} yorum seçildi`
            : 'Tümünü Seç'}
        </span>

        {/* Quick Selection Actions */}
        {comments.length > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => handleSelectAll(true)}
              className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
            >
              Tümü
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={handleClearSelection}
              className="text-xs text-gray-600 hover:text-gray-700 hover:underline"
            >
              Hiçbiri
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={handleInvertSelection}
              className="text-xs text-purple-600 hover:text-purple-700 hover:underline"
            >
              Ters Çevir
            </button>
            <span className="ml-2 text-xs text-gray-500">
              ({comments.length} toplam)
            </span>
          </div>
        )}
      </div>

      {/* Comment List */}
      <div className="space-y-3">
        {comments.map((comment) => {
          const commentId = Number(comment.id);
          const isSelected = selectedIds.includes(commentId);
          const authorName =
            typeof comment.author === 'string'
              ? comment.author
              : comment.author.name;

          const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
            addSuffix: true,
            locale: tr,
          });

          return (
            <div
              key={comment.id}
              className={`rounded-lg border p-4 transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex gap-3">
                {/* Checkbox */}
                <div className="flex-shrink-0 pt-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) =>
                      handleSelectComment(commentId, e.target.checked)
                    }
                    className="h-4 w-4 rounded border-2 border-gray-300"
                  />
                </div>

                {/* Comment Content */}
                <div className="flex-1 space-y-2">
                  {/* Author & Time */}
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      <span className="font-medium text-gray-900">
                        {authorName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{timeAgo}</span>
                    </div>
                  </div>

                  {/* Comment Text */}
                  <p className="text-sm text-gray-800">{comment.content}</p>

                  {/* Post Link */}
                  {comment.postId && (
                    <a
                      href={`/blog/${comment.postId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                    >
                      <span>Gönderiyi görüntüle</span>
                      <span>→</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bulk Action Toolbar (Fixed Bottom) */}
      <BulkActionToolbar
        selectedIds={selectedIds}
        onActionComplete={handleActionComplete}
        onClearSelection={handleClearSelection}
      />
    </div>
  );
}

export default CommentListWithBulkActions;
