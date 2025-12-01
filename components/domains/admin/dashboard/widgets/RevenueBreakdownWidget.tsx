/**
 * ================================================
 * REVENUE BREAKDOWN WIDGET - PRODUCTION READY
 * ================================================
 * Consolidated revenue analytics display widget (Presentation Component)
 *
 * This is the CANONICAL implementation that consolidates:
 * - components/admin/analytics/RevenueBreakdownWidget.tsx (props-based, 336 lines)
 * - components/domains/admin/dashboard/RevenueBreakdownWidget.tsx (hook-based, 399 lines)
 *
 * Architecture:
 * - Pure presentation component (receives data via props)
 * - Companion container: RevenueBreakdownContainer (handles data fetching)
 * - Type-safe with RevenueBreakdownDto
 * - Production-ready error handling and loading states
 *
 * Features:
 * - Summary metrics (gross, net, platform fee, seller earnings)
 * - Growth indicators with trend visualization
 * - Payment method breakdown
 * - Refund metrics
 * - Health indicators
 * - Dark mode support
 * - Responsive design
 *
 * @module components/domains/admin/dashboard/widgets
 * @since Sprint 2 - Code Consolidation
 * @version 2.0.0
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
  CreditCard,
  Wallet,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatPercentage } from '@/lib/shared/formatters';
import type { RevenueBreakdownDto } from '@/lib/api/admin-analytics';

// ================================================
// TYPES
// ================================================

export interface RevenueBreakdownWidgetProps {
  /** Revenue breakdown data */
  data: RevenueBreakdownDto;

  /** Loading state */
  isLoading?: boolean;

  /** Error state */
  error?: string | null;

  /** Refresh callback */
  onRefresh?: () => void;

  /** Additional CSS classes */
  className?: string;
}

// ================================================
// UTILITY FUNCTIONS
// ================================================

// REMOVED: formatCurrency, formatPercentage (Sprint 1 - Cleanup)
// Now using canonical formatters from @/lib/shared/formatters

/**
 * Get health status color classes
 */
function getHealthColor(status: string): string {
  switch (status) {
    case 'EXCELLENT':
      return 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400';
    case 'GOOD':
      return 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400';
    case 'WARNING':
      return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'CRITICAL':
      return 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'text-gray-600 bg-gray-50 dark:bg-gray-900/30 dark:text-gray-400';
  }
}

/**
 * Get health status label
 */
function getHealthLabel(status: string): string {
  switch (status) {
    case 'EXCELLENT':
      return 'Mükemmel';
    case 'GOOD':
      return 'İyi';
    case 'WARNING':
      return 'Dikkat';
    case 'CRITICAL':
      return 'Kritik';
    default:
      return 'Bilinmiyor';
  }
}

/**
 * Get trend icon and color
 */
function getTrendIcon(trend: 'UP' | 'DOWN' | 'STABLE') {
  switch (trend) {
    case 'UP':
      return <TrendingUp className="h-4 w-4" />;
    case 'DOWN':
      return <TrendingDown className="h-4 w-4" />;
    default:
      return <Minus className="h-4 w-4" />;
  }
}

