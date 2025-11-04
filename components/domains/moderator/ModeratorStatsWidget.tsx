/**
 * ================================================
 * MODERATOR STATS WIDGET
 * ================================================
 * Displays real-time moderation statistics with auto-refresh
 *
 * Sprint: Moderator Dashboard Implementation
 * Sprint 2: Component implementation
 * Sprint 3: Performance optimization
 *
 * @version 3.0.0
 * @author MarifetBul Development Team
 * @updated November 4, 2025
 *
 * Changes (v3.0.0 - Sprint 3 Task 3.1):
 * - Added React.memo for component memoization
 * - Implemented useMemo for expensive calculations
 * - Optimized statCards generation
 * - Added proper prop comparison for memo
 *
 * Previous Changes (v2.0.0):
 * - Added useModerationStats hook integration
 * - Implemented 30-second auto-refresh
 * - Made stats prop optional (uses hook by default)
 * - Enhanced loading states
 */

'use client';

import React, { useMemo, useCallback, memo } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Star,
  Flag,
  Headphones,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useModerationStats } from '@/hooks/business/useModeration';
import type { ModerationStats } from '@/types/business/moderation';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface ModeratorStatsWidgetProps {
  /**
   * Optional stats override. If not provided, component will fetch data using hook.
   */
  stats?: ModerationStats | null;
  /**
   * Optional loading override. Only used when stats prop is provided.
   */
  isLoading?: boolean;
  /**
   * Auto-refresh interval in milliseconds. Default: 30000 (30 seconds)
   */
  refreshInterval?: number;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Callback when refresh is triggered
   */
  onRefresh?: () => void;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconBgColor: string;
  link?: string;
  subStats?: Array<{
    label: string;
    value: number;
    color: string;
  }>;
}

// ============================================================================
// STAT CARD COMPONENT (Memoized for performance)
// ============================================================================

