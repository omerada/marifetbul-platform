/**
 * ================================================
 * API ENDPOINTS REGISTRY
 * ================================================
 * Centralized API endpoint definitions matching Spring Boot backend
 * All API paths are defined here for easy maintenance and type safety
 *
 * Base URL: /api/v1
 *
 * @author MarifetBul Development Team
 * @version 2.0.0
 */

// ================================================
// AUTHENTICATION & AUTHORIZATION
// ================================================

export const AUTH_ENDPOINTS = {
  // Registration & Login
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',

  // Password Management
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  CHANGE_PASSWORD: '/auth/change-password',

  // Email Verification
  VERIFY_EMAIL: '/auth/verify-email',
  RESEND_VERIFICATION: '/auth/resend-verification',

  // Current User
  ME: '/auth/me',
  UPDATE_PROFILE: '/auth/profile',
} as const;

// ================================================
// USER MANAGEMENT
// ================================================

export const USER_ENDPOINTS = {
  // User CRUD
  GET_USER: (userId: string) => `/users/${userId}`,
  UPDATE_USER: (userId: string) => `/users/${userId}`,
  DELETE_USER: (userId: string) => `/users/${userId}`,

  // User Profile
  GET_PROFILE: (userId: string) => `/users/${userId}/profile`,
  UPDATE_PROFILE: (userId: string) => `/users/${userId}/profile`,

  // User Stats
  GET_STATS: (userId: string) => `/users/${userId}/stats`,

  // User Settings
  GET_SETTINGS: '/users/settings',
  UPDATE_SETTINGS: '/users/settings',
} as const;

// ================================================
// CATEGORIES
// ================================================

export const CATEGORY_ENDPOINTS = {
  // Category CRUD
  GET_ALL: '/categories',
  GET_BY_ID: (categoryId: string) => `/categories/${categoryId}`,
  CREATE: '/categories',
  UPDATE: (categoryId: string) => `/categories/${categoryId}`,
  DELETE: (categoryId: string) => `/categories/${categoryId}`,

  // Category Tree
  GET_TREE: '/categories/tree',
  GET_ROOT: '/categories/root',
  GET_CHILDREN: (categoryId: string) => `/categories/${categoryId}/children`,

  // Category Stats
  GET_STATS: (categoryId: string) => `/categories/${categoryId}/stats`,
  GET_POPULAR: '/categories/popular',
} as const;

// ================================================
// PACKAGES (GIG SERVICES)
// ================================================

export const PACKAGE_ENDPOINTS = {
  // Package CRUD
  GET_ALL: '/packages',
  GET_BY_ID: (packageId: string) => `/packages/${packageId}`,
  CREATE: '/packages',
  UPDATE: (packageId: string) => `/packages/${packageId}`,
  DELETE: (packageId: string) => `/packages/${packageId}`,

  // Package Search & Filter
  SEARCH: '/packages/search',
  FILTER: '/packages/filter',
  BY_CATEGORY: (categoryId: string) => `/packages/category/${categoryId}`,
  BY_SELLER: (sellerId: string) => `/packages/seller/${sellerId}`,

  // Featured & Recommendations
  FEATURED: '/packages/featured',
  TOP_RATED: '/packages/top-rated',
  RECENT: '/packages/recent',
  RECOMMENDED: '/packages/recommended',
  TRENDING: '/packages/trending',

  // Seller's Packages
  MY_PACKAGES: '/packages/me',
  SELLER_ACTIVE: (sellerId: string) => `/packages/seller/${sellerId}/active`,
  SELLER_INACTIVE: (sellerId: string) =>
    `/packages/seller/${sellerId}/inactive`,

  // Package Actions
  PUBLISH: (packageId: string) => `/packages/${packageId}/publish`,
  UNPUBLISH: (packageId: string) => `/packages/${packageId}/unpublish`,
  DUPLICATE: (packageId: string) => `/packages/${packageId}/duplicate`,

  // Package Stats
  GET_STATS: (packageId: string) => `/packages/${packageId}/stats`,
  GET_ANALYTICS: (packageId: string) => `/packages/${packageId}/analytics`,

  // Admin
  ADMIN_ALL: '/admin/packages',
  ADMIN_PENDING: '/admin/packages/pending',
  ADMIN_APPROVE: (packageId: string) => `/admin/packages/${packageId}/approve`,
  ADMIN_REJECT: (packageId: string) => `/admin/packages/${packageId}/reject`,
} as const;

