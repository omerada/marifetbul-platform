/**
 * ================================================
 * USER API CLIENT
 * ================================================
 * API client for user-related operations
 * 
 * @version 1.0.0
 * @author MarifetBul Development Team
 */

import { apiClient } from '@/lib/infrastructure/api/client';

/**
 * Payment status response from backend
 */
export interface PaymentStatusResponse {
  /** Whether seller has valid IBAN configured */
  hasValidIban: boolean;
  /** Masked IBAN for display (if configured) */
  maskedIban: string | null;
  /** Seller's full name */
  sellerName: string;
  /** Whether seller can accept manual IBAN payments */
  canAcceptManualPayments: boolean;
  /** Status message */
  statusMessage: string;
}

/**
 * Get seller's payment configuration status
 * 
 * @param sellerId Seller user ID
 * @returns Payment status including IBAN configuration
 */
export async function getSellerPaymentStatus(
  sellerId: string
): Promise<PaymentStatusResponse> {
  const response = await apiClient.get<{ data: PaymentStatusResponse }>(
    `/api/v1/users/${sellerId}/payment-status`
  );
  
  return response.data;
}

/**
 * Check if seller can accept manual IBAN payments
 * 
 * @param sellerId Seller user ID
 * @returns True if seller has valid IBAN configured
 */
export async function canSellerAcceptManualPayments(
  sellerId: string
): Promise<boolean> {
  try {
    const status = await getSellerPaymentStatus(sellerId);
    return status.canAcceptManualPayments;
  } catch (error) {
    console.error('Error checking seller payment status:', error);
    return false;
  }
}
