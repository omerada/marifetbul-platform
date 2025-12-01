/**
 * ================================================
 * ACCOUNT DELETION API SERVICE
 * ================================================
 * Sprint 1 - Story 1.1: GDPR Compliance - Account Deletion Flow
 *
 * Handles account deletion requests with verification.
 *
 * Flow:
 * 1. User initiates deletion (password required)
 * 2. Verification code sent to email
 * 3. User verifies within 7 days
 * 4. Account deleted/anonymized
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-11-26
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import { logger } from '@/lib/infrastructure/monitoring/logger';

// ==================== Types ====================

export interface InitiateDeletionRequest {
  password: string;
  reason?: string;
}

export interface InitiateDeletionResponse {
  success: boolean;
  message: string;
  requestId: string;
  expiresAt: string;
}

export interface VerifyDeletionRequest {
  verificationCode: string;
}

export interface VerifyDeletionResponse {
  success: boolean;
  message: string;
}

export interface DeletionStatus {
  hasPendingRequest: boolean;
  requestedAt?: string;
  expiresAt?: string;
  isVerified?: boolean;
  remainingHours?: number;
}

// ==================== API Functions ====================

/**
 * Initiate account deletion process
 * Sends verification code to user's email
 *
 * POST /api/v1/users/me/delete
 *
 * @param request - Deletion request with password and optional reason
 * @returns Deletion request details
 *
 * @throws {Error} If password is invalid or request fails
 */
export async function initiateAccountDeletion(
  request: InitiateDeletionRequest
): Promise<InitiateDeletionResponse> {
  logger.info('[AccountDeletion] Initiating account deletion');

  try {
    const response = await apiClient.post<InitiateDeletionResponse>(
      '/users/me/delete',
      request
    );

    logger.info('[AccountDeletion] Deletion initiated successfully');
    return response.data;
  } catch (error) {
    logger.error(
      '[AccountDeletion] Failed to initiate deletion',
      error as Error,
      { api: 'AccountDeletion', operation: 'initiate' }
    );
    throw error;
  }
}

/**
 * Verify account deletion with code
 * Code sent to user's email
 *
 * POST /api/v1/users/me/delete/verify
 *
 * @param request - Verification code
 * @returns Verification response
 *
 * @throws {Error} If code is invalid or expired
 */
export async function verifyAccountDeletion(
  request: VerifyDeletionRequest
): Promise<VerifyDeletionResponse> {
  logger.info('[AccountDeletion] Verifying deletion code');

  try {
    const response = await apiClient.post<VerifyDeletionResponse>(
      '/users/me/delete/verify',
      request
    );

    logger.info('[AccountDeletion] Deletion verified successfully');
    return response.data;
  } catch (error) {
    logger.error(
      '[AccountDeletion] Failed to verify deletion',
      error as Error,
      { api: 'AccountDeletion', operation: 'verify' }
    );
    throw error;
  }
}

/**
 * Cancel pending account deletion
 * Can only cancel PENDING (unverified) requests
 *
 * DELETE /api/v1/users/me/delete
 *
 * @returns Cancellation confirmation
 *
 * @throws {Error} If no active request or cancellation fails
 */
export async function cancelAccountDeletion(): Promise<{ success: boolean }> {
  logger.info('[AccountDeletion] Cancelling deletion request');

  try {
    const response = await apiClient.delete<{ success: boolean }>(
      '/users/me/delete'
    );

    logger.info('[AccountDeletion] Deletion cancelled successfully');
    return response.data;
  } catch (error) {
    logger.error(
      '[AccountDeletion] Failed to cancel deletion',
      error as Error,
      { api: 'AccountDeletion', operation: 'cancel' }
    );
    throw error;
  }
}

/**
 * Get account deletion status
 * Checks if user has pending deletion request
 *
 * GET /api/v1/users/me/delete/status
 *
 * @returns Deletion status
 */
export async function getDeletionStatus(): Promise<DeletionStatus> {
  logger.debug('[AccountDeletion] Checking deletion status');

  try {
    const response = await apiClient.get<DeletionStatus>(
      '/users/me/delete/status'
    );

    return response.data;
  } catch (error) {
    logger.error(
      '[AccountDeletion] Failed to get deletion status',
      error as Error,
      { api: 'AccountDeletion', operation: 'getStatus' }
    );
    // Return safe default instead of throwing
    return {
      hasPendingRequest: false,
    };
  }
}
