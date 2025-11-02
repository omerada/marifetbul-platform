/**
 * ================================================
 * BUYER DASHBOARD API TYPES
 * ================================================
 * Backend API response types for Buyer/Employer Dashboard
 *
 * Maps to: BuyerDashboardDto.java
 * Endpoints:
 * - GET /api/v1/dashboard/buyer
 * - GET /api/v1/dashboard/buyer/days/{days}
 * - GET /api/v1/dashboard/buyer/realtime
 *
 * @version 1.0.0
 * @sprint Sprint 1 - Task T-107
 * @date 2 Kasım 2025
 */

/**
 * Main Buyer Dashboard API Response
 * Maps to: BuyerDashboardDto.java
 */
export interface BuyerDashboardApiResponse {
  /** Buyer identification */
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  memberSince: string; // ISO 8601 datetime

  /** Time period information */
  periodStart: string; // ISO 8601 datetime
  periodEnd: string; // ISO 8601 datetime
  periodDays: number;

  /** Order summary */
  orderSummary: OrderSummary;

  /** Favorites & wishlist */
  favorites: Favorites;

  /** Purchase history */
  purchaseHistory: PurchaseHistory;

  /** Review activity */
  reviewActivity: ReviewActivity;

  /** Messages */
  messages: Messages;

  /** Recommendations */
  recommendations: Recommendations;

  /** Activity summary */
  activitySummary: ActivitySummary;

  /** Savings & deals */
  savings: Savings;

  /** Notifications */
  notifications: Notifications;

  /** Metadata */
  generatedAt: string; // ISO 8601 datetime
  fromCache: boolean;
  cacheAgeSeconds: number;
}

/**
 * Order Summary
 * Maps to: BuyerDashboardDto.OrderSummary
 */
export interface OrderSummary {
  /** Total orders */
  totalOrders: number;

  /** Completed orders */
  completedOrders: number;

  /** In progress orders */
  inProgressOrders: number;

  /** Cancelled orders */
  cancelledOrders: number;

  /** Total spent (TRY) */
  totalSpent: number;

  /** Average order value (TRY) */
  averageOrderValue: number;

  /** Total items purchased */
  totalItems: number;

  /** Recent orders */
  recentOrders: RecentOrder[];

  /** Active orders */
  activeOrders: RecentOrder[];
}

/**
 * Recent Order
 * Maps to: BuyerDashboardDto.RecentOrder
 */
export interface RecentOrder {
  /** Order UUID */
  orderId: string;

  /** Package title */
  packageTitle: string;

  /** Seller name */
  sellerName: string;

  /** Order amount (TRY) */
  amount: number;

  /** Order status */
  status: string;

  /** Order date (ISO 8601) */
  orderDate: string;

  /** Delivery date (ISO 8601) */
  deliveryDate: string | null;

  /** Can leave review */
  canReview: boolean;
}

/**
 * Favorites & Wishlist
 * Maps to: BuyerDashboardDto.Favorites
 */
export interface Favorites {
  /** Total favorites */
  totalFavorites: number;

  /** New favorites in period */
  newFavorites: number;

  /** Favorite packages */
  favoritePackages: FavoritePackage[];

  /** Recently viewed packages */
  recentlyViewed: FavoritePackage[];
}

/**
 * Favorite Package
 * Maps to: BuyerDashboardDto.FavoritePackage
 */
export interface FavoritePackage {
  /** Package UUID */
  packageId: string;

  /** Package title */
  title: string;

  /** Seller name */
  sellerName: string;

  /** Price (TRY) */
  price: number;

  /** Rating */
  rating: number;

  /** Review count */
  reviewCount: number;

  /** Thumbnail URL */
  thumbnailUrl: string;

  /** In stock */
  inStock: boolean;

  /** Date added to favorites (ISO 8601) */
  addedDate: string;
}

/**
 * Purchase History
 * Maps to: BuyerDashboardDto.PurchaseHistory
 */
export interface PurchaseHistory {
  /** Lifetime spent (TRY) */
  lifetimeSpent: number;

  /** Lifetime orders */
  lifetimeOrders: number;

  /** Favorite category */
  favoriteCategory: string;

  /** Favorite seller */
  favoriteSeller: string;

  /** Purchases by category */
  purchasesByCategory: Record<string, number>;

  /** Spending by category */
  spendingByCategory: Record<string, number>;

  /** Spending trend */
  spendingTrend: DailyTrend[];
}

/**
 * Daily Trend Data Point
 * Maps to: BuyerDashboardDto.DailyTrend
 */
export interface DailyTrend {
  /** Date (ISO format) */
  date: string;

  /** Value (can be number or string) */
  value: number | string;
}

/**
 * Review Activity
 * Maps to: BuyerDashboardDto.ReviewActivity
 */
export interface ReviewActivity {
  /** Total reviews given */
  totalReviewsGiven: number;

  /** Pending reviews */
  pendingReviews: number;

  /** Average rating given */
  averageRatingGiven: number;

  /** Recent reviews */
  recentReviews: RecentReview[];
}

/**
 * Recent Review
 * Maps to: BuyerDashboardDto.RecentReview
 */
export interface RecentReview {
  /** Review UUID */
  reviewId: string;

  /** Package title */
  packageTitle: string;

