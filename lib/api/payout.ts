/**
 * ================================================
 * PAYOUT API CLIENT
 * ================================================
 * Handles payout requests, history, and admin approval flow
 * Manages freelancer earnings withdrawal
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import {
  validateResponse,
  PayoutSchema,
  PayoutEligibilitySchema,
  type Payout,
  type PayoutEligibility,
} from './validators';

// ============================================================================
// Request Types
// ============================================================================

export interface CreatePayoutRequest {
  amount: number;
  paymentMethodId?: string; // Optional payment method ID for bank transfer
  method?: 'BANK_TRANSFER' | 'IYZICO'; // Payout method (backend-aligned)
  bankAccountId?: string; // Alternative to paymentMethodId
  description?: string; // Added description field
}

export interface RejectPayoutRequest {
  reason: string;
}

// ============================================================================
// Payout Operations
// ============================================================================

/**
 * Create payout request
 * POST /api/v1/payouts
 *
 * @param {CreatePayoutRequest} data - Payout request data
 * @returns {Promise<Payout>} Created payout
 *
 * @throws {AuthenticationError} Not authenticated
 * @throws {ValidationError} Invalid payout data or insufficient balance
 * @throws {ConflictError} Pending payout already exists
 */
export async function createPayout(data: CreatePayoutRequest): Promise<Payout> {
  const response = await apiClient.post<Payout>('/payouts', data);
  return validateResponse(PayoutSchema, response, 'Payout');
}

/**
 * Get payout by ID
 * GET /api/v1/payouts/{id}
 *
 * @param {string} payoutId - Payout UUID
 * @returns {Promise<Payout>} Payout details
 *
 * @throws {AuthenticationError} Not authenticated
 * @throws {NotFoundError} Payout not found
 * @throws {ValidationError} Invalid response format
 */
export async function getPayout(payoutId: string): Promise<Payout> {
  const response = await apiClient.get<Payout>(`/payouts/${payoutId}`);
  return validateResponse(PayoutSchema, response, 'Payout');
}

/**
 * Get payout history with pagination
 * GET /api/v1/payouts/history
 *
 * @param {number} page - Page number (0-indexed)
 * @param {number} size - Page size
 * @returns {Promise<Payout[]>} List of payouts
 *
 * @throws {AuthenticationError} Not authenticated
 * @throws {ValidationError} Invalid response format
 */
export async function getPayoutHistory(
  page: number = 0,
  size: number = 20
): Promise<Payout[]> {
  const response = await apiClient.get<Payout[]>(
    `/payouts/history?page=${page}&size=${size}`
  );

  return response.map((payout) =>
    validateResponse(PayoutSchema, payout, 'Payout')
  );
}

/**
 * Get pending payouts for current user
 * GET /api/v1/payouts/pending
 *
 * @returns {Promise<Payout[]>} List of pending payouts
 *
 * @throws {AuthenticationError} Not authenticated
 * @throws {ValidationError} Invalid response format
 */
export async function getPendingPayouts(): Promise<Payout[]> {
  const response = await apiClient.get<Payout[]>('/payouts/pending');

  return response.map((payout) =>
    validateResponse(PayoutSchema, payout, 'Payout')
  );
}

/**
 * Cancel pending payout
 * POST /api/v1/payouts/{id}/cancel
 *
 * @param {string} payoutId - Payout UUID
 * @param {string} reason - Optional cancellation reason
 * @returns {Promise<Payout>} Cancelled payout
 *
 * @throws {AuthenticationError} Not authenticated
 * @throws {AuthorizationError} Not authorized to cancel
 * @throws {NotFoundError} Payout not found
 * @throws {ValidationError} Payout cannot be cancelled (already processed)
 */
export async function cancelPayout(
  payoutId: string,
  reason?: string
): Promise<Payout> {
  const params = reason ? `?reason=${encodeURIComponent(reason)}` : '';
  const response = await apiClient.post<Payout>(
    `/payouts/${payoutId}/cancel${params}`,
    {}
  );
  return validateResponse(PayoutSchema, response, 'Payout');
}

// ============================================================================
// Payout Eligibility
// ============================================================================

/**
 * Check payout eligibility
 * GET /api/v1/payouts/eligibility
 *
 * @returns {Promise<PayoutEligibility>} Eligibility status and limits
 *
 * @throws {AuthenticationError} Not authenticated
 * @throws {ValidationError} Invalid response format
 */
export async function checkPayoutEligibility(): Promise<PayoutEligibility> {
  const response = await apiClient.get<PayoutEligibility>(
    '/payouts/eligibility'
  );
  return validateResponse(
    PayoutEligibilitySchema,
    response,
    'PayoutEligibility'
  );
}

/**
 * Get payout limits
 * GET /api/v1/payouts/limits
 *
 * @returns {Promise<{minimum: number, maximum: number}>} Payout limits
 *
 * @throws {AuthenticationError} Not authenticated
 */
