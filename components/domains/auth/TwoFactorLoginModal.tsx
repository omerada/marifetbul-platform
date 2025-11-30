/**
 * ================================================
 * TWO-FACTOR LOGIN VERIFICATION MODAL
 * ================================================
 * Modal for entering 2FA code during login
 *
 * Features:
 * - 6-digit TOTP code input
 * - Backup code option
 * - Error handling
 * - Loading states
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-11-12
 */

'use client';

import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { Alert, AlertDescription } from '@/components/ui';
import { Shield, AlertCircle, Key, X } from 'lucide-react';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface TwoFactorLoginModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Callback when verification succeeds */
  onSuccess: (code: string) => Promise<void>;
  /** Callback when modal closes */
  onClose: () => void;
  /** Loading state from parent */
  isLoading?: boolean;
  /** User email for display */
  userEmail?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * TwoFactorLoginModal Component
 *
 * @example
 * ```tsx
 * <TwoFactorLoginModal
 *   isOpen={show2FA}
 *   onSuccess={async (code) => await verify2FA(code)}
 *   onClose={() => setShow2FA(false)}
 *   userEmail="user@example.com"
 * />
 * ```
 */
export function TwoFactorLoginModal({
  isOpen,
  onSuccess,
  onClose,
  isLoading = false,
  userEmail,
}: TwoFactorLoginModalProps) {
  const [code, setCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    try {
      setError('');

      // Validate code format
      if (!useBackupCode && !/^\d{6}$/.test(code)) {
        setError('Doğrulama kodu 6 haneli olmalıdır');
        return;
      }

      if (useBackupCode && code.length !== 8) {
        setError('Yedek kod 8 karakterli olmalıdır');
        return;
      }

      logger.debug('[2FA Login] Verifying code');
      await onSuccess(code);

      // Success handled by parent
      setCode('');
      setError('');
    } catch (err) {
      logger.error(
        '[2FA Login] Verification failed',
        err instanceof Error ? err : new Error(String(err))
      );
      setError('Geçersiz doğrulama kodu. Lütfen tekrar deneyin.');
      setCode('');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (useBackupCode) {
      // Backup code: alphanumeric, max 8 chars
      setCode(value.toUpperCase().slice(0, 8));
    } else {
      // TOTP code: digits only, max 6
      const digitsOnly = value.replace(/\D/g, '').slice(0, 6);
      setCode(digitsOnly);
    }

    setError('');
  };

  const handleClose = () => {
    setCode('');
    setError('');
    setUseBackupCode(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className="animate-in fade-in zoom-in relative w-full max-w-md duration-200">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>

          <div className="p-6">
            {/* Header */}
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                İki Faktörlü Doğrulama
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {useBackupCode
                  ? 'Yedek kodunuzu girin'
                  : 'Authenticator uygulamanızdaki 6 haneli kodu girin'}
              </p>
              {userEmail && (
                <p className="mt-1 text-xs text-gray-500">{userEmail}</p>
              )}
            </div>

            {/* Code Input */}
            <div className="mb-4">
              <Input
                ref={inputRef}
                type="text"
                value={code}
                onChange={handleCodeChange}
                placeholder={useBackupCode ? 'XXXXXXXX' : '000000'}
                className={`text-center text-2xl tracking-widest ${
                  useBackupCode ? 'font-mono' : 'font-bold'
                }`}
                disabled={isLoading}
                autoComplete="one-time-code"
                inputMode={useBackupCode ? 'text' : 'numeric'}
                maxLength={useBackupCode ? 8 : 6}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    void handleSubmit();
                  }
                }}
              />
              <p className="mt-2 text-center text-xs text-gray-500">
                {useBackupCode
                  ? '8 karakterli yedek kodunuzu girin'
                  : 'Google Authenticator veya benzeri uygulama'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              onClick={() => void handleSubmit()}
              disabled={
                code.length === 0 ||
                isLoading ||
                (!useBackupCode && code.length !== 6) ||
                (useBackupCode && code.length !== 8)
              }
              loading={isLoading}
              fullWidth
              size="lg"
              className="mb-4"
            >
              Doğrula
            </Button>

            {/* Backup Code Toggle */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setUseBackupCode(!useBackupCode);
                  setCode('');
                  setError('');
                  if (inputRef.current) {
                    inputRef.current.focus();
                  }
                }}
                disabled={isLoading}
                className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 disabled:opacity-50"
              >
                <Key className="h-4 w-4" />
                {useBackupCode
                  ? 'Authenticator Kodu Kullan'
                  : 'Yedek Kod Kullan'}
              </button>
            </div>

            {/* Help Text */}
            <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p className="text-xs text-blue-900">
                <strong>💡 İpucu:</strong>{' '}
                {useBackupCode
                  ? 'Yedek kodlarınızı 2FA etkinleştirdiğinizde kaydetmiş olmalısınız.'
                  : 'Authenticator uygulamanıza erişemiyorsanız, yedek kodunuzu kullanabilirsiniz.'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

export default TwoFactorLoginModal;
