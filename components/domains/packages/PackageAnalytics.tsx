'use client';

/**
 * Package Analytics Dashboard
 * Displays analytics metrics for user's packages
 *
 * Sprint 1 - Task 1: Package Analytics Backend Integration
 * Real API integration - Mock data removed
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui';
import logger from '@/lib/infrastructure/monitoring/logger';
import {
  fetchPackageAnalytics,
  type PackageAnalyticsData,
} from '@/lib/api/package-analytics';
import {
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  Eye,
  ShoppingCart,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export function PackageAnalytics() {
  const [data, setData] = useState<PackageAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<
    'views' | 'orders' | 'revenue'
  >('views');
  const [days] = useState(30); // Days filter (can be made dynamic later)

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        logger.info('[PackageAnalytics] Fetching analytics data', { days, componentPackageAnalytics,  });

        const analyticsData = await fetchPackageAnalytics(days);
        setData(analyticsData);

        logger.info('[PackageAnalytics] Analytics data loaded successfully', { packagesCountanalyticsDatametricstotalPackages, totalRevenueanalyticsDatametricstotalRevenue, componentPackageAnalytics,  });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load analytics data';
        setError(errorMessage);
        logger.error('[PackageAnalytics] Failed to load analytics', {
          error: err,
          days,
          component: 'PackageAnalytics',
        });
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [days]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Failed to Load Analytics
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {error || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (trend < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return null;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('tr-TR').format(num);
  };

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Packages */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Packages
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {data.metrics.totalPackages}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {data.metrics.activePackages} active
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Views */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {formatNumber(data.metrics.totalViews)}
                </p>
                <div className="mt-1 flex items-center text-xs">
                  {getTrendIcon(data.trends.views)}
                  <span className={`ml-1 ${getTrendColor(data.trends.views)}`}>
                    {Math.abs(data.trends.views)}% from last period
                  </span>
                </div>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Orders
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {formatNumber(data.metrics.totalOrders)}
                </p>
                <div className="mt-1 flex items-center text-xs">
                  {getTrendIcon(data.trends.orders)}
                  <span className={`ml-1 ${getTrendColor(data.trends.orders)}`}>
                    {Math.abs(data.trends.orders)}% from last period
                  </span>
                </div>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {formatCurrency(data.metrics.totalRevenue)}
                </p>
                <div className="mt-1 flex items-center text-xs">
                  {getTrendIcon(data.trends.revenue)}
                  <span
                    className={`ml-1 ${getTrendColor(data.trends.revenue)}`}
                  >
                    {Math.abs(data.trends.revenue)}% from last period
                  </span>
                </div>
              </div>
              <div className="rounded-full bg-yellow-100 p-3">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600">Average Rating</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {data.metrics.averageRating.toFixed(1)} / 5.0
            </p>
            <div className="mt-2 flex items-center">
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-yellow-500"
                  style={{
                    width: `${(data.metrics.averageRating / 5) * 100}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600">Completion Rate</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {data.metrics.completionRate.toFixed(1)}%
            </p>
            <div className="mt-2 flex items-center">
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-green-500"
                  style={{ width: `${data.metrics.completionRate}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {data.metrics.conversionRate.toFixed(2)}%
            </p>
            <div className="mt-2 flex items-center">
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-blue-500"
                  style={{ width: `${data.metrics.conversionRate * 10}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Performance Trends
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedMetric('views')}
                className={`rounded-md px-3 py-1 text-sm ${
                  selectedMetric === 'views'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Views
              </button>
              <button
                onClick={() => setSelectedMetric('orders')}
                className={`rounded-md px-3 py-1 text-sm ${
                  selectedMetric === 'orders'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setSelectedMetric('revenue')}
                className={`rounded-md px-3 py-1 text-sm ${
                  selectedMetric === 'revenue'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Revenue
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {/* Simple bar chart visualization */}
            <div className="flex h-full items-end justify-between space-x-2">
              {data.chartData[selectedMetric].map((value, index) => {
                const maxValue = Math.max(...data.chartData[selectedMetric]);
                const height = (value / maxValue) * 100;

                return (
                  <div
                    key={index}
                    className="flex flex-1 flex-col items-center"
                  >
                    <div className="relative w-full">
                      <div
                        className="w-full rounded-t-md bg-blue-600 transition-all hover:bg-blue-700"
                        style={{ height: `${height * 2}px` }}
                        title={`${data.chartData.labels[index]}: ${value}`}
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-600">
                      {data.chartData.labels[index]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Packages */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">
            Top Performing Packages
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topPackages.map((pkg, index) => (
              <div
                key={pkg.id}
                className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{pkg.title}</h4>
                    <p className="text-sm text-gray-600">{pkg.category}</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 text-right">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatNumber(pkg.views)}
                    </p>
                    <p className="text-xs text-gray-600">Views</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatNumber(pkg.orders)}
                    </p>
                    <p className="text-xs text-gray-600">Orders</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(pkg.revenue)}
                    </p>
                    <p className="text-xs text-gray-600">Revenue</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      ⭐ {pkg.rating.toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-600">Rating</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
