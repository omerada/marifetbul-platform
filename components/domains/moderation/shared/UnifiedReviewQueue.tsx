'use client';

/**
 * ================================================
 * UNIFIED REVIEW QUEUE COMPONENT
 * ================================================
 * Complete review moderation queue with filters, pagination, and bulk actions
 * Works for both Admin and Moderator roles
 *
 * Features:
 * - Role-based rendering (admin/moderator)
 * - Status filters (pending/flagged/all)
 * - Pagination
 * - Bulk selection & actions
 * - Optimistic UI updates
 * - Real-time stats
 *
 * Sprint 1 - EPIC 1.1: Component Deduplication
 * @author MarifetBul Development Team
 * @version 2.0.0
 * @created November 6, 2025
 */

'use client';

import { useState } from 'react';
import { Eye, Check, ArrowUpCircle } from 'lucide-react';
import { UnifiedButton, Pagination, Loading } from '@/components/ui';
import { UnifiedReviewModerationCard } from './UnifiedReviewModerationCard';
import { useReviewModeration } from '@/hooks/business/moderation/useReviewModeration';
import * as adminModerationApi from '@/lib/api/moderation';
import logger from '@/lib/infrastructure/monitoring/logger';
import { UserRole } from '@/types/backend-aligned';
import type { Review as ReviewResponse } from '@/types/business/review';

// ============================================================================
// TYPES
// ============================================================================

