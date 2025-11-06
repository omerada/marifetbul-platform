/**
 * ================================================
 * DASHBOARD DATA ADAPTERS
 * ================================================
 * Transform backend API responses to unified dashboard types
 *
 * Sprint 1 - Task T-102: Real Data Integration
 *
 * Architecture:
 * - Minimal transformation layer (thin adapters)
 * - Backend DTO types from types/backend/dashboard/*
 * - Frontend types from components/domains/dashboard/types/*
 * - Store handles additional transformations if needed
 *
 * @version 2.0.0
 * @updated 2025-11-02
 */

import type {
  FreelancerDashboard,
  EmployerDashboard,
  AdminDashboard,
  ModeratorDashboard,
  DashboardPeriod,
  ActivityItem,
  ActivityStatus,
  QuickAction,
} from '../types/dashboard.types';

import {
  type AdminDashboardApiResponse,
  isAdminDashboardApiResponse,
  type SellerDashboardApiResponse,
  isSellerDashboardApiResponse,
  type BuyerDashboardApiResponse,
  isBuyerDashboardApiResponse,
  type ModeratorDashboardApiResponse,
  isModeratorDashboardApiResponse,
  type PendingItemDto,
  type ActivityLogDto,
} from '@/types/backend/dashboard';

import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// LUCIDE ICONS - Required for QuickAction components
// ============================================================================
import {
  Plus,
  ShoppingBag,
  MessageSquare,
  Wallet,
  Star,
  Store,
  Heart,
  UserPlus,
  TrendingUp,
  Clock,
  RefreshCcw,
  Users,
  Flag,
  DollarSign,
  BarChart,
  Activity,
  AlertTriangle,
  History,
} from 'lucide-react';

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Generic API response wrapper (for non-Admin dashboards still using mocks)
 * @deprecated Will be replaced with specific types in future sprints
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LegacyApiResponse = any;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Adapt recent activities from order metrics
 */
function adaptRecentActivities(
  apiResponse: SellerDashboardApiResponse
): ActivityItem[] {
  const activities: ActivityItem[] = [];

  // Add recent order activities
  if (apiResponse.orderMetrics.recentOrders) {
    apiResponse.orderMetrics.recentOrders.slice(0, 5).forEach((order) => {
      // Map order status to ActivityStatus
      let status: ActivityStatus = 'pending';
      if (order.status === 'COMPLETED') status = 'completed';
      else if (order.status === 'CANCELLED') status = 'cancelled';
      else if (order.status === 'FAILED') status = 'failed';
      else if (order.status === 'IN_PROGRESS' || order.status === 'ACTIVE')
        status = 'in_progress';

      activities.push({
        id: order.orderId,
        type: 'order' as const,
        title: `New order: ${order.packageTitle}`,
        description: `Order from ${order.buyerName}`,
        timestamp: order.orderDate,
        status,
      });
    });
  }

  // Add recent reviews
  if (apiResponse.reviewMetrics.recentReviews) {
    apiResponse.reviewMetrics.recentReviews.slice(0, 3).forEach((review) => {
      activities.push({
        id: review.reviewId,
        type: 'review' as const,
        title: `New ${review.rating}-star review`,
        description: review.comment.slice(0, 100),
        timestamp: review.reviewDate,
        status: 'completed' as ActivityStatus,
      });
    });
  }

  // Sort by timestamp descending
  return activities
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, 10);
}

/**
 * Generate quick actions for freelancer
 */
function generateFreelancerQuickActions(
  apiResponse: SellerDashboardApiResponse
): QuickAction[] {
  return [
    {
      id: 'create-package',
      label: 'Create New Package',
      description: 'Add a new service to your portfolio',
      icon: Plus,
      href: '/dashboard/packages/new',
      variant: 'primary' as const,
    },
    {
      id: 'view-orders',
      label: 'View Active Orders',
      description: `${apiResponse.orderMetrics.inProgressOrders} orders in progress`,
      icon: ShoppingBag,
      href: '/dashboard/orders',
      variant: 'default' as const,
      badge: apiResponse.orderMetrics.inProgressOrders,
    },
    {
      id: 'messages',
      label: 'Check Messages',
      description: `${apiResponse.communicationMetrics.unreadMessages} unread messages`,
      icon: MessageSquare,
      href: '/messages',
      variant: 'default' as const,
      badge: apiResponse.communicationMetrics.unreadMessages,
    },
    {
      id: 'withdraw',
      label: 'Request Withdrawal',
      description: `Available: ₺${apiResponse.revenueMetrics.availableBalance.toFixed(2)}`,
      icon: Wallet,
      href: '/dashboard/wallet',
      variant: 'default' as const,
      disabled: apiResponse.revenueMetrics.availableBalance < 50,
    },
  ];
}