// ================================================
// JOBS (PROJECT REQUESTS)
// ================================================

export const JOB_ENDPOINTS = {
  // Job CRUD
  GET_ALL: '/jobs',
  GET_BY_ID: (jobId: string) => `/jobs/${jobId}`,
  CREATE: '/jobs',
  UPDATE: (jobId: string) => `/jobs/${jobId}`,
  DELETE: (jobId: string) => `/jobs/${jobId}`,

  // Job Search & Filter
  SEARCH: '/jobs/search',
  FILTER: '/jobs/filter',
  BY_CATEGORY: (categoryId: string) => `/jobs/category/${categoryId}`,
  BY_EMPLOYER: (employerId: string) => `/jobs/employer/${employerId}`,

  // Job Status
  ACTIVE: '/jobs/active',
  CLOSED: '/jobs/closed',
  MY_JOBS: '/jobs/me',

  // Job Actions
  PUBLISH: (jobId: string) => `/jobs/${jobId}/publish`,
  CLOSE: (jobId: string) => `/jobs/${jobId}/close`,
  REOPEN: (jobId: string) => `/jobs/${jobId}/reopen`,

  // Job Stats
  GET_STATS: (jobId: string) => `/jobs/${jobId}/stats`,
  GET_PROPOSALS_COUNT: (jobId: string) => `/jobs/${jobId}/proposals/count`,
} as const;

// ================================================
// PROPOSALS (BIDS)
// ================================================

export const PROPOSAL_ENDPOINTS = {
  // Proposal CRUD
  GET_BY_ID: (proposalId: string) => `/proposals/${proposalId}`,
  CREATE: '/proposals',
  UPDATE: (proposalId: string) => `/proposals/${proposalId}`,
  DELETE: (proposalId: string) => `/proposals/${proposalId}`,
  WITHDRAW: (proposalId: string) => `/proposals/${proposalId}/withdraw`,

  // Job Proposals
  BY_JOB: (jobId: string) => `/jobs/${jobId}/proposals`,

  // Freelancer Proposals
  MY_PROPOSALS: '/proposals/me',
  MY_ACTIVE: '/proposals/me/active',
  MY_PENDING: '/proposals/me/pending',
  MY_ACCEPTED: '/proposals/me/accepted',
  MY_REJECTED: '/proposals/me/rejected',

  // Employer Actions
  ACCEPT: (proposalId: string) => `/proposals/${proposalId}/accept`,
  REJECT: (proposalId: string) => `/proposals/${proposalId}/reject`,
  SHORTLIST: (proposalId: string) => `/proposals/${proposalId}/shortlist`,
} as const;

// ================================================
// ORDERS
// ================================================

