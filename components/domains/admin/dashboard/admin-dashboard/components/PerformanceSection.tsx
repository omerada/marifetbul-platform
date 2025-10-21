/**
 * PerformanceSection Component
 *
 * Performance monitor section with trends visualization
 * Production-ready implementation with responsive charts
 */

'use client';

import { Activity, TrendingUp, Users, DollarSign, Eye } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useMemo } from 'react';

interface TrendsData {
  dailyRevenue: Array<{ date: string; value: number }>;
  dailyUsers: Array<{ date: string; value: number }>;
  dailyOrders: Array<{ date: string; value: number }>;
  dailyPackageViews: Array<{ date: string; value: number }>;
}

interface PerformanceSectionProps {
  trends?: TrendsData | null;
}

type MetricType = 'revenue' | 'users' | 'orders' | 'views';

interface MetricConfig {
  key: keyof TrendsData;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  formatter: (value: number) => string;
}

const METRICS: Record<MetricType, MetricConfig> = {
  revenue: {
    key: 'dailyRevenue',
    label: 'Gelir',
    icon: <DollarSign className="h-4 w-4" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    formatter: (v) =>
      `₺${v.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`,
  },
  users: {
    key: 'dailyUsers',
    label: 'Kullanıcılar',
    icon: <Users className="h-4 w-4" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    formatter: (v) => v.toLocaleString('tr-TR'),
  },
  orders: {
    key: 'dailyOrders',
    label: 'Siparişler',
    icon: <TrendingUp className="h-4 w-4" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    formatter: (v) => v.toLocaleString('tr-TR'),
  },
  views: {
    key: 'dailyPackageViews',
    label: 'Görüntüleme',
    icon: <Eye className="h-4 w-4" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    formatter: (v) => v.toLocaleString('tr-TR'),
  },
};

/**
 * Simple inline sparkline chart component
 */
function Sparkline({
  data,
  color,
}: {
  data: Array<{ date: string; value: number }>;
  color: string;
}) {
  const points = useMemo(() => {
    if (!data || data.length === 0) return '';

    const values = data.map((d) => d.value);
    const maxValue = Math.max(...values, 1);
    const width = 100;
    const height = 40;
    const step = width / (data.length - 1 || 1);

    const pathPoints = data
      .map((d, i) => {
        const x = i * step;
        const y = height - (d.value / maxValue) * height;
        return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
      })
      .join(' ');

    return pathPoints;
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="flex h-10 items-center justify-center text-xs text-gray-400">
        Veri yok
      </div>
    );
  }

  return (
    <svg
      viewBox="0 0 100 40"
      className="h-10 w-full"
      preserveAspectRatio="none"
    >
      <path
        d={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={color}
      />
    </svg>
  );
}

/**
 * Metric card with trend visualization
 */
function MetricCard({
  config,
  data,
}: {
  config: MetricConfig;
  data: Array<{ date: string; value: number }>;
}) {
  const { total, trend } = useMemo(() => {
    if (!data || data.length === 0) return { total: 0, trend: 0 };

    const sum = data.reduce((acc, d) => acc + d.value, 0);

    // Calculate trend: compare last value with average
    const lastValue = data[data.length - 1]?.value || 0;
    const avgValue = sum / data.length;
    const trendPercent =
      avgValue > 0 ? ((lastValue - avgValue) / avgValue) * 100 : 0;

    return { total: sum, trend: trendPercent };
  }, [data]);

  return (
    <div className={`rounded-lg border p-4 ${config.bgColor}`}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`${config.color}`}>{config.icon}</div>
          <span className="text-sm font-medium text-gray-700">
            {config.label}
          </span>
        </div>
        <span
          className={`text-xs font-semibold ${
            trend >= 0 ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {trend >= 0 ? '+' : ''}
          {trend.toFixed(1)}%
        </span>
      </div>
      <div className="mb-2">
        <div className={`text-2xl font-bold ${config.color}`}>
          {config.formatter(total)}
        </div>
        <div className="text-xs text-gray-500">Son {data.length} gün</div>
      </div>
      <Sparkline data={data} color={config.color} />
    </div>
  );
}

export function PerformanceSection({ trends }: PerformanceSectionProps) {
  // Eğer trends verisi yoksa component'i gösterme
  if (!trends || !trends.dailyRevenue?.length) {
    return null;
  }

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 shadow-md">
            <Activity className="h-5 w-5 text-purple-600" />
          </div>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Performans İzleme
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(METRICS) as MetricType[]).map((metricType) => {
            const config = METRICS[metricType];
            const data = trends[config.key] || [];
            return <MetricCard key={metricType} config={config} data={data} />;
          })}
        </div>
      </CardContent>
    </Card>
  );
}
