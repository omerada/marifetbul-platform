'use client';

/**
 * ================================================
 * JOB ANALYTICS CHARTS COMPONENT
 * ================================================
 * Visual analytics dashboard for job statistics
 *
 * Features:
 * - Status distribution pie chart
 * - Proposals timeline
 * - Category breakdown
 * - Performance metrics
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 25, 2025
 * Sprint 1: Analytics & Polish - Task 4
 */

import React from 'react';
import {
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import type { JobStatus } from '@/types/backend-aligned';

export interface JobAnalyticsData {
  statusDistribution: Record<JobStatus, number>;
  categoryBreakdown: Record<string, number>;
  proposalsOverTime: Array<{ date: string; count: number }>;
  performanceMetrics: {
    avgProposalsPerJob: number;
    avgViewsPerJob: number;
    avgResponseTime: number;
    conversionRate: number;
  };
}

export interface JobAnalyticsChartsProps {
  data: JobAnalyticsData;
  className?: string;
}

const statusColors: Record<JobStatus, string> = {
  DRAFT: '#9CA3AF',
  OPEN: '#10B981',
  IN_PROGRESS: '#3B82F6',
  COMPLETED: '#8B5CF6',
  CLOSED: '#EF4444',
};

/**
 * Simple Bar Chart Component
 */
interface SimpleBarChartProps {
  data: Array<{ label: string; value: number; color?: string }>;
  maxValue: number;
  height?: number;
}

function SimpleBarChart({ data, maxValue, height = 200 }: SimpleBarChartProps) {
  return (
    <div className="space-y-3" style={{ height }}>
      {data.map((item) => {
        const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        return (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">{item.label}</span>
              <span className="font-semibold text-gray-900">{item.value}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: item.color || '#3B82F6',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Simple Pie Chart Component (Text-based)
 */
interface SimplePieChartProps {
  data: Array<{ label: string; value: number; color: string }>;
  total: number;
}

function SimplePieChart({ data, total }: SimplePieChartProps) {
  return (
    <div className="space-y-2">
      {data.map((item) => {
        const percentage =
          total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
        return (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-700">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">
                {item.value}
              </span>
              <Badge variant="secondary" className="text-xs">
                {percentage}%
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Metric Card Component
 */
interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: number;
  suffix?: string;
}

function MetricCard({ label, value, trend, suffix }: MetricCardProps) {
  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <p className="text-sm text-gray-600">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="text-2xl font-bold text-gray-900">
          {value}
          {suffix && <span className="text-sm text-gray-600">{suffix}</span>}
        </p>
        {trend !== undefined && (
          <Badge
            variant={trend >= 0 ? 'success' : 'destructive'}
            className="text-xs"
          >
            {trend >= 0 ? '+' : ''}
            {trend}%
          </Badge>
        )}
      </div>
    </div>
  );
}

/**
 * Job Analytics Charts Component
 *
 * Comprehensive analytics visualization
 */
export function JobAnalyticsCharts({
  data,
  className = '',
}: JobAnalyticsChartsProps) {
  // Prepare status distribution data
  const statusData = Object.entries(data.statusDistribution)
    .filter(([, value]) => value > 0)
    .map(([status, value]) => ({
      label: getStatusLabel(status as JobStatus),
      value,
      color: statusColors[status as JobStatus],
    }));

  const totalJobs = statusData.reduce((sum, item) => sum + item.value, 0);

  // Prepare category breakdown data
  const categoryData = Object.entries(data.categoryBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([category, value]) => ({
      label: category,
      value,
    }));

  const maxCategoryValue = Math.max(...categoryData.map((c) => c.value), 1);

  return (
    <div className={cn('grid gap-6 md:grid-cols-2', className)}>
      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-blue-600" />
            <CardTitle>Durum Dağılımı</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {statusData.length > 0 ? (
            <SimplePieChart data={statusData} total={totalJobs} />
          ) : (
            <p className="text-center text-sm text-gray-500">Veri bulunamadı</p>
          )}
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            <CardTitle>Popüler Kategoriler</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {categoryData.length > 0 ? (
            <SimpleBarChart
              data={categoryData}
              maxValue={maxCategoryValue}
              height={180}
            />
          ) : (
            <p className="text-center text-sm text-gray-500">Veri bulunamadı</p>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card className="md:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            <CardTitle>Performans Metrikleri</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <MetricCard
              label="Ortalama Teklif"
              value={data.performanceMetrics.avgProposalsPerJob}
              suffix=" teklif/iş"
            />
            <MetricCard
              label="Ortalama Görüntülenme"
              value={data.performanceMetrics.avgViewsPerJob}
              suffix=" görüntülenme"
            />
            <MetricCard
              label="Yanıt Süresi"
              value={data.performanceMetrics.avgResponseTime}
              suffix=" saat"
            />
            <MetricCard
              label="Dönüşüm Oranı"
              value={data.performanceMetrics.conversionRate.toFixed(1)}
              suffix="%"
              trend={5.2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Proposals Timeline */}
      {data.proposalsOverTime.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <CardTitle>Teklif Trendleri (Son 7 Gün)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className="flex items-end justify-between gap-2"
              style={{ height: 150 }}
            >
              {data.proposalsOverTime.slice(-7).map((item, index) => {
                const maxValue = Math.max(
                  ...data.proposalsOverTime.map((i) => i.count),
                  1
                );
                const height = (item.count / maxValue) * 100;
                return (
                  <div
                    key={index}
                    className="flex flex-1 flex-col items-center gap-2"
                  >
                    <div
                      className="w-full rounded-t bg-blue-500 transition-all hover:bg-blue-600"
                      style={{ height: `${height}%`, minHeight: '4px' }}
                      title={`${item.count} teklif`}
                    />
                    <span className="text-xs text-gray-600">
                      {new Date(item.date).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper functions
function getStatusLabel(status: JobStatus): string {
  const labels: Record<JobStatus, string> = {
    DRAFT: 'Taslak',
    OPEN: 'Açık',
    IN_PROGRESS: 'Devam Ediyor',
    COMPLETED: 'Tamamlandı',
    CLOSED: 'Kapalı',
  };
  return labels[status] || status;
}
