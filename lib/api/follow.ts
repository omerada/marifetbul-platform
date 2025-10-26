/**
 * ================================================
 * FOLLOW API MODULE
 * ================================================
 * API client functions for user follow/unfollow functionality
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint 4: API Standardization
 * @since 2025-10-26
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import { validateResponse, UserProfileSchema } from './validators';
import type { UserProfile } from './validators';
import type { User, FollowStatusResponse } from '@/types/core/base';
import type { PaginationMeta } from '@/types';

/**
 * API Response wrapper
 */
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

/**
 * Page response type for pagination
 */
interface PageResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Toggle follow/unfollow for a user
 * @param userId - ID of the user to follow/unfollow
 * @returns Follow status after toggle
 */
export const toggleFollow = async (
  userId: string
): Promise<FollowStatusResponse> => {
  const response = await apiClient.post<ApiResponse<FollowStatusResponse>>(
    `/users/${userId}/follow`
  );
  return response.data;
};

/**
 * Get followers list for a user
 * @param userId - ID of the user
 * @param page - Page number (0-based)
 * @param size - Page size
 * @returns Paginated list of followers
 * @throws {NotFoundError} User not found
 * @throws {ValidationError} Invalid response format
 */
export const getFollowers = async (
  userId: string,
  page = 0,
  size = 20
): Promise<PageResponse<UserProfile>> => {
  const url = `/users/${userId}/followers?page=${page}&size=${size}&sortBy=createdAt&sortDir=DESC`;
  const response = await apiClient.get<ApiResponse<PageResponse<User>>>(url);

  // Validate each user in the response
  const validatedUsers = response.data.data.map((user) =>
    validateResponse(UserProfileSchema, user, 'User')
  );

  return {
    data: validatedUsers,
    pagination: response.data.pagination,
  };
};

/**
 * Get following list for a user
 * @param userId - ID of the user
 * @param page - Page number (0-based)
 * @param size - Page size
 * @returns Paginated list of users being followed
 * @throws {NotFoundError} User not found
 * @throws {ValidationError} Invalid response format
 */
export const getFollowing = async (
  userId: string,
  page = 0,
  size = 20
): Promise<PageResponse<UserProfile>> => {
  const url = `/users/${userId}/following?page=${page}&size=${size}&sortBy=createdAt&sortDir=DESC`;
  const response = await apiClient.get<ApiResponse<PageResponse<User>>>(url);

  // Validate each user in the response
  const validatedUsers = response.data.data.map((user) =>
    validateResponse(UserProfileSchema, user, 'User')
  );

  return {
    data: validatedUsers,
    pagination: response.data.pagination,
  };
};

/**
 * Get follow status for a user
 * @param userId - ID of the user
 * @returns Follow status and statistics
 */
export const getFollowStatus = async (
  userId: string
): Promise<FollowStatusResponse> => {
  const response = await apiClient.get<ApiResponse<FollowStatusResponse>>(
    `/users/${userId}/follow-status`
  );
  return response.data;
};

/**
 * Follow API module
 */
export const followApi = {
  toggleFollow,
  getFollowers,
  getFollowing,
  getFollowStatus,
};
