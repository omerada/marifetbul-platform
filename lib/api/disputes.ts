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
  DisputeConversationResponse,
  DisputeMessageResponse,
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
 * Upload attachment for dispute message
 * @param file File to upload
 * @param onProgress Progress callback (0-100)
 * @returns Upload response with file URL
 */
export async function uploadDisputeAttachment(
  file: File,
  onProgress?: (progress: number) => void
): Promise<{
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}> {
  // Use canonical file upload service
  const { fileUploadService } = await import(
    '@/lib/services/file-upload.service'
  );

  try {
    const result = await fileUploadService.uploadFile(file, {
      endpoint: `${process.env.NEXT_PUBLIC_API_URL}${DISPUTES_BASE_URL}/attachments`,
      folder: 'disputes',
      authenticated: true,
      onProgress: (progress) => {
        onProgress?.(progress.progress);
      },
    });

    return {
      fileUrl: result.fileUrl,
      fileName: result.fileName,
      fileSize: result.fileSize,
      fileType: result.fileType,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Failed to upload dispute attachment'
    );
  }
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

// ==================== DISPUTE MESSAGING (Sprint 2 Story 2.1) ====================

/**
 * Send a message in a dispute conversation
 * @param disputeId Dispute ID
 * @param content Message content
 * @param attachmentUrls Optional attachment URLs
 */
export async function sendDisputeMessage(
  disputeId: string,
  content: string,
  attachmentUrls?: string[]
): Promise<DisputeMessageResponse> {
  return apiClient.post<DisputeMessageResponse>(
    `${DISPUTES_BASE_URL}/${disputeId}/messages`,
    {
      content,
      attachmentUrls: attachmentUrls || [],
    }
  );
}

/**
 * Get all messages for a dispute
 * @param disputeId Dispute ID
 * @param page Page number (optional)
 * @param size Page size (optional)
 */
export async function getDisputeMessages(
  disputeId: string,
  page?: number,
  size?: number
): Promise<DisputeConversationResponse> {
  const params: Record<string, string> = {};
  if (page !== undefined) params.page = String(page);
  if (size !== undefined) params.size = String(size);

  return apiClient.get<DisputeConversationResponse>(
    `${DISPUTES_BASE_URL}/${disputeId}/messages`,
    params
  );
}

/**
 * Mark all messages as read in a dispute
 * @param disputeId Dispute ID
 */
export async function markDisputeMessagesAsRead(
  disputeId: string
): Promise<{ markedCount: number }> {
  return apiClient.put(`${DISPUTES_BASE_URL}/${disputeId}/messages/read`, {});
}

/**
 * Get unread message count for a dispute
 * @param disputeId Dispute ID
 */
export async function getDisputeUnreadCount(
  disputeId: string
): Promise<{ unreadCount: number }> {
  return apiClient.get(
    `${DISPUTES_BASE_URL}/${disputeId}/messages/unread-count`
  );
}

/**
 * Get messages since a timestamp (for real-time updates)
 * @param disputeId Dispute ID
 * @param since ISO timestamp
 */
export async function getDisputeMessagesSince(
  disputeId: string,
  since: string
): Promise<DisputeMessageResponse[]> {
  return apiClient.get<DisputeMessageResponse[]>(
    `${DISPUTES_BASE_URL}/${disputeId}/messages/since`,
    { since }
  );
}

/**
 * Delete a message (within 5-minute window)
 * @param messageId Message ID
 */
export async function deleteDisputeMessage(messageId: string): Promise<void> {
  return apiClient.delete(`${DISPUTES_BASE_URL}/messages/${messageId}`);
}
