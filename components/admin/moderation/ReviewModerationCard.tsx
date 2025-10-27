/**
 * ================================================
 * REVIEW MODERATION CARD COMPONENT
 * ================================================
 * Detailed review card with moderation actions for admins
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 2
 */

'use client';

import { useState } from 'react';
import {
  ReviewStatus,
  ReviewType,
  type ReviewResponse,
} from '@/lib/api/admin/moderation';
import { adminModerationApi } from '@/lib/api/admin/moderation';
import { logger } from '@/lib/shared/utils/logger';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trash2,
  Star,
  User,
  Calendar,
  MessageSquare,
  Flag,
  ExternalLink,
  Shield,
} from 'lucide-react';

interface ReviewModerationCardProps {
  review: ReviewResponse;
  onReviewUpdated?: () => void;
  showFullDetails?: boolean;
  compact?: boolean;
}

/**
 * ReviewModerationCard Component
 *
 * Displays detailed review information with moderation actions
 *
 * Features:
 * - Review details (rating, comment, reviewer info)
 * - Moderation actions (approve, reject, resolve flag, delete)
 * - Confirmation dialogs for destructive actions
 * - Moderator notes input for reject actions
 * - Status badges and flag indicators
 * - Responsive layout
 *
 * @example
 * ```tsx
 * <ReviewModerationCard
 *   review={review}
 *   onReviewUpdated={handleReviewUpdate}
 *   showFullDetails={true}
 * />
 * ```
 */
