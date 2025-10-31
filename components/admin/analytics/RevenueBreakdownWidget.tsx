/**
 * ================================================
 * REVENUE BREAKDOWN WIDGET
 * ================================================
 * Comprehensive revenue analytics display widget
 *
 * Features:
 * - Summary metrics (gross, net, platform fee, seller earnings)
 * - Growth indicators
 * - Payment method breakdown
 * - Refund metrics
 * - Health indicators
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 3 - Task 3.1
 */

'use client';

import { Card } from '@/components/ui/Card';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
  CreditCard,
  Wallet,
  RefreshCw,
} from 'lucide-react';
import { RevenueBreakdownDto } from '@/lib/api/admin-analytics';
import { formatCurrency } from '@/lib/utils';

interface RevenueBreakdownWidgetProps {
  data: RevenueBreakdownDto;
  isLoading?: boolean;
}

/**
 * Revenue Breakdown Widget Component
 */
export function RevenueBreakdownWidget({
  data,
  isLoading,
}: RevenueBreakdownWidgetProps) {
  if (isLoading) {
    return <RevenueBreakdownSkeleton />;
  }

  const {
    summary,
    growth,
    transactions,
    paymentMethods,
    platformFees,
    healthIndicators,
  } = data;

  // Trend icon and color
  const getTrendIcon = () => {
    switch (growth.trend) {
      case 'UP':
        return <TrendingUp className="h-4 w-4" />;
      case 'DOWN':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getTrendColor = () => {
    switch (growth.trend) {
      case 'UP':
        return 'text-green-600';
      case 'DOWN':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Gross Revenue */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Brüt Gelir</p>
              <p className="text-2xl font-bold">
                {formatCurrency(summary.grossRevenue)}
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div
            className={`mt-2 flex items-center gap-1 text-sm ${getTrendColor()}`}
          >
            {getTrendIcon()}
            <span>{growth.growthRate.toFixed(1)}%</span>
            <span className="text-muted-foreground ml-1">
              önceki döneme göre
            </span>
          </div>
        </Card>

        {/* Net Revenue */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Net Gelir</p>
              <p className="text-2xl font-bold">
                {formatCurrency(summary.netRevenue)}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="text-muted-foreground mt-2 text-sm">
            İade sonrası:{' '}
            {formatCurrency(summary.netRevenue - summary.refundAmount)}
          </div>
        </Card>

        {/* Platform Fee */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">
                Platform Komisyonu
              </p>
              <p className="text-2xl font-bold">
                {formatCurrency(summary.platformFee)}
              </p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="text-muted-foreground mt-2 text-sm">
            Oran: {platformFees.feePercentage.toFixed(1)}%
          </div>
        </Card>

        {/* Seller Earnings */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Satıcı Kazançları</p>
              <p className="text-2xl font-bold">
                {formatCurrency(summary.sellerEarnings)}
              </p>
            </div>
            <div className="rounded-full bg-indigo-100 p-3">
              <DollarSign className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
          <div className="text-muted-foreground mt-2 text-sm">
            {transactions.orderCount} sipariş
          </div>
        </Card>
      </div>

      {/* Payment Methods & Transactions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Payment Methods */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Ödeme Yöntemleri</h3>
          <div className="space-y-4">
            {/* Credit Card */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded bg-blue-100 p-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Kredi Kartı</p>
                  <p className="text-muted-foreground text-sm">
                    {paymentMethods.creditCard.count} işlem
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  {formatCurrency(paymentMethods.creditCard.amount)}
                </p>
                <p className="text-muted-foreground text-sm">
                  {paymentMethods.creditCard.percentage.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Wallet */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded bg-green-100 p-2">
                  <Wallet className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Cüzdan</p>
                  <p className="text-muted-foreground text-sm">
                    {paymentMethods.wallet.count} işlem
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  {formatCurrency(paymentMethods.wallet.amount)}
                </p>
                <p className="text-muted-foreground text-sm">
                  {paymentMethods.wallet.percentage.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="pt-2">
              <div className="flex h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="bg-blue-500"
                  style={{ width: `${paymentMethods.creditCard.percentage}%` }}
                />
                <div
                  className="bg-green-500"
                  style={{ width: `${paymentMethods.wallet.percentage}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Transaction & Refund Metrics */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">İşlem Metrikleri</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Toplam Sipariş</span>
              <span className="font-semibold">
                {transactions.orderCount.toLocaleString('tr-TR')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Ortalama Sipariş Değeri
              </span>
              <span className="font-semibold">
                {formatCurrency(transactions.averageOrderValue)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Medyan Sipariş Değeri
              </span>
              <span className="font-semibold">
                {formatCurrency(transactions.medianOrderValue)}
              </span>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-orange-600" />
                  <span className="text-muted-foreground">İadeler</span>
                </div>
                <span className="font-semibold text-orange-600">
                  {formatCurrency(summary.refundAmount)}
                </span>
              </div>
              <div className="text-muted-foreground mt-2 text-sm">
                İade oranı: {healthIndicators.refundRate.toFixed(1)}%
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Health Indicators */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Sağlık Göstergeleri</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <p className="text-muted-foreground mb-1 text-sm">İade Oranı</p>
            <div className="flex items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                <div
                  className={`h-full ${
                    healthIndicators.refundRate > 10
                      ? 'bg-red-500'
                      : healthIndicators.refundRate > 5
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                  }`}
                  style={{
                    width: `${Math.min(healthIndicators.refundRate, 100)}%`,
                  }}
                />
              </div>
              <span className="text-sm font-medium">
                {healthIndicators.refundRate.toFixed(1)}%
              </span>
            </div>
          </div>

          <div>
            <p className="text-muted-foreground mb-1 text-sm">
              Ortalama İşlem Büyüklüğü
            </p>
            <p className="text-lg font-semibold">
              {formatCurrency(healthIndicators.averageTransactionSize)}
            </p>
          </div>

          <div>
            <p className="text-muted-foreground mb-1 text-sm">
              Gelir Yoğunlaşması
            </p>
            <p className="text-lg font-semibold">
              {healthIndicators.revenueConcentration.toFixed(1)}%
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

/**
 * Loading skeleton
 */
function RevenueBreakdownSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4">
            <div className="h-20 rounded bg-gray-200" />
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i} className="p-6">
            <div className="h-48 rounded bg-gray-200" />
          </Card>
        ))}
      </div>
      <Card className="p-6">
        <div className="h-24 rounded bg-gray-200" />
      </Card>
    </div>
  );
}
