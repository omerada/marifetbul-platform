/**
 * ================================================
 * SELLER DASHBOARD API TYPES
 * ================================================
 * Backend API response types for Seller/Freelancer Dashboard
 *
 * Maps to: SellerDashboardDto.java
 * Endpoints:
 * - GET /api/v1/dashboard/seller
 * - GET /api/v1/dashboard/seller/days/{days}
 * - GET /api/v1/dashboard/seller/realtime
 *
 * @version 1.0.0
 * @sprint Sprint 1 - Task T-104
 * @date 2 Kasım 2025
 */

/**
 * Main Seller Dashboard API Response
 * Maps to: SellerDashboardDto.java
 */
export interface SellerDashboardApiResponse {
  /** Seller identification */
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  memberSince: string; // ISO 8601 datetime

  /** Time period information */
  periodStart: string; // ISO 8601 datetime
  periodEnd: string; // ISO 8601 datetime
  periodDays: number;

  /** Revenue metrics */
  revenueMetrics: RevenueMetrics;

  /** Package performance */
  packagePerformance: PackagePerformance;

  /** Order metrics */
  orderMetrics: OrderMetrics;

  /** Customer metrics */
  customerMetrics: CustomerMetrics;

  /** Review metrics */
  reviewMetrics: ReviewMetrics;

  /** Communication metrics */
  communicationMetrics: CommunicationMetrics;

  /** Trends data */
  trends: Trends;

  /** Insights and recommendations */
  insights: Insights;

  /** Metadata */
  generatedAt: string; // ISO 8601 datetime
  fromCache: boolean;
  cacheAgeSeconds: number;
}

/**
 * Revenue Metrics
 * Maps to: SellerDashboardDto.RevenueMetrics
 */
export interface RevenueMetrics {
  /** Total revenue (TRY) */
  totalRevenue: number;

  /** Platform commission fee (TRY) */
  platformFee: number;

  /** Net earnings after commission (TRY) */
  netEarnings: number;

  /** Total orders count */
  totalOrders: number;

  /** Average order value (TRY) */
  averageOrderValue: number;

  /** Pending balance (TRY) */
  pendingBalance: number;

  /** Available balance (TRY) */
  availableBalance: number;

  /** Lifetime earnings (TRY) */
  lifetimeEarnings: number;

  /** Revenue change from previous period (TRY) */
  revenueChange: number;

  /** Revenue change percentage */
  revenueChangePercent: number;

  /** Orders change from previous period */
  ordersChange: number;

  /** Orders change percentage */
  ordersChangePercent: number;
}

/**
 * Package Performance
 * Maps to: SellerDashboardDto.PackagePerformance
 */
export interface PackagePerformance {
  /** Total packages */
  totalPackages: number;

  /** Active packages */
  activePackages: number;

  /** Inactive packages */
  inactivePackages: number;

  /** Total views */
  totalViews: number;

  /** Unique viewers */
  uniqueViewers: number;

  /** Total orders */
  totalOrders: number;

  /** Conversion rate (percentage) */
  conversionRate: number;

  /** Total favorites */
  totalFavorites: number;

  /** Total shares */
  totalShares: number;

  /** Top performing packages */
  topPackages: PackageStats[];

  /** Trending packages */
  trendingPackages: PackageStats[];

  /** Low performing packages */
  lowPerformingPackages: PackageStats[];
}

/**
 * Package Statistics
 * Maps to: SellerDashboardDto.PackageStats
 */
export interface PackageStats {
  /** Package UUID */
  packageId: string;

  /** Package title */
  title: string;

  /** Category name */
  categoryName: string;

  /** Total views */
  views: number;

  /** Total orders */
  orders: number;

  /** Conversion rate (percentage) */
  conversionRate: number;

  /** Total revenue (TRY) */
  revenue: number;

  /** Average rating */
  averageRating: number;
}

/**
 * Order Metrics
 * Maps to: SellerDashboardDto.OrderMetrics
 */
export interface OrderMetrics {
  /** Total orders */
  totalOrders: number;

  /** Completed orders */
  completedOrders: number;

  /** In progress orders */
  inProgressOrders: number;

  /** Cancelled orders */
  cancelledOrders: number;

  /** Refunded orders */
  refundedOrders: number;

  /** Completion rate (percentage) */
  completionRate: number;

  /** Cancellation rate (percentage) */
  cancellationRate: number;

  /** Refund rate (percentage) */
  refundRate: number;

  /** Orders grouped by status */
  ordersByStatus: Record<string, number>;

  /** Recent orders */
  recentOrders: RecentOrder[];
}

/**
 * Recent Order
 * Maps to: SellerDashboardDto.RecentOrder
 */
export interface RecentOrder {
  /** Order UUID */
  orderId: string;

  /** Package title */
  packageTitle: string;

  /** Buyer name */
  buyerName: string;

  /** Order amount (TRY) */
  amount: number;

  /** Order status */
  status: string;

  /** Order date (ISO 8601) */
  orderDate: string;
}

/**
 * Customer Metrics
 * Maps to: SellerDashboardDto.CustomerMetrics
 */
