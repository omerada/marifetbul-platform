/**
 * ================================================
 * DISABLE 2FA MODAL
 * ================================================
 * Modal for disabling two-factor authentication
 *
 * Features:
 * - Password confirmation
 * - Optional 2FA code verification
 * - Confirmation dialog
 *
 * @version 1.0.0
 * @sprint Sprint 2: Admin 2FA System
 * @story Story 1.3: Disable Flow
 * @author MarifetBul Development Team
 */

'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { Alert, AlertDescription } from '@/components/ui';
import { AlertCircle, ShieldAlert, X } from 'lucide-react';
import { useTwoFactor } from '@/hooks/business/useTwoFactor';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface Disable2FAModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Disable2FAModal Component
 */
export function Disable2FAModal({
  isOpen,
  onClose,
  onSuccess,
}: Disable2FAModalProps) {
  const { disable2FA, isLoading } = useTwoFactor();

  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const handleDisable = async () => {
    try {
      setError('');

      // Validate password
      if (!password) {
        setError('Lütfen parolanızı girin');
        return;
      }

      if (!confirmed) {
        setError('Lütfen onay kutusunu işaretleyin');
        return;
      }

      logger.debug('[Disable2FA] Disabling 2FA');

      const success = await disable2FA({
        password,
        verificationCode: verificationCode || undefined,
      });

      if (success) {
        logger.info('[Disable2FA] 2FA disabled successfully');
        onSuccess();
      }
    } catch (err) {
      logger.error(
        '[Disable2FA] Failed to disable 2FA',
        err instanceof Error ? err : new Error(String(err))
      );
      setError('İşlem başarısız. Lütfen bilgilerinizi kontrol edin.');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 p-4">
        <Card className="shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <ShieldAlert className="h-6 w-6 text-orange-500" />
              <h2 className="text-xl font-semibold text-gray-900">
                2FA Devre Dışı Bırak
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 transition-colors hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4 p-6">
            {/* Warning Alert */}
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                <strong>Uyarı:</strong> İki faktörlü doğrulamayı devre dışı
                bırakmak hesabınızın güvenliğini azaltır. Admin hesapları için
                2FA kullanımı önerilir.
              </AlertDescription>
            </Alert>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="ml-2">{error}</AlertDescription>
              </Alert>
            )}

            {/* Password Input */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Parola <span className="text-red-500">*</span>
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mevcut parolanızı girin"
                disabled={isLoading}
                autoComplete="current-password"
              />
              <p className="text-xs text-gray-500">
                Güvenlik için parolanızı doğrulamamız gerekiyor
              </p>
            </div>

            {/* Optional: Verification Code */}
            <div className="space-y-2">
              <label
                htmlFor="code"
                className="block text-sm font-medium text-gray-700"
              >
                2FA Kodu (Opsiyonel)
              </label>
              <Input
                id="code"
                type="text"
                value={verificationCode}
                onChange={(e) =>
                  setVerificationCode(
                    e.target.value.replace(/\D/g, '').slice(0, 6)
                  )
                }
                placeholder="Authenticator kodunuz (6 hane)"
                disabled={isLoading}
                maxLength={6}
              />
              <p className="text-xs text-gray-500">
                Eğer authenticator uygulamanız hala aktifse kod girebilirsiniz
              </p>
            </div>

            {/* Confirmation Checkbox */}
            <div className="flex items-start space-x-2 rounded-lg bg-orange-50 p-4">
              <input
                type="checkbox"
                id="confirm"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                disabled={isLoading}
              />
              <label htmlFor="confirm" className="text-sm text-gray-700">
                2FA devre dışı bırakıldığında hesabımın sadece parola ile
                korunacağını ve güvenlik riskinin artacağını anlıyorum.
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 border-t border-gray-200 p-6">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisable}
              disabled={isLoading || !password || !confirmed}
            >
              {isLoading ? 'Devre Dışı Bırakılıyor...' : 'Devre Dışı Bırak'}
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}

export default Disable2FAModal;