export const ORDER_ENDPOINTS = {
  // Order CRUD
  GET_ALL: '/orders',
  GET_BY_ID: (orderId: string) => `/orders/${orderId}`,
  CREATE: '/orders',
  UPDATE: (orderId: string) => `/orders/${orderId}`,
  CANCEL: (orderId: string) => `/orders/${orderId}/cancel`,

  // Order Status
  MY_ORDERS: '/orders/me',
  ACTIVE: '/orders/active',
  COMPLETED: '/orders/completed',
  CANCELLED: '/orders/cancelled',

  // Seller Orders
  SELLER_ORDERS: '/orders/seller',
  SELLER_ACTIVE: '/orders/seller/active',
  SELLER_PENDING: '/orders/seller/pending',

  // Order Actions
  START: (orderId: string) => `/orders/${orderId}/start`,
  DELIVER: (orderId: string) => `/orders/${orderId}/deliver`,
  ACCEPT_DELIVERY: (orderId: string) => `/orders/${orderId}/accept`,
  CONFIRM_MANUAL_PAYMENT: (orderId: string) =>
    `/orders/${orderId}/confirm-manual-payment`,
  REQUEST_REVISION: (orderId: string) => `/orders/${orderId}/revisions`, // Updated to match new API
  COMPLETE: (orderId: string) => `/orders/${orderId}/complete`,

  // Order Revisions
  GET_REVISIONS: (orderId: string) => `/orders/${orderId}/revisions`,
  ACCEPT_REVISION: (orderId: string, revisionId: string) =>
    `/orders/${orderId}/revisions/${revisionId}/accept`,
  COMPLETE_REVISION: (orderId: string, revisionId: string) =>
    `/orders/${orderId}/revisions/${revisionId}/complete`,
  REJECT_REVISION: (orderId: string, revisionId: string) =>
    `/orders/${orderId}/revisions/${revisionId}/reject`,
  PENDING_REVISIONS: '/orders/pending/revisions',

  // Order Timeline
  GET_TIMELINE: (orderId: string) => `/orders/${orderId}/timeline`,

  // Manual Payment Proofs
  UPLOAD_PAYMENT_PROOF: (orderId: string) => `/orders/${orderId}/payment-proof`,
  GET_PAYMENT_PROOF: (orderId: string) => `/orders/${orderId}/payment-proof`,
  CONFIRM_PAYMENT_PROOF: (orderId: string) =>
    `/orders/${orderId}/payment-proof/confirm`,
  DISPUTE_PAYMENT_PROOF: (orderId: string) =>
    `/orders/${orderId}/payment-proof/dispute`,
  GET_PENDING_PAYMENT_PROOFS: '/orders/payment-proofs/pending',
  VERIFY_PAYMENT_PROOF_ADMIN: (proofId: string) =>
    `/orders/payment-proofs/${proofId}/verify`,

  // Admin
  ADMIN_ALL: '/admin/orders',
  ADMIN_RESOLVE: (orderId: string) => `/admin/orders/${orderId}/resolve`,
} as const;

// ================================================
// MESSAGES & CONVERSATIONS
// ================================================

export const MESSAGE_ENDPOINTS = {
  // Conversations
  GET_CONVERSATIONS: '/conversations',
  GET_CONVERSATION: (conversationId: string) =>
    `/conversations/${conversationId}`,
  CREATE_CONVERSATION: '/conversations',
  DELETE_CONVERSATION: (conversationId: string) =>
    `/conversations/${conversationId}`,

  // Messages
  GET_MESSAGES: (conversationId: string) =>
    `/conversations/${conversationId}/messages`,
  SEND_MESSAGE: (conversationId: string) =>
    `/conversations/${conversationId}/messages`,
  DELETE_MESSAGE: (messageId: string) => `/messages/${messageId}`,

  // Message Actions
  MARK_AS_READ: (conversationId: string) =>
    `/conversations/${conversationId}/read`,
  MARK_ALL_AS_READ: '/messages/read-all',

  // Unread Count
  GET_UNREAD_COUNT: '/messages/unread-count',
} as const;

// ================================================
// NOTIFICATIONS
// ================================================

export const NOTIFICATION_ENDPOINTS = {
  // Notifications
  GET_ALL: '/notifications',
  GET_UNREAD: '/notifications/unread',
  GET_BY_ID: (notificationId: string) => `/notifications/${notificationId}`,

  // Notification Actions
  MARK_AS_READ: (notificationId: string) =>
    `/notifications/${notificationId}/read`,
  MARK_ALL_AS_READ: '/notifications/read-all',
  DELETE: (notificationId: string) => `/notifications/${notificationId}`,
  DELETE_ALL: '/notifications/delete-all',

  // Notification Count
  GET_UNREAD_COUNT: '/notifications/unread-count',

  // Notification Preferences
  GET_PREFERENCES: '/notifications/preferences',
  UPDATE_PREFERENCES: '/notifications/preferences',
} as const;

// ================================================
// REVIEWS & RATINGS
// ================================================

