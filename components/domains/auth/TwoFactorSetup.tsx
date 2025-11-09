/**
 * ================================================
 * TWO-FACTOR AUTHENTICATION SETUP COMPONENT
 * ================================================
 * Interactive component for setting up 2FA
 *
 * Features:
 * - QR code display
 * - Manual entry key
 * - Verification code input
 * - Recovery codes display
 * - Step-by-step wizard
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @sprint Security & Settings Sprint - Story 1
 * @created 2025-11-09
 */

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import {
  CheckCircle,
  Copy,
  Download,
  AlertCircle,
  Smartphone,
  Key,
  Shield,
  X,
} from 'lucide-react';
import { useTwoFactor } from '@/hooks/business/useTwoFactor';
import { formatRecoveryCode, isValid2FACode } from '@/lib/api/two-factor';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

export interface TwoFactorSetupProps {
  onComplete?: () => void;
  onCancel?: () => void;
  autoStart?: boolean;
}

type SetupStep = 'setup' | 'verify' | 'recovery' | 'complete';

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * TwoFactorSetup Component
 *
 * Complete 2FA setup flow with QR code and verification
 *
 * @example
 * ```tsx
 * <TwoFactorSetup
 *   onComplete={() => console.log('2FA enabled')}
 *   onCancel={() => setShowSetup(false)}
 * />
 * ```
 */
