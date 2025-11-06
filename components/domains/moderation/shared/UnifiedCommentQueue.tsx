/**
 * ================================================
 * UNIFIED COMMENT MODERATION QUEUE
 * ================================================
 * Complete comment moderation queue with filters, stats, and bulk actions
 * Single component for both Admin and Moderator roles
 *
 * Sprint 1 - EPIC 1.1: Component Deduplication (Comments)
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 6, 2025
 */

'use client';

import { useState } from 'react';
import {
  Filter,
  Search,
  RefreshCw,
  CheckSquare,
  XSquare,
  AlertOctagon,
} from 'lucide-react';
import { UnifiedButton, Badge } from '@/components/ui';
import logger from '@/lib/infrastructure/monitoring/logger';
import { toast } from 'sonner';
import { useCommentModeration } from '@/hooks/business/useCommentModeration';
import { UnifiedCommentModerationCard } from './UnifiedCommentModerationCard';
import type { UserRole } from './UnifiedCommentModerationCard';
import type { CommentModerationStatus } from '@/hooks/business/useCommentModeration';

// ============================================================================
// TYPES
// ============================================================================

export interface UnifiedCommentQueueProps {
  role?: UserRole;
  initialStatus?: CommentModerationStatus;
  showStats?: boolean;
  enableBulkActions?: boolean;
  viewMode?: 'compact' | 'card' | 'detailed';
}

// ============================================================================
// COMPONENT
// ============================================================================