export default function ReviewModerationCard({
  review,
  onReviewUpdated,
  showFullDetails = true,
  compact = false,
}: ReviewModerationCardProps) {
  const [loading, setLoading] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  // ================================================
  // MODERATION ACTIONS
  // ================================================

  const handleApprove = async () => {
    try {
      setLoading(true);
      setError(null);
      await adminModerationApi.approveReview(review.id);
      logger.info('Review approved', { reviewId: review.id });
      onReviewUpdated?.();
    } catch (err) {
      setError('İnceleme onaylanamadı');
      logger.error('Failed to approve review', {
        error: err,
        reviewId: review.id,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setError('Lütfen red nedeni giriniz');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await adminModerationApi.rejectReview(review.id, rejectReason);
      logger.info('Review rejected', {
        reviewId: review.id,
        reason: rejectReason,
      });
      setShowRejectDialog(false);
      setRejectReason('');
      onReviewUpdated?.();
    } catch (err) {
      setError('İnceleme reddedilemedi');
      logger.error('Failed to reject review', {
        error: err,
        reviewId: review.id,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResolveFlag = async () => {
    try {
      setLoading(true);
      setError(null);
      await adminModerationApi.resolveFlag(review.id, 'Flag resolved by admin');
      logger.info('Review flag resolved', { reviewId: review.id });
      onReviewUpdated?.();
    } catch (err) {
      setError('Bayrak çözümlenemedi');
      logger.error('Failed to resolve flag', {
        error: err,
        reviewId: review.id,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      await adminModerationApi.deleteReview(review.id);
      logger.info('Review deleted', { reviewId: review.id });
      setShowDeleteDialog(false);
      onReviewUpdated?.();
    } catch (err) {
      setError('İnceleme silinemedi');
      logger.error('Failed to delete review', {
        error: err,
        reviewId: review.id,
      });
    } finally {
      setLoading(false);
    }
  };

  // ================================================
  // RENDER HELPERS
  // ================================================

  const getStatusBadge = () => {
    const statusConfig = {
      [ReviewStatus.PENDING]: {
        color: 'bg-yellow-100 text-yellow-800',
        icon: AlertTriangle,
        label: 'Beklemede',
      },
      [ReviewStatus.APPROVED]: {
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        label: 'Onaylandı',
      },
      [ReviewStatus.REJECTED]: {
        color: 'bg-red-100 text-red-800',
        icon: XCircle,
        label: 'Reddedildi',
      },
      [ReviewStatus.FLAGGED]: {
        color: 'bg-orange-100 text-orange-800',
        icon: Flag,
        label: 'Bayraklı',
      },
    };

    const config =
      statusConfig[review.status] || statusConfig[ReviewStatus.PENDING];
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${config.color}`}
      >
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  const getTypeBadge = () => {
    const typeConfig: Record<ReviewType, { color: string; label: string }> = {
      [ReviewType.PACKAGE]: {
        color: 'bg-blue-100 text-blue-800',
        label: 'Paket',
      },
      [ReviewType.ORDER]: {
        color: 'bg-green-100 text-green-800',
        label: 'Sipariş',
      },
      [ReviewType.FREELANCER]: {
        color: 'bg-purple-100 text-purple-800',
        label: 'Freelancer',
      },
      [ReviewType.EMPLOYER]: {
        color: 'bg-orange-100 text-orange-800',
        label: 'İşveren',
      },
    };

    const config = typeConfig[review.type] || typeConfig[ReviewType.PACKAGE];

    return (
      <span
        className={`rounded-md px-2 py-1 text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const renderRatingStars = () => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`h-4 w-4 ${
              index < review.rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1.5 text-sm font-medium text-gray-700">
          {review.rating}/5
        </span>
      </div>
    );
  };

  // ================================================
  // COMPACT VIEW
  // ================================================

  if (compact) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              {getStatusBadge()}
              {getTypeBadge()}
              {review.flaggedCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                  <Flag className="h-3 w-3" />
                  Bayraklı ({review.flaggedCount})
                </span>
              )}
            </div>

            <div className="mb-2">{renderRatingStars()}</div>

            <p className="mb-2 line-clamp-2 text-sm text-gray-700">
              {review.comment}
            </p>

            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {review.reviewerName}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(review.createdAt).toLocaleDateString('tr-TR')}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            {review.status === ReviewStatus.PENDING && (
              <>
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="rounded-lg p-2 text-green-600 transition-colors hover:bg-green-50 disabled:opacity-50"
                  title="Onayla"
                >
                  <CheckCircle className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowRejectDialog(true)}
                  disabled={loading}
                  className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                  title="Reddet"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
    );
  }

  // ================================================
  // FULL DETAILS VIEW
  // ================================================

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {getStatusBadge()}
            {getTypeBadge()}
            {review.flaggedCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                <Flag className="h-3.5 w-3.5" />
                Bayraklı İnceleme ({review.flaggedCount})
              </span>
            )}
          </div>

          <span className="text-sm text-gray-500">
            #{review.id.slice(0, 8)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          {renderRatingStars()}
          <span className="text-sm text-gray-500">
            {new Date(review.createdAt).toLocaleString('tr-TR')}
          </span>
        </div>
      </div>

      {/* Review Content */}
      <div className="space-y-4 p-6">
        {/* Comment */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-gray-400" />
            <h4 className="text-sm font-medium text-gray-700">Yorum</h4>
          </div>
          <p className="leading-relaxed whitespace-pre-wrap text-gray-700">
            {review.comment}
          </p>
        </div>

        {/* Reviewer Info */}
        <div className="grid gap-4 border-t border-gray-200 pt-4 md:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <h4 className="text-sm font-medium text-gray-700">
                İncelemeyi Yapan
              </h4>
            </div>
            <p className="font-medium text-gray-900">{review.reviewerName}</p>
            <p className="text-sm text-gray-500">ID: {review.reviewerId}</p>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-gray-400" />
              <h4 className="text-sm font-medium text-gray-700">
                İncelenen{' '}
                {review.type === ReviewType.PACKAGE ? 'Paket' : 'Satıcı'}
              </h4>
            </div>
            <p className="font-medium text-gray-900">
              {review.targetName || 'N/A'}
            </p>
            <p className="text-sm text-gray-500">ID: {review.targetId}</p>
          </div>
        </div>

        {/* Flag Info */}
        {review.flaggedCount > 0 &&
          review.flagReasons &&
          review.flagReasons.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-2">
                <Flag className="mt-0.5 h-4 w-4 text-red-600" />
                <div>
                  <h4 className="mb-1 text-sm font-medium text-red-900">
                    Bayrak Nedenleri ({review.flaggedCount})
                  </h4>
                  <ul className="space-y-1 text-sm text-red-700">
                    {review.flagReasons.map((reason, idx) => (
                      <li key={idx}>• {reason}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

        {/* Moderation Info */}
        {showFullDetails && (review.moderatedAt || review.moderatedBy) && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-start gap-2">
              <Shield className="mt-0.5 h-4 w-4 text-gray-600" />
              <div className="flex-1">
                <h4 className="mb-2 text-sm font-medium text-gray-900">
                  Moderasyon Bilgileri
                </h4>
                <div className="space-y-1 text-sm text-gray-600">
                  {review.moderatedBy && <p>Moderatör: {review.moderatedBy}</p>}
                  {review.moderatedAt && (
                    <p>
                      Moderasyon Tarihi:{' '}
                      {new Date(review.moderatedAt).toLocaleString('tr-TR')}
                    </p>
                  )}
                  {review.moderatorNotes && (
                    <p className="mt-2 border-t border-gray-300 pt-2">
                      Not: {review.moderatorNotes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="border-t border-gray-200 bg-gray-50 p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-3">
            {review.status === ReviewStatus.PENDING && (
              <>
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  Onayla
                </button>

                <button
                  onClick={() => setShowRejectDialog(true)}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" />
                  Reddet
                </button>
              </>
            )}

            {review.flaggedCount > 0 && (
              <button
                onClick={handleResolveFlag}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Flag className="h-4 w-4" />
                Bayrağı Çözümle
              </button>
            )}
          </div>

          <button
            onClick={() => setShowDeleteDialog(true)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            Sil
          </button>
        </div>
      </div>

      {/* Reject Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              İncelemeyi Reddet
            </h3>

            <p className="mb-4 text-sm text-gray-600">
              Bu incelemeyi reddetmek üzeresiniz. Lütfen red nedenini
              belirtiniz:
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Red nedeni..."
              rows={4}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-red-500"
            />

            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectReason('');
                  setError(null);
                }}
                disabled={loading}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                İptal
              </button>
              <button
                onClick={handleReject}
                disabled={loading}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Reddediliyor...' : 'Reddet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              İncelemeyi Sil
            </h3>

            <p className="mb-6 text-sm text-gray-600">
              Bu işlem geri alınamaz. İncelemeyi kalıcı olarak silmek
              istediğinizden emin misiniz?
            </p>

            {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setError(null);
                }}
                disabled={loading}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                İptal
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Siliniyor...' : 'Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
