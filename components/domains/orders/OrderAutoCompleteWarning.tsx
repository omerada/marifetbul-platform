/**
 * Order Auto-Complete Warning Banner
 *
 * Production-ready warning banner for orders nearing auto-completion:
 * - Shows warning 24 hours before auto-release
 * - Real-time countdown display
 * - Quick objection action
 * - Urgency visual indicators
 * - Clear explanation of consequences
 *
 * @module components/domains/orders/OrderAutoCompleteWarning
 * @version 1.0.0
 * @production-ready ✅
 */

'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Shield, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface OrderAutoCompleteWarningProps {
  /** Order ID */
  orderId: string;
  /** Order number for display */
  orderNumber: string;
  /** Order amount */
  amount: number;
  /** Currency */
  currency?: string;
  /** Delivered date (ISO string) */
  deliveredAt: string;
  /** Auto-complete threshold in days (default: 7) */
  autoCompleteDays?: number;
  /** Callback when object button is clicked */
  onObjectRelease?: () => void;
  /** Callback when banner is dismissed */
  onDismiss?: () => void;
  /** Additional CSS classes */
  className?: string;
}

interface CountdownState {
  hours: number;
  minutes: number;
  seconds: number;
  totalHours: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate auto-release date
 */
function calculateAutoReleaseDate(
  deliveredAt: string,
  autoCompleteDays: number
): Date {
  const delivered = new Date(deliveredAt);
  const autoRelease = new Date(delivered);
  autoRelease.setDate(autoRelease.getDate() + autoCompleteDays);
  return autoRelease;
}

/**
 * Calculate countdown
 */
function calculateCountdown(autoReleaseDate: Date): CountdownState {
  const now = new Date();
  const diff = autoReleaseDate.getTime() - now.getTime();

  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, totalHours: 0 };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const totalHours = diff / (1000 * 60 * 60);

  return { hours, minutes, seconds, totalHours };
}

/**
 * Get urgency level
 */
function getUrgencyLevel(
  totalHours: number
): 'critical' | 'warning' | 'normal' {
  if (totalHours < 6) return 'critical';
  if (totalHours < 12) return 'warning';
  return 'normal';
}

// ============================================================================
// COMPONENT
// ============================================================================

export function OrderAutoCompleteWarning({
  orderNumber,
  amount,
  currency = 'TRY',
  deliveredAt,
  autoCompleteDays = 7,
  onObjectRelease,
  onDismiss,
  className,
}: OrderAutoCompleteWarningProps) {
  const [countdown, setCountdown] = useState<CountdownState | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  const autoReleaseDate = calculateAutoReleaseDate(
    deliveredAt,
    autoCompleteDays
  );

  // Update countdown every second
  useEffect(() => {
    const updateCountdown = () => {
      const newCountdown = calculateCountdown(autoReleaseDate);
      setCountdown(newCountdown);

      // Auto-hide if expired
      if (newCountdown.totalHours <= 0) {
        setIsDismissed(true);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [autoReleaseDate]);

  // Handle dismiss
  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  // Don't render if dismissed or no countdown yet
  if (isDismissed || !countdown || countdown.totalHours <= 0) {
    return null;
  }

  const urgency = getUrgencyLevel(countdown.totalHours);

  // ============================================================================
  // URGENCY STYLES
  // ============================================================================

  const urgencyStyles = {
    critical: {
      bg: 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800',
      text: 'text-red-900 dark:text-red-100',
      icon: 'text-red-600 dark:text-red-400',
      badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
      button: 'bg-red-600 hover:bg-red-700 text-white',
    },
    warning: {
      bg: 'bg-orange-50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-800',
      text: 'text-orange-900 dark:text-orange-100',
      icon: 'text-orange-600 dark:text-orange-400',
      badge:
        'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200',
      button: 'bg-orange-600 hover:bg-orange-700 text-white',
    },
    normal: {
      bg: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800',
      text: 'text-yellow-900 dark:text-yellow-100',
      icon: 'text-yellow-600 dark:text-yellow-400',
      badge:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
      button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    },
  };

  const styles = urgencyStyles[urgency];

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div
      className={cn(
        'relative rounded-lg border-2 p-4 shadow-sm transition-all',
        styles.bg,
        className
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Dismiss Button */}
      {onDismiss && (
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 rounded-md p-1 opacity-70 hover:opacity-100 focus:ring-2 focus:ring-gray-400 focus:outline-none"
          aria-label="Uyarıyı kapat"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={cn('flex-shrink-0', styles.icon)}>
          <AlertTriangle className="h-6 w-6" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className={cn('text-sm font-semibold', styles.text)}>
                {urgency === 'critical' && '🚨 ACİL: '}
                Otomatik Tamamlanma Uyarısı
              </h3>
              <p className={cn('mt-1 text-sm', styles.text)}>
                Sipariş <span className="font-medium">#{orderNumber}</span>{' '}
                {countdown.totalHours < 1 ? (
                  <span className="font-bold">
                    {countdown.minutes} dakika {countdown.seconds} saniye
                  </span>
                ) : (
                  <span className="font-bold">
                    {countdown.hours} saat {countdown.minutes} dakika
                  </span>
                )}{' '}
                içinde otomatik olarak tamamlanacak ve{' '}
                <span className="font-semibold">
                  {amount.toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: currency,
                  })}
                </span>{' '}
                satıcıya serbest bırakılacaktır.
              </p>
            </div>

            {/* Countdown Badge */}
            <div
              className={cn(
                'flex-shrink-0 rounded-md px-3 py-1.5 text-sm font-semibold',
                styles.badge
              )}
            >
              <Clock className="mr-1 inline h-4 w-4" />
              {countdown.hours > 0 && `${countdown.hours}:`}
              {String(countdown.minutes).padStart(2, '0')}:
              {String(countdown.seconds).padStart(2, '0')}
            </div>
          </div>

          {/* Explanation */}
          <div className={cn('mt-3 space-y-1 text-xs', styles.text)}>
            <p className="flex items-start gap-1">
              <span className="mt-0.5 flex-shrink-0">•</span>
              <span>
                Sipariş{' '}
                {formatDistanceToNow(new Date(deliveredAt), {
                  locale: tr,
                  addSuffix: true,
                })}{' '}
                teslim edildi
              </span>
            </p>
            <p className="flex items-start gap-1">
              <span className="mt-0.5 flex-shrink-0">•</span>
              <span>
                {autoCompleteDays} gün içinde itiraz edilmezse ödeme otomatik
                olarak serbest bırakılır
              </span>
            </p>
            <p className="flex items-start gap-1">
              <span className="mt-0.5 flex-shrink-0">•</span>
              <span>
                İtiraz etmek emanet tutarını dondurur ve ihtilaf süreci başlatır
              </span>
            </p>
          </div>

          {/* Actions */}
          {onObjectRelease && (
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={onObjectRelease}
                className={cn(
                  'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none',
                  styles.button
                )}
              >
                <Shield className="h-4 w-4" />
                {urgency === 'critical'
                  ? 'Acil İtiraz Et'
                  : urgency === 'warning'
                    ? 'İtiraz Et'
                    : 'İtiraz Etmek İstiyorum'}
              </button>
              <span className={cn('text-xs', styles.text)}>
                İtiraz işlemi emanet tutarını güvence altına alır
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderAutoCompleteWarning;
