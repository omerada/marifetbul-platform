'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import logger from '@/lib/infrastructure/monitoring/logger';
import { unifiedAuthService } from '@/lib/core/auth/unifiedAuthService';
import { authSelectors } from '@/lib/core/store/domains/auth/unifiedAuthStore';

export interface EmailVerificationState {
  isVerified: boolean;
  isLoading: boolean;
  shouldShowBanner: boolean;
  userEmail?: string;
}

export interface EmailVerificationActions {
  resendVerification: () => Promise<void>;
  dismissBanner: () => void;
  checkVerificationStatus: () => Promise<void>;
}

export interface UseEmailVerificationResult
  extends EmailVerificationState,
    EmailVerificationActions {
  isResending: boolean;
}

/**
 * Custom hook for managing email verification state and actions
 *
 * Features:
 * - Check user's verification status
 * - Control banner visibility
 * - Resend verification email
 * - Auto-refresh verification status
 * - LocalStorage persistence for banner dismissal
 *
 * @example
 * ```tsx
 * const {
 *   isVerified,
 *   shouldShowBanner,
 *   userEmail,
 *   resendVerification,
 *   dismissBanner
 * } = useEmailVerification();
 *
 * {shouldShowBanner && !isVerified && (
 *   <EmailVerificationBanner
 *     userEmail={userEmail}
 *     onDismiss={dismissBanner}
 *   />
 * )}
 * ```
 */
export function useEmailVerification(): UseEmailVerificationResult {
  const user = authSelectors.useUser();
  const authLoading = authSelectors.useIsLoading();

  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [shouldShowBanner, setShouldShowBanner] = useState<boolean>(true);

  // LocalStorage key for dismissed banner
  const BANNER_DISMISSED_KEY = 'email-verification-banner-dismissed';

  /**
   * Check if user has dismissed the banner in this session
   */
  const checkBannerDismissed = useCallback(() => {
    if (typeof window === 'undefined') return false;

    const dismissed = localStorage.getItem(BANNER_DISMISSED_KEY);
    return dismissed === 'true';
  }, []);

  /**
   * Check user's email verification status
   */
  const checkVerificationStatus = useCallback(async () => {
    if (!user) {
      setIsVerified(false);
      setIsLoading(false);
      setShouldShowBanner(false);
      return;
    }

    try {
      setIsLoading(true);

      // Check if user is verified (verificationStatus === 'verified')
      const verified = user.verificationStatus === 'verified';
      setIsVerified(verified);

      // Only show banner if:
      // 1. User is not verified
      // 2. User hasn't dismissed it in this session
      const dismissed = checkBannerDismissed();
      setShouldShowBanner(!verified && !dismissed);
    } catch (error) {
      logger.error(
        '[useEmailVerification] Error checking verification status',
        error instanceof Error ? error : new Error(String(error))
      );
      setIsVerified(false);
    } finally {
      setIsLoading(false);
    }
  }, [user, checkBannerDismissed]);

  /**
   * Resend verification email
   */
  const resendVerification = useCallback(async () => {
    if (!user?.email) {
      toast.error('E-posta adresi bulunamadı');
      return;
    }

    try {
      setIsResending(true);

      await unifiedAuthService.resendVerificationEmail({ email: user.email });

      toast.success('Doğrulama e-postası gönderildi', {
        description: 'Lütfen gelen kutunuzu kontrol edin.',
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const errorMessage =
        error.message ||
        'Doğrulama e-postası gönderilemedi. Lütfen tekrar deneyin.';
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  }, [user]);

  /**
   * Dismiss banner for this session
   */
  const dismissBanner = useCallback(() => {
    setShouldShowBanner(false);

    if (typeof window !== 'undefined') {
      localStorage.setItem(BANNER_DISMISSED_KEY, 'true');
    }
  }, []);

  /**
   * Check verification status on mount and when user changes
   */
  useEffect(() => {
    if (!authLoading) {
      checkVerificationStatus();
    }
  }, [user, authLoading, checkVerificationStatus]);

  /**
   * Clear dismissed banner flag when user becomes verified
   */
  useEffect(() => {
    if (isVerified && typeof window !== 'undefined') {
      localStorage.removeItem(BANNER_DISMISSED_KEY);
    }
  }, [isVerified]);

  return {
    // State
    isVerified,
    isLoading: isLoading || authLoading,
    shouldShowBanner,
    userEmail: user?.email,
    isResending,

    // Actions
    resendVerification,
    dismissBanner,
    checkVerificationStatus,
  };
}
