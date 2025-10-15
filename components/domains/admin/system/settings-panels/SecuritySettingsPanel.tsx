/**
 * Security Settings Panel
 *
 * Panel for managing security settings including two-factor authentication,
 * password requirements, session management, and IP filtering.
 */

import { Input } from '@/components/ui/Input';
import type { PlatformSettings } from '../hooks/useAdminSettings';

interface SecuritySettingsPanelProps {
  settings: PlatformSettings['security'];
  onUpdate: (
    field: keyof PlatformSettings['security'],
    value: string | number | boolean | string[]
  ) => void;
  onUpdateNested: (
    nestedField: 'passwordRequirements',
    field: string,
    value: number | boolean
  ) => void;
}

export function SecuritySettingsPanel({
  settings,
  onUpdate,
  onUpdateNested,
}: SecuritySettingsPanelProps) {
  return (
    <div className="space-y-6">
      {/* Two-Factor Authentication */}
      <div>
        <h4 className="mb-3 text-sm font-medium text-gray-700">
          İki Faktörlü Kimlik Doğrulama (2FA)
        </h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="twoFactorAuth"
              checked={settings.twoFactorAuth}
              onChange={(e) => onUpdate('twoFactorAuth', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="twoFactorAuth"
              className="text-sm font-medium text-gray-700"
            >
              2FA&apos;yı Etkinleştir
            </label>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="enableCaptcha"
              checked={settings.enableCaptcha}
              onChange={(e) => onUpdate('enableCaptcha', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="enableCaptcha" className="text-sm text-gray-700">
              CAPTCHA Doğrulamasını Etkinleştir
            </label>
          </div>
        </div>
      </div>

      {/* Password Requirements */}
      <div>
        <h4 className="mb-3 text-sm font-medium text-gray-700">
          Şifre Gereksinimleri
        </h4>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Minimum Uzunluk
              </label>
              <Input
                type="number"
                min="6"
                max="128"
                value={settings.passwordRequirements.minLength}
                onChange={(e) =>
                  onUpdateNested(
                    'passwordRequirements',
                    'minLength',
                    parseInt(e.target.value)
                  )
                }
                className="mt-1"
              />
            </div>
          </div>{' '}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="requireUppercase"
                checked={settings.passwordRequirements.requireUppercase}
                onChange={(e) =>
                  onUpdateNested(
                    'passwordRequirements',
                    'requireUppercase',
                    e.target.checked
                  )
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="requireUppercase"
                className="text-sm text-gray-700"
              >
                Büyük harf gerekli
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="requireLowercase"
                checked={settings.passwordRequirements.requireLowercase}
                onChange={(e) =>
                  onUpdateNested(
                    'passwordRequirements',
                    'requireLowercase',
                    e.target.checked
                  )
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="requireLowercase"
                className="text-sm text-gray-700"
              >
                Küçük harf gerekli
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="requireNumbers"
                checked={settings.passwordRequirements.requireNumbers}
                onChange={(e) =>
                  onUpdateNested(
                    'passwordRequirements',
                    'requireNumbers',
                    e.target.checked
                  )
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="requireNumbers" className="text-sm text-gray-700">
                Rakam gerekli
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="requireSpecialChars"
                checked={settings.passwordRequirements.requireSpecialChars}
                onChange={(e) =>
                  onUpdateNested(
                    'passwordRequirements',
                    'requireSpecialChars',
                    e.target.checked
                  )
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="requireSpecialChars"
                className="text-sm text-gray-700"
              >
                Özel karakter gerekli (!@#$%^&*)
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Session Management */}
      <div>
        <h4 className="mb-3 text-sm font-medium text-gray-700">
          Oturum Yönetimi
        </h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Oturum Zaman Aşımı (dakika)
            </label>
            <Input
              type="number"
              min="5"
              max="10080"
              value={settings.sessionTimeout}
              onChange={(e) =>
                onUpdate('sessionTimeout', parseInt(e.target.value))
              }
              className="mt-1"
            />
            <p className="mt-1 text-xs text-gray-500">
              İşlem yapılmadığında oturum süresi
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Maximum Giriş Denemeleri
            </label>
            <Input
              type="number"
              min="3"
              max="20"
              value={settings.maxLoginAttempts}
              onChange={(e) =>
                onUpdate('maxLoginAttempts', parseInt(e.target.value))
              }
              className="mt-1"
            />
            <p className="mt-1 text-xs text-gray-500">
              Hesap kilitlenmeden önceki deneme sayısı
            </p>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Hesap Kilitleme Süresi (dakika)
          </label>
          <Input
            type="number"
            min="5"
            max="1440"
            value={settings.lockoutDuration}
            onChange={(e) =>
              onUpdate('lockoutDuration', parseInt(e.target.value))
            }
            className="mt-1"
          />
        </div>
      </div>

      {/* IP Filtering */}
      <div>
        <h4 className="mb-3 text-sm font-medium text-gray-700">
          IP Filtreleme
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Beyaz Liste IP Adresleri
            </label>
            <textarea
              value={settings.ipWhitelist.join('\n')}
              onChange={(e) =>
                onUpdate(
                  'ipWhitelist',
                  e.target.value.split('\n').filter((ip) => ip.trim())
                )
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              rows={5}
              placeholder="192.168.1.1&#10;10.0.0.0/8&#10;172.16.0.0/12"
            />
            <p className="mt-1 text-xs text-gray-500">
              Her satıra bir IP adresi veya CIDR bloğu (Boş bırakırsanız tüm
              IP&apos;ler izinli)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Kara Liste IP Adresleri
            </label>
            <textarea
              value={settings.ipBlacklist.join('\n')}
              onChange={(e) =>
                onUpdate(
                  'ipBlacklist',
                  e.target.value.split('\n').filter((ip) => ip.trim())
                )
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              rows={5}
              placeholder="192.168.1.100&#10;10.0.0.50"
            />
            <p className="mt-1 text-xs text-gray-500">
              Engellenecek IP adresleri (her satıra bir IP)
            </p>
          </div>
        </div>
      </div>

      {/* Additional Security */}
      <div>
        <h4 className="mb-3 text-sm font-medium text-gray-700">Ek Güvenlik</h4>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Veri Saklama Süresi (gün)
          </label>
          <Input
            type="number"
            min="30"
            max="3650"
            value={settings.dataRetentionPeriod}
            onChange={(e) =>
              onUpdate('dataRetentionPeriod', parseInt(e.target.value))
            }
            className="mt-1"
          />
          <p className="mt-1 text-xs text-gray-500">
            Kullanıcı verilerinin sistemde saklanacağı maksimum süre
          </p>
        </div>
      </div>
    </div>
  );
}
