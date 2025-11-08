/**
 * ================================================
 * REFUND STATISTICS WIDGET
 * ================================================
 * Displays comprehensive refund statistics and metrics
 *
 * Features:
 * - Status breakdown cards
 * - Amount metrics
 * - Approval and success rates
 * - Processing time metrics
 * - Visual indicators
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 3 - Task 3.4
 */

'use client';

import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/shared/formatters';
import {
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Timer,
  Percent,
} from 'lucide-react';
import { RefundStatisticsDto } from '@/lib/api/admin/refund-admin-api';

interface RefundStatisticsWidgetProps {
  data: RefundStatisticsDto;
  isLoading?: boolean;
}

/**
 * Refund Statistics Widget Component
 */
export function RefundStatisticsWidget({
  data,
  isLoading = false,
}: RefundStatisticsWidgetProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Refunds */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Toplam İade</p>
              <p className="mt-1 text-2xl font-bold">{data.totalRefunds}</p>
              <p className="text-muted-foreground mt-1 text-sm">
                {formatCurrency(data.totalAmount)}
              </p>
            </div>
            <div className="rounded-lg bg-blue-100 p-3">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Pending Refunds */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Bekleyen</p>
              <p className="mt-1 text-2xl font-bold">{data.pendingCount}</p>
              <p className="text-muted-foreground mt-1 text-sm">
                {formatCurrency(data.pendingAmount)}
              </p>
            </div>
            <div className="rounded-lg bg-yellow-100 p-3">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        {/* Completed Refunds */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Tamamlanan</p>
              <p className="mt-1 text-2xl font-bold">{data.completedCount}</p>
              <p className="text-muted-foreground mt-1 text-sm">
                {formatCurrency(data.completedAmount)}
              </p>
            </div>
            <div className="rounded-lg bg-green-100 p-3">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Rejected Refunds */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Reddedilen</p>
              <p className="mt-1 text-2xl font-bold">{data.rejectedCount}</p>
            </div>
            <div className="rounded-lg bg-red-100 p-3">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Approved & Failed Section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Approved Refunds */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold">Onaylanan İadeler</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Sayı</span>
              <span className="text-lg font-semibold">
                {data.approvedCount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Toplam Tutar</span>
              <span className="font-semibold">
                {formatCurrency(data.approvedAmount)}
              </span>
            </div>
          </div>
        </Card>

        {/* Failed Refunds */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-red-100 p-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold">Başarısız İadeler</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Sayı</span>
              <span className="text-lg font-semibold">{data.failedCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Oran</span>
              <span className="font-semibold">
                {data.totalRefunds > 0
                  ? ((data.failedCount / data.totalRefunds) * 100).toFixed(1)
                  : 0}
                %
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Approval Rate */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold">Onay Oranı</h3>
              <p className="mt-1 text-2xl font-bold text-green-600">
                {data.approvalRate.toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-green-600 transition-all"
              style={{ width: `${data.approvalRate}%` }}
            />
          </div>
        </Card>

        {/* Success Rate */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Percent className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold">Başarı Oranı</h3>
              <p className="mt-1 text-2xl font-bold text-blue-600">
                {data.successRate.toFixed(1)}%
              </p>
            </div>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all"
              style={{ width: `${data.successRate}%` }}
            />
          </div>
        </Card>

        {/* Processing Time */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2">
              <Timer className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold">Ort. İşlem Süresi</h3>
              <p className="mt-1 text-2xl font-bold text-purple-600">
                {data.averageProcessingTimeHours.toFixed(1)}s
              </p>
            </div>
          </div>
          <p className="text-muted-foreground text-sm">
            Ortalama onay ve işleme süresi
          </p>
        </Card>
      </div>
    </div>
  );
}

/**
 * Loading Skeleton Component
 */
function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Overview Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-gray-200" />
        ))}
      </div>

      {/* Approved & Failed Skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-32 rounded-lg bg-gray-200" />
        ))}
      </div>

      {/* Performance Metrics Skeleton */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 rounded-lg bg-gray-200" />
        ))}
      </div>
    </div>
  );
}
