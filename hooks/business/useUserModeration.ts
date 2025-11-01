/**
 * ================================================
 * USE USER MODERATION HOOK
 * ================================================
 * React hook for user warning and suspension operations
 *
 * Features:
 * - Issue warnings (auto-escalation)
 * - Suspend/unsuspend users
 * - View moderation history
 * - Handle appeals
 *
 * Sprint: Moderator Reporting & Actions
 * @version 1.0.0
 * @author MarifetBul Development Team
 * @created December 2024
 */

import { useState, useCallback } from 'react';
import {
  issueWarning,
  getUserWarnings,
  getActiveUserWarnings,
  revokeWarning,
  suspendUser,
  getUserSuspensions,
  getUserSuspensionStatus,
  liftSuspension,
  decideSuspensionAppeal,
  getUserModerationSummary,
  type UserWarning,
  type UserSuspension,
} from '@/lib/api/moderation';
import { logger } from '@/lib/shared/utils/logger';
import { useToast } from '@/hooks/core/useToast';

/**
 * Hook result interface
 */
export interface UseUserModerationResult {
  // State
  isLoading: boolean;
  error: string | null;

  // Warning operations
  issueWarningToUser: (
    params: IssueWarningParams
  ) => Promise<UserWarning | null>;
  fetchUserWarnings: (userId: string, page?: number) => Promise<UserWarning[]>;
  fetchActiveWarnings: (userId: string) => Promise<UserWarning[]>;
  revokeUserWarning: (warningId: string, reason: string) => Promise<boolean>;

  // Suspension operations
  suspendUserAccount: (
    params: SuspendUserParams
  ) => Promise<UserSuspension | null>;
  fetchUserSuspensions: (
    userId: string,
    page?: number
  ) => Promise<UserSuspension[]>;
  checkSuspensionStatus: (userId: string) => Promise<UserSuspension | null>;
  unsuspendUser: (suspensionId: string, reason: string) => Promise<boolean>;

  // Appeal operations
  decideAppeal: (
    suspensionId: string,
    decision: 'APPROVED' | 'REJECTED' | 'REDUCED',
    reason: string
  ) => Promise<boolean>;

  // Summary
  fetchModerationSummary: (userId: string) => Promise<string | null>;
}

/**
 * Issue warning parameters
 */
export interface IssueWarningParams {
  userId: string;
  reason: string;
  details: string;
  relatedContentRef?: string;
}

/**
 * Suspend user parameters
 */
export interface SuspendUserParams {
  userId: string;
  suspensionType:
    | 'TEMPORARY'
    | 'PERMANENT'
    | 'SELLER_RESTRICTED'
    | 'BUYER_RESTRICTED';
  reason: string;
  details: string;
  durationDays?: number;
  internalNotes?: string;
}

/**
 * User moderation hook
 */
