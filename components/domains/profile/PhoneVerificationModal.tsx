'use client';

/**
 * Phone Verification Modal Component
 * Sprint 1 - Story 1.3: Phone Verification (OTP)
 *
 * Complete phone verification flow with OTP input and resend functionality
 *
 * @version 1.0.0
 * @since 2025-11-25
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  Smartphone,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  RefreshCw,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui';
import { OTPInput } from '@/components/shared/OTPInput';
import { cn } from '@/lib/utils';
import logger from '@/lib/infrastructure/monitoring/logger';

export interface PhoneVerificationModalProps {
  /** Modal open state */
  open: boolean;

  /** Close handler */
  onClose: () => void;

  /** Phone number to verify */
  phoneNumber?: string;

  /** Success callback */
  onSuccess?: () => void;

  /** Custom className */
  className?: string;
}

type VerificationStep = 'phone-input' | 'otp-verify' | 'success' | 'error';

/**
 * Format phone number for display (mask middle digits)
 */
function formatPhoneNumber(phone: string): string {
  if (!phone) return '';

  // Turkish format: 0532 123 45 67 → 0532 *** ** 67
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 4)} *** ** ${cleaned.slice(-2)}`;
  }

  // Default masking
  if (cleaned.length > 6) {
    return `${cleaned.slice(0, 3)} *** ${cleaned.slice(-2)}`;
  }

  return phone;
}

/**
 * Phone Verification Modal Component
 */
export function PhoneVerificationModal({
  open,
  onClose,
  phoneNumber = '',
  onSuccess,
  className = '',
}: PhoneVerificationModalProps) {
  const [step, setStep] = useState<VerificationStep>('phone-input');
  const [phone, setPhone] = useState(phoneNumber);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);

  /**
   * Reset state when modal closes
   */
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setStep('phone-input');
        setOtp('');
        setError('');
        setResendCountdown(0);
        setAttemptCount(0);
      }, 300);
    }
  }, [open]);

  /**
   * Countdown timer for resend button
   */
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  /**
   * Send OTP code to phone
   */
  const sendOTP = useCallback(async () => {
    if (!phone || phone.length < 10) {
      setError('Geçerli bir telefon numarası giriniz');
      return;
    }

    if (attemptCount >= 3) {
      setError(
        'Maksimum gönderim sayısına ulaştınız. Lütfen daha sonra tekrar deneyin.'
      );
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // TODO: Replace with actual API call
      // await phoneVerificationService.sendOTP({ phoneNumber: phone });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      logger.info('[PhoneVerification] OTP sent successfully', { phone });

      toast.success('Doğrulama kodu gönderildi', {
        description: `${formatPhoneNumber(phone)} numarasına 6 haneli kod gönderildi.`,
      });

      setStep('otp-verify');
      setResendCountdown(60); // 60 seconds cooldown
      setAttemptCount((prev) => prev + 1);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'OTP gönderilemedi';
      setError(errorMsg);
      toast.error('Kod gönderilemedi', {
        description: errorMsg,
      });

      logger.error(
        '[PhoneVerification] Failed to send OTP',
        err instanceof Error ? err : undefined
      );
    } finally {
      setIsLoading(false);
    }
  }, [phone, attemptCount]);

  /**
   * Verify OTP code
   */
  const verifyOTP = useCallback(
    async (code: string) => {
      if (code.length !== 6) return;

      try {
        setIsLoading(true);
        setError('');

        // TODO: Replace with actual API call
        // await phoneVerificationService.verifyOTP({ phoneNumber: phone, code });

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Simulate validation (in production, backend validates)
        if (code === '123456') {
          logger.info('[PhoneVerification] OTP verified successfully', {
            phone,
          });

          toast.success('Telefon doğrulandı!', {
            description: 'Telefon numaranız başarıyla doğrulandı.',
          });

          setStep('success');

          // Close after success animation
          setTimeout(() => {
            onSuccess?.();
            onClose();
          }, 2000);
        } else {
          throw new Error('Geçersiz doğrulama kodu');
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Doğrulama başarısız';
        setError(errorMsg);
        setOtp('');

        toast.error('Doğrulama başarısız', {
          description: errorMsg,
        });

        logger.error(
          '[PhoneVerification] OTP verification failed',
          err instanceof Error ? err : undefined
        );
      } finally {
        setIsLoading(false);
      }
    },
    [phone, onSuccess, onClose]
  );

  /**
   * Handle OTP complete
   */
  const handleOTPComplete = useCallback(
    (code: string) => {
      verifyOTP(code);
    },
    [verifyOTP]
  );

  /**
   * Go back to phone input
   */
  const handleBack = () => {
    setStep('phone-input');
    setOtp('');
    setError('');
  };

  /**
   * Render step content
   */
  const renderStepContent = () => {
    switch (step) {
      case 'phone-input':
        return (
          <motion.div
            key="phone-input"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <Smartphone className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                Telefon Numaranızı Doğrulayın
              </h3>
              <p className="text-sm text-gray-600">
                Hesabınızı güvende tutmak ve önemli bildirimleri almak için
                telefon numaranızı doğrulayın.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Telefon Numarası
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setError('');
                    }}
                    placeholder="0532 123 45 67"
                    className={cn(
                      'block w-full rounded-lg border py-3 pr-3 pl-10 text-sm',
                      'focus:ring-2 focus:ring-offset-2 focus:outline-none',
                      error
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    )}
                    disabled={isLoading}
                    autoComplete="tel"
                  />
                </div>
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                <p className="mt-2 text-xs text-gray-500">
                  Format: 05XX XXX XX XX (Türkiye)
                </p>
              </div>

              <div className="rounded-lg bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium">Güvenlik Bilgisi</p>
                    <p className="mt-1 text-blue-700">
                      6 haneli doğrulama kodunu SMS ile göndereceğiz. Kod 5
                      dakika geçerli olacak.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={sendOTP}
                loading={isLoading}
                disabled={!phone || phone.length < 10}
                className="w-full"
                size="lg"
              >
                Kod Gönder
              </Button>
            </div>
          </motion.div>
        );

      case 'otp-verify':
        return (
          <motion.div
            key="otp-verify"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4" />
              Geri Dön
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Phone className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                Doğrulama Kodu Giriniz
              </h3>
              <p className="text-sm text-gray-600">
                <span className="font-medium">{formatPhoneNumber(phone)}</span>{' '}
                numarasına gönderilen 6 haneli kodu giriniz.
              </p>
            </div>

            <div className="space-y-4">
              <OTPInput
                length={6}
                value={otp}
                onChange={setOtp}
                onComplete={handleOTPComplete}
                disabled={isLoading}
                error={!!error}
                loading={isLoading}
                type="numeric"
                autoFocus
              />

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-center">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              )}

              <div className="flex flex-col items-center gap-2">
                {resendCountdown > 0 ? (
                  <p className="text-sm text-gray-600">
                    Yeniden gönder:{' '}
                    <span className="font-semibold">{resendCountdown}s</span>
                  </p>
                ) : (
                  <Button
                    onClick={sendOTP}
                    variant="ghost"
                    size="sm"
                    disabled={attemptCount >= 3}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Kodu Tekrar Gönder
                  </Button>
                )}

                {attemptCount >= 3 && (
                  <p className="text-xs text-red-600">
                    Maksimum deneme sayısına ulaştınız
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        );

      case 'success':
        return (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100"
            >
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </motion.div>
            <h3 className="mb-2 text-2xl font-bold text-gray-900">
              Başarılı! 🎉
            </h3>
            <p className="text-gray-600">
              Telefon numaranız başarıyla doğrulandı.
            </p>
          </motion.div>
        );

      case 'error':
        return (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-8 text-center"
          >
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h3 className="mb-2 text-2xl font-bold text-gray-900">
              Doğrulama Başarısız
            </h3>
            <p className="mb-6 text-gray-600">
              Bir hata oluştu. Lütfen tekrar deneyin.
            </p>
            <Button onClick={handleBack} variant="outline">
              Tekrar Dene
            </Button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={cn('sm:max-w-md', className)}>
        <DialogHeader>
          <DialogTitle className="sr-only">Telefon Doğrulama</DialogTitle>
          <DialogDescription className="sr-only">
            Telefon numaranızı doğrulamak için SMS kodu girin
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

export default PhoneVerificationModal;
