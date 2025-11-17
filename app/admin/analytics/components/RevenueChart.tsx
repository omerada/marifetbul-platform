'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  useRevenueAnalytics,
  type TimePeriod,
  type GroupBy,
} from '@/hooks/business/analytics';
import { useState } from 'react';
import { formatCurrency } from '@/lib/utils';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';

interface RevenueChartProps {
  period: TimePeriod;
}

export function RevenueChart({ period }: RevenueChartProps) {
  const [groupBy, setGroupBy] = useState<GroupBy>('day');
  const { data, isLoading, error } = useRevenueAnalytics(period, groupBy);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
          <p className="text-muted-foreground text-sm">
            Loading revenue data...
          </p>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
          <p className="text-destructive text-sm">
            Failed to load revenue data: {error}
          </p>
        </CardHeader>
      </Card>
    );
  }

  if (!data) return null;

  const { summary } = data;
  const isPositiveGrowth = summary.growthRate >= 0;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <p className="text-muted-foreground text-sm">Total Revenue</p>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.totalRevenue)}
            </div>
            <div
              className={`flex items-center text-sm ${isPositiveGrowth ? 'text-green-600' : 'text-red-600'}`}
            >
              {isPositiveGrowth ? (
                <TrendingUp className="mr-1 h-4 w-4" />
              ) : (
                <TrendingDown className="mr-1 h-4 w-4" />
              )}
              {Math.abs(summary.growthRate).toFixed(1)}% from previous period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <p className="text-muted-foreground text-sm">Commission Revenue</p>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.totalCommission)}
            </div>
            <div className="text-muted-foreground text-sm">
              {((summary.totalCommission / summary.totalRevenue) * 100).toFixed(
                1
              )}
              % of total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <p className="text-muted-foreground text-sm">Total Orders</p>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.totalOrders.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <p className="text-muted-foreground text-sm">Average Order Value</p>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.averageOrderValue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Revenue Trend</CardTitle>
              <p className="text-muted-foreground text-sm">
                Daily revenue breakdown
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setGroupBy('day')}
                className={`rounded px-3 py-1 text-sm ${groupBy === 'day' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
              >
                Daily
              </button>
              <button
                onClick={() => setGroupBy('week')}
                className={`rounded px-3 py-1 text-sm ${groupBy === 'week' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
              >
                Weekly
              </button>
              <button
                onClick={() => setGroupBy('month')}
                className={`rounded px-3 py-1 text-sm ${groupBy === 'month' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
              >
                Monthly
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex h-80 items-end justify-between gap-1">
            {data.data.map((point, index) => {
              const maxRevenue = Math.max(
                ...data.data.map((p) => p.totalRevenue)
              );
              const height = (point.totalRevenue / maxRevenue) * 100;
              const date = new Date(point.date);
              const label =
                groupBy === 'day'
                  ? date.getDate().toString()
                  : groupBy === 'week'
                    ? `W${Math.ceil(date.getDate() / 7)}`
                    : date.toLocaleDateString('en-US', { month: 'short' });

              return (
                <div
                  key={index}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <div className="relative flex w-full flex-1 items-end">
                    <div
                      className="bg-primary w-full rounded-t transition-all hover:opacity-80"
                      style={{ height: `${height}%` }}
                      title={`${label}: ${formatCurrency(point.totalRevenue)}`}
                    />
                  </div>
                  <span className="text-muted-foreground text-xs">{label}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left">Date</th>
                  <th className="py-2 text-right">Revenue</th>
                  <th className="py-2 text-right">Commission</th>
                  <th className="py-2 text-right">Orders</th>
                  <th className="py-2 text-right">Avg. Order</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((point, index) => (
                  <tr key={index} className="hover:bg-muted/50 border-b">
                    <td className="py-2">
                      {new Date(point.date).toLocaleDateString()}
                    </td>
                    <td className="text-right">
                      {formatCurrency(point.totalRevenue)}
                    </td>
                    <td className="text-right">
                      {formatCurrency(point.commissionRevenue)}
                    </td>
                    <td className="text-right">{point.orderCount}</td>
                    <td className="text-right">
                      {formatCurrency(point.averageOrderValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
