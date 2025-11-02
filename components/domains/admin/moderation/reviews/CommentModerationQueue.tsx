/**
 * ================================================
 * COMMENT MODERATION QUEUE COMPONENT
 * ================================================
 * Main component for comment moderation dashboard
 * Displays comments with filtering and bulk actions
 * Includes auto-refresh and loading skeletons
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React, { useState } from 'react';
import {
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Clock,
  Flag,
} from 'lucide-react';
import { useCommentModeration } from '@/hooks/business/useCommentModeration';
import { useAutoRefresh } from '@/hooks/business/useAutoRefresh';
import { CommentModerationCard } from './CommentModerationCard';
import { Pagination } from '@/components/ui/Pagination';
import { CommentBulkActions } from './CommentBulkActions';
import { CommentFilterBar } from './CommentFilterBar';
import { CommentSearchBar } from './CommentSearchBar';
import { ModerationQueueSkeleton } from './LoadingSkeletons';
import { toast } from 'sonner';

// ================================================
// COMPONENT
// ================================================

export function CommentModerationQueue() {
  // ================================================
  // HOOKS
  // ================================================

  const moderation = useCommentModeration();

  // Auto-refresh every 30 seconds
  const autoRefresh = useAutoRefresh(
    async () => {
      await moderation.refresh();
    },
    {
      interval: 30000, // 30 seconds
      enabled: true,
      refreshOnFocus: true,
      refreshOnReconnect: true,
    }
  );

  // ================================================
  // LOCAL STATE
  // ================================================

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showEscalateDialog, setShowEscalateDialog] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');
  const [escalatePriority, setEscalatePriority] = useState<
    'LOW' | 'MEDIUM' | 'HIGH'
  >('MEDIUM');

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

  const handleToggleSelectAll = () => {
    if (allSelected) {
      moderation.deselectAll();
    } else {
      moderation.selectAll();
    }
  };

  const handleEscalate = async () => {
    if (!escalateReason.trim()) {
      toast.error('Lütfen yükseltme sebebi girin');
      return;
    }

    try {
      const ids = Array.from(moderation.selectedComments);
      const result = await moderation.bulkEscalate(
        ids,
        escalateReason,
        escalatePriority
      );

      if (result.success > 0) {
        toast.success(`${result.success} yorum başarıyla yükseltildi`, {
          description:
            result.failed > 0
              ? `${result.failed} yorum yükseltilemedi`
              : undefined,
        });
      }

      if (result.failed > 0) {
        toast.error(`${result.failed} yorum yükseltilemedi`);
      }

      setShowEscalateDialog(false);
      setEscalateReason('');
      setEscalatePriority('MEDIUM');
    } catch (_error) {
      toast.error('Yükseltme işlemi sırasında hata oluştu');
    }
  };

  // ================================================
  // RENDER - Loading
  // ================================================

  if (moderation.loading && !moderation.data) {
    return <ModerationQueueSkeleton />;
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
          onClick={() => autoRefresh.refresh()}
          disabled={moderation.loading}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Yorumları yenile"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              moderation.loading || autoRefresh.isRefreshing
                ? 'animate-spin'
                : ''
            }`}
          />
          <span>Yenile</span>
          {autoRefresh.timeUntilRefresh > 0 && !moderation.loading && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              {autoRefresh.timeUntilRefresh}s
            </span>
          )}
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

      {/* Search and Filter Section */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Search Bar */}
        <div className="lg:col-span-2">
          <CommentSearchBar
            value={searchQuery}
            onChange={handleSearch}
            isSearching={moderation.loading}
            placeholder="Yorum içeriğinde, yazarda veya gönderide ara..."
          />
        </div>

        {/* Filter Toggle Button (Mobile) */}
        <div className="lg:hidden">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              showFilters
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>Filtreler</span>
            {moderation.filters.status !== 'ALL' && (
              <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                Aktif
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      {(showFilters ||
        (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
        <CommentFilterBar
          filters={moderation.filters}
          onFilterChange={moderation.setFilters}
          onClearFilters={moderation.clearFilters}
          stats={{
            pending: data.pending,
            approved: data.approved,
            rejected: data.rejected,
            spam: data.spam,
            total: data.total,
          }}
        />
      )}

      {/* Bulk Actions */}
      {hasSelection && (
        <CommentBulkActions
          selectedCount={moderation.selectedComments.size}
          onApprove={async () => {
            const ids = Array.from(moderation.selectedComments);
            return await moderation.bulkApprove(ids);
          }}
          onReject={async () => {
            const ids = Array.from(moderation.selectedComments);
            return await moderation.bulkReject(ids);
          }}
          onSpam={async () => {
            const ids = Array.from(moderation.selectedComments);
            return await moderation.bulkMarkAsSpam(ids);
          }}
          onEscalate={async () => {
            setShowEscalateDialog(true);
            // Return placeholder until dialog is confirmed
            return { success: 0, failed: 0, total: 0 };
          }}
          onCancel={() => moderation.deselectAll()}
          disabled={moderation.loading}
        />
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
                // Navigate to blog post in new tab
                window.open(`/blog/${comment.postId}`, '_blank');
              }}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data.total > moderation.pageSize && (
        <Pagination
          currentPage={moderation.page}
          totalPages={moderation.totalPages}
          total={data.total}
          pageSize={moderation.pageSize}
          onPageChange={moderation.setPage}
          onPageSizeChange={moderation.setPageSize}
          showSizeChanger={true}
          showTotal={true}
          disabled={moderation.loading}
          size="md"
        />
      )}

      {/* Escalate Dialog */}
      {showEscalateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-2">
              <Flag className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Yorumları Yükselt
              </h3>
            </div>

            <p className="mb-4 text-sm text-gray-600">
              {moderation.selectedComments.size} yorum yöneticilere
              yükseltilecek. Lütfen sebep ve öncelik belirtin:
            </p>

            {/* Reason Input */}
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Yükseltme Sebebi *
              </label>
              <textarea
                value={escalateReason}
                onChange={(e) => setEscalateReason(e.target.value)}
                placeholder="İçerik inceleme gerektirir, ..."
                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                rows={3}
                required
              />
            </div>

            {/* Priority Selection */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Öncelik
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setEscalatePriority('LOW')}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    escalatePriority === 'LOW'
                      ? 'border-gray-600 bg-gray-600 text-white'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Düşük
                </button>
                <button
                  onClick={() => setEscalatePriority('MEDIUM')}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    escalatePriority === 'MEDIUM'
                      ? 'border-yellow-600 bg-yellow-600 text-white'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Orta
                </button>
                <button
                  onClick={() => setEscalatePriority('HIGH')}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    escalatePriority === 'HIGH'
                      ? 'border-red-600 bg-red-600 text-white'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Yüksek
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowEscalateDialog(false);
                  setEscalateReason('');
                  setEscalatePriority('MEDIUM');
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={handleEscalate}
                disabled={!escalateReason.trim()}
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Flag className="mr-2 inline-block h-4 w-4" />
                Yükselt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CommentModerationQueue;
