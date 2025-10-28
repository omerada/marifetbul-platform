/**
 * Dispute API Client
 * Sprint 1: Order Dispute System
 */

import { apiClient } from '../infrastructure/api/client';
import type {
  DisputeRequest,
  DisputeResponse,
  DisputeResolutionRequest,
  DisputeStatistics,
  DisputeStatus,
} from '@/types/dispute';

const DISPUTES_BASE_URL = '/api/v1/disputes';

/**
 * Raise a new dispute for an order
 */
export async function raiseDispute(
  request: DisputeRequest
): Promise<DisputeResponse> {
  return apiClient.post<DisputeResponse>(DISPUTES_BASE_URL, request);
}

/**
 * Get dispute by ID
 */
export async function getDispute(disputeId: string): Promise<DisputeResponse> {
  return apiClient.get<DisputeResponse>(`${DISPUTES_BASE_URL}/${disputeId}`);
}

/**
 * Get dispute by order ID
 */
export async function getDisputeByOrderId(
  orderId: string
): Promise<DisputeResponse> {
  return apiClient.get<DisputeResponse>(
    `${DISPUTES_BASE_URL}/order/${orderId}`
  );
}

/**
 * Get current user's disputes
 */
export async function getMyDisputes(params?: {
  page?: number;
  size?: number;
}): Promise<DisputeResponse[]> {
  const searchParams: Record<string, string> = {};
  if (params?.page !== undefined) searchParams.page = String(params.page);
  if (params?.size !== undefined) searchParams.size = String(params.size);

  return apiClient.get<DisputeResponse[]>(
    `${DISPUTES_BASE_URL}/my-disputes`,
    searchParams
  );
}

// ==================== ADMIN ENDPOINTS ====================

/**
 * Resolve a dispute (admin only)
 */
export async function resolveDispute(
  disputeId: string,
  request: DisputeResolutionRequest
): Promise<DisputeResponse> {
  return apiClient.put<DisputeResponse>(
    `${DISPUTES_BASE_URL}/${disputeId}/resolve`,
    request
  );
}

/**
 * Get disputes by status (admin only)
 */
export async function getDisputesByStatus(
  status: DisputeStatus,
  params?: {
    page?: number;
    size?: number;
  }
): Promise<DisputeResponse[]> {
  const searchParams: Record<string, string> = {};
  if (params?.page !== undefined) searchParams.page = String(params.page);
  if (params?.size !== undefined) searchParams.size = String(params.size);

  return apiClient.get<DisputeResponse[]>(
    `${DISPUTES_BASE_URL}/admin/by-status/${status}`,
    searchParams
  );
}

/**
 * Get all open disputes (admin only)
 */
export async function getOpenDisputes(params?: {
  page?: number;
  size?: number;
}): Promise<DisputeResponse[]> {
  const searchParams: Record<string, string> = {};
  if (params?.page !== undefined) searchParams.page = String(params.page);
  if (params?.size !== undefined) searchParams.size = String(params.size);

  return apiClient.get<DisputeResponse[]>(
    `${DISPUTES_BASE_URL}/admin/open`,
    searchParams
  );
}

/**
 * Get all disputes (admin only)
 */
export async function getAllDisputes(params?: {
  page?: number;
  size?: number;
}): Promise<DisputeResponse[]> {
  const searchParams: Record<string, string> = {};
  if (params?.page !== undefined) searchParams.page = String(params.page);
  if (params?.size !== undefined) searchParams.size = String(params.size);

  return apiClient.get<DisputeResponse[]>(
    `${DISPUTES_BASE_URL}/admin/all`,
    searchParams
  );
}

/**
 * Get dispute statistics (admin only)
 */
export async function getDisputeStatistics(): Promise<DisputeStatistics> {
  return apiClient.get<DisputeStatistics>(
    `${DISPUTES_BASE_URL}/admin/statistics`
  );
}
