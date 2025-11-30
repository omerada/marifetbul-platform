/**
 * ================================================
 * REFUND TREND CHART WIDGET
 * ================================================
 * Display refund trends over time
 *
 * @module components/domains/admin/dashboard/widgets
 * @since Sprint 2 - Code Consolidation
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RefundStatisticsDto } from '@/types/business/features/refund';

// ================================================
// TYPES
// ================================================

export interface RefundTrendChartProps {
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

export function RefundTrendChart({
  data,
  isLoading,
  error,
  className,
}: RefundTrendChartProps) {
  // Loading state
  if (isLoading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle>İade Trend Grafiği</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
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
            İade Trend Grafiği
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
          <CardTitle>İade Trend Grafiği</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 dark:text-gray-400">Veri bulunamadı</p>
        </CardContent>
      </Card>
    );
  }

  // Simple bar chart representation
  const maxCount = Math.max(
    data.pendingCount,
    data.approvedCount,
    data.rejectedCount,
    data.completedCount,
    data.failedCount
  );

  const getBarWidth = (count: number) => {
    if (maxCount === 0) return '0%';
    return `${(count / maxCount) * 100}%`;
  };

  const statusData = [
    {
      label: 'Beklemede',
      count: data.pendingCount,
      color: 'bg-yellow-500',
    },
    {
      label: 'Onaylandı',
      count: data.approvedCount,
      color: 'bg-green-500',
    },
    {
      label: 'Reddedildi',
      count: data.rejectedCount,
      color: 'bg-red-500',
    },
    {
      label: 'Tamamlandı',
      count: data.completedCount,
      color: 'bg-blue-500',
    },
    {
      label: 'Başarısız',
      count: data.failedCount,
      color: 'bg-gray-500',
    },
  ];

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle>İade Durum Dağılımı</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {statusData.map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {item.label}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {item.count}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className={cn('h-2 rounded-full transition-all', item.color)}
                  style={{ width: getBarWidth(item.count) }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              Toplam İade
            </span>
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {data.totalRefunds}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default RefundTrendChart;
