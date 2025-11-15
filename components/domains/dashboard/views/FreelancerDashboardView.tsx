/**
 * ================================================
 * FREELANCER DASHBOARD VIEW
 * ================================================
 * Sprint 1 - Day 6: Freelancer-specific dashboard view
 *
 * Features:
 * - Earnings overview
 * - Order statistics
 * - Package performance
 * - Rating metrics
 * - Activity timeline
 * - Quick actions
 * - Performance charts
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { memo } from 'react';
import {
  DollarSign,
  Package,
  ShoppingCart,
  Star,
  Eye,
  Plus,
  Settings,
  MessageSquare,
  Clock,
  CheckCircle,
  FileText,
  AlertCircle,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useDashboardPermissions } from '../hooks';
import {
  DashboardHeader,
  DashboardSection,
  StatsGrid,
  ChartWidget,
  ActivityTimeline,
  QuickActions,
  WalletBalanceWidget,
  PendingMilestonesWidget,
  AnalyticsChartWidget,
} from '../widgets';
import { MilestoneStatsWidget } from '../widgets/MilestoneStatsWidget';
import {
  MyRefundsWidget,
  RefundStatsWidget,
} from '@/components/domains/refunds';
import type { FreelancerDashboard } from '../types/dashboard.types';
import { formatCompactNumber } from '../utils';
import { formatCurrency } from '@/lib/shared/formatters';

// ============================================================================
// TYPES
// ============================================================================

export interface FreelancerDashboardViewProps {
  /**
   * Dashboard data
   */
  data: FreelancerDashboard;

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Error state
   */
  error?: string | null;

  /**
   * Refresh handler
   */
  onRefresh?: () => void;

  /**
   * Period change handler
   */
  onPeriodChange?: (period: 'week' | 'month' | 'quarter' | 'year') => void;

  /**
   * Custom className
   */
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Transform dashboard data to stats cards
 */
function prepareStatsCards(data: FreelancerDashboard) {
  const cards = [
    {
      id: 'earnings',
      title: 'Toplam Kazanç',
      value: formatCurrency(data.earnings.total, data.earnings.currency),
      subtitle: `${formatCurrency(data.earnings.available, data.earnings.currency, { useSymbol: false })} müsait`,
      icon: DollarSign,
      iconColor: 'text-green-600 dark:text-green-400',
      trend: data.earnings.trend,
    },
    {
      id: 'active-orders',
      title: 'Aktif Siparişler',
      value: data.orders.active,
      subtitle: `${data.orders.completed} tamamlandı`,
      icon: ShoppingCart,
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      id: 'packages',
      title: 'Paketler',
      value: data.packages.active,
      subtitle: `${data.packages.total} toplam paket`,
      icon: Package,
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      id: 'rating',
      title: 'Ortalama Puan',
      value: data.ratings.average.toFixed(1),
      subtitle: `${data.ratings.count} değerlendirme`,
      icon: Star,
      iconColor: 'text-yellow-600 dark:text-yellow-400',
    },
  ];

  // Add messaging stats if available (EPIC 1 Story 1.1)
  if (data.messages) {
    cards.push({
      id: 'messages',
      title: 'Mesajlar',
      value: data.messages.unread,
      subtitle: `${data.messages.pendingResponses} yanıt bekliyor`,
      icon: MessageSquare,
      iconColor: 'text-orange-600 dark:text-orange-400',
    });

    // Only show response time if user has messaging history
    if (data.messages.averageResponseTime > 0) {
      cards.push({
        id: 'response-time',
        title: 'Ort. Yanıt Süresi',
        value: `${data.messages.averageResponseTime.toFixed(1)}sa`,
        subtitle: `%${data.messages.responseRate.toFixed(0)} yanıt oranı`,
        icon: Clock,
        iconColor: 'text-teal-600 dark:text-teal-400',
      });
    }
  }

  // Add pending actions if available (EPIC 1 Story 1.2)
  if (data.pendingActions) {
    const totalPending =
      data.pendingActions.ordersToAccept +
      data.pendingActions.ordersToDeliver +
      data.pendingActions.reviewsToGive;

    if (totalPending > 0) {
      cards.push({
        id: 'pending-actions',
        title: 'Bekleyen İşlemler',
        value: totalPending,
        subtitle: `${data.pendingActions.ordersToAccept} kabul, ${data.pendingActions.ordersToDeliver} teslim, ${data.pendingActions.reviewsToGive} değerlendirme`,
        icon: AlertCircle,
        iconColor: 'text-red-600 dark:text-red-400',
      });
    }
  }

  // Add performance metrics if available (EPIC 1 Story 1.3)
  if (data.performance) {
    if (data.performance.conversionRate > 0) {
      cards.push({
        id: 'conversion-rate',
        title: 'Dönüşüm Oranı',
        value: `%${data.performance.conversionRate.toFixed(1)}`,
        subtitle: 'Görüntüleme → Sipariş',
        icon: TrendingUp,
        iconColor: 'text-indigo-600 dark:text-indigo-400',
      });
    }

    if (data.performance.onTimeDeliveryRate > 0) {
      cards.push({
        id: 'on-time-delivery',
        title: 'Zamanında Teslimat',
        value: `%${data.performance.onTimeDeliveryRate.toFixed(0)}`,
        subtitle: `${data.performance.averageDeliveryTime.toFixed(1)}sa ortalama`,
        icon: Zap,
        iconColor: 'text-cyan-600 dark:text-cyan-400',
      });
    }
  }

  return cards;
}

