/**
 * ================================================
 * COMMISSION SUMMARY CARD
 * ================================================
 * Displays commission earnings summary with monthly/total breakdown
 *
 * Features:
 * - Total commission earned
 * - Monthly commission (current month)
 * - Platform commission rate display
 * - Trend comparison (month-over-month)
 * - Visual indicators for growth
 * - Export commission report button
 *
 * Sprint Day 5 - Commission Tracking UI
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Percent,
  Download,
  Info,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import {
  Button,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui';
import { formatCurrency, formatPercentage } from '@/lib/shared/formatters';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface CommissionData {
  /** Total commission earned (all time) */
  totalCommission: number;

  /** Current month commission */
  monthlyCommission: number;

  /** Previous month commission for comparison */
  previousMonthCommission: number;

  /** Platform commission rate (e.g., 0.05 for 5%) */
  commissionRate: number;

  /** Number of orders that generated commission */
  orderCount: number;

  /** Current month order count */
  monthlyOrderCount: number;

  /** Average commission per order */
  averageCommissionPerOrder: number;

  /** Currency code */
  currency?: string;
}

export interface CommissionSummaryCardProps {
  /** Commission data to display */
  data: CommissionData;

  /** Loading state */
  isLoading?: boolean;

  /** Callback when export button is clicked */
  onExport?: () => void;

  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const CommissionSummaryCard: React.FC<CommissionSummaryCardProps> = ({
  data,
  isLoading = false,
  onExport,
  className,
}) => {
  // Calculate month-over-month change
  const monthOverMonthChange = React.useMemo(() => {
    if (data.previousMonthCommission === 0) {
      return data.monthlyCommission > 0 ? 100 : 0;
    }
    return (
      ((data.monthlyCommission - data.previousMonthCommission) /
        data.previousMonthCommission) *
      100
    );
  }, [data.monthlyCommission, data.previousMonthCommission]);

  const isPositiveTrend = monthOverMonthChange >= 0;
  const currency = data.currency || 'TRY';

  if (isLoading) {
    return (
      <Card className={cn('relative overflow-hidden', className)}>
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
            Yükleniyor...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={cn('relative overflow-hidden', className)}>
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20" />

        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="rounded-lg bg-green-500/10 p-2">
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              Komisyon Kazançları
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 cursor-help text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  Platform komisyon oranı:{' '}
                  {formatPercentage(data.commissionRate)}
                </TooltipContent>
              </Tooltip>
            </CardTitle>

            {onExport && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onExport}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Dışa Aktar
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="relative space-y-6">
          {/* Total Commission */}
          <div className="rounded-lg border border-green-100 bg-white/50 p-4 dark:border-green-900/30 dark:bg-gray-800/50">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Toplam Komisyon
              </span>
              <Tooltip>
                <TooltipTrigger>
                  <span className="cursor-help text-xs text-gray-500 dark:text-gray-500">
                    {data.orderCount} sipariş
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {data.orderCount} siparişten kazanıldı
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(data.totalCommission, currency)}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              Ortalama:{' '}
              {formatCurrency(data.averageCommissionPerOrder, currency)}/sipariş
            </p>
          </div>

          {/* Monthly Commission */}
          <div className="grid grid-cols-2 gap-4">
            {/* Current Month */}
            <div className="rounded-lg border border-gray-100 bg-white/50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
              <div className="mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Bu Ay
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(data.monthlyCommission, currency)}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                {data.monthlyOrderCount} sipariş
              </p>
            </div>

            {/* Month-over-Month Change */}
            <div className="rounded-lg border border-gray-100 bg-white/50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
              <div className="mb-2 flex items-center gap-2">
                {isPositiveTrend ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Değişim
                </span>
              </div>
              <p
                className={cn(
                  'text-2xl font-bold',
                  isPositiveTrend
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                )}
              >
                {isPositiveTrend ? '+' : ''}
                {formatPercentage(Math.abs(monthOverMonthChange) / 100)}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                Geçen aya göre
              </p>
            </div>
          </div>

          {/* Commission Rate Info */}
          <div className="rounded-lg border border-green-100 bg-green-50 p-3 dark:border-green-900/30 dark:bg-green-950/30">
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
              <Percent className="h-4 w-4" />
              <span>
                Platform komisyon oranı:{' '}
                <strong>{formatPercentage(data.commissionRate)}</strong>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CommissionSummaryCard;
