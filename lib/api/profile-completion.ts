/**
 * Profile Completion API Client
 * Sprint 1 - Story 1.1: Profile Completion System
 *
 * API functions for profile completion endpoints
 *
 * @version 1.0.0
 * @since 2025-11-25
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import type { ProfileCompletionData } from '@/types/profile-completion';
import logger from '@/lib/infrastructure/monitoring/logger';

// API Response type (matches backend ApiResponse<T>)
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp?: string;
}

/**
 * Get current user's profile completion status
 */
export async function getMyProfileCompletion(): Promise<ProfileCompletionData> {
  try {
    logger.debug('[ProfileCompletionAPI] Fetching my profile completion');

    const response = await apiClient.get<ApiResponse<ProfileCompletionData>>(
      '/users/me/profile-completion'
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch profile completion');
    }

    logger.debug('[ProfileCompletionAPI] Profile completion retrieved', {
      percentage: response.data.completionPercentage,
    });

    return response.data;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(
      '[ProfileCompletionAPI] Failed to fetch profile completion', err instanceof Error ? err : new Error(String(err)));
    throw err;
  }
}

/**
 * Get another user's profile completion (Admin only)
 */
export async function getUserProfileCompletion(
  userId: string
): Promise<ProfileCompletionData> {
  try {
    logger.debug('[ProfileCompletionAPI] Fetching user profile completion', {
      userId,
    });

    const response = await apiClient.get<ApiResponse<ProfileCompletionData>>(
      `/users/${userId}/profile-completion`
    );

    if (!response.success || !response.data) {
      throw new Error(
        response.message || 'Failed to fetch user profile completion'
      );
    }

    return response.data;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(
      '[ProfileCompletionAPI] Failed to fetch user profile completion', err instanceof Error ? err : new Error(String(err)));
    throw err;
  }
}
