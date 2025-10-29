/**
 * ================================================
 * COMMENT MODERATION SUMMARY COMPONENT
 * ================================================
 * Dashboard widget showing moderation statistics
 * Displays pending count, recent activity, and actions
 * Real-time updates via useCommentModeration hook
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 3: Production Readiness
 */

'use client';

import React from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { useCommentModeration } from '@/hooks/business/useCommentModeration';
import { DashboardWidgetSkeleton } from '../moderation/LoadingSkeletons';

// ================================================
// TYPES
// ================================================

export interface CommentModerationSummaryProps {
  /**
   * Maximum number of recent comments to display
   * @default 5
   */
  maxRecentComments?: number;

  /**
   * Whether to show the view all button
   * @default true
   */
  showViewAllButton?: boolean;

  /**
   * Custom class name for styling
   */
  className?: string;
}

// ================================================
// COMPONENT
// ================================================

export function CommentModerationSummary({
  maxRecentComments = 5,
  showViewAllButton = true,
  className = '',
}: CommentModerationSummaryProps) {
  // ================================================
  // HOOKS
  // ================================================

  const moderation = useCommentModeration();

  // ================================================
  // RENDER - Loading
  // ================================================

  if (moderation.loading && !moderation.data) {
    return <DashboardWidgetSkeleton />;
  }

  // ================================================
  // RENDER - Error
  // ================================================

  if (moderation.error) {
    return (
      <div
        className={`rounded-lg border border-red-200 bg-red-50 p-6 ${className}`}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-900">
              Veri Yüklenirken Hata
            </h3>
            <p className="mt-1 text-sm text-red-700">{moderation.error}</p>
            <button
              onClick={() => moderation.refresh()}
              className="mt-3 text-sm font-medium text-red-600 hover:text-red-700"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  const data = moderation.data;
  if (!data) return null;

  const recentComments = data.comments.slice(0, maxRecentComments);

  // ================================================
  // RENDER - Main
  // ================================================

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Pending Comments */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Bekleyen Yorumlar
              </p>
              <p className="mt-2 text-3xl font-bold text-orange-600">
                {data.pending}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          {data.pending > 0 && (
            <Link
              href="/admin/moderation?status=PENDING"
              className="mt-4 flex items-center text-sm font-medium text-orange-600 hover:text-orange-700"
            >
              İncele
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          )}
        </div>

        {/* Approved Comments */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Onaylanan</p>
              <p className="mt-2 text-3xl font-bold text-green-600">
                {data.approved}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <Link
            href="/admin/moderation?status=APPROVED"
            className="mt-4 flex items-center text-sm font-medium text-green-600 hover:text-green-700"
          >
            Görüntüle
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        {/* Rejected Comments */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Reddedilen</p>
              <p className="mt-2 text-3xl font-bold text-red-600">
                {data.rejected}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <Link
            href="/admin/moderation?status=REJECTED"
            className="mt-4 flex items-center text-sm font-medium text-red-600 hover:text-red-700"
          >
            Görüntüle
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        {/* Spam Comments */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Spam</p>
              <p className="mt-2 text-3xl font-bold text-gray-600">
                {data.spam}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <AlertTriangle className="h-6 w-6 text-gray-600" />
            </div>
          </div>
          <Link
            href="/admin/moderation?status=SPAM"
            className="mt-4 flex items-center text-sm font-medium text-gray-600 hover:text-gray-700"
          >
            Görüntüle
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Son Yorumlar
              </h3>
            </div>
            {data.pending > 0 && (
              <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-600">
                {data.pending} Bekliyor
              </span>
            )}
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {recentComments.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Henüz yorum bulunmuyor
              </p>
            </div>
          ) : (
            recentComments.map((comment) => (
              <div
                key={comment.id}
                className="px-6 py-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">
                        {typeof comment.author === 'string'
                          ? comment.author
                          : comment.author.name || 'Anonim'}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          comment.approved === null ||
                          comment.approved === undefined
                            ? 'bg-orange-100 text-orange-700'
                            : comment.approved === true
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {comment.approved === null ||
                        comment.approved === undefined
                          ? 'Bekliyor'
                          : comment.approved === true
                            ? 'Onaylandı'
                            : 'Reddedildi'}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                      {comment.content}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Post ID: {comment.postId}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                    {(comment.approved === null ||
                      comment.approved === undefined) && (
                      <Link
                        href={`/admin/moderation?commentId=${comment.id}`}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700"
                      >
                        İşlem Yap
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {showViewAllButton && data.total > maxRecentComments && (
          <div className="border-t border-gray-200 px-6 py-4">
            <Link
              href="/admin/moderation"
              className="flex items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              <TrendingUp className="h-4 w-4" />
              Tümünü Görüntüle ({data.total} yorum)
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// ================================================
// DEFAULT EXPORT
// ================================================

const CommentModerationSummaryComponent = CommentModerationSummary;
export default CommentModerationSummaryComponent;
