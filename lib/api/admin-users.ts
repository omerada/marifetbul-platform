/**
 * ================================================
 * ADMIN USERS API CLIENT
 * ================================================
 * Type-safe API client for admin user management operations
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 3 Story 3.1
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import { ADMIN_ENDPOINTS } from '@/lib/api/endpoints';
import type { ApiResponse, PageResponse } from '@/types/backend-aligned';

/**
 * User DTOs - Backend aligned types
 */
export interface AdminUserResponse {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'PENDING_VERIFICATION';
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  profileComplete: boolean;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  role?: string;
}

export interface SuspendUserRequest {
  reason: string;
  durationDays?: number;
  note?: string;
}

export interface BanUserRequest {
  reason: string;
  note?: string;
  permanent?: boolean;
}

export interface UserFilters {
  role?: string;
  status?: string;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}

/**
 * Admin Users API Service
 */
export const adminUsersApi = {
  /**
   * Get all users (admin only)
   * GET /api/v1/admin/users
   */
  async getUsers(
    filters?: UserFilters
  ): Promise<ApiResponse<PageResponse<AdminUserResponse>>> {
    const params: Record<string, string> = {};

    if (filters) {
      if (filters.role) params.role = filters.role;
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      if (filters.page !== undefined) params.page = String(filters.page);
      if (filters.size !== undefined) params.size = String(filters.size);
      if (filters.sort) params.sort = filters.sort;
    }

    return apiClient.get<ApiResponse<PageResponse<AdminUserResponse>>>(
      ADMIN_ENDPOINTS.USERS,
      params
    );
  },

  /**
   * Get user by ID (admin only)
   * GET /api/v1/admin/users/:userId
   */
  async getUserById(userId: string): Promise<ApiResponse<AdminUserResponse>> {
    return apiClient.get<ApiResponse<AdminUserResponse>>(
      ADMIN_ENDPOINTS.GET_USER(userId)
    );
  },

  /**
   * Update user (admin only)
   * PUT /api/v1/admin/users/:userId
   */
  async updateUser(
    userId: string,
    data: UpdateUserRequest
  ): Promise<ApiResponse<AdminUserResponse>> {
    return apiClient.put<ApiResponse<AdminUserResponse>>(
      ADMIN_ENDPOINTS.GET_USER(userId),
      data
    );
  },

  /**
   * Suspend user (admin only)
   * POST /api/v1/admin/users/:userId/suspend
   */
  async suspendUser(
    userId: string,
    data?: SuspendUserRequest
  ): Promise<ApiResponse<AdminUserResponse>> {
    return apiClient.post<ApiResponse<AdminUserResponse>>(
      ADMIN_ENDPOINTS.SUSPEND_USER(userId),
      data || { reason: 'Admin action' }
    );
  },

  /**
   * Activate user (admin only)
   * POST /api/v1/admin/users/:userId/activate
   */
  async activateUser(userId: string): Promise<ApiResponse<AdminUserResponse>> {
    return apiClient.post<ApiResponse<AdminUserResponse>>(
      ADMIN_ENDPOINTS.ACTIVATE_USER(userId)
    );
  },

  /**
   * Ban user (admin only)
   * POST /api/v1/admin/users/:userId/ban
   * Note: Backend may use different endpoint, adjust if needed
   */
  async banUser(
    userId: string,
    data: BanUserRequest
  ): Promise<ApiResponse<AdminUserResponse>> {
    // TODO: Verify actual backend endpoint for ban
    return apiClient.post<ApiResponse<AdminUserResponse>>(
      `/api/v1/admin/users/${userId}/ban`,
      data
    );
  },

  /**
   * Unban user (admin only)
   * POST /api/v1/admin/users/:userId/unban
   * Note: Backend may use activate endpoint, adjust if needed
   */
  async unbanUser(userId: string): Promise<ApiResponse<AdminUserResponse>> {
    // TODO: Verify actual backend endpoint for unban
    return apiClient.post<ApiResponse<AdminUserResponse>>(
      `/api/v1/admin/users/${userId}/unban`
    );
  },

  /**
   * Delete user (admin only)
   * DELETE /api/v1/admin/users/:userId
   */
  async deleteUser(userId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(
      ADMIN_ENDPOINTS.DELETE_USER(userId)
    );
  },
};

export default adminUsersApi;
