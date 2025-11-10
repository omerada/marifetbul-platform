/**
 * ================================================
 * PAYMENT MODE SELECTOR COMPONENT
 * ================================================
 * SPRINT 1 - Epic 1 - Story 1.1
 *
 * Allows users to choose between Escrow and Manual IBAN payment modes
 *
 * Features:
 * - Visual card selection
 * - Clear descriptions and benefits
 * - Accessible keyboard navigation
 * - Responsive design
 * - Hover/focus states
 * - Icons for visual clarity
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 1
 */

'use client';

import React from 'react';
import { Shield, Building2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PaymentMode = 'ESCROW_PROTECTED' | 'MANUAL_IBAN';

interface PaymentModeSelectorProps {
  /**
   * Currently selected payment mode
   */
  selectedMode: PaymentMode;
  
  /**
   * Callback when mode changes
   */
  onModeChange: (mode: PaymentMode) => void;
  
  /**
   * Disable selection (e.g., during submission)
   */
  disabled?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Show prices/fees (optional)
   */
  showFees?: boolean;
}

interface PaymentOption {
  mode: PaymentMode;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  benefits: string[];
  badge?: string;
  recommended?: boolean;
  platformFee?: string;
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    mode: 'ESCROW_PROTECTED',
    title: 'Güvenli Ödeme (Escrow)',
    description: 'Platform garantili, güvenli online ödeme',
    icon: Shield,
    badge: 'Önerilen',
    recommended: true,
    platformFee: '%5 + KDV',
    benefits: [
      'Anında sipariş onayı',
      'Platform güvencesi',
      'Otomatik ödeme süreci',
      'İade garantisi',
      'Hızlı çözüm süreçleri',
    ],
  },
  {
    mode: 'MANUAL_IBAN',
    title: 'IBAN ile Ödeme',
    description: 'Doğrudan freelancer\'a banka transferi',
    icon: Building2,
    platformFee: 'Platform ücreti yok',
    benefits: [
      'Daha düşük maliyetli',
      'Doğrudan transfer',
      'İki taraflı onay sistemi',
      'Ödeme kanıtı yükleme',
      'Freelancer onayı gerekli',
    ],
  },
];

export function PaymentModeSelector({
  selectedMode,
  onModeChange,
  disabled = false,
  className,
  showFees = true,
}: PaymentModeSelectorProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-gray-900">
          Ödeme Yöntemini Seçin
        </h3>
        <p className="text-sm text-gray-600">
          Sipariş için ödeme şeklinizi belirleyin
        </p>
      </div>

      {/* Payment Options Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {PAYMENT_OPTIONS.map((option) => {
          const isSelected = selectedMode === option.mode;
          const Icon = option.icon;

          return (
            <button
              key={option.mode}
              type="button"
              onClick={() => !disabled && onModeChange(option.mode)}
              disabled={disabled}
              className={cn(
                'relative flex flex-col rounded-lg border-2 p-6 text-left transition-all',
                'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                isSelected
                  ? 'border-blue-600 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300',
                disabled && 'cursor-not-allowed opacity-50',
                !disabled && 'cursor-pointer'
              )}
              aria-pressed={isSelected}
              aria-label={`${option.title} seç`}
            >
              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute right-4 top-4">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}

              {/* Badge (Recommended) */}
              {option.recommended && (
                <div className="absolute left-4 top-4">
                  <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                    {option.badge}
                  </span>
                </div>
              )}

              {/* Icon & Title */}
              <div className="mb-4 mt-2 flex items-start gap-3">
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-lg',
                    isSelected ? 'bg-blue-600' : 'bg-gray-100'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-6 w-6',
                      isSelected ? 'text-white' : 'text-gray-600'
                    )}
                  />
                </div>
                <div className="flex-1">
                  <h4
                    className={cn(
                      'text-base font-semibold',
                      isSelected ? 'text-blue-900' : 'text-gray-900'
                    )}
                  >
                    {option.title}
                  </h4>
                  <p
                    className={cn(
                      'mt-1 text-sm',
                      isSelected ? 'text-blue-700' : 'text-gray-600'
                    )}
                  >
                    {option.description}
                  </p>
                </div>
              </div>

              {/* Platform Fee */}
              {showFees && option.platformFee && (
                <div className="mb-3">
                  <div
                    className={cn(
                      'inline-flex rounded px-2 py-1 text-xs font-medium',
                      isSelected
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-700'
                    )}
                  >
                    {option.platformFee}
                  </div>
                </div>
              )}

              {/* Benefits List */}
              <ul className="space-y-2">
                {option.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check
                      className={cn(
                        'mt-0.5 h-4 w-4 flex-shrink-0',
                        isSelected ? 'text-blue-600' : 'text-gray-400'
                      )}
                    />
                    <span
                      className={cn(
                        isSelected ? 'text-blue-900' : 'text-gray-600'
                      )}
                    >
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      {/* Helper Text */}
      <div className="rounded-lg bg-gray-50 p-4">
        <div className="flex gap-3">
          <Shield className="h-5 w-5 flex-shrink-0 text-gray-600" />
          <div className="text-sm text-gray-700">
            <p className="font-medium">Güvenli Ödeme Garantisi</p>
            <p className="mt-1 text-gray-600">
              Her iki ödeme yönteminde de işlemleriniz güvence altındadır.
              Escrow ödemelerde para iş tamamlanana kadar platformda tutulur,
              IBAN ödemelerinde ise iki taraflı onay sistemi ile güvenlik
              sağlanır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Get human-readable label for payment mode
 */
export function getPaymentModeLabel(mode: PaymentMode): string {
  return PAYMENT_OPTIONS.find((o) => o.mode === mode)?.title || mode;
}

/**
 * Get payment mode description
 */
export function getPaymentModeDescription(mode: PaymentMode): string {
  return (
    PAYMENT_OPTIONS.find((o) => o.mode === mode)?.description ||
    'Ödeme yöntemi'
  );
}