export interface CustomerMetrics {
  /** Total unique customers */
  totalCustomers: number;

  /** Repeat customers */
  repeatCustomers: number;

  /** Repeat customer rate (percentage) */
  repeatCustomerRate: number;

  /** New customers in period */
  newCustomers: number;

  /** Average orders per customer */
  averageOrdersPerCustomer: number;

  /** Average customer value (TRY) */
  averageCustomerValue: number;

  /** Top customers */
  topCustomers: TopCustomer[];
}

/**
 * Top Customer
 * Maps to: SellerDashboardDto.TopCustomer
 */
export interface TopCustomer {
  /** Customer UUID */
  customerId: string;

  /** Customer name */
  customerName: string;

  /** Total orders */
  totalOrders: number;

  /** Total spent (TRY) */
  totalSpent: number;

  /** Last order date (ISO 8601) */
  lastOrderDate: string;
}

/**
 * Review Metrics
 * Maps to: SellerDashboardDto.ReviewMetrics
 */
export interface ReviewMetrics {
  /** Total reviews */
  totalReviews: number;

  /** Average rating */
  averageRating: number;

  /** 5-star reviews count */
  fiveStarReviews: number;

  /** 4-star reviews count */
  fourStarReviews: number;

  /** 3-star reviews count */
  threeStarReviews: number;

  /** 2-star reviews count */
  twoStarReviews: number;

  /** 1-star reviews count */
  oneStarReviews: number;

  /** Rating distribution */
  ratingDistribution: Record<number, number>;

  /** Recent reviews */
  recentReviews: RecentReview[];
}

/**
 * Recent Review
 * Maps to: SellerDashboardDto.RecentReview
 */
export interface RecentReview {
  /** Review UUID */
  reviewId: string;

  /** Package title */
  packageTitle: string;

  /** Reviewer name */
  reviewerName: string;

  /** Rating (1-5) */
  rating: number;

  /** Review comment */
  comment: string;

  /** Review date (ISO 8601) */
  reviewDate: string;
}

/**
 * Communication Metrics
 * Maps to: SellerDashboardDto.CommunicationMetrics
 */
export interface CommunicationMetrics {
  /** Total messages */
  totalMessages: number;

  /** Unread messages */
  unreadMessages: number;

  /** Active conversations */
  activeConversations: number;

  /** Average response time (hours) */
  averageResponseTime: number;

  /** Response rate (percentage) */
  responseRate: number;

  /** Recent message previews */
  recentMessagePreviews: string[];
}

/**
 * Trends Data
 * Maps to: SellerDashboardDto.Trends
 */
export interface Trends {
  /** Daily revenue trend */
  dailyRevenue: DailyTrend[];

  /** Daily orders trend */
  dailyOrders: DailyTrend[];

  /** Daily views trend */
  dailyViews: DailyTrend[];

  /** Daily conversion rate trend */
  dailyConversionRate: DailyTrend[];
}

/**
 * Daily Trend Data Point
 * Maps to: SellerDashboardDto.DailyTrend
 */
export interface DailyTrend {
  /** Date (ISO format) */
  date: string;

  /** Value (can be number or string) */
  value: number | string;
}

/**
 * Insights and Recommendations
 * Maps to: SellerDashboardDto.Insights
 */
export interface Insights {
  /** What's working well */
  strengths: string[];

  /** Areas to improve */
  improvements: string[];

  /** Actionable recommendations */
  recommendations: string[];

  /** Urgent items requiring attention */
  alerts: string[];
}

// ================================================
// TYPE GUARDS
// ================================================

/**
 * Type guard for SellerDashboardApiResponse
 */
export function isSellerDashboardApiResponse(
  data: unknown
): data is SellerDashboardApiResponse {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  return (
    typeof obj.sellerId === 'string' &&
    typeof obj.sellerName === 'string' &&
    typeof obj.periodStart === 'string' &&
    typeof obj.periodEnd === 'string' &&
    typeof obj.periodDays === 'number' &&
    typeof obj.revenueMetrics === 'object' &&
    typeof obj.packagePerformance === 'object' &&
    typeof obj.orderMetrics === 'object' &&
    typeof obj.generatedAt === 'string' &&
    typeof obj.fromCache === 'boolean'
  );
}

/**
 * Type guard for RevenueMetrics
 */
export function isRevenueMetrics(data: unknown): data is RevenueMetrics {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  return (
    typeof obj.totalRevenue === 'number' &&
    typeof obj.platformFee === 'number' &&
    typeof obj.netEarnings === 'number' &&
    typeof obj.totalOrders === 'number' &&
    typeof obj.averageOrderValue === 'number'
  );
}

// ================================================
// UTILITY TYPES
// ================================================

/**
 * Seller Quick Stats (for header/summary)
 */
export interface SellerQuickStats {
  /** Total earnings (TRY) */
  totalEarnings: number;

  /** Active orders */
  activeOrders: number;

  /** Average rating */
  averageRating: number;

  /** Unread messages */
  unreadMessages: number;

  /** Pending balance (TRY) */
  pendingBalance: number;
}