// ============================================================================
// FREELANCER ADAPTER
// ============================================================================

/**
 * Transform Seller Dashboard API response to FreelancerDashboard type
 *
 * Sprint 1 - Task T-105: Real API Integration
 *
 * Maps SellerDashboardApiResponse (backend DTO) to FreelancerDashboard (frontend type)
 *
 * Note: "Seller" (backend) = "Freelancer" (frontend terminology)
 * This is a THIN adapter following the same pattern as AdminDashboard.
 *
 * @param apiResponse - Raw API response from /api/v1/dashboard/seller
 * @returns FreelancerDashboard - Unified frontend dashboard type
 * @throws Error if API response is invalid
 */
export function adaptFreelancerDashboard(
  apiResponse: SellerDashboardApiResponse | LegacyApiResponse
): FreelancerDashboard {
  // Type guard: Validate API response structure
  if (!isSellerDashboardApiResponse(apiResponse)) {
    logger.error(
      'Invalid SellerDashboard API response - missing required fields',
      {
        received: apiResponse,
        component: 'adaptFreelancerDashboard',
      }
    );
    throw new Error(
      'Failed to adapt Freelancer dashboard: Invalid API response structure'
    );
  }

  // Extract period information
  const period: DashboardPeriod = {
    days: apiResponse.periodDays,
    startDate: apiResponse.periodStart,
    endDate: apiResponse.periodEnd,
  };

  // Map earnings
  const earnings = {
    total: apiResponse.revenueMetrics.lifetimeEarnings,
    pending: apiResponse.revenueMetrics.pendingBalance,
    available: apiResponse.revenueMetrics.availableBalance,
    currency: 'TRY',
    trend: {
      value: apiResponse.revenueMetrics.revenueChangePercent,
      direction:
        apiResponse.revenueMetrics.revenueChangePercent > 0
          ? ('up' as const)
          : ('down' as const),
      percentage: Math.abs(apiResponse.revenueMetrics.revenueChangePercent),
      isPositive: apiResponse.revenueMetrics.revenueChangePercent > 0,
    },
  };

  // Map orders
  const orders = {
    active: apiResponse.orderMetrics.inProgressOrders,
    completed: apiResponse.orderMetrics.completedOrders,
    cancelled: apiResponse.orderMetrics.cancelledOrders,
    totalRevenue: apiResponse.revenueMetrics.totalRevenue,
  };

  // Map packages
  const packages = {
    total: apiResponse.packagePerformance.totalPackages,
    active: apiResponse.packagePerformance.activePackages,
    paused: apiResponse.packagePerformance.inactivePackages,
    views: apiResponse.packagePerformance.totalViews,
  };

  // Map ratings
  const ratings = {
    average: apiResponse.reviewMetrics.averageRating,
    count: apiResponse.reviewMetrics.totalReviews,
    distribution: apiResponse.reviewMetrics.ratingDistribution,
  };

  // Return unified FreelancerDashboard type
  return {
    earnings,
    orders,
    packages,
    ratings,
    recentActivities: adaptRecentActivities(apiResponse),
    quickActions: generateFreelancerQuickActions(apiResponse),
    charts: {
      earnings: {
        id: 'earnings',
        title: 'Earnings Trend',
        series: [
          {
            name: 'Revenue',
            data: apiResponse.trends.dailyRevenue.map((trend) => ({
              label: trend.date,
              value:
                typeof trend.value === 'number'
                  ? trend.value
                  : parseFloat(String(trend.value)),
            })),
          },
        ],
        config: { type: 'line' },
      },
      orders: {
        id: 'orders',
        title: 'Orders Trend',
        series: [
          {
            name: 'Orders',
            data: apiResponse.trends.dailyOrders.map((trend) => ({
              label: trend.date,
              value:
                typeof trend.value === 'number'
                  ? trend.value
                  : parseFloat(String(trend.value)),
            })),
          },
        ],
        config: { type: 'bar' },
      },
      views: {
        id: 'views',
        title: 'Package Views',
        series: [
          {
            name: 'Views',
            data: apiResponse.trends.dailyViews.map((trend) => ({
              label: trend.date,
              value:
                typeof trend.value === 'number'
                  ? trend.value
                  : parseFloat(String(trend.value)),
            })),
          },
        ],
        config: { type: 'line' },
      },
    },
    period,
    cache: {
      fromCache: apiResponse.fromCache,
      generatedAt: apiResponse.generatedAt,
      cacheKey: `seller-dashboard-${apiResponse.periodDays}`,
    },
  };
}

