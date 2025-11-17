/**
 * ================================================
 * ESCROW BALANCE CARD
 * ================================================
 * Display wallet escrow breakdown with order details
 * Sprint 1 - Story 2.1 (8 pts)
 *
 * Features:
 * - Total/Available/Locked (escrow) balance breakdown
 * - List of escrow holds per order
 * - Milestone titles and amounts
 * - Visual progress indicators
 * - Currency formatting
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 1 - Milestone Payment System
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Shield,
  TrendingUp,
  Lock,
  Unlock,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { formatCurrency } from '@/lib/shared/formatters/currency';
import { Skeleton } from '@/components/ui/Skeleton';
import Link from 'next/link';

// ============================================================================
// TYPES
// ============================================================================

export interface EscrowDetail {
  /** Order ID */
  orderId: number;
  /** Order title */
  orderTitle: string;
  /** Total escrow amount for this order */
  totalAmount: number;
  /** Currency code (e.g., TRY, USD) */
  currency: string;
  /** Number of milestones locked in escrow */
  milestoneCount: number;
  /** Milestone breakdown (optional) */
  milestones?: Array<{
    id: number;
    title: string;
    amount: number;
    status: string;
  }>;
}

export interface EscrowBalanceCardProps {
  /** Total wallet balance */
  totalBalance: number;
  /** Available balance (can withdraw) */
  availableBalance: number;
  /** Locked balance (in escrow) */
  lockedBalance: number;
  /** Currency code */
  currency?: string;
  /** List of escrow details per order */
  escrowDetails?: EscrowDetail[];
  /** Loading state */
  isLoading?: boolean;
  /** Compact mode (hide details) */
  compact?: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * EscrowBalanceCard Component
 *
 * @example
 * ```tsx
 * <EscrowBalanceCard
 *   totalBalance={5000}
 *   availableBalance={3000}
 *   lockedBalance={2000}
 *   currency="TRY"
 *   escrowDetails={[...]}
 *   isLoading={false}
 * />
 * ```
 */
export function EscrowBalanceCard({
  totalBalance,
  availableBalance,
  lockedBalance,
  currency = 'TRY',
  escrowDetails = [],
  isLoading = false,
  compact = false,
}: EscrowBalanceCardProps) {
  // ========== CALCULATIONS ==========

  const lockedPercentage =
    totalBalance > 0 ? (lockedBalance / totalBalance) * 100 : 0;

  const hasEscrowHolds = escrowDetails.length > 0;

  // ========== LOADING STATE ==========

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="mb-4 h-6 w-48" />
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </Card>
    );
  }

  // ========== RENDER ==========

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-purple-50 to-blue-50 p-6 dark:from-purple-900/20 dark:to-blue-900/20">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white p-2.5 shadow-sm dark:bg-gray-800">
              <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Bakiye Detayı
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Toplam ve emanet dağılımı
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Balance Breakdown */}
      <div className="grid gap-4 p-6 md:grid-cols-3">
        {/* Total Balance */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Toplam Bakiye
            </span>
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(totalBalance, currency)}
          </p>
        </div>

        {/* Available Balance */}
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <div className="mb-2 flex items-center gap-2">
            <Unlock className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Kullanılabilir
            </span>
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(availableBalance, currency)}
          </p>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            Çekilebilir tutar
          </p>
        </div>

        {/* Locked Balance */}
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
          <div className="mb-2 flex items-center gap-2">
            <Lock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Emanette
            </span>
          </div>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {formatCurrency(lockedBalance, currency)}
          </p>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            {lockedPercentage.toFixed(1)}% kilitli
          </p>
        </div>
      </div>

      {/* Escrow Details */}
      {!compact && hasEscrowHolds && (
        <div className="border-t p-6">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
              Emanet Detayları
            </h4>
            <Badge variant="outline" className="gap-1">
              <Lock className="h-3 w-3" />
              {escrowDetails.length} Sipariş
            </Badge>
          </div>

          <div className="space-y-3">
            {escrowDetails.map((detail) => (
              <div
                key={detail.orderId}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <Link
                        href={`/dashboard/orders/${detail.orderId}`}
                        className="group flex items-center gap-1.5 font-medium text-gray-900 hover:text-purple-600 dark:text-gray-100 dark:hover:text-purple-400"
                      >
                        <span className="truncate">{detail.orderTitle}</span>
                        <ExternalLink className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                      </Link>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Sipariş #{detail.orderId} • {detail.milestoneCount}{' '}
                      milestone
                    </p>

                    {/* Milestone Breakdown */}
                    {detail.milestones && detail.milestones.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        {detail.milestones.map((milestone) => (
                          <div
                            key={milestone.id}
                            className="flex items-center justify-between rounded border border-gray-200 bg-white px-3 py-1.5 text-xs dark:border-gray-600 dark:bg-gray-700"
                          >
                            <span className="truncate text-gray-700 dark:text-gray-300">
                              {milestone.title}
                            </span>
                            <span className="ml-2 flex-shrink-0 font-medium text-gray-900 dark:text-gray-100">
                              {formatCurrency(
                                milestone.amount,
                                detail.currency
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0 text-right">
                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      {formatCurrency(detail.totalAmount, detail.currency)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Escrow Info */}
      {!compact && !hasEscrowHolds && lockedBalance > 0 && (
        <div className="border-t p-6">
          <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Emanet detayları yükleniyor
              </p>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Kilitli bakiye var ancak detaylar şu anda görüntülenemiyor.
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

export default EscrowBalanceCard;
