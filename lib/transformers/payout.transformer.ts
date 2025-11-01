/**
 * ================================================
 * PAYOUT TRANSFORMER
 * ================================================
 * Transforms backend payout responses to frontend types
 * Handles method type alignment (BANK_TRANSFER, IYZICO, etc.)
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import type { Payout } from '@/types/business/features/wallet';
import { PayoutMethod } from '@/types/business/features/wallet';

/**
 * Backend payout type (from API)
 */
type BackendPayout = Record<string, unknown>;

/**
 * Transform backend payout method to frontend PayoutMethod
 */
function transformPayoutMethod(method: unknown): PayoutMethod {
  if (typeof method === 'string') {
    const methodUpper = method.toUpperCase();
    if (methodUpper === 'BANK_TRANSFER') return PayoutMethod.BANK_TRANSFER;
    if (methodUpper === 'IYZICO' || methodUpper === 'IYZICO_PAYOUT') {
      return PayoutMethod.IYZICO_PAYOUT;
    }
    if (methodUpper === 'WALLET_TRANSFER') return PayoutMethod.WALLET_TRANSFER;
  }
  // Default fallback
  return PayoutMethod.BANK_TRANSFER;
}

/**
 * Transform backend payout response to frontend Payout type
 */
export function transformPayoutResponse(backendPayout: BackendPayout): Payout {
  return {
    id: String(backendPayout.id || ''),
    userId: String(backendPayout.userId || ''),
    amount: Number(backendPayout.amount || 0),
    currency: String(backendPayout.currency || 'TRY'),
    method: transformPayoutMethod(backendPayout.method),
    status: (backendPayout.status as Payout['status']) || 'PENDING',
    bankAccountInfo: backendPayout.bankAccountInfo
      ? (backendPayout.bankAccountInfo as Payout['bankAccountInfo'])
      : undefined,
    iyzicoPayoutId: backendPayout.iyzicoPayoutId
      ? String(backendPayout.iyzicoPayoutId)
      : undefined,
    description: String(backendPayout.description || ''),
    failureReason: backendPayout.failureReason
      ? String(backendPayout.failureReason)
      : undefined,
    requestedAt: String(backendPayout.requestedAt || new Date().toISOString()),
    processedAt: backendPayout.processedAt
      ? String(backendPayout.processedAt)
      : undefined,
    completedAt: backendPayout.completedAt
      ? String(backendPayout.completedAt)
      : undefined,
    cancelledAt: backendPayout.cancelledAt
      ? String(backendPayout.cancelledAt)
      : undefined,
    estimatedArrival: backendPayout.estimatedArrival
      ? String(backendPayout.estimatedArrival)
      : undefined,
    metadata: backendPayout.metadata
      ? (backendPayout.metadata as Record<string, unknown>)
      : undefined,
  };
}

/**
 * Transform array of backend payout responses
 */
export function transformPayoutResponses(
  backendPayouts: BackendPayout[]
): Payout[] {
  return backendPayouts.map(transformPayoutResponse);
}