/**
 * Prepare quick actions
 */
function prepareQuickActions() {
  return [
    {
      id: 'create-package',
      label: 'Yeni Paket Oluştur',
      description: 'Hemen yeni bir hizmet paketi ekle',
      icon: Plus,
      onClick: () => (window.location.href = '/packages/create'),
      variant: 'primary' as const,
    },
    {
      id: 'view-orders',
      label: 'Siparişlerim',
      description: 'Aktif siparişlerinizi görüntüle',
      icon: ShoppingCart,
      onClick: () => (window.location.href = '/orders'),
      variant: 'default' as const,
    },
    {
      id: 'view-packages',
      label: 'Paketlerim',
      description: 'Paketlerinizi yönetin',
      icon: Package,
      onClick: () => (window.location.href = '/packages'),
      variant: 'default' as const,
    },
    {
      id: 'settings',
      label: 'Ayarlar',
      description: 'Profil ve bildirim ayarları',
      icon: Settings,
      onClick: () => (window.location.href = '/settings'),
      variant: 'default' as const,
    },
  ];
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Freelancer Dashboard View Component
 *
 * Displays freelancer-specific dashboard with earnings, orders, packages, and ratings.
 *
 * @example
 * ```tsx
 * <FreelancerDashboardView
 *   data={freelancerData}
 *   isLoading={false}
 *   onRefresh={handleRefresh}
 * />
 * ```
 */
export const FreelancerDashboardView = memo<FreelancerDashboardViewProps>(
  ({ data, isLoading = false, error = null, onRefresh, className = '' }) => {
    const { canViewFinancials, canViewCharts } = useDashboardPermissions();

    // Stats cards
    const statsCards = prepareStatsCards(data);

    // Quick actions
    const quickActions = prepareQuickActions();

    return (
      <div className={`space-y-6 ${className}`}>
        {/* Header */}
        <DashboardHeader
          role="FREELANCER"
          title="Freelancer Dashboard"
          subtitle="Kazançlarınız, siparişleriniz ve performans metrikleriniz"
          actions={
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Yenileniyor...' : 'Yenile'}
            </button>
          }
        />

        {/* Stats Grid */}
        <DashboardSection
          title="Genel Bakış"
          subtitle="Temel istatistikleriniz"
        >
          <StatsGrid
            stats={statsCards}
            config={{
              columns: { mobile: 2, tablet: 2, desktop: 4 },
              gap: 'md',
              animate: true,
            }}
            isLoading={isLoading}
          />
        </DashboardSection>

        {/* Wallet Balance Widget */}
        <DashboardSection
          title="Cüzdan & Kazançlar"
          subtitle="Bakiye ve kazanç bilgileriniz"
        >
          <WalletBalanceWidget showTrend />
        </DashboardSection>

        {/* Milestone Stats Widget - STORY 1.5 */}
        <DashboardSection
          title="Milestone İstatistikleri"
          subtitle="Aşamalı ödeme durumunuz"
        >
          <MilestoneStatsWidget />
        </DashboardSection>

        {/* Refunds Widget - SPRINT 3 STORY 3.1 */}
        <DashboardSection
          title="İade Taleplerim"
          subtitle="Son iade talepleriniz"
        >
          <div className="space-y-4">
            {/* Stats - Story 3.2 */}
            <RefundStatsWidget compact />

            {/* Recent Refunds - Story 3.1 */}
            <MyRefundsWidget
              maxItems={5}
              showViewAll
              viewAllUrl="/dashboard/refunds"
            />
          </div>
        </DashboardSection>

        {/* Charts Section */}
        {canViewCharts && (
          <DashboardSection
            title="Performans Grafikleri"
            subtitle="Kazanç ve sipariş trendleriniz"
          >
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Earnings Chart */}
              {canViewFinancials && data.charts.earnings && (
                <ChartWidget
                  data={data.charts.earnings}
                  isLoading={isLoading}
                  error={error}
                  showHeader
                />
              )}

              {/* Orders Chart */}
              {data.charts.orders && (
                <ChartWidget
                  data={data.charts.orders}
                  isLoading={isLoading}
                  error={error}
                  showHeader
                />
              )}
            </div>

            {/* Views Chart */}
            {data.charts.views && (
              <div className="mt-6">
                <ChartWidget
                  data={data.charts.views}
                  isLoading={isLoading}
                  error={error}
                  showHeader
                />
              </div>
            )}
          </DashboardSection>
        )}

        {/* Analytics Integration - Sprint 1 Story 4 */}
        {canViewFinancials && (
          <DashboardSection
            title="Gelişmiş Analizler"
            subtitle="Kazanç trendi, gelir dağılımı ve işlem özeti"
          >
            <AnalyticsChartWidget
              allowTypeSwitch
              defaultRange="30d"
              showRangeSelector
            />
          </DashboardSection>
        )}

        {/* Quick Actions */}
        <DashboardSection
          title="Hızlı İşlemler"
          subtitle="Sık kullanılan işlemler"
        >
          <QuickActions
            actions={quickActions}
            config={{
              columns: { mobile: 2, tablet: 3, desktop: 4 },
              size: 'md',
              showDescriptions: true,
            }}
          />
        </DashboardSection>

        {/* Activity Timeline */}
        {data.recentActivities && data.recentActivities.length > 0 && (
          <DashboardSection
            title="Son Aktiviteler"
            subtitle="Hesabınızdaki son hareketler"
          >
            <ActivityTimeline
              activities={data.recentActivities}
              config={{
                groupByDate: true,
                maxItems: 10,
              }}
              isLoading={isLoading}
            />
          </DashboardSection>
        )}

        {/* Package Insights */}
        {data.packages.views > 0 && (
          <DashboardSection
            title="Paket İstatistikleri"
            subtitle="Paket performansınız"
          >
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/20">
                  <Eye className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formatCompactNumber(data.packages.views)}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Toplam görüntülenme
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Toplam Paket
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {data.packages.total}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Aktif
                  </p>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {data.packages.active}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Duraklatılmış
                  </p>
                  <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                    {data.packages.paused}
                  </p>
                </div>
              </div>
            </div>
          </DashboardSection>
        )}

        {/* Rating Distribution */}
        {data.ratings.count > 0 && (
          <DashboardSection
            title="Değerlendirmeler"
            subtitle="Müşteri puanlarınız"
          >
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                    <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {data.ratings.average.toFixed(1)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {data.ratings.count} değerlendirme
                  </p>
                </div>

                {/* Rating bars */}
                <div className="flex-1 space-y-2 pl-8">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = data.ratings.distribution[rating] || 0;
                    const percentage = (count / data.ratings.count) * 100;

                    return (
                      <div key={rating} className="flex items-center gap-2">
                        <span className="w-8 text-sm text-gray-600 dark:text-gray-400">
                          {rating}★
                        </span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                          <div
                            className="h-full bg-yellow-400 transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="w-12 text-right text-sm text-gray-600 dark:text-gray-400">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </DashboardSection>
        )}
      </div>
    );
  }
);

FreelancerDashboardView.displayName = 'FreelancerDashboardView';
