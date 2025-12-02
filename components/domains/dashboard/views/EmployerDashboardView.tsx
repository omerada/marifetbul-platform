/**
 * ================================================
 * EMPLOYER DASHBOARD VIEW
 * ================================================
 * Sprint 1 - Day 6: Employer-specific dashboard view
 *
 * Features:
 * - Spending overview
 * - Order statistics
 * - Favorites management
 * - Activity timeline
 * - Quick actions
 * - Spending charts
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { memo } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Heart,
  Users,
  Plus,
  Search,
  Settings,
  FileText,
  MessageSquare,
  AlertCircle,
  Package,
  User,
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
} from '../widgets';
import {
  MyRefundsWidget,
  RefundStatsWidget,
} from '@/components/domains/refunds';
import { MilestoneProgressWidget } from '@/components/domains/milestones';
import type { EmployerDashboard } from '../types/dashboard.types';
import { formatCompactNumber } from '../utils';
import { formatCurrency } from '@/lib/utils';
import { UserRole } from '@/types/backend-aligned';

// ============================================================================
// TYPES
// ============================================================================

export interface EmployerDashboardViewProps {
  /**
   * Dashboard data
   */
  data: EmployerDashboard;

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
function prepareStatsCards(data: EmployerDashboard) {
  const cards = [
    {
      id: 'total-spending',
      title: 'Toplam Harcama',
      value: formatCurrency(data.spending.total, data.spending.currency),
      subtitle: `Bu ay: ${formatCurrency(data.spending.thisMonth, data.spending.currency)}`,
      icon: DollarSign,
      iconColor: 'text-blue-600 dark:text-blue-400',
      trend: data.spending.trend,
    },
    {
      id: 'active-orders',
      title: 'Aktif Siparişler',
      value: data.orders?.active ?? 0,
      subtitle: `${data.orders?.completed ?? 0} tamamlandı`,
      icon: ShoppingCart,
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      id: 'favorite-packages',
      title: 'Favori Paketler',
      value: data.favorites?.packages ?? 0,
      subtitle: `${data.favorites?.sellers ?? 0} satıcı`,
      icon: Heart,
      iconColor: 'text-red-600 dark:text-red-400',
    },
    {
      id: 'total-spent',
      title: 'Toplam Ödenen',
      value: formatCurrency(
        data.orders?.totalSpent ?? 0,
        data.spending.currency
      ),
      subtitle: `${(data.orders?.completed ?? 0) + (data.orders?.cancelled ?? 0)} sipariş`,
      icon: FileText,
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
  ];

  // Add messaging stats if available (EPIC 1 Story 1.1)
  if (data.messages) {
    cards.push({
      id: 'messages',
      title: 'Mesajlar',
      value: data.messages.unread,
      subtitle: `${data.messages.activeConversations} aktif konuşma`,
      icon: MessageSquare,
      iconColor: 'text-orange-600 dark:text-orange-400',
    });
  }

  // Add pending actions if available (EPIC 1 Story 1.2)
  if (data.pendingActions) {
    const totalPending =
      data.pendingActions.ordersToApprove + data.pendingActions.reviewsToGive;

    if (totalPending > 0) {
      cards.push({
        id: 'pending-actions',
        title: 'Bekleyen İşlemler',
        value: totalPending,
        subtitle: `${data.pendingActions.ordersToApprove} onay, ${data.pendingActions.reviewsToGive} değerlendirme`,
        icon: AlertCircle,
        iconColor: 'text-red-600 dark:text-red-400',
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
      id: 'browse-packages',
      label: 'Paket Ara',
      description: 'Yeni hizmetler keşfet',
      icon: Search,
      onClick: () => (window.location.href = '/marketplace'),
      variant: 'primary' as const,
    },
    {
      id: 'create-order',
      label: 'Sipariş Ver',
      description: 'Hemen yeni sipariş oluştur',
      icon: Plus,
      onClick: () => (window.location.href = '/marketplace'),
      variant: 'default' as const,
    },
    {
      id: 'my-orders',
      label: 'Siparişlerim',
      description: 'Siparişlerinizi görüntüleyin',
      icon: ShoppingCart,
      onClick: () => (window.location.href = '/orders'),
      variant: 'default' as const,
    },
    {
      id: 'settings',
      label: 'Ayarlar',
      description: 'Hesap ayarlarınız',
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
 * Employer Dashboard View Component
 *
 * Displays employer-specific dashboard with spending, orders, and favorites.
 *
 * @example
 * ```tsx
 * <EmployerDashboardView
 *   data={employerData}
 *   isLoading={false}
 *   onRefresh={handleRefresh}
 * />
 * ```
 */
export const EmployerDashboardView = memo<EmployerDashboardViewProps>(
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
          role={UserRole.EMPLOYER}
          title="Employer Dashboard"
          subtitle="Harcamalarınız, siparişleriniz ve favorileriniz"
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
          title="Cüzdan & Bütçe"
          subtitle="Bakiye ve harcama bilgileriniz"
        >
          <WalletBalanceWidget />
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
              viewAllLink="/dashboard/refunds"
            />
          </div>
        </DashboardSection>

        {/* Charts Section */}
        {canViewCharts && (
          <DashboardSection
            title="Harcama Grafikleri"
            subtitle="Harcama ve sipariş trendleriniz"
          >
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Spending Chart */}
              {canViewFinancials && data.charts?.spending && (
                <ChartWidget
                  data={data.charts.spending}
                  isLoading={isLoading}
                  error={error}
                  showHeader
                />
              )}

              {/* Orders Chart */}
              {data.charts?.orders && (
                <ChartWidget
                  data={data.charts.orders}
                  isLoading={isLoading}
                  error={error}
                  showHeader
                />
              )}
            </div>
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

        {/* Recent Order Section - SPRINT EPIC 2 Story 2.1 */}
        {data.recentOrder && (
          <DashboardSection
            title="Son Sipariş"
            subtitle="En son verdiğiniz sipariş"
          >
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-gray-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {data.recentOrder.packageTitle}
                    </h3>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <User className="h-4 w-4" />
                    <span>{data.recentOrder.sellerName}</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Sipariş No: {data.recentOrder.orderNumber}
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                      data.recentOrder.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : data.recentOrder.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}
                  >
                    {data.recentOrder.status}
                  </span>
                  <div className="mt-2 text-xs text-gray-500">
                    {new Date(data.recentOrder.lastUpdate).toLocaleDateString(
                      'tr-TR'
                    )}
                  </div>
                </div>
              </div>
            </div>
          </DashboardSection>
        )}

        {/* Favorites Section */}
        {((data.favorites?.packages ?? 0) > 0 ||
          (data.favorites?.sellers ?? 0) > 0) && (
          <DashboardSection
            title="Favorilerim"
            subtitle="Favori paketler ve satıcılar"
          >
            <div className="grid gap-6 md:grid-cols-2">
              {/* Favorite Packages */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-red-100 p-3 dark:bg-red-900/20">
                    <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {formatCompactNumber(data.favorites?.packages ?? 0)}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Favori Paketler
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => (window.location.href = '/favorites/packages')}
                  className="mt-4 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Tümünü Görüntüle
                </button>
              </div>

              {/* Favorite Sellers */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/20">
                    <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {formatCompactNumber(data.favorites?.sellers ?? 0)}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Favori Satıcılar
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => (window.location.href = '/favorites/sellers')}
                  className="mt-4 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Tümünü Görüntüle
                </button>
              </div>
            </div>
          </DashboardSection>
        )}

        {/* Milestone Progress Widget - Sprint 1 Story 1.4 */}
        {data.milestones && data.milestones.pendingAcceptance.length > 0 && (
          <DashboardSection
            title="Milestone İncelemeleri"
            subtitle="Onayınızı bekleyen milestone'lar"
          >
            <MilestoneProgressWidget
              milestones={data.milestones.pendingAcceptance}
              role="EMPLOYER"
              currency="TRY"
              showDetails
            />
          </DashboardSection>
        )}

        {/* Order Statistics */}
        <DashboardSection
          title="Sipariş İstatistikleri"
          subtitle="Sipariş durumlarınız"
        >
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Active Orders */}
              <div className="text-center">
                <div className="mx-auto mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                  <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {data.orders?.active ?? 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Aktif Siparişler
                </p>
              </div>

              {/* Completed Orders */}
              <div className="text-center">
                <div className="mx-auto mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                  <ShoppingCart className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {data.orders?.completed ?? 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tamamlanan
                </p>
              </div>

              {/* Cancelled Orders */}
              <div className="text-center">
                <div className="mx-auto mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                  <ShoppingCart className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {data.orders?.cancelled ?? 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  İptal Edilen
                </p>
              </div>
            </div>
          </div>
        </DashboardSection>
      </div>
    );
  }
);

EmployerDashboardView.displayName = 'EmployerDashboardView';
