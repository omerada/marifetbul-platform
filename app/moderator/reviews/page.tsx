/**
 * ================================================
 * REVIEW MODERATION PAGE
 * ================================================
 * Flagged review moderation interface
 *
 * Sprint 2.3: Review Moderation
 * @version 3.0.0
 * @author MarifetBul Development Team
 */

'use client';

import React, { useState } from 'react';
import { logger } from '@/lib/shared/utils/logger';
import {
  Star,
  Flag,
  Check,
  X,
  AlertTriangle,
  Ban,
  Search,
  Eye,
  Loader2,
} from 'lucide-react';
import {
  usePendingReviews,
  useFlaggedReviews,
  useReviewActions,
  useUserModerationActions,
} from '@/hooks';
import { ReviewStatus } from '@/types/business/moderation';
import type { ReviewDto } from '@/types/business/moderation';

type ReviewStatusFilter = ReviewStatus | 'ALL' | 'FLAGGED';

export default function ModeratorReviewsPage() {
  const [selectedStatus, setSelectedStatus] =
    useState<ReviewStatusFilter>('FLAGGED');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReview, setSelectedReview] = useState<ReviewDto | null>(null);
  const [page, setPage] = useState(0);
  const [showUserActionModal, setShowUserActionModal] = useState<{
    type: 'warn' | 'ban';
    userId: string;
    reviewId: string;
  } | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [banDuration, setBanDuration] = useState(7);
  const pageSize = 20;

  // Fetch reviews based on status
  const {
    reviews: pendingReviews,
    total: pendingTotal,
    isLoading: pendingLoading,
  } = usePendingReviews(page, pageSize);

  const {
    reviews: flaggedReviews,
    total: flaggedTotal,
    isLoading: flaggedLoading,
  } = useFlaggedReviews(page, pageSize);

  // Actions
  const {
    approve,
    reject,
    isProcessing: isReviewProcessing,
  } = useReviewActions();
  const {
    warn,
    ban,
    isProcessing: isUserProcessing,
  } = useUserModerationActions();

  const isProcessing = isReviewProcessing || isUserProcessing;

  // Get current reviews based on filter
  const getCurrentReviews = () => {
    switch (selectedStatus) {
      case ReviewStatus.PENDING:
        return {
          reviews: pendingReviews,
          total: pendingTotal,
          isLoading: pendingLoading,
        };
      case 'FLAGGED':
        return {
          reviews: flaggedReviews,
          total: flaggedTotal,
          isLoading: flaggedLoading,
        };
      case ReviewStatus.APPROVED:
        return { reviews: [], total: 0, isLoading: false }; // Not implemented yet
      case ReviewStatus.REJECTED:
        return { reviews: [], total: 0, isLoading: false }; // Not implemented yet
      case 'ALL':
        return {
          reviews: [...pendingReviews, ...flaggedReviews],
          total: pendingTotal + flaggedTotal,
          isLoading: pendingLoading || flaggedLoading,
        };
      default:
        return {
          reviews: flaggedReviews,
          total: flaggedTotal,
          isLoading: flaggedLoading,
        };
    }
  };

  const { reviews, total, isLoading } = getCurrentReviews();

  // Filter by search query
  const filteredReviews = searchQuery
    ? reviews.filter(
        (review) =>
          review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
          review.reviewerName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          review.packageTitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : reviews;

  const handleApprove = async (reviewId: string) => {
    try {
      await approve(reviewId);
      setSelectedReview(null);
    } catch (error) {
      logger.error('Approve review failed:', error);
    }
  };

  const handleRemove = async (reviewId: string, reason: string) => {
    try {
      await reject(reviewId, reason);
      setSelectedReview(null);
    } catch (error) {
      logger.error('Remove review failed:', error);
    }
  };

  const handleWarnUser = async (userId: string, reviewId: string) => {
    setShowUserActionModal({ type: 'warn', userId, reviewId });
  };

  const handleBanUser = async (userId: string, reviewId: string) => {
    setShowUserActionModal({ type: 'ban', userId, reviewId });
  };

  const handleConfirmUserAction = async () => {
    if (!showUserActionModal) return;

    try {
      if (showUserActionModal.type === 'warn') {
        await warn(
          showUserActionModal.userId,
          actionReason || 'Uygunsuz değerlendirme',
          'Değerlendirme kurallarına uymayan içerik paylaştınız.'
        );
      } else {
        await ban(
          showUserActionModal.userId,
          actionReason || 'Tekrarlayan uygunsuz değerlendirmeler',
          banDuration,
          false
        );
      }
      setShowUserActionModal(null);
      setActionReason('');
    } catch (error) {
      logger.error('User action failed:', error);
    }
  };

  const getFlagReasonLabel = (reason: string): string => {
    const labels: Record<string, string> = {
      SPAM: 'Spam',
      INAPPROPRIATE_CONTENT: 'Uygunsuz İçerik',
      FALSE_INFORMATION: 'Yanlış Bilgi',
      PROMOTIONAL_LINK: 'Reklam Linki',
      OFFENSIVE_LANGUAGE: 'Hakaret',
      HARASSMENT: 'Taciz',
    };
    return labels[reason] || reason;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Değerlendirme Moderasyonu
        </h1>
        <p className="mt-2 text-gray-600">
          İşaretlenmiş değerlendirmeleri inceleyin ve işlem yapın
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto">
          {(
            [
              'ALL',
              'FLAGGED',
              ReviewStatus.PENDING,
              ReviewStatus.APPROVED,
              ReviewStatus.REJECTED,
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
              {status === 'FLAGGED' && 'İşaretli'}
              {status === ReviewStatus.PENDING && 'Bekleyen'}
              {status === ReviewStatus.APPROVED && 'Onaylı'}
              {status === ReviewStatus.REJECTED && 'Kaldırılan'}
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
            placeholder="Değerlendirme ara..."
            className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
            {searchQuery
              ? 'Arama kriterlerine uygun değerlendirme bulunamadı'
              : 'Gösterilecek değerlendirme bulunmuyor'}
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                {/* Review Content */}
                <div className="flex-1">
                  {/* Header */}
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                      <span className="text-sm font-medium text-gray-600">
                        {review.reviewerName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {review.reviewerName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {review.packageTitle}
                      </p>
                    </div>
                    {/* Rating */}
                    <div className="ml-auto flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="mb-3 text-gray-900">{review.comment}</p>

                  {/* Flag Info */}
                  <div className="flex items-center gap-4">
                    {review.flaggedCount > 0 && (
                      <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5">
                        <Flag className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-red-700">
                          {review.flaggedCount} işaretleme
                        </span>
                      </div>
                    )}
                    {review.flagReasons && review.flagReasons.length > 0 && (
                      <div className="flex gap-2">
                        {review.flagReasons.map((reason, idx) => (
                          <span
                            key={idx}
                            className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700"
                          >
                            {getFlagReasonLabel(reason)}
                          </span>
                        ))}
                      </div>
                    )}
                    <span
                      className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium ${
                        review.status === ReviewStatus.PENDING
                          ? 'bg-yellow-100 text-yellow-700'
                          : review.status === ReviewStatus.APPROVED
                            ? 'bg-green-100 text-green-700'
                            : review.status === ReviewStatus.REJECTED
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {review.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleString('tr-TR')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
                <button
                  onClick={() => setSelectedReview(review)}
                  disabled={isProcessing}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  <Eye className="h-4 w-4" />
                  Detay
                </button>
                <button
                  onClick={() => handleApprove(review.id)}
                  disabled={isProcessing}
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  Onayla
                </button>
                <button
                  onClick={() => handleRemove(review.id, 'Uygunsuz içerik')}
                  disabled={isProcessing}
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  Kaldır
                </button>
                <button
                  onClick={() => handleWarnUser(review.reviewerId, review.id)}
                  disabled={isProcessing}
                  className="flex items-center gap-2 rounded-lg bg-yellow-600 px-4 py-2 text-sm text-white hover:bg-yellow-700 disabled:opacity-50"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Uyar
                </button>
                <button
                  onClick={() => handleBanUser(review.reviewerId, review.id)}
                  disabled={isProcessing}
                  className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-900 disabled:opacity-50"
                >
                  <Ban className="h-4 w-4" />
                  Engelle
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedReview && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Değerlendirme Detayı
              </h2>
              <button
                onClick={() => setSelectedReview(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Reviewer Info */}
            <div className="mb-6 rounded-lg bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                  <span className="text-lg font-medium text-gray-600">
                    {selectedReview.reviewerName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedReview.reviewerName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedReview.packageTitle}
                  </p>
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="mb-6">
              <p className="mb-2 text-sm font-medium text-gray-700">
                Genel Değerlendirme
              </p>
              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-6 w-6 ${
                      i < selectedReview.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-lg font-semibold text-gray-900">
                  {selectedReview.rating}/5
                </span>
              </div>
            </div>

            {/* Review Text */}
            <div className="mb-6">
              <p className="mb-2 text-sm font-medium text-gray-700">Yorum</p>
              <p className="text-gray-900">{selectedReview.comment}</p>
            </div>

            {/* Flag Details */}
            <div className="mb-6">
              <p className="mb-2 text-sm font-medium text-gray-700">
                İşaretleme Detayları
              </p>
              {selectedReview.flaggedCount > 0 ? (
                <div className="space-y-2">
                  {selectedReview.flagReasons.map((reason, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg bg-red-50 p-3"
                    >
                      <span className="font-medium text-red-900">
                        {getFlagReasonLabel(reason)}
                      </span>
                    </div>
                  ))}
                  <div className="mt-2 rounded-lg bg-red-100 p-3">
                    <span className="text-sm font-medium text-red-800">
                      Toplam {selectedReview.flaggedCount} işaretleme
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">İşaretleme bulunmuyor</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  handleApprove(selectedReview.id);
                  setSelectedReview(null);
                }}
                disabled={isProcessing}
                className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
              >
                Onayla
              </button>
              <button
                onClick={() => {
                  handleRemove(selectedReview.id, 'Uygunsuz içerik');
                  setSelectedReview(null);
                }}
                disabled={isProcessing}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
              >
                Kaldır
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Sayfa {page + 1} - Toplam {total} değerlendirme
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

      {/* User Action Modal (Warn/Ban) */}
      {showUserActionModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {showUserActionModal.type === 'warn'
                  ? 'Kullanıcıyı Uyar'
                  : 'Kullanıcıyı Engelle'}
              </h2>
              <button
                onClick={() => {
                  setShowUserActionModal(null);
                  setActionReason('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Reason */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Neden
                </label>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="İşlem nedenini açıklayın..."
                  className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none"
                  rows={3}
                />
              </div>

              {/* Ban Duration */}
              {showUserActionModal.type === 'ban' && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Engelleme Süresi (Gün)
                  </label>
                  <input
                    type="number"
                    value={banDuration}
                    onChange={(e) => setBanDuration(Number(e.target.value))}
                    min={1}
                    max={365}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowUserActionModal(null);
                    setActionReason('');
                  }}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  onClick={handleConfirmUserAction}
                  disabled={isProcessing || !actionReason}
                  className={`flex-1 rounded-lg px-4 py-2 text-white disabled:opacity-50 ${
                    showUserActionModal.type === 'warn'
                      ? 'bg-yellow-600 hover:bg-yellow-700'
                      : 'bg-gray-800 hover:bg-gray-900'
                  }`}
                >
                  {showUserActionModal.type === 'warn' ? 'Uyar' : 'Engelle'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
