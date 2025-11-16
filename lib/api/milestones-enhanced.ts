/**
 * ================================================
 * ENHANCED MILESTONE API CLIENT
 * ================================================
 * Story 1.2 - Milestone API Client Refactoring (5 SP)
 *
 * Improvements:
 * - ✅ Error handling standardization
 * - ✅ TypeScript strict type safety
 * - ✅ SWR cache key strategy
 * - ✅ Retry mechanism for network failures
 * - ✅ Request/response logging
 *
 * @author MarifetBul Development Team
 * @version 2.0.0
 * @since Sprint 1 - Story 1.2
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import logger from '@/lib/infrastructure/monitoring/logger';
import type {
  OrderMilestone,
  CreateOrderMilestoneRequest,
  UpdateOrderMilestoneRequest,
  DeliverMilestoneRequest,
} from '@/types/business/features/milestone';

// ==================== TYPES ====================

/**
 * Milestone API error with structured information
 */
export class MilestoneApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode?: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'MilestoneApiError';
  }
}

/**
 * API Response wrapper type
 */
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// ==================== SWR CACHE KEYS ====================

/**
 * Standardized cache keys for SWR
 * Usage: import { MILESTONE_CACHE_KEYS } from '@/lib/api/milestones-enhanced'
 */
export const MILESTONE_CACHE_KEYS = {
  /** All milestones for an order */
  orderMilestones: (orderId: string) =>
    `/api/v1/orders/${orderId}/milestones` as const,

  /** Single milestone details */
  milestone: (milestoneId: string) =>
    `/api/v1/milestones/${milestoneId}` as const,

  /** Overdue milestones (admin) */
  overdueMilestones: () => `/api/v1/admin/milestones/overdue` as const,

  /** Pending acceptance milestones (admin) */
  pendingAcceptance: (hours: number = 48) =>
    `/api/v1/admin/milestones/pending-acceptance?hours=${hours}` as const,
} as const;

// ==================== API ENDPOINTS ====================

const MILESTONE_BASE = '/api/v1';

const endpoints = {
  createMilestone: (orderId: string) =>
    `${MILESTONE_BASE}/orders/${orderId}/milestones`,
  createMilestonesBatch: (orderId: string) =>
    `${MILESTONE_BASE}/orders/${orderId}/milestones/batch`,
  getOrderMilestones: (orderId: string) =>
    `${MILESTONE_BASE}/orders/${orderId}/milestones`,
  getMilestone: (milestoneId: string) =>
    `${MILESTONE_BASE}/milestones/${milestoneId}`,
  updateMilestone: (milestoneId: string) =>
    `${MILESTONE_BASE}/milestones/${milestoneId}`,
  deleteMilestone: (milestoneId: string) =>
    `${MILESTONE_BASE}/milestones/${milestoneId}`,
  startMilestone: (milestoneId: string) =>
    `${MILESTONE_BASE}/milestones/${milestoneId}/start`,
  deliverMilestone: (milestoneId: string) =>
    `${MILESTONE_BASE}/milestones/${milestoneId}/deliver`,
  acceptMilestone: (milestoneId: string) =>
    `${MILESTONE_BASE}/milestones/${milestoneId}/accept`,
  rejectMilestone: (milestoneId: string) =>
    `${MILESTONE_BASE}/milestones/${milestoneId}/reject`,
  cancelMilestone: (milestoneId: string) =>
    `${MILESTONE_BASE}/milestones/${milestoneId}/cancel`,
  getOverdueMilestones: () => `${MILESTONE_BASE}/admin/milestones/overdue`,
  getPendingAcceptance: (hours: number) =>
    `${MILESTONE_BASE}/admin/milestones/pending-acceptance?hours=${hours}`,
} as const;

// ==================== RETRY CONFIGURATION ====================

