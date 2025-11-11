/**
 * ================================================
 * ADMIN PAYMENT RETRY API CLIENT
 * ================================================
 * API client for admin payment retry management
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 11, 2025
 */

import { apiClient } from '@/lib/infrastructure/api/client';

// ================================================
// TYPES
// ================================================

export enum PaymentRetryStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  EXHAUSTED = 'EXHAUSTED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentFailureReason {
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  INVALID_CARD = 'INVALID_CARD',
  EXPIRED_CARD = 'EXPIRED_CARD',
  FRAUD_DETECTION = 'FRAUD_DETECTION',
  GATEWAY_ERROR = 'GATEWAY_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  USER_CANCELLED = 'USER_CANCELLED',
  UNKNOWN = 'UNKNOWN',
}

export interface PaymentRetryDto {
  id: number;
  paymentId: number;
  orderId: number;
  userId: number;
  amount: number;
  currency: 'TRY';
  status: PaymentRetryStatus;
  failureReason: PaymentFailureReason;
  retryCount: number;
  maxRetries: number;
  nextRetryAt: string | null;
  lastRetryAt: string | null;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRetryFilters {
  status?: PaymentRetryStatus;
  failureReason?: PaymentFailureReason;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  userId?: number;
  orderId?: number;
  page?: number;
  size?: number;
  sort?: string;
}

export interface PaymentRetryStatistics {
  totalRetries: number;
  pendingRetries: number;
  completedRetries: number;
  failedRetries: number;
  exhaustedRetries: number;
  totalAmount: number;
  successRate: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ManualRetryRequest {
  paymentRetryId: number;
  adminNote?: string;
}

// ================================================
// API FUNCTIONS
// ================================================

/**
 * Get paginated payment retries with filters
 */
export async function getPaymentRetries(
  filters: PaymentRetryFilters = {}
): Promise<PageResponse<PaymentRetryDto>> {
  const params = new URLSearchParams();

  if (filters.status) params.append('status', filters.status);
  if (filters.failureReason) params.append('failureReason', filters.failureReason);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.minAmount) params.append('minAmount', filters.minAmount.toString());
  if (filters.maxAmount) params.append('maxAmount', filters.maxAmount.toString());
  if (filters.userId) params.append('userId', filters.userId.toString());
  if (filters.orderId) params.append('orderId', filters.orderId.toString());
  if (filters.page !== undefined) params.append('page', filters.page.toString());
  if (filters.size !== undefined) params.append('size', filters.size.toString());
  if (filters.sort) params.append('sort', filters.sort);

  return apiClient.get(`/api/v1/admin/payments/retries?${params.toString()}`);
}

/**
 * Get pending payment retries
 */
export async function getPendingRetries(
  filters: PaymentRetryFilters = {}
): Promise<PageResponse<PaymentRetryDto>> {
  return getPaymentRetries({ ...filters, status: PaymentRetryStatus.PENDING });
}

/**
 * Get exhausted payment retries
 */
export async function getExhaustedRetries(
  filters: PaymentRetryFilters = {}
): Promise<PageResponse<PaymentRetryDto>> {
  return getPaymentRetries({ ...filters, status: PaymentRetryStatus.EXHAUSTED });
}

/**
 * Get payment retry statistics
 */
export async function getPaymentRetryStatistics(
  filters: Omit<PaymentRetryFilters, 'page' | 'size' | 'sort'> = {}
): Promise<PaymentRetryStatistics> {
  const params = new URLSearchParams();

  if (filters.status) params.append('status', filters.status);
  if (filters.failureReason) params.append('failureReason', filters.failureReason);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);

  return apiClient.get(
    `/api/v1/admin/payments/retries/statistics?${params.toString()}`
  );
}

/**
 * Manually trigger payment retry
 */
export async function triggerManualRetry(
  request: ManualRetryRequest
): Promise<PaymentRetryDto> {
  return apiClient.post('/api/v1/admin/payments/retries/manual', request);
}

/**
 * Cancel payment retry
 */
export async function cancelPaymentRetry(
  retryId: number,
  reason?: string
): Promise<void> {
  const url = reason
    ? `/api/v1/admin/payments/retries/${retryId}?reason=${encodeURIComponent(reason)}`
    : `/api/v1/admin/payments/retries/${retryId}`;
  return apiClient.delete(url);
}

/**
 * Get payment retry by ID
 */
export async function getPaymentRetryById(
  retryId: number
): Promise<PaymentRetryDto> {
  return apiClient.get(`/api/v1/admin/payments/retries/${retryId}`);
}

/**
 * Get payment retries by payment ID
 */
export async function getPaymentRetriesByPaymentId(
  paymentId: number
): Promise<PaymentRetryDto[]> {
  return apiClient.get(`/api/v1/admin/payments/retries/payment/${paymentId}`);
}

/**
 * Get payment retries by order ID
 */
export async function getPaymentRetriesByOrderId(
  orderId: number
): Promise<PaymentRetryDto[]> {
  return apiClient.get(`/api/v1/admin/payments/retries/order/${orderId}`);
}

// ================================================
// DEFAULT EXPORT
// ================================================

export default {
  getPaymentRetries,
  getPendingRetries,
  getExhaustedRetries,
  getPaymentRetryStatistics,
  triggerManualRetry,
  cancelPaymentRetry,
  getPaymentRetryById,
  getPaymentRetriesByPaymentId,
  getPaymentRetriesByOrderId,
};
