/**
 * Dashboard Snapshot API Types
 *
 * Type definitions for lightweight dashboard snapshots.
 * Used for quick stats, header widgets, and real-time updates.
 *
 * Backend DTOs:
 * - PlatformSnapshotDto.java
 * - SellerSnapshotDto.java
 * - BuyerSnapshotDto.java
 *
 * @sprint Sprint 1 - Story 2: Dashboard Snapshot System
 * @version 1.0.0
 * @date November 6, 2025
 * @author MarifetBul Team
 */

// ==================== Platform Snapshot ====================

/**
 * System health status
 * Matches backend: PlatformSnapshotDto.SystemStatus enum
 */
export enum SystemStatus {
  HEALTHY = 'HEALTHY',
  DEGRADED = 'DEGRADED',
  CRITICAL = 'CRITICAL',
}

/**
 * Platform-wide snapshot for admin quick view
 * Backend: PlatformSnapshotDto.java
 */
export interface PlatformSnapshot {
  // User Metrics
  totalUsers: number;
  activeUsersToday: number;
  newUsersThisWeek: number;

  // Order Metrics
  totalOrders: number;
  activeOrders: number;
  completedOrdersToday: number;
  pendingOrders: number;

  // Revenue Metrics
  totalRevenue: number;
  revenueToday: number;
  revenueThisMonth: number;
  platformFees: number;

  // Package Metrics
  totalPackages: number;
  activePackages: number;
  newPackagesToday: number;

  // Quality Metrics
  activeDisputes: number;
  pendingRefunds: number;
  averageRating: number;
  completionRate: number;

  // System Health
  systemStatus: SystemStatus;
  pendingSupportTickets: number;
  moderationQueueSize: number;
}

/**
 * Type guard for PlatformSnapshot
 */
export function isPlatformSnapshot(obj: unknown): obj is PlatformSnapshot {
  const snapshot = obj as PlatformSnapshot;
  return (
    typeof snapshot === 'object' &&
    snapshot !== null &&
    typeof snapshot.totalUsers === 'number' &&
    typeof snapshot.activeUsersToday === 'number' &&
    typeof snapshot.totalOrders === 'number' &&
    typeof snapshot.totalRevenue === 'number' &&
    typeof snapshot.systemStatus === 'string' &&
    Object.values(SystemStatus).includes(snapshot.systemStatus as SystemStatus)
  );
}

// ==================== Seller Snapshot ====================

/**
 * Pending actions for seller
 * Backend: SellerSnapshotDto.PendingActions nested class
 */
export interface SellerPendingActions {
  ordersToAccept: number;
  ordersToDeliver: number;
  messagesToRespond: number;
  reviewsToGive: number;
}

/**
 * Top performing package summary
 * Backend: SellerSnapshotDto.TopPackage nested class
 */
export interface SellerTopPackage {
  packageId: string;
  packageTitle: string;
  totalSales: number;
  totalRevenue: number;
  averageRating: number;
}

/**
 * Seller performance snapshot
 * Backend: SellerSnapshotDto.java
 */
export interface SellerSnapshot {
  // Identity
  sellerId: string;
  sellerName: string;

  // Earnings Metrics
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  earningsThisMonth: number;
  earningsGrowthRate: number;

  // Order Metrics
  completedOrders: number;
  activeOrders: number;
  ordersRequiringAction: number;
  completionRate: number;
  onTimeDeliveryRate: number;

  // Package Metrics
  activePackages: number;
  totalViews: number;
  viewsThisWeek: number;
  conversionRate: number;

  // Customer Metrics
  averageRating: number;
  totalReviews: number;
  pendingReviews: number;
  totalCustomers: number;
  repeatCustomerRate: number;

  // Communication Metrics
  unreadMessages: number;
  averageResponseTime: number;
  responseRate: number;

  // Pending Actions
  pendingActions: SellerPendingActions;

  // Top Package (optional)
  topPackage?: SellerTopPackage;
}

/**
 * Type guard for SellerSnapshot
 */
export function isSellerSnapshot(obj: unknown): obj is SellerSnapshot {
  const snapshot = obj as SellerSnapshot;
  return (
    typeof snapshot === 'object' &&
    snapshot !== null &&
    typeof snapshot.sellerId === 'string' &&
    typeof snapshot.sellerName === 'string' &&
    typeof snapshot.totalEarnings === 'number' &&
    typeof snapshot.activeOrders === 'number' &&
    typeof snapshot.averageRating === 'number' &&
    typeof snapshot.pendingActions === 'object'
  );
}

// ==================== Buyer Snapshot ====================

/**
 * Recent order summary for buyer
 * Backend: BuyerSnapshotDto.RecentOrderSummary nested class
 */
export interface BuyerRecentOrderSummary {
  orderId: string;
  orderNumber: string;
  packageTitle: string;
  sellerName: string;
  status: string;
  amount: number;
  createdAt: string;
}

/**
 * Pending actions for buyer
 * Backend: BuyerSnapshotDto.PendingActions nested class
 */
export interface BuyerPendingActions {
  ordersToApprove: number;
  ordersToReview: number;
  messagesToRespond: number;
  proposalsToReview: number;
}

/**
 * Buyer activity snapshot
 * Backend: BuyerSnapshotDto.java
 */
export interface BuyerSnapshot {
  // Identity
  buyerId: string;
  buyerName: string;

  // Spending Metrics
  totalSpent: number;
  spentThisMonth: number;
  walletBalance: number;
  totalSavings: number;

  // Order Metrics
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  ordersAwaitingApproval: number;
  ordersRequiringAction: number;

  // Marketplace Activity
  favoritePackages: number;
  jobsPosted: number;
  activeJobs: number;
  proposalsReceived: number;

  // Reviews
  reviewsGiven: number;
  pendingReviews: number;
  averageRatingGiven: number;

  // Communication
  unreadMessages: number;
  activeConversations: number;

  // Recent Order (optional)
  recentOrder?: BuyerRecentOrderSummary;

  // Pending Actions
  pendingActions: BuyerPendingActions;

  // Recommendations
  recommendedPackagesCount: number;
  personalizationScore: number;
}

/**
 * Type guard for BuyerSnapshot
 */
export function isBuyerSnapshot(obj: unknown): obj is BuyerSnapshot {
  const snapshot = obj as BuyerSnapshot;
  return (
    typeof snapshot === 'object' &&
    snapshot !== null &&
    typeof snapshot.buyerId === 'string' &&
    typeof snapshot.buyerName === 'string' &&
    typeof snapshot.totalSpent === 'number' &&
    typeof snapshot.totalOrders === 'number' &&
    typeof snapshot.pendingActions === 'object'
  );
}

// ==================== API Response Wrappers ====================

/**
 * Generic API response wrapper
 */
export interface SnapshotApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

/**
 * Platform snapshot API response
 */
export type PlatformSnapshotApiResponse = SnapshotApiResponse<PlatformSnapshot>;

/**
 * Seller snapshot API response
 */
export type SellerSnapshotApiResponse = SnapshotApiResponse<SellerSnapshot>;

/**
 * Buyer snapshot API response
 */
export type BuyerSnapshotApiResponse = SnapshotApiResponse<BuyerSnapshot>;

// ==================== Utility Types ====================

/**
 * Snapshot loading state
 */
export interface SnapshotLoadingState {
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * Combined snapshot state with data and loading
 */
export interface SnapshotState<T> extends SnapshotLoadingState {
  data: T | null;
}