interface RetryConfig {
  maxRetries: number;
  retryDelay: number; // milliseconds
  shouldRetry: (error: unknown) => boolean;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  shouldRetry: (error: unknown) => {
    // Retry on network errors, timeouts, 5xx errors
    if (error instanceof MilestoneApiError) {
      return (
        error.statusCode === undefined ||
        error.statusCode >= 500 ||
        error.statusCode === 408
      );
    }
    return true; // Retry on unknown errors
  },
};

/**
 * Retry utility with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  attempt: number = 1
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (attempt >= config.maxRetries || !config.shouldRetry(error)) {
      throw error;
    }

    const delay = config.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
    logger.warn(
      `[MilestoneAPI] Retrying request (attempt ${attempt + 1}/${config.maxRetries}) after ${delay}ms`,
      {
        error,
        attempt,
      }
    );

    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryWithBackoff(fn, config, attempt + 1);
  }
}

// ==================== ERROR HANDLER ====================

/**
 * Standardized error handling for milestone API
 */
function handleMilestoneError(error: unknown, operation: string): never {
  logger.error(`[MilestoneAPI] ${operation} failed`, error as Error);

  if (error instanceof MilestoneApiError) {
    throw error;
  }

  // Handle API client errors
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object'
  ) {
    const response = error.response as {
      status?: number;
      data?: { message?: string; code?: string };
    };
    const status = response.status;
    const message = response.data?.message || 'Milestone işlemi başarısız oldu';
    const code = response.data?.code || 'MILESTONE_ERROR';

    throw new MilestoneApiError(message, code, status, error);
  }

  // Generic error
  throw new MilestoneApiError(
    'Beklenmeyen bir hata oluştu',
    'UNKNOWN_ERROR',
    undefined,
    error
  );
}

// ==================== API FUNCTIONS ====================

/**
 * Create a single milestone for an order
 * @throws {MilestoneApiError} When creation fails
 */
export async function createMilestone(
  orderId: string,
  data: CreateOrderMilestoneRequest
): Promise<OrderMilestone> {
  try {
    logger.info('[MilestoneAPI] Creating milestone', { orderId, data });

    const response = await retryWithBackoff(() =>
      apiClient.post<ApiResponse<OrderMilestone>>(
        endpoints.createMilestone(orderId),
        data
      )
    );

    logger.info('[MilestoneAPI] Milestone created successfully', {
      milestoneId: response.data.id,
      orderId,
    });

    return response.data;
  } catch (error) {
    handleMilestoneError(error, 'Create Milestone');
  }
}

/**
 * Create multiple milestones in batch
 * @throws {MilestoneApiError} When batch creation fails
 */
export async function createMilestonesBatch(
  orderId: string,
  milestones: CreateOrderMilestoneRequest[]
): Promise<OrderMilestone[]> {
  try {
    logger.info('[MilestoneAPI] Creating milestones batch', {
      orderId,
      count: milestones.length,
    });

    const response = await retryWithBackoff(() =>
      apiClient.post<ApiResponse<OrderMilestone[]>>(
        endpoints.createMilestonesBatch(orderId),
        milestones
      )
    );

    logger.info('[MilestoneAPI] Milestones batch created', {
      count: response.data.length,
      orderId,
    });

    return response.data;
  } catch (error) {
    handleMilestoneError(error, 'Create Milestones Batch');
  }
}

/**
 * Get all milestones for an order
 * @throws {MilestoneApiError} When fetch fails
 */
export async function getOrderMilestones(
  orderId: string
): Promise<OrderMilestone[]> {
  try {
    logger.debug('[MilestoneAPI] Fetching order milestones', { orderId });

    const response = await retryWithBackoff(() =>
      apiClient.get<ApiResponse<OrderMilestone[]>>(
        endpoints.getOrderMilestones(orderId)
      )
    );

    logger.debug('[MilestoneAPI] Order milestones fetched', {
      orderId,
      count: response.data.length,
    });

    return response.data;
  } catch (error) {
    handleMilestoneError(error, 'Get Order Milestones');
  }
}

