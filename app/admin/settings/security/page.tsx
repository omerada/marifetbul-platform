/**
 * ================================================
 * ADMIN SECURITY SETTINGS PAGE
 * ================================================
 * Security configuration page for admin users
 *
 * Route: /admin/settings/security
 * Access: Admin only
 *
 * Features:
 * - 2FA status display
 * - Enable/disable 2FA
 * - Backup codes management
 * - Security recommendations
 *
 * @version 1.0.0
 * @sprint Sprint 2: Admin 2FA System
 * @story Story 1: Admin 2FA Setup Page
 * @author MarifetBul Development Team
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Key,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { useTwoFactor } from '@/hooks/business/useTwoFactor';
import { TwoFactorSetup } from '@/components/domains/auth/TwoFactorSetup';
import {
  Disable2FAModal,
  BackupCodesCard,
  SecurityRecommendations,
} from '@/components/domains/admin/security';
import logger from '@/lib/infrastructure/monitoring/logger';
import { formatDate } from '@/lib/shared/formatters';

export const dynamic = 'force-dynamic';

/**
 * Admin Security Settings Page
 */
export default function AdminSecuritySettingsPage() {
  const { status, fetchStatus, isLoading, error, clearError } = useTwoFactor();

  const [showSetup, setShowSetup] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch initial status
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleSetupComplete = async () => {
    setShowSetup(false);
    await fetchStatus();
    logger.info('[Admin Security] 2FA setup completed');
  };

  const handleDisableComplete = async () => {
    setShowDisableModal(false);
    await fetchStatus();
    logger.info('[Admin Security] 2FA disabled');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchStatus();
    setIsRefreshing(false);
  };

  if (showSetup) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl">
          <TwoFactorSetup
            onComplete={handleSetupComplete}
            onCancel={() => setShowSetup(false)}
            autoStart={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Güvenlik Ayarları
                </h1>
                <p className="text-sm text-gray-500">
                  Admin hesabınızın güvenlik yapılandırması
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              Yenile
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-2">
              {error}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="ml-4"
              >
                Kapat
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* 2FA Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5" />
              <span>İki Faktörlü Doğrulama (2FA)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Yükleniyor...</span>
              </div>
            ) : (
              <>
                {/* Status Display */}
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center space-x-3">
                    {status?.enabled ? (
                      <>
                        <ShieldCheck className="h-8 w-8 text-green-600" />
                        <div>
                          <p className="font-semibold text-gray-900">
                            2FA Aktif
                          </p>
                          <p className="text-sm text-gray-500">
                            Hesabınız ek güvenlik katmanıyla korunuyor
                          </p>
                          {status.lastUsedAt && (
                            <p className="mt-1 text-xs text-gray-400">
                              Son kullanım:{' '}
                              {formatDate(status.lastUsedAt, 'RELATIVE')}
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="h-8 w-8 text-orange-500" />
                        <div>
                          <p className="font-semibold text-gray-900">
                            2FA Devre Dışı
                          </p>
                          <p className="text-sm text-gray-500">
                            Hesabınız sadece parola ile korunuyor
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Action Button */}
                  <div>
                    {status?.enabled ? (
                      <Button
                        variant="outline"
                        onClick={() => setShowDisableModal(true)}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        Devre Dışı Bırak
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={() => setShowSetup(true)}
                      >
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        2FA Etkinleştir
                      </Button>
                    )}
                  </div>
                </div>

                {/* 2FA Method Display */}
                {status?.enabled && status.method && (
                  <div className="rounded-lg bg-blue-50 p-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          Kullanılan Yöntem
                        </p>
                        <p className="text-sm text-blue-700">
                          {status.method === 'AUTHENTICATOR'
                            ? 'Authenticator Uygulaması (TOTP)'
                            : status.method === 'SMS'
                              ? 'SMS Doğrulama'
                              : status.method === 'EMAIL'
                                ? 'E-posta Doğrulama'
                                : status.method}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Backup Codes Card - Only if 2FA is enabled */}
        {status?.enabled && <BackupCodesCard />}

        {/* Security Recommendations */}
        <SecurityRecommendations twoFactorEnabled={status?.enabled || false} />

        {/* Security Tips Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <span>Güvenlik İpuçları</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                <span>2FA kullanarak hesabınıza yetkisiz erişimi önleyin</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                <span>
                  Yedek kodlarınızı güvenli bir yerde saklayın (password manager
                  önerilir)
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                <span>
                  Authenticator uygulamanızı düzenli olarak yedekleyin
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                <span>
                  Cihazınızı kaybederseniz yedek kodlarla giriş yapabilirsiniz
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                <span>
                  Admin hesapları için 2FA kullanımı zorunludur (güvenlik
                  politikası)
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Disable 2FA Modal */}
      {showDisableModal && (
        <Disable2FAModal
          isOpen={showDisableModal}
          onClose={() => setShowDisableModal(false)}
          onSuccess={handleDisableComplete}
        />
      )}
    </div>
  );
}
