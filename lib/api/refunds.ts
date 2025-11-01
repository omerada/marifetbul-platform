/**
 * ================================================
 * USER REFUND API CLIENT
 * ================================================
 * API client for user refund operations
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created October 31, 2025
 */

import { apiClient } from '@/lib/infrastructure/api/client';

// ================================================
// TYPES (Re-use from admin API)
// ================================================

export interface RefundDto {
  id: string;
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  reason: string;
  reasonCategory: RefundReasonCategory;
  description?: string;
  status: RefundStatus;
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  processedAt?: string;
  completedAt?: string;
  adminNotes?: string;
  orderNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export enum RefundStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum RefundReasonCategory {
  BUYER_REQUEST = 'BUYER_REQUEST',
  SELLER_CANCELLATION = 'SELLER_CANCELLATION',
  ORDER_NOT_DELIVERED = 'ORDER_NOT_DELIVERED',
  PRODUCT_NOT_AS_DESCRIBED = 'PRODUCT_NOT_AS_DESCRIBED',
  QUALITY_ISSUE = 'QUALITY_ISSUE',
  DUPLICATE_PAYMENT = 'DUPLICATE_PAYMENT',
  FRAUD_SUSPECTED = 'FRAUD_SUSPECTED',
  DISPUTE_RESOLUTION = 'DISPUTE_RESOLUTION',
  OTHER = 'OTHER',
}

export interface CreateRefundRequest {
  orderId: string;
  amount: number;
  reasonCategory: RefundReasonCategory;
  description?: string;
}

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

/**
 * Helper function to get refund reason label
 */
export function getRefundReasonLabel(
  reasonCategory: RefundReasonCategory
): string {
  const labels: Record<RefundReasonCategory, string> = {
    [RefundReasonCategory.BUYER_REQUEST]: 'Alıcı Talebi',
    [RefundReasonCategory.SELLER_CANCELLATION]: 'Satıcı İptali',
    [RefundReasonCategory.ORDER_NOT_DELIVERED]: 'Sipariş Teslim Edilmedi',
    [RefundReasonCategory.PRODUCT_NOT_AS_DESCRIBED]:
      'Ürün Açıklamaya Uygun Değil',
    [RefundReasonCategory.QUALITY_ISSUE]: 'Kalite Sorunu',
    [RefundReasonCategory.DUPLICATE_PAYMENT]: 'Çift Ödeme',
    [RefundReasonCategory.FRAUD_SUSPECTED]: 'Dolandırıcılık Şüphesi',
    [RefundReasonCategory.DISPUTE_RESOLUTION]: 'Anlaşmazlık Çözümü',
    [RefundReasonCategory.OTHER]: 'Diğer',
  };
  return labels[reasonCategory] || reasonCategory;
}

/**
 * Helper function to get refund status label
 */
export function getRefundStatusLabel(status: RefundStatus): string {
  const labels: Record<RefundStatus, string> = {
    [RefundStatus.PENDING]: 'Beklemede',
    [RefundStatus.APPROVED]: 'Onaylandı',
    [RefundStatus.REJECTED]: 'Reddedildi',
    [RefundStatus.PROCESSING]: 'İşleniyor',
    [RefundStatus.COMPLETED]: 'Tamamlandı',
    [RefundStatus.FAILED]: 'Başarısız',
    [RefundStatus.CANCELLED]: 'İptal Edildi',
  };
  return labels[status] || status;
}

/**
 * Helper function to check if refund can be cancelled
 */
export function canCancelRefund(refund: RefundDto): boolean {
  return refund.status === RefundStatus.PENDING;
}
