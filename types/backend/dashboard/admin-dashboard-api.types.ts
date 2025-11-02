/**
 * ================================================
 * ADMIN DASHBOARD API TYPES
 * ================================================
 * Backend API response types for Admin Dashboard
 *
 * Maps to: AdminDashboardDto.java
 * Endpoints:
 * - GET /api/v1/dashboard/admin
 * - GET /api/v1/dashboard/admin/days/{days}
 * - GET /api/v1/dashboard/admin/realtime
 * - GET /api/v1/dashboard/admin/snapshot
 *
 * @version 1.0.0
 * @sprint Sprint 1 - Task T-101
 * @date 2 Kasım 2025
 */

/**
 * Main Admin Dashboard API Response
 * Maps to: AdminDashboardDto.java
 */
export interface AdminDashboardApiResponse {
  /** Time period information */
  periodStart: string; // ISO 8601 datetime
  periodEnd: string; // ISO 8601 datetime
  periodDays: number;

  /** User metrics */
  userMetrics: UserMetrics;

  /** Revenue metrics */
  revenueMetrics: RevenueMetrics;

  /** Package metrics */
  packageMetrics: PackageMetrics;

  /** Order metrics */
  orderMetrics: OrderMetrics;

  /** Search analytics */
  searchMetrics: SearchMetrics;

  /** Activity metrics */
  activityMetrics: ActivityMetrics;

  /** System health */
  systemHealth: SystemHealth;

  /** Business metrics */
  businessMetrics: BusinessMetrics;

  /** Trends data */
  trends: Trends;

  /** Metadata */
  generatedAt: string; // ISO 8601 datetime
  fromCache: boolean;
  cacheAgeSeconds: number;
}

/**
 * User Metrics
 * Maps to: AdminDashboardDto.UserMetrics
 */
export interface UserMetrics {
  /** Total registered users */
  totalUsers: number;

  /** Active users in period */
  activeUsers: number;

  /** New users in period */
  newUsers: number;

  /** Daily Active Users */
  dailyActiveUsers: number;

  /** Monthly Active Users */
  monthlyActiveUsers: number;

  /** DAU/MAU ratio (user stickiness) */
  dauMauRatio: number;

  /** Total sellers */
  totalSellers: number;

  /** Active sellers */
  activeSellers: number;

  /** Total buyers */
  totalBuyers: number;

  /** Active buyers */
  activeBuyers: number;

  /** Users grouped by role */
  usersByRole: Record<string, number>;

  /** User growth rate (percentage) */
  userGrowthRate: number;
}

/**
 * Revenue Metrics
 * Maps to: AdminDashboardDto.RevenueMetrics
 */
export interface RevenueMetrics {
  /** Total revenue (TRY) */
  totalRevenue: number;

  /** Platform commission fee (TRY) */
  platformFee: number;

  /** Seller earnings after commission (TRY) */
  sellerEarnings: number;

  /** Net platform revenue (TRY) */
  netRevenue: number;

  /** Total orders count */
  totalOrders: number;

  /** Average order value (TRY) */
  averageOrderValue: number;

  /** Total refunds count */
  totalRefunds: number;

  /** Refund amount (TRY) */
  refundAmount: number;

  /** Refund rate (percentage) */
  refundRate: number;

  /** Revenue growth amount (TRY) */
  revenueGrowth: number;

  /** Revenue growth rate (percentage) */
  revenueGrowthRate: number;

  /** Revenue grouped by category */
  revenueByCategory: Record<string, number>;

  /** Revenue grouped by payment method */
  revenueByPaymentMethod: Record<string, number>;
}

/**
 * Package Metrics
 * Maps to: AdminDashboardDto.PackageMetrics
 */
export interface PackageMetrics {
  /** Total packages */
  totalPackages: number;

  /** Active packages */
  activePackages: number;

  /** New packages in period */
  newPackages: number;

  /** Total package views */
  totalViews: number;

