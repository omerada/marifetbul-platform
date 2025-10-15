/**
 * Email Settings Panel
 *
 * Panel for managing email configuration including SMTP settings
 * and email template customization.
 */

import { Input } from '@/components/ui/Input';
import type { PlatformSettings } from '../hooks/useAdminSettings';

interface EmailSettingsPanelProps {
  settings: PlatformSettings['email'];
  onUpdate: (
    field: keyof PlatformSettings['email'],
    value: string | number | boolean
  ) => void;
}

export function EmailSettingsPanel({
  settings,
  onUpdate,
}: EmailSettingsPanelProps) {
  return (
    <div className="space-y-6">
      {/* SMTP Configuration */}
      <div>
        <h4 className="mb-3 text-sm font-medium text-gray-700">
          SMTP Yapılandırması
        </h4>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                SMTP Sunucusu
              </label>
              <Input
                value={settings.smtpHost}
                onChange={(e) => onUpdate('smtpHost', e.target.value)}
                className="mt-1"
                placeholder="smtp.example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Port
              </label>
              <Input
                type="number"
                min="1"
                max="65535"
                value={settings.smtpPort}
                onChange={(e) => onUpdate('smtpPort', parseInt(e.target.value))}
                className="mt-1"
                placeholder="587"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Kullanıcı Adı
              </label>
              <Input
                value={settings.smtpUsername}
                onChange={(e) => onUpdate('smtpUsername', e.target.value)}
                className="mt-1"
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Şifre
              </label>
              <Input
                type="password"
                value={settings.smtpPassword}
                onChange={(e) => onUpdate('smtpPassword', e.target.value)}
                className="mt-1"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="enableEmailVerification"
              checked={settings.enableEmailVerification}
              onChange={(e) =>
                onUpdate('enableEmailVerification', e.target.checked)
              }
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="enableEmailVerification"
              className="text-sm text-gray-700"
            >
              E-posta Doğrulamasını Etkinleştir
            </label>
          </div>
        </div>
      </div>

      {/* Email Sender Info */}
      <div>
        <h4 className="mb-3 text-sm font-medium text-gray-700">
          Gönderen Bilgileri
        </h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Gönderen Adı
            </label>
            <Input
              value={settings.fromName}
              onChange={(e) => onUpdate('fromName', e.target.value)}
              className="mt-1"
              placeholder="MarifetBul"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Gönderen E-posta
            </label>
            <Input
              type="email"
              value={settings.fromEmail}
              onChange={(e) => onUpdate('fromEmail', e.target.value)}
              className="mt-1"
              placeholder="noreply@marifetbul.com"
            />
          </div>
        </div>
      </div>

      {/* Email Templates Info */}
      <div className="rounded-md bg-blue-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
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
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              E-posta Şablonları
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                E-posta şablonlarını düzenlemek için ayrı bir yönetim sayfası
                kullanın. Şu anda sistemde {settings.emailTemplates.length} adet
                şablon tanımlı.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Test Email */}
      <div className="rounded-md bg-blue-50 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
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
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-blue-800">
              SMTP Ayarlarını Test Et
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Değişiklikleri kaydetmeden önce SMTP ayarlarınızı test etmeniz
                önerilir.
              </p>
            </div>
            <div className="mt-3">
              <button
                type="button"
                className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
              >
                Test E-postası Gönder
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
