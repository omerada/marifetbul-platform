/**
 * ================================================
 * TWO-FACTOR AUTHENTICATION HOOK
 * ================================================
 * Custom hook for managing 2FA functionality
 *
 * Features:
 * - 2FA status management
 * - Enable/disable 2FA
 * - QR code generation
 * - Code verification
 * - Recovery codes management
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @sprint Security & Settings Sprint - Story 1
 * @created 2025-11-09
 */

'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  twoFactorApi,
  type TwoFactorStatus,
  type QRCodeResponse,
  type RecoveryCodesResponse,
  type Enable2FARequest,
  type Verify2FARequest,
  type Disable2FARequest,
} from '@/lib/api/two-factor';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

interface UseTwoFactorReturn {
  // State
  status: TwoFactorStatus | null;
  qrCode: QRCodeResponse | null;
  recoveryCodes: RecoveryCodesResponse | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchStatus: () => Promise<void>;
  setupAuthenticator: () => Promise<void>;
  enable2FA: (request: Enable2FARequest) => Promise<boolean>;
  verify2FA: (request: Verify2FARequest) => Promise<boolean>;
  disable2FA: (request: Disable2FARequest) => Promise<boolean>;
  generateRecoveryCodes: () => Promise<void>;
  fetchRecoveryCodes: () => Promise<void>;
  clearError: () => void;
  clearQRCode: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Custom hook for two-factor authentication management
 *
 * @example
 * ```tsx
 * function TwoFactorSettings() {
 *   const { status, setupAuthenticator, enable2FA, isLoading } = useTwoFactor();
 *
 *   const handleEnable = async () => {
 *     await setupAuthenticator();
 *     await enable2FA({ method: 'AUTHENTICATOR', verificationCode: code });
 *   };
 *
 *   return <div>{status?.enabled ? 'Enabled' : 'Disabled'}</div>;
 * }
 * ```
 */
export function useTwoFactor(): UseTwoFactorReturn {
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [qrCode, setQrCode] = useState<QRCodeResponse | null>(null);
  const [recoveryCodes, setRecoveryCodes] =
    useState<RecoveryCodesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch current 2FA status
   */
  const fetchStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await twoFactorApi.getStatus();
      setStatus(data);

      logger.debug('[useTwoFactor] Status fetched', { enabled: data.enabled });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Durum yüklenemedi';
      setError(message);
      logger.error(
        '[useTwoFactor] Failed to fetch status',
        err instanceof Error ? err : new Error(String(err))
      );
      toast.error('2FA Hatası', {
        description: 'İki faktörlü doğrulama durumu alınamadı.',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Setup authenticator (get QR code)
   */
  const setupAuthenticator = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await twoFactorApi.setupAuthenticator();
      setQrCode(data);

      logger.info('[useTwoFactor] Authenticator setup initiated');
      toast.success('QR Kod Hazır', {
        description: 'Authenticator uygulamanızla QR kodu okutun.',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Setup başarısız';
      setError(message);
      logger.error(
        '[useTwoFactor] Failed to setup authenticator',
        err instanceof Error ? err : new Error(String(err))
      );
      toast.error('Kurulum Hatası', {
        description: 'QR kod oluşturulamadı. Lütfen tekrar deneyin.',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Enable 2FA with verification code
   */
  const enable2FA = useCallback(
    async (request: Enable2FARequest): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await twoFactorApi.enable(request);

        if (data.success) {
          // Refresh status
          await fetchStatus();

          // Store recovery codes if provided
          if (data.recoveryCodes && data.recoveryCodes.length > 0) {
            setRecoveryCodes({
              codes: data.recoveryCodes,
              generatedAt: new Date().toISOString(),
              usedCount: 0,
            });
          }

          logger.info('[useTwoFactor] 2FA enabled successfully');
          toast.success('2FA Etkinleştirildi', {
            description: 'İki faktörlü doğrulama başarıyla etkinleştirildi.',
            duration: 5000,
          });

          return true;
        }

        return false;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Etkinleştirme başarısız';
        setError(message);
        logger.error(
          '[useTwoFactor] Failed to enable 2FA',
          err instanceof Error ? err : new Error(String(err))
        );
        toast.error('Etkinleştirme Hatası', {
          description: 'Doğrulama kodu geçersiz veya süresi dolmuş.',
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchStatus]
  );

  /**
   * Verify 2FA code
   */
  const verify2FA = useCallback(
    async (request: Verify2FARequest): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await twoFactorApi.verify(request);

        if (data.valid) {
          logger.info('[useTwoFactor] 2FA verification successful');
          toast.success('Doğrulama Başarılı', {
            description: data.message || 'Kod doğrulandı.',
          });
          return true;
        } else {
          toast.error('Geçersiz Kod', {
            description: data.message || 'Lütfen kodu kontrol edin.',
          });
          return false;
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Doğrulama başarısız';
        setError(message);
        logger.error(
          '[useTwoFactor] Failed to verify 2FA',
          err instanceof Error ? err : new Error(String(err))
        );
        toast.error('Doğrulama Hatası', {
          description: 'Kod doğrulanamadı.',
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Disable 2FA
   */
  const disable2FA = useCallback(
    async (request: Disable2FARequest): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await twoFactorApi.disable(request);

        if (data.success) {
          await fetchStatus();
          setQrCode(null);
          setRecoveryCodes(null);

          logger.info('[useTwoFactor] 2FA disabled successfully');
          toast.success('2FA Devre Dışı', {
            description: 'İki faktörlü doğrulama kapatıldı.',
          });
          return true;
        }

        return false;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Devre dışı bırakılamadı';
        setError(message);
        logger.error(
          '[useTwoFactor] Failed to disable 2FA',
          err instanceof Error ? err : new Error(String(err))
        );
        toast.error('Hata', {
          description: 'Şifrenizi kontrol edin ve tekrar deneyin.',
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchStatus]
  );

  /**
   * Generate new recovery codes
   */
  const generateRecoveryCodes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await twoFactorApi.generateRecoveryCodes();
      setRecoveryCodes(data);

      logger.info('[useTwoFactor] Recovery codes generated');
      toast.success('Kurtarma Kodları Oluşturuldu', {
        description: 'Yeni yedek kodlarınızı güvenli bir yere kaydedin.',
        duration: 5000,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Kodlar oluşturulamadı';
      setError(message);
      logger.error(
        '[useTwoFactor] Failed to generate recovery codes',
        err instanceof Error ? err : new Error(String(err))
      );
      toast.error('Hata', {
        description: 'Kurtarma kodları oluşturulamadı.',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch existing recovery codes
   */
  const fetchRecoveryCodes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await twoFactorApi.getRecoveryCodes();
      setRecoveryCodes(data);

      logger.debug('[useTwoFactor] Recovery codes fetched');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kodlar alınamadı';
      setError(message);
      logger.error(
        '[useTwoFactor] Failed to fetch recovery codes',
        err instanceof Error ? err : new Error(String(err))
      );
      toast.error('Hata', {
        description: 'Kurtarma kodları görüntülenemedi.',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Clear QR code (after successful setup)
   */
  const clearQRCode = useCallback(() => {
    setQrCode(null);
  }, []);

  return {
    // State
    status,
    qrCode,
    recoveryCodes,
    isLoading,
    error,

    // Actions
    fetchStatus,
    setupAuthenticator,
    enable2FA,
    verify2FA,
    disable2FA,
    generateRecoveryCodes,
    fetchRecoveryCodes,
    clearError,
    clearQRCode,
  };
}

export default useTwoFactor;
