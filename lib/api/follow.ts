/**
 * ================================================
 * FOLLOW API MODULE
 * ================================================
 * API client functions for user follow/unfollow functionality
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-10-26
 */

import { apiClient } from '@/lib/infrastructure/api/client';
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
 */
export const getFollowers = async (
  userId: string,
  page = 0,
  size = 20
): Promise<PageResponse<User>> => {
  const url = `/users/${userId}/followers?page=${page}&size=${size}&sortBy=createdAt&sortDir=DESC`;
  const response = await apiClient.get<ApiResponse<PageResponse<User>>>(url);
  return response.data;
};

/**
 * Get following list for a user
 * @param userId - ID of the user
 * @param page - Page number (0-based)
 * @param size - Page size
 * @returns Paginated list of users being followed
 */
export const getFollowing = async (
  userId: string,
  page = 0,
  size = 20
): Promise<PageResponse<User>> => {
  const url = `/users/${userId}/following?page=${page}&size=${size}&sortBy=createdAt&sortDir=DESC`;
  const response = await apiClient.get<ApiResponse<PageResponse<User>>>(url);
  return response.data;
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
