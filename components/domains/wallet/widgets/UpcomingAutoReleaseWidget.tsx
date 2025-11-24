/**
 * ================================================
 * UPCOMING AUTO-RELEASE WIDGET
 * ================================================
 * Dashboard widget showing escrow items scheduled for auto-release within 24 hours
 *
 * Features:
 * - Countdown timers for each item
 * - Object Release button (buyer can object)
 * - Real-time updates every 60 seconds
 * - Empty state when no upcoming releases
 * - Urgency indicators (< 6h = critical)
 *
 * Sprint 1 - Story 1.4: Escrow Auto-Release Dashboard Widget (5 SP)
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, Shield, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/shared/formatters';
import { cn } from '@/lib/utils';
import type { UpcomingReleaseItem } from '@/hooks/business/wallet/useUpcomingEscrowReleases';

// ============================================================================
// TYPES
// ============================================================================

export interface UpcomingAutoReleaseWidgetProps {
  /** List of upcoming release items */
  items: UpcomingReleaseItem[];

  /** Loading state */
  isLoading?: boolean;

  /** Error state */
  error?: Error | null;

  /** Callback when object release is clicked */
  onObjectRelease?: (item: UpcomingReleaseItem) => void;

  /** Callback when refresh is clicked */
  onRefresh?: () => void;

  /** Additional CSS classes */
  className?: string;
}

interface CountdownState {
  [itemId: string]: {
    hours: number;
    minutes: number;
    seconds: number;
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate countdown from hours remaining
 */
function calculateCountdown(hoursRemaining: number): {
  hours: number;
  minutes: number;
  seconds: number;
} {
  const totalSeconds = hoursRemaining * 3600;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return { hours, minutes, seconds };
}

/**
 * Format countdown for display
 */
function formatCountdown(
  hours: number,
  minutes: number,
  seconds: number
): string {
  if (hours > 0) {
    return `${hours}s ${minutes}d`;
  }
  if (minutes > 0) {
    return `${minutes}d ${seconds}sn`;
  }
  return `${seconds}sn`;
}

/**
 * Get urgency level based on hours remaining
 */
function getUrgencyLevel(
  hoursRemaining: number
): 'critical' | 'warning' | 'normal' {
  if (hoursRemaining < 6) return 'critical';
  if (hoursRemaining < 12) return 'warning';
  return 'normal';
}

// ============================================================================
// COMPONENT
// ============================================================================

export function UpcomingAutoReleaseWidget({
  items,
  isLoading = false,
  error = null,
  onObjectRelease,
  onRefresh,
  className,
}: UpcomingAutoReleaseWidgetProps) {
  const [countdowns, setCountdowns] = useState<CountdownState>({});

  // Update countdowns every second
  useEffect(() => {
    if (!items || items.length === 0) return;

    // Initialize countdowns
    const initialCountdowns: CountdownState = {};
    items.forEach((item) => {
      initialCountdowns[item.id] = calculateCountdown(item.hoursRemaining);
    });
    setCountdowns(initialCountdowns);

    // Update every second
    const interval = setInterval(() => {
      setCountdowns((prev) => {
        const updated: CountdownState = {};
        items.forEach((item) => {
          const current = prev[item.id];
          if (!current) {
            updated[item.id] = calculateCountdown(item.hoursRemaining);
            return;
          }

          // Decrement seconds
          let { hours, minutes, seconds } = current;
          seconds--;

          if (seconds < 0) {
            seconds = 59;
            minutes--;
          }
          if (minutes < 0) {
            minutes = 59;
            hours--;
          }
          if (hours < 0) {
            hours = 0;
            minutes = 0;
            seconds = 0;
          }

          updated[item.id] = { hours, minutes, seconds };
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [items]);

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleObjectRelease = (item: UpcomingReleaseItem) => {
    if (onObjectRelease) {
      onObjectRelease(item);
    }
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <Card className={cn('p-6', className)}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/20">
            <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              Yaklaşan Otomatik Serbest Bırakma
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              24 saat içinde otomatik olarak serbest bırakılacak emanetler
            </p>
          </div>
        </div>

        {/* Refresh Button */}
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            aria-label="Yenile"
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
            <div>
              <h4 className="font-medium text-red-900 dark:text-red-200">
                Veri Yüklenirken Hata Oluştu
              </h4>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                {error.message || 'Yaklaşan serbest bırakmalar yüklenemedi.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !error && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && items.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center dark:border-gray-700">
          <Shield className="mx-auto h-12 w-12 text-gray-400" />
          <h4 className="mt-4 font-medium text-gray-900 dark:text-gray-100">
            Yaklaşan Otomatik Serbest Bırakma Yok
          </h4>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Şu anda 24 saat içinde otomatik olarak serbest bırakılacak emanet
            bulunmuyor.
          </p>
        </div>
      )}

      {/* Items List */}
      {!isLoading && !error && items.length > 0 && (
        <div className="space-y-3">
          {items.map((item) => {
            const urgency = getUrgencyLevel(item.hoursRemaining);
            const countdown = countdowns[item.id];

            return (
              <div
                key={item.id}
                className={cn(
                  'rounded-lg border p-4 transition-colors',
                  urgency === 'critical' &&
                    'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10',
                  urgency === 'warning' &&
                    'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/10',
                  urgency === 'normal' &&
                    'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Item Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="truncate font-medium text-gray-900 dark:text-gray-100">
                        {item.orderTitle || `Sipariş #${item.orderId}`}
                      </h4>
                      <Badge
                        variant={
                          urgency === 'critical'
                            ? 'destructive'
                            : urgency === 'warning'
                              ? 'warning'
                              : 'default'
                        }
                        className="flex-shrink-0"
                      >
                        {urgency === 'critical' && (
                          <AlertTriangle className="mr-1 h-3 w-3" />
                        )}
                        {countdown
                          ? formatCountdown(
                              countdown.hours,
                              countdown.minutes,
                              countdown.seconds
                            )
                          : `${item.hoursRemaining}s`}
                      </Badge>
                    </div>

                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(item.amount, item.currency)}
                      </span>
                      <span className="text-xs">Sipariş: {item.orderId}</span>
                    </div>

                    {urgency === 'critical' && (
                      <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                        <AlertTriangle className="mr-1 inline h-3 w-3" />
                        Acil! İtiraz etmek için son fırsatınız
                      </p>
                    )}
                  </div>

                  {/* Action Button */}
                  {item.canObjectRelease && (
                    <Button
                      variant={
                        urgency === 'critical' ? 'destructive' : 'outline'
                      }
                      size="sm"
                      onClick={() => handleObjectRelease(item)}
                      className="flex-shrink-0"
                    >
                      İtiraz Et
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Info */}
      {!isLoading && !error && items.length > 0 && (
        <div className="mt-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            💡 <strong>Bilgi:</strong> İtiraz etmezseniz, emanet tutarlar
            otomatik olarak satıcıya aktarılacaktır. İtiraz etmek ihtilaf
            sürecini başlatır.
          </p>
        </div>
      )}
    </Card>
  );
}

export default UpcomingAutoReleaseWidget;
