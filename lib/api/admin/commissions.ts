/**
 * ================================================
 * ADMIN COMMISSION API CLIENT
 * ================================================
 * API client for admin commission management
 *
 * Sprint: Admin Commission Management
 * Story: Commission Settings Management (5 SP)
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint Day 1
 */

import { apiClient } from '../../infrastructure/api/client';
import type {
  CommissionSettings,
  CommissionSettingsUpdateRequest,
  CategoryCommission,
  CategoryCommissionUpdateRequest,
  CommissionAnalytics,
  CommissionHistory,
  CommissionHistoryParams,
  CommissionPreviewRequest,
  CommissionPreview,
  PageResponse,
} from './types';

const BASE_URL = '/api/v1/admin/commissions';

// ========== Commission Settings ==========

/**
 * Get active commission settings
 *
 * GET /api/v1/admin/commissions/settings
 */
export async function getCommissionSettings(): Promise<CommissionSettings> {
  return await apiClient.get<CommissionSettings>(`${BASE_URL}/settings`);
}

/**
 * Update commission settings
 *
 * PUT /api/v1/admin/commissions/settings
 */
export async function updateCommissionSettings(
  data: CommissionSettingsUpdateRequest
): Promise<CommissionSettings> {
  return await apiClient.put<CommissionSettings>(`${BASE_URL}/settings`, data);
}

// ========== Category Commissions ==========

/**
 * Get all category commissions
 *
 * GET /api/v1/admin/commissions/categories
 */
export async function getAllCategoryCommissions(): Promise<
  CategoryCommission[]
> {
  return await apiClient.get<CategoryCommission[]>(`${BASE_URL}/categories`);
}

/**
 * Get commission for specific category
 *
 * GET /api/v1/admin/commissions/categories/{categoryId}
 */
export async function getCategoryCommission(
  categoryId: string
): Promise<CategoryCommission> {
  return await apiClient.get<CategoryCommission>(
    `${BASE_URL}/categories/${categoryId}`
  );
}

/**
 * Update category commission
 *
 * PUT /api/v1/admin/commissions/categories/{categoryId}
 */
export async function updateCategoryCommission(
  categoryId: string,
  data: CategoryCommissionUpdateRequest
): Promise<CategoryCommission> {
  return await apiClient.put<CategoryCommission>(
    `${BASE_URL}/categories/${categoryId}`,
    data
  );
}

/**
 * Reset category commission to default
 *
 * POST /api/v1/admin/commissions/categories/{categoryId}/reset
 */
export async function resetCategoryCommission(
  categoryId: string
): Promise<CategoryCommission> {
  return await apiClient.post<CategoryCommission>(
    `${BASE_URL}/categories/${categoryId}/reset`
  );
}

// ========== Analytics ==========

/**
 * Get commission analytics
 *
 * GET /api/v1/admin/commissions/analytics
 */
export async function getCommissionAnalytics(
  startDate?: string,
  endDate?: string,
  period?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
): Promise<CommissionAnalytics> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (period) params.append('period', period);

  const queryString = params.toString();
  return await apiClient.get<CommissionAnalytics>(
    `${BASE_URL}/analytics${queryString ? `?${queryString}` : ''}`
  );
}

// ========== History ==========

/**
 * Get commission transaction history
 *
 * GET /api/v1/admin/commissions/history
 */
export async function getCommissionHistory(
  params: CommissionHistoryParams = {}
): Promise<PageResponse<CommissionHistory>> {
  const queryParams = new URLSearchParams();

  if (params.page !== undefined)
    queryParams.append('page', params.page.toString());
  if (params.size !== undefined)
    queryParams.append('size', params.size.toString());
  if (params.categoryId) queryParams.append('categoryId', params.categoryId);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);

  return await apiClient.get<PageResponse<CommissionHistory>>(
    `${BASE_URL}/history?${queryParams.toString()}`
  );
}

// ========== Preview ==========

/**
 * Preview commission rate change impact
 *
 * POST /api/v1/admin/commissions/preview
 */
export async function previewCommissionRateChange(
  data: CommissionPreviewRequest
): Promise<CommissionPreview> {
  return await apiClient.post<CommissionPreview>(`${BASE_URL}/preview`, data);
}