export const REVIEW_ENDPOINTS = {
  // ================================================
  // AUTHENTICATED USER REVIEW MANAGEMENT
  // Path: /api/v1/reviews (unified controller v4.0.0)
  // Authorization: isAuthenticated()
  // ================================================

  // Review CRUD
  CREATE: '/reviews',
  UPDATE: (reviewId: string) => `/reviews/${reviewId}`,
  DELETE: (reviewId: string) => `/reviews/${reviewId}`,
  GET_DETAIL: (reviewId: string) => `/reviews/${reviewId}`,

  // My Reviews
  MY_REVIEWS: '/reviews/my',

  // Review Eligibility
  CAN_REVIEW: (orderId: string) => `/reviews/can-review/${orderId}`,

  // Review Voting
  VOTE_HELPFUL: (reviewId: string) => `/reviews/${reviewId}/helpful`,
  VOTE_NOT_HELPFUL: (reviewId: string) => `/reviews/${reviewId}/not-helpful`,

  // Review Flagging
  FLAG_REVIEW: (reviewId: string) => `/reviews/${reviewId}/flag`,

  // ================================================
  // PUBLIC REVIEW QUERIES
  // Path: /api/v1/reviews/public
  // Authorization: None (public access)
  // ================================================

  // Seller Reviews
  BY_SELLER: (sellerId: string) => `/reviews/public/seller/${sellerId}`,
  SELLER_STATS: (sellerId: string) =>
    `/reviews/public/seller/${sellerId}/stats`,

  // Package Reviews
  BY_PACKAGE: (packageId: string) => `/reviews/public/package/${packageId}`,
  BY_PACKAGE_VERIFIED: (packageId: string) =>
    `/reviews/public/package/${packageId}/verified`,

  // Single Review
  GET_BY_ID: (reviewId: string) => `/reviews/public/${reviewId}`,

  // Discovery
  RECENT: '/reviews/public/recent',
  MOST_HELPFUL: '/reviews/public/helpful',
  TOP_SELLERS: '/reviews/public/top-sellers',

  // ================================================
  // SELLER RESPONSE MANAGEMENT
  // Path: /api/v1/reviews/{reviewId}/respond (unified controller v4.0.0)
  // Authorization: hasRole('FREELANCER')
  // ================================================

  // Seller's Reviews List
  MY_SELLER_REVIEWS: '/reviews/about-me',
  MY_SELLER_STATS: '/reviews/about-me/stats',

  // Response CRUD
  GET_REVIEW_FOR_RESPONSE: (reviewId: string) => `/reviews/${reviewId}`,
  ADD_RESPONSE: (reviewId: string) => `/reviews/${reviewId}/respond`,
  UPDATE_RESPONSE: (reviewId: string) => `/reviews/${reviewId}/respond`,
  DELETE_RESPONSE: (reviewId: string) => `/reviews/${reviewId}/respond`,

  // ================================================
  // REVIEW IMAGE MANAGEMENT
  // Path: /api/v1/reviews/{reviewId}/images (unified controller v4.0.0)
  // Authorization: isAuthenticated() - Owner verification via service
  // ================================================

  // Image CRUD
  UPLOAD_IMAGE: (reviewId: string) => `/reviews/${reviewId}/images`,
  GET_IMAGES: (reviewId: string) => `/reviews/${reviewId}/images`,
  DELETE_IMAGE: (reviewId: string, imageId: string) =>
    `/reviews/${reviewId}/images/${imageId}`,
  DELETE_ALL_IMAGES: (reviewId: string) => `/reviews/${reviewId}/images`,

  // ================================================
  // ADMIN REVIEW MODERATION
  // Path: /api/v1/reviews/admin (unified controller v4.0.0)
  // Authorization: hasRole('ADMIN')
  // ================================================

  // Review Lists
  ADMIN_ALL: '/reviews/admin/all',
  ADMIN_PENDING: '/reviews/admin/pending',
  ADMIN_FLAGGED: '/reviews/admin/flagged',
  ADMIN_FOR_MODERATION: '/reviews/admin/pending',

  // Review Detail
  ADMIN_GET_DETAIL: (reviewId: string) => `/reviews/admin/${reviewId}`,

  // Review Actions
  ADMIN_APPROVE: (reviewId: string) => `/reviews/admin/${reviewId}/approve`,
  ADMIN_REJECT: (reviewId: string) => `/reviews/admin/${reviewId}/reject`,
  ADMIN_RESOLVE_FLAG: (reviewId: string) =>
    `/reviews/admin/${reviewId}/resolve`,
  ADMIN_DELETE: (reviewId: string) => `/reviews/admin/${reviewId}`,

  // Statistics
  ADMIN_STATS: '/reviews/admin/stats',
} as const;

// ================================================
// PAYMENTS
// ================================================

