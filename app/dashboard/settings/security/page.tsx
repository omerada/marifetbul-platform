/**
 * ================================================
 * SECURITY SETTINGS PAGE
 * ================================================
 * User security and password management
 *
 * Features:
 * - Password change
 * - Two-factor authentication (placeholder)
 * - Session management (placeholder)
 * - Real-time validation
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint 4: Settings System Refactor
 */

'use client';

import React, { useState } from 'react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  ArrowLeft,
  Lock,
  Shield,
  Key,
  Smartphone,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useSettings } from '@/hooks/business/useSettings';

export default function SecuritySettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { changePassword, isChangingPassword, passwordError, clearErrors } =
    useSettings();

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearErrors();
    setSuccess(false);

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setValidationError('Tüm alanları doldurun');
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationError('Yeni şifreler eşleşmiyor');
      return;
    }

    if (newPassword.length < 8) {
      setValidationError('Yeni şifre en az 8 karakter olmalıdır');
      return;
    }

    const success = await changePassword({
      currentPassword,
      newPassword,
    });

    if (success) {
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(false), 5000);
    }
  };

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/settings">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </Button>
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-green-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Güvenlik Ayarları
              </h1>
            </div>
            <p className="mt-1 text-gray-600">
              Hesap güvenliğinizi ve şifrenizi yönetin
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Change Password */}
        <Card className="p-6">
          <div className="mb-4 flex items-center space-x-3">
            <div className="rounded-lg bg-green-100 p-2">
              <Lock className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Şifre Değiştir
            </h2>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Mevcut Şifre
              </label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Mevcut şifrenizi girin"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Yeni Şifre
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="En az 8 karakter"
                required
                minLength={8}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Yeni Şifre (Tekrar)
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Yeni şifrenizi tekrar girin"
                required
                minLength={8}
              />
            </div>

            {(validationError || passwordError) && (
              <div className="flex items-center gap-2 rounded-md bg-red-50 p-3">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-800">
                  {validationError || passwordError}
                </p>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 rounded-md bg-green-50 p-3">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <p className="text-sm text-green-800">
                  Şifreniz başarıyla değiştirildi
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isChangingPassword}
              className="w-full"
            >
              {isChangingPassword ? 'Kaydediliyor...' : 'Şifreyi Değiştir'}
            </Button>
          </form>

          <div className="mt-4 border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-500">
              💡 Güçlü şifre için: Büyük/küçük harf, rakam ve özel karakter
              kullanın
            </p>
          </div>
        </Card>

        {/* Two-Factor Authentication */}
        <Card className="p-6">
          <div className="mb-4 flex items-center space-x-3">
            <div className="rounded-lg bg-purple-100 p-2">
              <Smartphone className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              İki Faktörlü Doğrulama (2FA)
            </h2>
          </div>

          <p className="mb-4 text-sm text-gray-600">
            Hesabınıza ekstra bir güvenlik katmanı ekleyin. Giriş yaparken
            telefonunuzdan onay koduna ihtiyacınız olacak.
          </p>

          <div className="mb-4 rounded-lg bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Durum</p>
                <p className="text-sm text-gray-600">Devre Dışı</p>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-gray-400"></div>
              </div>
            </div>
          </div>

          <Button variant="outline" className="w-full" disabled>
            2FA Etkinleştir (Yakında)
          </Button>

          <div className="mt-4 border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-500">
              📱 Authenticator uygulaması veya SMS ile doğrulama yapabilirsiniz
            </p>
          </div>
        </Card>

        {/* Active Sessions */}
        <Card className="p-6">
          <div className="mb-4 flex items-center space-x-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Key className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Aktif Oturumlar
            </h2>
          </div>

          <p className="mb-4 text-sm text-gray-600">
            Hesabınıza bağlı aktif cihazları görüntüleyin ve yönetin.
          </p>

          <div className="space-y-3">
            <div className="rounded-lg border border-gray-200 p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Bu Cihaz</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Windows • Chrome • İstanbul, Türkiye
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Son Etkinlik: Şimdi
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                  Aktif
                </span>
              </div>
            </div>
          </div>

          <Button variant="outline" className="mt-4 w-full" disabled>
            Tüm Oturumları Görüntüle (Yakında)
          </Button>
        </Card>

        {/* Security Recommendations */}
        <Card className="p-6">
          <div className="mb-4 flex items-center space-x-3">
            <div className="rounded-lg bg-yellow-100 p-2">
              <Shield className="h-5 w-5 text-yellow-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Güvenlik Önerileri
            </h2>
          </div>

          <ul className="space-y-3">
            <li className="flex items-start space-x-2">
              <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-3 w-3 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  Güçlü şifre kullanıyorsunuz
                </p>
                <p className="text-xs text-gray-500">
                  Şifreniz güvenlik standartlarını karşılıyor
                </p>
              </div>
            </li>

            <li className="flex items-start space-x-2">
              <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100">
                <svg
                  className="h-3 w-3 text-yellow-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">2FA etkinleştirin</p>
                <p className="text-xs text-gray-500">
                  Hesap güvenliğini artırmak için önerilir
                </p>
              </div>
            </li>

            <li className="flex items-start space-x-2">
              <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                <svg
                  className="h-3 w-3 text-gray-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  Düzenli şifre güncellemesi
                </p>
                <p className="text-xs text-gray-500">
                  Her 90 günde bir şifrenizi değiştirin
                </p>
              </div>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
