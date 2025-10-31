/**
 * ================================================
 * PLATFORM STATS WIDGET
 * ================================================
 * Comprehensive platform-wide statistics display
 *
 * Features:
 * - Wallet metrics overview
 * - Payout statistics
 * - Transaction analytics
 * - Growth indicators
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 3 - Task 3.2
 */

'use client';

import { Card } from '@/components/ui/Card';
import {
  Wallet,
  Users,
  CreditCard,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from 'lucide-react';
import { PlatformStatistics } from '@/hooks/business/admin/usePlatformStatistics';
import { formatCurrency } from '@/lib/utils';

interface PlatformStatsWidgetProps {
  data: PlatformStatistics;
  isLoading?: boolean;
}

/**
 * Platform Stats Widget Component
 */
export function PlatformStatsWidget({
  data,
  isLoading,
}: PlatformStatsWidgetProps) {
  if (isLoading) {
    return <PlatformStatsSkeleton />;
  }

  // Calculate percentages
  const activeWalletPercentage =
    data.totalWallets > 0
      ? ((data.activeWallets / data.totalWallets) * 100).toFixed(1)
      : '0.0';

  const walletsWithBalancePercentage =
    data.totalWallets > 0
      ? ((data.walletsWithBalance / data.totalWallets) * 100).toFixed(1)
      : '0.0';

  const completionRate =
    data.totalPayouts > 0
      ? ((data.completedPayoutCount / data.totalPayouts) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-6">
      {/* Wallet Metrics */}
      <div>
        <h3 className="mb-4 text-lg font-semibold">Cüzdan Metrikleri</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Wallets */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Toplam Cüzdan</p>
                <p className="text-2xl font-bold">
                  {data.totalWallets.toLocaleString('tr-TR')}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="text-muted-foreground mt-2 text-sm">
              {data.frozenWallets} dondurulmuş
            </div>
          </Card>

          {/* Active Wallets */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Aktif Cüzdan</p>
                <p className="text-2xl font-bold">
                  {data.activeWallets.toLocaleString('tr-TR')}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 text-sm font-medium text-green-600">
              {activeWalletPercentage}% aktiflik oranı
            </div>
          </Card>

          {/* Total Balance */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Toplam Bakiye</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(data.totalBalance)}
                </p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="text-muted-foreground mt-2 text-sm">
              Bekleyen: {formatCurrency(data.totalPendingBalance)}
            </div>
          </Card>

          {/* Average Balance */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Ortalama Bakiye</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(data.averageBalance)}
                </p>
              </div>
              <div className="rounded-full bg-indigo-100 p-3">
                <Activity className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <div className="text-muted-foreground mt-2 text-sm">
              {walletsWithBalancePercentage}% bakiyeli
            </div>
          </Card>
        </div>
      </div>

      {/* Payout Statistics */}
      <div>
        <h3 className="mb-4 text-lg font-semibold">Ödeme İstatistikleri</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Pending Payouts */}
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">Bekleyen Ödemeler</p>
              <div className="rounded bg-yellow-100 p-2">
                <CreditCard className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
            <p className="text-2xl font-bold">
              {formatCurrency(data.totalPendingPayouts)}
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              {data.pendingPayoutCount.toLocaleString('tr-TR')} işlem
            </p>
          </Card>

          {/* Completed Payouts */}
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Tamamlanan Ödemeler
              </p>
              <div className="rounded bg-green-100 p-2">
                <CreditCard className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold">
              {formatCurrency(data.totalCompletedPayouts)}
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              {data.completedPayoutCount.toLocaleString('tr-TR')} işlem
            </p>
            <div className="mt-2 text-sm font-medium text-green-600">
              {completionRate}% tamamlanma oranı
            </div>
          </Card>

          {/* Approved Payouts */}
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                Onaylanan Ödemeler
              </p>
              <div className="rounded bg-blue-100 p-2">
                <CreditCard className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold">
              {formatCurrency(data.totalApprovedPayouts)}
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              {data.approvedPayoutCount.toLocaleString('tr-TR')} işlem
            </p>
          </Card>
        </div>
      </div>

      {/* Transaction Analytics */}
      <div>
        <h3 className="mb-4 text-lg font-semibold">İşlem Analitiği</h3>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Transaction Volume */}
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="font-semibold">İşlem Hacmi</h4>
              {data.transactionVolumeGrowthPercentage > 0 ? (
                <div className="flex items-center gap-1 text-green-600">
                  <ArrowUpRight className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {data.transactionVolumeGrowthPercentage.toFixed(1)}%
                  </span>
                </div>
              ) : data.transactionVolumeGrowthPercentage < 0 ? (
                <div className="flex items-center gap-1 text-red-600">
                  <ArrowDownRight className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {Math.abs(data.transactionVolumeGrowthPercentage).toFixed(
                      1
                    )}
                    %
                  </span>
                </div>
              ) : null}
            </div>
            <p className="mb-2 text-3xl font-bold">
              {formatCurrency(data.totalTransactionVolume)}
            </p>
            <p className="text-muted-foreground text-sm">
              {data.totalTransactionCount.toLocaleString('tr-TR')} toplam işlem
            </p>
            <div className="mt-4 space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ortalama İşlem:</span>
                <span className="font-medium">
                  {formatCurrency(data.averageTransactionAmount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Büyüme:</span>
                <span
                  className={`font-medium ${
                    data.transactionVolumeGrowth >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {formatCurrency(Math.abs(data.transactionVolumeGrowth))}
                </span>
              </div>
            </div>
          </Card>

          {/* Transaction Breakdown */}
          <Card className="p-6">
            <h4 className="mb-4 font-semibold">İşlem Dağılımı</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm">Ödenen</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatCurrency(data.totalPaymentReleased)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {data.paymentReleasedCount.toLocaleString('tr-TR')} işlem
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-sm">Tamamlanan Ödemeler</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatCurrency(data.totalPayoutsCompleted)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {data.payoutsCompletedCount.toLocaleString('tr-TR')} işlem
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-sm">İadeler</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatCurrency(data.totalRefundsIssued)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {data.refundsIssuedCount.toLocaleString('tr-TR')} işlem
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t pt-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                  <span className="text-sm font-medium">
                    Platform Ücretleri
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-purple-600">
                    {formatCurrency(data.totalFeesCharged)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {data.feesChargedCount.toLocaleString('tr-TR')} işlem
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Batch Statistics */}
      {(data.pendingBatchCount > 0 ||
        data.processingBatchCount > 0 ||
        data.completedBatchCount > 0 ||
        data.failedBatchCount > 0) && (
        <div>
          <h3 className="mb-4 text-lg font-semibold">Toplu İşlem Durumu</h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Card className="p-4 text-center">
              <p className="text-muted-foreground mb-1 text-sm">Bekleyen</p>
              <p className="text-2xl font-bold">
                {data.pendingBatchCount.toLocaleString('tr-TR')}
              </p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-muted-foreground mb-1 text-sm">İşleniyor</p>
              <p className="text-2xl font-bold text-blue-600">
                {data.processingBatchCount.toLocaleString('tr-TR')}
              </p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-muted-foreground mb-1 text-sm">Tamamlandı</p>
              <p className="text-2xl font-bold text-green-600">
                {data.completedBatchCount.toLocaleString('tr-TR')}
              </p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-muted-foreground mb-1 text-sm">Başarısız</p>
              <p className="text-2xl font-bold text-red-600">
                {data.failedBatchCount.toLocaleString('tr-TR')}
              </p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Loading skeleton
 */
function PlatformStatsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Wallet Metrics Skeleton */}
      <div>
        <div className="mb-4 h-6 w-48 rounded bg-gray-200" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4">
              <div className="h-20 rounded bg-gray-200" />
            </Card>
          ))}
        </div>
      </div>

      {/* Payout Statistics Skeleton */}
      <div>
        <div className="mb-4 h-6 w-48 rounded bg-gray-200" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <div className="h-24 rounded bg-gray-200" />
            </Card>
          ))}
        </div>
      </div>

      {/* Transaction Analytics Skeleton */}
      <div>
        <div className="mb-4 h-6 w-48 rounded bg-gray-200" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="p-6">
              <div className="h-48 rounded bg-gray-200" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