export const PAYMENT_ENDPOINTS = {
  // Payment Intent
  CREATE_INTENT: '/payments/intent',
  CONFIRM_INTENT: (intentId: string) => `/payments/intent/${intentId}/confirm`,

  // Payments
  GET_BY_ID: (paymentId: string) => `/payments/${paymentId}`,
  GET_HISTORY: '/payments/history',
  GET_BY_ORDER: (orderId: string) => `/payments/order/${orderId}`,

  // Payment Actions
  REFUND: (paymentId: string) => `/payments/${paymentId}/refund`,
  REQUEST_REFUND: '/payments/refund/request',
  UPDATE_STATUS: (paymentId: string) => `/payments/${paymentId}/status`,

  // Payment Methods
  GET_METHODS: '/payments/methods',
  ADD_METHOD: '/payments/methods',
  DELETE_METHOD: (methodId: string) => `/payments/methods/${methodId}`,
  SET_DEFAULT: (methodId: string) => `/payments/methods/${methodId}/default`,

  // Payment Status
  GET_STATUS: '/payments/status',
} as const;

// ================================================
// WALLET & PAYOUTS
// ================================================

export const WALLET_ENDPOINTS = {
  // Wallet
  GET_WALLET: '/wallet',
  GET_BALANCE: '/wallet/balance',
  GET_TRANSACTIONS: '/wallet/transactions',
  EXPORT_TRANSACTIONS: '/wallet/transactions/export',

  // Bank Accounts - See lib/api/bank-accounts.ts for bank account operations

  // Payouts
  CREATE_PAYOUT: '/payouts',
  GET_PAYOUT: (payoutId: string) => `/payouts/${payoutId}`,
  GET_PAYOUT_HISTORY: '/payouts/history',
  GET_PENDING_PAYOUTS: '/payouts/pending',
  CANCEL_PAYOUT: (payoutId: string) => `/payouts/${payoutId}/cancel`,

  // Payout Settings
  GET_LIMITS: '/payouts/limits',
  GET_ELIGIBILITY: '/payouts/eligibility',

  // Admin
  ADMIN_PROCESS_PAYOUT: (payoutId: string) => `/payouts/${payoutId}/process`,
  ADMIN_PENDING_PAYOUTS: '/payouts/admin/pending',
} as const;

// ================================================
// SEARCH & DISCOVERY
// ================================================

export const SEARCH_ENDPOINTS = {
  // Package Search
  PACKAGES: '/search/packages',
  PACKAGES_ADVANCED: '/search/packages/advanced',
  PACKAGES_BY_CATEGORY: (categoryId: string) =>
    `/search/packages/category/${categoryId}`,
  PACKAGES_BY_SELLER: (sellerId: string) =>
    `/search/packages/seller/${sellerId}`,

  // Search Suggestions
  SUGGEST: '/search/suggest',

  // Featured Content
  FEATURED_PACKAGES: '/search/packages/featured',
  TOP_RATED_PACKAGES: '/search/packages/top-rated',
  RECENT_PACKAGES: '/search/packages/recent',

  // Search Analytics (Admin)
  ZERO_RESULTS: '/admin/analytics/search/zero-results',
  TOP_QUERIES: '/admin/analytics/search/top-queries',
  SEARCH_STATS: '/admin/analytics/search/statistics',
} as const;

// ================================================
// DASHBOARD
// ================================================

