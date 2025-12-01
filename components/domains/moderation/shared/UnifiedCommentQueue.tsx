'use client';

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
import { useCommentModeration } from '@/hooks/business/moderation';
import { UnifiedCommentModerationCard } from './UnifiedCommentModerationCard';
import type { UserRole } from '@/types/business/moderation';
import type { CommentModerationStatus } from '@/hooks/business/moderation';

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
  initialStatus = 'pending',
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

  const comments = moderation.comments || [];
  const selectedCount = moderation.selectedComments.length;
  const hasSelection = selectedCount > 0;

  // ================================================
  // HANDLERS
  // ================================================

  const handleStatusChange = (status: CommentModerationStatus) => {
    setActiveStatus(status);
    moderation.clearSelection();
    moderation.refresh();
    logger.info('Comment status filter changed', { status });
  };

  const handleSearch = () => {
    moderation.refresh();
    logger.info('Comment search executed', { query: searchQuery });
  };

  const handleRefresh = () => {
    moderation.clearSelection();
    moderation.refresh();
    toast.success('Yenilendi');
    logger.info('Comment queue refreshed');
  };

  const handleSelectAll = () => {
    if (hasSelection) {
      moderation.clearSelection();
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
      await moderation.bulkApprove(moderation.selectedComments);
      toast.success(`${count} yorum onaylandı`);
      moderation.clearSelection();
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
      await moderation.bulkReject(
        moderation.selectedComments,
        'Bulk rejection'
      );
      toast.success(`${count} yorum reddedildi`);
      moderation.clearSelection();
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
      await moderation.bulkMarkAsSpam(moderation.selectedComments);
      toast.success(`${count} yorum spam olarak işaretlendi`);
      moderation.clearSelection();
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
      {showStats && moderation.stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* Pending */}
          <button
            onClick={() => handleStatusChange('pending')}
            className={`rounded-lg border p-4 text-left transition-all hover:shadow-md ${
              activeStatus === 'pending'
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                : 'border-gray-200 bg-white hover:border-blue-300'
            }`}
          >
            <p className="text-sm font-medium text-gray-600">Bekleyen</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {moderation.stats?.pending}
            </p>
          </button>

          {/* Approved */}
          <button
            onClick={() => handleStatusChange('approved')}
            className={`rounded-lg border p-4 text-left transition-all hover:shadow-md ${
              activeStatus === 'approved'
                ? 'border-green-500 bg-green-50 ring-2 ring-green-500'
                : 'border-gray-200 bg-white hover:border-green-300'
            }`}
          >
            <p className="text-sm font-medium text-gray-600">Onaylanan</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {moderation.stats?.approved}
            </p>
          </button>

          {/* Rejected */}
          <button
            onClick={() => handleStatusChange('rejected')}
            className={`rounded-lg border p-4 text-left transition-all hover:shadow-md ${
              activeStatus === 'rejected'
                ? 'border-red-500 bg-red-50 ring-2 ring-red-500'
                : 'border-gray-200 bg-white hover:border-red-300'
            }`}
          >
            <p className="text-sm font-medium text-gray-600">Reddedilen</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {moderation.stats?.rejected}
            </p>
          </button>

          {/* Spam */}
          <button
            onClick={() => handleStatusChange('spam')}
            className={`rounded-lg border p-4 text-left transition-all hover:shadow-md ${
              activeStatus === 'spam'
                ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-500'
                : 'border-gray-200 bg-white hover:border-orange-300'
            }`}
          >
            <p className="text-sm font-medium text-gray-600">Spam</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {moderation.stats?.spam}
            </p>
          </button>

          {/* Total */}
          <button
            onClick={() => handleStatusChange('all')}
            className={`rounded-lg border p-4 text-left transition-all hover:shadow-md ${
              activeStatus === 'all'
                ? 'border-gray-500 bg-gray-50 ring-2 ring-gray-500'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <p className="text-sm font-medium text-gray-600">Toplam</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {(moderation.stats?.pending || 0) +
                (moderation.stats?.approved || 0) +
                (moderation.stats?.rejected || 0) +
                (moderation.stats?.spam || 0)}
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
          disabled={moderation.isLoading}
        >
          <RefreshCw
            className={`h-4 w-4 ${moderation.isLoading ? 'animate-spin' : ''}`}
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
        {moderation.isLoading && comments.length === 0 ? (
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
              comment={comment as any}
              viewMode={viewMode}
              role={role}
              selected={moderation.selectedComments.includes(
                Number(comment.id)
              )}
              onSelect={(id) => {
                moderation.toggleSelection(Number(id));
              }}
              onApprove={async (id) => {
                const success = await moderation.approveComment(Number(id));
                return success;
              }}
              onReject={async (id, reason) => {
                const success = await moderation.rejectComment(
                  Number(id),
                  reason || 'Rejected'
                );
                return success;
              }}
              onMarkSpam={async (id) => {
                const success = await moderation.markAsSpam(Number(id));
                return success;
              }}
              onEscalate={
                role === 'moderator'
                  ? async (id, reason, priority) => {
                      // Escalate to admin logic
                      logger.info('Comment escalated', {
                        id,
                        reason,
                        priority,
                      });
                      toast.success('Yorum yöneticiye yükseltildi');
                      return true;
                    }
                  : undefined
              }
              onUpdated={() => {
                // Refresh the list
                moderation.refresh();
              }}
              showActions={activeStatus === 'pending'}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {moderation.pagination && moderation.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-600">
            Sayfa {moderation.pagination.page} /{' '}
            {moderation.pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <UnifiedButton
              variant="outline"
              size="sm"
              onClick={() =>
                moderation.fetchComments(moderation.pagination!.page - 1)
              }
              disabled={
                moderation.pagination?.page === 1 || moderation.isLoading
              }
            >
              Önceki
            </UnifiedButton>
            <UnifiedButton
              variant="outline"
              size="sm"
              onClick={() =>
                moderation.fetchComments(moderation.pagination!.page + 1)
              }
              disabled={
                (moderation.pagination?.page || 0) >=
                  (moderation.pagination?.totalPages || 0) ||
                moderation.isLoading
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