interface UnifiedReviewQueueProps {
  role?: UserRole;
  initialStatus?: 'pending' | 'flagged' | 'all';
  showStats?: boolean;
  enableBulkActions?: boolean;
  viewMode?: 'compact' | 'card' | 'detailed';
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function UnifiedReviewQueue({
  role = UserRole.MODERATOR,
  initialStatus = 'pending',
  showStats = true,
  enableBulkActions = true,
  viewMode = 'compact',
}: UnifiedReviewQueueProps) {
  const [filterStatus, setFilterStatus] = useState(initialStatus);
  const [selectedReviews, setSelectedReviews] = useState<Set<string>>(
    new Set()
  );
  const [viewingReview, setViewingReview] = useState<ReviewResponse | null>(
    null
  );

  // Use moderation hook
  const {
    reviews,
    stats,
    pagination,
    isLoading,
    isProcessing,
    approveReview,
    rejectReview,
    bulkApprove: hookBulkApprove,
    bulkReject: hookBulkReject,
    bulkEscalate: hookBulkEscalate,
    goToPage,
  } = useReviewModeration({
    autoFetch: true,
    filters: {
      status: filterStatus === 'all' ? undefined : filterStatus,
      reportedOnly: filterStatus === 'flagged',
    },
  });

  // Manual refetch handler
  const refetch = () => {
    // SWR will auto-refetch on mutations
  };

  // ============================================================================
  // SELECTION HANDLERS
  // ============================================================================

  const toggleSelection = (reviewId: string) => {
    setSelectedReviews((prev) => {
      const next = new Set(prev);
      if (next.has(reviewId)) {
        next.delete(reviewId);
      } else {
        next.add(reviewId);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedReviews(new Set(reviews.map((r) => r.id)));
  };

  const clearSelection = () => {
    setSelectedReviews(new Set());
  };

  // ============================================================================
  // MODERATION HANDLERS
  // ============================================================================

  const handleApprove = async (reviewId: string): Promise<boolean> => {
    const success = await approveReview(reviewId);
    if (success && viewingReview?.id === reviewId) {
      setViewingReview(null);
    }
    return success;
  };

  const handleReject = async (
    reviewId: string,
    reason: string
  ): Promise<boolean> => {
    const success = await rejectReview(reviewId, reason);
    if (success && viewingReview?.id === reviewId) {
      setViewingReview(null);
    }
    return success;
  };

  const handleEscalate = async (
    reviewId: string,
    reason: string,
    priority: string
  ): Promise<boolean> => {
    // Use hook's escalate if available, otherwise fallback
    try {
      // For now, we'll use the bulk escalate with single item
      await hookBulkEscalate(
        [reviewId],
        reason,
        priority as 'HIGH' | 'MEDIUM' | 'LOW'
      );
      if (viewingReview?.id === reviewId) {
        setViewingReview(null);
      }
      return true;
    } catch (error) {
      logger.error('Failed to escalate review', error as Error);
      return false;
    }
  };

  const handleDelete = async (reviewId: string): Promise<boolean> => {
    if (role !== 'ADMIN') return false;

    try {
      // Use reject instead of delete as backend doesn't expose delete endpoint
      await adminModerationApi.rejectReview(reviewId);
      refetch();
      if (viewingReview?.id === reviewId) {
        setViewingReview(null);
      }
      return true;
    } catch (error) {
      logger.error('Failed to delete review', error as Error);
      return false;
    }
  };

  const handleResolveFlag = async (reviewId: string): Promise<boolean> => {
    if (role !== 'ADMIN') return false;

    try {
      // Approve the review to resolve the flag
      await adminModerationApi.approveReview(reviewId);
      refetch();
      return true;
    } catch (error) {
      logger.error('Failed to resolve flag', error as Error);
      return false;
    }
  };

  // ============================================================================
  // BULK ACTIONS
  // ============================================================================

  const handleBulkApprove = async () => {
    await hookBulkApprove(Array.from(selectedReviews));
    clearSelection();
  };

  const handleBulkEscalate = async (
    reason: string,
    priority: 'HIGH' | 'MEDIUM' | 'LOW'
  ) => {
    await hookBulkEscalate(Array.from(selectedReviews), reason, priority);
    clearSelection();
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loading size="lg" text="İncelemeler yükleniyor..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {showStats && stats && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-lg bg-yellow-50 p-4">
            <div className="text-sm font-medium text-gray-600">Bekleyen</div>
            <div className="mt-1 text-2xl font-bold text-yellow-700">
              {stats.pending}
            </div>
          </div>
          <div className="rounded-lg bg-red-50 p-4">
            <div className="text-sm font-medium text-gray-600">Bayraklı</div>
            <div className="mt-1 text-2xl font-bold text-red-700">
              {stats.flagged}
            </div>
          </div>
          <div className="rounded-lg bg-green-50 p-4">
            <div className="text-sm font-medium text-gray-600">Onaylanan</div>
            <div className="mt-1 text-2xl font-bold text-green-700">
              {stats.approved}
            </div>
          </div>
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="text-sm font-medium text-gray-600">Reddedilen</div>
            <div className="mt-1 text-2xl font-bold text-gray-700">
              {stats.rejected}
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-200">
        {(['pending', 'flagged', 'all'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              filterStatus === status
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {status === 'pending'
              ? 'Bekleyen'
              : status === 'flagged'
                ? 'Bayraklı'
                : 'Tümü'}
          </button>
        ))}
      </div>

      {/* Bulk Actions Bar */}
      {enableBulkActions && selectedReviews.size > 0 && (
        <div className="flex items-center gap-4 rounded-lg bg-blue-50 p-4">
          <span className="text-sm font-medium text-gray-900">
            {selectedReviews.size} inceleme seçildi
          </span>
          <div className="flex gap-2">
            <UnifiedButton
              variant="success"
              size="sm"
              onClick={handleBulkApprove}
              disabled={isProcessing}
            >
              <Check className="mr-1 h-4 w-4" />
              Tümünü Onayla
            </UnifiedButton>
            {role === UserRole.MODERATOR && (
              <UnifiedButton
                variant="warning"
                size="sm"
                onClick={() => {
                  const reason = prompt('Yükseltme sebebi:');
                  if (reason) handleBulkEscalate(reason, 'MEDIUM' as const);
                }}
                disabled={isProcessing}
              >
                <ArrowUpCircle className="mr-1 h-4 w-4" />
                Yükselt
              </UnifiedButton>
            )}
            <UnifiedButton variant="ghost" size="sm" onClick={clearSelection}>
              Temizle
            </UnifiedButton>
          </div>
          {reviews.length === selectedReviews.size ? (
            <span className="ml-auto text-xs text-gray-500">
              Tüm incelemeler seçili
            </span>
          ) : (
            <button
              onClick={selectAll}
              className="ml-auto text-xs text-blue-600 hover:text-blue-700"
            >
              Tümünü Seç
            </button>
          )}
        </div>
      )}

      {/* Review List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Eye className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              İnceleme Bulunamadı
            </h3>
            <p className="text-sm text-gray-500">
              {filterStatus === 'pending'
                ? 'Bekleyen inceleme yok'
                : filterStatus === 'flagged'
                  ? 'Bayraklı inceleme yok'
                  : 'Henüz inceleme yok'}
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <UnifiedReviewModerationCard
              key={review.id}
              review={review as any} // Type conversion for now - will be fixed in next iteration
              role={role}
              viewMode={viewMode}
              selectable={enableBulkActions}
              selected={selectedReviews.has(review.id)}
              onSelect={toggleSelection}
              onApprove={handleApprove}
              onReject={handleReject}
              onEscalate={
                role === UserRole.MODERATOR ? handleEscalate : undefined
              }
              onDelete={role === UserRole.ADMIN ? handleDelete : undefined}
              onResolveFlag={
                role === UserRole.ADMIN ? handleResolveFlag : undefined
              }
              onViewDetails={(r) => setViewingReview(r as any)}
              onUpdated={refetch}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page + 1}
          totalPages={pagination.totalPages}
          onPageChange={(page) => goToPage(page - 1)}
        />
      )}

      {/* Detail Modal */}
      {viewingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto">
            <UnifiedReviewModerationCard
              review={viewingReview}
              role={role}
              viewMode="detailed"
              showFullDetails
              onApprove={handleApprove}
              onReject={handleReject}
              onEscalate={
                role === UserRole.MODERATOR ? handleEscalate : undefined
              }
              onDelete={role === UserRole.ADMIN ? handleDelete : undefined}
              onResolveFlag={
                role === UserRole.ADMIN ? handleResolveFlag : undefined
              }
              onUpdated={() => {
                setViewingReview(null);
                refetch();
              }}
            />
            <button
              onClick={() => setViewingReview(null)}
              className="mt-4 w-full rounded-lg bg-gray-100 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UnifiedReviewQueue;
