/**
 * RevenueChart Component
 * Displays revenue trends over time with area chart
 * Supports daily, weekly, and monthly views
 */

'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  chartConfig,
  formatChartCurrency,
  getDateLabel,
} from '@/lib/config/charts';

interface ChartDataPoint {
  date: string;
  amount: number;
  orderCount?: number;
}

interface RevenueChartProps {
  data: ChartDataPoint[];
  days?: number;
  className?: string;
  height?: number;
}

export function RevenueChart({
  data,
  days = 30,
  className = '',
  height = 300,
}: RevenueChartProps) {
  // Transform data for chart
  const chartData = useMemo(() => {
    return data.map((item) => ({
      date: new Date(item.date),
      dateLabel: getDateLabel(new Date(item.date), days),
      revenue: item.amount,
      orders: item.orderCount,
    }));
  }, [data, days]);

  // Calculate trend
  const trend = useMemo(() => {
    if (chartData.length < 2)
      return { direction: 'flat' as const, percentage: 0 };

    const firstHalf = chartData.slice(0, Math.floor(chartData.length / 2));
    const secondHalf = chartData.slice(Math.floor(chartData.length / 2));

    const firstAvg =
      firstHalf.reduce((sum, item) => sum + item.revenue, 0) / firstHalf.length;
    const secondAvg =
      secondHalf.reduce((sum, item) => sum + item.revenue, 0) /
      secondHalf.length;

    const change = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (Math.abs(change) < 1)
      return { direction: 'flat' as const, percentage: 0 };
    if (change > 0) return { direction: 'up' as const, percentage: change };
    return { direction: 'down' as const, percentage: Math.abs(change) };
  }, [chartData]);

  // Total revenue
  const totalRevenue = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.revenue, 0);
  }, [chartData]);

  // Custom tooltip
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: any[];
  }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    return (
      <div style={chartConfig.tooltip.contentStyle}>
        <p style={chartConfig.tooltip.labelStyle}>
          {data.date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
        <div className="space-y-1">
          <p className="text-sm">
            <span className="font-medium">Gelir:</span>{' '}
            <span className="text-green-600">
              {formatChartCurrency(data.revenue)}
            </span>
          </p>
          <p className="text-muted-foreground text-sm">{data.orders} sipariş</p>
        </div>
      </div>
    );
  };

  if (!chartData.length) {
    return (
      <div className={`bg-card rounded-lg border p-6 ${className}`}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">Gelir Trendi</h3>
        </div>
        <div className="text-muted-foreground flex h-64 items-center justify-center">
          Bu dönem için veri bulunmuyor
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card rounded-lg border p-6 ${className}`}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Gelir Trendi</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Son {days} günlük performans
          </p>
        </div>

        {/* Trend indicator */}
        <div className="flex items-center gap-2">
          {trend.direction === 'up' && (
            <>
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-600">
                +{trend.percentage.toFixed(1)}%
              </span>
            </>
          )}
          {trend.direction === 'down' && (
            <>
              <TrendingDown className="h-5 w-5 text-red-600" />
              <span className="text-sm font-medium text-red-600">
                -{trend.percentage.toFixed(1)}%
              </span>
            </>
          )}
          {trend.direction === 'flat' && (
            <>
              <Minus className="text-muted-foreground h-5 w-5" />
              <span className="text-muted-foreground text-sm font-medium">
                Sabit
              </span>
            </>
          )}
        </div>
      </div>

      {/* Total revenue */}
      <div className="mb-6">
        <p className="text-2xl font-bold">
          {formatChartCurrency(totalRevenue)}
        </p>
        <p className="text-muted-foreground text-sm">Toplam Gelir</p>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={chartConfig.revenue.gradient.from}
                stopOpacity={1}
              />
              <stop
                offset="95%"
                stopColor={chartConfig.revenue.gradient.to}
                stopOpacity={1}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray={chartConfig.grid.strokeDasharray}
            stroke={chartConfig.grid.stroke}
            vertical={false}
          />

          <XAxis
            dataKey="dateLabel"
            stroke={chartConfig.colors.muted}
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            stroke={chartConfig.colors.muted}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatChartCurrency}
            width={80}
          />

          <Tooltip content={<CustomTooltip />} />

          <Area
            type="monotone"
            dataKey="revenue"
            stroke={chartConfig.revenue.stroke}
            strokeWidth={2}
            fill="url(#revenueGradient)"
            animationDuration={chartConfig.animation.duration}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: chartConfig.revenue.stroke }}
          />
          <span className="text-muted-foreground">Gelir</span>
        </div>
      </div>
    </div>
  );
}
