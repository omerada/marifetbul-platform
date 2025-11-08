/**
 * ================================================
 * API MODULE - PUBLIC EXPORTS
 * ================================================
 * Central export point for all API-related functionality
 * Re-exports from infrastructure layer for convenience
 *
 * @author MarifetBul Development Team
 * @version 2.0.0
 */

// Export API Client from infrastructure
export {
  apiClient,
  fetcher,
  fetcherWithParams,
} from '../infrastructure/api/client';

// Export endpoints
export { default as API_ENDPOINTS } from './endpoints';
export * from './endpoints';

// Export Admin Dashboard API
export { adminDashboardApi } from './admin-dashboard';
export type {
  AdminDashboardBackendDto,
  PlatformSnapshotDto,
} from './admin-dashboard';

// Export Seller Dashboard API
export { sellerDashboardApi } from './seller-dashboard';
export type {
  SellerDashboardBackendDto,
  SellerSnapshotDto,
  ActivityDto,
} from './seller-dashboard';

// Export Buyer Dashboard API
export { buyerDashboardApi } from './buyer-dashboard';
export type {
  BuyerDashboardBackendDto,
  BuyerSnapshotDto,
} from './buyer-dashboard';

// Export Dashboard Analytics API
export {
  getEarningsTrend,
  getRevenueBreakdown,
  getTransactionSummary,
} from './dashboard-analytics-api';
export type {
  EarningsTrendResponse,
  RevenueBreakdownResponse,
  TransactionSummaryResponse,
} from './dashboard-analytics-api';

// Export Wallet API
export { walletApi } from './wallet';
export type { Wallet, BalanceResponse, Transaction } from './validators';

// Export Bank Accounts API
export * from './bank-accounts';

// Export Payment API
export { paymentApi } from './payment';
export type { Payment, PaymentIntent } from './validators';
export type { CreatePaymentRequest, RefundRequest } from './payment';

// Export Payment Retry API
export { paymentRetryApi } from './payment-retry';

// Payout API (new location - consolidated)
export * from './payouts';

// Legacy payout exports (deprecated - will be removed in Sprint 2)
// @deprecated Use exports from './payouts' instead
export type { RequestPayoutRequest as CreatePayoutRequest } from './payouts';
export type {
  PayoutResponse as Payout,
  PayoutResponse as PayoutEligibility,
} from './payouts';

// Export Payment Method API
export { paymentMethodApi } from './payment-method';
export type {
  PaymentMethod,
  AddPaymentMethodRequest,
  UpdatePaymentMethodRequest,
  PaymentMethodType,
} from './payment-method';

// Export Job API
export * from './jobs';

// Export Proposal API (already exists)
export * from './proposals';

// Export Blog Moderation API
export * from './blog-moderation';

// Export Review Moderation API
export * from './review-moderation';

// Export Moderation Activity API
export { default as moderationActivityAPI } from './moderation-activity';
export * from './moderation-activity';

// Export Package Analytics API (Sprint 1 - Task 1)
export * from './package-analytics';
export {
  fetchPackageAnalytics,
  fetchPackageAnalyticsByDateRange,
} from './package-analytics';
export type {
  PackageMetrics,
  PackageTrends,
  TopPackage,
  ChartData,
  PackageAnalyticsData,
} from './package-analytics';

// Export Popular Searches API (Sprint 1 - Task 2)
export * from './popular-searches';
export {
  fetchPopularSearches,
  fetchPopularSearchesWithCache,
} from './popular-searches';
export type {
  PopularSearch,
  PopularSearchesResponse,
} from './popular-searches';

// Export Job Facets API (Sprint 1 - Task 5)
export * from './job-facets';
export {
  fetchJobFacets,
  fetchJobFacetsWithCache,
  jobFacetsApi,
} from './job-facets';
export type { JobFacetsData } from './job-facets';

// Export Admin Reports API (Sprint 1 - Task 4)
export * from './admin-reports';
export {
  generateReport,
  getReportTypes,
  getDateRange,
  getTrendIcon,
  getTrendColor,
  formatMetricValue,
  formatDateForAPI,
} from './admin-reports';
export type {
  ReportType,
  GroupByPeriod,
  TrendDirection,
  ReportFilters,
  ReportRequest,
  ReportDataPoint,
  ReportSummary,
  ReportMetadata,
  ReportResponse,
  ReportTypeInfo,
  ReportTypesResponse,
} from './admin-reports';
