/**
 * Payment Settings Panel
 *
 * Panel for managing payment-related settings including platform fees,
 * withdrawal limits, escrow configuration, and refund policies.
 */

import { Input } from '@/components/ui/Input';
import type { PlatformSettings } from '../hooks/useAdminSettings';

interface PaymentSettingsPanelProps {
  settings: PlatformSettings['payment'];
  onUpdate: (
    field: keyof PlatformSettings['payment'],
    value: string | number | boolean | string[]
  ) => void;
  onUpdateNested: (
    nestedField: 'refundPolicy',
    field: string,
    value: number | boolean
  ) => void;
}

export function PaymentSettingsPanel({
  settings,
  onUpdate,
  onUpdateNested,
}: PaymentSettingsPanelProps) {
  return (
    <div className="space-y-6">
      {/* Platform Fees */}
      <div>
        <h4 className="mb-3 text-sm font-medium text-gray-700">
          Platform Komisyonları
        </h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Komisyon Oranı (%)
            </label>
            <Input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={settings.platformFee}
              onChange={(e) =>
                onUpdate('platformFee', parseFloat(e.target.value))
              }
              className="mt-1"
            />
            <p className="mt-1 text-xs text-gray-500">
              İşlem başına alınan yüzde
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Para Çekme Ücreti (₺)
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={settings.withdrawalFee}
              onChange={(e) =>
                onUpdate('withdrawalFee', parseFloat(e.target.value))
              }
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Withdrawal Settings */}
      <div>
        <h4 className="mb-3 text-sm font-medium text-gray-700">
          Para Çekme Ayarları
        </h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Minimum Çekim (₺)
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={settings.minimumWithdrawal}
              onChange={(e) =>
                onUpdate('minimumWithdrawal', parseFloat(e.target.value))
              }
              className="mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Emanet Süresi (gün)
            </label>
            <Input
              type="number"
              min="0"
              max="90"
              value={settings.escrowPeriod}
              onChange={(e) =>
                onUpdate('escrowPeriod', parseInt(e.target.value))
              }
              className="mt-1"
            />
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="taxCalculation"
              checked={settings.taxCalculation}
              onChange={(e) => onUpdate('taxCalculation', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="taxCalculation" className="text-sm text-gray-700">
              Vergi Hesaplama
            </label>
          </div>
        </div>
      </div>

      {/* Other Settings */}
      <div>
        <h4 className="mb-3 text-sm font-medium text-gray-700">
          Diğer Ayarlar
        </h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="automaticRelease"
              checked={settings.automaticRelease}
              onChange={(e) => onUpdate('automaticRelease', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="automaticRelease" className="text-sm text-gray-700">
              Otomatik Para Serbest Bırakma
            </label>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="invoiceGeneration"
              checked={settings.invoiceGeneration}
              onChange={(e) => onUpdate('invoiceGeneration', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="invoiceGeneration"
              className="text-sm text-gray-700"
            >
              Otomatik Fatura Oluşturma
            </label>
          </div>
        </div>
      </div>

      {/* Refund Policy */}
      <div>
        <h4 className="mb-3 text-sm font-medium text-gray-700">
          İade Politikası
        </h4>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="allowRefunds"
              checked={settings.refundPolicy.allowRefunds}
              onChange={(e) =>
                onUpdateNested('refundPolicy', 'allowRefunds', e.target.checked)
              }
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="allowRefunds"
              className="text-sm font-medium text-gray-700"
            >
              İadeleri Etkinleştir
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                İade Süresi (gün)
              </label>
              <Input
                type="number"
                min="0"
                max="365"
                value={settings.refundPolicy.refundPeriod}
                onChange={(e) =>
                  onUpdateNested(
                    'refundPolicy',
                    'refundPeriod',
                    parseInt(e.target.value)
                  )
                }
                className="mt-1"
                disabled={!settings.refundPolicy.allowRefunds}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                İade Ücreti (₺)
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={settings.refundPolicy.refundFee}
                onChange={(e) =>
                  onUpdateNested(
                    'refundPolicy',
                    'refundFee',
                    parseFloat(e.target.value)
                  )
                }
                className="mt-1"
                disabled={!settings.refundPolicy.allowRefunds}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="partialRefunds"
                checked={settings.refundPolicy.partialRefunds}
                onChange={(e) =>
                  onUpdateNested(
                    'refundPolicy',
                    'partialRefunds',
                    e.target.checked
                  )
                }
                disabled={!settings.refundPolicy.allowRefunds}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
              />
              <label htmlFor="partialRefunds" className="text-sm text-gray-700">
                Kısmi İadelere İzin Ver
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="automaticRefunds"
                checked={settings.refundPolicy.automaticRefunds}
                onChange={(e) =>
                  onUpdateNested(
                    'refundPolicy',
                    'automaticRefunds',
                    e.target.checked
                  )
                }
                disabled={!settings.refundPolicy.allowRefunds}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
              />
              <label
                htmlFor="automaticRefunds"
                className="text-sm text-gray-700"
              >
                Otomatik İade İşleme
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div>
        <h4 className="mb-3 text-sm font-medium text-gray-700">
          Ödeme Yöntemleri
        </h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="creditCard"
              checked={settings.supportedPaymentMethods.includes('credit_card')}
              onChange={(e) => {
                const methods = e.target.checked
                  ? [...settings.supportedPaymentMethods, 'credit_card']
                  : settings.supportedPaymentMethods.filter(
                      (m) => m !== 'credit_card'
                    );
                onUpdate('supportedPaymentMethods', methods);
              }}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="creditCard" className="text-sm text-gray-700">
              Kredi Kartı
            </label>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="bankTransfer"
              checked={settings.supportedPaymentMethods.includes(
                'bank_transfer'
              )}
              onChange={(e) => {
                const methods = e.target.checked
                  ? [...settings.supportedPaymentMethods, 'bank_transfer']
                  : settings.supportedPaymentMethods.filter(
                      (m) => m !== 'bank_transfer'
                    );
                onUpdate('supportedPaymentMethods', methods);
              }}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="bankTransfer" className="text-sm text-gray-700">
              Banka Transferi
            </label>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="wallet"
              checked={settings.supportedPaymentMethods.includes('wallet')}
              onChange={(e) => {
                const methods = e.target.checked
                  ? [...settings.supportedPaymentMethods, 'wallet']
                  : settings.supportedPaymentMethods.filter(
                      (m) => m !== 'wallet'
                    );
                onUpdate('supportedPaymentMethods', methods);
              }}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="wallet" className="text-sm text-gray-700">
              Cüzdan
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
