/**
 * Phone Verification API Service
 * Sprint 1 - Story 1.2: Phone Verification SMS Integration
 *
 * API client for phone verification endpoints
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-12-02
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import logger from '@/lib/infrastructure/monitoring/logger';

export interface SendCodeRequest {
  phoneNumber: string;
}

export interface SendCodeResponse {
  success: boolean;
  message: string;
  phoneNumber: string; // Masked
  expiresIn: number; // Seconds
}

export interface VerifyCodeRequest {
  phoneNumber: string;
  code: string;
}

export interface VerifyCodeResponse {
  success: boolean;
  verified: boolean;
  message: string;
}

export interface ResendCooldownResponse {
  canResend: boolean;
  cooldownSeconds: number;
}

/**
 * Phone Verification Service
 */
export const phoneVerificationService = {
  /**
   * Send OTP code to phone number
   */
  async sendOTP(request: SendCodeRequest): Promise<SendCodeResponse> {
    try {
      const response = await apiClient.post<SendCodeResponse>(
        '/api/v1/auth/phone/send-code',
        request
      );

      logger.info('[PhoneVerification] OTP sent successfully');

      return response;
    } catch (error) {
      logger.error(
        '[PhoneVerification] Failed to send OTP',
        error instanceof Error ? error : undefined
      );
      throw error;
    }
  },

  /**
   * Verify OTP code
   */
  async verifyOTP(request: VerifyCodeRequest): Promise<VerifyCodeResponse> {
    try {
      const response = await apiClient.post<VerifyCodeResponse>(
        '/api/v1/auth/phone/verify',
        request
      );

      logger.info('[PhoneVerification] OTP verified successfully');

      return response;
    } catch (error) {
      logger.error(
        '[PhoneVerification] Failed to verify OTP',
        error instanceof Error ? error : undefined
      );
      throw error;
    }
  },

  /**
   * Check resend cooldown
   */
  async checkResendCooldown(
    phoneNumber: string
  ): Promise<ResendCooldownResponse> {
    try {
      const response = await apiClient.get<ResendCooldownResponse>(
        `/api/v1/auth/phone/resend-cooldown?phoneNumber=${encodeURIComponent(phoneNumber)}`
      );

      return response;
    } catch (error) {
      logger.error(
        '[PhoneVerification] Failed to check cooldown',
        error instanceof Error ? error : undefined
      );
      throw error;
    }
  },
};