export function useUserModeration(): UseUserModerationResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: errorToast } = useToast();

  // ========================================================================
  // WARNING OPERATIONS
  // ========================================================================

  /**
   * Issue warning to user
   */
  const issueWarningToUser = useCallback(
    async (params: IssueWarningParams): Promise<UserWarning | null> => {
      setIsLoading(true);
      setError(null);

      try {
        logger.debug('Issuing warning to user', { userId: params.userId });
        const warning = await issueWarning(params);

        success(
          'Uyarı verildi',
          `${warning.warningLevel} seviyesinde uyarı başarıyla verildi`
        );

        logger.info('Warning issued successfully', {
          warningId: warning.id,
          level: warning.warningLevel,
        });

        return warning;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Uyarı verilemedi';
        logger.error('Failed to issue warning', { error: err });
        setError(message);
        errorToast('Hata', message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [success, errorToast]
  );

  /**
   * Fetch user warnings
   */
  const fetchUserWarnings = useCallback(
    async (userId: string, page = 0): Promise<UserWarning[]> => {
      setIsLoading(true);
      setError(null);

      try {
        logger.debug('Fetching user warnings', { userId, page });
        const response = await getUserWarnings(userId, page);
        return response.content;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Uyarılar getirilemedi';
        logger.error('Failed to fetch user warnings', { error: err });
        setError(message);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Fetch active warnings
   */
  const fetchActiveWarnings = useCallback(
    async (userId: string): Promise<UserWarning[]> => {
      setIsLoading(true);
      setError(null);

      try {
        logger.debug('Fetching active warnings', { userId });
        const warnings = await getActiveUserWarnings(userId);
        return warnings;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Aktif uyarılar getirilemedi';
        logger.error('Failed to fetch active warnings', { error: err });
        setError(message);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Revoke warning
   */
  const revokeUserWarning = useCallback(
    async (warningId: string, reason: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        logger.debug('Revoking warning', { warningId });
        await revokeWarning(warningId, reason);

        success('Uyarı iptal edildi', 'Uyarı başarıyla iptal edildi');

        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Uyarı iptal edilemedi';
        logger.error('Failed to revoke warning', { error: err });
        setError(message);
        errorToast('Hata', message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [success, errorToast]
  );

  // ========================================================================
  // SUSPENSION OPERATIONS
  // ========================================================================

  /**
   * Suspend user account
   */
  const suspendUserAccount = useCallback(
    async (params: SuspendUserParams): Promise<UserSuspension | null> => {
      setIsLoading(true);
      setError(null);

      try {
        logger.debug('Suspending user', { userId: params.userId });
        const suspension = await suspendUser(params);

        success(
          'Hesap askıya alındı',
          `${suspension.suspensionTypeDescription} uygulandı`
        );

        logger.info('User suspended successfully', {
          suspensionId: suspension.id,
          type: suspension.suspensionType,
        });

        return suspension;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Hesap askıya alınamadı';
        logger.error('Failed to suspend user', { error: err });
        setError(message);
        errorToast('Hata', message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [success, errorToast]
  );

  /**
   * Fetch user suspensions
   */
  const fetchUserSuspensions = useCallback(
    async (userId: string, page = 0): Promise<UserSuspension[]> => {
      setIsLoading(true);
      setError(null);

      try {
        logger.debug('Fetching user suspensions', { userId, page });
        const response = await getUserSuspensions(userId, page);
        return response.content;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Askıya alma kayıtları getirilemedi';
        logger.error('Failed to fetch user suspensions', { error: err });
        setError(message);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Check suspension status
   */
  const checkSuspensionStatus = useCallback(
    async (userId: string): Promise<UserSuspension | null> => {
      setIsLoading(true);
      setError(null);

      try {
        logger.debug('Checking suspension status', { userId });
        const suspension = await getUserSuspensionStatus(userId);
        return suspension;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Durum kontrol edilemedi';
        logger.error('Failed to check suspension status', { error: err });
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Unsuspend user (lift suspension)
   */
  const unsuspendUser = useCallback(
    async (suspensionId: string, reason: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        logger.debug('Lifting suspension', { suspensionId });
        await liftSuspension(suspensionId, reason);

        success('Askı kaldırıldı', 'Hesap askısı başarıyla kaldırıldı');

        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Askı kaldırılamadı';
        logger.error('Failed to lift suspension', { error: err });
        setError(message);
        errorToast('Hata', message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [success, errorToast]
  );

  // ========================================================================
  // APPEAL OPERATIONS
  // ========================================================================

  /**
   * Decide on suspension appeal
   */
  const decideAppeal = useCallback(
    async (
      suspensionId: string,
      decision: 'APPROVED' | 'REJECTED' | 'REDUCED',
      reason: string
    ): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        logger.debug('Deciding suspension appeal', { suspensionId, decision });
        await decideSuspensionAppeal(suspensionId, decision, reason);

        const decisionText =
          decision === 'APPROVED'
            ? 'kabul edildi'
            : decision === 'REJECTED'
              ? 'reddedildi'
              : 'azaltıldı';

        success('İtiraz karara bağlandı', `İtiraz ${decisionText}`);

        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'İtiraz işlenemedi';
        logger.error('Failed to decide appeal', { error: err });
        setError(message);
        errorToast('Hata', message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [success, errorToast]
  );

  // ========================================================================
  // SUMMARY
  // ========================================================================

  /**
   * Fetch moderation summary
   */
  const fetchModerationSummary = useCallback(
    async (userId: string): Promise<string | null> => {
      setIsLoading(true);
      setError(null);

      try {
        logger.debug('Fetching moderation summary', { userId });
        const summary = await getUserModerationSummary(userId);
        return summary;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Özet getirilemedi';
        logger.error('Failed to fetch moderation summary', { error: err });
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // ========================================================================
  // RETURN
  // ========================================================================

  return {
    isLoading,
    error,

    // Warning operations
    issueWarningToUser,
    fetchUserWarnings,
    fetchActiveWarnings,
    revokeUserWarning,

    // Suspension operations
    suspendUserAccount,
    fetchUserSuspensions,
    checkSuspensionStatus,
    unsuspendUser,

    // Appeal operations
    decideAppeal,

    // Summary
    fetchModerationSummary,
  };
}

export default useUserModeration;
