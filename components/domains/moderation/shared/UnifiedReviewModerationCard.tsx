/**
 * ================================================
 * UNIFIED REVIEW MODERATION CARD
 * ================================================
 * Single, reusable component for both Admin & Moderator review moderation
 * Eliminates duplicate code and ensures consistency
 *
 * Features:
 * - Role-based rendering (admin vs moderator views)
 * - Compact & detailed view modes
 * - All moderation actions (approve, reject, escalate, delete)
 * - Flag resolution support
 * - Bulk selection support
 * - Optimistic UI updates
 *
 * Sprint 1 - EPIC 1.1: Component Deduplication
 * @author MarifetBul Development Team
 * @version 2.0.0
 * @updated November 8, 2025 - Consolidated types to @/types/business/moderation
 */

'use client';

import { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trash2,
  Star,
  User,
  MessageSquare,
  Flag,
  ExternalLink,
  Shield,
  ArrowUpCircle,
  Eye,
  type LucideIcon,
} from 'lucide-react';
import { UnifiedButton, Badge } from '@/components/ui';
import logger from '@/lib/infrastructure/monitoring/logger';
import type { Review as ReviewResponse } from '@/types/business/review';
import type { ViewMode, UserRole } from '@/types/business/moderation';

// ============================================================================
// TYPES
// ============================================================================

