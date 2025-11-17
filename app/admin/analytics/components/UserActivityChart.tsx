'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  useUserAnalytics,
  type TimePeriod,
  type UserMetric,
} from '@/hooks/business/analytics';
import { useState } from 'react';
import { Loader2, Users, UserCheck, UserX } from 'lucide-react';

interface UserActivityChartProps {
  period: TimePeriod;
}

export function UserActivityChart({ period }: UserActivityChartProps) {
  const [metric, setMetric] = useState<UserMetric>('active');
  const { data, isLoading, error } = useUserAnalytics(period, metric);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Activity</CardTitle>
          <p className="text-muted-foreground text-sm">Loading user data...</p>
        </CardHeader>
        <CardContent className="flex h-64 items-center justify-center">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Activity</CardTitle>
          <p className="text-destructive text-sm">
            Failed to load user data: {error}
          </p>
        </CardHeader>
      </Card>
    );
  }

  if (!data) return null;

  const { summary } = data;
  const isPositiveChange = summary.changeRate >= 0;

  const metricIcons = {
    active: Users,
    retention: UserCheck,
    churn: UserX,
  };

  const MetricIcon = metricIcons[metric];

  return (
    <div className="space-y-4">
      {/* Metric Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setMetric('active')}
          className={`flex items-center gap-2 rounded-md px-4 py-2 ${
            metric === 'active'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          <Users className="h-4 w-4" />
          Active Users
        </button>
        <button
          onClick={() => setMetric('retention')}
          className={`flex items-center gap-2 rounded-md px-4 py-2 ${
            metric === 'retention'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          <UserCheck className="h-4 w-4" />
          Retention Rate
        </button>
        <button
          onClick={() => setMetric('churn')}
          className={`flex items-center gap-2 rounded-md px-4 py-2 ${
            metric === 'churn'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          <UserX className="h-4 w-4" />
          Churn Rate
        </button>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MetricIcon className="h-5 w-5" />
            <CardTitle>
              {metric === 'active' && 'Active Users'}
              {metric === 'retention' && 'User Retention'}
              {metric === 'churn' && 'User Churn'}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-4">
            <div className="text-4xl font-bold">
              {metric === 'active'
                ? summary.current.toLocaleString()
                : `${summary.current.toFixed(1)}%`}
            </div>
            <div
              className={`text-sm ${
                isPositiveChange
                  ? metric === 'churn'
                    ? 'text-red-600'
                    : 'text-green-600'
                  : metric === 'churn'
                    ? 'text-green-600'
                    : 'text-red-600'
              }`}
            >
              {isPositiveChange ? '↑' : '↓'}{' '}
              {Math.abs(summary.changeRate).toFixed(1)}% from previous period
            </div>
          </div>
          <p className="text-muted-foreground mt-2 text-sm">
            Previous period:{' '}
            {metric === 'active'
              ? summary.previous.toLocaleString()
              : `${summary.previous.toFixed(1)}%`}
          </p>
        </CardContent>
      </Card>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Trend Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-end justify-between gap-1">
            {data.data.map((point, index) => {
              const maxValue = Math.max(...data.data.map((p) => p.value));
              const minValue = Math.min(...data.data.map((p) => p.value));
              const range = maxValue - minValue || 1;
              const height = ((point.value - minValue) / range) * 100;
              const date = new Date(point.date);
              const label = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={index}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <div className="relative flex w-full flex-1 items-end">
                    <div
                      className={`w-full rounded-t transition-all hover:opacity-80 ${
                        metric === 'churn' ? 'bg-red-500' : 'bg-primary'
                      }`}
                      style={{ height: `${Math.max(height, 5)}%` }}
                      title={`${label}: ${metric === 'active' ? point.value.toLocaleString() : `${point.value.toFixed(1)}%`}`}
                    />
                  </div>
                  {index % Math.ceil(data.data.length / 10) === 0 && (
                    <span className="text-muted-foreground text-xs">
                      {label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
