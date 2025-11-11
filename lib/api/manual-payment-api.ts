/**
 * ================================================
 * MANUAL PAYMENT API CLIENT
 * ================================================
 * API client for manual payment proof upload and management
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 11, 2025
 */

import { apiClient } from '@/lib/infrastructure/api/client';

// ================================================
// TYPES
// ================================================

export interface UploadPaymentProofRequest {
  file: File;
  orderId: string;
  amount: number;
  currency: 'TRY';
  transactionReference?: string;
  notes?: string;
}

export interface PaymentProofResponse {
  id: number;
  orderId: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  status: 'PENDING' | 'CONFIRMED' | 'DISPUTED' | 'REJECTED';
  amount: number;
  currency: 'TRY';
  transactionReference?: string;
  notes?: string;
}

export interface BankAccountInfo {
  iban: string;
  accountHolder: string;
  bankName: string;
  branchCode?: string;
  accountNumber?: string;
}

// ================================================
// API FUNCTIONS
// ================================================

/**
 * Upload payment proof (dekont/receipt) for manual IBAN transfer
 */
export async function uploadPaymentProof(
  request: UploadPaymentProofRequest
): Promise<PaymentProofResponse> {
  const formData = new FormData();
  formData.append('file', request.file);
  formData.append('amount', request.amount.toString());
  formData.append('currency', request.currency);
  
  if (request.transactionReference) {
    formData.append('transactionReference', request.transactionReference);
  }
  
  if (request.notes) {
    formData.append('notes', request.notes);
  }

  return apiClient.post(
    `/api/orders/${request.orderId}/payment-proof`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
}

/**
 * Get payment proof details
 */
export async function getPaymentProof(
  orderId: string
): Promise<PaymentProofResponse> {
  return apiClient.get(`/api/orders/${orderId}/payment-proof`);
}

/**
 * Get pending payment proofs (for seller)
 */
export async function getPendingPaymentProofs(): Promise<PaymentProofResponse[]> {
  return apiClient.get('/api/orders/payment-proofs/pending');
}

/**
 * Confirm payment proof (seller confirms receipt)
 */
export async function confirmPaymentProof(
  orderId: string,
  confirmed: boolean,
  notes?: string
): Promise<PaymentProofResponse> {
  return apiClient.put(`/api/orders/${orderId}/payment-proof/confirm`, {
    confirmed,
    notes,
  });
}

/**
 * Dispute payment proof
 */
export async function disputePaymentProof(
  orderId: string,
  reason: string,
  details?: string
): Promise<PaymentProofResponse> {
  return apiClient.post(`/api/orders/${orderId}/payment-proof/dispute`, {
    reason,
    details,
  });
}

// ================================================
// DEFAULT EXPORT
// ================================================

export default {
  uploadPaymentProof,
  getPaymentProof,
  getPendingPaymentProofs,
  confirmPaymentProof,
  disputePaymentProof,
};
