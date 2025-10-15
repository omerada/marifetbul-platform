/**
 * General Settings Panel
 *
 * Panel for managing general platform settings like site name,
 * description, contact info, language, and currency preferences.
 */

import { Input } from '@/components/ui/Input';
import type { PlatformSettings } from '../hooks/useAdminSettings';

interface GeneralSettingsPanelProps {
  settings: PlatformSettings['general'];
  onUpdate: (
    field: keyof PlatformSettings['general'],
    value: string | number | string[]
  ) => void;
}

export function GeneralSettingsPanel({
  settings,
  onUpdate,
}: GeneralSettingsPanelProps) {
  return (
    <div className="space-y-4">
      {/* Site Identity */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Site Adı
          </label>
          <Input
            value={settings.siteName}
            onChange={(e) => onUpdate('siteName', e.target.value)}
            className="mt-1"
            placeholder="MarifetBul"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Destek E-postası
          </label>
          <Input
            type="email"
            value={settings.supportEmail}
            onChange={(e) => onUpdate('supportEmail', e.target.value)}
            className="mt-1"
            placeholder="destek@marifetbul.com"
          />
        </div>
      </div>

      {/* Site Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Site Açıklaması
        </label>
        <textarea
          value={settings.siteDescription}
          onChange={(e) => onUpdate('siteDescription', e.target.value)}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          rows={3}
          placeholder="Türkiye'nin önde gelen freelance platformu..."
        />
      </div>

      {/* Localization */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Varsayılan Dil
          </label>
          <select
            value={settings.defaultLanguage}
            onChange={(e) => onUpdate('defaultLanguage', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="tr">Türkçe</option>
            <option value="en">English</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Para Birimi
          </label>
          <select
            value={settings.currency}
            onChange={(e) => onUpdate('currency', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="TRY">₺ TRY</option>
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Zaman Dilimi
          </label>
          <select
            value={settings.timezone}
            onChange={(e) => onUpdate('timezone', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="Europe/Istanbul">Europe/Istanbul</option>
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New_York</option>
            <option value="Europe/London">Europe/London</option>
          </select>
        </div>
      </div>

      {/* File Upload Settings */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Max Dosya Yükleme Boyutu (MB)
          </label>
          <Input
            type="number"
            min="1"
            max="100"
            value={settings.maxFileUploadSize}
            onChange={(e) =>
              onUpdate('maxFileUploadSize', parseInt(e.target.value))
            }
            className="mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            İzin Verilen Dosya Tipleri
          </label>
          <Input
            value={settings.allowedFileTypes.join(', ')}
            onChange={(e) =>
              onUpdate(
                'allowedFileTypes',
                e.target.value.split(',').map((t) => t.trim())
              )
            }
            className="mt-1"
            placeholder="jpg, png, pdf, docx"
          />
          <p className="mt-1 text-xs text-gray-500">Virgülle ayırın</p>
        </div>
      </div>

      {/* Legal Links */}
      <div>
        <h4 className="mb-3 text-sm font-medium text-gray-700">
          Yasal Dökümanlar
        </h4>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Kullanım Şartları URL
            </label>
            <Input
              type="url"
              value={settings.termsOfServiceUrl}
              onChange={(e) => onUpdate('termsOfServiceUrl', e.target.value)}
              className="mt-1"
              placeholder="https://marifetbul.com/terms"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Gizlilik Politikası URL
            </label>
            <Input
              type="url"
              value={settings.privacyPolicyUrl}
              onChange={(e) => onUpdate('privacyPolicyUrl', e.target.value)}
              className="mt-1"
              placeholder="https://marifetbul.com/privacy"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Çerez Politikası URL
            </label>
            <Input
              type="url"
              value={settings.cookiePolicyUrl}
              onChange={(e) => onUpdate('cookiePolicyUrl', e.target.value)}
              className="mt-1"
              placeholder="https://marifetbul.com/cookies"
            />
          </div>
        </div>
      </div>

      {/* Supported Languages & Currencies */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Desteklenen Diller
          </label>
          <Input
            value={settings.supportedLanguages.join(', ')}
            onChange={(e) =>
              onUpdate(
                'supportedLanguages',
                e.target.value.split(',').map((l) => l.trim())
              )
            }
            className="mt-1"
            placeholder="tr, en"
          />
          <p className="mt-1 text-xs text-gray-500">
            Virgülle ayırın (ör: tr, en, de)
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Desteklenen Para Birimleri
          </label>
          <Input
            value={settings.supportedCurrencies.join(', ')}
            onChange={(e) =>
              onUpdate(
                'supportedCurrencies',
                e.target.value.split(',').map((c) => c.trim())
              )
            }
            className="mt-1"
            placeholder="TRY, USD, EUR"
          />
          <p className="mt-1 text-xs text-gray-500">
            Virgülle ayırın (ör: TRY, USD, EUR)
          </p>
        </div>
      </div>
    </div>
  );
}
