/**
 * ================================================
 * CHART WIDGET - UNIFIED RECHARTS WRAPPER
 * ================================================
 * Sprint 1 - Day 4: Generic chart component supporting multiple types
 *
 * Features:
 * - 5 chart types: line, bar, pie, area, donut
 * - Loading skeleton states
 * - Error handling
 * - Responsive design
 * - Dark mode support
 * - Custom tooltips
 * - Legend configuration
 * - Grid customization
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { memo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import type {
  ChartWidgetProps,
  ChartWidgetData,
  ChartConfig,
} from '../types/dashboard.types';
import { EmptyState } from './EmptyState';
import { SimpleErrorDisplay } from '@/components/ui/SimpleErrorDisplay';
import { Skeleton } from '@/components/ui/UnifiedSkeleton';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default color palette for charts (accessible, dark mode friendly)
 */
const DEFAULT_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // green-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
  '#f97316', // orange-500
] as const;

/**
 * Default chart configuration
 */
const DEFAULT_CONFIG = {
  height: 300,
  responsive: true,
  showLegend: true,
  showGrid: true,
} as const;

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

/**
 * Loading skeleton for chart
 */
const ChartSkeleton = memo(({ height = 300 }: { height?: number }) => {
  return (
    <div className="animate-pulse space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>

      {/* Chart skeleton */}
      <div className="space-y-2" style={{ height }}>
        <div className="flex h-full items-end justify-between gap-2">
          {[...Array(8)].map((_, i) => (
            <Skeleton
              key={i}
              className="w-full"
              style={{ height: `${Math.random() * 60 + 40}%` }}
            />
          ))}
        </div>
      </div>

      {/* Legend skeleton */}
      <div className="flex justify-center gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
});
ChartSkeleton.displayName = 'ChartSkeleton';

/**
 * Custom tooltip for charts
 */
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
  }>;
  label?: string;
}

