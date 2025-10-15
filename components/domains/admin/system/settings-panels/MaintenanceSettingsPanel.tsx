/**
 * Maintenance Settings Panel
 *
 * Panel for managing maintenance mode and scheduled maintenance windows.
 */

import { Input } from '@/components/ui/Input';
import type { PlatformSettings } from '../hooks/useAdminSettings';

interface MaintenanceSettingsPanelProps {
  settings: PlatformSettings['maintenance'];
  onUpdate: (
    field: keyof PlatformSettings['maintenance'],
    value: string | boolean | string[]
  ) => void;
  onUpdateNested: (
    nestedField: 'scheduledMaintenance',
    field: string,
    value: string | boolean
  ) => void;
}

export function MaintenanceSettingsPanel({
  settings,
  onUpdate,
  onUpdateNested,
}: MaintenanceSettingsPanelProps) {
  return (
    <div className="space-y-6">
      {/* Maintenance Mode Status */}
      {settings.isMaintenanceMode && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Bakım Modu Aktif
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  Platform şu anda bakım modunda. Yalnızca beyaz listedeki IP
                  adreslerinden erişim mümkün.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Mode Control */}
      <div>
        <h4 className="mb-3 text-sm font-medium text-gray-700">Bakım Modu</h4>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="maintenanceMode"
              checked={settings.isMaintenanceMode}
              onChange={(e) => onUpdate('isMaintenanceMode', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="maintenanceMode"
              className="text-sm font-medium text-gray-700"
            >
              Bakım Modunu Etkinleştir
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bakım Mesajı
            </label>
            <textarea
              value={settings.maintenanceMessage}
              onChange={(e) => onUpdate('maintenanceMessage', e.target.value)}
              disabled={!settings.isMaintenanceMode}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
              rows={3}
              placeholder="Platform şu anda bakımda. Lütfen daha sonra tekrar deneyin."
            />
            <p className="mt-1 text-xs text-gray-500">
              Kullanıcılara gösterilecek mesaj
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              İzin Verilen IP Adresleri
            </label>
            <textarea
              value={settings.allowedIps.join('\n')}
              onChange={(e) =>
                onUpdate(
                  'allowedIps',
                  e.target.value.split('\n').filter((ip) => ip.trim())
                )
              }
              disabled={!settings.isMaintenanceMode}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
              rows={5}
              placeholder="192.168.1.1&#10;10.0.0.0/8"
            />
            <p className="mt-1 text-xs text-gray-500">
              Bakım modunda platforma erişebilecek IP adresleri (her satıra bir
              IP)
            </p>
          </div>
        </div>
      </div>

      {/* Scheduled Maintenance */}
      <div>
        <h4 className="mb-3 text-sm font-medium text-gray-700">
          Zamanlanmış Bakım
        </h4>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="scheduledEnabled"
              checked={settings.scheduledMaintenance.enabled}
              onChange={(e) =>
                onUpdateNested(
                  'scheduledMaintenance',
                  'enabled',
                  e.target.checked
                )
              }
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="scheduledEnabled"
              className="text-sm font-medium text-gray-700"
            >
              Zamanlanmış Bakımı Etkinleştir
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Başlangıç Zamanı
              </label>
              <Input
                type="datetime-local"
                value={settings.scheduledMaintenance.startTime}
                onChange={(e) =>
                  onUpdateNested(
                    'scheduledMaintenance',
                    'startTime',
                    e.target.value
                  )
                }
                disabled={!settings.scheduledMaintenance.enabled}
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Bitiş Zamanı
              </label>
              <Input
                type="datetime-local"
                value={settings.scheduledMaintenance.endTime}
                onChange={(e) =>
                  onUpdateNested(
                    'scheduledMaintenance',
                    'endTime',
                    e.target.value
                  )
                }
                disabled={!settings.scheduledMaintenance.enabled}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="notifyUsers"
              checked={settings.scheduledMaintenance.notifyUsers}
              onChange={(e) =>
                onUpdateNested(
                  'scheduledMaintenance',
                  'notifyUsers',
                  e.target.checked
                )
              }
              disabled={!settings.scheduledMaintenance.enabled}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
            />
            <label htmlFor="notifyUsers" className="text-sm text-gray-700">
              Kullanıcıları Zamanlanmış Bakım Hakkında Bilgilendir
            </label>
          </div>
        </div>
      </div>

      {/* Information Box */}
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
              Bakım Modu Hakkında
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc space-y-1 pl-5">
                <li>
                  Bakım modu aktif olduğunda normal kullanıcılar siteye erişemez
                </li>
                <li>
                  İzin verilen IP listesindeki adresler her zaman erişebilir
                </li>
                <li>Zamanlanmış bakım otomatik olarak başlar ve biter</li>
                <li>
                  Kullanıcılar bildirimleri e-posta ve site içi mesaj olarak
                  alır
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Warning */}
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
                Bakım modunu etkinleştirmeden önce kullanıcıları
                bilgilendirmeniz ve mevcut işlemlerin tamamlanmasını beklemeniz
                önerilir.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