export function UnifiedCommentQueue({
  role = 'admin',
  initialStatus = 'PENDING',
  showStats = true,
  enableBulkActions = true,
  viewMode = 'card',
}: UnifiedCommentQueueProps) {
  // ================================================
  // HOOKS
  // ================================================

  const moderation = useCommentModeration();

  // ================================================
  // LOCAL STATE
  // ================================================

  const [activeStatus, setActiveStatus] =
    useState<CommentModerationStatus>(initialStatus);
  const [searchQuery, setSearchQuery] = useState('');

  // ================================================
  // COMPUTED VALUES
  // ================================================

  const data = moderation.data;
  const comments = data?.comments || [];
  const selectedCount = moderation.selectedComments.size;
  const hasSelection = selectedCount > 0;

  // ================================================
  // HANDLERS
  // ================================================

  const handleStatusChange = (status: CommentModerationStatus) => {
    setActiveStatus(status);
    moderation.updateFilter('status', status === 'ALL' ? undefined : status);
    moderation.deselectAll();
    logger.info('Comment status filter changed', { status });
  };

  const handleSearch = () => {
    moderation.updateFilter('search', searchQuery || undefined);
    logger.info('Comment search executed', { query: searchQuery });
  };

  const handleRefresh = () => {
    moderation.deselectAll();
    // Trigger re-fetch by changing filters
    moderation.setFilters({ ...moderation.filters });
    toast.success('Yenilendiğonner');
    logger.info('Comment queue refreshed');
  };

  const handleSelectAll = () => {
    if (hasSelection) {
      moderation.deselectAll();
    } else {
      moderation.selectAll();
    }
  };

  const handleBulkApprove = async () => {
    if (!hasSelection) return;

    const count = selectedCount;
    const confirmed = window.confirm(
      `${count} yorumu onaylamak istediğinize emin misiniz?`
    );

    if (!confirmed) return;

    try {
      const selectedIds = Array.from(moderation.selectedComments);
      await moderation.bulkApprove(selectedIds);
      toast.success(`${count} yorum onaylandı`);
      moderation.deselectAll();
      logger.info('Bulk comments approved', { count });
    } catch (error) {
      toast.error('Toplu onaylama başarısız oldu');
      logger.error(
        'Bulk approve comments failed',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  };

  const handleBulkReject = async () => {
    if (!hasSelection) return;

    const count = selectedCount;
    const confirmed = window.confirm(
      `${count} yorumu reddetmek istediğinize emin misiniz?`
    );

    if (!confirmed) return;

    try {
      const selectedIds = Array.from(moderation.selectedComments);
      await moderation.bulkReject(selectedIds);
      toast.success(`${count} yorum reddedildi`);
      moderation.deselectAll();
      logger.info('Bulk comments rejected', { count });
    } catch (error) {
      toast.error('Toplu reddetme başarısız oldu');
      logger.error(
        'Bulk reject comments failed',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  };

  const handleBulkSpam = async () => {
    if (!hasSelection) return;

    const count = selectedCount;
    const confirmed = window.confirm(
      `${count} yorumu spam olarak işaretlemek istediğinize emin misiniz?`
    );

    if (!confirmed) return;

    try {
      const selectedIds = Array.from(moderation.selectedComments);
      await moderation.bulkMarkAsSpam(selectedIds);
      toast.success(`${count} yorum spam olarak işaretlendi`);
      moderation.deselectAll();
      logger.info('Bulk comments marked as spam', { count });
    } catch (error) {
      toast.error('Toplu spam işaretleme başarısız oldu');
      logger.error(
        'Bulk mark spam failed',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  };

  // ================================================
  // RENDER
  // ================================================

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {showStats && data && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* Pending */}
          <button
            onClick={() => handleStatusChange('PENDING')}
            className={`rounded-lg border p-4 text-left transition-all hover:shadow-md ${
              activeStatus === 'PENDING'
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                : 'border-gray-200 bg-white hover:border-blue-300'
            }`}
          >
            <p className="text-sm font-medium text-gray-600">Bekleyen</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {data.pending}
            </p>
          </button>

          {/* Approved */}
          <button
            onClick={() => handleStatusChange('APPROVED')}
            className={`rounded-lg border p-4 text-left transition-all hover:shadow-md ${
              activeStatus === 'APPROVED'
                ? 'border-green-500 bg-green-50 ring-2 ring-green-500'
                : 'border-gray-200 bg-white hover:border-green-300'
            }`}
          >
            <p className="text-sm font-medium text-gray-600">Onaylanan</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {data.approved}
            </p>
          </button>

          {/* Rejected */}
          <button
            onClick={() => handleStatusChange('REJECTED')}
            className={`rounded-lg border p-4 text-left transition-all hover:shadow-md ${
              activeStatus === 'REJECTED'
                ? 'border-red-500 bg-red-50 ring-2 ring-red-500'
                : 'border-gray-200 bg-white hover:border-red-300'
            }`}
          >
            <p className="text-sm font-medium text-gray-600">Reddedilen</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {data.rejected}
            </p>
          </button>

          {/* Spam */}
          <button
            onClick={() => handleStatusChange('SPAM')}
            className={`rounded-lg border p-4 text-left transition-all hover:shadow-md ${
              activeStatus === 'SPAM'
                ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-500'
                : 'border-gray-200 bg-white hover:border-orange-300'
            }`}
          >
            <p className="text-sm font-medium text-gray-600">Spam</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{data.spam}</p>
          </button>

          {/* Total */}
          <button
            onClick={() => handleStatusChange('ALL')}
            className={`rounded-lg border p-4 text-left transition-all hover:shadow-md ${
              activeStatus === 'ALL'
                ? 'border-gray-500 bg-gray-50 ring-2 ring-gray-500'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <p className="text-sm font-medium text-gray-600">Toplam</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {data.total}
            </p>
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
        {/* Search */}
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Yorum ara..."
              className="w-full rounded-md border border-gray-300 py-2 pr-4 pl-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <UnifiedButton variant="primary" size="sm" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </UnifiedButton>
        </div>

        {/* Refresh */}
        <UnifiedButton
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={moderation.loading}
        >
          <RefreshCw
            className={`h-4 w-4 ${moderation.loading ? 'animate-spin' : ''}`}
          />
        </UnifiedButton>

        {/* Bulk Actions Toggle */}
        {enableBulkActions && comments.length > 0 && (
          <UnifiedButton
            variant={hasSelection ? 'primary' : 'outline'}
            size="sm"
            onClick={handleSelectAll}
          >
            <CheckSquare className="mr-1 h-4 w-4" />
            {hasSelection ? `Seçimi Temizle (${selectedCount})` : 'Tümünü Seç'}
          </UnifiedButton>
        )}
      </div>

      {/* Bulk Actions Toolbar */}
      {enableBulkActions && hasSelection && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center gap-2">
            <Badge variant="default">{selectedCount} yorum seçildi</Badge>
          </div>

          <div className="flex flex-1 flex-wrap gap-2">
            <UnifiedButton
              variant="success"
              size="sm"
              onClick={handleBulkApprove}
            >
              <CheckSquare className="mr-1 h-4 w-4" />
              Toplu Onayla
            </UnifiedButton>

            <UnifiedButton
              variant="destructive"
              size="sm"
              onClick={handleBulkReject}
            >
              <XSquare className="mr-1 h-4 w-4" />
              Toplu Reddet
            </UnifiedButton>

            <UnifiedButton variant="warning" size="sm" onClick={handleBulkSpam}>
              <AlertOctagon className="mr-1 h-4 w-4" />
              Toplu Spam
            </UnifiedButton>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {moderation.loading && comments.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-gray-400" />
            <p className="mt-2 text-gray-600">Yorumlar yükleniyor...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <Filter className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Yorum bulunamadı
            </h3>
            <p className="mt-2 text-gray-600">
              Bu filtreye uygun yorum bulunmuyor.
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <UnifiedCommentModerationCard
              key={comment.id}
              comment={comment}
              viewMode={viewMode}
              role={role}
              selected={moderation.isSelected(String(comment.id))}
              onSelect={(id) => {
                if (moderation.isSelected(String(id))) {
                  moderation.deselectComment(String(id));
                } else {
                  moderation.selectComment(String(id));
                }
              }}
              onApprove={async (id) => {
                const success = await moderation.approveComment(String(id));
                return success;
              }}
              onReject={async (id) => {
                const success = await moderation.rejectComment(String(id));
                return success;
              }}
              onMarkSpam={async (id) => {
                const success = await moderation.markAsSpam(String(id));
                return success;
              }}
              onEscalate={
                role === 'moderator'
                  ? async (id, reason, priority) => {
                      // Escalate to admin logic
                      logger.info('Comment escalated', { id, reason, priority,  });
                      toast.success('Yorum yöneticiye yükseltildi');
                      return true;
                    }
                  : undefined
              }
              onUpdated={() => {
                // Refresh the list
                moderation.setFilters({ ...moderation.filters });
              }}
              showActions={activeStatus === 'PENDING'}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {moderation.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-600">
            Sayfa {moderation.page} / {moderation.totalPages}
          </p>
          <div className="flex gap-2">
            <UnifiedButton
              variant="outline"
              size="sm"
              onClick={() => moderation.setPage(moderation.page - 1)}
              disabled={moderation.page === 1 || moderation.loading}
            >
              Önceki
            </UnifiedButton>
            <UnifiedButton
              variant="outline"
              size="sm"
              onClick={() => moderation.setPage(moderation.page + 1)}
              disabled={
                moderation.page >= moderation.totalPages || moderation.loading
              }
            >
              Sonraki
            </UnifiedButton>
          </div>
        </div>
      )}
    </div>
  );
}

export default UnifiedCommentQueue;
