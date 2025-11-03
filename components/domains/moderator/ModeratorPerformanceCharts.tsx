/**
 * ================================================
 * MODERATOR PERFORMANCE CHARTS COMPONENT
 * ================================================
 * Performance analytics visualization with charts
 *
 * Features:
 * - Overall metrics cards
 * - Resolution time trend (line chart)
 * - Accuracy rate trend (line chart)
 * - Category breakdown (bar chart)
 * - Comparative metrics (comparison cards)
 *
 * Sprint 2 - Story 2.2: Performance Analytics
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 3, 2025
 */

'use client';

import { useModeratorPerformance } from '@/hooks/business/moderation/useModeratorPerformance';
import type { DailyMetric } from '@/hooks/business/moderation/useModeratorPerformance';
import { Card } from '@/components/ui/Card';
import {
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Award,
  Clock,
  Target,
  Activity,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// ============================================================================
// TYPES
// ============================================================================

export interface ModeratorPerformanceChartsProps {
  days?: number;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ModeratorPerformanceCharts({
  days = 30,
}: ModeratorPerformanceChartsProps) {
  const { metrics, isLoading, error } = useModeratorPerformance({ days });

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-lg bg-gray-200" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-80 rounded-lg bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <div>
            <h3 className="font-semibold">Performans verileri yüklenemedi</h3>
            <p className="text-muted-foreground text-sm">{error.message}</p>
          </div>
        </div>
      </Card>
    );
  }

  // ============================================================================
  // EMPTY STATE
  // ============================================================================

  if (!metrics) {
    return (
      <Card className="p-6">
        <div className="text-muted-foreground text-center">
          <Activity className="mx-auto mb-3 h-12 w-12 opacity-50" />
          <p>Performans verisi bulunamadı</p>
        </div>
      </Card>
    );
  }

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('tr-TR', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const formatNumber = (num: number, decimals: number = 0) => {
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const formatPercentage = (num: number, includeSign: boolean = false) => {
    const sign = includeSign && num > 0 ? '+' : '';
    return `${sign}${formatNumber(num, 1)}%`;
  };

  // Prepare chart data
  const resolutionTimeData = metrics.resolutionTimeTrend.map(
    (d: DailyMetric) => ({
      date: formatDate(d.date),
      'Ort. Süre (dk)': d.value,
      count: d.count,
    })
  );

  const accuracyData = metrics.accuracyTrend.map((d: DailyMetric) => ({
    date: formatDate(d.date),
    'Doğruluk (%)': d.value,
    count: d.count,
  }));

  const categoryData = [
    {
      name: 'Yorumlar',
      actions: metrics.categoryBreakdown.comments.totalActions,
      avgTime: metrics.categoryBreakdown.comments.averageResolutionTime,
      accuracy: metrics.categoryBreakdown.comments.accuracyRate,
    },
    {
      name: 'Değerlendirmeler',
      actions: metrics.categoryBreakdown.reviews.totalActions,
      avgTime: metrics.categoryBreakdown.reviews.averageResolutionTime,
      accuracy: metrics.categoryBreakdown.reviews.accuracyRate,
    },
    {
      name: 'Raporlar',
      actions: metrics.categoryBreakdown.reports.totalActions,
      avgTime: metrics.categoryBreakdown.reports.averageResolutionTime,
      accuracy: metrics.categoryBreakdown.reports.accuracyRate,
    },
    {
      name: 'Destek',
      actions: metrics.categoryBreakdown.tickets.totalActions,
      avgTime: metrics.categoryBreakdown.tickets.averageResolutionTime,
      accuracy: metrics.categoryBreakdown.tickets.accuracyRate,
    },
  ];

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Overall Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Actions */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Toplam İşlem</p>
              <p className="text-2xl font-bold">
                {formatNumber(metrics.overall.totalActions)}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Son 30 gün: {formatNumber(metrics.overall.actionsLast30Days)}
              </p>
            </div>
            <Activity className="h-8 w-8 text-blue-500 opacity-75" />
          </div>
        </Card>

        {/* Average Resolution Time */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Ort. Çözüm Süresi</p>
              <p className="text-2xl font-bold">
                {formatNumber(metrics.overall.averageResolutionTimeMinutes, 1)}
                dk
              </p>
              <div className="mt-1 flex items-center gap-1">
                {metrics.comparison.resolutionTimeVsAverage < 0 ? (
                  <>
                    <TrendingDown className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">
                      {formatPercentage(
                        Math.abs(metrics.comparison.resolutionTimeVsAverage)
                      )}{' '}
                      daha hızlı
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-3 w-3 text-orange-600" />
                    <span className="text-xs text-orange-600">
                      {formatPercentage(
                        metrics.comparison.resolutionTimeVsAverage
                      )}{' '}
                      daha yavaş
                    </span>
                  </>
                )}
              </div>
            </div>
            <Clock className="h-8 w-8 text-orange-500 opacity-75" />
          </div>
        </Card>

        {/* Accuracy Rate */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Doğruluk Oranı</p>
              <p className="text-2xl font-bold">
                {formatPercentage(metrics.overall.accuracyRate)}
              </p>
              <div className="mt-1 flex items-center gap-1">
                {metrics.comparison.accuracyRateVsAverage >= 0 ? (
                  <>
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-green-600">
                      {formatPercentage(
                        metrics.comparison.accuracyRateVsAverage,
                        true
                      )}{' '}
                      ortalamadan
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3 w-3 text-orange-600" />
                    <span className="text-xs text-orange-600">
                      {formatPercentage(
                        metrics.comparison.accuracyRateVsAverage,
                        true
                      )}{' '}
                      ortalamadan
                    </span>
                  </>
                )}
              </div>
            </div>
            <Target className="h-8 w-8 text-green-500 opacity-75" />
          </div>
        </Card>

        {/* Rank */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Sıralama</p>
              <p className="text-2xl font-bold">
                #{metrics.comparison.rank} /{' '}
                {metrics.comparison.totalModerators}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {formatPercentage(metrics.comparison.percentile)} percentile
              </p>
            </div>
            <Award className="h-8 w-8 text-purple-500 opacity-75" />
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Resolution Time Trend */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Çözüm Süresi Trendi</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={resolutionTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded border bg-white p-3 shadow-lg">
                        <p className="text-sm font-semibold">
                          {payload[0].payload.date}
                        </p>
                        <p className="text-sm text-blue-600">
                          Ort. Süre:{' '}
                          {formatNumber(payload[0].value as number, 1)} dakika
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {payload[0].payload.count} işlem
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="Ort. Süre (dk)"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Accuracy Trend */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Doğruluk Oranı Trendi</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={accuracyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[90, 100]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded border bg-white p-3 shadow-lg">
                        <p className="text-sm font-semibold">
                          {payload[0].payload.date}
                        </p>
                        <p className="text-sm text-green-600">
                          Doğruluk:{' '}
                          {formatPercentage(payload[0].value as number)}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {payload[0].payload.count} işlem
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="Doğruluk (%)"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Category Breakdown - Actions */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">
            Kategori Bazında İşlemler
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="actions" fill="#3b82f6" name="Toplam İşlem" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Category Breakdown - Metrics */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Kategori Performansı</h3>
          <div className="space-y-4">
            {categoryData.map((category) => (
              <div
                key={category.name}
                className="border-b pb-3 last:border-b-0"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">{category.name}</span>
                  <span className="text-muted-foreground text-sm">
                    {formatNumber(category.actions)} işlem
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Ort. Süre:</span>
                    <span className="ml-2 font-medium">
                      {formatNumber(category.avgTime, 1)}dk
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Doğruluk:</span>
                    <span className="ml-2 font-medium">
                      {formatPercentage(category.accuracy)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Comparative Metrics */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold">
          Karşılaştırmalı Performans
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-blue-50 p-4 text-center">
            <p className="text-muted-foreground mb-1 text-sm">Çözüm Süresi</p>
            <p className="text-2xl font-bold">
              {formatPercentage(
                metrics.comparison.resolutionTimeVsAverage,
                true
              )}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              takım ortalamasına göre
            </p>
          </div>
          <div className="rounded-lg bg-green-50 p-4 text-center">
            <p className="text-muted-foreground mb-1 text-sm">Doğruluk Oranı</p>
            <p className="text-2xl font-bold">
              {formatPercentage(metrics.comparison.accuracyRateVsAverage, true)}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              takım ortalamasına göre
            </p>
          </div>
          <div className="rounded-lg bg-purple-50 p-4 text-center">
            <p className="text-muted-foreground mb-1 text-sm">Günlük İşlem</p>
            <p className="text-2xl font-bold">
              {formatPercentage(
                metrics.comparison.actionsPerDayVsAverage,
                true
              )}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              takım ortalamasına göre
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
