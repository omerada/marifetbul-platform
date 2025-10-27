/**
 * ================================================
 * MODERATION STATS WIDGET
 * ================================================
 * Dashboard widget showing review moderation statistics
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 2
 */

'use client';

import { useState, useEffect } from 'react';
import {
  type PlatformReviewStats,
  adminModerationApi,
} from '@/lib/api/admin/moderation';
import { logger } from '@/lib/shared/utils/logger';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Flag,
  TrendingUp,
  Activity,
  Star,
} from 'lucide-react';

interface ModerationStatsProps {
  onPendingClick?: () => void;
  onFlaggedClick?: () => void;
  refreshTrigger?: number;
  compact?: boolean;
}

/**
 * ModerationStats Component
 *
 * Displays platform-wide review moderation statistics
 *
 * Features:
 * - Total reviews count
 * - Pending reviews count
 * - Flagged reviews count
 * - Approved/Rejected counts
 * - Average rating
 * - Quick action buttons
 * - Responsive layout
 * - Auto-refresh support
 *
 * @example
 * ```tsx
 * <ModerationStats
 *   onPendingClick={() => router.push('/admin/moderation/reviews?status=pending')}
 *   onFlaggedClick={() => router.push('/admin/moderation/reviews?status=flagged')}
 *   refreshTrigger={refreshCount}
 * />
 * ```
 */