export async function getPayoutLimits(): Promise<{
  minimum: number;
  maximum: number;
}> {
  return await apiClient.get<{ minimum: number; maximum: number }>(
    '/payouts/limits'
  );
}

// ============================================================================
// Admin Operations
// ============================================================================

/**
 * Get all pending payouts for admin review
 * GET /api/v1/payouts/admin/pending
 *
 * @param {number} page - Page number (0-indexed)
 * @param {number} size - Page size
 * @returns {Promise<Payout[]>} List of pending payouts
 *
 * @throws {AuthenticationError} Not authenticated
 * @throws {AuthorizationError} Not authorized (admin only)
 * @throws {ValidationError} Invalid response format
 */
export async function getPendingPayoutsAdmin(
  page: number = 0,
  size: number = 50
): Promise<Payout[]> {
  const response = await apiClient.get<Payout[]>(
    `/payouts/admin/pending?page=${page}&size=${size}`
  );

  return response.map((payout) =>
    validateResponse(PayoutSchema, payout, 'Payout')
  );
}

/**
 * Approve payout (Admin only)
 * POST /api/v1/payouts/{id}/approve
 *
 * @param {string} payoutId - Payout UUID
 * @param {string} notes - Optional admin notes
 * @returns {Promise<Payout>} Approved payout
 *
 * @throws {AuthenticationError} Not authenticated
 * @throws {AuthorizationError} Not authorized (admin only)
 * @throws {NotFoundError} Payout not found
 * @throws {ValidationError} Payout cannot be approved
 */
export async function approvePayout(
  payoutId: string,
  notes?: string
): Promise<Payout> {
  const params = notes ? `?notes=${encodeURIComponent(notes)}` : '';
  const response = await apiClient.post<Payout>(
    `/payouts/${payoutId}/approve${params}`,
    {}
  );
  return validateResponse(PayoutSchema, response, 'Payout');
}

/**
 * Reject payout (Admin only)
 * POST /api/v1/admin/payouts/{id}/reject
 *
 * @param {string} payoutId - Payout UUID
 * @param {RejectPayoutRequest} request - Rejection reason
 * @returns {Promise<Payout>} Rejected payout
 *
 * @throws {AuthenticationError} Not authenticated
 * @throws {AuthorizationError} Not authorized (admin only)
 * @throws {NotFoundError} Payout not found
 * @throws {ValidationError} Invalid rejection reason
 */
export async function rejectPayout(
  payoutId: string,
  request: RejectPayoutRequest
): Promise<Payout> {
  const response = await apiClient.post<Payout>(
    `/admin/payouts/${payoutId}/reject`,
    request
  );
  return validateResponse(PayoutSchema, response, 'Payout');
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if payout can be cancelled
 */
export function canCancelPayout(payout: Payout): boolean {
  return payout.status === 'PENDING' || payout.status === 'APPROVED';
}

/**
 * Check if payout can be approved (admin)
 */
export function canApprovePayout(payout: Payout): boolean {
  return payout.status === 'PENDING';
}

/**
 * Get payout status color for UI
 */
export function getPayoutStatusColor(status: Payout['status']): string {
  const colors: Record<Payout['status'], string> = {
    PENDING: 'yellow',
    APPROVED: 'blue',
    PROCESSING: 'blue',
    COMPLETED: 'green',
    FAILED: 'red',
    CANCELLED: 'gray',
  };
  return colors[status] || 'gray';
}

/**
 * Get payout status label in Turkish
 */
export function getPayoutStatusLabel(status: Payout['status']): string {
  const labels: Record<Payout['status'], string> = {
    PENDING: 'Bekliyor',
    APPROVED: 'Onaylandı',
    PROCESSING: 'İşleniyor',
    COMPLETED: 'Tamamlandı',
    FAILED: 'Başarısız',
    CANCELLED: 'İptal Edildi',
  };
  return labels[status] || status;
}

/**
 * Get payout method label in Turkish
 */
export function getPayoutMethodLabel(method: Payout['method']): string {
  const labels: Record<Payout['method'], string> = {
    BANK_TRANSFER: 'Banka Transferi',
    IYZICO: 'Iyzico',
  };
  return labels[method];
}

/**
 * Format payout date
 */
export function formatPayoutDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

// ============================================================================
// Export API Object
// ============================================================================

export const payoutApi = {
  // User Operations
  createPayout,
  getPayout,
  getPayoutHistory,
  getPendingPayouts,
  cancelPayout,

  // Eligibility
  checkPayoutEligibility,
  getPayoutLimits,

  // Admin Operations
  getPendingPayoutsAdmin,
  approvePayout,
  rejectPayout,

  // Utilities
  canCancelPayout,
  canApprovePayout,
  getPayoutStatusColor,
  getPayoutStatusLabel,
  getPayoutMethodLabel,
  formatPayoutDate,
};

export default payoutApi;
