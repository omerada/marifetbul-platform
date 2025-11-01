/**
 * ================================================
 * COMMENT MODERATION PAGE
 * ================================================
 * Blog comment moderation interface with bulk actions
 *
 * Sprint 2.2: Comment Moderation Queue
 * @version 3.0.0
 * @author MarifetBul Development Team
 */

'use client';

import React, { useState } from 'react';
import { logger } from '@/lib/shared/utils/logger';
import { Check, X, Flag, Search, Loader2 } from 'lucide-react';
import {
  usePendingComments,
  useCommentsByStatus,
  useBulkCommentActions,
  useCommentActions,
} from '@/hooks';
import { CommentStatus } from '@/types/business/moderation';

type CommentStatusFilter = CommentStatus | 'ALL';

export default function CommentModerationPage() {
  const [selectedStatus, setSelectedStatus] = useState<CommentStatusFilter>(
    CommentStatus.PENDING
  );
  const [selectedComments, setSelectedComments] = useState<Set<string>>(
    new Set()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 20;

  // Fetch comments based on status
  const {
    comments: pendingComments,
    total: pendingTotal,
    isLoading: pendingLoading,
  } = usePendingComments(page, pageSize);

  const {
    comments: approvedComments,
    total: approvedTotal,
    isLoading: approvedLoading,
  } = useCommentsByStatus(CommentStatus.APPROVED, page, pageSize);

  const {
    comments: rejectedComments,
    total: rejectedTotal,
    isLoading: rejectedLoading,
  } = useCommentsByStatus(CommentStatus.REJECTED, page, pageSize);

  const {
    comments: spamComments,
    total: spamTotal,
    isLoading: spamLoading,
  } = useCommentsByStatus(CommentStatus.SPAM, page, pageSize);

  // Bulk actions
  const {
    bulkApprove,
    bulkReject,
    bulkSpam,
    isProcessing: isBulkProcessing,
  } = useBulkCommentActions();

  // Single actions
  const {
    approve,
    reject,
    spam,
    isProcessing: isSingleProcessing,
  } = useCommentActions();

  // Get current comments based on filter
  const getCurrentComments = () => {
    switch (selectedStatus) {
      case CommentStatus.PENDING:
        return {
          comments: pendingComments,
          total: pendingTotal,
          isLoading: pendingLoading,
        };
      case CommentStatus.APPROVED:
        return {
          comments: approvedComments,
          total: approvedTotal,
          isLoading: approvedLoading,
        };
      case CommentStatus.REJECTED:
        return {
          comments: rejectedComments,
          total: rejectedTotal,
          isLoading: rejectedLoading,
        };
      case CommentStatus.SPAM:
        return {
          comments: spamComments,
          total: spamTotal,
          isLoading: spamLoading,
        };
      case 'ALL':
        return {
          comments: [
            ...pendingComments,
            ...approvedComments,
            ...rejectedComments,
            ...spamComments,
          ],
          total: pendingTotal + approvedTotal + rejectedTotal + spamTotal,
          isLoading:
            pendingLoading || approvedLoading || rejectedLoading || spamLoading,
        };
      default:
        return {
          comments: pendingComments,
          total: pendingTotal,
          isLoading: pendingLoading,
        };
    }
  };

  const { comments, total, isLoading } = getCurrentComments();

  // Filter by search query
  const filteredComments = searchQuery
    ? comments.filter(
        (comment) =>
          comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          comment.authorName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : comments;

  const handleSelectAll = () => {
    if (selectedComments.size === filteredComments.length) {
      setSelectedComments(new Set());
    } else {
      setSelectedComments(new Set(filteredComments.map((c) => c.id)));
    }
  };

  const handleSelectComment = (id: string) => {
    const newSelected = new Set(selectedComments);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedComments(newSelected);
  };

  const handleBulkApprove = async () => {
    try {
      await bulkApprove(Array.from(selectedComments));
      setSelectedComments(new Set());
    } catch (error) {
      logger.error('Bulk approve failed:', error);
    }
  };

  const handleBulkReject = async () => {
    try {
      await bulkReject(Array.from(selectedComments));
      setSelectedComments(new Set());
    } catch (error) {
      logger.error('Bulk reject failed:', error);
    }
  };

  const handleBulkSpam = async () => {
    try {
      await bulkSpam(Array.from(selectedComments));
      setSelectedComments(new Set());
    } catch (error) {
      logger.error('Bulk spam failed:', error);
    }
  };

  const handleSingleApprove = async (id: string) => {
    try {
      await approve(id);
    } catch (error) {
      logger.error('Approve failed:', error);
    }
  };

  const handleSingleReject = async (id: string) => {
    try {
      await reject(id);
    } catch (error) {
      logger.error('Reject failed:', error);
    }
  };

  const handleSingleSpam = async (id: string) => {
    try {
      await spam(id);
    } catch (error) {
      logger.error('Spam failed:', error);
    }
  };

  const isProcessing = isBulkProcessing || isSingleProcessing;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Yorum Moderasyonu</h1>
        <p className="mt-2 text-gray-600">
          Blog yorumlarını inceleyin ve onaylayın
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto">
          {(
            [
              'ALL',
              CommentStatus.PENDING,
              CommentStatus.APPROVED,
              CommentStatus.REJECTED,
              CommentStatus.SPAM,
            ] as const
          ).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                selectedStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'ALL' && 'Tümü'}
              {status === CommentStatus.PENDING && 'Bekleyen'}
              {status === CommentStatus.APPROVED && 'Onaylı'}
              {status === CommentStatus.REJECTED && 'Reddedilen'}
              {status === CommentStatus.SPAM && 'Spam'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Yorum ara..."
            className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedComments.size > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-medium text-blue-900">
            {selectedComments.size} yorum seçildi
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleBulkApprove}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
            >
              <Check className="h-4 w-4" />
              Onayla
            </button>
            <button
              onClick={handleBulkReject}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
            >
              <X className="h-4 w-4" />
              Reddet
            </button>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-gray-200 p-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={
                selectedComments.size === comments.length && comments.length > 0
              }
              onChange={handleSelectAll}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">
              Tümünü Seç
            </span>
          </label>
        </div>

        {/* Comments */}
        <div className="divide-y divide-gray-200">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filteredComments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchQuery
                ? 'Arama kriterlerine uygun yorum bulunamadı'
                : 'Gösterilecek yorum bulunmuyor'}
            </div>
          ) : (
            filteredComments.map((comment) => (
              <div key={comment.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedComments.has(comment.id)}
                    onChange={() => handleSelectComment(comment.id)}
                    className="mt-1 h-4 w-4 rounded border-gray-300"
                    disabled={isProcessing}
                  />

                  {/* Avatar */}
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-200">
                    <span className="text-sm font-medium text-gray-600">
                      {comment.authorName.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {comment.authorName}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.createdAt).toLocaleString('tr-TR')}
                      </span>
                      {comment.flaggedCount > 0 && (
                        <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                          <Flag className="h-3 w-3" />
                          {comment.flaggedCount} şikayet
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          comment.status === CommentStatus.PENDING
                            ? 'bg-yellow-100 text-yellow-700'
                            : comment.status === CommentStatus.APPROVED
                              ? 'bg-green-100 text-green-700'
                              : comment.status === CommentStatus.REJECTED
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {comment.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      Blog: {comment.postTitle}
                    </p>
                    <p className="mt-2 text-gray-900">{comment.content}</p>
                    {comment.flagReasons && comment.flagReasons.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {comment.flagReasons.map((reason, index) => (
                          <span
                            key={index}
                            className="rounded bg-red-50 px-2 py-1 text-xs text-red-600"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSingleApprove(comment.id)}
                      disabled={isProcessing}
                      className="rounded-lg p-2 text-green-600 hover:bg-green-50 disabled:opacity-50"
                      title="Onayla"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleSingleReject(comment.id)}
                      disabled={isProcessing}
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                      title="Reddet"
                    >
                      <X className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleSingleSpam(comment.id)}
                      disabled={isProcessing}
                      className="rounded-lg p-2 text-orange-600 hover:bg-orange-50 disabled:opacity-50"
                      title="Spam"
                    >
                      <Flag className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Sayfa {page + 1} - Toplam {total} yorum
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0 || isLoading}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Önceki
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(total / pageSize) - 1 || isLoading}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Sonraki
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions Floating Button */}
      {selectedComments.size > 0 && (
        <div className="fixed right-8 bottom-8 flex gap-2 rounded-lg border border-blue-200 bg-white p-4 shadow-lg">
          <button
            onClick={handleBulkSpam}
            disabled={isProcessing}
            className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm text-white hover:bg-orange-700 disabled:opacity-50"
          >
            <Flag className="h-4 w-4" />
            Spam ({selectedComments.size})
          </button>
        </div>
      )}
    </div>
  );
}