export const DASHBOARD_ENDPOINTS = {
  // ================================================
  // ADMIN DASHBOARD
  // Path: /api/v1/dashboard/admin
  // Authorization: hasRole('ADMIN')
  // ================================================

  // Admin Dashboard
  ADMIN_DASHBOARD: '/dashboard/admin',
  ADMIN_DASHBOARD_BY_DAYS: (days: number) => `/dashboard/admin/days/${days}`,
  ADMIN_DASHBOARD_REALTIME: '/dashboard/admin/realtime',
  ADMIN_SNAPSHOT: '/dashboard/admin/snapshot',

  // Admin User Views
  ADMIN_VIEW_SELLER: (sellerId: string) =>
    `/dashboard/admin/seller/${sellerId}`,
  ADMIN_VIEW_BUYER: (buyerId: string) => `/dashboard/admin/buyer/${buyerId}`,

  // Admin Actions
  ADMIN_REFRESH_ALL: '/dashboard/admin/refresh-all',

  // ================================================
  // SELLER/FREELANCER DASHBOARD
  // Path: /api/v1/dashboard/seller
  // Authorization: hasRole('FREELANCER')
  // ================================================

  // Seller Dashboard
  SELLER_DASHBOARD: '/dashboard/seller/me',
  SELLER_DASHBOARD_BY_DAYS: (days: number) =>
    `/dashboard/seller/me/days/${days}`,
  SELLER_DASHBOARD_COMPARISON: '/dashboard/seller/me/comparison',
  SELLER_SNAPSHOT: '/dashboard/seller/me/snapshot',
  SELLER_REFRESH: '/dashboard/seller/me/refresh',

  // ================================================
  // BUYER/EMPLOYER DASHBOARD
  // Path: /api/v1/dashboard/buyer
  // Authorization: hasRole('EMPLOYER')
  // ================================================

  // Buyer Dashboard
  BUYER_DASHBOARD: '/dashboard/buyer/me',
  BUYER_DASHBOARD_BY_DAYS: (days: number) => `/dashboard/buyer/me/days/${days}`,
  BUYER_DASHBOARD_RECOMMENDATIONS: '/dashboard/buyer/me/recommendations',
  BUYER_SNAPSHOT: '/dashboard/buyer/me/snapshot',
  BUYER_REFRESH: '/dashboard/buyer/me/refresh',

  // ================================================
  // ACTIVITY TIMELINE
  // Path: /api/v1/dashboard/freelancer|employer
  // Authorization: role-specific
  // ================================================

  // Activity Feeds
  FREELANCER_ACTIVITIES: '/dashboard/freelancer/activities',
  EMPLOYER_ACTIVITIES: '/dashboard/employer/activities',

  // ================================================
  // WALLET ANALYTICS (FREELANCER)
  // Path: /api/v1/dashboard/analytics
  // Authorization: hasRole('FREELANCER')
  // Added in Story 1.3 - Wallet Analytics Dashboard
  // ================================================

  // Wallet Analytics
  EARNINGS_TREND: '/dashboard/analytics/earnings-trend',
  REVENUE_BREAKDOWN: '/dashboard/analytics/revenue-breakdown',
  TRANSACTION_SUMMARY: '/dashboard/analytics/transaction-summary',
} as const;

// ================================================
// ADMIN & ANALYTICS
// ================================================

export const ADMIN_ENDPOINTS = {
  // User Management
  USERS: '/admin/users',
  GET_USER: (userId: string) => `/admin/users/${userId}`,
  SUSPEND_USER: (userId: string) => `/admin/users/${userId}/suspend`,
  ACTIVATE_USER: (userId: string) => `/admin/users/${userId}/activate`,
  DELETE_USER: (userId: string) => `/admin/users/${userId}`,

  // Content Moderation
  PENDING_PACKAGES: '/admin/packages/pending',
  PENDING_REVIEWS: '/admin/reviews/pending',
  FLAGGED_CONTENT: '/admin/moderation/flagged',

  // Analytics
  SEARCH_ANALYTICS: '/admin/analytics/search/user/{userId}',
  ZERO_RESULTS: '/admin/analytics/search/zero-results',
  TOP_QUERIES: '/admin/analytics/search/top-queries',
  SEARCH_STATISTICS: '/admin/analytics/search/statistics',

  // Package Analytics
  TRENDING_PACKAGES: '/admin/analytics/packages/trending',

  // Revenue Analytics
  REVENUE_OVERVIEW: '/admin/analytics/revenue/overview',

  // User Activity Analytics
  DAU: '/admin/analytics/users/activity/dau',
  MAU: '/admin/analytics/users/activity/mau',
  USER_ACTIVITY: (userId: string) =>
    `/admin/analytics/users/activity/user/${userId}`,
  ACTIVITY_STATISTICS: '/admin/analytics/users/activity/statistics',

  // System Health
  HEALTH: '/admin/analytics/health',
  HEALTH_DATABASE: '/admin/analytics/health/database',
  HEALTH_MEMORY: '/admin/analytics/health/memory',
  METRICS: '/admin/analytics/metrics',
  METRIC: (counterName: string) => `/admin/analytics/metrics/${counterName}`,
} as const;

// ================================================
// BLOG SYSTEM
// ================================================