// ============================================================================
// EMPLOYER ADAPTER
// ============================================================================

/**
 * Transform Buyer Dashboard API response to EmployerDashboard type
 *
 * Sprint 1 - Task T-108: Real API Integration
 *
 * Maps BuyerDashboardApiResponse (backend DTO) to EmployerDashboard (frontend type)
 *
 * Note: "Buyer" (backend) = "Employer" (frontend terminology)
 * This is a THIN adapter following the same pattern as Admin & Freelancer.
 *
 * @param apiResponse - Raw API response from /api/v1/dashboard/buyer
 * @returns EmployerDashboard - Unified frontend dashboard type
 * @throws Error if API response is invalid
 */
export function adaptEmployerDashboard(
  apiResponse: BuyerDashboardApiResponse | LegacyApiResponse
): EmployerDashboard {
  // Type guard: Validate API response structure
  if (!isBuyerDashboardApiResponse(apiResponse)) {
    logger.error(
      'Invalid BuyerDashboard API response - missing required fields',
      {
        received: apiResponse,
        component: 'adaptEmployerDashboard',
      }
    );
    throw new Error(
      'Failed to adapt Employer dashboard: Invalid API response structure'
    );
  }

  // Extract period information
  const period: DashboardPeriod = {
    days: apiResponse.periodDays,
    startDate: apiResponse.periodStart,
    endDate: apiResponse.periodEnd,
  };

  // Calculate spending trend from purchase history
  const spendingTrendValue =
    apiResponse.purchaseHistory.lifetimeSpent > 0
      ? ((apiResponse.orderSummary.totalSpent /
          apiResponse.purchaseHistory.lifetimeSpent) *
          100 -
          100) /
        (apiResponse.periodDays / 30)
      : 0;

  // Map spending
  const spending = {
    total: apiResponse.purchaseHistory.lifetimeSpent,
    thisMonth: apiResponse.orderSummary.totalSpent,
    currency: 'TRY',
    trend: {
      value: spendingTrendValue,
      direction: spendingTrendValue > 0 ? ('up' as const) : ('down' as const),
      percentage: Math.abs(spendingTrendValue),
      isPositive: false, // For buyers, spending UP is not necessarily positive
    },
  };

  // Map orders
  const orders = {
    active: apiResponse.orderSummary.inProgressOrders,
    completed: apiResponse.orderSummary.completedOrders,
    cancelled: apiResponse.orderSummary.cancelledOrders,
    totalSpent: apiResponse.orderSummary.totalSpent,
  };

  // Map favorites
  const favorites = {
    packages: apiResponse.favorites.totalFavorites,
    sellers: apiResponse.activitySummary.sellersFollowed,
  };

  // Map recent activities from orders and reviews
  const recentActivities: ActivityItem[] = [
    // Map recent orders to activities
    ...(apiResponse.orderSummary.recentOrders?.slice(0, 5).map((order) => ({
      id: `order-${order.orderId}`,
      type: 'order' as const,
      title: order.packageTitle,
      description: `${order.sellerName} - ${order.status}`,
      status:
        order.status === 'COMPLETED'
          ? ('completed' as const)
          : order.status === 'CANCELLED'
            ? ('cancelled' as const)
            : ('in_progress' as const),
      timestamp: order.orderDate,
      icon: 'ShoppingBag',
      link: `/dashboard/orders/${order.orderId}`,
      metadata: {
        amount: order.amount,
        status: order.status,
        canReview: order.canReview,
      },
    })) ?? []),
    // Map recent reviews to activities
    ...(apiResponse.reviewActivity.recentReviews?.slice(0, 3).map((review) => ({
      id: `review-${review.reviewId}`,
      type: 'review' as const,
      title: `${review.packageTitle} değerlendirildi`,
      description: `${review.rating} yıldız - ${review.sellerName}`,
      status: 'completed' as const,
      timestamp: review.reviewDate,
      icon: 'Star',
      link: `/dashboard/reviews`,
      metadata: {
        rating: review.rating,
      },
    })) ?? []),
  ]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, 10);

  // Map quick actions based on user context
  const quickActions: QuickAction[] = [
    {
      id: 'browse-marketplace',
      label: 'Paketlere Göz At',
      icon: Store,
      href: '/marketplace/packages',
      variant: 'primary',
    },
    {
      id: 'my-orders',
      label: 'Siparişlerim',
      icon: ShoppingBag,
      href: '/dashboard/orders',
      badge:
        apiResponse.orderSummary.inProgressOrders > 0
          ? apiResponse.orderSummary.inProgressOrders
          : undefined,
    },
    {
      id: 'favorites',
      label: 'Favorilerim',
      icon: Heart,
      href: '/dashboard/favorites',
      badge:
        apiResponse.favorites.totalFavorites > 0
          ? apiResponse.favorites.totalFavorites
          : undefined,
    },
    {
      id: 'messages',
      label: 'Mesajlarım',
      icon: MessageSquare,
      href: '/messages',
      badge:
        apiResponse.messages.unreadMessages > 0
          ? apiResponse.messages.unreadMessages
          : undefined,
      variant: apiResponse.messages.unreadMessages > 0 ? 'warning' : undefined,
    },
  ];

  // Add review action if there are pending reviews
  if (apiResponse.reviewActivity.pendingReviews > 0) {
    quickActions.push({
      id: 'pending-reviews',
      label: 'Değerlendirme Yap',
      icon: Star,
      href: '/dashboard/reviews',
      badge: apiResponse.reviewActivity.pendingReviews,
      variant: 'warning',
    });
  }

  // Map chart data from backend trends
  const spendingChartData =
    apiResponse.purchaseHistory.spendingTrend?.map((point) => ({
      label: point.date,
      value:
        typeof point.value === 'number'
          ? point.value
          : parseFloat(String(point.value)),
    })) ?? [];

  // Calculate orders by status for bar chart
  const ordersChartData = [
    { label: 'Aktif', value: apiResponse.orderSummary.inProgressOrders },
    { label: 'Tamamlanan', value: apiResponse.orderSummary.completedOrders },
    { label: 'İptal', value: apiResponse.orderSummary.cancelledOrders },
  ];

  // Return unified EmployerDashboard type
  return {
    spending,
    orders,
    favorites,
    recentActivities,
    quickActions,
    charts: {
      spending: {
        id: 'spending',
        title: 'Harcama Trendi',
        series: [
          {
            name: 'Harcama',
            data: spendingChartData,
          },
        ],
        config: {
          type: 'line',
        },
      },
      orders: {
        id: 'orders',
        title: 'Sipariş Dağılımı',
        series: [
          {
            name: 'Siparişler',
            data: ordersChartData,
          },
        ],
        config: {
          type: 'bar',
        },
      },
    },
    period,
    cache: {
      fromCache: apiResponse.fromCache,
      generatedAt: apiResponse.generatedAt,
      cacheKey: `buyer-dashboard-${apiResponse.periodDays}`,
    },
  };
}

