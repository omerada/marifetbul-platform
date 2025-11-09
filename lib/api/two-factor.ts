/**
 * ================================================
 * TWO-FACTOR AUTHENTICATION API
 * ================================================
 * API client for 2FA management
 *
 * Features:
 * - Enable/disable 2FA
 * - QR code generation
 * - Verification
 * - Recovery codes
 * - Backup methods
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @sprint Security & Settings Sprint - Story 1
 * @created 2025-11-09
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

/**
 * 2FA Method Types
 */
export type TwoFactorMethod = 'AUTHENTICATOR' | 'SMS' | 'EMAIL';

/**
 * 2FA Status Response
 */
export interface TwoFactorStatus {
  enabled: boolean;
  method?: TwoFactorMethod;
  backupMethodsConfigured: number;
  lastUsedAt?: string;
}

/**
 * QR Code Response
 */
export interface QRCodeResponse {
  qrCodeDataUrl: string;
  secret: string;
  manualEntryKey: string;
  issuer: string;
  accountName: string;
}

/**
 * Recovery Codes Response
 */
export interface RecoveryCodesResponse {
  codes: string[];
  generatedAt: string;
  expiresAt?: string;
  usedCount: number;
}

/**
 * 2FA Enable Request
 */
export interface Enable2FARequest {
  method: TwoFactorMethod;
  verificationCode?: string;
  phoneNumber?: string; // For SMS method
}

/**
 * 2FA Verify Request
 */
export interface Verify2FARequest {
  code: string;
  method?: TwoFactorMethod;
  trustDevice?: boolean;
}

/**
 * 2FA Disable Request
 */
export interface Disable2FARequest {
  password: string;
  verificationCode?: string;
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

const BASE_PATH = '/auth/2fa';

/**
 * Two-Factor Authentication API Client
 */
export const twoFactorApi = {
  /**
   * Get current 2FA status
   */
  async getStatus(): Promise<TwoFactorStatus> {
    try {
      logger.debug('[2FA API] Getting 2FA status');

      const response = await apiClient.get<TwoFactorStatus>(
        `${BASE_PATH}/status`
      );

      logger.info('[2FA API] 2FA status retrieved', {
        enabled: response.enabled,
        method: response.method,
      });

      return response;
    } catch (error) {
      logger.error(
        '[2FA API] Failed to get 2FA status',
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  },

  /**
   * Start 2FA setup - Get QR code
   */
  async setupAuthenticator(): Promise<QRCodeResponse> {
    try {
      logger.debug('[2FA API] Starting authenticator setup');

      const response = await apiClient.post<QRCodeResponse>(
        `${BASE_PATH}/setup/authenticator`,
        {}
      );

      logger.info('[2FA API] Authenticator setup started');

      return response;
    } catch (error) {
      logger.error(
        '[2FA API] Failed to setup authenticator',
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  },

  /**
   * Enable 2FA with verification
   */
  async enable(
    request: Enable2FARequest
  ): Promise<{ success: boolean; recoveryCodes?: string[] }> {
    try {
      logger.debug('[2FA API] Enabling 2FA', { method: request.method });

      const response = await apiClient.post<{
        success: boolean;
        recoveryCodes?: string[];
      }>(`${BASE_PATH}/enable`, request);

      logger.info('[2FA API] 2FA enabled successfully', {
        method: request.method,
      });

      return response;
    } catch (error) {
      logger.error(
        '[2FA API] Failed to enable 2FA',
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  },

  /**
   * Verify 2FA code
   */
  async verify(
    request: Verify2FARequest
  ): Promise<{ valid: boolean; message?: string }> {
    try {
      logger.debug('[2FA API] Verifying 2FA code');

      const response = await apiClient.post<{
        valid: boolean;
        message?: string;
      }>(`${BASE_PATH}/verify`, request);

      logger.info('[2FA API] 2FA verification completed', {
        valid: response.valid,
      });

      return response;
    } catch (error) {
      logger.error(
        '[2FA API] Failed to verify 2FA code',
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  },

  /**
   * Disable 2FA
   */
  async disable(request: Disable2FARequest): Promise<{ success: boolean }> {
    try {
      logger.debug('[2FA API] Disabling 2FA');

      const response = await apiClient.post<{ success: boolean }>(
        `${BASE_PATH}/disable`,
        request
      );

      logger.info('[2FA API] 2FA disabled successfully');

      return response;
    } catch (error) {
      logger.error(
        '[2FA API] Failed to disable 2FA',
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  },

  /**
   * Generate recovery codes
   */
  async generateRecoveryCodes(): Promise<RecoveryCodesResponse> {
    try {
      logger.debug('[2FA API] Generating recovery codes');

      const response = await apiClient.post<RecoveryCodesResponse>(
        `${BASE_PATH}/recovery-codes/generate`,
        {}
      );

      logger.info('[2FA API] Recovery codes generated', {
        count: response.codes.length,
      });

      return response;
    } catch (error) {
      logger.error(
        '[2FA API] Failed to generate recovery codes',
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  },

  /**
   * Get remaining recovery codes
   */
  async getRecoveryCodes(): Promise<RecoveryCodesResponse> {
    try {
      logger.debug('[2FA API] Getting recovery codes');

      const response = await apiClient.get<RecoveryCodesResponse>(
        `${BASE_PATH}/recovery-codes`
      );

      logger.info('[2FA API] Recovery codes retrieved');

      return response;
    } catch (error) {
      logger.error(
        '[2FA API] Failed to get recovery codes',
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  },

  /**
   * Setup SMS 2FA
   */
  async setupSMS(
    phoneNumber: string
  ): Promise<{ success: boolean; maskedPhone: string }> {
    try {
      logger.debug('[2FA API] Setting up SMS 2FA');

      const response = await apiClient.post<{
        success: boolean;
        maskedPhone: string;
      }>(`${BASE_PATH}/setup/sms`, { phoneNumber });

      logger.info('[2FA API] SMS 2FA setup started');

      return response;
    } catch (error) {
      logger.error(
        '[2FA API] Failed to setup SMS 2FA',
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format recovery code for display (e.g., XXXX-XXXX-XXXX)
 */
export function formatRecoveryCode(code: string): string {
  return code.replace(/(.{4})/g, '$1-').slice(0, -1);
}

/**
 * Validate 2FA code format
 */
export function isValid2FACode(code: string): boolean {
  // 6-digit code for authenticator apps
  return /^\d{6}$/.test(code);
}

/**
 * Validate recovery code format
 */
export function isValidRecoveryCode(code: string): boolean {
  // 12-character alphanumeric code
  return /^[A-Z0-9]{12}$/.test(code.replace(/-/g, ''));
}

// ============================================================================
// EXPORTS
// ============================================================================

export default twoFactorApi;