/**
 * Get single milestone by ID
 * @throws {MilestoneApiError} When milestone not found or fetch fails
 */
export async function getMilestone(
  milestoneId: string
): Promise<OrderMilestone> {
  try {
    logger.debug('[MilestoneAPI] Fetching milestone', { milestoneId });

    const response = await retryWithBackoff(() =>
      apiClient.get<ApiResponse<OrderMilestone>>(
        endpoints.getMilestone(milestoneId)
      )
    );

    logger.debug('[MilestoneAPI] Milestone fetched', { milestoneId });

    return response.data;
  } catch (error) {
    handleMilestoneError(error, 'Get Milestone');
  }
}

/**
 * Update milestone details (before delivery)
 * @throws {MilestoneApiError} When update fails or milestone already delivered
 */
export async function updateMilestone(
  milestoneId: string,
  data: UpdateOrderMilestoneRequest
): Promise<OrderMilestone> {
  try {
    logger.info('[MilestoneAPI] Updating milestone', { milestoneId, data });

    const response = await retryWithBackoff(() =>
      apiClient.put<ApiResponse<OrderMilestone>>(
        endpoints.updateMilestone(milestoneId),
        data
      )
    );

    logger.info('[MilestoneAPI] Milestone updated', { milestoneId });

    return response.data;
  } catch (error) {
    handleMilestoneError(error, 'Update Milestone');
  }
}

/**
 * Delete a milestone (before delivery)
 * @throws {MilestoneApiError} When deletion fails or milestone already delivered
 */
export async function deleteMilestone(milestoneId: string): Promise<void> {
  try {
    logger.info('[MilestoneAPI] Deleting milestone', { milestoneId });

    await retryWithBackoff(() =>
      apiClient.delete(endpoints.deleteMilestone(milestoneId))
    );

    logger.info('[MilestoneAPI] Milestone deleted', { milestoneId });
  } catch (error) {
    handleMilestoneError(error, 'Delete Milestone');
  }
}

/**
 * Start working on a milestone (seller only)
 * @throws {MilestoneApiError} When start fails or unauthorized
 */
export async function startMilestone(
  milestoneId: string
): Promise<OrderMilestone> {
  try {
    logger.info('[MilestoneAPI] Starting milestone', { milestoneId });

    const response = await retryWithBackoff(() =>
      apiClient.post<ApiResponse<OrderMilestone>>(
        endpoints.startMilestone(milestoneId)
      )
    );

    logger.info('[MilestoneAPI] Milestone started', { milestoneId });

    return response.data;
  } catch (error) {
    handleMilestoneError(error, 'Start Milestone');
  }
}

/**
 * Deliver completed milestone (seller only)
 * @throws {MilestoneApiError} When delivery fails or unauthorized
 */
export async function deliverMilestone(
  milestoneId: string,
  data: DeliverMilestoneRequest
): Promise<OrderMilestone> {
  try {
    logger.info('[MilestoneAPI] Delivering milestone', { milestoneId, data });

    const response = await retryWithBackoff(() =>
      apiClient.post<ApiResponse<OrderMilestone>>(
        endpoints.deliverMilestone(milestoneId),
        data
      )
    );

    logger.info('[MilestoneAPI] Milestone delivered', { milestoneId });

    return response.data;
  } catch (error) {
    handleMilestoneError(error, 'Deliver Milestone');
  }
}

/**
 * Accept delivered milestone and release payment (buyer only)
 * @throws {MilestoneApiError} When acceptance fails or unauthorized
 */
export async function acceptMilestone(
  milestoneId: string
): Promise<OrderMilestone> {
  try {
    logger.info('[MilestoneAPI] Accepting milestone', { milestoneId });

    const response = await retryWithBackoff(() =>
      apiClient.post<ApiResponse<OrderMilestone>>(
        endpoints.acceptMilestone(milestoneId)
      )
    );

    logger.info('[MilestoneAPI] Milestone accepted', { milestoneId });

    return response.data;
  } catch (error) {
    handleMilestoneError(error, 'Accept Milestone');
  }
}

