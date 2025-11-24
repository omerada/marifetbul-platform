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
 * - Mobile responsive design
 * - Loading states with skeleton
 * - Empty states for better UX
 *
 * Part of: Sprint 1 Story 1.1 (Payout Dashboard UX)
 * Updated: 2025-11-24 - Added responsive design, loading states, empty states
 * ============================================================================
 */

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
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BottomSheet } from '@/components/ui/BottomSheet';
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
  /** Error state */
  error?: Error | null;
  /** Callback when request payout clicked */
  onRequestPayout?: () => void;
  /** Callback when view all payouts clicked */
  onViewAllPayouts?: () => void;
  /** Callback when retry after error */
  onRetry?: () => void;
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
// LOADING SKELETON
// ============================================================================

function PayoutDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border p-4">
            <Skeleton className="mb-2 h-4 w-32" />
            <Skeleton className="mb-2 h-8 w-24" />
            <Skeleton className="h-3 w-40" />
          </div>
        ))}
      </div>

      {/* Limits Skeleton */}
      <div className="rounded-lg border p-4">
        <Skeleton className="mb-3 h-6 w-32" />
        <div className="space-y-3">
          <div>
            <Skeleton className="mb-1 h-4 w-full" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
          <div>
            <Skeleton className="mb-1 h-4 w-full" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        </div>
      </div>

      {/* Actions Skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-full sm:w-auto" />
      </div>

      {/* Recent Payouts Skeleton */}
      <div>
        <Skeleton className="mb-3 h-6 w-32" />
        <div className="divide-y rounded-lg border">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4">
              <Skeleton className="mb-2 h-5 w-24" />
              <Skeleton className="h-4 w-48" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ERROR STATE
// ============================================================================

interface ErrorStateProps {
  error: Error;
  onRetry?: () => void;
}

function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-red-200 bg-red-50/50 p-8 dark:border-red-800 dark:bg-red-950/20">
      <AlertCircle className="mb-4 h-12 w-12 text-red-600 dark:text-red-400" />
      <h3 className="mb-2 text-lg font-semibold text-red-900 dark:text-red-100">
        Veri Yüklenirken Hata Oluştu
      </h3>
      <p className="mb-6 max-w-md text-center text-sm text-red-800 dark:text-red-200">
        {error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.'}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Tekrar Dene
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// EMPTY STATE
// ============================================================================

interface EmptyStateProps {
  availableBalance: number;
  minAmount: number;
  canRequestPayout: boolean;
  onRequestPayout?: () => void;
}

function EmptyState({
  availableBalance,
  minAmount,
  canRequestPayout,
  onRequestPayout,
}: EmptyStateProps) {
  const hasInsufficientBalance = availableBalance < minAmount;

  return (
    <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 py-12 text-center dark:border-gray-800 dark:bg-gray-950/20">
      <TrendingDown className="mx-auto mb-4 h-16 w-16 text-gray-400 dark:text-gray-600" />
      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Henüz çekim talebiniz yok
      </h3>
      <p className="text-muted-foreground mb-6 text-sm">
        {hasInsufficientBalance
          ? `Çekim talebi oluşturmak için minimum ${formatCurrency(minAmount)} bakiyeye ihtiyacınız var.`
          : 'Kazancınızı banka hesabınıza aktarmak için çekim talebi oluşturun.'}
      </p>

      {hasInsufficientBalance ? (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
          <Info className="mx-auto mb-2 h-6 w-6 text-blue-600 dark:text-blue-400" />
          <p className="text-sm text-blue-900 dark:text-blue-100">
            Mevcut bakiyeniz: {formatCurrency(availableBalance)}
          </p>
          <p className="text-xs text-blue-800 dark:text-blue-200">
            Daha fazla kazanç elde edin veya bekleyen ödemelerinizin
            tamamlanmasını bekleyin.
          </p>
        </div>
      ) : (
        <Button
          onClick={onRequestPayout}
          disabled={!canRequestPayout}
          size="lg"
          className="shadow-lg"
        >
          <Download className="mr-2 h-5 w-5" />
          İlk Çekim Talebini Oluştur
        </Button>
      )}
    </div>
  );
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
  error = null,
  onRequestPayout,
  onViewAllPayouts,
  onRetry,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Calculate stats when payouts change
  useEffect(() => {
    if (!isLoading && allPayouts.length > 0) {
      setStats(calculateStats(allPayouts));
    }
  }, [allPayouts, isLoading]);

  // Loading state
  if (isLoading) {
    return <PayoutDashboardSkeleton />;
  }

  // Error state
  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  // Calculate remaining limits
  const remainingDaily = limits.dailyLimit - (eligibility.pendingPayouts || 0);
  const remainingMonthly = limits.monthlyLimit - stats.thisMonthAmount;
  const hasPayouts = recentPayouts.length > 0;

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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Available Balance */}
        <div className="rounded-lg border border-green-200 bg-gradient-to-br from-green-50 to-transparent p-4 shadow-sm transition-shadow hover:shadow-md dark:border-green-800 dark:from-green-950/20">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Kullanılabilir Bakiye
            </span>
            <Download className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">
            {formatCurrency(availableBalance)}
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Min: {formatCurrency(limits.minAmount)}
          </p>
        </div>

        {/* Pending Payouts */}
        <div className="rounded-lg border p-4 shadow-sm transition-shadow hover:shadow-md">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Bekleyen Çekimler
            </span>
            <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="text-2xl font-bold">{stats.pendingCount}</div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {formatCurrency(stats.pendingAmount)}
          </p>
        </div>

        {/* Completed Payouts */}
        <div className="rounded-lg border p-4 shadow-sm transition-shadow hover:shadow-md">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Tamamlanan Çekimler
            </span>
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-2xl font-bold">{stats.completedCount}</div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {formatCurrency(stats.completedAmount)}
          </p>
        </div>

        {/* This Month */}
        <div className="rounded-lg border p-4 shadow-sm transition-shadow hover:shadow-md">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Bu Ay Toplam
            </span>
            <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-bold">
            {formatCurrency(stats.thisMonthAmount)}
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
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
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={onRequestPayout}
          disabled={
            !eligibility.canRequestPayout || availableBalance < limits.minAmount
          }
          className="w-full flex-1 shadow-md sm:w-auto"
          size="lg"
        >
          <Download className="mr-2 h-4 w-4" />
          Çekim Talebi Oluştur
        </Button>
        {onViewAllPayouts && (
          <Button
            variant="outline"
            onClick={onViewAllPayouts}
            size="lg"
            className="w-full sm:w-auto"
          >
            <span className="hidden sm:inline">Tüm Çekimler</span>
            <span className="sm:hidden">Tümünü Gör</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Recent Payouts or Empty State */}
      {hasPayouts ? (
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
                className="p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {payout.description || 'Çekim talebi'}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="text-sm font-medium">
                      {format(new Date(payout.requestedAt), 'dd MMM', {
                        locale: tr,
                      })}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
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
      ) : (
        <EmptyState
          availableBalance={availableBalance}
          minAmount={limits.minAmount}
          canRequestPayout={eligibility.canRequestPayout}
          onRequestPayout={onRequestPayout}
        />
      )}
    </div>
  );
}
