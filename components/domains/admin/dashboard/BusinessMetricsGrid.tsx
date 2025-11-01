/**
 * ================================================
 * BUSINESS METRICS GRID COMPONENT
 * ================================================
 * Display key business metrics with charts
 *
 * Sprint 3.2: Admin Dashboard Enhancement
 * @version 1.0.0
 */

'use client';

import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  RefreshCw,
} from 'lucide-react';
import type { BusinessMetrics } from '@/types/business/admin-dashboard';

interface BusinessMetricsGridProps {
  data: BusinessMetrics;
  isLoading?: boolean;
}

export function BusinessMetricsGrid({
  data,
  isLoading,
}: BusinessMetricsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-lg border border-gray-200 bg-white p-6"
          />
        ))}
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: data.revenue.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('tr-TR').format(num);
  };

  const renderTrend = (percentage: number) => {
    const isPositive = percentage >= 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const color = isPositive ? 'text-green-600' : 'text-red-600';

    return (
      <div className={`flex items-center gap-1 text-sm ${color}`}>
        <Icon className="h-4 w-4" />
        <span className="font-medium">
          {isPositive ? '+' : ''}
          {percentage.toFixed(1)}%
        </span>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {/* Revenue Card */}
      <div className="group rounded-lg border border-gray-200 bg-gradient-to-br from-green-50 to-white p-6 transition-shadow hover:shadow-lg">
        <div className="mb-4 flex items-start justify-between">
          <div className="rounded-lg bg-green-100 p-3">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          {renderTrend(data.revenue.percentageChange)}
        </div>
        <h3 className="mb-1 text-sm font-medium text-gray-600">
          Total Revenue
        </h3>
        <p className="mb-2 text-3xl font-bold text-gray-900">
          {formatCurrency(data.revenue.total)}
        </p>
        <p className="text-xs text-gray-500">
          {data.revenue.period === 'today' && 'Today'}
          {data.revenue.period === 'week' && 'This Week'}
          {data.revenue.period === 'month' && 'This Month'}
          {data.revenue.period === 'year' && 'This Year'}
        </p>

        {/* Mini Chart (Placeholder - can be replaced with actual chart) */}
        <div className="mt-4 flex h-12 items-end gap-1">
          {data.revenue.chart.values.slice(-7).map((value, index) => {
            const maxValue = Math.max(...data.revenue.chart.values);
            const height = (value / maxValue) * 100;
            return (
              <div
                key={index}
                className="flex-1 rounded-t bg-green-200 transition-all group-hover:bg-green-300"
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>
      </div>

      {/* Active Orders Card */}
      <div className="group rounded-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-6 transition-shadow hover:shadow-lg">
        <div className="mb-4 flex items-start justify-between">
          <div className="rounded-lg bg-blue-100 p-3">
            <ShoppingCart className="h-6 w-6 text-blue-600" />
          </div>
          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
            {data.orders.pending} pending
          </span>
        </div>
        <h3 className="mb-1 text-sm font-medium text-gray-600">
          Active Orders
        </h3>
        <p className="mb-2 text-3xl font-bold text-gray-900">
          {formatNumber(data.orders.active)}
        </p>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>{formatNumber(data.orders.completed)} completed</span>
          <span>•</span>
          <span className="font-medium">
            {formatCurrency(data.orders.avgOrderValue)} avg
          </span>
        </div>

        {/* Order Stats */}
        <div className="mt-4 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Completion Rate</span>
            <span className="font-medium text-gray-900">
              {(
                (data.orders.completed /
                  (data.orders.active + data.orders.completed)) *
                100
              ).toFixed(1)}
              %
            </span>
          </div>
        </div>
      </div>

      {/* New Users Card */}
      <div className="group rounded-lg border border-gray-200 bg-gradient-to-br from-purple-50 to-white p-6 transition-shadow hover:shadow-lg">
        <div className="mb-4 flex items-start justify-between">
          <div className="rounded-lg bg-purple-100 p-3">
            <Users className="h-6 w-6 text-purple-600" />
          </div>
          {renderTrend(data.users.growthRate)}
        </div>
        <h3 className="mb-1 text-sm font-medium text-gray-600">New Users</h3>
        <p className="mb-2 text-3xl font-bold text-gray-900">
          {formatNumber(data.users.new)}
        </p>
        <p className="text-xs text-gray-500">Last 30 days</p>

        {/* User Distribution */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Freelancers</span>
            <span className="font-medium text-gray-900">
              {formatNumber(data.users.byRole.freelancers)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Employers</span>
            <span className="font-medium text-gray-900">
              {formatNumber(data.users.byRole.employers)}
            </span>
          </div>
        </div>
      </div>

      {/* Pending Refunds Card */}
      <div className="group rounded-lg border border-gray-200 bg-gradient-to-br from-orange-50 to-white p-6 transition-shadow hover:shadow-lg">
        <div className="mb-4 flex items-start justify-between">
          <div className="rounded-lg bg-orange-100 p-3">
            <RefreshCw className="h-6 w-6 text-orange-600" />
          </div>
          <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
            Action required
          </span>
        </div>
        <h3 className="mb-1 text-sm font-medium text-gray-600">
          Pending Refunds
        </h3>
        <p className="mb-2 text-3xl font-bold text-gray-900">
          {formatNumber(data.refunds.pending)}
        </p>
        <p className="text-xs text-gray-500">
          {formatCurrency(data.refunds.totalAmount)} total
        </p>

        {/* Refund Stats */}
        <div className="mt-4 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Avg Processing</span>
            <span className="font-medium text-gray-900">
              {data.refunds.avgProcessingTime}h
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-green-600">
              {data.refunds.approved} approved
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-red-600">
              {data.refunds.rejected} rejected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
