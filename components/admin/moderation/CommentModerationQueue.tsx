/**
 * ================================================
 * COMMENT MODERATION QUEUE COMPONENT
 * ================================================
 * Main component for comment moderation dashboard
 * Displays comments with filtering and bulk actions
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import {
  useCommentModeration,
  type CommentModerationStatus,
} from '@/hooks/business/useCommentModeration';
import { CommentModerationCard } from './CommentModerationCard';
import { CommentPagination } from '@/components/blog/CommentPagination';

// ================================================
// COMPONENT
// ================================================

export function CommentModerationQueue() {
  // ================================================
  // HOOKS
  // ================================================

  const moderation = useCommentModeration();

  // ================================================
  // LOCAL STATE
  // ================================================

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // ================================================
  // COMPUTED
  // ================================================

  const hasSelection = moderation.selectedComments.size > 0;
  const allSelected =
    moderation.data?.comments.every((c) => moderation.isSelected(c.id)) ||
    false;

  // ================================================
  // HANDLERS
  // ================================================

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    moderation.updateFilter('search', value || undefined);
  };

  const handleStatusFilter = (status: CommentModerationStatus) => {
    moderation.updateFilter('status', status);
  };

  const handleToggleSelectAll = () => {
    if (allSelected) {
      moderation.deselectAll();
    } else {
      moderation.selectAll();
    }
  };

  const handleBulkApprove = async () => {
    if (!hasSelection) return;
    const confirmed = confirm(
      `${moderation.selectedComments.size} yorumu onaylamak istediğinize emin misiniz?`
    );
    if (!confirmed) return;

    const ids = Array.from(moderation.selectedComments);
    await moderation.bulkApprove(ids);
  };

  const handleBulkReject = async () => {
    if (!hasSelection) return;
    const confirmed = confirm(
      `${moderation.selectedComments.size} yorumu reddetmek istediğinize emin misiniz?`
    );
    if (!confirmed) return;

    const ids = Array.from(moderation.selectedComments);
    await moderation.bulkReject(ids);
  };

  const handleBulkSpam = async () => {
    if (!hasSelection) return;
    const confirmed = confirm(
      `${moderation.selectedComments.size} yorumu spam olarak işaretlemek istediğinize emin misiniz?`
    );
    if (!confirmed) return;

    const ids = Array.from(moderation.selectedComments);
    await moderation.bulkMarkAsSpam(ids);
  };

  // ================================================
  // RENDER - Loading
  // ================================================

  if (moderation.loading && !moderation.data) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">Yorumlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  // ================================================
  // RENDER - Error
  // ================================================

  if (moderation.error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-800">{moderation.error}</p>
        <button
          onClick={() => moderation.refresh()}
          className="mt-2 text-sm font-medium text-red-600 hover:text-red-700"
        >
          Tekrar dene
        </button>
      </div>
    );
  }

  const data = moderation.data;
  if (!data) return null;

  // ================================================
  // RENDER - Main
  // ================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Yorum Moderasyonu
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Toplam {data.total} yorum • {data.pending} bekliyor
          </p>
        </div>

        <button
          onClick={() => moderation.refresh()}
          disabled={moderation.loading}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${moderation.loading ? 'animate-spin' : ''}`}
          />
          <span>Yenile</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <p className="text-sm font-medium text-yellow-900">Bekliyor</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-yellow-600">
            {data.pending}
          </p>
        </div>

        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-sm font-medium text-green-900">Onaylı</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {data.approved}
          </p>
        </div>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm font-medium text-red-900">Reddedildi</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {data.rejected}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-gray-600" />
            <p className="text-sm font-medium text-gray-900">Spam</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-600">{data.spam}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
        {/* Search Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Yorum içeriğinde ara..."
              className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              showFilters
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>Filtrele</span>
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="space-y-3 border-t border-gray-200 pt-4">
            {/* Status Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Durum
              </label>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    'ALL',
                    'PENDING',
                    'APPROVED',
                    'REJECTED',
                    'SPAM',
                  ] as CommentModerationStatus[]
                ).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusFilter(status)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                      moderation.filters.status === status
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {status === 'ALL' && 'Tümü'}
                    {status === 'PENDING' && 'Bekliyor'}
                    {status === 'APPROVED' && 'Onaylı'}
                    {status === 'REJECTED' && 'Reddedildi'}
                    {status === 'SPAM' && 'Spam'}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  moderation.clearFilters();
                  setSearchQuery('');
                }}
                className="text-sm font-medium text-gray-600 hover:text-gray-700"
              >
                Filtreleri temizle
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {hasSelection && (
        <div className="flex items-center gap-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-medium text-blue-900">
            {moderation.selectedComments.size} yorum seçildi
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkApprove}
              className="flex items-center gap-1 rounded-lg border border-green-600 bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Onayla</span>
            </button>

            <button
              onClick={handleBulkReject}
              className="flex items-center gap-1 rounded-lg border border-red-600 bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              <XCircle className="h-4 w-4" />
              <span>Reddet</span>
            </button>

            <button
              onClick={handleBulkSpam}
              className="flex items-center gap-1 rounded-lg border border-gray-600 bg-gray-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-gray-700"
            >
              <Trash2 className="h-4 w-4" />
              <span>Spam</span>
            </button>

            <button
              onClick={() => moderation.deselectAll()}
              className="ml-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Seçimi kaldır
            </button>
          </div>
        </div>
      )}

      {/* Select All */}
      {data.comments.length > 0 && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={handleToggleSelectAll}
            className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
          />
          <label className="text-sm font-medium text-gray-700">
            Sayfadaki tüm yorumları seç ({data.comments.length})
          </label>
        </div>
      )}

      {/* Comments List */}
      {data.comments.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
          <p className="text-gray-500">Gösterilecek yorum bulunamadı</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.comments.map((comment) => (
            <CommentModerationCard
              key={comment.id}
              comment={comment}
              isSelected={moderation.isSelected(comment.id)}
              onSelect={() => {
                if (moderation.isSelected(comment.id)) {
                  moderation.deselectComment(comment.id);
                } else {
                  moderation.selectComment(comment.id);
                }
              }}
              onApprove={async () => {
                await moderation.approveComment(comment.id);
              }}
              onReject={async () => {
                await moderation.rejectComment(comment.id);
              }}
              onSpam={async () => {
                await moderation.markAsSpam(comment.id);
              }}
              onViewPost={() => {
                // TODO: Navigate to post
                window.open(`/blog/${comment.postId}`, '_blank');
              }}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data.total > moderation.pageSize && (
        <CommentPagination
          currentPage={moderation.page}
          totalPages={moderation.totalPages}
          totalItems={data.total}
          itemsPerPage={moderation.pageSize}
          onPageChange={moderation.setPage}
          onItemsPerPageChange={moderation.setPageSize}
          loading={moderation.loading}
        />
      )}
    </div>
  );
}

export default CommentModerationQueue;