export const BLOG_ENDPOINTS = {
  // Blog Posts
  GET_POSTS: '/blog/posts',
  GET_POST_BY_ID: (postId: string | number) => `/blog/posts/${postId}`,
  GET_POST_BY_SLUG: (slug: string) => `/blog/posts/slug/${slug}`,
  CREATE_POST: '/blog/posts',
  UPDATE_POST: (postId: string | number) => `/blog/posts/${postId}`,
  DELETE_POST: (postId: string | number) => `/blog/posts/${postId}`,

  // Post Actions
  PUBLISH_POST: (postId: string | number) => `/blog/posts/${postId}/publish`,
  SCHEDULE_POST: (postId: string | number) => `/blog/posts/${postId}/schedule`,
  UNPUBLISH_POST: (postId: string | number) =>
    `/blog/posts/${postId}/unpublish`,
  ARCHIVE_POST: (postId: string | number) => `/blog/posts/${postId}/archive`,
  INCREMENT_VIEW: (postId: string | number) => `/blog/posts/${postId}/view`,

  // Post Discovery
  GET_FEATURED: '/blog/posts/featured',
  GET_TRENDING: '/blog/posts/trending',
  GET_POPULAR: '/blog/posts/popular',
  GET_DISCUSSED: '/blog/posts/discussed',
  GET_RELATED: (postId: string | number) => `/blog/posts/${postId}/related`,
  SEARCH_POSTS: '/blog/posts/search',

  // Post by Category/Tag/Author
  BY_CATEGORY: (categorySlug: string) => `/blog/posts/category/${categorySlug}`,
  BY_TAG: (tagSlug: string) => `/blog/posts/tag/${tagSlug}`,
  BY_AUTHOR: (authorId: string) => `/blog/posts/author/${authorId}`,

  // Author Posts
  MY_POSTS: '/blog/posts/my-posts',
  MY_DRAFTS: '/blog/posts/my-drafts',

  // Admin
  ADMIN_ALL_POSTS: '/blog/posts/admin/all',
  ADMIN_BY_STATUS: (status: string) => `/blog/posts/admin/status/${status}`,
  ADMIN_STATISTICS: '/blog/posts/admin/statistics',

  // Blog Categories
  GET_CATEGORIES: '/blog/categories',
  GET_CATEGORY_BY_ID: (categoryId: string | number) =>
    `/blog/categories/${categoryId}`,
  GET_CATEGORY_BY_SLUG: (slug: string) => `/blog/categories/slug/${slug}`,
  CREATE_CATEGORY: '/blog/categories',
  UPDATE_CATEGORY: (categoryId: string | number) =>
    `/blog/categories/${categoryId}`,
  DELETE_CATEGORY: (categoryId: string | number) =>
    `/blog/categories/${categoryId}`,

  // Blog Comments
  GET_COMMENTS_BY_POST: (postId: string | number) =>
    `/blog/posts/${postId}/comments`,
  GET_APPROVED_COMMENTS: (postId: string | number) =>
    `/blog/posts/${postId}/comments`,
  GET_ALL_COMMENTS_BY_POST: (postId: string | number) =>
    `/blog/posts/${postId}/comments/all`,
  GET_COMMENT_BY_ID: (commentId: string | number) =>
    `/blog/comments/${commentId}`,
  CREATE_COMMENT: (postId: string | number) => `/blog/posts/${postId}/comments`,
  UPDATE_COMMENT: (commentId: string | number) => `/blog/comments/${commentId}`,
  DELETE_COMMENT: (commentId: string | number) => `/blog/comments/${commentId}`,
  GET_COMMENT_REPLIES: (commentId: string | number) =>
    `/blog/comments/${commentId}/replies`,
  COUNT_COMMENTS: (postId: string | number) =>
    `/blog/posts/${postId}/comments/count`,

  // Comment Moderation (Admin)
  GET_PENDING_COMMENTS: '/blog/admin/comments/pending',
  GET_COMMENTS_BY_STATUS: '/blog/admin/comments',
  GET_USER_COMMENTS: (userId: string) => `/blog/users/${userId}/comments`,
  APPROVE_COMMENT: (commentId: string | number) =>
    `/blog/admin/comments/${commentId}/approve`,
  REJECT_COMMENT: (commentId: string | number) =>
    `/blog/admin/comments/${commentId}/reject`,
  SPAM_COMMENT: (commentId: string | number) =>
    `/blog/admin/comments/${commentId}/spam`,
  ESCALATE_COMMENT: (commentId: string | number) =>
    `/blog/admin/comments/${commentId}/escalate`,

  // Bulk Comment Actions (Sprint 1 - EPIC 2)
  BULK_APPROVE_COMMENTS: '/blog/admin/comments/bulk/approve',
  BULK_REJECT_COMMENTS: '/blog/admin/comments/bulk/reject',
  BULK_SPAM_COMMENTS: '/blog/admin/comments/bulk/spam',
  BULK_ESCALATE_COMMENTS: '/blog/admin/comments/bulk/escalate',

  // Comment Reports (Future)
  REPORT_COMMENT: (commentId: string | number) =>
    `/blog/comments/${commentId}/report`,
} as const;

