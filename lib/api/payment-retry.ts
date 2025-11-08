/**
 * ================================================
 * PAYMENT RETRY API CLIENT
 * ================================================
 * API client for payment retry and recovery operations
 *
 * Sprint: Payment & Refund System Hardening
 * @version 1.0.0
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import type {
  PaymentRetry,
  PaymentRetryResult,
  RetrySuccessRateStats,
  PaymentRetryFilters,
  PaymentRetryListResponse,
  FailureReasonStats,
  ManualRetryRequest,
} from '@/types/business/features/payment-retry';

const BASE_URL = '/payments/retry';

// ============================================================================
// User Operations
// ============================================================================

/**
 * Get retry status for a payment
 * GET /api/v1/payments/retry/{paymentId}
 *
 * @param paymentId - Payment UUID
 * @returns Retry status if exists
 */
export async function getPaymentRetryStatus(
  paymentId: string
): Promise<PaymentRetry | null> {
  try {
    return await apiClient.get<PaymentRetry>(`${BASE_URL}/${paymentId}`);
  } catch (error) {
    // Return null if no retry exists (404)
    if (error instanceof Error && error.message.includes('404')) {
      return null;
    }
    throw error;
  }
}

/**
 * Manually retry a failed payment
 * POST /api/v1/payments/retry/{paymentId}/manual
 *
 * @param paymentId - Payment UUID
 * @param reason - Optional retry reason
 * @returns Retry result
 */
export async function manualRetryPayment(
  paymentId: string,
  reason?: string
): Promise<PaymentRetryResult> {
  const request: ManualRetryRequest = { paymentId, reason };
  return await apiClient.post<PaymentRetryResult>(
    `${BASE_URL}/${paymentId}/manual`,
    request
  );
}

/**
 * Cancel retry for a payment
 * DELETE /api/v1/payments/retry/{paymentId}
 *
 * @param paymentId - Payment UUID
 * @returns Updated retry record
 */
export async function cancelPaymentRetry(
  paymentId: string
): Promise<PaymentRetry> {
  return await apiClient.delete<PaymentRetry>(`${BASE_URL}/${paymentId}`);
}

/**
 * Check if payment has active retry
 * GET /api/v1/payments/retry/{paymentId}/active
 *
 * @param paymentId - Payment UUID
 * @returns true if active retry exists
 */
export async function hasActiveRetry(paymentId: string): Promise<boolean> {
  try {
    const result = await apiClient.get<{ active: boolean }>(
      `${BASE_URL}/${paymentId}/active`
    );
    return result.active;
  } catch {
    return false;
  }
}

// ============================================================================
// Admin Operations
// ============================================================================

/**
 * Get all pending retries (Admin)
 * GET /api/v1/payments/retry/pending
 *
 * @returns List of pending retries
 */
export async function getPendingRetries(): Promise<PaymentRetry[]> {
  return await apiClient.get<PaymentRetry[]>(`${BASE_URL}/pending`);
}

/**
 * Get all exhausted retries (Admin)
 * GET /api/v1/payments/retry/exhausted
 *
 * @returns List of exhausted retries needing manual intervention
 */
export async function getExhaustedRetries(): Promise<PaymentRetry[]> {
  return await apiClient.get<PaymentRetry[]>(`${BASE_URL}/exhausted`);
}

/**
 * Get failed payments with filters (Admin)
 * GET /api/v1/payments/retry/failed
 *
 * @param filters - Filter parameters
 * @returns Paginated list of retries
 */
export async function getFailedPayments(
  filters?: PaymentRetryFilters
): Promise<PaymentRetryListResponse> {
  const params = new URLSearchParams();

  if (filters?.status) params.append('status', filters.status);
  if (filters?.failureReason)
    params.append('failureReason', filters.failureReason);
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
  if (filters?.dateTo) params.append('dateTo', filters.dateTo);
  if (filters?.page !== undefined)
    params.append('page', filters.page.toString());
  if (filters?.pageSize !== undefined)
    params.append('pageSize', filters.pageSize.toString());

  const queryString = params.toString();
  const url = queryString
    ? `${BASE_URL}/failed?${queryString}`
    : `${BASE_URL}/failed`;

  return await apiClient.get<PaymentRetryListResponse>(url);
}

/**
 * Get failure reason breakdown (Admin)
 * GET /api/v1/payments/retry/stats/failure-reasons
 *
 * @returns Map of failure reasons to counts
 */
export async function getFailureReasonBreakdown(): Promise<
  FailureReasonStats[]
> {
  const data = await apiClient.get<Record<string, number>>(
    `${BASE_URL}/stats/failure-reasons`
  );

  // Convert to array format
  const total = Object.values(data).reduce((sum, count) => sum + count, 0);

  return Object.entries(data).map(([reason, count]) => ({
    reason,
    count,
    percentage: total > 0 ? (count / total) * 100 : 0,
  }));
}

/**
 * Get retry success rate stats (Admin)
 * GET /api/v1/payments/retry/stats/success-rate
 *
 * @returns Retry success rate statistics
 */
export async function getRetrySuccessRate(): Promise<RetrySuccessRateStats> {
  return await apiClient.get<RetrySuccessRateStats>(
    `${BASE_URL}/stats/success-rate`
  );
}

/**
 * Export failed payments to CSV (Admin)
 * GET /api/v1/payments/retry/export
 *
 * @param filters - Filter parameters
 * @returns CSV content as blob
 */
export async function exportFailedPayments(
  filters?: PaymentRetryFilters
): Promise<Blob> {
  const params = new URLSearchParams();

  if (filters?.status) params.append('status', filters.status);
  if (filters?.failureReason)
    params.append('failureReason', filters.failureReason);
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
  if (filters?.dateTo) params.append('dateTo', filters.dateTo);

  const queryString = params.toString();
  const url = queryString
    ? `${BASE_URL}/export?${queryString}`
    : `${BASE_URL}/export`;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1${url}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to export failed payments');
  }

  return response.blob();
}

// ============================================================================
// Export API Object
// ============================================================================

export const paymentRetryApi = {
  // User operations
  getPaymentRetryStatus,
  manualRetryPayment,
  cancelPaymentRetry,
  hasActiveRetry,

  // Admin operations
  getPendingRetries,
  getExhaustedRetries,
  getFailedPayments,
  getFailureReasonBreakdown,
  getRetrySuccessRate,
  exportFailedPayments,
};

export default paymentRetryApi;
