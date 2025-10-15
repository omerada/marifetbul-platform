/**
 * Features Settings Panel
 *
 * Panel for managing feature flags and toggles for platform features.
 */

import type { PlatformSettings } from '../hooks/useAdminSettings';

interface FeaturesSettingsPanelProps {
  settings: PlatformSettings['features'];
  onUpdate: (field: keyof PlatformSettings['features'], value: boolean) => void;
}

export function FeaturesSettingsPanel({
  settings,
  onUpdate,
}: FeaturesSettingsPanelProps) {
  const features = [
    {
      id: 'userRegistration' as const,
      label: 'Kullanıcı Kaydı',
      description: 'Yeni kullanıcıların platforma kaydolmasına izin ver',
    },
    {
      id: 'emailVerificationRequired' as const,
      label: 'E-posta Doğrulama Zorunlu',
      description:
        'Kullanıcıların e-posta adreslerini doğrulamasını zorunlu kıl',
    },
    {
      id: 'profileVerification' as const,
      label: 'Profil Doğrulama',
      description: 'Kullanıcı profil doğrulama sistemini etkinleştir',
    },
    {
      id: 'servicePackages' as const,
      label: 'Hizmet Paketleri',
      description: 'Freelancerların hizmet paketleri oluşturmasına izin ver',
    },
    {
      id: 'jobPosting' as const,
      label: 'İş İlanı Yayınlama',
      description: 'İşverenlerin yeni iş ilanı yayınlamasına izin ver',
    },
    {
      id: 'directMessaging' as const,
      label: 'Direkt Mesajlaşma',
      description: 'Kullanıcılar arası direkt mesajlaşmayı etkinleştir',
    },
    {
      id: 'videoChat' as const,
      label: 'Video Görüşme',
      description: 'Kullanıcılar arası video görüşme özelliği',
    },
    {
      id: 'mobileApp' as const,
      label: 'Mobil Uygulama',
      description: 'Mobil uygulama desteğini etkinleştir',
    },
    {
      id: 'apiAccess' as const,
      label: 'API Erişimi',
      description: 'Üçüncü parti API erişimini etkinleştir',
    },
    {
      id: 'affiliateProgram' as const,
      label: 'Ortaklık Programı',
      description: 'Affiliate/ortaklık programını etkinleştir',
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
              Özellik Anahtarları Hakkında
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Bu ayarlar platformda hangi özelliklerin aktif olacağını kontrol
                eder. Bir özelliği kapatmak tüm kullanıcılar için o özelliğe
                erişimi engeller.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {features.map((feature) => (
          <div
            key={feature.id}
            className="flex items-start space-x-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
          >
            <input
              type="checkbox"
              id={feature.id}
              checked={settings[feature.id]}
              onChange={(e) => onUpdate(feature.id, e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <label
                htmlFor={feature.id}
                className="block cursor-pointer text-sm font-medium text-gray-900"
              >
                {feature.label}
              </label>
              <p className="mt-1 text-sm text-gray-500">
                {feature.description}
              </p>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                settings[feature.id]
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {settings[feature.id] ? 'Aktif' : 'Pasif'}
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
            <h3 className="text-sm font-medium text-yellow-800">Dikkat</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Özellik değişiklikleri anında etkili olur. Kritik özellikleri
                kapatmadan önce kullanıcıları bilgilendirmeniz önerilir.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
