/**
 * ================================================
 * MODERATOR DASHBOARD OVERVIEW COMPONENT
 * ================================================
 * Main dashboard showing aggregated moderation statistics
 *
 * Features:
 * - Aggregated stats cards across all moderation types
 * - Pending items overview
 * - Quick action buttons
 * - Today's activity summary
 *
 * Sprint 2 - Story 2.1: Moderator Dashboard Overview
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 3, 2025
 */

'use client';

import {
  MessageSquare,
  Star,
  Flag,
  HeadphonesIcon,
  CheckCircle,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { Card, Badge, UnifiedButton } from '@/components/ui';
import { useModeratorDashboard } from '@/hooks/business/moderation/useModeratorDashboard';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

type PendingItemType = 'COMMENT' | 'REVIEW' | 'REPORT' | 'TICKET';
type PriorityType = 'HIGH' | 'MEDIUM' | 'LOW';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ModeratorDashboardOverview() {
  const router = useRouter();

  const {
    stats,
    pendingItems,
    pagination,
    isLoading,
    isLoadingItems,
    refresh,
    currentPage,
    goToPage,
  } = useModeratorDashboard({
    autoFetch: true,
    refreshInterval: 30000,
  });

  // ============================================================================
  // HELPERS
  // ============================================================================

  const getItemTypeIcon = (type: PendingItemType) => {
    switch (type) {
      case 'COMMENT':
        return <MessageSquare className="h-4 w-4" />;
      case 'REVIEW':
        return <Star className="h-4 w-4" />;
      case 'REPORT':
        return <Flag className="h-4 w-4" />;
      case 'TICKET':
        return <HeadphonesIcon className="h-4 w-4" />;
    }
  };

  const getItemTypeLabel = (type: PendingItemType) => {
    const labels: Record<PendingItemType, string> = {
      COMMENT: 'Yorum',
      REVIEW: 'Değerlendirme',
      REPORT: 'Rapor',
      TICKET: 'Destek',
    };
    return labels[type];
  };

  const getItemTypeColor = (type: PendingItemType) => {
    const colors: Record<PendingItemType, string> = {
      COMMENT:
        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      REVIEW:
        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      REPORT: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      TICKET:
        'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    };
    return colors[type];
  };

  const getPriorityColor = (priority: PriorityType) => {
    const colors: Record<PriorityType, string> = {
      HIGH: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      MEDIUM:
        'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      LOW: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    };
    return colors[priority];
  };

  const getPriorityLabel = (priority: PriorityType) => {
    const labels: Record<PriorityType, string> = {
      HIGH: 'Yüksek',
      MEDIUM: 'Orta',
      LOW: 'Düşük',
    };
    return labels[priority];
  };

  const formatWaitingTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}d`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}s`;
    const days = Math.floor(hours / 24);
    return `${days}g`;
  };

  const handleItemClick = (type: PendingItemType) => {
    switch (type) {
      case 'COMMENT':
        router.push('/moderator/comments');
        break;
      case 'REVIEW':
        router.push('/moderator/reviews');
        break;
      case 'REPORT':
        router.push('/moderator/reports');
        break;
      case 'TICKET':
        router.push('/moderator/tickets');
        break;
    }
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse p-6">
              <div className="mb-4 h-4 w-2/3 rounded bg-gray-200" />
              <div className="h-8 w-1/2 rounded bg-gray-200" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Genel Bakış</h2>
          <UnifiedButton
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isLoading}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Yenile
          </UnifiedButton>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Pending */}
          <Card className="p-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">Toplam Bekleyen</p>
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold">
              {stats?.totalPendingItems ?? 0}
            </p>
          </Card>

          {/* Total Actions Today */}
          <Card className="p-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">Bugünkü İşlemler</p>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold">
              {stats?.totalActionsToday ?? 0}
            </p>
          </Card>

          {/* Avg Response Time */}
          <Card className="p-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">Ort. Yanıt Süresi</p>
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold">
              {stats?.averageResponseTimeMinutes ?? 0}
              <span className="text-muted-foreground ml-1 text-lg">dk</span>
            </p>
          </Card>

          {/* Accuracy Rate */}
          <Card className="p-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">İsabet Oranı</p>
              <TrendingUp className="h-5 w-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold">
              {stats?.accuracyRate ?? 0}
              <span className="text-muted-foreground ml-1 text-lg">%</span>
            </p>
          </Card>
        </div>
      </div>

      {/* Category Stats */}
      <div>
        <h2 className="mb-4 text-xl font-bold">Kategori Bazlı İstatistikler</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Comments */}
          <Card
            className="cursor-pointer p-6 transition-shadow hover:shadow-lg"
            onClick={() => router.push('/moderator/comments')}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold">Yorumlar</h3>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Bekleyen:</span>
                <span className="font-medium">
                  {stats?.pendingComments ?? 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Bayraklı:</span>
                <span className="font-medium text-red-600">
                  {stats?.flaggedComments ?? 0}
                </span>
              </div>
              <div className="mt-2 border-t pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">✓ Onaylanan:</span>
                  <span className="font-medium">
                    {stats?.commentsApprovedToday ?? 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-600">✗ Reddedilen:</span>
                  <span className="font-medium">
                    {stats?.commentsRejectedToday ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Reviews */}
          <Card
            className="cursor-pointer p-6 transition-shadow hover:shadow-lg"
            onClick={() => router.push('/moderator/reviews')}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold">Değerlendirmeler</h3>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Bekleyen:</span>
                <span className="font-medium">
                  {stats?.pendingReviews ?? 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Bayraklı:</span>
                <span className="font-medium text-red-600">
                  {stats?.flaggedReviews ?? 0}
                </span>
              </div>
              <div className="mt-2 border-t pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">✓ Onaylanan:</span>
                  <span className="font-medium">
                    {stats?.reviewsApprovedToday ?? 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-red-600">✗ Reddedilen:</span>
                  <span className="font-medium">
                    {stats?.reviewsRejectedToday ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Reports */}
          <Card
            className="cursor-pointer p-6 transition-shadow hover:shadow-lg"
            onClick={() => router.push('/moderator/reports')}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-red-500" />
                <h3 className="font-semibold">Raporlar</h3>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Bekleyen:</span>
                <span className="font-medium">
                  {stats?.pendingReports ?? 0}
                </span>
              </div>
              <div className="mt-2 border-t pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">✓ Çözülen:</span>
                  <span className="font-medium">
                    {stats?.reportsResolvedToday ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Support Tickets */}
          <Card
            className="cursor-pointer p-6 transition-shadow hover:shadow-lg"
            onClick={() => router.push('/moderator/tickets')}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeadphonesIcon className="h-5 w-5 text-purple-500" />
                <h3 className="font-semibold">Destek Talepleri</h3>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Bekleyen:</span>
                <span className="font-medium">
                  {stats?.pendingSupportTickets ?? 0}
                </span>
              </div>
              <div className="mt-2 border-t pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">✓ Kapatılan:</span>
                  <span className="font-medium">
                    {stats?.ticketsClosedToday ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Pending Items Queue */}
      <div>
        <h2 className="mb-4 text-xl font-bold">Öncelikli İşlemler</h2>

        {isLoadingItems ? (
          <div className="flex justify-center py-12">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2" />
          </div>
        ) : pendingItems.length === 0 ? (
          <Card className="p-12">
            <div className="text-muted-foreground text-center">
              <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500 opacity-50" />
              <p className="text-lg font-medium">Tebrikler!</p>
              <p>Bekleyen işlem bulunmuyor.</p>
            </div>
          </Card>
        ) : (
          <>
            <div className="space-y-3">
              {pendingItems.map((item) => (
                <Card
                  key={item.id}
                  className="cursor-pointer p-4 transition-shadow hover:shadow-md"
                  onClick={() => handleItemClick(item.type)}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        'rounded-lg p-2',
                        getItemTypeColor(item.type)
                      )}
                    >
                      {getItemTypeIcon(item.type)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <Badge className={getItemTypeColor(item.type)}>
                          {getItemTypeLabel(item.type)}
                        </Badge>
                        <Badge className={getPriorityColor(item.priority)}>
                          {getPriorityLabel(item.priority)}
                        </Badge>
                        <span className="text-muted-foreground text-xs">
                          <Clock className="mr-1 inline h-3 w-3" />
                          {formatWaitingTime(item.waitingTimeMinutes)}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-sm">{item.description}</p>
                      {item.reportedBy && (
                        <p className="text-muted-foreground mt-1 text-xs">
                          Rapor eden: {item.reportedBy}
                        </p>
                      )}
                    </div>

                    <UnifiedButton variant="ghost" size="sm">
                      İncele
                    </UnifiedButton>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-muted-foreground text-sm">
                  Sayfa {currentPage + 1} / {pagination.totalPages}(
                  {pagination.totalElements} öğe)
                </div>
                <div className="flex gap-2">
                  <UnifiedButton
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 0}
                  >
                    Önceki
                  </UnifiedButton>
                  <UnifiedButton
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage >= pagination.totalPages - 1}
                  >
                    Sonraki
                  </UnifiedButton>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
