/**
 * ================================================
 * RECENT COMMENTS PREVIEW COMPONENT
 * ================================================
 * Dashboard widget showing recent comments preview
 * Provides quick overview of latest activity
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { MessageSquare, ArrowRight, Clock, AlertTriangle } from 'lucide-react';
import type { BlogComment } from '@/types/blog';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

// ================================================
// TYPES
// ================================================

export interface RecentCommentsPreviewProps {
  comments?: BlogComment[];
  loading?: boolean;
  maxItems?: number;
  showStatus?: boolean;
  onViewAll?: () => void;
}

// ================================================
// COMPONENT
// ================================================

export function RecentCommentsPreview({
  comments = [],
  loading = false,
  maxItems = 5,
  showStatus = true,
  onViewAll,
}: RecentCommentsPreviewProps) {
  // ================================================
  // COMPUTED
  // ================================================

  const displayComments = comments.slice(0, maxItems);

  // ================================================
  // RENDER - Loading
  // ================================================

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-6 w-32 animate-pulse rounded bg-gray-200"></div>
          <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse border-b border-gray-100 pb-3"
            >
              <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
              <div className="h-3 w-1/2 rounded bg-gray-200"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ================================================
  // RENDER - No Comments
  // ================================================

  if (displayComments.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-6 flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Son Yorumlar</h3>
        </div>
        <div className="py-8 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">Henüz yorum yok</p>
        </div>
      </div>
    );
  }

  // ================================================
  // RENDER - Main
  // ================================================

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Son Yorumlar</h3>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <span>Tümünü Gör</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        {displayComments.map((comment) => {
          const authorName =
            typeof comment.author === 'string'
              ? comment.author
              : comment.author.name;

          const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
            addSuffix: true,
            locale: tr,
          });

          const isPending =
            comment.approved === undefined || comment.approved === null;
          const isApproved = comment.approved === true;
          const isRejected = comment.approved === false;

          return (
            <div
              key={comment.id}
              className="border-b border-gray-100 pb-3 last:border-0"
            >
              {/* Comment Header */}
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {authorName}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{timeAgo}</span>
                  </div>
                </div>

                {/* Status Badge */}
                {showStatus && (
                  <div>
                    {isPending && (
                      <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                        <AlertTriangle className="h-3 w-3" />
                        Bekliyor
                      </span>
                    )}
                    {isApproved && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        Onaylı
                      </span>
                    )}
                    {isRejected && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                        Reddedildi
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Comment Content */}
              <p className="line-clamp-2 text-sm text-gray-600">
                {comment.content}
              </p>

              {/* Post Link (if available) */}
              {comment.postId && (
                <Link
                  href={`/blog/${comment.postId}`}
                  className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                >
                  <span>Gönderiyi görüntüle</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Action */}
      {comments.length > maxItems && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <Link
            href="/admin/moderation/comments"
            className="flex items-center justify-center gap-2 rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            <span>+{comments.length - maxItems} yorum daha</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

export default RecentCommentsPreview;
