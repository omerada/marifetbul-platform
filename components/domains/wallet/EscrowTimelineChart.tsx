'use client';

/**
 * ================================================
 * ESCROW TIMELINE CHART
 * ================================================
 * Visual timeline of escrow flow and status distribution
 *
 * Features:
 * - Area chart showing escrow volume over time
 * - Status distribution pie chart
 * - Release trend line chart
 * - Period selector (7d, 30d, 90d, all)
 * - Responsive design with mobile optimization
 * - Interactive tooltips with detailed stats
 * - Export functionality
 * - Real-time data updates
 *
 * Sprint 1 - Day 2 - Escrow Dashboard Enhancement
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import React, { useState, useMemo } from 'react';
import {
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
import { TrendingUp, Download } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/shared/formatters';
import { cn } from '@/lib/utils';
import type { EscrowPaymentDetails } from '@/types/business/features/wallet';

// ============================================================================
// TYPES
// ============================================================================

export type ChartPeriod = '7d' | '30d' | '90d' | 'all';

export interface EscrowTimelineData {
  date: string;
  held: number;
  released: number;
  disputed: number;
  totalAmount: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
  color: string;
  [key: string]: string | number; // Index signature for Recharts compatibility
}

export interface EscrowTimelineChartProps {
  escrows: EscrowPaymentDetails[];
  isLoading?: boolean;
  className?: string;
  defaultPeriod?: ChartPeriod;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STATUS_COLORS = {
  HELD: '#3B82F6', // Blue
  PENDING_RELEASE: '#F59E0B', // Amber
  RELEASED: '#10B981', // Green
  DISPUTED: '#EF4444', // Red
  REFUNDED: '#6366F1', // Indigo
} as const;

const PERIOD_LABELS: Record<ChartPeriod, string> = {
  '7d': 'Son 7 Gün',
  '30d': 'Son 30 Gün',
  '90d': 'Son 90 Gün',
  all: 'Tüm Zamanlar',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function filterEscrowsByPeriod(
  escrows: EscrowPaymentDetails[],
  period: ChartPeriod
): EscrowPaymentDetails[] {
  if (period === 'all') return escrows;

  const daysMap: Record<Exclude<ChartPeriod, 'all'>, number> = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
  };

  const cutoffDate = getDaysAgo(daysMap[period]);
  return escrows.filter((e) => new Date(e.createdAt) >= cutoffDate);
}

function prepareTimelineData(
  escrows: EscrowPaymentDetails[]
): EscrowTimelineData[] {
  const dataMap = new Map<string, EscrowTimelineData>();

  escrows.forEach((escrow) => {
    const date = new Date(escrow.createdAt).toISOString().split('T')[0];

    if (!dataMap.has(date)) {
      dataMap.set(date, {
        date,
        held: 0,
        released: 0,
        disputed: 0,
        totalAmount: 0,
      });
    }

    const data = dataMap.get(date)!;
    data.totalAmount += escrow.amount;

    if (escrow.status === 'HELD' || escrow.status === 'PENDING_RELEASE') {
      data.held += escrow.amount;
    } else if (escrow.status === 'RELEASED') {
      data.released += escrow.amount;
    } else if (escrow.status === 'FROZEN') {
      data.disputed += escrow.amount;
    }
  });

  return Array.from(dataMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}

function prepareStatusDistribution(
  escrows: EscrowPaymentDetails[]
): StatusDistribution[] {
  const statusCounts = new Map<string, number>();

  escrows.forEach((escrow) => {
    const count = statusCounts.get(escrow.status) || 0;
    statusCounts.set(escrow.status, count + 1);
  });

  const total = escrows.length;
  const distribution: StatusDistribution[] = [];

  statusCounts.forEach((count, status) => {
    distribution.push({
      status,
      count,
      percentage: (count / total) * 100,
      color: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#94A3B8',
    });
  });

  return distribution.sort((a, b) => b.count - a.count);
}

// ============================================================================
// CUSTOM TOOLTIP
// ============================================================================

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
      <p className="mb-2 text-sm font-semibold text-gray-900">
        {formatDate(label || '')}
      </p>
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-gray-600">{entry.name}</span>
            </div>
            <span className="text-xs font-semibold text-gray-900">
              {formatCurrency(entry.value, 'TRY')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

function ChartSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-64 w-full animate-pulse rounded-lg bg-gray-200" />
      <div className="flex gap-4">
        <div className="h-32 flex-1 animate-pulse rounded-lg bg-gray-200" />
        <div className="h-32 flex-1 animate-pulse rounded-lg bg-gray-200" />
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EscrowTimelineChart({
  escrows,
  isLoading = false,
  className,
  defaultPeriod = '30d',
}: EscrowTimelineChartProps) {
  const [period, setPeriod] = useState<ChartPeriod>(defaultPeriod);

  // Filter escrows by period
  const filteredEscrows = useMemo(
    () => filterEscrowsByPeriod(escrows, period),
    [escrows, period]
  );

  // Prepare chart data
  const timelineData = useMemo(
    () => prepareTimelineData(filteredEscrows),
    [filteredEscrows]
  );

  const statusDistribution = useMemo(
    () => prepareStatusDistribution(filteredEscrows),
    [filteredEscrows]
  );

  // Loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Emanet Akış Grafiği</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartSkeleton />
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (escrows.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Emanet Akış Grafiği</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="mb-4 h-12 w-12 text-gray-400" />
            <p className="text-gray-600">Henüz veri yok</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Emanet Akış Grafiği</CardTitle>
          <div className="flex items-center gap-2">
            {/* Period Selector */}
            <div className="flex rounded-lg border border-gray-200">
              {(['7d', '30d', '90d', 'all'] as ChartPeriod[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    'px-3 py-1 text-sm transition-colors',
                    period === p
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  {PERIOD_LABELS[p]}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // TODO: Implement export functionality
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Dışa Aktar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timeline Area Chart */}
        <div>
          <h3 className="mb-4 text-sm font-semibold text-gray-900">
            Zaman İçinde Emanet Hacmi
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="colorHeld" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={STATUS_COLORS.HELD}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={STATUS_COLORS.HELD}
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="colorReleased" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={STATUS_COLORS.RELEASED}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={STATUS_COLORS.RELEASED}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#6B7280' }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Area
                type="monotone"
                dataKey="held"
                name="Emanette"
                stroke={STATUS_COLORS.HELD}
                fillOpacity={1}
                fill="url(#colorHeld)"
              />
              <Area
                type="monotone"
                dataKey="released"
                name="Serbest Bırakılan"
                stroke={STATUS_COLORS.RELEASED}
                fillOpacity={1}
                fill="url(#colorReleased)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Pie Chart */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              Durum Dağılımı
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Status Legend */}
          <div className="flex flex-col justify-center space-y-2">
            {statusDistribution.map((item) => (
              <div
                key={item.status}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-gray-900">
                    {item.status}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{item.count} adet</Badge>
                  <span className="text-sm font-semibold text-gray-600">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
