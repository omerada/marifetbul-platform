/**
 * ClientStatistics Component
 * Displays client-related statistics
 * Shows repeat clients, new clients, satisfaction metrics
 */

'use client';

import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { Users, UserPlus, RefreshCcw, Star, TrendingUp } from 'lucide-react';
import { chartConfig, formatChartNumber } from '@/lib/config/charts';

interface ClientStats {
  totalClients: number;
  newClients: number;
  repeatClients: number;
  averageSatisfaction: number;
  repeatRate: number;
  topClients: {
    id: string;
    name: string;
    orders: number;
    totalSpent: number;
  }[];
}

interface ClientStatisticsProps {
  data: ClientStats;
  className?: string;
}

export function ClientStatistics({
  data,
  className = '',
}: ClientStatisticsProps) {
  // Pie chart data
  const pieData = useMemo(
    () => [
      {
        name: 'Tekrar Eden',
        value: data.repeatClients,
        color: chartConfig.revenue.stroke,
      },
      {
        name: 'Yeni Müşteri',
        value: data.newClients,
        color: chartConfig.spending.stroke,
      },
    ],
    [data]
  );

  // Calculate growth indicators
  const newClientRate = useMemo(() => {
    if (data.totalClients === 0) return 0;
    return (data.newClients / data.totalClients) * 100;
  }, [data]);

  // Custom tooltip for pie chart
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: any[];
  }) => {
    if (!active || !payload || !payload.length) return null;

    const item = payload[0];

    return (
      <div style={chartConfig.tooltip.contentStyle}>
        <p style={chartConfig.tooltip.labelStyle}>{item.name}</p>
        <div className="space-y-1">
          <p className="text-sm">
            <span className="font-medium">{item.value}</span> müşteri
          </p>
          <p className="text-muted-foreground text-sm">
            {((item.value / data.totalClients) * 100).toFixed(1)}%
          </p>
        </div>
      </div>
    );
  };

  // Custom legend
  const CustomLegend = ({
    payload,
  }: {
    payload?: { value: string; color: string }[];
  }) => {
    if (!payload) return null;

    return (
      <div className="mt-4 flex justify-center gap-4">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground text-sm">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  if (data.totalClients === 0) {
    return (
      <div className={`bg-card rounded-lg border p-6 ${className}`}>
        <div className="mb-4 flex items-center gap-2">
          <Users className="text-muted-foreground h-5 w-5" />
          <h3 className="font-semibold">Müşteri İstatistikleri</h3>
        </div>
        <div className="text-muted-foreground flex h-48 items-center justify-center">
          Henüz müşteri verisi bulunmuyor
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card rounded-lg border p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="text-muted-foreground h-5 w-5" />
          <h3 className="font-semibold">Müşteri İstatistikleri</h3>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="text-muted-foreground flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span className="text-xs">Toplam Müşteri</span>
          </div>
          <p className="text-2xl font-bold">
            {formatChartNumber(data.totalClients)}
          </p>
        </div>

        <div className="space-y-1">
          <div className="text-muted-foreground flex items-center gap-1">
            <Star className="h-4 w-4" />
            <span className="text-xs">Memnuniyet</span>
          </div>
          <p className="text-2xl font-bold">
            {data.averageSatisfaction.toFixed(1)}/5
          </p>
        </div>

        <div className="space-y-1">
          <div className="text-muted-foreground flex items-center gap-1">
            <UserPlus className="h-4 w-4" />
            <span className="text-xs">Yeni Müşteri</span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-lg font-bold">
              {formatChartNumber(data.newClients)}
            </p>
            <span className="text-muted-foreground text-xs">
              ({newClientRate.toFixed(0)}%)
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-muted-foreground flex items-center gap-1">
            <RefreshCcw className="h-4 w-4" />
            <span className="text-xs">Tekrar Eden</span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-lg font-bold">
              {formatChartNumber(data.repeatClients)}
            </p>
            <span className="text-muted-foreground text-xs">
              ({data.repeatRate.toFixed(0)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Repeat Rate Highlight */}
      {data.repeatRate >= 30 && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-green-50 p-3 dark:bg-green-950/20">
          <TrendingUp className="h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-700 dark:text-green-300">
            Harika! Müşterilerinizin{' '}
            <strong>%{data.repeatRate.toFixed(0)}</strong>&apos;ı tekrar sizinle
            çalışıyor.
          </p>
        </div>
      )}

      {/* Pie Chart */}
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              animationDuration={chartConfig.animation.duration}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Top Clients */}
      {data.topClients && data.topClients.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-medium">En Değerli Müşteriler</h4>
          <div className="space-y-2">
            {data.topClients.slice(0, 5).map((client, index) => (
              <div
                key={client.id}
                className="flex items-center justify-between border-t py-2 first:border-t-0"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium">{client.name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground">
                    {client.orders} sipariş
                  </span>
                  <span className="min-w-[80px] text-right font-medium">
                    {formatChartNumber(client.totalSpent)} ₺
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Client Insights */}
      <div className="mt-6 border-t pt-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-primary text-2xl font-bold">
              {data.repeatRate >= 50
                ? '🎯'
                : data.repeatRate >= 30
                  ? '👍'
                  : '📈'}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              {data.repeatRate >= 50
                ? 'Mükemmel sadakat'
                : data.repeatRate >= 30
                  ? 'İyi gidiyor'
                  : 'Gelişebilir'}
            </p>
          </div>
          <div>
            <p className="text-primary text-2xl font-bold">
              {data.averageSatisfaction >= 4.5
                ? '⭐'
                : data.averageSatisfaction >= 4.0
                  ? '😊'
                  : '💪'}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              {data.averageSatisfaction >= 4.5
                ? 'Harika hizmet'
                : data.averageSatisfaction >= 4.0
                  ? 'Kaliteli hizmet'
                  : 'İyileştir'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
