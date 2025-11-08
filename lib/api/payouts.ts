/**
 * Payout API Client
 * Sprint 1: Payout System Implementation
 *
 * Handles all payout-related API operations:
 * - Request payout
 * - Get payout history
 * - Cancel payout
 * - Admin approve/reject
 */

import { apiClient } from '../infrastructure/api/client';

// ================================================
// TYPES
// ================================================

export interface RequestPayoutRequest {
  amount: number;
  bankAccountId: string; // Bank account ID for payout
  description?: string;
}

export interface PayoutResponse {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  method: PayoutMethod;
  bankAccountId?: string; // Bank account ID
  bankAccountDetails?: string; // Formatted bank account info
  iyzicoPayoutId?: string;
  description?: string;
  failureReason?: string;
  adminNotes?: string;
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export enum PayoutStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELED = 'CANCELED',
}

export enum PayoutMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  IYZICO_PAYOUT = 'IYZICO_PAYOUT',
  WALLET_TRANSFER = 'WALLET_TRANSFER',
}

export interface PayoutLimitsResponse {
  minimumAmount: number;
  maximumAmount: number;
  dailyLimit: number;
  monthlyLimit: number;
  remainingDailyLimit: number;
  remainingMonthlyLimit: number;
  currency: string;
}

// ================================================
// USER OPERATIONS
// ================================================

/**
 * Request a new payout
 *
 * @endpoint POST /api/v1/payouts
 * @param request Payout request data
 * @returns Created payout
 */
export async function requestPayout(
  request: RequestPayoutRequest
): Promise<PayoutResponse> {
  return apiClient.post<PayoutResponse>('/v1/payouts', request);
}

/**
 * Get payout by ID
 *
 * @endpoint GET /api/v1/payouts/{id}
 * @param id Payout ID
 * @returns Payout details
 */
export async function getPayoutById(id: string): Promise<PayoutResponse> {
  return apiClient.get<PayoutResponse>(`/v1/payouts/${id}`);
}

/**
 * Get payout history with pagination
 *
 * @endpoint GET /api/v1/payouts/history
 * @param page Page number (0-indexed)
 * @param size Page size
 * @returns List of payouts
 */
export async function getPayoutHistory(
  page: number = 0,
  size: number = 20
): Promise<PayoutResponse[]> {
  return apiClient.get<PayoutResponse[]>('/v1/payouts/history', {
    page: page.toString(),
    size: size.toString(),
  });
}

/**
 * Get pending payouts for current user
 *
 * @endpoint GET /api/v1/payouts/pending
 * @returns List of pending payouts
 */
export async function getPendingPayouts(): Promise<PayoutResponse[]> {
  return apiClient.get<PayoutResponse[]>('/v1/payouts/pending');
}

/**
 * Cancel a pending payout
 *
 * @endpoint POST /api/v1/payouts/{id}/cancel
 * @param id Payout ID
 * @param cancelReason Reason for cancellation
 * @returns Updated payout
 */
export async function cancelPayout(
  id: string,
  cancelReason: string
): Promise<PayoutResponse> {
  return apiClient.post<PayoutResponse>(`/v1/payouts/${id}/cancel`, {
    cancelReason,
  });
}

/**
 * Get payout limits
 *
 * @endpoint GET /api/v1/payouts/limits
 * @returns Payout limits configuration
 */
export async function getPayoutLimits(): Promise<PayoutLimitsResponse> {
  return apiClient.get<PayoutLimitsResponse>('/v1/payouts/limits');
}

// ================================================
// ADMIN OPERATIONS
// ================================================

/**
 * Get all pending payouts (Admin only)
 *
 * @endpoint GET /api/v1/payouts/admin/pending
 * @param page Page number (0-indexed)
 * @param size Page size
 * @returns List of pending payouts
 */
export async function getAllPendingPayouts(
  page: number = 0,
  size: number = 50
): Promise<PayoutResponse[]> {
  return apiClient.get<PayoutResponse[]>('/v1/payouts/admin/pending', {
    page: page.toString(),
    size: size.toString(),
  });
}

/**
 * Approve a payout (Admin only)
 *
 * @endpoint POST /api/v1/payouts/{id}/approve
 * @param id Payout ID
 * @param notes Optional admin notes
 * @returns Updated payout
 */
export async function approvePayout(
  id: string,
  notes?: string
): Promise<PayoutResponse> {
  const url = notes
    ? `/v1/payouts/${id}/approve?notes=${encodeURIComponent(notes)}`
    : `/v1/payouts/${id}/approve`;
  return apiClient.post<PayoutResponse>(url, {});
}

/**
 * Reject a payout (Admin only)
 *
 * @endpoint POST /api/v1/payouts/{id}/reject
 * @param id Payout ID
 * @param reason Rejection reason
 * @returns Updated payout
 */
export async function rejectPayout(
  id: string,
  reason: string
): Promise<PayoutResponse> {
  return apiClient.post<PayoutResponse>(
    `/v1/payouts/${id}/reject?reason=${encodeURIComponent(reason)}`,
    {}
  );
}

// ================================================
// HELPERS
// ================================================

/**
 * Get status badge color
 */
export function getPayoutStatusColor(status: PayoutStatus): string {
  switch (status) {
    case PayoutStatus.COMPLETED:
      return 'success';
    case PayoutStatus.PENDING:
      return 'warning';
    case PayoutStatus.APPROVED:
    case PayoutStatus.PROCESSING:
      return 'info';
    case PayoutStatus.FAILED:
    case PayoutStatus.CANCELED:
      return 'error';
    default:
      return 'default';
  }
}

/**
 * Get status display name in Turkish
 */
export function getPayoutStatusLabel(status: PayoutStatus): string {
  switch (status) {
    case PayoutStatus.PENDING:
      return 'Beklemede';
    case PayoutStatus.APPROVED:
      return 'Onaylandı';
    case PayoutStatus.PROCESSING:
      return 'İşleniyor';
    case PayoutStatus.COMPLETED:
      return 'Tamamlandı';
    case PayoutStatus.FAILED:
      return 'Başarısız';
    case PayoutStatus.CANCELED:
      return 'İptal Edildi';
    default:
      return status;
  }
}

/**
 * Check if payout can be canceled by user
 */
export function canCancelPayout(payout: PayoutResponse): boolean {
  return payout.status === PayoutStatus.PENDING;
}

/**
 * Check if payout can be approved/rejected by admin
 */
export function canProcessPayout(payout: PayoutResponse): boolean {
  return payout.status === PayoutStatus.PENDING;
}
