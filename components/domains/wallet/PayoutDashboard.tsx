'use client';

/**
 * ============================================================================
 * PayoutDashboard Component
 * ============================================================================
 * Purpose: Main dashboard for payout/withdrawal system
 * Features:
 * - Eligibility check display
 * - Payout limits and remaining amounts
 * - Quick payout request button
 * - Statistics summary (total payouts, pending, completed)
 * - Recent payouts preview
 *
 * Part of: Sprint 1 Days 6-7 (Payout System UI)
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Info,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/shared/formatters';
import {
  PayoutStatus,
  type Payout,
  type PayoutLimits,
  type PayoutEligibility,
} from '@/types/business/features/wallet';
import { formatDistanceToNow, format } from 'date-fns';
import { tr } from 'date-fns/locale';

// ============================================================================
// TYPES
// ============================================================================

export interface PayoutDashboardProps {
  /** Available balance for payout */
  availableBalance: number;
  /** Payout limits */
  limits: PayoutLimits;
  /** Eligibility information */
  eligibility: PayoutEligibility;
  /** Recent payouts */
  recentPayouts: Payout[];
  /** All payouts for statistics */
  allPayouts: Payout[];
  /** Loading state */
  isLoading?: boolean;
  /** Callback when request payout clicked */
  onRequestPayout?: () => void;
  /** Callback when view all payouts clicked */
  onViewAllPayouts?: () => void;
}