// ============================================================================
// ADMIN ADAPTER
// ============================================================================

/**
 * Transform Admin Dashboard API response to AdminDashboard type
 *
 * Sprint 1 - Task T-102: Real API Integration
 *
 * Maps AdminDashboardApiResponse (backend DTO) to AdminDashboard (frontend type)
 *
 * Note: This is a THIN adapter. Complex transformations are handled by the store.
 * Follows single transformation pattern - no duplicate logic.
 *
 * @param apiResponse - Raw API response from /api/v1/dashboard/admin
 * @returns AdminDashboard - Unified frontend dashboard type
 * @throws Error if API response is invalid
 */
export function adaptAdminDashboard(
  apiResponse: AdminDashboardApiResponse | LegacyApiResponse
): AdminDashboard {
  // Validate API response structure
  if (!isAdminDashboardApiResponse(apiResponse)) {
    logger.error(
      'Invalid AdminDashboard API response - missing required fields',
      {
        received: apiResponse,
        component: 'adaptAdminDashboard',
      }
    );
    throw new Error(
      'Failed to adapt Admin dashboard: Invalid API response structure'
    );
  }

  // Extract period information
  const period: DashboardPeriod = {
    days: apiResponse.periodDays,
    startDate: apiResponse.periodStart,
    endDate: apiResponse.periodEnd,
  };

  // Map backend stats to frontend stats structure
  const stats = {
    users: {
      total: apiResponse.userMetrics.totalUsers,
      active: apiResponse.userMetrics.activeUsers,
      new: apiResponse.userMetrics.newUsers,
      trend: {
        value: apiResponse.userMetrics.userGrowthRate,
        direction:
          apiResponse.userMetrics.userGrowthRate > 0
            ? ('up' as const)
            : ('down' as const),
        percentage: Math.abs(apiResponse.userMetrics.userGrowthRate),
        isPositive: apiResponse.userMetrics.userGrowthRate > 0,
      },
    },
    packages: {
      total: apiResponse.packageMetrics.totalPackages,
      active: apiResponse.packageMetrics.activePackages,
      paused:
        apiResponse.packageMetrics.totalPackages -
        apiResponse.packageMetrics.activePackages,
      trend: {
        value: apiResponse.packageMetrics.newPackages,
        direction: 'up' as const,
        percentage: 0,
        isPositive: true,
      },
    },
    orders: {
      total: apiResponse.orderMetrics.totalOrders,
      completed: apiResponse.orderMetrics.completedOrders,
      active: apiResponse.orderMetrics.pendingOrders, // Map pending to active
      revenue: apiResponse.revenueMetrics.totalRevenue,
      trend: {
        value: apiResponse.orderMetrics.completionRate,
        direction: 'up' as const,
        percentage: apiResponse.orderMetrics.completionRate,
        isPositive: true,
      },
    },
    revenue: {
      total: apiResponse.revenueMetrics.totalRevenue,
      commission: apiResponse.revenueMetrics.platformFee,
      currency: 'TRY',
      trend: {
        value: apiResponse.revenueMetrics.revenueGrowthRate,
        direction:
          apiResponse.revenueMetrics.revenueGrowthRate > 0
            ? ('up' as const)
            : ('down' as const),
        percentage: Math.abs(apiResponse.revenueMetrics.revenueGrowthRate),
        isPositive: apiResponse.revenueMetrics.revenueGrowthRate > 0,
      },
    },
  };

  // Map system health
  const systemHealth = {
    status:
      apiResponse.systemHealth.systemStatus === 'HEALTHY'
        ? ('healthy' as const)
        : apiResponse.systemHealth.systemStatus === 'DEGRADED'
          ? ('warning' as const)
          : ('critical' as const),
    uptime: apiResponse.systemHealth.uptimeSeconds,
    cpu: 0, // Not available in backend DTO
    memory: apiResponse.systemHealth.heapUsagePercent,
    storage: 0, // Not available in backend DTO
    activeConnections: apiResponse.systemHealth.activeConnections,
    cacheHitRate: 0, // Not available in backend DTO
    lastChecked: apiResponse.generatedAt,
  };

  // Map search metrics
  const searchMetrics = {
    totalSearches: apiResponse.searchMetrics.totalSearches,
    avgResultsPerSearch: apiResponse.searchMetrics.averageResultCount,
    topSearchTerms: apiResponse.searchMetrics.topKeywords.map(
      (keyword, index) => ({
        term: keyword,
        count: 100 - index * 10, // Mock count, backend doesn't provide individual counts
      })
    ),
    noResultsCount: apiResponse.searchMetrics.zeroResultSearches,
  };

  // Map top packages
  const topPackages = apiResponse.packageMetrics.topPackages.map((pkg) => ({
    id: pkg.packageId,
    title: pkg.title,
    seller: pkg.sellerName,
    revenue: pkg.revenue,
    orders: pkg.orders,
  }));

  // Generate recent activities from metrics (synthetic feed)
  const recentActivities: ActivityItem[] = [];

  // Add user growth activity if significant
  if (apiResponse.userMetrics.newUsers > 0) {
    recentActivities.push({
      id: `users-new-${Date.now()}`,
      type: 'user',
      title: 'Yeni Kullanıcılar',
      description: `${apiResponse.userMetrics.newUsers} yeni kullanıcı kaydoldu`,
      status: 'completed',
      timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      icon: 'UserPlus',
      metadata: {
        count: apiResponse.userMetrics.newUsers,
      },
    });
  }

  // Add revenue activity if growth is positive
  if (apiResponse.revenueMetrics.revenueGrowth > 0) {
    recentActivities.push({
      id: `revenue-growth-${Date.now()}`,
      type: 'payment',
      title: 'Gelir Artışı',
      description: `₺${apiResponse.revenueMetrics.revenueGrowth.toFixed(2)} gelir artışı (${apiResponse.revenueMetrics.revenueGrowthRate.toFixed(1)}%)`,
      status: 'completed',
      timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      icon: 'TrendingUp',
      metadata: {
        amount: apiResponse.revenueMetrics.revenueGrowth,
        percentage: apiResponse.revenueMetrics.revenueGrowthRate,
      },
    });
  }

  // Add order activity
  if (apiResponse.orderMetrics.pendingOrders > 0) {
    recentActivities.push({
      id: `orders-pending-${Date.now()}`,
      type: 'order',
      title: 'Bekleyen Siparişler',
      description: `${apiResponse.orderMetrics.pendingOrders} sipariş bekliyor`,
      status: 'pending',
      timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
      icon: 'Clock',
      link: '/admin/orders?status=pending',
      metadata: {
        count: apiResponse.orderMetrics.pendingOrders,
      },
    });
  }

  // Add refund activity if any
  if (apiResponse.revenueMetrics.totalRefunds > 0) {
    recentActivities.push({
      id: `refunds-${Date.now()}`,
      type: 'payment',
      title: 'İade Talepleri',
      description: `${apiResponse.revenueMetrics.totalRefunds} iade işlendi`,
      status: 'completed',
      timestamp: new Date(Date.now() - 5400000).toISOString(), // 1.5 hours ago
      icon: 'RefreshCcw',
      link: '/admin/refunds',
      metadata: {
        count: apiResponse.revenueMetrics.totalRefunds,
        amount: apiResponse.revenueMetrics.refundAmount,
      },
    });
  }

  // Sort by timestamp (most recent first) and limit to 10
  const sortedActivities = recentActivities
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .slice(0, 10);

  // Generate admin quick actions
  const quickActions: QuickAction[] = [
    {
      id: 'user-management',
      label: 'Kullanıcı Yönetimi',
      icon: Users,
      href: '/admin/users',
      badge:
        apiResponse.userMetrics.newUsers > 5
          ? apiResponse.userMetrics.newUsers
          : undefined,
    },
    {
      id: 'moderation-queue',
      label: 'Moderasyon Kuyruğu',
      icon: Flag,
      href: '/admin/moderation',
      badge: apiResponse.orderMetrics.pendingOrders,
      variant:
        apiResponse.orderMetrics.pendingOrders > 5 ? 'warning' : undefined,
    },
    {
      id: 'payouts',
      label: 'Ödeme Talepleri',
      icon: DollarSign,
      href: '/admin/payouts',
      variant: 'warning',
    },
    {
      id: 'reports',
      label: 'Raporlar',
      icon: BarChart,
      href: '/admin/reports/financial',
    },
    {
      id: 'system-health',
      label: 'Sistem Sağlığı',
      icon: Activity,
      href: '/admin/system/health',
      variant:
        apiResponse.systemHealth.systemStatus !== 'HEALTHY'
          ? 'danger'
          : 'success',
    },
  ];

  // Map chart data from trends
  const revenueChartData =
    apiResponse.trends.dailyRevenue?.map((point) => ({
      label: point.date,
      value:
        typeof point.value === 'number'
          ? point.value
          : parseFloat(String(point.value)),
    })) ?? [];

  const usersChartData =
    apiResponse.trends.dailyUsers?.map((point) => ({
      label: point.date,
      value:
        typeof point.value === 'number'
          ? point.value
          : parseFloat(String(point.value)),
    })) ?? [];

  const ordersChartData =
    apiResponse.trends.dailyOrders?.map((point) => ({
      label: point.date,
      value:
        typeof point.value === 'number'
          ? point.value
          : parseFloat(String(point.value)),
    })) ?? [];

  // Return unified AdminDashboard type
  return {
    stats,
    systemHealth,
    searchMetrics,
    topPackages,
    recentActivities: sortedActivities,
    quickActions,
    charts: {
      userGrowth: {
        id: 'user-growth',
        title: 'Kullanıcı Büyümesi',
        series: [
          {
            name: 'Kullanıcılar',
            data: usersChartData,
          },
        ],
        config: { type: 'line' },
      },
      revenue: {
        id: 'revenue',
        title: 'Gelir Trendi',
        series: [
          {
            name: 'Gelir',
            data: revenueChartData,
          },
        ],
        config: { type: 'bar' },
      },
      orders: {
        id: 'orders',
        title: 'Sipariş Trendi',
        series: [
          {
            name: 'Siparişler',
            data: ordersChartData,
          },
        ],
        config: { type: 'line' },
      },
      searchAnalytics: {
        id: 'search-analytics',
        title: 'Arama Analitiği',
        series: [
          {
            name: 'Aramalar',
            data: [
              {
                label: 'Toplam',
                value: apiResponse.searchMetrics.totalSearches,
              },
              {
                label: 'Sonuçsuz',
                value: apiResponse.searchMetrics.zeroResultSearches,
              },
            ],
          },
        ],
        config: { type: 'bar' },
      },
    },
    period,
    cache: {
      fromCache: apiResponse.fromCache,
      generatedAt: apiResponse.generatedAt,
      cacheKey: `admin-dashboard-${apiResponse.periodDays}`,
    },
  };
}

