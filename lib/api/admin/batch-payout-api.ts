/**
 * ================================================
 * ADMIN BATCH PAYOUT API
 * ================================================
 * Admin-only batch payout operations for processing multiple payouts
 *
 * Sprint 1: Wallet & Payment System Completion
 * Day 3-4: Payout Batch Processing
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-11-14
 */

import { apiClient } from '@/lib/infrastructure/services/api-client';
import type {
  BatchPayoutApprovalRequest,
  BatchPayoutApprovalResponse,
  PayoutBatchResponse,
  PayoutBatchStatus,
  BatchProcessingStats,
} from '@/types/business/features/wallet';

// ============================================================================
// BATCH CREATION & APPROVAL
// ============================================================================

/**
 * Create and approve a batch of payouts
 * POST /api/v1/payouts/batch
 *
 * @param request - Batch creation request
 * @returns Batch approval response with batch details
 *
 * @throws {AuthenticationError} Not authenticated or not admin
 * @throws {ValidationError} Invalid request data
 * @throws {BusinessError} Payouts already in batch or not eligible
 */
export async function createPayoutBatch(
  request: BatchPayoutApprovalRequest
): Promise<BatchPayoutApprovalResponse> {
  return apiClient.post<BatchPayoutApprovalResponse>('/payouts/batch', request);
}

/**
 * Alternative endpoint for batch approval (legacy compatibility)
 * POST /api/v1/payouts/admin/batch/approve
 *
 * @param request - Batch approval request
 * @returns Batch approval response
 */
export async function batchApprovePayouts(
  request: BatchPayoutApprovalRequest
): Promise<BatchPayoutApprovalResponse> {
  return apiClient.post<BatchPayoutApprovalResponse>(
    '/payouts/admin/batch/approve',
    request
  );
}

// ============================================================================
// BATCH RETRIEVAL
// ============================================================================

/**
 * Get batch details by ID
 * GET /api/v1/payouts/batch/{batchId}
 *
 * @param batchId - Batch ID
 * @returns Batch details with processing stats
 *
 * @throws {AuthenticationError} Not authenticated or not admin
 * @throws {NotFoundError} Batch not found
 */
export async function getBatchDetails(
  batchId: string
): Promise<PayoutBatchResponse> {
  return apiClient.get<PayoutBatchResponse>(`/payouts/batch/${batchId}`);
}

/**
 * Get all batches filtered by status
 * GET /api/v1/payouts/batch?status={status}
 *
 * @param status - Optional status filter
 * @returns List of batches
 *
 * @throws {AuthenticationError} Not authenticated or not admin
 */
export async function getBatches(
  status?: PayoutBatchStatus
): Promise<PayoutBatchResponse[]> {
  const params = status ? { status: status } : undefined;
  return apiClient.get<PayoutBatchResponse[]>('/payouts/batch', params);
}

/**
 * Get batches created by current admin
 * GET /api/v1/payouts/batch/my
 *
 * @returns List of batches created by current admin
 */
export async function getMyBatches(): Promise<PayoutBatchResponse[]> {
  return apiClient.get<PayoutBatchResponse[]>('/payouts/batch/my');
}

// ============================================================================
// BATCH PROCESSING
// ============================================================================

/**
 * Process a specific batch
 * POST /api/v1/payouts/batch/{batchId}/process
 *
 * Starts processing an approved batch. Use polling to track progress.
 *
 * @param batchId - Batch ID to process
 * @returns Updated batch with PROCESSING status
 *
 * @throws {AuthenticationError} Not authenticated or not admin
 * @throws {BusinessError} Batch not in PENDING status
 */
export async function processBatch(
  batchId: string
): Promise<PayoutBatchResponse> {
  return apiClient.post<PayoutBatchResponse>(
    `/payouts/batch/${batchId}/process`
  );
}

/**
 * Process all pending batches
 * POST /api/v1/payouts/admin/batch/process-all
 *
 * @returns Number of batches processed
 */
export async function processAllPendingBatches(): Promise<{
  message: string;
  count: number;
}> {
  return apiClient.post<{ message: string; count: number }>(
    '/payouts/admin/batch/process-all'
  );
}

// ============================================================================
// BATCH CANCELLATION
// ============================================================================

/**
 * Cancel a pending batch
 * POST /api/v1/payouts/batch/{batchId}/cancel
 *
 * @param batchId - Batch ID to cancel
 * @param reason - Cancellation reason
 * @returns Cancelled batch
 *
 * @throws {AuthenticationError} Not authenticated or not admin
 * @throws {BusinessError} Batch not in PENDING status
 */