// ================================================
// WEBHOOKS
// ================================================

export const WEBHOOK_ENDPOINTS = {
  // Webhook Handler
  HANDLE: '/webhooks',
  VERIFY: '/webhooks/verify',

  // Payment Webhooks (Iyzico)
  IYZICO: '/webhooks/iyzico',
} as const;

// ================================================
// UTILITY FUNCTIONS
// ================================================

/**
 * Build full API URL with base path
 */
export function buildApiUrl(endpoint: string, baseUrl = '/api/v1'): string {
  return `${baseUrl}${endpoint}`;
}

/**
 * Build URL with query parameters
 */
export function buildUrlWithParams(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>
): string {
  if (!params) return endpoint;

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${endpoint}?${queryString}` : endpoint;
}

/**
 * Replace path parameters in endpoint
 * Example: replacePath('/users/:userId', { userId: '123' }) => '/users/123'
 */
export function replacePathParams(
  endpoint: string,
  params: Record<string, string | number>
): string {
  let result = endpoint;
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`:${key}`, String(value));
  });
  return result;
}

// ================================================
// TYPE-SAFE ENDPOINT HELPERS
// ================================================

/**
 * Get all endpoints as a flat list (useful for debugging)
 */
export function getAllEndpoints(): string[] {
  const endpoints: string[] = [];

  const addEndpoints = (obj: Record<string, unknown>) => {
    Object.values(obj).forEach((value) => {
      if (typeof value === 'string') {
        endpoints.push(value);
      } else if (typeof value === 'function') {
        // Skip functions
      }
    });
  };

  addEndpoints(AUTH_ENDPOINTS);
  addEndpoints(USER_ENDPOINTS);
  addEndpoints(CATEGORY_ENDPOINTS);
  addEndpoints(PACKAGE_ENDPOINTS);
  addEndpoints(JOB_ENDPOINTS);
  addEndpoints(PROPOSAL_ENDPOINTS);
  addEndpoints(ORDER_ENDPOINTS);
  addEndpoints(MESSAGE_ENDPOINTS);
  addEndpoints(NOTIFICATION_ENDPOINTS);
  addEndpoints(REVIEW_ENDPOINTS);
  addEndpoints(PAYMENT_ENDPOINTS);
  addEndpoints(WALLET_ENDPOINTS);
  addEndpoints(SEARCH_ENDPOINTS);
  addEndpoints(DASHBOARD_ENDPOINTS);
  addEndpoints(ADMIN_ENDPOINTS);
  addEndpoints(BLOG_ENDPOINTS);
  addEndpoints(WEBHOOK_ENDPOINTS);

  return endpoints;
}

// ================================================
// EXPORTS
// ================================================

const API_ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  USER: USER_ENDPOINTS,
  CATEGORY: CATEGORY_ENDPOINTS,
  PACKAGE: PACKAGE_ENDPOINTS,
  JOB: JOB_ENDPOINTS,
  PROPOSAL: PROPOSAL_ENDPOINTS,
  ORDER: ORDER_ENDPOINTS,
  MESSAGE: MESSAGE_ENDPOINTS,
  NOTIFICATION: NOTIFICATION_ENDPOINTS,
  REVIEW: REVIEW_ENDPOINTS,
  PAYMENT: PAYMENT_ENDPOINTS,
  WALLET: WALLET_ENDPOINTS,
  SEARCH: SEARCH_ENDPOINTS,
  DASHBOARD: DASHBOARD_ENDPOINTS,
  ADMIN: ADMIN_ENDPOINTS,
  BLOG: BLOG_ENDPOINTS,
  WEBHOOK: WEBHOOK_ENDPOINTS,
};

export default API_ENDPOINTS;
