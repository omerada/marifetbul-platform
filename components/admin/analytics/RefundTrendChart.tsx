/**
 * ================================================
 * REFUND TREND CHART
 * ================================================
 * Visual chart for refund trends and distributions
 *
 * Features:
 * - Status distribution visualization
 * - Amount breakdown by status
 * - Interactive pie/bar chart
 * - Color-coded categories
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 3 - Task 3.4
 */

'use client';

import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/shared/formatters';
import { RefundStatisticsDto } from '@/lib/api/admin/refund-admin-api';

interface RefundTrendChartProps {
  data: RefundStatisticsDto;
  isLoading?: boolean;
}

/**
 * Refund Trend Chart Component
 */
export function RefundTrendChart({
  data,
  isLoading = false,
}: RefundTrendChartProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Calculate percentages for each status
  const statusData = [
    {
      label: 'Bekleyen',
      count: data.pendingCount,
      amount: data.pendingAmount,
      percentage:
        data.totalRefunds > 0
          ? ((data.pendingCount / data.totalRefunds) * 100).toFixed(1)
          : '0.0',
      color: 'bg-yellow-500',
      lightColor: 'bg-yellow-100',
      textColor: 'text-yellow-700',
    },
    {
      label: 'Onaylandı',
      count: data.approvedCount,
      amount: data.approvedAmount,
      percentage:
        data.totalRefunds > 0
          ? ((data.approvedCount / data.totalRefunds) * 100).toFixed(1)
          : '0.0',
      color: 'bg-blue-500',
      lightColor: 'bg-blue-100',
      textColor: 'text-blue-700',
    },
    {
      label: 'Tamamlandı',
      count: data.completedCount,
      amount: data.completedAmount,
      percentage:
        data.totalRefunds > 0
          ? ((data.completedCount / data.totalRefunds) * 100).toFixed(1)
          : '0.0',
      color: 'bg-green-500',
      lightColor: 'bg-green-100',
      textColor: 'text-green-700',
    },
    {
      label: 'Reddedildi',
      count: data.rejectedCount,
      amount: 0,
      percentage:
        data.totalRefunds > 0
          ? ((data.rejectedCount / data.totalRefunds) * 100).toFixed(1)
          : '0.0',
      color: 'bg-red-500',
      lightColor: 'bg-red-100',
      textColor: 'text-red-700',
    },
    {
      label: 'Başarısız',
      count: data.failedCount,
      amount: 0,
      percentage:
        data.totalRefunds > 0
          ? ((data.failedCount / data.totalRefunds) * 100).toFixed(1)
          : '0.0',
      color: 'bg-gray-500',
      lightColor: 'bg-gray-100',
      textColor: 'text-gray-700',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Chart Title */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">İade Durumu Dağılımı</h3>

        {/* Visual Bar Chart */}
        <div className="space-y-4">
          {statusData.map((status) => (
            <div key={status.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${status.color}`} />
                  <span className="font-medium">{status.label}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">
                    {status.count} adet
                  </span>
                  <span className={`font-semibold ${status.textColor}`}>
                    {status.percentage}%
                  </span>
                </div>
              </div>
              <div className="h-3 w-full rounded-full bg-gray-200">
                <div
                  className={`${status.color} h-3 rounded-full transition-all duration-500`}
                  style={{ width: `${status.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Total Summary */}
        <div className="mt-6 border-t pt-6">
          <div className="flex items-center justify-between">
            <span className="font-medium">Toplam İade Talebi</span>
            <span className="text-xl font-bold">{data.totalRefunds}</span>
          </div>
        </div>
      </Card>

      {/* Amount Distribution */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">Tutar Dağılımı</h3>

        <div className="space-y-4">
          {statusData
            .filter((s) => s.amount > 0)
            .map((status) => {
              const amountPercentage =
                data.totalAmount > 0
                  ? ((status.amount / data.totalAmount) * 100).toFixed(1)
                  : '0.0';

              return (
                <div key={status.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${status.color}`} />
                      <span className="font-medium">{status.label}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">
                        {formatCurrency(status.amount)}
                      </span>
                      <span className={`font-semibold ${status.textColor}`}>
                        {amountPercentage}%
                      </span>
                    </div>
                  </div>
                  <div className="h-3 w-full rounded-full bg-gray-200">
                    <div
                      className={`${status.color} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${amountPercentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>

        {/* Total Amount Summary */}
        <div className="mt-6 border-t pt-6">
          <div className="flex items-center justify-between">
            <span className="font-medium">Toplam İade Tutarı</span>
            <span className="text-xl font-bold">
              {formatCurrency(data.totalAmount)}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

/**
 * Loading Skeleton Component
 */
function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-96 rounded-lg bg-gray-200" />
      <div className="h-96 rounded-lg bg-gray-200" />
    </div>
  );
}
