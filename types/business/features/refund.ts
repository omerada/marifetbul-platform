/**
 * ================================================
 * REFUND TYPES
 * ================================================
 * Centralized refund-related type definitions
 * Eliminates duplication across user and admin APIs
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 5, 2025
 */

// ================================================
// ENUMS
// ================================================

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

export enum RefundMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  WALLET = 'WALLET',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

// ================================================
// MAIN TYPES
// ================================================

/**
 * Core refund data transfer object
 * Used for both user and admin operations
 */
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

  // Request info
  requestedBy: string;
  requestedAt: string;

  // Approval info
  approvedBy?: string;
  approvedAt?: string;

  // Rejection info
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;

  // Processing info
  processedAt?: string;
  completedAt?: string;
  failedAt?: string;
  failureReason?: string;

  // Admin info
  adminNotes?: string;

  // Payment gateway info
  gatewayRefundId?: string;
  refundMethod?: RefundMethod;

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Related entities (for admin views)
  order?: RefundOrderInfo;
  orderNumber?: string; // For user views
}

/**
 * Order information included in refund
 * Used in admin detail views
 */
export interface RefundOrderInfo {
  id: string;
  orderNumber: string;
  totalAmount: number;
  buyer?: RefundUserInfo;
  seller?: RefundUserInfo;
}

/**
 * User information included in refund
 */
export interface RefundUserInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

// ================================================
// REQUEST TYPES
// ================================================

/**
 * Request to create a new refund
 */
export interface CreateRefundRequest {
  orderId: string;
  amount: number;
  reasonCategory: RefundReasonCategory;
  description?: string;
  requestedBy?: string; // Set by backend from auth
}

/**
 * Request to approve a refund (Admin)
 */
export interface ApproveRefundRequest {
  adminNotes?: string;
}

/**
 * Request to reject a refund (Admin)
 */
export interface RejectRefundRequest {
  rejectionReason: string;
  adminNotes?: string;
}

/**
 * Request to bulk approve refunds (Admin)
 */
export interface BulkApproveRefundsRequest {
  refundIds: string[];
  adminNotes?: string;
}

// ================================================
// RESPONSE TYPES
// ================================================

/**
 * Refund statistics for admin dashboard
 */
export interface RefundStatisticsDto {
  totalRefunds: number;
  totalAmount: number;
  pendingCount: number;
  pendingAmount: number;
  approvedCount: number;
  approvedAmount: number;
  rejectedCount: number;
  completedCount: number;
  completedAmount: number;
  failedCount: number;
  averageProcessingTimeHours: number;
  approvalRate: number;
  successRate: number;
}

/**
 * Paginated response wrapper
 */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// ================================================
// FILTER TYPES
// ================================================

/**
 * Filters for refund queries (Admin)
 */
export interface RefundFilters {
  status?: RefundStatus;
  reasonCategory?: RefundReasonCategory;
  userId?: string;
  orderId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  searchQuery?: string;
  page?: number;
  size?: number;
  sort?: string;
}

// ================================================
// HELPER FUNCTIONS
// ================================================

/**
 * Get Turkish label for refund status
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
 * Get Turkish label for refund reason category
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
 * Get Turkish label for refund method
 */
export function getRefundMethodLabel(method: RefundMethod): string {
  const labels: Record<RefundMethod, string> = {
    [RefundMethod.CREDIT_CARD]: 'Kredi Kartı',
    [RefundMethod.WALLET]: 'Cüzdan',
    [RefundMethod.BANK_TRANSFER]: 'Banka Havalesi',
  };
  return labels[method] || method;
}

/**
 * Check if refund can be cancelled by user
 */
export function canCancelRefund(refund: RefundDto): boolean {
  return refund.status === RefundStatus.PENDING;
}

/**
 * Check if refund is in final state
 */
export function isRefundFinal(refund: RefundDto): boolean {
  return [
    RefundStatus.COMPLETED,
    RefundStatus.REJECTED,
    RefundStatus.FAILED,
    RefundStatus.CANCELLED,
  ].includes(refund.status);
}

/**
 * Check if refund can be approved (Admin)
 */
export function canApproveRefund(refund: RefundDto): boolean {
  return refund.status === RefundStatus.PENDING;
}

/**
 * Check if refund can be rejected (Admin)
 */
export function canRejectRefund(refund: RefundDto): boolean {
  return refund.status === RefundStatus.PENDING;
}

/**
 * Check if refund can be processed (Admin)
 */
export function canProcessRefund(refund: RefundDto): boolean {
  return refund.status === RefundStatus.APPROVED;
}

/**
 * Get status color for badges
 */
export function getRefundStatusColor(status: RefundStatus): string {
  const colors: Record<RefundStatus, string> = {
    [RefundStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    [RefundStatus.APPROVED]: 'bg-green-100 text-green-800 border-green-200',
    [RefundStatus.REJECTED]: 'bg-red-100 text-red-800 border-red-200',
    [RefundStatus.PROCESSING]: 'bg-blue-100 text-blue-800 border-blue-200',
    [RefundStatus.COMPLETED]: 'bg-green-100 text-green-800 border-green-200',
    [RefundStatus.FAILED]: 'bg-red-100 text-red-800 border-red-200',
    [RefundStatus.CANCELLED]: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
}
