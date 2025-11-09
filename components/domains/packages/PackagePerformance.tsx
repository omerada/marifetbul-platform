'use client';

/**
 * PackagePerformance Component
 * Displays package-level performance metrics
 * Shows sales, conversion rate, revenue per package
 */

'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Package, TrendingUp, DollarSign, ShoppingCart } from 'lucide-react';
import {
  chartConfig,
  formatChartCurrency,
  formatChartNumber,
} from '@/lib/config/charts';

interface PackageMetrics {
  packageId: string;
  packageName: string;
  sales: number;
  revenue: number;
  views: number;
  conversionRate: number;
}

interface PackagePerformanceProps {
  data: PackageMetrics[];
  className?: string;
  maxItems?: number;
}

export function PackagePerformance({
  data,
  className = '',
  maxItems = 5,
}: PackagePerformanceProps) {
  // Sort by revenue and take top N
  const topPackages = useMemo(() => {
    return [...data].sort((a, b) => b.revenue - a.revenue).slice(0, maxItems);
  }, [data, maxItems]);

  // Calculate totals
  const totals = useMemo(() => {
    return {
      sales: data.reduce((sum, p) => sum + p.sales, 0),
      revenue: data.reduce((sum, p) => sum + p.revenue, 0),
      avgConversion:
        data.length > 0
          ? data.reduce((sum, p) => sum + p.conversionRate, 0) / data.length
          : 0,
    };
  }, [data]);

  // Get best performing package
  const bestPackage = topPackages[0];

  // Chart colors
  const chartColors = [
    chartConfig.revenue.stroke,
    chartConfig.spending.stroke,
    chartConfig.orders.stroke,
    chartConfig.proposals.stroke,
    chartConfig.completion.stroke,
  ];

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
        <p style={chartConfig.tooltip.labelStyle}>{data.packageName}</p>
        <div className="space-y-1">
          <p className="text-sm">
            <span className="font-medium">Gelir:</span>{' '}
            <span className="text-green-600">
              {formatChartCurrency(data.revenue)}
            </span>
          </p>
          <p className="text-muted-foreground text-sm">
            {data.sales} satış · %{data.conversionRate.toFixed(1)} dönüşüm
          </p>
        </div>
      </div>
    );
  };

  if (!data.length) {
    return (
      <div className={`bg-card rounded-lg border p-6 ${className}`}>
        <div className="mb-4 flex items-center gap-2">
          <Package className="text-muted-foreground h-5 w-5" />
          <h3 className="font-semibold">Paket Performansı</h3>
        </div>
        <div className="text-muted-foreground flex h-48 items-center justify-center">
          Henüz paket verisi bulunmuyor
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card rounded-lg border p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="text-muted-foreground h-5 w-5" />
          <h3 className="font-semibold">Paket Performansı</h3>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <div className="text-muted-foreground flex items-center gap-1">
            <ShoppingCart className="h-4 w-4" />
            <span className="text-xs">Toplam Satış</span>
          </div>
          <p className="text-lg font-bold">{formatChartNumber(totals.sales)}</p>
        </div>

        <div className="space-y-1">
          <div className="text-muted-foreground flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs">Toplam Gelir</span>
          </div>
          <p className="text-lg font-bold">
            {formatChartCurrency(totals.revenue)}
          </p>
        </div>

        <div className="space-y-1">
          <div className="text-muted-foreground flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs">Ort. Dönüşüm</span>
          </div>
          <p className="text-lg font-bold">
            {totals.avgConversion.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Best Package Highlight */}
      {bestPackage && (
        <div className="mb-6 rounded-lg bg-green-50 p-4 dark:bg-green-950/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                En İyi Performans
              </p>
              <p className="mt-1 text-lg font-bold text-green-700 dark:text-green-300">
                {bestPackage.packageName}
              </p>
              <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                {formatChartCurrency(bestPackage.revenue)} gelir ·{' '}
                {bestPackage.sales} satış
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {bestPackage.conversionRate.toFixed(1)}%
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                Dönüşüm
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="mb-4">
        <p className="text-muted-foreground mb-3 text-sm">
          En Çok Kazandıran {topPackages.length} Paket
        </p>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={topPackages}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray={chartConfig.grid.strokeDasharray}
              stroke={chartConfig.grid.stroke}
              vertical={false}
            />

            <XAxis
              dataKey="packageName"
              stroke={chartConfig.colors.muted}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              angle={-45}
              textAnchor="end"
              height={80}
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

            <Bar
              dataKey="revenue"
              radius={[4, 4, 0, 0]}
              animationDuration={chartConfig.animation.duration}
            >
              {topPackages.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={chartColors[index % chartColors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Package List */}
      <div className="space-y-2">
        {topPackages.map((pkg, index) => (
          <div
            key={pkg.packageId}
            className="flex items-center justify-between border-t py-2 first:border-t-0"
          >
            <div className="flex flex-1 items-center gap-3">
              <div
                className="h-2 w-2 flex-shrink-0 rounded-full"
                style={{
                  backgroundColor: chartColors[index % chartColors.length],
                }}
              />
              <span className="truncate text-sm font-medium">
                {pkg.packageName}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">{pkg.sales} satış</span>
              <span className="min-w-[80px] text-right font-medium">
                {formatChartCurrency(pkg.revenue)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
