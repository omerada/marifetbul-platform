/**
 * ================================================
 * REVENUE CHART COMPONENT
 * ================================================
 * Displays revenue trend chart using recharts
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 2 Story 2.2
 */

'use client';

import { Card } from '@/components/ui';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/shared/formatters';

interface RevenueTrendPoint {
  date: string;
  value: number;
}

interface RevenueChartProps {
  data: RevenueTrendPoint[];
  title?: string;
  className?: string;
}

export function RevenueChart({
  data,
  title = 'Gelir Trendi',
  className = '',
}: RevenueChartProps) {
  // Format data for chart
  const chartData = data.map((point) => ({
    date: new Date(point.date).toLocaleDateString('tr-TR', {
      month: 'short',
      day: 'numeric',
    }),
    revenue: point.value,
  }));

  return (
    <Card className={`p-6 ${className}`}>
      <h3 className="mb-6 text-lg font-semibold">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            className="text-muted-foreground"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            className="text-muted-foreground"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => formatCurrency(value)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [formatCurrency(value), 'Gelir']}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

export default RevenueChart;