const StatCard = memo(function StatCard({
  title,
  value,
  icon,
  iconBgColor,
  link,
  subStats,
}: StatCardProps) {
  const content = (
    <Card
      className={cn(
        'transition-all hover:shadow-md',
        link && 'cursor-pointer hover:border-blue-300'
      )}
      role="article"
      aria-label={`${title}: ${value}`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-sm font-medium text-gray-600"
              id={`stat-title-${title.replace(/\s/g, '-')}`}
            >
              {title}
            </p>
            <p
              className="mt-2 text-3xl font-semibold text-gray-900"
              aria-describedby={`stat-title-${title.replace(/\s/g, '-')}`}
            >
              {value}
            </p>
            {subStats && subStats.length > 0 && (
              <div
                className="mt-3 flex items-center gap-3"
                role="list"
                aria-label="Alt istatistikler"
              >
                {subStats.map((stat, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1"
                    role="listitem"
                  >
                    <span className={cn('text-xs font-medium', stat.color)}>
                      {stat.label}:
                    </span>
                    <span className="text-xs font-semibold text-gray-700">
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div
            className={cn('rounded-full p-3', iconBgColor)}
            aria-hidden="true"
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (link) {
    return (
      <Link
        href={link}
        aria-label={`${title} sayfasına git: ${value} bekleyen`}
      >
        {content}
      </Link>
    );
  }

  return content;
});

// ============================================================================
// MAIN COMPONENT (Memoized with optimizations)
// ============================================================================

export const ModeratorStatsWidget = memo(function ModeratorStatsWidget({
  stats: statsProp,
  isLoading: isLoadingProp,
  refreshInterval = 30000,
  className = '',
  onRefresh,
}: ModeratorStatsWidgetProps) {
  // Use hook if stats not provided
  const {
    stats: hookStats,
    isLoading: hookLoading,
    refresh,
  } = useModerationStats(refreshInterval);

  // Determine which data source to use
  const stats = statsProp !== undefined ? statsProp : hookStats;
  const isLoading = statsProp !== undefined ? isLoadingProp : hookLoading;

  // Handle manual refresh with useCallback for stability
  const handleRefresh = useCallback(() => {
    refresh();
    onRefresh?.();
  }, [refresh, onRefresh]);

  // Memoize stat cards to prevent recalculation on every render
  const statCards = useMemo<StatCardProps[]>(() => {
    if (!stats) return [];

    return [
      {
        title: 'Bekleyen Yorumlar',
        value: stats.pendingComments || 0,
        icon: <MessageSquare className="h-6 w-6 text-blue-600" />,
        iconBgColor: 'bg-blue-100',
        link: '/moderator/comments',
        subStats: [
          {
            label: 'Bugün Onaylanan',
            value: stats.commentsApprovedToday || 0,
            color: 'text-green-600',
          },
          {
            label: 'Reddedilen',
            value: stats.commentsRejectedToday || 0,
            color: 'text-red-600',
          },
        ],
      },
      {
        title: 'İşaretli Değerlendirmeler',
        value: stats.flaggedReviews || 0,
        icon: <Star className="h-6 w-6 text-yellow-600" />,
        iconBgColor: 'bg-yellow-100',
        link: '/moderator/reviews',
        subStats: [
          {
            label: 'Bekleyen',
            value: stats.pendingReviews || 0,
            color: 'text-orange-600',
          },
          {
            label: 'Bugün Çözülen',
            value: stats.reviewsApprovedToday + stats.reviewsRejectedToday || 0,
            color: 'text-green-600',
          },
        ],
      },
      {
        title: 'Kullanıcı Şikayetleri',
        value: stats.pendingReports || 0,
        icon: <Flag className="h-6 w-6 text-red-600" />,
        iconBgColor: 'bg-red-100',
        link: '/moderator/reports',
        subStats: [
          {
            label: 'Bugün Çözülen',
            value: stats.reportsResolvedToday || 0,
            color: 'text-green-600',
          },
        ],
      },
      {
        title: 'Destek Talepleri',
        value: stats.pendingSupportTickets || 0,
        icon: <Headphones className="h-6 w-6 text-green-600" />,
        iconBgColor: 'bg-green-100',
        link: '/moderator/tickets',
        subStats: [
          {
            label: 'Bugün Kapatılan',
            value: stats.ticketsClosedToday || 0,
            color: 'text-green-600',
          },
        ],
      },
    ];
  }, [stats]);

  // Memoize performance indicators
  const performanceIndicators = useMemo(() => {
    if (!stats) return null;

    return {
      queueStatus: stats.totalPendingItems > 10 ? 'high' : 'normal',
      responseStatus:
        stats.averageResponseTimeMinutes < 30
          ? 'excellent'
          : stats.averageResponseTimeMinutes < 60
            ? 'good'
            : 'slow',
      accuracyBadge:
        stats.accuracyRate >= 0.95
          ? 'excellent'
          : stats.accuracyRate >= 0.85
            ? 'verygood'
            : stats.accuracyRate >= 0.75
              ? 'good'
              : 'needsimprovement',
    };
  }, [stats]);

  // Loading state
  if (isLoading || !stats) {
    return (
      <div
        className={cn(
          'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4',
          className
        )}
        role="status"
        aria-live="polite"
        aria-label="Moderasyon istatistikleri yükleniyor"
      >
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 w-24 rounded bg-gray-200" />
                  <div className="mt-2 h-8 w-16 rounded bg-gray-200" />
                </div>
                <div className="h-12 w-12 rounded-full bg-gray-200" />
              </div>
            </CardContent>
          </Card>
        ))}
        <span className="sr-only">İstatistikler yükleniyor...</span>
      </div>
    );
  }

  return (
    <div
      className={className}
      role="region"
      aria-label="Moderasyon İstatistikleri"
    >
      {/* Header with Refresh Button */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2
            id="stats-heading"
            className="text-lg font-semibold text-gray-900"
          >
            Moderasyon İstatistikleri
          </h2>
          <p className="text-sm text-gray-500" role="status" aria-live="polite">
            Otomatik güncelleme: {refreshInterval / 1000} saniye
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
          aria-label="Moderasyon istatistiklerini yenile"
          type="button"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          <span>Yenile</span>
        </button>
      </div>

      {/* Primary Stats */}
      <div
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
        role="list"
        aria-label="Ana moderasyon istatistikleri"
      >
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Overall Performance Stats */}
      <div
        className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3"
        role="list"
        aria-label="Genel performans metrikleri"
      >
        {/* Total Pending */}
        <Card role="article" aria-labelledby="total-pending-title">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p
                  id="total-pending-title"
                  className="text-sm font-medium text-gray-600"
                >
                  Toplam Bekleyen
                </p>
                <p
                  className="mt-2 text-2xl font-semibold text-gray-900"
                  aria-describedby="total-pending-title"
                >
                  {stats.totalPendingItems || 0}
                </p>
                <div
                  className="mt-2 flex items-center gap-2"
                  role="status"
                  aria-live="polite"
                >
                  {performanceIndicators?.queueStatus === 'high' ? (
                    <>
                      <AlertTriangle
                        className="h-4 w-4 text-yellow-600"
                        aria-hidden="true"
                      />
                      <span className="text-xs text-yellow-600">
                        Yüksek kuyruk
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircle
                        className="h-4 w-4 text-green-600"
                        aria-hidden="true"
                      />
                      <span className="text-xs text-green-600">
                        Normal seviye
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div
                className="rounded-full bg-purple-100 p-3"
                aria-hidden="true"
              >
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions Today */}
        <Card role="article" aria-labelledby="actions-today-title">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p
                  id="actions-today-title"
                  className="text-sm font-medium text-gray-600"
                >
                  Bugün Yapılan İşlem
                </p>
                <p
                  className="mt-2 text-2xl font-semibold text-gray-900"
                  aria-describedby="actions-today-title"
                >
                  {stats.totalActionsToday || 0}
                </p>
                <div className="mt-2 flex items-center gap-2" role="status">
                  <CheckCircle
                    className="h-4 w-4 text-green-600"
                    aria-hidden="true"
                  />
                  <span className="text-xs text-green-600">
                    Aktif moderasyon
                  </span>
                </div>
              </div>
              <div className="rounded-full bg-green-100 p-3" aria-hidden="true">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Response Time */}
        <Card role="article" aria-labelledby="response-time-title">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p
                  id="response-time-title"
                  className="text-sm font-medium text-gray-600"
                >
                  Ort. Yanıt Süresi
                </p>
                <p
                  className="mt-2 text-2xl font-semibold text-gray-900"
                  aria-describedby="response-time-title"
                >
                  {stats.averageResponseTimeMinutes || 0}
                  <span className="text-base text-gray-600"> dk</span>
                </p>
                <div
                  className="mt-2 flex items-center gap-2"
                  role="status"
                  aria-live="polite"
                >
                  {performanceIndicators?.responseStatus === 'excellent' ? (
                    <>
                      <CheckCircle
                        className="h-4 w-4 text-green-600"
                        aria-hidden="true"
                      />
                      <span className="text-xs text-green-600">Çok iyi</span>
                    </>
                  ) : performanceIndicators?.responseStatus === 'good' ? (
                    <>
                      <Clock
                        className="h-4 w-4 text-yellow-600"
                        aria-hidden="true"
                      />
                      <span className="text-xs text-yellow-600">İyi</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle
                        className="h-4 w-4 text-red-600"
                        aria-hidden="true"
                      />
                      <span className="text-xs text-red-600">Yavaş</span>
                    </>
                  )}
                </div>
              </div>
              <div className="rounded-full bg-blue-100 p-3" aria-hidden="true">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accuracy Badge */}
      {stats.accuracyRate !== undefined && (
        <div className="mt-6">
          <Card
            className="bg-gradient-to-r from-blue-50 to-indigo-50"
            role="article"
            aria-labelledby="accuracy-title"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="rounded-full bg-blue-100 p-3"
                    aria-hidden="true"
                  >
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p
                      id="accuracy-title"
                      className="text-sm font-medium text-gray-600"
                    >
                      Moderasyon Doğruluk Oranı
                    </p>
                    <p
                      className="mt-1 text-2xl font-semibold text-gray-900"
                      aria-describedby="accuracy-title"
                    >
                      {(stats.accuracyRate * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div role="status" aria-live="polite">
                  {performanceIndicators?.accuracyBadge === 'excellent' ? (
                    <Badge
                      className="bg-green-500 text-white"
                      aria-label="Doğruluk değerlendirmesi: Mükemmel"
                    >
                      Mükemmel
                    </Badge>
                  ) : performanceIndicators?.accuracyBadge === 'verygood' ? (
                    <Badge
                      className="bg-blue-500 text-white"
                      aria-label="Doğruluk değerlendirmesi: Çok İyi"
                    >
                      Çok İyi
                    </Badge>
                  ) : performanceIndicators?.accuracyBadge === 'good' ? (
                    <Badge
                      className="bg-yellow-500 text-white"
                      aria-label="Doğruluk değerlendirmesi: İyi"
                    >
                      İyi
                    </Badge>
                  ) : (
                    <Badge
                      className="bg-red-500 text-white"
                      aria-label="Doğruluk değerlendirmesi: Geliştirilmeli"
                    >
                      Geliştirilmeli
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
});

// Display name for debugging
ModeratorStatsWidget.displayName = 'ModeratorStatsWidget';

export default ModeratorStatsWidget;