export function TwoFactorSetup({
  onComplete,
  onCancel,
  autoStart = false,
}: TwoFactorSetupProps) {
  const {
    qrCode,
    recoveryCodes,
    isLoading,
    error,
    setupAuthenticator,
    enable2FA,
    clearError,
    clearQRCode,
  } = useTwoFactor();

  const [step, setStep] = useState<SetupStep>('setup');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [downloadedCodes, setDownloadedCodes] = useState(false);

  // Auto-start setup if enabled
  useEffect(() => {
    if (autoStart && !qrCode) {
      handleSetupStart();
    }
  }, [autoStart]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Start the setup process
   */
  const handleSetupStart = async () => {
    clearError();
    await setupAuthenticator();
  };

  /**
   * Copy manual entry key to clipboard
   */
  const handleCopyKey = async () => {
    if (qrCode?.manualEntryKey) {
      await navigator.clipboard.writeText(qrCode.manualEntryKey);
      setCopiedCode(true);
      toast.success('Kopyalandı', {
        description: 'Anahtar panoya kopyalandı',
      });
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  /**
   * Verify the code and enable 2FA
   */
  const handleVerify = async () => {
    // Validate code format
    if (!verificationCode || !isValid2FACode(verificationCode)) {
      setCodeError('Lütfen 6 haneli geçerli bir kod girin');
      return;
    }

    setCodeError('');

    const success = await enable2FA({
      method: 'AUTHENTICATOR',
      verificationCode,
    });

    if (success) {
      setStep('recovery');
      clearQRCode();
    }
  };

  /**
   * Download recovery codes
   */
  const handleDownloadCodes = () => {
    if (!recoveryCodes) return;

    const content = [
      'MarifetBul İki Faktörlü Doğrulama Kurtarma Kodları',
      `Oluşturma Tarihi: ${new Date(recoveryCodes.generatedAt).toLocaleString('tr-TR')}`,
      '',
      'Bu kodları güvenli bir yerde saklayın. Her kod yalnızca bir kez kullanılabilir.',
      '',
      ...recoveryCodes.codes.map(
        (code, index) => `${index + 1}. ${formatRecoveryCode(code)}`
      ),
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marifetbul-recovery-codes-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadedCodes(true);
    toast.success('İndirildi', {
      description: 'Kurtarma kodları indirildi',
    });
  };

  /**
   * Complete the setup
   */
  const handleComplete = () => {
    setStep('complete');
    if (onComplete) {
      onComplete();
    }
  };

  /**
   * Cancel and close
   */
  const handleCancel = () => {
    setVerificationCode('');
    setCodeError('');
    clearError();
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="rounded-lg bg-green-100 p-2">
            <Shield className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              İki Faktörlü Doğrulama Kurulumu
            </h2>
            <p className="text-sm text-gray-600">
              Hesabınıza ekstra güvenlik katmanı ekleyin
            </p>
          </div>
        </div>
        {onCancel && (
          <Button variant="outline" size="sm" onClick={handleCancel}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: QR Code Display */}
      {step === 'setup' && (
        <Card className="p-6">
          <div className="space-y-6">
            <div className="text-center">
              <div className="mb-4 inline-flex rounded-lg bg-blue-100 p-3">
                <Smartphone className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Adım 1: Authenticator Uygulaması
              </h3>
              <p className="text-sm text-gray-600">
                QR kodu okutmak için Google Authenticator veya benzer bir
                uygulama kullanın
              </p>
            </div>

            {qrCode ? (
              <div className="space-y-4">
                {/* QR Code */}
                <div className="flex justify-center">
                  <div className="rounded-lg border-4 border-gray-200 bg-white p-4">
                    <Image
                      src={qrCode.qrCodeDataUrl}
                      alt="2FA QR Code"
                      width={200}
                      height={200}
                      className="h-auto w-full max-w-[200px]"
                    />
                  </div>
                </div>

                {/* Manual Entry */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="mb-2 text-xs font-medium text-gray-700">
                    QR kodu okutamıyorsanız, bu anahtarı manuel olarak girin:
                  </p>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 rounded bg-white px-3 py-2 font-mono text-sm text-gray-900">
                      {qrCode.manualEntryKey}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyKey}
                      disabled={copiedCode}
                    >
                      {copiedCode ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    İptal
                  </Button>
                  <Button
                    onClick={() => setStep('verify')}
                    disabled={isLoading}
                  >
                    Devam Et
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <Button
                  onClick={handleSetupStart}
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  {isLoading ? 'QR Kod Oluşturuluyor...' : 'QR Kod Oluştur'}
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Step 2: Verification */}
      {step === 'verify' && (
        <Card className="p-6">
          <div className="space-y-6">
            <div className="text-center">
              <div className="mb-4 inline-flex rounded-lg bg-purple-100 p-3">
                <Key className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Adım 2: Doğrulama
              </h3>
              <p className="text-sm text-gray-600">
                Authenticator uygulamanızdaki 6 haneli kodu girin
              </p>
            </div>

            <div className="mx-auto max-w-xs space-y-4">
              <div>
                <label
                  htmlFor="verification-code"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Doğrulama Kodu
                </label>
                <Input
                  id="verification-code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => {
                    setVerificationCode(e.target.value.replace(/\D/g, ''));
                    setCodeError('');
                  }}
                  placeholder="000000"
                  className="text-center font-mono text-2xl tracking-widest"
                  autoComplete="off"
                  autoFocus
                />
                {codeError && (
                  <p className="mt-1 text-sm text-red-600">{codeError}</p>
                )}
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('setup')}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Geri
                </Button>
                <Button
                  onClick={handleVerify}
                  disabled={isLoading || verificationCode.length !== 6}
                  className="flex-1"
                >
                  {isLoading ? 'Doğrulanıyor...' : 'Doğrula'}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Step 3: Recovery Codes */}
      {step === 'recovery' && recoveryCodes && (
        <Card className="p-6">
          <div className="space-y-6">
            <div className="text-center">
              <div className="mb-4 inline-flex rounded-lg bg-yellow-100 p-3">
                <Shield className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Kurtarma Kodlarınız
              </h3>
              <p className="text-sm text-gray-600">
                Bu kodları güvenli bir yerde saklayın. Cihazınıza erişiminizi
                kaybederseniz hesabınıza girmek için kullanabilirsiniz.
              </p>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Önemli:</strong> Her kod sadece bir kez kullanılabilir.
                Bu kodları kimseyle paylaşmayın.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              {recoveryCodes.codes.map((code, index) => (
                <div
                  key={index}
                  className="rounded border border-gray-300 bg-white px-3 py-2 text-center"
                >
                  <code className="font-mono text-sm font-medium text-gray-900">
                    {formatRecoveryCode(code)}
                  </code>
                </div>
              ))}
            </div>

            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
              <Button
                variant="outline"
                onClick={handleDownloadCodes}
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                İndir
              </Button>
              <Button
                onClick={handleComplete}
                disabled={!downloadedCodes}
                className="flex-1"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Tamamla
              </Button>
            </div>

            {!downloadedCodes && (
              <p className="text-center text-xs text-gray-500">
                Devam etmeden önce kodlarınızı indirin
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Step 4: Complete */}
      {step === 'complete' && (
        <Card className="p-6">
          <div className="space-y-6 text-center">
            <div className="inline-flex rounded-full bg-green-100 p-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">
                Tebrikler!
              </h3>
              <p className="text-gray-600">
                İki faktörlü doğrulama başarıyla etkinleştirildi. Hesabınız
                artık daha güvenli.
              </p>
            </div>
            {onComplete && (
              <Button onClick={onComplete} className="w-full sm:w-auto">
                Tamam
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

export default TwoFactorSetup;
