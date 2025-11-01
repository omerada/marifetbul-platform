/**
 * ================================================
 * PAYMENT API CLIENT
 * ================================================
 * Handles payment intents, confirmations, and refunds
 * Integrates with Iyzico payment processing
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import {
  validateResponse,
  PaymentSchema,
  PaymentIntentSchema,
  type Payment,
  type PaymentIntent,
} from './validators';

// ============================================================================
// Request Types
// ============================================================================

export interface CreatePaymentRequest {
  orderId: string;
  amount: number;
  currency?: string;
  paymentMethodId?: string;
}

export interface RefundRequest {
  amount?: number;
  reason?: string;
}

// ============================================================================
// Payment Intent Operations
// ============================================================================

/**
 * Create payment intent for order
 * POST /api/v1/payments/intent
 *
 * @param {CreatePaymentRequest} data - Payment request data
 * @returns {Promise<PaymentIntent>} Payment intent with client secret
 *
 * @throws {AuthenticationError} Not authenticated
 * @throws {ValidationError} Invalid payment data
 * @throws {ConflictError} Payment already exists for order
 */
export async function createPaymentIntent(
  data: CreatePaymentRequest
): Promise<PaymentIntent> {
  const response = await apiClient.post<PaymentIntent>(
    '/payments/intent',
    data
  );
  return validateResponse(PaymentIntentSchema, response, 'PaymentIntent');
}

/**
 * Confirm payment intent
 * POST /api/v1/payments/intent/{paymentIntentId}/confirm
 *
 * @param {string} paymentIntentId - Iyzico payment intent ID
 * @returns {Promise<PaymentIntent>} Confirmed payment intent
 *
 * @throws {AuthenticationError} Not authenticated
 * @throws {NotFoundError} Payment intent not found
 * @throws {ValidationError} Payment confirmation failed
 */
export async function confirmPaymentIntent(
  paymentIntentId: string
): Promise<PaymentIntent> {
  const response = await apiClient.post<PaymentIntent>(
    `/payments/intent/${paymentIntentId}/confirm`
  );
  return validateResponse(PaymentIntentSchema, response, 'PaymentIntent');
}

// ============================================================================
// Payment Operations
// ============================================================================

/**
 * Get payment by ID
 * GET /api/v1/payments/{id}
 *
 * @param {string} paymentId - Payment UUID
 * @returns {Promise<Payment>} Payment details
 *
 * @throws {AuthenticationError} Not authenticated
 * @throws {NotFoundError} Payment not found
 * @throws {ValidationError} Invalid response format
 */
export async function getPayment(paymentId: string): Promise<Payment> {
  const response = await apiClient.get<Payment>(`/payments/${paymentId}`);
  return validateResponse(PaymentSchema, response, 'Payment');
}

/**
 * Get payment history with pagination
 * GET /api/v1/payments/history
 *
 * @param {number} page - Page number (0-indexed)
 * @param {number} size - Page size
 * @returns {Promise<Payment[]>} List of payments
 *
 * @throws {AuthenticationError} Not authenticated
 * @throws {ValidationError} Invalid response format
 */
export async function getPaymentHistory(
  page: number = 0,
  size: number = 20
): Promise<Payment[]> {
  const response = await apiClient.get<Payment[]>(
    `/payments/history?page=${page}&size=${size}`
  );

  return response.map((payment) =>
    validateResponse(PaymentSchema, payment, 'Payment')
  );
}

/**
 * Get payments for specific order
 * GET /api/v1/payments/order/{orderId}
 *
 * @param {string} orderId - Order UUID
 * @returns {Promise<Payment[]>} List of payments for order
 *
 * @throws {AuthenticationError} Not authenticated
 * @throws {NotFoundError} Order not found
 * @throws {ValidationError} Invalid response format
 */
export async function getPaymentsByOrder(orderId: string): Promise<Payment[]> {
  const response = await apiClient.get<Payment[]>(`/payments/order/${orderId}`);

  return response.map((payment) =>
    validateResponse(PaymentSchema, payment, 'Payment')
  );
}

// ============================================================================
// Refund Operations
// ============================================================================

