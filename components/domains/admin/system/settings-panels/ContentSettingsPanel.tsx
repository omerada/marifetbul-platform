/**
 * Content Settings Panel
 *
 * Panel for managing content moderation and user-generated content settings.
 */

import type { PlatformSettings } from '../hooks/useAdminSettings';

interface ContentSettingsPanelProps {
  settings: PlatformSettings['content'];
  onUpdate: (field: keyof PlatformSettings['content'], value: boolean) => void;
}

export function ContentSettingsPanel({
  settings,
  onUpdate,
}: ContentSettingsPanelProps) {
  const contentOptions = [
    {
      id: 'contentModeration' as const,
      label: 'İçerik Moderasyonu',
      description:
        'Tüm içeriklerin yayınlanmadan önce onay gerektirmesini sağla',
    },
    {
      id: 'autoModeration' as const,
      label: 'Otomatik Moderasyon',
      description: 'AI tabanlı otomatik içerik denetimi',
    },
    {
      id: 'userGeneratedContent' as const,
      label: 'Kullanıcı Oluşturmalı İçerik',
      description:
        'Kullanıcıların blog yazısı, makale vb. içerik oluşturmasına izin ver',
    },
    {
      id: 'allowUserProfiles' as const,
      label: 'Kullanıcı Profilleri',
      description: 'Detaylı kullanıcı profil sayfaları',
    },
    {
      id: 'allowPortfolio' as const,
      label: 'Portfolyo',
      description: 'Freelancerların portfolyo yüklemesine izin ver',
    },
    {
      id: 'allowCustomCategories' as const,
      label: 'Özel Kategoriler',
      description:
        'Kullanıcıların özel hizmet kategorileri oluşturmasına izin ver',
    },
    {
      id: 'profanityFilter' as const,
      label: 'Küfür Filtresi',
      description: 'Uygunsuz dil kullanımını otomatik olarak filtrele',
    },
    {
      id: 'spamDetection' as const,
      label: 'Spam Tespiti',
      description: 'Spam içerikleri otomatik olarak tespit et ve engelle',
    },
  ];

  return (
    <div className="space-y-4">
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
              İçerik Yönetimi Hakkında
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Bu ayarlar platformdaki kullanıcı oluşturmalı içeriklerin nasıl
                yönetileceğini ve denetleneceğini kontrol eder.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {contentOptions.map((option) => (
          <div
            key={option.id}
            className="flex items-start space-x-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
          >
            <input
              type="checkbox"
              id={option.id}
              checked={settings[option.id]}
              onChange={(e) => onUpdate(option.id, e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <label
                htmlFor={option.id}
                className="block cursor-pointer text-sm font-medium text-gray-900"
              >
                {option.label}
              </label>
              <p className="mt-1 text-sm text-gray-500">{option.description}</p>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                settings[option.id]
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {settings[option.id] ? 'Aktif' : 'Pasif'}
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-md bg-yellow-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
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
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Moderasyon Önerisi
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                İçerik Moderasyonu veya Otomatik Moderasyon özelliklerinden en
                az birini etkinleştirmeniz önerilir.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
