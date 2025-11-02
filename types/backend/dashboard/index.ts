/**
 * Backend Dashboard API Types
 *
 * Export all backend API response types for dashboard endpoints
 *
 * @sprint Sprint 1 - Tasks T-101, T-104, T-107, T-110
 * @version 1.1.0 - Added Moderator types (Day 4)
 */

// Admin Dashboard
export type {
  AdminDashboardApiResponse,
  UserMetrics,
  RevenueMetrics,
  PackageMetrics,
  TopPackage,
  OrderMetrics,
  SearchMetrics,
  ActivityMetrics,
  SystemHealth,
  BusinessMetrics,
  Trends,
  DailyTrend,
  PlatformSnapshot,
  DashboardApiResponse,
  DashboardApiError,
} from './admin-dashboard-api.types';

export {
  isAdminDashboardApiResponse,
  isSystemHealth,
  isPlatformSnapshot,
} from './admin-dashboard-api.types';

// Seller Dashboard (Sprint 1 - Day 2)
export type {
  SellerDashboardApiResponse,
  RevenueMetrics as SellerRevenueMetrics,
  PackagePerformance,
  PackageStats,
  OrderMetrics as SellerOrderMetrics,
  RecentOrder,
  CustomerMetrics,
  TopCustomer,
  ReviewMetrics,
  RecentReview,
  CommunicationMetrics,
  Trends as SellerTrends,
  DailyTrend as SellerDailyTrend,
  Insights,
  SellerQuickStats,
} from './seller-dashboard-api.types';

export {
  isSellerDashboardApiResponse,
  isRevenueMetrics,
} from './seller-dashboard-api.types';

// Buyer Dashboard (Sprint 1 - Day 3)
export type {
  BuyerDashboardApiResponse,
  OrderSummary as BuyerOrderSummary,
  RecentOrder as BuyerRecentOrder,
  Favorites,
  FavoritePackage,
  PurchaseHistory,
  DailyTrend as BuyerDailyTrend,
  ReviewActivity,
  RecentReview as BuyerRecentReview,
  Messages,
  ConversationPreview,
  Recommendations,
  RecommendedPackage,
  ActivitySummary,
  Savings,
  ActiveCoupon,
  Notifications,
  Notification,
  BuyerQuickStats,
} from './buyer-dashboard-api.types';

export {
  isBuyerDashboardApiResponse,
  isOrderSummary,
} from './buyer-dashboard-api.types';

// Moderator Dashboard (Sprint 1 - Day 4) - NEW
export type {
  ModeratorDashboardApiResponse,
  ModerationStatsDto,
  PendingItemsResponse,
  PendingItemDto,
  ActivityLogDto,
  RecentActivitiesResponse,
  ModeratorActionType,
  ModerationTargetType,
  ModerationPriority,
  ModerationItemStatus,
  // Aliases
  ModerationStats,
  PendingItem,
  ActivityLog,
} from './moderator-dashboard-api.types';

export {
  isModeratorDashboardApiResponse,
  isModerationStatsDto,
  isPendingItemsResponse,
  isPendingItemDto,
  isActivityLogDto,
} from './moderator-dashboard-api.types';