export interface UnifiedReviewModerationCardProps {
  review: ReviewResponse;
  role?: UserRole;
  viewMode?: ViewMode;
  showFullDetails?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (reviewId: string) => void;
  onApprove?: (reviewId: string) => Promise<boolean>;
  onReject?: (reviewId: string, reason: string) => Promise<boolean>;
  onEscalate?: (
    reviewId: string,
    reason: string,
    priority: string
  ) => Promise<boolean>;
  onDelete?: (reviewId: string) => Promise<boolean>;
  onResolveFlag?: (reviewId: string) => Promise<boolean>;
  onViewDetails?: (review: ReviewResponse) => void;
  onUpdated?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function UnifiedReviewModerationCard({
  review,
  role = 'moderator',
  viewMode = 'card',
  showFullDetails = false,
  selectable = false,
  selected = false,
  onSelect,
  onApprove,
  onReject,
  onEscalate,
  onDelete,
  onResolveFlag,
  onViewDetails,
  onUpdated,
}: UnifiedReviewModerationCardProps) {
  const [loading, setLoading] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showEscalateDialog, setShowEscalateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [escalateReason, setEscalateReason] = useState('');
  const [escalatePriority, setEscalatePriority] = useState<
    'HIGH' | 'MEDIUM' | 'LOW'
  >('MEDIUM');
  const [error, setError] = useState<string | null>(null);

  // ================================================
  // HANDLERS
  // ================================================

  const handleApprove = async () => {
    try {
      setLoading(true);
      setError(null);

      if (onApprove) {
        const success = await onApprove(review.id);
        if (success) {
          logger.info('Review approved', { reviewId: review.id });
          onUpdated?.();
        }
      }
    } catch (err) {
      setError('İnceleme onaylanamadı');
      logger.error(
        'Failed to approve review',
        err instanceof Error ? err : new Error(String(err)),
        { reviewId: review.id }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim() || rejectReason.length < 10) {
      setError('Lütfen en az 10 karakter red nedeni giriniz');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (onReject) {
        const success = await onReject(review.id, rejectReason);
        if (success) {
          logger.info('Review rejected', {
            reviewId: review.id,
            reason: rejectReason,
          });
          setShowRejectDialog(false);
          setRejectReason('');
          onUpdated?.();
        }
      }
    } catch (err) {
      setError('İnceleme reddedilemedi');
      logger.error(
        'Failed to reject review',
        err instanceof Error ? err : new Error(String(err)),
        { reviewId: review.id }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEscalate = async () => {
    if (!escalateReason.trim() || escalateReason.length < 10) {
      setError('Lütfen en az 10 karakter yükseltme nedeni giriniz');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (onEscalate) {
        const success = await onEscalate(
          review.id,
          escalateReason,
          escalatePriority
        );
        if (success) {
          logger.info('Review escalated', {
            reviewId: review.id,
            reason: escalateReason,
            priority: escalatePriority,
          });
          setShowEscalateDialog(false);
          setEscalateReason('');
          setEscalatePriority('MEDIUM');
          onUpdated?.();
        }
      }
    } catch (err) {
      setError('İnceleme yükseltilemedi');
      logger.error(
        'Failed to escalate review',
        err instanceof Error ? err : new Error(String(err)),
        { reviewId: review.id }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResolveFlag = async () => {
    try {
      setLoading(true);
      setError(null);

      if (onResolveFlag) {
        const success = await onResolveFlag(review.id);
        if (success) {
          logger.info('Review flag resolved', { reviewId: review.id });
          onUpdated?.();
        }
      }
    } catch (err) {
      setError('Bayrak çözümlenemedi');
      logger.error(
        'Failed to resolve flag',
        err instanceof Error ? err : new Error(String(err)),
        { reviewId: review.id }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);

      if (onDelete) {
        const success = await onDelete(review.id);
        if (success) {
          logger.info('Review deleted', { reviewId: review.id });
          setShowDeleteDialog(false);
          onUpdated?.();
        }
      }
    } catch (err) {
      setError('İnceleme silinemedi');
      logger.error(
        'Failed to delete review',
        err instanceof Error ? err : new Error(String(err)),
        { reviewId: review.id }
      );
    } finally {
      setLoading(false);
    }
  };

  // ================================================
  // RENDER HELPERS
  // ================================================

  const getStatusBadge = () => {
    const statusConfig: Record<
      string,
      { color: string; icon: LucideIcon; label: string }
    > = {
      PENDING: {
        color: 'bg-yellow-100 text-yellow-800',
        icon: AlertTriangle,
        label: 'Beklemede',
      },
      APPROVED: {
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        label: 'Onaylandı',
      },
      REJECTED: {
        color: 'bg-red-100 text-red-800',
        icon: XCircle,
        label: 'Reddedildi',
      },
      FLAGGED: {
        color: 'bg-orange-100 text-orange-800',
        icon: Flag,
        label: 'Bayraklı',
      },
      ESCALATED: {
        color: 'bg-purple-100 text-purple-800',
        icon: ArrowUpCircle,
        label: 'Yükseltildi',
      },
    };

    const config = statusConfig[review.status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

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
        <span className="ml-1.5 text-sm font-medium text-gray-700">
          {rating}/5
        </span>
      </div>
    );
  };

  const getPriorityBadge = () => {
    if (!review.flaggedCount || review.flaggedCount === 0) return null;

    if (review.flaggedCount >= 5) {
      return (
        <Badge variant="destructive">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Yüksek Öncelik
        </Badge>
      );
    }
    if (review.flaggedCount >= 3) {
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
        {review.flaggedCount} Rapor
      </Badge>
    );
  };

  // ================================================
  // RENDER: COMPACT VIEW
  // ================================================

  if (viewMode === 'compact') {
    return (
      <div
        className={`rounded-lg border bg-white p-4 transition-all ${
          selected
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="flex gap-3">
          {/* Checkbox */}
          {selectable && (
            <input
              type="checkbox"
              checked={selected}
              onChange={() => onSelect?.(review.id)}
              className="mt-1 h-4 w-4 cursor-pointer"
            />
          )}

          {/* Content */}
          <div className="flex-1 space-y-2">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {renderStars(review.rating ?? review.overallRating)}
                {getPriorityBadge()}
              </div>
              <span className="text-xs text-gray-500">
                {new Date(review.createdAt).toLocaleDateString('tr-TR')}
              </span>
            </div>

            {/* Comment */}
            <p className="line-clamp-2 text-sm text-gray-700">
              {review.comment ?? review.reviewText}
            </p>

            {/* Reviewer */}
            <div className="text-xs text-gray-500">
              <span className="font-medium">{review.reviewerName}</span>
              {review.targetName && <> • {review.targetName}</>}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {onViewDetails && (
                <UnifiedButton
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(review)}
                >
                  <Eye className="mr-1 h-3 w-3" />
                  Detay
                </UnifiedButton>
              )}

              {review.status === 'PENDING' && (
                <>
                  <UnifiedButton
                    variant="success"
                    size="sm"
                    onClick={handleApprove}
                    disabled={loading}
                  >
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Onayla
                  </UnifiedButton>

                  <UnifiedButton
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowRejectDialog(true)}
                    disabled={loading}
                  >
                    <XCircle className="mr-1 h-3 w-3" />
                    Reddet
                  </UnifiedButton>

                  {role === 'moderator' && onEscalate && (
                    <UnifiedButton
                      variant="warning"
                      size="sm"
                      onClick={() => setShowEscalateDialog(true)}
                      disabled={loading}
                    >
                      <ArrowUpCircle className="mr-1 h-3 w-3" />
                      Yükselt
                    </UnifiedButton>
                  )}
                </>
              )}
            </div>
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
  // RENDER: DETAILED VIEW
  // ================================================

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-2">
              {selectable && (
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => onSelect?.(review.id)}
                  className="h-4 w-4 cursor-pointer"
                />
              )}
              {getStatusBadge()}
              {getPriorityBadge()}
            </div>
            <span className="text-sm text-gray-500">
              #{review.id.slice(0, 8)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            {renderStars(review.rating ?? review.overallRating)}
            <span className="text-sm text-gray-500">
              {new Date(review.createdAt).toLocaleString('tr-TR')}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 p-6">
          {/* Comment */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-gray-400" />
              <h4 className="text-sm font-medium text-gray-700">Yorum</h4>
            </div>
            <p className="whitespace-pre-wrap text-gray-700">
              {review.comment ?? review.reviewText}
            </p>
          </div>

          {/* Info Grid */}
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

            {review.targetName && (
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                  <h4 className="text-sm font-medium text-gray-700">
                    İncelenen
                  </h4>
                </div>
                <p className="font-medium text-gray-900">{review.targetName}</p>
                <p className="text-sm text-gray-500">ID: {review.targetId}</p>
              </div>
            )}
          </div>

          {/* Flag Reasons */}
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
                      {review.flagReasons.map((flagReason, idx) => (
                        <li key={idx}>
                          • {flagReason.reason} ({flagReason.count}x)
                          {flagReason.descriptions.length > 0 && (
                            <span className="text-xs text-red-600">
                              {' '}
                              - {flagReason.descriptions[0]}
                            </span>
                          )}
                        </li>
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
                    {review.moderatedBy && (
                      <p>Moderatör: {review.moderatedBy}</p>
                    )}
                    {review.moderatedAt && (
                      <p>
                        Tarih:{' '}
                        {new Date(review.moderatedAt).toLocaleString('tr-TR')}
                      </p>
                    )}
                    {review.moderatorNote && (
                      <p className="mt-2 border-t border-gray-300 pt-2">
                        Not: {review.moderatorNote}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 bg-gray-50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              {review.status === 'PENDING' && (
                <>
                  <UnifiedButton
                    variant="success"
                    onClick={handleApprove}
                    disabled={loading}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Onayla
                  </UnifiedButton>

                  <UnifiedButton
                    variant="destructive"
                    onClick={() => setShowRejectDialog(true)}
                    disabled={loading}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reddet
                  </UnifiedButton>

                  {role === 'moderator' && onEscalate && (
                    <UnifiedButton
                      variant="warning"
                      onClick={() => setShowEscalateDialog(true)}
                      disabled={loading}
                    >
                      <ArrowUpCircle className="mr-2 h-4 w-4" />
                      Yükselt
                    </UnifiedButton>
                  )}
                </>
              )}

              {review.flaggedCount > 0 && onResolveFlag && role === 'admin' && (
                <UnifiedButton
                  variant="warning"
                  onClick={handleResolveFlag}
                  disabled={loading}
                >
                  <Flag className="mr-2 h-4 w-4" />
                  Bayrağı Çözümle
                </UnifiedButton>
              )}
            </div>

            {role === 'admin' && onDelete && (
              <UnifiedButton
                variant="ghost"
                onClick={() => setShowDeleteDialog(true)}
                disabled={loading}
                className="border border-red-300 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Sil
              </UnifiedButton>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              İncelemeyi Reddet
            </h3>
            <p className="mb-4 text-sm text-gray-600">
              Lütfen red nedenini belirtiniz (en az 10 karakter):
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
              <UnifiedButton
                variant="ghost"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectReason('');
                  setError(null);
                }}
                disabled={loading}
              >
                İptal
              </UnifiedButton>
              <UnifiedButton
                variant="destructive"
                onClick={handleReject}
                disabled={loading || rejectReason.length < 10}
              >
                {loading ? 'Reddediliyor...' : 'Reddet'}
              </UnifiedButton>
            </div>
          </div>
        </div>
      )}

      {/* Escalate Modal */}
      {showEscalateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <ArrowUpCircle className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                İncelemeyi Yükselt
              </h3>
            </div>
            <p className="mb-4 text-sm text-gray-600">
              Bu inceleme yöneticilere yükseltilecek. Lütfen sebep ve öncelik
              belirtin:
            </p>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Yükseltme Sebebi *
              </label>
              <textarea
                value={escalateReason}
                onChange={(e) => setEscalateReason(e.target.value)}
                placeholder="İçerik inceleme gerektirir..."
                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                rows={3}
              />
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Öncelik
              </label>
              <div className="flex gap-2">
                {(['LOW', 'MEDIUM', 'HIGH'] as const).map((priority) => (
                  <button
                    key={priority}
                    onClick={() => setEscalatePriority(priority)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      escalatePriority === priority
                        ? priority === 'HIGH'
                          ? 'border-red-600 bg-red-600 text-white'
                          : priority === 'MEDIUM'
                            ? 'border-yellow-600 bg-yellow-600 text-white'
                            : 'border-gray-600 bg-gray-600 text-white'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {priority === 'HIGH'
                      ? 'Yüksek'
                      : priority === 'MEDIUM'
                        ? 'Orta'
                        : 'Düşük'}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-3">
              <UnifiedButton
                variant="ghost"
                onClick={() => {
                  setShowEscalateDialog(false);
                  setEscalateReason('');
                  setEscalatePriority('MEDIUM');
                  setError(null);
                }}
                disabled={loading}
              >
                İptal
              </UnifiedButton>
              <UnifiedButton
                variant="warning"
                onClick={handleEscalate}
                disabled={loading || escalateReason.length < 10}
              >
                <ArrowUpCircle className="mr-2 h-4 w-4" />
                {loading ? 'Yükseltiliyor...' : 'Yükselt'}
              </UnifiedButton>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
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
              <UnifiedButton
                variant="ghost"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setError(null);
                }}
                disabled={loading}
              >
                İptal
              </UnifiedButton>
              <UnifiedButton
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? 'Siliniyor...' : 'Sil'}
              </UnifiedButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UnifiedReviewModerationCard;