  /** Unique viewers */
  uniqueViewers: number;

  /** Total favorites */
  totalFavorites: number;

  /** Total shares */
  totalShares: number;

  /** Average conversion rate (percentage) */
  averageConversionRate: number;

  /** Packages grouped by category */
  packagesByCategory: Record<string, number>;

  /** Packages grouped by status */
  packagesByStatus: Record<string, number>;

  /** Top performing packages */
  topPackages: TopPackage[];
}

/**
 * Top Package Data
 * Maps to: AdminDashboardDto.TopPackage
 */
export interface TopPackage {
  /** Package UUID */
  packageId: string;

  /** Package title */
  title: string;

  /** Seller name */
  sellerName: string;

  /** Total views */
  views: number;

  /** Total orders */
  orders: number;

  /** Total revenue (TRY) */
  revenue: number;
}

/**
 * Order Metrics
 * Maps to: AdminDashboardDto.OrderMetrics
 */
export interface OrderMetrics {
  /** Total orders */
  totalOrders: number;

  /** Completed orders */
  completedOrders: number;

  /** Pending orders */
  pendingOrders: number;

  /** Cancelled orders */
  cancelledOrders: number;

  /** Refunded orders */
  refundedOrders: number;

  /** Completion rate (percentage) */
  completionRate: number;

  /** Cancellation rate (percentage) */
  cancellationRate: number;

  /** Total order value (TRY) */
  totalOrderValue: number;

  /** Average order value (TRY) */
  averageOrderValue: number;

  /** Orders grouped by status */
  ordersByStatus: Record<string, number>;

  /** Orders grouped by category */
  ordersByCategory: Record<string, number>;
}

/**
 * Search Metrics
 * Maps to: AdminDashboardDto.SearchMetrics
 */
export interface SearchMetrics {
  /** Total search queries */
  totalSearches: number;

  /** Unique users who searched */
  uniqueSearchers: number;

  /** Searches with zero results */
  zeroResultSearches: number;

  /** Zero result rate (percentage) */
  zeroResultRate: number;

  /** Click-through rate (percentage) */
  clickThroughRate: number;

  /** Search to order conversion rate (percentage) */
  searchToOrderConversionRate: number;

  /** Overall conversion rate (percentage) */
  conversionRate: number;

  /** Average number of results per search */
  averageResultCount: number;

  /** Top search keywords */
  topKeywords: string[];

  /** Keywords with zero results */
  zeroResultKeywords: string[];

  /** Searches grouped by category */
  searchesByCategory: Record<string, number>;
}

/**
 * Activity Metrics
 * Maps to: AdminDashboardDto.ActivityMetrics
 */
export interface ActivityMetrics {
  /** Total activities */
  totalActivities: number;

  /** Total API calls */
  apiCalls: number;

  /** Total page views */
  pageViews: number;

  /** Average response time (ms) */
  averageResponseTime: number;

  /** Slow requests count */
  slowRequests: number;

  /** Error requests count */
  errorRequests: number;

  /** Error rate (percentage) */
  errorRate: number;

  /** Activities grouped by type */
  activitiesByType: Record<string, number>;

  /** Activities grouped by category */
  activitiesByCategory: Record<string, number>;

  /** Activities grouped by hour */
  activitiesByHour: Record<number, number>;
}

/**
 * System Health
 * Maps to: AdminDashboardDto.SystemHealth
 */
export interface SystemHealth {
  /** Database health status */
  databaseHealthy: boolean;

  /** Elasticsearch health status */
  elasticsearchHealthy: boolean;

  /** Overall system status */
  systemStatus: 'HEALTHY' | 'DEGRADED' | 'DOWN' | 'UNKNOWN';

  /** Active database connections */
  activeConnections: number;

  /** Idle database connections */
  idleConnections: number;

  /** Heap memory used (bytes) */
  heapMemoryUsed: number;

  /** Heap memory max (bytes) */
  heapMemoryMax: number;

