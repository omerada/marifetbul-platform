/**
 * ================================================
 * MODERATOR REVIEW QUEUE COMPONENT
 * ================================================
 * Dedicated component for moderator review management
 * Separated from admin to avoid duplicate and maintain clean architecture
 *
 * Features:
 * - Review list with filters
 * - Individual approve/reject actions
 * - Bulk moderation
 * - Real-time stats
 * - Optimistic UI updates
 *
 * Sprint 1 - Story 1.1: Review Moderation System
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 3, 2025
 */

'use client';

import { useState } from 'react';
import {
  Star,
  Flag,
  Check,
  X,
  Eye,
  AlertTriangle,
  ArrowUpCircle,
} from 'lucide-react';
import { UnifiedButton, Badge, Pagination, Loading } from '@/components/ui';
import { useReviewModeration } from '@/hooks/business/moderation/useReviewModeration';
import type { ReviewData } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

interface ModeratorReviewQueueProps {
  initialStatus?: 'pending' | 'flagged' | 'all';
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ModeratorReviewQueue({
  initialStatus = 'pending',
}: ModeratorReviewQueueProps) {
  const [filterStatus, setFilterStatus] = useState(initialStatus);
  const [viewingReview, setViewingReview] = useState<ReviewData | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [showBulkRejectModal, setShowBulkRejectModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');
  const [escalatePriority, setEscalatePriority] = useState<
    'HIGH' | 'MEDIUM' | 'LOW'
  >('MEDIUM');

  // Use our dedicated hook
  const {
    reviews,
    stats,
    pagination,
    isLoading,
    isProcessing,
    selectedReviews,
    approveReview,
    rejectReview,
    escalateReview: _escalateReview, // Reserved for future single-review escalation
    bulkApprove,
    bulkReject,
    bulkEscalate,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    goToPage,
  } = useReviewModeration({
    autoFetch: true,
    filters: {
      status: filterStatus === 'all' ? undefined : filterStatus,
      reportedOnly: filterStatus === 'flagged',
    },
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleApprove = async (reviewId: string) => {
    const success = await approveReview(reviewId);
    if (success && viewingReview?.id === reviewId) {
      setViewingReview(null);
    }
  };

  const handleReject = async (reviewId: string) => {
    if (!rejectReason || rejectReason.length < 10) {
      return;
    }

    const success = await rejectReview(reviewId, rejectReason);
    if (success) {
      setShowRejectModal(null);
      setRejectReason('');
      if (viewingReview?.id === reviewId) {
        setViewingReview(null);
      }
    }
  };

  const handleBulkApprove = async () => {
    await bulkApprove(selectedReviews);
  };

  const handleBulkReject = async () => {
    if (!rejectReason || rejectReason.length < 10) {
      return;
    }

    const success = await bulkReject(selectedReviews, rejectReason);
    if (success) {
      setShowBulkRejectModal(false);
      setRejectReason('');
    }
  };

  const handleBulkEscalate = async () => {
    if (!escalateReason || escalateReason.length < 10) {
      return;
    }

    const success = await bulkEscalate(
      selectedReviews,
      escalateReason,
      escalatePriority
    );
    if (success) {
      setShowEscalateModal(false);
      setEscalateReason('');
      setEscalatePriority('MEDIUM');
    }
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  const getPriorityBadge = (reportCount?: number) => {
    if (!reportCount || reportCount === 0) return null;

    if (reportCount >= 5) {
      return (
        <Badge variant="destructive">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Yüksek Öncelik
        </Badge>
      );
    }
    if (reportCount >= 3) {
      return (
        <Badge variant="warning">
          <Flag className="mr-1 h-3 w-3" />
          Orta Öncelik
        </Badge>
      );
    }
    return (
      <Badge variant="default">
        <Flag className="mr-1 h-3 w-3" />
        {reportCount} Rapor
      </Badge>
    );
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
      {stats && (
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
        <button
          onClick={() => setFilterStatus('pending')}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            filterStatus === 'pending'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Bekleyen
        </button>
        <button
          onClick={() => setFilterStatus('flagged')}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            filterStatus === 'flagged'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Bayraklı
        </button>
        <button
          onClick={() => setFilterStatus('all')}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            filterStatus === 'all'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Tümü
        </button>
      </div>

      {/* Bulk Actions */}
      {selectedReviews.length > 0 && (
        <div className="flex items-center gap-4 rounded-lg bg-blue-50 p-4">
          <span className="text-sm font-medium text-gray-900">
            {selectedReviews.length} inceleme seçildi
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
            <UnifiedButton
              variant="destructive"
              size="sm"
              onClick={() => setShowBulkRejectModal(true)}
              disabled={isProcessing}
            >
              <X className="mr-1 h-4 w-4" />
              Tümünü Reddet
            </UnifiedButton>
            <UnifiedButton
              variant="warning"
              size="sm"
              onClick={() => setShowEscalateModal(true)}
              disabled={isProcessing}
            >
              <ArrowUpCircle className="mr-1 h-4 w-4" />
              Yükselt
            </UnifiedButton>
            <UnifiedButton variant="ghost" size="sm" onClick={clearSelection}>
              Temizle
            </UnifiedButton>
          </div>
          {reviews.length === selectedReviews.length ? (
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
            <div
              key={review.id}
              className={`rounded-lg border bg-white p-4 transition-all ${
                isSelected(review.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex gap-4">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={isSelected(review.id)}
                  onChange={() => toggleSelection(review.id)}
                  className="mt-1"
                />

                {/* Content */}
                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating)}
                      {getPriorityBadge(review.reportCount)}
                      {review.verifiedPurchase && (
                        <Badge variant="success">Doğrulanmış</Badge>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                    </span>
                  </div>

                  {/* Review Text */}
                  <p className="text-sm text-gray-700">{review.comment}</p>

                  {/* Reviewer Info */}
                  <div className="text-xs text-gray-500">
                    <span className="font-medium">
                      {review.reviewer?.name || 'Anonim'}
                    </span>
                    {review.projectTitle && (
                      <>
                        {' • '}
                        <span>{review.projectTitle}</span>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <UnifiedButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewingReview(review)}
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      Detay
                    </UnifiedButton>

                    <UnifiedButton
                      variant="success"
                      size="sm"
                      onClick={() => handleApprove(review.id)}
                      disabled={isProcessing}
                    >
                      <Check className="mr-1 h-3 w-3" />
                      Onayla
                    </UnifiedButton>

                    <UnifiedButton
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowRejectModal(review.id)}
                      disabled={isProcessing}
                    >
                      <X className="mr-1 h-3 w-3" />
                      Reddet
                    </UnifiedButton>
                  </div>
                </div>
              </div>
            </div>
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

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-medium">İncelemeyi Reddet</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Red nedeni (en az 10 karakter)..."
              className="mb-4 min-h-[100px] w-full rounded-lg border border-gray-300 p-3 text-sm"
            />
            <div className="flex justify-end gap-2">
              <UnifiedButton
                variant="ghost"
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectReason('');
                }}
              >
                İptal
              </UnifiedButton>
              <UnifiedButton
                variant="destructive"
                onClick={() => handleReject(showRejectModal)}
                disabled={rejectReason.length < 10 || isProcessing}
              >
                Reddet
              </UnifiedButton>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Reject Modal */}
      {showBulkRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-medium">
              {selectedReviews.length} İncelemeyi Reddet
            </h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Red nedeni (en az 10 karakter)..."
              className="mb-4 min-h-[100px] w-full rounded-lg border border-gray-300 p-3 text-sm"
            />
            <div className="flex justify-end gap-2">
              <UnifiedButton
                variant="ghost"
                onClick={() => {
                  setShowBulkRejectModal(false);
                  setRejectReason('');
                }}
              >
                İptal
              </UnifiedButton>
              <UnifiedButton
                variant="destructive"
                onClick={handleBulkReject}
                disabled={rejectReason.length < 10 || isProcessing}
              >
                Tümünü Reddet
              </UnifiedButton>
            </div>
          </div>
        </div>
      )}

      {/* Escalate Modal - Sprint 1 Story 1.2 */}
      {showEscalateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <ArrowUpCircle className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-medium">İncelemeleri Yükselt</h3>
            </div>
            <p className="mb-4 text-sm text-gray-600">
              {selectedReviews.length} inceleme yöneticilere yükseltilecek.
              Lütfen sebep ve öncelik belirtin:
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
              <UnifiedButton
                variant="ghost"
                onClick={() => {
                  setShowEscalateModal(false);
                  setEscalateReason('');
                  setEscalatePriority('MEDIUM');
                }}
              >
                İptal
              </UnifiedButton>
              <UnifiedButton
                variant="warning"
                onClick={handleBulkEscalate}
                disabled={escalateReason.length < 10 || isProcessing}
              >
                <ArrowUpCircle className="mr-2 h-4 w-4" />
                Yükselt
              </UnifiedButton>
            </div>
          </div>
        </div>
      )}

      {/* Review Detail Modal */}
      {viewingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6">
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-lg font-medium">İnceleme Detayı</h3>
              <button
                onClick={() => setViewingReview(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {renderStars(viewingReview.rating)}
                {getPriorityBadge(viewingReview.reportCount)}
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-700">{viewingReview.comment}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Değerlendiren:</span>
                  <p className="text-gray-600">
                    {viewingReview.reviewer?.name || 'Anonim'}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Proje:</span>
                  <p className="text-gray-600">
                    {viewingReview.projectTitle || 'Belirtilmemiş'}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Tarih:</span>
                  <p className="text-gray-600">
                    {new Date(viewingReview.createdAt).toLocaleDateString(
                      'tr-TR'
                    )}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Durum:</span>
                  <p className="text-gray-600">
                    {viewingReview.status || 'Beklemede'}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <UnifiedButton
                  variant="success"
                  onClick={() => handleApprove(viewingReview.id)}
                  disabled={isProcessing}
                >
                  <Check className="mr-1 h-4 w-4" />
                  Onayla
                </UnifiedButton>
                <UnifiedButton
                  variant="destructive"
                  onClick={() => {
                    setShowRejectModal(viewingReview.id);
                    setViewingReview(null);
                  }}
                  disabled={isProcessing}
                >
                  <X className="mr-1 h-4 w-4" />
                  Reddet
                </UnifiedButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