function getTrendColor(trend: 'UP' | 'DOWN' | 'STABLE'): string {
  switch (trend) {
    case 'UP':
      return 'text-green-600 dark:text-green-400';
    case 'DOWN':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
}

// ================================================
// SKELETON COMPONENT
// ================================================

function RevenueBreakdownSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse space-y-3">
              <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-8 w-32 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-6 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />
            </div>
          </Card>
        ))}
      </div>

      {/* Details Skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 w-32 rounded bg-gray-200 dark:bg-gray-700" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(3)].map((_, j) => (
                <div
                  key={j}
                  className="h-12 rounded bg-gray-100 dark:bg-gray-800"
                />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ================================================
// MAIN COMPONENT
// ================================================

/**
 * Revenue Breakdown Widget - Presentation Component
 *
 * @example
 * ```tsx
 * // Direct usage with data
 * <RevenueBreakdownWidget
 *   data={revenueData}
 *   isLoading={false}
 *   onRefresh={handleRefresh}
 * />
 *
 * // Or use container for automatic data fetching
 * <RevenueBreakdownContainer period="month" />
 * ```
 */
export function RevenueBreakdownWidget({
  data,
  isLoading = false,
  error = null,
  onRefresh,
  className,
}: RevenueBreakdownWidgetProps) {
  // ================================================
  // LOADING STATE
  // ================================================

  if (isLoading) {
    return <RevenueBreakdownSkeleton />;
  }

  // ================================================
  // ERROR STATE
  // ================================================

  if (error) {
    return (
      <Card
        className={cn(
          'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20',
          className
        )}
      >
        <CardContent className="flex items-center gap-3 p-6">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <div className="flex-1">
            <p className="font-medium text-red-900 dark:text-red-100">
              Veri yüklenirken hata oluştu
            </p>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="rounded-lg bg-red-100 p-2 text-red-700 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900/70"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </CardContent>
      </Card>
    );
  }

  // ================================================
  // MAIN RENDER
  // ================================================

  const {
    summary,
    growth,
    transactions,
    paymentMethods,
    platformFees,
    healthIndicators,
  } = data;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Gross Revenue */}
        <Card className="p-4 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Brüt Gelir</p>
              <p className="text-2xl font-bold">
                {formatCurrency(summary.grossRevenue)}
              </p>
              <div
                className={cn(
                  'mt-2 flex items-center gap-1 text-sm font-medium',
                  getTrendColor(growth.trend)
                )}
              >
                {getTrendIcon(growth.trend)}
                <span>{formatPercentage(growth.growthRate)}</span>
              </div>
            </div>
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
              <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        {/* Net Revenue */}
        <Card className="p-4 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Net Gelir</p>
              <p className="text-2xl font-bold">
                {formatCurrency(summary.netRevenue)}
              </p>
              <p className="text-muted-foreground mt-2 text-xs">
                {data.period}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
              <Wallet className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        {/* Platform Fee */}
        <Card className="p-4 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">
                Platform Komisyonu
              </p>
              <p className="text-2xl font-bold">
                {formatCurrency(summary.platformFee)}
              </p>
              <p className="text-muted-foreground mt-2 text-xs">
                {formatPercentage(platformFees.averageFeeRate)} oran
              </p>
            </div>
            <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/30">
              <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        {/* Seller Earnings */}
        <Card className="p-4 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Satıcı Kazançları</p>
              <p className="text-2xl font-bold">
                {formatCurrency(summary.sellerEarnings)}
              </p>
              <p className="text-muted-foreground mt-2 text-xs">
                İade Oranı: {formatPercentage(healthIndicators.refundRate)}
              </p>
            </div>
            <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/30">
              <DollarSign className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Details Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Transaction Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              İşlem Detayları
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
              <span className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                Siparişler
              </span>
              <span className="font-bold">
                {transactions.orderCount.toLocaleString('tr-TR')}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
              <span className="flex items-center gap-2 text-sm font-medium">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                İadeler
              </span>
              <span className="font-bold">
                {transactions.refundCount.toLocaleString('tr-TR')}
              </span>
            </div>

            <div className="border-t pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Ortalama Sipariş</span>
                <span className="text-lg font-bold">
                  {formatCurrency(transactions.averageOrderValue)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Ödeme Yöntemleri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { method: 'Kredi Kartı', ...paymentMethods.creditCard },
              { method: 'Cüzdan', ...paymentMethods.wallet },
            ].map((methodData, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {methodData.method}
                  </span>
                  <span className="text-sm font-bold">
                    {formatCurrency(methodData.amount)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-full bg-blue-600 dark:bg-blue-400"
                      style={{ width: `${methodData.percentage}%` }}
                    />
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {methodData.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="text-muted-foreground text-xs">
                  {methodData.count.toLocaleString('tr-TR')} işlem
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Health Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Sağlık Göstergeleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/20">
              <p className="text-muted-foreground text-sm">İade Oranı</p>
              <p className="text-2xl font-bold">
                {formatPercentage(healthIndicators.refundRate)}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/20">
              <p className="text-muted-foreground text-sm">Ort. İşlem Boyutu</p>
              <p className="text-2xl font-bold">
                {formatCurrency(healthIndicators.averageTransactionSize)}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900/20">
              <p className="text-muted-foreground text-sm">Gelir Yoğunluğu</p>
              <p className="text-2xl font-bold">
                {formatPercentage(healthIndicators.revenueConcentration)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default RevenueBreakdownWidget;
