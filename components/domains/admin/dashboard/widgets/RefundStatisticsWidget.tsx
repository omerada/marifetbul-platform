/**
 * ================================================
 * REFUND STATISTICS WIDGET
 * ================================================
 * Display refund statistics and metrics
 *
 * @module components/domains/admin/dashboard/widgets
 * @since Sprint 2 - Code Consolidation
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, formatPercentage } from '@/lib/shared/formatters';
import { RefundStatisticsDto } from '@/types/business/features/refund';

// ================================================
// TYPES
// ================================================

export interface RefundStatisticsWidgetProps {
  /** Refund statistics data */
  data: RefundStatisticsDto | null;

  /** Loading state */
  isLoading?: boolean;

  /** Error state */
  error?: string | null;

  /** Additional CSS classes */
  className?: string;
}

// ================================================
// COMPONENT
// ================================================

export function RefundStatisticsWidget({
  data,
  isLoading,
  error,
  className,
}: RefundStatisticsWidgetProps) {
  // Loading state
  if (isLoading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle>İade İstatistikleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card
        className={cn('w-full border-red-200 dark:border-red-800', className)}
      >
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">
            İade İstatistikleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (!data) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle>İade İstatistikleri</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 dark:text-gray-400">Veri bulunamadı</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle>İade İstatistikleri</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Refunds */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Toplam İade
              </span>
              <Badge variant="secondary">{data.totalRefunds}</Badge>
            </div>
            <div className="text-2xl font-bold">
              {formatCurrency(data.totalAmount, 'TRY')}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Ortalama İşlem Süresi
              </span>
              <Clock className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold">
              {data.averageProcessingTimeHours.toFixed(1)} saat
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Durum Dağılımı
          </h4>

          {/* Pending */}
          <div className="flex items-center justify-between rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-medium">Beklemede</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold">{data.pendingCount}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {formatCurrency(data.pendingAmount, 'TRY')}
              </div>
            </div>
          </div>

          {/* Approved */}
          <div className="flex items-center justify-between rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium">Onaylandı</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold">{data.approvedCount}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {formatCurrency(data.approvedAmount, 'TRY')}
              </div>
            </div>
          </div>

          {/* Rejected */}
          <div className="flex items-center justify-between rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium">Reddedildi</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold">{data.rejectedCount}</div>
            </div>
          </div>

          {/* Completed */}
          <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium">Tamamlandı</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold">{data.completedCount}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {formatCurrency(data.completedAmount, 'TRY')}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-4 dark:border-gray-700">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <span>Onay Oranı</span>
              {data.approvalRate >= 0.8 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
            </div>
            <div className="text-xl font-bold">
              {formatPercentage(data.approvalRate)}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <span>Başarı Oranı</span>
              {data.successRate >= 0.9 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
            </div>
            <div className="text-xl font-bold">
              {formatPercentage(data.successRate)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default RefundStatisticsWidget;