// ============================================================================
// MODERATOR ADAPTER
// ============================================================================

/**
 * Transform Moderator API response to ModeratorDashboard
 *
 * Terminology: Backend uses "Moderation", Frontend uses "Moderator"
 * Backend DTO: ModerationStats + PendingItemsResponse + RecentActivitiesResponse
 * Frontend Type: ModeratorDashboard
 *
 * Note: This is a THIN adapter. Complex transformations are handled by the store.
 * Follows single transformation pattern - no duplicate logic.
 *
 * Note: Unlike other dashboards, Moderator data comes from MULTIPLE endpoints:
 * - GET /api/v1/moderator/stats
 * - GET /api/v1/moderator/pending-items
 * - GET /api/v1/moderator/activities
 *
 * This adapter expects a COMBINED response object.
 *
 * @param apiResponse - Combined API response from multiple moderator endpoints
 * @returns ModeratorDashboard - Unified frontend dashboard type
 * @throws Error if API response is invalid
 */
export function adaptModeratorDashboard(
  apiResponse: ModeratorDashboardApiResponse | LegacyApiResponse
): ModeratorDashboard {
  // Validate API response structure
  if (!isModeratorDashboardApiResponse(apiResponse)) {
    logger.error(
      'Invalid ModeratorDashboard API response - missing required fields',
      {
        received: apiResponse,
        component: 'adaptModeratorDashboard',
      }
    );
    throw new Error(
      'Failed to adapt Moderator dashboard: Invalid API response structure'
    );
  }

  // Destructure API response
  const { stats, pendingItems, recentActivities } = apiResponse;

  // ========== STATISTICS ==========
  // Map backend ModerationStatsDto to frontend stats structure
  const dashboardStats = {
    pendingItems: stats.totalPendingItems,
    approvedToday: stats.commentsApprovedToday + stats.reviewsApprovedToday,
    rejectedToday: stats.commentsRejectedToday + stats.reviewsRejectedToday,
    spamDetected: stats.flaggedComments + stats.flaggedReviews,
    avgResponseTime: Math.round(stats.averageResponseTimeMinutes),
  };

  // ========== PENDING ITEMS QUEUE ==========
  // Map backend PendingItemDto[] to frontend ModerationItem[]
  const moderationQueue = {
    items: pendingItems.items.map((item: PendingItemDto) => ({
      id: item.itemId,
      type: item.itemType.toLowerCase() as
        | 'comment'
        | 'package'
        | 'dispute'
        | 'report'
        | 'user',
      title: item.relatedEntityTitle || item.itemType,
      content: item.content,
      submittedBy: {
        id: item.authorId,
        name: item.authorName,
      },
      submittedAt: item.submittedAt,
      status: item.status.toLowerCase() as
        | 'pending'
        | 'approved'
        | 'rejected'
        | 'spam',
      priority: item.priority.toLowerCase() as
        | 'low'
        | 'medium'
        | 'high'
        | 'urgent',
      flagsCount: item.flagCount,
    })),
    total: pendingItems.totalCount,
    page: pendingItems.currentPage,
    pageSize: pendingItems.pageSize,
  };

  // ========== RECENT ACTIVITIES ==========
  // Map backend ActivityLogDto[] to frontend ActivityItem[]
  const activities = recentActivities.activities.map(
    (activity: ActivityLogDto) => ({
      id: activity.activityId,
      type: 'moderation' as const,
      title: activity.description,
      description: activity.reason || '',
      timestamp: activity.timestamp,
      status: 'completed' as const, // All logged activities are completed
      user: {
        id: activity.moderatorId,
        name: activity.moderatorName,
      },
      metadata: {
        action: activity.actionType.toLowerCase(),
        targetType: activity.targetType.toLowerCase(),
        targetId: activity.targetId,
      },
    })
  );

  // ========== PERIOD INFORMATION ==========
  const period = {
    type: 'day' as const,
    label: 'Today',
    days: 1, // Required by DashboardPeriod
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  };

  // ========== QUICK ACTIONS ==========
  // Generate moderator quick actions based on pending items
  const quickActions: QuickAction[] = [
    {
      id: 'pending-reviews',
      label: 'Bekleyen İncelemeler',
      icon: Star,
      href: '/moderator/reviews?status=pending',
      badge: stats.pendingReviews,
      variant: stats.pendingReviews > 0 ? 'primary' : undefined,
    },
    {
      id: 'flagged-content',
      label: 'Bayraklı İçerik',
      icon: Flag,
      href: '/moderator/reviews?status=flagged',
      badge: stats.flaggedReviews + stats.flaggedComments,
      variant:
        stats.flaggedReviews + stats.flaggedComments > 0
          ? 'warning'
          : undefined,
    },
    {
      id: 'blog-comments',
      label: 'Blog Yorumları',
      icon: MessageSquare,
      href: '/moderator/comments',
      badge: stats.pendingComments,
    },
    {
      id: 'reports',
      label: 'Kullanıcı Şikayetleri',
      icon: AlertTriangle,
      href: '/moderator/reports',
      badge: stats.pendingReports,
      variant: stats.pendingReports > 0 ? 'warning' : undefined,
    },
    {
      id: 'moderation-history',
      label: 'Moderasyon Geçmişi',
      icon: History,
      href: '/moderator/history',
    },
  ];

  // ========== CHARTS & ANALYTICS ==========
  // Generate chart data from available statistics
  // Note: Backend trends endpoint (/api/v1/moderator/trends) is planned for future sprint
  // For now, we generate meaningful chart data from current stats

  const actionsToday = [
    {
      label: 'Approved',
      value: stats.commentsApprovedToday + stats.reviewsApprovedToday,
    },
    {
      label: 'Rejected',
      value: stats.commentsRejectedToday + stats.reviewsRejectedToday,
    },
    {
      label: 'Spam',
      value: stats.flaggedComments + stats.flaggedReviews,
    },
  ];

  const categoryBreakdown = [
    {
      label: 'Comments',
      value: stats.pendingComments,
    },
    {
      label: 'Reviews',
      value: stats.pendingReviews,
    },
    {
      label: 'Reports',
      value: stats.pendingReports,
    },
  ];

  // ========== RETURN UNIFIED DASHBOARD ==========
  return {
    stats: dashboardStats,
    queue: moderationQueue,
    recentActivities: activities,
    quickActions,
    period,

    // Chart data derived from current statistics
    // TODO Sprint 20: Replace with real trends data from /api/v1/moderator/trends
    charts: {
      actionsToday: {
        id: 'actions-today',
        title: 'Bugünkü İşlemler',
        series: [
          {
            name: 'Actions',
            data: actionsToday,
          },
        ],
        config: {
          type: 'bar',
          height: 300,
        },
      },
      categoryBreakdown: {
        id: 'category-breakdown',
        title: 'Kategori Dağılımı',
        series: [
          {
            name: 'Pending Items',
            data: categoryBreakdown,
          },
        ],
        config: {
          type: 'donut',
          height: 300,
        },
      },
      moderationVolume: {
        id: 'moderation-volume',
        title: 'Moderasyon Hacmi',
        series: [
          {
            name: 'Hacim',
            data: actionsToday, // Reuse actionsToday data for now
          },
        ],
        config: {
          type: 'line',
          height: 300,
        },
      },
      responseTime: {
        id: 'response-time',
        title: 'Ortalama Yanıt Süresi',
        series: [
          {
            name: 'Süre (dk)',
            data: [
              { label: '00:00', value: 0 },
              { label: '06:00', value: 0 },
              { label: '12:00', value: 0 },
              { label: '18:00', value: 0 },
              { label: '23:59', value: 0 },
            ],
          },
        ],
        config: {
          type: 'area',
          height: 300,
        },
      },
    },
  };
}

// ============================================================================
// UNIFIED ADAPTER
// ============================================================================

/**
 * Unified adapter that routes to appropriate role-specific adapter
 */
export function adaptDashboardData(
  role: 'FREELANCER' | 'EMPLOYER' | 'ADMIN' | 'MODERATOR',
  apiResponse:
    | AdminDashboardApiResponse
    | SellerDashboardApiResponse
    | BuyerDashboardApiResponse
    | ModeratorDashboardApiResponse
    | LegacyApiResponse
):
  | FreelancerDashboard
  | EmployerDashboard
  | AdminDashboard
  | ModeratorDashboard {
  switch (role) {
    case 'FREELANCER':
      return adaptFreelancerDashboard(apiResponse);
    case 'EMPLOYER':
      return adaptEmployerDashboard(apiResponse);
    case 'ADMIN':
      return adaptAdminDashboard(apiResponse);
    case 'MODERATOR':
      return adaptModeratorDashboard(apiResponse);
    default:
      throw new Error(`Unknown role: ${role}`);
  }
}