interface PayoutStats {
  totalPayouts: number;
  totalAmount: number;
  pendingCount: number;
  pendingAmount: number;
  completedCount: number;
  completedAmount: number;
  failedCount: number;
  thisMonthAmount: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate payout statistics
 */
function calculateStats(payouts: Payout[]): PayoutStats {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return payouts.reduce(
    (stats, payout) => {
      stats.totalPayouts++;
      stats.totalAmount += payout.amount;

      // By status
      if (
        payout.status === PayoutStatus.PENDING ||
        payout.status === PayoutStatus.PROCESSING
      ) {
        stats.pendingCount++;
        stats.pendingAmount += payout.amount;
      } else if (payout.status === PayoutStatus.COMPLETED) {
        stats.completedCount++;
        stats.completedAmount += payout.amount;
      } else if (payout.status === PayoutStatus.FAILED) {
        stats.failedCount++;
      }

      // This month
      const payoutDate = new Date(payout.requestedAt);
      if (
        payoutDate.getMonth() === currentMonth &&
        payoutDate.getFullYear() === currentYear
      ) {
        stats.thisMonthAmount += payout.amount;
      }

      return stats;
    },
    {
      totalPayouts: 0,
      totalAmount: 0,
      pendingCount: 0,
      pendingAmount: 0,
      completedCount: 0,
      completedAmount: 0,
      failedCount: 0,
      thisMonthAmount: 0,
    } as PayoutStats
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PayoutDashboard({
  availableBalance,
  limits,
  eligibility,
  recentPayouts,
  allPayouts,
  isLoading = false,
  onRequestPayout,
  onViewAllPayouts,
}: PayoutDashboardProps) {
  // State
  const [stats, setStats] = useState<PayoutStats>({
    totalPayouts: 0,
    totalAmount: 0,
    pendingCount: 0,
    pendingAmount: 0,
    completedCount: 0,
    completedAmount: 0,
    failedCount: 0,
    thisMonthAmount: 0,
  });

  // Calculate stats when payouts change
  useEffect(() => {
    setStats(calculateStats(allPayouts));
  }, [allPayouts]);

  // Calculate remaining limits
  const remainingDaily = limits.dailyLimit - (eligibility.pendingPayouts || 0);
  const remainingMonthly = limits.monthlyLimit - stats.thisMonthAmount;

  return (
    <div className="space-y-6">
      {/* Eligibility Banner */}
      {!eligibility.canRequestPayout && (
        <div className="flex items-start gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950/20">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
          <div className="flex-1">
            <p className="mb-1 font-medium text-yellow-900 dark:text-yellow-100">
              Çekim Talebinde Bulunamazsınız
            </p>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              {eligibility.reason || 'Çekim şartları sağlanmamaktadır'}
            </p>
            {eligibility.nextEligibleDate && (
              <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                Sonraki uygun tarih:{' '}
                {format(new Date(eligibility.nextEligibleDate), 'dd MMM yyyy', {
                  locale: tr,
                })}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Available Balance */}
        <div className="rounded-lg border border-green-200 bg-gradient-to-br from-green-50 to-transparent p-4 dark:border-green-800 dark:from-green-950/20">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-muted-foreground text-sm">
              Kullanılabilir Bakiye
            </span>
            <Download className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">
            {formatCurrency(availableBalance)}
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            Min: {formatCurrency(limits.minAmount)} | Max:{' '}
            {formatCurrency(limits.maxAmount)}
          </p>
        </div>

        {/* Pending Payouts */}
        <div className="rounded-lg border p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-muted-foreground text-sm">
              Bekleyen Çekimler
            </span>
            <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="text-2xl font-bold">{stats.pendingCount}</div>
          <p className="text-muted-foreground mt-1 text-xs">
            {formatCurrency(stats.pendingAmount)}
          </p>
        </div>

        {/* Completed Payouts */}
        <div className="rounded-lg border p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-muted-foreground text-sm">
              Tamamlanan Çekimler
            </span>
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-2xl font-bold">{stats.completedCount}</div>
          <p className="text-muted-foreground mt-1 text-xs">
            {formatCurrency(stats.completedAmount)}
          </p>
        </div>

        {/* This Month */}
        <div className="rounded-lg border p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Bu Ay Toplam</span>
            <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-bold">
            {formatCurrency(stats.thisMonthAmount)}
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            Kalan: {formatCurrency(remainingMonthly)}
          </p>
        </div>
      </div>

      {/* Limits Info */}
      <div className="rounded-lg border p-4">
        <div className="mb-3 flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold">Çekim Limitleri</h3>
        </div>

        <div className="space-y-3">
          {/* Daily Limit */}
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Günlük Limit</span>
              <span className="font-medium">
                {formatCurrency(remainingDaily)} /{' '}
                {formatCurrency(limits.dailyLimit)}
              </span>
            </div>
            <div className="bg-muted h-2 overflow-hidden rounded-full">
              <div
                className="h-full bg-blue-600 transition-all dark:bg-blue-400"
                style={{
                  width: `${Math.max(0, Math.min(100, (remainingDaily / limits.dailyLimit) * 100))}%`,
                }}
              />
            </div>
          </div>

          {/* Monthly Limit */}
          <div>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Aylık Limit</span>
              <span className="font-medium">
                {formatCurrency(remainingMonthly)} /{' '}
                {formatCurrency(limits.monthlyLimit)}
              </span>
            </div>
            <div className="bg-muted h-2 overflow-hidden rounded-full">
              <div
                className="h-full bg-purple-600 transition-all dark:bg-purple-400"
                style={{
                  width: `${Math.max(0, Math.min(100, (remainingMonthly / limits.monthlyLimit) * 100))}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Minimum Balance Info */}
        {eligibility.minimumBalance > 0 && (
          <div className="mt-3 border-t pt-3">
            <p className="text-muted-foreground text-sm">
              Minimum bakiye gereksinimi:{' '}
              <span className="font-medium">
                {formatCurrency(eligibility.minimumBalance)}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-3">
        <Button
          onClick={onRequestPayout}
          disabled={
            !eligibility.canRequestPayout || availableBalance < limits.minAmount
          }
          className="flex-1"
          size="lg"
        >
          <Download className="mr-2 h-4 w-4" />
          Çekim Talebi Oluştur
        </Button>
        {onViewAllPayouts && (
          <Button variant="outline" onClick={onViewAllPayouts} size="lg">
            Tüm Çekimler
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Recent Payouts */}
      {recentPayouts.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Son Çekimler</h3>
            {onViewAllPayouts && (
              <Button variant="ghost" size="sm" onClick={onViewAllPayouts}>
                Tümünü Gör
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="divide-y rounded-lg border">
            {recentPayouts.slice(0, 5).map((payout) => (
              <div
                key={payout.id}
                className="hover:bg-muted/30 p-4 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-medium">
                        {formatCurrency(payout.amount)}
                      </span>
                      <Badge
                        variant={
                          payout.status === PayoutStatus.COMPLETED
                            ? 'success'
                            : payout.status === PayoutStatus.FAILED
                              ? 'destructive'
                              : 'warning'
                        }
                        className="text-xs"
                      >
                        {payout.status === PayoutStatus.PENDING && 'Beklemede'}
                        {payout.status === PayoutStatus.PROCESSING &&
                          'İşleniyor'}
                        {payout.status === PayoutStatus.COMPLETED &&
                          'Tamamlandı'}
                        {payout.status === PayoutStatus.FAILED && 'Başarısız'}
                        {payout.status === PayoutStatus.CANCELLED &&
                          'İptal Edildi'}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {payout.description || 'Çekim talebi'}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {format(new Date(payout.requestedAt), 'dd MMM', {
                        locale: tr,
                      })}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {formatDistanceToNow(new Date(payout.requestedAt), {
                        addSuffix: true,
                        locale: tr,
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && recentPayouts.length === 0 && (
        <div className="border-border rounded-lg border-2 border-dashed py-12 text-center">
          <TrendingDown className="text-muted-foreground/50 mx-auto mb-3 h-12 w-12" />
          <p className="mb-1 font-medium">Henüz çekim talebiniz yok</p>
          <p className="text-muted-foreground mb-4 text-sm">
            Kazancınızı banka hesabınıza aktarmak için çekim talebi oluşturun
          </p>
          <Button
            onClick={onRequestPayout}
            disabled={
              !eligibility.canRequestPayout ||
              availableBalance < limits.minAmount
            }
            size="sm"
          >
            <Download className="mr-2 h-4 w-4" />
            İlk Çekim Talebini Oluştur
          </Button>
        </div>
      )}
    </div>
  );
}