/**
 * Reject milestone and request revision (buyer only)
 * @throws {MilestoneApiError} When rejection fails or unauthorized
 */
export async function rejectMilestone(
  milestoneId: string,
  reason: string
): Promise<OrderMilestone> {
  try {
    logger.info('[MilestoneAPI] Rejecting milestone', { milestoneId, reason });

    const response = await retryWithBackoff(() =>
      apiClient.post<ApiResponse<OrderMilestone>>(
        endpoints.rejectMilestone(milestoneId),
        { reason }
      )
    );

    logger.info('[MilestoneAPI] Milestone rejected', { milestoneId });

    return response.data;
  } catch (error) {
    handleMilestoneError(error, 'Reject Milestone');
  }
}

/**
 * Cancel a milestone
 * @throws {MilestoneApiError} When cancellation fails
 */
export async function cancelMilestone(
  milestoneId: string,
  reason: string
): Promise<OrderMilestone> {
  try {
    logger.info('[MilestoneAPI] Canceling milestone', { milestoneId, reason });

    const response = await retryWithBackoff(() =>
      apiClient.post<ApiResponse<OrderMilestone>>(
        endpoints.cancelMilestone(milestoneId),
        { reason }
      )
    );

    logger.info('[MilestoneAPI] Milestone canceled', { milestoneId });

    return response.data;
  } catch (error) {
    handleMilestoneError(error, 'Cancel Milestone');
  }
}

/**
 * Get overdue milestones (admin only)
 * @throws {MilestoneApiError} When fetch fails or unauthorized
 */
export async function getOverdueMilestones(): Promise<OrderMilestone[]> {
  try {
    logger.debug('[MilestoneAPI] Fetching overdue milestones');

    const response = await retryWithBackoff(() =>
      apiClient.get<ApiResponse<OrderMilestone[]>>(
        endpoints.getOverdueMilestones()
      )
    );

    logger.debug('[MilestoneAPI] Overdue milestones fetched', {
      count: response.data.length,
    });

    return response.data;
  } catch (error) {
    handleMilestoneError(error, 'Get Overdue Milestones');
  }
}

/**
 * Get milestones pending acceptance (admin only)
 * @throws {MilestoneApiError} When fetch fails or unauthorized
 */
export async function getPendingAcceptance(
  hoursThreshold: number = 48
): Promise<OrderMilestone[]> {
  try {
    logger.debug('[MilestoneAPI] Fetching pending acceptance milestones', {
      hoursThreshold,
    });

    const response = await retryWithBackoff(() =>
      apiClient.get<ApiResponse<OrderMilestone[]>>(
        endpoints.getPendingAcceptance(hoursThreshold)
      )
    );

    logger.debug('[MilestoneAPI] Pending acceptance milestones fetched', {
      count: response.data.length,
    });

    return response.data;
  } catch (error) {
    handleMilestoneError(error, 'Get Pending Acceptance Milestones');
  }
}

// ==================== EXPORT MILESTONE API ====================

/**
 * Enhanced Milestone API with error handling and retry logic
 * Story 1.2 - Production-ready API client
 */
export const milestoneApiEnhanced = {
  // CRUD operations
  createMilestone,
  createMilestonesBatch,
  getOrderMilestones,
  getMilestone,
  updateMilestone,
  deleteMilestone,

  // Workflow operations
  startMilestone,
  deliverMilestone,
  acceptMilestone,
  rejectMilestone,
  cancelMilestone,

  // Admin operations
  getOverdueMilestones,
  getPendingAcceptance,

  // Cache keys for SWR
  cacheKeys: MILESTONE_CACHE_KEYS,
} as const;

export default milestoneApiEnhanced;
