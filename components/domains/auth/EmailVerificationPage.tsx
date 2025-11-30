'use client';

/**
 * Email Verification Page Component
 * Sprint 1 - Story 1.2: Email Verification Flow
 *
 * Standalone page for email verification with token handling
 *
 * @version 1.0.0
 * @since 2025-11-25
 */

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Mail,
  ArrowRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui';
import { Button } from '@/components/ui';
import { unifiedAuthService } from '@/lib/core/auth/unifiedAuthService';
import logger from '@/lib/infrastructure/monitoring/logger';

type VerificationState =
  | 'verifying'
  | 'success'
  | 'error'
  | 'expired'
  | 'already-verified';

export interface EmailVerificationPageProps {
  /** Override redirect URL after success */
  redirectUrl?: string;

  /** Show auto-redirect countdown */
  showCountdown?: boolean;

  /** Auto-redirect delay in seconds */
  redirectDelay?: number;
}

/**
 * Email Verification Page Component
 */
export function EmailVerificationPage({
  redirectUrl = '/dashboard',
  showCountdown = true,
  redirectDelay = 5,
}: EmailVerificationPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [state, setState] = useState<VerificationState>('verifying');
  const [countdown, setCountdown] = useState(redirectDelay);
  const [isResending, setIsResending] = useState(false);

  /**
   * Verify email with token
   */
  const verifyEmail = async (verificationToken: string) => {
    try {
      setState('verifying');

      await unifiedAuthService.verifyEmail({ token: verificationToken });

      setState('success');
      toast.success('E-posta başarıyla doğrulandı!', {
        description: 'Artık tüm özelliklere erişebilirsiniz.',
      });

      logger.info('[EmailVerificationPage] Email verified successfully');
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));

      logger.error('[EmailVerificationPage] Email verification failed', error);

      // Determine error type
      if (
        error.message.includes('expired') ||
        error.message.includes('süresi doldu')
      ) {
        setState('expired');
      } else if (
        error.message.includes('already') ||
        error.message.includes('zaten')
      ) {
        setState('already-verified');
      } else {
        setState('error');
      }

      toast.error('E-posta doğrulanamadı', {
        description: error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.',
      });
    }
  };

  /**
   * Resend verification email
   */
  const handleResendVerification = async () => {
    try {
      setIsResending(true);

      // Resend verification email (will use current user's email from backend)
      await unifiedAuthService.resendVerificationEmail({ email: '' });

      toast.success('Yeni doğrulama e-postası gönderildi', {
        description: 'Lütfen gelen kutunuzu kontrol edin.',
      });

      setState('verifying');
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      toast.error('E-posta gönderilemedi', {
        description: error.message || 'Lütfen daha sonra tekrar deneyin.',
      });
    } finally {
      setIsResending(false);
    }
  };

  /**
   * Verify on mount
   */
  useEffect(() => {
    if (!token) {
      setState('error');
      toast.error("Doğrulama token'ı bulunamadı");
      return;
    }

    verifyEmail(token);
  }, [token]);

  /**
   * Auto-redirect countdown
   */
  useEffect(() => {
    if (state === 'success' && showCountdown) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push(redirectUrl);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [state, showCountdown, redirectUrl, router]);

  /**
   * Render content based on state
   */
  const renderContent = () => {
    switch (state) {
      case 'verifying':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              E-posta Doğrulanıyor
            </h1>
            <p className="text-gray-600">
              Lütfen bekleyin, e-posta adresiniz doğrulanıyor...
            </p>
          </motion.div>
        );

      case 'success':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              E-posta Doğrulandı! 🎉
            </h1>
            <p className="mb-6 text-gray-600">
              E-posta adresiniz başarıyla doğrulandı. Artık tüm özelliklere
              erişebilirsiniz.
            </p>

            {showCountdown && countdown > 0 && (
              <p className="mb-4 text-sm text-gray-500">
                {countdown} saniye içinde yönlendirileceksiniz...
              </p>
            )}

            <Button
              onClick={() => router.push(redirectUrl)}
              size="lg"
              className="min-w-[200px]"
            >
              Dashboard&apos;a Git
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        );

      case 'already-verified':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
              <CheckCircle2 className="h-10 w-10 text-blue-600" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              Zaten Doğrulanmış
            </h1>
            <p className="mb-6 text-gray-600">
              E-posta adresiniz zaten doğrulanmış durumda.
            </p>

            <Button
              onClick={() => router.push(redirectUrl)}
              size="lg"
              variant="outline"
              className="min-w-[200px]"
            >
              Dashboard&apos;a Git
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        );

      case 'expired':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
              <Mail className="h-10 w-10 text-yellow-600" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              Token Süresi Doldu
            </h1>
            <p className="mb-6 text-gray-600">
              Doğrulama bağlantısının süresi dolmuş. Yeni bir doğrulama
              e-postası göndermek için aşağıdaki butona tıklayın.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                onClick={handleResendVerification}
                loading={isResending}
                size="lg"
                className="min-w-[200px]"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Yeni E-posta Gönder
              </Button>

              <Button
                onClick={() => router.push('/dashboard')}
                size="lg"
                variant="outline"
                className="min-w-[200px]"
              >
                Dashboard&apos;a Dön
              </Button>
            </div>
          </motion.div>
        );

      case 'error':
      default:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              Doğrulama Başarısız
            </h1>
            <p className="mb-6 text-gray-600">
              E-posta doğrulaması sırasında bir hata oluştu. Lütfen tekrar
              deneyin veya yeni bir doğrulama e-postası isteyin.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                onClick={handleResendVerification}
                loading={isResending}
                size="lg"
                variant="outline"
                className="min-w-[200px]"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Tekrar Gönder
              </Button>

              <Button
                onClick={() => router.push('/support')}
                size="lg"
                variant="ghost"
                className="min-w-[200px]"
              >
                Destek Al
              </Button>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md p-8">{renderContent()}</Card>
    </div>
  );
}

export default EmailVerificationPage;
