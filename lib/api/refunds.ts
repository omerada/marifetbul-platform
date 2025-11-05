/**
 * ================================================
 * USER REFUND API CLIENT
 * ================================================
 * API client for user refund operations
 *
 * @author MarifetBul Development Team
 * @version 1.1.0
 * @updated November 5, 2025 - Refactored to use centralized types
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import {
  type RefundDto,
  RefundStatus,
  RefundReasonCategory,
  type CreateRefundRequest,
} from '@/types/business/features/refund';

// Re-export types for convenience
export type { RefundDto, CreateRefundRequest };
export { RefundStatus, RefundReasonCategory };

// ================================================
// API FUNCTIONS
// ================================================

/**
 * Create a refund request
 */
export async function createRefund(
  request: CreateRefundRequest
): Promise<RefundDto> {
  return apiClient.post<RefundDto>('/api/v1/refunds', request);
}

/**
 * Get refund by ID
 */
export async function getRefundById(refundId: string): Promise<RefundDto> {
  return apiClient.get<RefundDto>(`/api/v1/refunds/${refundId}`);
}

/**
 * Get refund for specific order
 */
export async function getRefundByOrderId(
  orderId: string
): Promise<RefundDto | null> {
  try {
    return await apiClient.get<RefundDto>(`/api/v1/refunds/orders/${orderId}`);
  } catch (error: unknown) {
    if (
      (error as { response?: { status?: number } })?.response?.status === 404
    ) {
      return null;
    }
    throw error;
  }
}

/**
 * Get current user's refund requests
 */
export async function getMyRefunds(): Promise<RefundDto[]> {
  return apiClient.get<RefundDto[]>('/api/v1/refunds/my-refunds');
}

/**
 * Cancel a pending refund request
 */
export async function cancelRefund(refundId: string): Promise<void> {
  return apiClient.delete<void>(`/api/v1/refunds/${refundId}`);
}

/**
 * Export functions
 */
export const refundApi = {
  createRefund,
  getRefundById,
  getRefundByOrderId,
  getMyRefunds,
  cancelRefund,
};

// Re-export helper functions from centralized types
export {
  getRefundReasonLabel,
  getRefundStatusLabel,
  canCancelRefund,
  getRefundStatusColor,
  isRefundFinal,
} from '@/types/business/features/refund';
