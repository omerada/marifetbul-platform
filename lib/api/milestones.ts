/**
 * ================================================
 * MILESTONE API CLIENT
 * ================================================
 * API client for milestone management
 * Clean, type-safe interface with proper error handling
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 1 - Milestone Payment System
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import type {
  OrderMilestone,
  CreateOrderMilestoneRequest,
  UpdateOrderMilestoneRequest,
  DeliverMilestoneRequest,
} from '@/types/business/features/milestone';

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

// ==================== API FUNCTIONS ====================

/**
 * Create a single milestone for an order
 */
export async function createMilestone(
  orderId: string,
  data: CreateOrderMilestoneRequest
): Promise<OrderMilestone> {
  const response = await apiClient.post<{ data: OrderMilestone }>(
    endpoints.createMilestone(orderId),
    data
  );
  return response.data;
}

/**
 * Create multiple milestones in batch
 */
export async function createMilestonesBatch(
  orderId: string,
  milestones: CreateOrderMilestoneRequest[]
): Promise<OrderMilestone[]> {
  const response = await apiClient.post<{ data: OrderMilestone[] }>(
    endpoints.createMilestonesBatch(orderId),
    milestones
  );
  return response.data;
}

/**
 * Get all milestones for an order
 */
export async function getOrderMilestones(
  orderId: string
): Promise<OrderMilestone[]> {
  const response = await apiClient.get<{ data: OrderMilestone[] }>(
    endpoints.getOrderMilestones(orderId)
  );
  return response.data;
}

/**
 * Get single milestone by ID
 */
export async function getMilestone(
  milestoneId: string
): Promise<OrderMilestone> {
  const response = await apiClient.get<{ data: OrderMilestone }>(
    endpoints.getMilestone(milestoneId)
  );
  return response.data;
}

/**
 * Update milestone details (before delivery)
 */
export async function updateMilestone(
  milestoneId: string,
  data: UpdateOrderMilestoneRequest
): Promise<OrderMilestone> {
  const response = await apiClient.put<{ data: OrderMilestone }>(
    endpoints.updateMilestone(milestoneId),
    data
  );
  return response.data;
}

/**
 * Delete a milestone (before delivery)
 */
export async function deleteMilestone(milestoneId: string): Promise<void> {
  await apiClient.delete(endpoints.deleteMilestone(milestoneId));
}

/**
 * Start working on a milestone (seller only)
 */
export async function startMilestone(
  milestoneId: string
): Promise<OrderMilestone> {
  const response = await apiClient.post<{ data: OrderMilestone }>(
    endpoints.startMilestone(milestoneId)
  );
  return response.data;
}

/**
 * Deliver completed milestone (seller only)
 */
export async function deliverMilestone(
  milestoneId: string,
  data: DeliverMilestoneRequest
): Promise<OrderMilestone> {
  const response = await apiClient.post<{ data: OrderMilestone }>(
    endpoints.deliverMilestone(milestoneId),
    data
  );
  return response.data;
}

/**
 * Accept delivered milestone and release payment (buyer only)
 */
export async function acceptMilestone(
  milestoneId: string
): Promise<OrderMilestone> {
  const response = await apiClient.post<{ data: OrderMilestone }>(
    endpoints.acceptMilestone(milestoneId)
  );
  return response.data;
}

/**
 * Reject milestone and request revision (buyer only)
 */
export async function rejectMilestone(
  milestoneId: string,
  reason: string
): Promise<OrderMilestone> {
  const response = await apiClient.post<{ data: OrderMilestone }>(
    endpoints.rejectMilestone(milestoneId),
    reason
  );
  return response.data;
}

/**
 * Cancel a milestone
 */
export async function cancelMilestone(
  milestoneId: string,
  reason: string
): Promise<OrderMilestone> {
  const response = await apiClient.post<{ data: OrderMilestone }>(
    endpoints.cancelMilestone(milestoneId),
    reason
  );
  return response.data;
}

/**
 * Get overdue milestones (admin only)
 */
export async function getOverdueMilestones(): Promise<OrderMilestone[]> {
  const response = await apiClient.get<{ data: OrderMilestone[] }>(
    endpoints.getOverdueMilestones()
  );
  return response.data;
}

/**
 * Get milestones pending acceptance (admin only)
 */
export async function getPendingAcceptance(
  hoursThreshold: number = 48
): Promise<OrderMilestone[]> {
  const response = await apiClient.get<{ data: OrderMilestone[] }>(
    endpoints.getPendingAcceptance(hoursThreshold)
  );
  return response.data;
}

// ==================== EXPORT MILESTONE API ====================

export const milestoneApi = {
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
} as const;

export default milestoneApi;
