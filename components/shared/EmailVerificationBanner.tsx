'use client';

import { useState } from 'react';
import { Mail, X, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui';
import { unifiedAuthService } from '@/lib/core/auth/unifiedAuthService';

interface EmailVerificationBannerProps {
  userEmail?: string;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Email Verification Banner Component
 *
 * Displays a prominent banner prompting unverified users to verify their email.
 * Includes a "Resend Verification Email" button with loading state.
 *
 * Features:
 * - Auto-dismissible with X button
 * - Resend verification email functionality
 * - Loading states and toast notifications
 * - Responsive design
 * - Accessibility features
 *
 * @example
 * ```tsx
 * <EmailVerificationBanner
 *   userEmail="user@example.com"
 *   onDismiss={() => setShowBanner(false)}
 * />
 * ```
 */
export function EmailVerificationBanner({
  userEmail,
  onDismiss,
  className = '',
}: EmailVerificationBannerProps) {
  const [isResending, setIsResending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleResendVerification = async () => {
    if (!userEmail) {
      toast.error('E-posta adresi bulunamadı');
      return;
    }

    try {
      setIsResending(true);

      await unifiedAuthService.resendVerificationEmail({ email: userEmail });

      setIsSuccess(true);
      toast.success('Doğrulama e-postası gönderildi', {
        description: 'Lütfen gelen kutunuzu kontrol edin.',
      });

      // Auto-dismiss after successful send
      setTimeout(() => {
        onDismiss?.();
      }, 5000);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const errorMessage =
        error.message ||
        'Doğrulama e-postası gönderilemedi. Lütfen tekrar deneyin.';
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  if (isSuccess) {
    return (
      <div
        className={`relative rounded-lg border border-green-200 bg-green-50 p-4 shadow-sm ${className}`}
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="rounded-full bg-green-100 p-1.5">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-green-900">
              E-posta Gönderildi!
            </h3>
            <p className="mt-1 text-sm text-green-700">
              Doğrulama e-postası{' '}
              <span className="font-medium">{userEmail}</span> adresine
              gönderildi. Lütfen gelen kutunuzu kontrol edin.
            </p>
          </div>

          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="flex-shrink-0 rounded text-green-600 hover:text-green-800 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none"
              aria-label="Kapat"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-lg border border-yellow-200 bg-yellow-50 p-4 shadow-sm ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="rounded-full bg-yellow-100 p-1.5">
            <Mail className="h-5 w-5 text-yellow-600" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-yellow-900">
            E-posta Adresinizi Doğrulayın
          </h3>
          <p className="mt-1 text-sm text-yellow-700">
            {userEmail ? (
              <>
                <span className="font-medium">{userEmail}</span> adresine bir
                doğrulama e-postası gönderdik. Tüm özelliklere erişmek için
                lütfen e-postanızı doğrulayın.
              </>
            ) : (
              'Tüm özelliklere erişmek için lütfen e-posta adresinizi doğrulayın.'
            )}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              onClick={handleResendVerification}
              loading={isResending}
              size="sm"
              variant="outline"
              className="border-yellow-300 bg-white text-yellow-900 hover:bg-yellow-100"
            >
              <Mail className="mr-1.5 h-3.5 w-3.5" />
              Tekrar Gönder
            </Button>

            <p className="text-xs text-yellow-600">
              E-postayı görmüyorsanız spam/önemsiz klasörünü kontrol edin.
            </p>
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="flex-shrink-0 rounded text-yellow-600 hover:text-yellow-800 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:outline-none"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
