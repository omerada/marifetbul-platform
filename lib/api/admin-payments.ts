/**
 * ================================================
 * ADMIN PAYMENTS API CLIENT
 * ================================================
 * Type-safe API client for admin payment management
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 2 Story 2.3
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import type { ApiResponse } from '@/types/backend-aligned';

/**
 * Manual Payment Proof Response DTO
 */
export interface ManualPaymentProofResponse {
  id: string;
  orderId: string;
  orderNumber: string;
  payerId: string;
  payerName: string;
  proofFileUrl: string;
  paymentReference?: string;
  amount: number;
  paymentDate: string;
  buyerNotes?: string;
  buyerConfirmationStatus: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'DISPUTED';
  sellerConfirmationStatus: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'DISPUTED';
  buyerConfirmedAt?: string;
  sellerConfirmedAt?: string;
  sellerNotes?: string;
  platformVerificationStatus:
    | 'PENDING'
    | 'AUTO_VERIFIED'
    | 'MANUALLY_VERIFIED'
    | 'REJECTED'
    | 'UNDER_REVIEW';
  verifiedByAdminId?: string;
  verifiedAt?: string;
  adminNotes?: string;
  fraudSuspected: boolean;
  fraudReasons?: string;
  disputed: boolean;
  disputeReason?: string;
  disputedBy?: string;
  disputedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Payment Proof Filters
 */
export interface PaymentProofFilters {
  status?:
    | 'PENDING'
    | 'AUTO_VERIFIED'
    | 'MANUALLY_VERIFIED'
    | 'REJECTED'
    | 'UNDER_REVIEW';
  disputed?: boolean;
  fraudSuspected?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Admin Payments API Service
 */
export const adminPaymentsApi = {
  /**
   * Get all pending manual payment proofs (admin view)
   * GET /api/orders/payment-proofs/pending
   */
  async getPendingPaymentProofs(): Promise<
    ApiResponse<ManualPaymentProofResponse[]>
  > {
    return apiClient.get<ApiResponse<ManualPaymentProofResponse[]>>(
      '/api/orders/payment-proofs/pending'
    );
  },

  /**
   * Get payment proof by order ID
   * GET /api/orders/{orderId}/payment-proof
   */
  async getPaymentProofByOrder(
    orderId: string
  ): Promise<ApiResponse<ManualPaymentProofResponse>> {
    return apiClient.get<ApiResponse<ManualPaymentProofResponse>>(
      `/api/orders/${orderId}/payment-proof`
    );
  },

  /**
   * Manually verify payment proof (admin only)
   * PUT /api/orders/payment-proofs/{proofId}/verify
   */
  async verifyPaymentProof(
    proofId: string,
    approved: boolean,
    notes?: string
  ): Promise<ApiResponse<ManualPaymentProofResponse>> {
    const params: Record<string, string> = {
      approved: String(approved),
    };
    if (notes) {
      params.notes = notes;
    }

    return apiClient.put<ApiResponse<ManualPaymentProofResponse>>(
      `/api/orders/payment-proofs/${proofId}/verify?${new URLSearchParams(params).toString()}`
    );
  },

  /**
   * Mark proof as fraud (admin only)
   * PUT /api/orders/payment-proofs/{proofId}/mark-fraud
   */
  async markAsFraud(
    proofId: string,
    reasons: string
  ): Promise<ApiResponse<ManualPaymentProofResponse>> {
    return apiClient.put<ApiResponse<ManualPaymentProofResponse>>(
      `/api/orders/payment-proofs/${proofId}/mark-fraud`,
      { reasons }
    );
  },

  /**
   * Get disputed payment proofs (admin only)
   * GET /api/orders/payment-proofs/disputed
   */
  async getDisputedPaymentProofs(): Promise<
    ApiResponse<ManualPaymentProofResponse[]>
  > {
    return apiClient.get<ApiResponse<ManualPaymentProofResponse[]>>(
      '/api/orders/payment-proofs/disputed'
    );
  },

  /**
   * Get fraud suspected payment proofs (admin only)
   * GET /api/orders/payment-proofs/fraud-suspected
   */
  async getFraudSuspectedPaymentProofs(): Promise<
    ApiResponse<ManualPaymentProofResponse[]>
  > {
    return apiClient.get<ApiResponse<ManualPaymentProofResponse[]>>(
      '/api/orders/payment-proofs/fraud-suspected'
    );
  },
};

export default adminPaymentsApi;