export async function cancelBatch(
  batchId: string,
  reason: string
): Promise<PayoutBatchResponse> {
  const searchParams = new URLSearchParams({ reason }).toString();
  return apiClient.post<PayoutBatchResponse>(
    `/payouts/batch/${batchId}/cancel?${searchParams}`,
    null
  );
}

// ============================================================================
// BATCH MONITORING & STATS
// ============================================================================

/**
 * Get batch processing statistics
 * GET /api/v1/payouts/admin/batch/stats
 *
 * Returns aggregated stats for batch processing
 *
 * @returns Batch processing statistics
 */
export async function getBatchProcessingStats(): Promise<BatchProcessingStats> {
  return apiClient.get<BatchProcessingStats>('/payouts/admin/batch/stats');
}

/**
 * Retry failed batches
 * POST /api/v1/payouts/admin/batch/retry-failed
 *
 * Retries all batches in FAILED status
 *
 * @returns Number of batches retried
 */
export async function retryFailedBatches(): Promise<{
  message: string;
  count: number;
}> {
  return apiClient.post<{ message: string; count: number }>(
    '/payouts/admin/batch/retry-failed'
  );
}

/**
 * Cancel stuck batches (processing for > 2 hours)
 * POST /api/v1/payouts/admin/batch/cancel-stuck
 *
 * @returns Number of batches cancelled
 */
export async function cancelStuckBatches(): Promise<{
  message: string;
  count: number;
}> {
  return apiClient.post<{ message: string; count: number }>(
    '/payouts/admin/batch/cancel-stuck'
  );
}

// ============================================================================
// BATCH EXPORT
// ============================================================================

/**
 * Export batch details to CSV
 * GET /api/v1/payouts/batch/{batchId}/export
 *
 * @param batchId - Batch ID
 * @returns CSV file blob
 */
export async function exportBatchToCSV(batchId: string): Promise<Blob> {
  const response = await fetch(
    `/api/v1/payouts/batch/${batchId}/export?format=csv`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Export failed');
  }

  return response.blob();
}

/**
 * Download batch export file
 *
 * @param batchId - Batch ID
 * @param batchNumber - Batch number for filename
 */
export async function downloadBatchExport(
  batchId: string,
  batchNumber: string
): Promise<void> {
  const blob = await exportBatchToCSV(batchId);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `batch-${batchNumber}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Poll batch status until completion or failure
 *
 * @param batchId - Batch ID to poll
 * @param onProgress - Progress callback
 * @param interval - Polling interval in ms (default: 3000)
 * @param timeout - Max polling time in ms (default: 300000 = 5 min)
 * @returns Promise resolving to final batch status
 */
export async function pollBatchStatus(
  batchId: string,
  onProgress?: (batch: PayoutBatchResponse) => void,
  interval: number = 3000,
  timeout: number = 300000
): Promise<PayoutBatchResponse> {
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const batch = await getBatchDetails(batchId);

        // Call progress callback
        if (onProgress) {
          onProgress(batch);
        }

        // Check if completed or failed
        if (batch.status === 'COMPLETED' || batch.status === 'FAILED') {
          resolve(batch);
          return;
        }

        // Check timeout
        if (Date.now() - startTime >= timeout) {
          reject(new Error('Polling timeout exceeded'));
          return;
        }

        // Continue polling
        setTimeout(poll, interval);
      } catch (error) {
        reject(error);
      }
    };

    poll();
  });
}

/**
 * Get batch status badge variant
 *
 * @param status - Batch status
 * @returns Tailwind CSS badge variant
 */
export function getBatchStatusVariant(
  status: PayoutBatchStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'PENDING':
      return 'secondary';
    case 'APPROVED':
    case 'PROCESSING':
    case 'COMPLETED':
      return 'default';
    case 'REJECTED':
    case 'FAILED':
    case 'CANCELLED':
      return 'destructive';
    default:
      return 'outline';
  }
}

/**
 * Get batch status display text (Turkish)
 *
 * @param status - Batch status
 * @returns Turkish status text
 */
export function getBatchStatusText(status: PayoutBatchStatus): string {
  const statusMap: Record<PayoutBatchStatus, string> = {
    PENDING: 'Bekliyor',
    APPROVED: 'Onaylandı',
    REJECTED: 'Reddedildi',
    PROCESSING: 'İşleniyor',
    COMPLETED: 'Tamamlandı',
    FAILED: 'Başarısız',
    CANCELLED: 'İptal Edildi',
  };

  return statusMap[status] || status;
}
