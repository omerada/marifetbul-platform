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

// Export Payment API
export { paymentApi } from './payment';
export type { Payment, PaymentIntent } from './validators';
export type { CreatePaymentRequest, RefundRequest } from './payment';

// Export Payout API
export { payoutApi } from './payout';
export type { Payout, PayoutEligibility } from './validators';
export type { CreatePayoutRequest, RejectPayoutRequest } from './payout';

// Export Payment Method API
export { paymentMethodApi } from './payment-method';
export type {
  PaymentMethod,
  AddPaymentMethodRequest,
  UpdatePaymentMethodRequest,
  PaymentMethodType,
} from './payment-method';
