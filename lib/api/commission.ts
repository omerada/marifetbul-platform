/**
 * ================================================
 * COMMISSION API CLIENT
 * ================================================
 * API client for commission-related operations
 * Backend: CommissionController.java
 *
 * Sprint Day 1 - Task 5: Commission API Integration
 * @version 1.0.0
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import logger from '@/lib/infrastructure/monitoring/logger';
import type { ApiResponse } from '@/types/shared/api';
import { z } from 'zod';

// Use canonical PageResponse from backend-aligned (Spring Boot format)
import type { PageResponse as PaginatedResponse } from '@/types/backend-aligned';

// ============================================================================
// TYPES & VALIDATION
// ============================================================================

/**
 * Commission Transaction DTO
 */
export const CommissionTransactionSchema = z.object({
  id: z.string().uuid(),
  paymentId: z.string().uuid(),
  orderId: z.string().uuid(),
  sellerId: z.string().uuid(),
  orderAmount: z.number(),
  commissionRate: z.number(),
  commissionAmount: z.number(),
  sellerAmount: z.number(),
  platformTransactionId: z.string().uuid().optional(),
  sellerTransactionId: z.string().uuid().optional(),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REVERSED']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CommissionTransaction = z.infer<typeof CommissionTransactionSchema>;

/**
 * Commission Statistics DTO
 */
export const CommissionStatsSchema = z.object({
  totalCommissions: z.number(),
  totalOrders: z.number(),
  averageCommissionRate: z.number(),
  totalOrderAmount: z.number(),
  totalSellerAmount: z.number(),
  periodStart: z.string(),
  periodEnd: z.string(),
});

export type CommissionStats = z.infer<typeof CommissionStatsSchema>;

/**
 * Commission Analytics DTO
 */
export const CommissionAnalyticsSchema = z.object({
  daily: z.array(
    z.object({
      date: z.string(),
      commissionAmount: z.number(),
      orderCount: z.number(),
    })
  ),
  monthly: z.array(
    z.object({
      month: z.string(),
      commissionAmount: z.number(),
      orderCount: z.number(),
    })
  ),
  topSellers: z.array(
    z.object({
      sellerId: z.string().uuid(),
      sellerName: z.string(),
      totalCommissions: z.number(),
      orderCount: z.number(),
    })
  ),
});

export type CommissionAnalytics = z.infer<typeof CommissionAnalyticsSchema>;

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get all commission transactions (Admin only)
 * @param page - Page number (0-indexed)
 * @param size - Page size
 * @param sellerId - Optional seller filter
 */
export async function getCommissions(
  page = 0,
  size = 20,
  sellerId?: string
): Promise<PaginatedResponse<CommissionTransaction>> {
  try {
    logger.debug('Fetching commissions', { page, size, sellerId });

    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (sellerId) {
      params.append('sellerId', sellerId);
    }

    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<CommissionTransaction>>
    >(`/admin/commissions?${params}`);

    logger.info('Commissions fetched successfully', {
      totalElements: response.data.totalElements,
    });

    return response.data;
  } catch (error) {
    logger.error(
      'Failed to fetch commissions',
      error
    );
    throw error;
  }
}

/**
 * Get commission by ID
 * @param commissionId - Commission transaction ID
 */
export async function getCommissionById(
  commissionId: string
): Promise<CommissionTransaction> {
  try {
    logger.debug('Fetching commission by ID', { commissionId });

    const response = await apiClient.get<ApiResponse<CommissionTransaction>>(
      `/admin/commissions/${commissionId}`
    );

    logger.info('Commission fetched successfully', { commissionId });
    return response.data;
  } catch (error) {
    logger.error(
      'Failed to fetch commission',
      error
    );
    throw error;
  }
}

/**
 * Get commission by payment ID
 * @param paymentId - Payment ID
 */
export async function getCommissionByPaymentId(
  paymentId: string
): Promise<CommissionTransaction> {
  try {
    logger.debug('Fetching commission by payment ID', { paymentId });

    const response = await apiClient.get<ApiResponse<CommissionTransaction>>(
      `/admin/commissions/payment/${paymentId}`
    );

    logger.info('Commission fetched by payment ID', { paymentId });
    return response.data;
  } catch (error) {
    logger.error(
      'Failed to fetch commission by payment ID',
      error
    );
    throw error;
  }
}

/**
 * Get commissions by seller ID
 * @param sellerId - Seller user ID
 * @param page - Page number
 * @param size - Page size
 */
export async function getCommissionsBySeller(
  sellerId: string,
  page = 0,
  size = 20
): Promise<PaginatedResponse<CommissionTransaction>> {
  try {
    logger.debug('Fetching commissions by seller', { sellerId, page, size });

    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<CommissionTransaction>>
    >(`/admin/commissions/seller/${sellerId}?${params}`);

    logger.info('Seller commissions fetched', {
      sellerId,
      totalElements: response.data.totalElements,
    });

    return response.data;
  } catch (error) {
    logger.error(
      'Failed to fetch seller commissions',
      error
    );
    throw error;
  }
}

/**
 * Get commission statistics
 * @param startDate - Period start date (ISO string)
 * @param endDate - Period end date (ISO string)
 */
export async function getCommissionStats(
  startDate: string,
  endDate: string
): Promise<CommissionStats> {
  try {
    logger.debug('Fetching commission stats', { startDate, endDate });

    const params = new URLSearchParams({
      startDate,
      endDate,
    });

    const response = await apiClient.get<ApiResponse<CommissionStats>>(
      `/admin/commissions/stats?${params}`
    );

    logger.info('Commission stats fetched', { startDate, endDate });
    return response.data;
  } catch (error) {
    logger.error(
      'Failed to fetch commission stats',
      error
    );
    throw error;
  }
}

/**
 * Get commission analytics
 * @param startDate - Period start date (ISO string)
 * @param endDate - Period end date (ISO string)
 */
export async function getCommissionAnalytics(
  startDate: string,
  endDate: string
): Promise<CommissionAnalytics> {
  try {
    logger.debug('Fetching commission analytics', { startDate, endDate });

    const params = new URLSearchParams({
      startDate,
      endDate,
    });

    const response = await apiClient.get<ApiResponse<CommissionAnalytics>>(
      `/admin/commissions/analytics?${params}`
    );

    logger.info('Commission analytics fetched', { startDate, endDate });
    return response.data;
  } catch (error) {
    logger.error(
      'Failed to fetch commission analytics',
      error
    );
    throw error;
  }
}

/**
 * Get user's commission summary (for freelancers)
 * Calculates from transactions
 */
export async function getMyCommissionSummary(): Promise<{
  totalEarnings: number;
  totalCommissions: number;
  netEarnings: number;
  averageCommissionRate: number;
  transactionCount: number;
}> {
  try {
    logger.debug('Fetching user commission summary');

    // Note: This endpoint might not exist on backend
    // We calculate from transactions instead
    const response = await apiClient.get<
      ApiResponse<{
        totalEarnings: number;
        totalCommissions: number;
        netEarnings: number;
        averageCommissionRate: number;
        transactionCount: number;
      }>
    >('/wallet/commission-summary');

    logger.info('Commission summary fetched');
    return response.data;
  } catch (error) {
    logger.warn('Commission summary endpoint not available', { error });
    throw error;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate commission from amount
 * @param amount - Order amount
 * @param rate - Commission rate (default 5%)
 */
export function calculateCommission(
  amount: number,
  rate = 0.05
): {
  orderAmount: number;
  commissionAmount: number;
  sellerAmount: number;
  commissionRate: number;
} {
  const commissionAmount = amount * rate;
  const sellerAmount = amount - commissionAmount;

  return {
    orderAmount: amount,
    commissionAmount,
    sellerAmount,
    commissionRate: rate * 100,
  };
}

/**
 * Format commission transaction for display
 */
export function formatCommissionTransaction(
  transaction: CommissionTransaction
): string {
  const { orderAmount, commissionAmount, sellerAmount } = transaction;
  return `Sipariş: ${orderAmount} TL | Komisyon: ${commissionAmount} TL | Net: ${sellerAmount} TL`;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const commissionApi = {
  getCommissions,
  getCommissionById,
  getCommissionByPaymentId,
  getCommissionsBySeller,
  getCommissionStats,
  getCommissionAnalytics,
  getMyCommissionSummary,
  calculateCommission,
  formatCommissionTransaction,
};

export default commissionApi;
