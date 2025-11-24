/**
 * ================================================
 * USER GROWTH CHART COMPONENT
 * ================================================
 * Displays daily user registration growth chart
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 2 Story 2.2
 */

'use client';

import { Card } from '@/components/ui';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface UserGrowthData {
  [date: string]: number;
}

interface UserGrowthChartProps {
  data: UserGrowthData;
  title?: string;
  className?: string;
}

export function UserGrowthChart({
  data,
  title = 'Kullanıcı Artışı',
  className = '',
}: UserGrowthChartProps) {
  // Transform data for chart
  const chartData = Object.entries(data).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString('tr-TR', {
      month: 'short',
      day: 'numeric',
    }),
    users: count,
  }));

  return (
    <Card className={`p-6 ${className}`}>
      <h3 className="mb-6 text-lg font-semibold">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
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
            formatter={(value: number) => [value, 'Yeni Kullanıcı']}
          />
          <Bar
            dataKey="users"
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

export default UserGrowthChart;
