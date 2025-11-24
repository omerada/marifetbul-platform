/**
 * ================================================
 * ORDER TRENDS CHART COMPONENT
 * ================================================
 * Displays order metrics and trends
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 2 Story 2.2
 */

'use client';

import { Card } from '@/components/ui';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface OrderTrendPoint {
  date: string;
  orderCount: number;
  completedCount: number;
  cancelledCount: number;
}

interface OrderTrendsChartProps {
  data: OrderTrendPoint[];
  title?: string;
  className?: string;
}

export function OrderTrendsChart({
  data,
  title = 'Sipariş Trendleri',
  className = '',
}: OrderTrendsChartProps) {
  // Format data for chart
  const chartData = data.map((point) => ({
    date: new Date(point.date).toLocaleDateString('tr-TR', {
      month: 'short',
      day: 'numeric',
    }),
    toplam: point.orderCount,
    tamamlanan: point.completedCount,
    iptal: point.cancelledCount,
  }));

  return (
    <Card className={`p-6 ${className}`}>
      <h3 className="mb-6 text-lg font-semibold">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            className="text-muted-foreground"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            className="text-muted-foreground"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="toplam"
            stackId="1"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="tamamlanan"
            stackId="2"
            stroke="hsl(142 76% 36%)"
            fill="hsl(142 76% 36%)"
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="iptal"
            stackId="3"
            stroke="hsl(0 84% 60%)"
            fill="hsl(0 84% 60%)"
            fillOpacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}

export default OrderTrendsChart;