export default function ModerationStats({
  onPendingClick,
  onFlaggedClick,
  refreshTrigger,
  compact = false,
}: ModerationStatsProps) {
  const [stats, setStats] = useState<PlatformReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, [refreshTrigger]);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminModerationApi.getPlatformStats();
      setStats(data);
    } catch (err) {
      setError('İstatistikler yüklenemedi');
      logger.error('Failed to load moderation stats', { error: err });
    } finally {
      setLoading(false);
    }
  };

  // ================================================
  // LOADING STATE
  // ================================================

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, idx) => (
          <div
            key={idx}
            className="animate-pulse rounded-lg border border-gray-200 bg-white p-6"
          >
            <div className="mb-4 h-4 w-24 rounded bg-gray-200"></div>
            <div className="mb-2 h-8 w-16 rounded bg-gray-200"></div>
            <div className="h-3 w-32 rounded bg-gray-200"></div>
          </div>
        ))}
      </div>
    );
  }

  // ================================================
  // ERROR STATE
  // ================================================

  if (error || !stats) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <div>
            <h3 className="text-sm font-medium text-red-900">
              İstatistikler Yüklenemedi
            </h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
        <button
          onClick={loadStats}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  // ================================================
  // COMPACT VIEW
  // ================================================

  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <div
          className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-yellow-300"
          onClick={onPendingClick}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">Bekleyen</span>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats.pendingReviews}
          </p>
        </div>

        <div
          className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-red-300"
          onClick={onFlaggedClick}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">Bayraklı</span>
            <Flag className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats.flaggedReviews}
          </p>
        </div>
      </div>
    );
  }

  // ================================================
  // FULL STATS VIEW
  // ================================================

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Reviews */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-lg bg-blue-100 p-2">
              <Activity className="h-5 w-5 text-blue-600" />
            </div>
            {stats.reviewsToday > 0 && (
              <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                <TrendingUp className="h-3 w-3" />
                Bugün +{stats.reviewsToday}
              </span>
            )}
          </div>
          <h3 className="mb-1 text-sm font-medium text-gray-600">
            Toplam İnceleme
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {stats.totalReviews.toLocaleString('tr-TR')}
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Bu hafta: {stats.reviewsThisWeek}
          </p>
        </div>

        {/* Pending Reviews */}
        <div
          className="cursor-pointer rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
          onClick={onPendingClick}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-lg bg-yellow-100 p-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            {stats.pendingReviews > 0 && (
              <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                Bekliyor
              </span>
            )}
          </div>
          <h3 className="mb-1 text-sm font-medium text-gray-600">
            Bekleyen İncelemeler
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {stats.pendingReviews}
          </p>
          {stats.pendingReviews > 0 && (
            <button className="mt-2 text-xs font-medium text-yellow-600 hover:text-yellow-700">
              İncele →
            </button>
          )}
        </div>

        {/* Flagged Reviews */}
        <div
          className="cursor-pointer rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
          onClick={onFlaggedClick}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-lg bg-red-100 p-2">
              <Flag className="h-5 w-5 text-red-600" />
            </div>
            {stats.flaggedReviews > 0 && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                Dikkat
              </span>
            )}
          </div>
          <h3 className="mb-1 text-sm font-medium text-gray-600">
            Bayraklı İncelemeler
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {stats.flaggedReviews}
          </p>
          {stats.flaggedReviews > 0 && (
            <button className="mt-2 text-xs font-medium text-red-600 hover:text-red-700">
              Kontrol Et →
            </button>
          )}
        </div>

        {/* Average Rating */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-lg bg-amber-100 p-2">
              <Star className="h-5 w-5 text-amber-600" />
            </div>
          </div>
          <h3 className="mb-1 text-sm font-medium text-gray-600">
            Ortalama Puan
          </h3>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">
              {stats.averageRating.toFixed(1)}
            </p>
            <span className="text-lg text-gray-500">/5.0</span>
          </div>
          <div className="mt-2 flex items-center gap-0.5">
            {[...Array(5)].map((_, idx) => (
              <Star
                key={idx}
                className={`h-4 w-4 ${
                  idx < Math.round(stats.averageRating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Moderation Activity Summary */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Moderasyon Özeti
        </h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Approved */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-600">
                Onaylanan
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.approvedReviews.toLocaleString('tr-TR')}
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full bg-green-500"
                style={{
                  width: `${
                    stats.totalReviews > 0
                      ? (stats.approvedReviews / stats.totalReviews) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Rejected */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-gray-600">
                Reddedilen
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.rejectedReviews.toLocaleString('tr-TR')}
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full bg-red-500"
                style={{
                  width: `${
                    stats.totalReviews > 0
                      ? (stats.rejectedReviews / stats.totalReviews) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Approval Rate */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">
                Onay Oranı
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalReviews > 0
                ? (
                    (stats.approvedReviews /
                      (stats.approvedReviews + stats.rejectedReviews)) *
                    100
                  ).toFixed(1)
                : '0'}
              %
            </p>
            <p className="mt-2 text-xs text-gray-500">
              {stats.approvedReviews + stats.rejectedReviews} toplam işlem
            </p>
          </div>
        </div>
      </div>

      {/* Time-based Statistics */}
      <div className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Zaman Bazlı İstatistikler
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white p-4">
            <p className="mb-1 text-sm text-gray-600">Bugün</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.reviewsToday}
            </p>
            <p className="mt-1 text-xs text-gray-500">yeni inceleme</p>
          </div>

          <div className="rounded-lg bg-white p-4">
            <p className="mb-1 text-sm text-gray-600">Bu Hafta</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.reviewsThisWeek}
            </p>
            <p className="mt-1 text-xs text-gray-500">toplam inceleme</p>
          </div>

          <div className="rounded-lg bg-white p-4">
            <p className="mb-1 text-sm text-gray-600">Bu Ay</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.reviewsThisMonth}
            </p>
            <p className="mt-1 text-xs text-gray-500">toplam inceleme</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {(stats.pendingReviews > 0 || stats.flaggedReviews > 0) && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <h4 className="text-sm font-medium text-yellow-900">
                  Dikkat Gerektiren İşlemler
                </h4>
                <p className="mt-0.5 text-xs text-yellow-700">
                  {stats.pendingReviews} bekleyen ve {stats.flaggedReviews}{' '}
                  bayraklı inceleme var
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {stats.pendingReviews > 0 && (
                <button
                  onClick={onPendingClick}
                  className="rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-yellow-700"
                >
                  Bekleyenleri İncele
                </button>
              )}
              {stats.flaggedReviews > 0 && (
                <button
                  onClick={onFlaggedClick}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                >
                  Bayraklıları Kontrol Et
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
