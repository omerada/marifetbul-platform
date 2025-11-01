/**
 * Dispute API Client
 * Sprint 16: Dispute System Completion
 */

import { apiClient } from '../infrastructure/api/client';
import type {
  DisputeRequest,
  DisputeResponse,
  DisputeResolutionRequest,
  DisputeStatistics,
  DisputeStatus,
  DisputeFilters,
  PageResponse,
  DisputeEvidence,
} from '@/types/dispute';

const DISPUTES_BASE_URL = '/api/v1/disputes';

// ==================== USER ENDPOINTS ====================

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

// ==================== EVIDENCE & ESCALATION ====================

/**
 * Upload evidence for a dispute
 */
export async function uploadDisputeEvidence(
  disputeId: string,
  evidenceRequest: {
    fileUrl: string;
    fileType: string;
    fileName: string;
    fileSize: number;
    description?: string;
  }
): Promise<DisputeEvidence> {
  return apiClient.post<DisputeEvidence>(
    `${DISPUTES_BASE_URL}/${disputeId}/evidence`,
    evidenceRequest
  );
}

/**
 * Get all evidence for a dispute
 */
export async function getDisputeEvidence(
  disputeId: string
): Promise<DisputeEvidence[]> {
  return apiClient.get<DisputeEvidence[]>(
    `${DISPUTES_BASE_URL}/${disputeId}/evidence`
  );
}

/**
 * Escalate a dispute (request admin intervention)
 */
export async function escalateDispute(
  disputeId: string,
  reason?: string
): Promise<DisputeResponse> {
  return apiClient.put<DisputeResponse>(
    `${DISPUTES_BASE_URL}/${disputeId}/escalate`,
    { reason }
  );
}

/**
 * Get dispute timeline (all events)
 */
export async function getDisputeTimeline(disputeId: string): Promise<
  Array<{
    id: string;
    eventType: string;
    description: string;
    timestamp: string;
    performedBy?: string;
  }>
> {
  return apiClient.get<
    Array<{
      id: string;
      eventType: string;
      description: string;
      timestamp: string;
      performedBy?: string;
    }>
  >(`${DISPUTES_BASE_URL}/${disputeId}/timeline`);
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

// ==================== ADMIN FILTERS ====================

/**
 * Get disputes with advanced filters (admin only)
 */
export async function getDisputesWithFilters(
  filters: DisputeFilters
): Promise<PageResponse<DisputeResponse>> {
  const searchParams: Record<string, string> = {};

  if (filters.status) searchParams.status = filters.status;
  if (filters.reason) searchParams.reason = filters.reason;
  if (filters.raisedByUserId)
    searchParams.raisedByUserId = filters.raisedByUserId;
  if (filters.orderId) searchParams.orderId = filters.orderId;
  if (filters.dateFrom) searchParams.dateFrom = filters.dateFrom;
  if (filters.dateTo) searchParams.dateTo = filters.dateTo;
  if (filters.page !== undefined) searchParams.page = String(filters.page);
  if (filters.size !== undefined) searchParams.size = String(filters.size);
  if (filters.sort) searchParams.sort = filters.sort;
  if (filters.order) searchParams.order = filters.order;

  return apiClient.get<PageResponse<DisputeResponse>>(
    `${DISPUTES_BASE_URL}/admin/search`,
    searchParams
  );
}

/**
 * Export disputes to CSV (admin only)
 */
export async function exportDisputesToCSV(
  filters?: DisputeFilters
): Promise<Blob> {
  const searchParams: Record<string, string> = {};

  if (filters?.status) searchParams.status = filters.status;
  if (filters?.reason) searchParams.reason = filters.reason;
  if (filters?.dateFrom) searchParams.dateFrom = filters.dateFrom;
  if (filters?.dateTo) searchParams.dateTo = filters.dateTo;

  const response = await fetch(
    `${DISPUTES_BASE_URL}/admin/export?${new URLSearchParams(searchParams)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to export disputes');
  }

  return response.blob();
}
