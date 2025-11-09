'use client';

/**
 * Order Analytics Widget
 * Displays comprehensive order metrics using real backend API
 *
 * @module components/admin/dashboard
 * @since Sprint 3 - Analytics & Reporting
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  getThisMonthOrderAnalytics,
  type OrderAnalyticsDto,
} from '@/lib/api/admin-analytics';
import {
  TrendingUp,
  TrendingDown,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  Activity,
} from 'lucide-react';
import logger from '@/lib/infrastructure/monitoring/logger';

/**
 * Order Analytics Widget Component
 * Displays:
 * - Summary metrics (total, completed, pending, cancelled)
 * - Completion & cancellation rates
 * - Growth indicators
 * - Performance metrics
 */
export function OrderAnalyticsWidget() {
  const [analytics, setAnalytics] = useState<OrderAnalyticsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderAnalytics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getThisMonthOrderAnalytics();
        setAnalytics(data);
        logger.info('Order analytics loaded successfully');
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Failed to load order analytics';
        setError(errorMsg);
        logger.error(
          'Failed to fetch order analytics',
          err instanceof Error ? err : new Error(String(err))
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderAnalytics();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-3/4 rounded bg-gray-200"></div>
            <div className="h-4 w-1/2 rounded bg-gray-200"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return null;
  }

  const { summary, growth, performance } = analytics;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Order Analytics (This Month)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3">
            <Package className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-xl font-bold">{summary.totalOrders}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-green-50 p-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-xl font-bold">{summary.completedOrders}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-yellow-50 p-3">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-xl font-bold">{summary.pendingOrders}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-red-50 p-3">
            <XCircle className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Cancelled</p>
              <p className="text-xl font-bold">{summary.cancelledOrders}</p>
            </div>
          </div>
        </div>

        {/* Rates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-600">Completion Rate</span>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">
              {summary.completionRate.toFixed(1)}%
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-gray-600">Cancellation Rate</span>
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">
              {summary.cancellationRate.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Growth Indicators */}
        <div className="rounded-lg bg-gray-50 p-4">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-medium">
            <Activity className="h-4 w-4" />
            Growth Metrics
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-1 text-xs text-gray-600">Order Growth</p>
              <div className="flex items-center gap-2">
                {growth.orderGrowthRate >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span
                  className={`text-sm font-medium ${
                    growth.orderGrowthRate >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {Math.abs(growth.orderGrowthRate).toFixed(1)}%
                </span>
              </div>
            </div>

            <div>
              <p className="mb-1 text-xs text-gray-600">Value Growth</p>
              <div className="flex items-center gap-2">
                {growth.valueGrowthRate >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span
                  className={`text-sm font-medium ${
                    growth.valueGrowthRate >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {Math.abs(growth.valueGrowthRate).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Performance Indicators</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Completion Time:</span>
              <span className="font-medium">
                {performance.averageCompletionTimeHours.toFixed(1)}h
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">On-Time Delivery:</span>
              <span className="font-medium">
                {performance.onTimeDeliveryRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Disputes:</span>
              <span className="font-medium">{performance.disputeCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Dispute Rate:</span>
              <span className="font-medium">
                {performance.disputeRate.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Value Metrics */}
        <div className="border-t p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="mb-1 text-gray-600">Total Value</p>
              <p className="text-lg font-bold">
                {summary.totalValue.toLocaleString('tr-TR')} ₺
              </p>
            </div>
            <div>
              <p className="mb-1 text-gray-600">Avg Order Value</p>
              <p className="text-lg font-bold">
                {summary.averageOrderValue.toLocaleString('tr-TR')} ₺
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