  /** Seller name */
  sellerName: string;

  /** Rating (1-5) */
  rating: number;

  /** Review comment */
  comment: string;

  /** Review date (ISO 8601) */
  reviewDate: string;
}

/**
 * Messages
 * Maps to: BuyerDashboardDto.Messages
 */
export interface Messages {
  /** Total conversations */
  totalConversations: number;

  /** Unread messages */
  unreadMessages: number;

  /** Active conversations */
  activeConversations: number;

  /** Recent conversations */
  recentConversations: ConversationPreview[];
}

/**
 * Conversation Preview
 * Maps to: BuyerDashboardDto.ConversationPreview
 */
export interface ConversationPreview {
  /** Conversation UUID */
  conversationId: string;

  /** Seller name */
  sellerName: string;

  /** Last message */
  lastMessage: string;

  /** Last message date (ISO 8601) */
  lastMessageDate: string;

  /** Has unread messages */
  hasUnread: boolean;

  /** Unread count */
  unreadCount: number;
}

/**
 * Recommendations
 * Maps to: BuyerDashboardDto.Recommendations
 */
export interface Recommendations {
  /** Personalized recommendations */
  forYou: RecommendedPackage[];

  /** Trending packages */
  trending: RecommendedPackage[];

  /** Similar to viewed/purchased */
  similar: RecommendedPackage[];

  /** New arrivals in favorite categories */
  newArrivals: RecommendedPackage[];
}

/**
 * Recommended Package
 * Maps to: BuyerDashboardDto.RecommendedPackage
 */
export interface RecommendedPackage {
  /** Package UUID */
  packageId: string;

  /** Package title */
  title: string;

  /** Seller name */
  sellerName: string;

  /** Category name */
  categoryName: string;

  /** Price (TRY) */
  price: number;

  /** Rating */
  rating: number;

  /** Review count */
  reviewCount: number;

  /** Thumbnail URL */
  thumbnailUrl: string;

  /** Recommendation reason */
  recommendationReason: string;
}

/**
 * Activity Summary
 * Maps to: BuyerDashboardDto.ActivitySummary
 */
export interface ActivitySummary {
  /** Searches performed */
  searchesPerformed: number;

  /** Packages viewed */
  packagesViewed: number;

  /** Sellers followed */
  sellersFollowed: number;

  /** Last login date (ISO 8601) */
  lastLoginDate: string;

  /** Days active */
  daysActive: number;

  /** Top search keywords */
  topSearchKeywords: string[];
}

/**
 * Savings & Deals
 * Maps to: BuyerDashboardDto.Savings
 */
export interface Savings {
  /** Total saved from discounts (TRY) */
  totalSaved: number;

  /** Coupons used */
  couponsUsed: number;

  /** Active coupons */
  activeCoupons: number;

  /** Available coupons */
  availableCoupons: ActiveCoupon[];
}

/**
 * Active Coupon
 * Maps to: BuyerDashboardDto.ActiveCoupon
 */
export interface ActiveCoupon {
  /** Coupon code */
  couponCode: string;

  /** Description */
  description: string;

  /** Discount value */
  discountValue: number;

  /** Discount type */
  discountType: 'PERCENTAGE' | 'FIXED';

  /** Expiry date (ISO 8601) */
  expiryDate: string;
}

/**
 * Notifications
 * Maps to: BuyerDashboardDto.Notifications
 */
export interface Notifications {
  /** Unread count */
  unreadCount: number;

  /** Recent notifications */
  recent: Notification[];
}

/**
 * Notification
 * Maps to: BuyerDashboardDto.Notification
 */
export interface Notification {
  /** Notification UUID */
  notificationId: string;

  /** Notification type */
  type: string;

  /** Title */
  title: string;

  /** Message */
  message: string;

  /** Created at (ISO 8601) */
  createdAt: string;

  /** Is read */
  isRead: boolean;
}

// ================================================
// TYPE GUARDS
// ================================================

/**
 * Type guard for BuyerDashboardApiResponse
 */
export function isBuyerDashboardApiResponse(
  data: unknown
): data is BuyerDashboardApiResponse {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  return (
    typeof obj.buyerId === 'string' &&
    typeof obj.buyerName === 'string' &&
    typeof obj.periodStart === 'string' &&
    typeof obj.periodEnd === 'string' &&
    typeof obj.periodDays === 'number' &&
    typeof obj.orderSummary === 'object' &&
    typeof obj.favorites === 'object' &&
    typeof obj.generatedAt === 'string' &&
    typeof obj.fromCache === 'boolean'
  );
}

/**
 * Type guard for OrderSummary
 */
export function isOrderSummary(data: unknown): data is OrderSummary {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  return (
    typeof obj.totalOrders === 'number' &&
    typeof obj.completedOrders === 'number' &&
    typeof obj.totalSpent === 'number'
  );
}

// ================================================
// UTILITY TYPES
// ================================================

/**
 * Buyer Quick Stats (for header/summary)
 */
export interface BuyerQuickStats {
  /** Total spent (TRY) */
  totalSpent: number;

  /** Active orders */
  activeOrders: number;

  /** Pending reviews */
  pendingReviews: number;

  /** Unread messages */
  unreadMessages: number;

  /** Available coupons */
  availableCoupons: number;
}
