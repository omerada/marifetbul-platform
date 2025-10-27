/**
 * ================================================
 * PENDING REVIEWS LIST COMPONENT
 * ================================================
 * Admin component for reviewing and moderating pending reviews
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 2
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle,
  XCircle,
  Eye,
  AlertTriangle,
  Search,
  Filter,
  CheckSquare,
  Square,
  Trash2,
} from 'lucide-react';
import { logger } from '@/lib/shared/utils/logger';
import adminModerationApi, {
  type ReviewSummary,
  ReviewStatus,
  ReviewType,
} from '@/lib/api/admin/moderation';

// ================================================
// TYPES
// ================================================

interface PendingReviewsListProps {
  /**
   * Filter by status (optional)
   */
  filterStatus?: ReviewStatus;

  /**
   * Filter by type (optional)
   */
  filterType?: ReviewType;

  /**
   * Callback when review is moderated
   */
  onReviewModerated?: () => void;
}

// ================================================
// MAIN COMPONENT
// ================================================

export function PendingReviewsList({
  filterStatus,
  filterType,
  onReviewModerated,
}: PendingReviewsListProps) {
  const [reviews, setReviews] = useState<ReviewSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReviews, setSelectedReviews] = useState<Set<string>>(
    new Set()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [bulkAction, setBulkAction] = useState(false);

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let response;

      if (filterStatus === ReviewStatus.PENDING) {
        response = await adminModerationApi.getPendingReviews(currentPage, 20);
      } else if (filterStatus === ReviewStatus.FLAGGED) {
        response = await adminModerationApi.getFlaggedReviews(currentPage, 20);
      } else {
        response = await adminModerationApi.getAllReviews({
          status: filterStatus,
          type: filterType,
          page: currentPage,
          size: 20,
        });
      }

      setReviews(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err) {
      setError('İncelemeler yüklenemedi');
      logger.error('Failed to load reviews', { error: err });
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterType, currentPage]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleApprove = async (reviewId: string) => {
    try {
      await adminModerationApi.approveReview(reviewId);
      logger.info('Review approved', { reviewId });

      // Remove from list
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      onReviewModerated?.();
    } catch (err) {
      logger.error('Failed to approve review', { reviewId, error: err });
      setError('İnceleme onaylanamadı');
    }
  };

  const handleReject = async (reviewId: string) => {
    const reason = prompt('Reddetme nedeni:');
    if (!reason) return;

    try {
      await adminModerationApi.rejectReview(reviewId, reason);
      logger.info('Review rejected', { reviewId, reason });

      // Remove from list
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      onReviewModerated?.();
    } catch (err) {
      logger.error('Failed to reject review', { reviewId, error: err });
      setError('İnceleme reddedilemedi');
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (
      !confirm('Bu incelemeyi kalıcı olarak silmek istediğinize emin misiniz?')
    )
      return;

    try {
      await adminModerationApi.deleteReview(reviewId);
      logger.info('Review deleted', { reviewId });

      // Remove from list
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      onReviewModerated?.();
    } catch (err) {
      logger.error('Failed to delete review', { reviewId, error: err });
      setError('İnceleme silinemedi');
    }
  };

  const toggleSelectReview = (reviewId: string) => {
    setSelectedReviews((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedReviews.size === reviews.length) {
      setSelectedReviews(new Set());
    } else {
      setSelectedReviews(new Set(reviews.map((r) => r.id)));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedReviews.size === 0) return;
    if (
      !confirm(
        `${selectedReviews.size} incelemeyi onaylamak istediğinize emin misiniz?`
      )
    )
      return;

    try {
      setBulkAction(true);
      const result = await adminModerationApi.bulkApproveReviews(
        Array.from(selectedReviews)
      );

      logger.info('Bulk approve completed', result);

      // Remove approved from list
      setReviews((prev) => prev.filter((r) => !selectedReviews.has(r.id)));
      setSelectedReviews(new Set());
      onReviewModerated?.();

      alert(
        `${result.success} inceleme onaylandı. ${result.failed} başarısız.`
      );
    } catch (err) {
      logger.error('Bulk approve failed', { error: err });
      setError('Toplu onaylama başarısız');
    } finally {
      setBulkAction(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedReviews.size === 0) return;
    const reason = prompt('Toplu reddetme nedeni:');
    if (!reason) return;

    try {
      setBulkAction(true);
      const result = await adminModerationApi.bulkRejectReviews(
        Array.from(selectedReviews),
        reason
      );

      logger.info('Bulk reject completed', result);

      // Remove rejected from list
      setReviews((prev) => prev.filter((r) => !selectedReviews.has(r.id)));
      setSelectedReviews(new Set());
      onReviewModerated?.();

      alert(
        `${result.success} inceleme reddedildi. ${result.failed} başarısız.`
      );
    } catch (err) {
      logger.error('Bulk reject failed', { error: err });
      setError('Toplu reddetme başarısız');
    } finally {
      setBulkAction(false);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      review.reviewerName.toLowerCase().includes(query) ||
      review.comment?.toLowerCase().includes(query) ||
      review.id.toLowerCase().includes(query)
    );
  });

  const getStatusBadge = (status: ReviewStatus) => {
    const badges = {
      [ReviewStatus.PENDING]: (
        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
          <AlertTriangle className="h-3 w-3" />
          Beklemede
        </span>
      ),
      [ReviewStatus.APPROVED]: (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
          <CheckCircle className="h-3 w-3" />
          Onaylandı
        </span>
      ),
      [ReviewStatus.REJECTED]: (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
          <XCircle className="h-3 w-3" />
          Reddedildi
        </span>
      ),
      [ReviewStatus.FLAGGED]: (
        <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800">
          <AlertTriangle className="h-3 w-3" />
          İşaretli
        </span>
      ),
    };

    return badges[status];
  };

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-gray-200 bg-white p-6"
          >
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-1/3 rounded bg-gray-200" />
                <div className="h-3 w-full rounded bg-gray-200" />
                <div className="h-3 w-2/3 rounded bg-gray-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            İnceleme Moderasyonu
          </h2>
          <p className="text-sm text-gray-600">
            {totalElements} inceleme bulundu
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ara..."
            className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:w-64"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedReviews.size > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-medium text-blue-900">
            {selectedReviews.size} inceleme seçildi
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkApprove}
              disabled={bulkAction}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              Toplu Onayla
            </button>
            <button
              onClick={handleBulkReject}
              disabled={bulkAction}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" />
              Toplu Reddet
            </button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
            <Filter className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              İnceleme bulunamadı
            </h3>
            <p className="text-gray-600">
              Kriterlere uygun bekleyen inceleme yok.
            </p>
          </div>
        ) : (
          <>
            {/* Select All */}
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <button
                onClick={toggleSelectAll}
                className="text-gray-600 transition-colors hover:text-gray-900"
              >
                {selectedReviews.size === reviews.length ? (
                  <CheckSquare className="h-5 w-5" />
                ) : (
                  <Square className="h-5 w-5" />
                )}
              </button>
              <span className="text-sm font-medium text-gray-700">
                Tümünü Seç
              </span>
            </div>

            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className={`rounded-lg border bg-white p-6 transition-colors ${
                  selectedReviews.has(review.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleSelectReview(review.id)}
                    className="mt-1 text-gray-400 transition-colors hover:text-blue-600"
                  >
                    {selectedReviews.has(review.id) ? (
                      <CheckSquare className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Square className="h-5 w-5" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1">
                    {/* Header */}
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                          {review.reviewerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {review.reviewerName}
                          </p>
                          <div className="flex items-center gap-2">
                            {getRatingStars(review.rating)}
                            <span className="text-sm text-gray-600">
                              {new Date(review.createdAt).toLocaleDateString(
                                'tr-TR'
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(review.status)}
                        {review.flaggedCount > 0 && (
                          <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                            {review.flaggedCount} işaret
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Comment */}
                    {review.comment && (
                      <p className="mb-4 text-gray-700">{review.comment}</p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(review.id)}
                        className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Onayla
                      </button>
                      <button
                        onClick={() => handleReject(review.id)}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
                      >
                        <XCircle className="h-4 w-4" />
                        Reddet
                      </button>
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Sil
                      </button>
                      <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                        <Eye className="h-4 w-4" />
                        Detay
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            Önceki
          </button>
          <span className="text-sm text-gray-600">
            Sayfa {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
            }
            disabled={currentPage >= totalPages - 1}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            Sonraki
          </button>
        </div>
      )}
    </div>
  );
}

export default PendingReviewsList;