  /** Heap usage percentage */
  heapUsagePercent: number;

  /** System uptime in seconds */
  uptimeSeconds: number;
}

/**
 * Business Metrics
 * Maps to: AdminDashboardDto.BusinessMetrics
 */
export interface BusinessMetrics {
  /** Overall platform conversion rate (percentage) */
  conversionRate: number;

  /** Repeat purchase rate (percentage) */
  repeatPurchaseRate: number;

  /** Average customer lifetime value (TRY) */
  averageLifetimeValue: number;

  /** Customer satisfaction score */
  customerSatisfactionScore: number;

  /** Total reviews count */
  totalReviews: number;

  /** Average rating */
  averageRating: number;

  /** Total messages */
  totalMessages: number;

  /** Response rate (percentage) */
  responseRate: number;
}

/**
 * Trends Data
 * Maps to: AdminDashboardDto.Trends
 */
export interface Trends {
  /** Daily revenue trend */
  dailyRevenue: DailyTrend[];

  /** Daily orders trend */
  dailyOrders: DailyTrend[];

  /** Daily users trend */
  dailyUsers: DailyTrend[];

  /** Daily package views trend */
  dailyPackageViews: DailyTrend[];
}

/**
 * Daily Trend Data Point
 * Maps to: AdminDashboardDto.DailyTrend
 */
export interface DailyTrend {
  /** Date (ISO format) */
  date: string;

  /** Value (can be number or string depending on metric) */
  value: number | string;
}

/**
 * Platform Snapshot (Quick Metrics)
 * Endpoint: GET /api/v1/dashboard/admin/snapshot
 */
export interface PlatformSnapshot {
  /** Total users */
  totalUsers: number;

  /** Active users today */
  activeUsers: number;

  /** Total revenue (TRY) */
  totalRevenue: number;

  /** Today's revenue (TRY) */
  todayRevenue: number;

  /** Active orders */
  activeOrders: number;

  /** Pending disputes */
  pendingDisputes: number;

  /** System status */
  systemStatus: 'HEALTHY' | 'DEGRADED' | 'DOWN';
}

// ================================================
// TYPE GUARDS
// ================================================

/**
 * Type guard for AdminDashboardApiResponse
 */
export function isAdminDashboardApiResponse(
  data: unknown
): data is AdminDashboardApiResponse {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  return (
    typeof obj.periodStart === 'string' &&
    typeof obj.periodEnd === 'string' &&
    typeof obj.periodDays === 'number' &&
    typeof obj.userMetrics === 'object' &&
    typeof obj.revenueMetrics === 'object' &&
    typeof obj.systemHealth === 'object' &&
    typeof obj.generatedAt === 'string' &&
    typeof obj.fromCache === 'boolean'
  );
}

/**
 * Type guard for SystemHealth
 */
export function isSystemHealth(data: unknown): data is SystemHealth {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  return (
    typeof obj.databaseHealthy === 'boolean' &&
    typeof obj.elasticsearchHealthy === 'boolean' &&
    typeof obj.systemStatus === 'string' &&
    typeof obj.activeConnections === 'number' &&
    typeof obj.heapUsagePercent === 'number' &&
    typeof obj.uptimeSeconds === 'number'
  );
}

/**
 * Type guard for PlatformSnapshot
 */
export function isPlatformSnapshot(data: unknown): data is PlatformSnapshot {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  return (
    typeof obj.totalUsers === 'number' &&
    typeof obj.activeUsers === 'number' &&
    typeof obj.totalRevenue === 'number' &&
    typeof obj.systemStatus === 'string'
  );
}

// ================================================
// UTILITY TYPES
// ================================================

/**
 * API Response wrapper type
 */
export interface DashboardApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

/**
 * Error response type
 */
export interface DashboardApiError {
  success: false;
  error: string;
  message: string;
  timestamp: string;
  path?: string;
  statusCode?: number;
}
