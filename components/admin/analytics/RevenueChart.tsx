/**
 * ================================================
 * REVENUE CHART COMPONENT
 * ================================================
 * Interactive chart for revenue visualization
 *
 * Features:
 * - Line/Bar chart toggle
 * - Multiple metrics display
 * - Responsive design
 * - Tooltip with details
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 3 - Task 3.1
 */

'use client';

import { Card } from '@/components/ui/Card';
import { BarChart3, LineChart as LineChartIcon } from 'lucide-react';
import { useState } from 'react';

interface RevenueDataPoint {
  date: string;
  grossRevenue: number;
  netRevenue: number;
  platformFee: number;
  orderCount: number;
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
  isLoading?: boolean;
}

type ChartType = 'line' | 'bar';
type MetricType = 'grossRevenue' | 'netRevenue' | 'platformFee' | 'orderCount';

/**
 * Revenue Chart Component
 */
export function RevenueChart({ data, isLoading }: RevenueChartProps) {
  const [chartType, setChartType] = useState<ChartType>('line');
  const [selectedMetric, setSelectedMetric] =
    useState<MetricType>('grossRevenue');

  if (isLoading) {
    return <RevenueChartSkeleton />;
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground text-center">
          Grafik için veri bulunamadı
        </p>
      </Card>
    );
  }

  const metrics = [
    {
      key: 'grossRevenue' as MetricType,
      label: 'Brüt Gelir',
      color: 'bg-blue-500',
    },
    {
      key: 'netRevenue' as MetricType,
      label: 'Net Gelir',
      color: 'bg-green-500',
    },
    {
      key: 'platformFee' as MetricType,
      label: 'Platform Komisyonu',
      color: 'bg-purple-500',
    },
    {
      key: 'orderCount' as MetricType,
      label: 'Sipariş Sayısı',
      color: 'bg-orange-500',
    },
  ];

  // Calculate max value for scaling
  const maxValue = Math.max(...data.map((d) => d[selectedMetric]));
  const minValue = Math.min(...data.map((d) => d[selectedMetric]));
  const range = maxValue - minValue;

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Gelir Grafiği</h3>
        <div className="flex items-center gap-2">
          <button
            className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              chartType === 'line'
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setChartType('line')}
          >
            <LineChartIcon className="h-4 w-4" />
            Çizgi
          </button>
          <button
            className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              chartType === 'bar'
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setChartType('bar')}
          >
            <BarChart3 className="h-4 w-4" />
            Çubuk
          </button>
        </div>
      </div>

      {/* Metric Selector */}
      <div className="mb-6 flex flex-wrap gap-2">
        {metrics.map((metric) => (
          <button
            key={metric.key}
            onClick={() => setSelectedMetric(metric.key)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
              selectedMetric === metric.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${metric.color}`} />
              {metric.label}
            </div>
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="relative h-64">
        {/* Y-axis labels */}
        <div className="text-muted-foreground absolute top-0 bottom-6 left-0 flex w-16 flex-col justify-between text-xs">
          <span>{maxValue.toLocaleString('tr-TR')}</span>
          <span>{((maxValue + minValue) / 2).toLocaleString('tr-TR')}</span>
          <span>{minValue.toLocaleString('tr-TR')}</span>
        </div>

        {/* Chart area */}
        <div className="absolute top-0 right-0 bottom-6 left-16 border-b border-l border-gray-200">
          <div className="relative h-full w-full">
            {/* Horizontal grid lines */}
            {[0, 25, 50, 75, 100].map((percent) => (
              <div
                key={percent}
                className="absolute right-0 left-0 border-t border-gray-100"
                style={{ top: `${100 - percent}%` }}
              />
            ))}

            {/* Bars or Lines */}
            <div className="absolute inset-0 flex items-end justify-around px-2">
              {data.map((point, index) => {
                const value = point[selectedMetric];
                const heightPercent =
                  range > 0 ? ((value - minValue) / range) * 100 : 0;

                if (chartType === 'bar') {
                  return (
                    <div
                      key={index}
                      className="group relative mx-1 flex-1"
                      style={{ maxWidth: '60px' }}
                    >
                      <div
                        className="bg-primary hover:bg-primary/80 w-full cursor-pointer rounded-t transition-all"
                        style={{ height: `${heightPercent}%` }}
                      >
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 group-hover:block">
                          <div className="rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white">
                            <div className="font-medium">{point.date}</div>
                            <div>{value.toLocaleString('tr-TR')}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Line chart points
                return (
                  <div
                    key={index}
                    className="group relative flex-1"
                    style={{ maxWidth: '60px' }}
                  >
                    <div
                      className="bg-primary absolute left-1/2 h-2 w-2 -translate-x-1/2 cursor-pointer rounded-full transition-transform hover:scale-150"
                      style={{ bottom: `${heightPercent}%` }}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 group-hover:block">
                        <div className="rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white">
                          <div className="font-medium">{point.date}</div>
                          <div>{value.toLocaleString('tr-TR')}</div>
                        </div>
                      </div>
                    </div>

                    {/* Connect lines */}
                    {index < data.length - 1 && (
                      <div
                        className="bg-primary absolute left-1/2 h-0.5 w-full origin-left"
                        style={{
                          bottom: `${heightPercent}%`,
                          transform: `rotate(${Math.atan2(
                            ((data[index + 1][selectedMetric] - minValue) /
                              range) *
                              100 -
                              heightPercent,
                            100 / data.length
                          )}rad)`,
                          width: `${100 / data.length}%`,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* X-axis labels */}
        <div className="text-muted-foreground absolute right-0 bottom-0 left-16 flex h-6 justify-around text-xs">
          {data.map((point, index) => (
            <span key={index} className="flex-1 text-center">
              {point.date}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}

/**
 * Loading skeleton
 */
function RevenueChartSkeleton() {
  return (
    <Card className="animate-pulse p-6">
      <div className="mb-6 h-6 w-32 rounded bg-gray-200" />
      <div className="h-64 rounded bg-gray-100" />
    </Card>
  );
}
