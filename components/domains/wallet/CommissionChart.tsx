/**
 * ================================================
 * COMMISSION CHART
 * ================================================
 * Monthly commission trends visualization with Recharts
 *
 * Features:
 * - Line chart for monthly commission trends
 * - Bar chart comparison view
 * - Customizable period (6m, 12m, all time)
 * - Responsive design
 * - Dark mode support
 * - Interactive tooltips
 * - Export to image functionality
 *
 * Sprint Day 5 - Commission Tracking UI
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, BarChart3, Download } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { formatCurrency } from '@/lib/shared/utils/format';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface MonthlyCommissionData {
  /** Month label (e.g., "2025-01", "Jan 2025") */
  month: string;

  /** Commission amount for the month */
  commission: number;

  /** Number of orders in the month */
  orderCount: number;

  /** Average commission per order */
  averagePerOrder: number;
}

export type ChartType = 'line' | 'bar';
export type ChartPeriod = '6m' | '12m' | 'all';

export interface CommissionChartProps {
  /** Monthly commission data */
  data: MonthlyCommissionData[];

  /** Default chart type */
  defaultChartType?: ChartType;

  /** Default period */
  defaultPeriod?: ChartPeriod;

  /** Currency code */
  currency?: string;

  /** Loading state */
  isLoading?: boolean;

  /** Callback when export is clicked */
  onExport?: () => void;

  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CHART_COLORS = {
  primary: '#10b981', // green-500
  secondary: '#6366f1', // indigo-500
  grid: '#e5e7eb', // gray-200
  gridDark: '#374151', // gray-700
  text: '#6b7280', // gray-500
  textDark: '#9ca3af', // gray-400
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

export const CommissionChart: React.FC<CommissionChartProps> = ({
  data,
  defaultChartType = 'line',
  defaultPeriod = '12m',
  currency = 'TRY',
  isLoading = false,
  onExport,
  className,
}) => {
  const [chartType, setChartType] = useState<ChartType>(defaultChartType);
  const [period, setPeriod] = useState<ChartPeriod>(defaultPeriod);

  // Filter data based on selected period
  const filteredData = useMemo(() => {
    if (period === 'all') return data;

    const monthsToShow = period === '6m' ? 6 : 12;
    return data.slice(-monthsToShow);
  }, [data, period]);

  // Calculate totals for summary
  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, item) => ({
        commission: acc.commission + item.commission,
        orderCount: acc.orderCount + item.orderCount,
      }),
      { commission: 0, orderCount: 0 }
    );
  }, [filteredData]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: MonthlyCommissionData }> }) => {
    if (!active || !payload?.length) return null;

    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-gray-900 dark:text-white mb-2">
          {data.month}
        </p>
        <div className="space-y-1 text-sm">
          <p className="text-green-600 dark:text-green-400">
            Komisyon: <span className="font-semibold">{formatCurrency(data.commission, currency)}</span>
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Sipariş: <span className="font-semibold">{data.orderCount}</span>
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Ortalama: <span className="font-semibold">{formatCurrency(data.averagePerOrder, currency)}</span>
          </p>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className={cn('relative', className)}>
        <CardHeader>
          <CardTitle>Komisyon Trendi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="w-8 h-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!filteredData.length) {
    return (
      <Card className={cn('relative', className)}>
        <CardHeader>
          <CardTitle>Komisyon Trendi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-gray-500">
            Henüz komisyon verisi bulunmuyor
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card className={cn('relative', className)}>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Komisyon Trendi
              </CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Toplam: {formatCurrency(totals.commission, currency)} • {totals.orderCount} sipariş
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Period selector */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                {(['6m', '12m', 'all'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={cn(
                      'px-3 py-1 text-sm rounded transition-colors',
                      period === p
                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    )}
                  >
                    {p === '6m' ? '6 Ay' : p === '12m' ? '12 Ay' : 'Tümü'}
                  </button>
                ))}
              </div>

              {/* Chart type toggle */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setChartType('line')}
                  className={cn(
                    'px-3 py-1 rounded transition-colors',
                    chartType === 'line'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  )}
                  title="Çizgi grafik"
                >
                  <TrendingUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setChartType('bar')}
                  className={cn(
                    'px-3 py-1 rounded transition-colors',
                    chartType === 'bar'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  )}
                  title="Çubuk grafik"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
              </div>

              {/* Export button */}
              {onExport && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onExport}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Dışa Aktar
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            {chartType === 'line' ? (
              <LineChart data={filteredData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={CHART_COLORS.grid}
                  className="dark:stroke-gray-700"
                />
                <XAxis
                  dataKey="month"
                  stroke={CHART_COLORS.text}
                  className="dark:stroke-gray-400"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  stroke={CHART_COLORS.text}
                  className="dark:stroke-gray-400"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const num = Number(value);
                    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
                    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
                    return formatCurrency(num, currency);
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 14 }}
                  formatter={(value) => (value === 'commission' ? 'Komisyon' : value)}
                />
                <Line
                  type="monotone"
                  dataKey="commission"
                  stroke={CHART_COLORS.primary}
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS.primary, r: 4 }}
                  activeDot={{ r: 6 }}
                  animationDuration={1000}
                />
              </LineChart>
            ) : (
              <BarChart data={filteredData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={CHART_COLORS.grid}
                  className="dark:stroke-gray-700"
                />
                <XAxis
                  dataKey="month"
                  stroke={CHART_COLORS.text}
                  className="dark:stroke-gray-400"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  stroke={CHART_COLORS.text}
                  className="dark:stroke-gray-400"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const num = Number(value);
                    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
                    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
                    return formatCurrency(num, currency);
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 14 }}
                  formatter={(value) => (value === 'commission' ? 'Komisyon' : value)}
                />
                <Bar
                  dataKey="commission"
                  fill={CHART_COLORS.primary}
                  radius={[8, 8, 0, 0]}
                  animationDuration={1000}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CommissionChart;