const CustomTooltip = memo(({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      {label && (
        <p className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">
          {label}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {entry.name}
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {typeof entry.value === 'number'
                ? entry.value.toLocaleString()
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});
CustomTooltip.displayName = 'CustomTooltip';

// ============================================================================
// CHART TYPE COMPONENTS
// ============================================================================

/**
 * Line chart component
 */
const LineChartComponent = memo(
  ({
    data,
    config,
  }: {
    data: ChartWidgetProps['data'];
    config: ChartWidgetProps['data']['config'];
  }) => {
    const chartData = data.series?.[0]?.data || [];
    const height = config?.height || DEFAULT_CONFIG.height;

    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData}>
          {config?.showGrid !== false && (
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-gray-200 dark:stroke-gray-700"
            />
          )}
          <XAxis
            dataKey="label"
            className="text-xs text-gray-600 dark:text-gray-400"
          />
          <YAxis className="text-xs text-gray-600 dark:text-gray-400" />
          <Tooltip content={<CustomTooltip />} />
          {config?.showLegend !== false && <Legend />}
          {data.series?.map((series, index) => (
            <Line
              key={series.name}
              type="monotone"
              dataKey="value"
              name={series.name}
              stroke={
                series.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
              }
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }
);
LineChartComponent.displayName = 'LineChartComponent';

/**
 * Bar chart component
 */
const BarChartComponent = memo(
  ({
    data,
    config,
  }: {
    data: ChartWidgetProps['data'];
    config: ChartWidgetProps['data']['config'];
  }) => {
    const chartData = data.series?.[0]?.data || [];
    const height = config?.height || DEFAULT_CONFIG.height;

    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData}>
          {config?.showGrid !== false && (
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-gray-200 dark:stroke-gray-700"
            />
          )}
          <XAxis
            dataKey="label"
            className="text-xs text-gray-600 dark:text-gray-400"
          />
          <YAxis className="text-xs text-gray-600 dark:text-gray-400" />
          <Tooltip content={<CustomTooltip />} />
          {config?.showLegend !== false && <Legend />}
          {data.series?.map((series, index) => (
            <Bar
              key={series.name}
              dataKey="value"
              name={series.name}
              fill={
                series.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
              }
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  }
);
BarChartComponent.displayName = 'BarChartComponent';

/**
 * Area chart component
 */
const AreaChartComponent = memo(
  ({
    data,
    config,
  }: {
    data: ChartWidgetProps['data'];
    config: ChartWidgetProps['data']['config'];
  }) => {
    const chartData = data.series?.[0]?.data || [];
    const height = config?.height || DEFAULT_CONFIG.height;

    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData}>
          {config?.showGrid !== false && (
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-gray-200 dark:stroke-gray-700"
            />
          )}
          <XAxis
            dataKey="label"
            className="text-xs text-gray-600 dark:text-gray-400"
          />
          <YAxis className="text-xs text-gray-600 dark:text-gray-400" />
          <Tooltip content={<CustomTooltip />} />
          {config?.showLegend !== false && <Legend />}
          {data.series?.map((series, index) => (
            <Area
              key={series.name}
              type="monotone"
              dataKey="value"
              name={series.name}
              stroke={
                series.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
              }
              fill={
                series.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
              }
              fillOpacity={0.6}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    );
  }
);
AreaChartComponent.displayName = 'AreaChartComponent';

/**
 * Pie/Donut chart component
 */
const PieChartComponent = memo(
  ({
    data,
    config,
    isDonut,
  }: {
    data: ChartWidgetProps['data'];
    config: ChartWidgetProps['data']['config'];
    isDonut?: boolean;
  }) => {
    const chartData = data.series?.[0]?.data || [];
    const height = config?.height || DEFAULT_CONFIG.height;

    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData as any}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={isDonut ? '60%' : 0}
            outerRadius="80%"
            paddingAngle={2}
            label
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  data.series?.[0]?.color ||
                  DEFAULT_COLORS[index % DEFAULT_COLORS.length]
                }
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {config?.showLegend !== false && <Legend />}
        </PieChart>
      </ResponsiveContainer>
    );
  }
);
PieChartComponent.displayName = 'PieChartComponent';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Unified chart widget supporting multiple chart types
 *
 * @example
 * ```tsx
 * <ChartWidget
 *   data={{
 *     id: 'revenue-chart',
 *     title: 'Revenue Trend',
 *     subtitle: 'Last 30 days',
 *     series: [{
 *       name: 'Revenue',
 *       data: [
 *         { label: 'Jan', value: 4000 },
 *         { label: 'Feb', value: 3000 },
 *       ],
 *       color: '#3b82f6'
 *     }],
 *     config: {
 *       type: 'line',
 *       height: 300,
 *       showLegend: true,
 *       showGrid: true
 *     }
 *   }}
 *   isLoading={false}
 * />
 * ```
 */
export const ChartWidget = memo<ChartWidgetProps>(
  ({
    data,
    isLoading = false,
    error = null,
    className = '',
    showHeader = true,
    actions,
  }) => {
    // Loading state
    if (isLoading) {
      return (
        <div className={className}>
          <ChartSkeleton height={data.config?.height} />
        </div>
      );
    }

    // Error state
    if (error) {
      return (
        <div className={className}>
          <SimpleErrorDisplay error={error} className="py-8" />
        </div>
      );
    }

    // Empty state
    if (
      !data.series ||
      data.series.length === 0 ||
      !data.series[0]?.data?.length
    ) {
      return (
        <div className={className}>
          <EmptyState
            icon={TrendingUp}
            title="No Data Available"
            description="There is no data to display in this chart"
            className="py-8"
          />
        </div>
      );
    }

    // Get chart icon based on type
    const getChartIcon = () => {
      switch (data.config?.type) {
        case 'pie':
        case 'doughnut':
          return PieChartIcon;
        case 'bar':
          return BarChart3;
        default:
          return TrendingUp;
      }
    };

    const ChartIcon = getChartIcon();

    return (
      <div className={`space-y-4 ${className}`}>
        {/* Header */}
        {showHeader && (
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ChartIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {data.title || data.config?.title}
                </h3>
              </div>
              {data.subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {data.subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-2">{actions}</div>
            )}
          </div>
        )}

        {/* Chart */}
        <div className="w-full">
          {data.config?.type === 'line' && (
            <LineChartComponent data={data} config={data.config} />
          )}
          {data.config?.type === 'bar' && (
            <BarChartComponent data={data} config={data.config} />
          )}
          {data.config?.type === 'area' && (
            <AreaChartComponent data={data} config={data.config} />
          )}
          {data.config?.type === 'pie' && (
            <PieChartComponent
              data={data}
              config={data.config}
              isDonut={false}
            />
          )}
          {data.config?.type === 'doughnut' && (
            <PieChartComponent
              data={data}
              config={data.config}
              isDonut={true}
            />
          )}
        </div>

        {/* Axis labels (optional) */}
        {(data.config?.xAxisLabel || data.config?.yAxisLabel) && (
          <div className="flex items-center justify-between px-4 text-xs text-gray-500 dark:text-gray-500">
            {data.config?.yAxisLabel && (
              <span className="origin-center -rotate-90">
                {data.config.yAxisLabel}
              </span>
            )}
            {data.config?.xAxisLabel && <span>{data.config.xAxisLabel}</span>}
          </div>
        )}
      </div>
    );
  }
);

ChartWidget.displayName = 'ChartWidget';