/**
 * Request full or partial refund
 * POST /api/v1/payments/{id}/refund
 *
 * @param {string} paymentId - Payment UUID
 * @param {RefundRequest} request - Refund details (optional amount and reason)
 * @returns {Promise<Payment>} Updated payment with refund info
 *
 * @throws {AuthenticationError} Not authenticated
 * @throws {AuthorizationError} Not authorized to refund
 * @throws {NotFoundError} Payment not found
 * @throws {ValidationError} Invalid refund amount or payment not refundable
 */
export async function requestRefund(
  paymentId: string,
  request: RefundRequest = {}
): Promise<Payment> {
  const response = await apiClient.post<Payment>(
    `/payments/${paymentId}/refund`,
    request
  );
  return validateResponse(PaymentSchema, response, 'Payment');
}

// ============================================================================
// Admin Operations
// ============================================================================

/**
 * Update payment status (Admin only)
 * PUT /api/v1/payments/{id}/status
 *
 * @param {string} paymentId - Payment UUID
 * @param {string} status - New payment status
 * @returns {Promise<Payment>} Updated payment
 *
 * @throws {AuthenticationError} Not authenticated
 * @throws {AuthorizationError} Not authorized (admin only)
 * @throws {NotFoundError} Payment not found
 * @throws {ValidationError} Invalid status
 */
export async function updatePaymentStatus(
  paymentId: string,
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED'
): Promise<Payment> {
  const response = await apiClient.put<Payment>(
    `/payments/${paymentId}/status?status=${status}`
  );
  return validateResponse(PaymentSchema, response, 'Payment');
}

/**
 * Check if payment service is enabled
 * GET /api/v1/payments/status
 *
 * @returns {Promise<boolean>} True if payment service is enabled
 */
export async function getPaymentServiceStatus(): Promise<boolean> {
  return await apiClient.get<boolean>('/payments/status');
}

/**
 * Release payment from escrow by approving order
 * PUT /api/v1/orders/{orderId}/approve
 *
 * @param {string} orderId - Order UUID
 * @returns {Promise<void>} Success
 *
 * @throws {AuthenticationError} Not authenticated
 * @throws {AuthorizationError} Not authorized (buyer only)
 * @throws {NotFoundError} Order not found
 * @throws {ValidationError} Order not in deliverable state
 */
export async function releaseEscrowPayment(orderId: string): Promise<void> {
  await apiClient.put(`/orders/${orderId}/approve`);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if payment can be refunded
 */
export function canRefundPayment(payment: Payment): boolean {
  return (
    payment.status === 'SUCCEEDED' &&
    (!payment.refundedAmount || payment.refundedAmount < payment.amount)
  );
}

/**
 * Calculate remaining refundable amount
 */
export function getRefundableAmount(payment: Payment): number {
  if (!canRefundPayment(payment)) return 0;
  return payment.amount - (payment.refundedAmount || 0);
}

/**
 * Get payment status color for UI
 */
export function getPaymentStatusColor(status: Payment['status']): string {
  const colors: Record<Payment['status'], string> = {
    PENDING: 'yellow',
    SUCCEEDED: 'green',
    FAILED: 'red',
    REFUNDED: 'gray',
    PARTIALLY_REFUNDED: 'orange',
  };
  return colors[status];
}

/**
 * Get payment status label in Turkish
 */
export function getPaymentStatusLabel(status: Payment['status']): string {
  const labels: Record<Payment['status'], string> = {
    PENDING: 'Bekliyor',
    SUCCEEDED: 'Başarılı',
    FAILED: 'Başarısız',
    REFUNDED: 'İade Edildi',
    PARTIALLY_REFUNDED: 'Kısmi İade',
  };
  return labels[status];
}

// ============================================================================
// Export API Object
// ============================================================================

export const paymentApi = {
  // Payment Intent
  createPaymentIntent,
  confirmPaymentIntent,

  // Payment Operations
  getPayment,
  getPaymentHistory,
  getPaymentsByOrder,

  // Refund
  requestRefund,

  // Escrow
  releaseEscrowPayment,

  // Admin
  updatePaymentStatus,
  getPaymentServiceStatus,

  // Utilities
  canRefundPayment,
  getRefundableAmount,
  getPaymentStatusColor,
  getPaymentStatusLabel,
};

export default paymentApi;
