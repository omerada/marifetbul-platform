'use client';

/**
 * ================================================
 * MODERATOR PERFORMANCE CHARTS COMPONENT
 * ================================================
 * Performance analytics visualization with interactive charts
 *
 * Features:
 * - Overall metrics cards
 * - Resolution time trend (line chart)
 * - Accuracy rate trend (line chart)
 * - Category breakdown (bar chart)
 * - Comparative metrics (comparison cards)
 * - Date range selector
 * - Responsive design
 * - Error handling with retry
 * - Enhanced loading states
 *
 * Sprint 2 - Task 2.5: Interactive Charts
 * Sprint 3 - Task 3.1: Performance Optimization
 * Sprint 3 - Task 3.2: Error Handling & User Feedback
 *
 * @author MarifetBul Development Team
 * @version 4.0.0
 * @updated November 4, 2025
 *
 * Changes (v4.0.0 - Sprint 3 Task 3.2):
 * - Added comprehensive error handling with retry
 * - Enhanced loading skeleton with header
 * - Improved error UI with detailed messages
 * - Added empty state handling
 *
 * Previous Changes (v3.0.0):
 * - Added React.memo for component memoization
 * - Memoized chart data transformations with useMemo
 * - Optimized date range selection with useCallback
 * - Added display name for debugging
 */

'use client';

import { useState, useMemo, useCallback, memo } from 'react';
import { useModeratorPerformance } from '@/hooks/business/moderation/useModeratorPerformance';
import type { DailyMetric } from '@/hooks/business/moderation/useModeratorPerformance';
import { Card } from '@/components/ui/Card';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import {
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Award,
  Clock,
  Target,
  Activity,
  Calendar,
  RefreshCw,
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
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

type DateRange = 7 | 30 | 90;

export interface ModeratorPerformanceChartsProps {
  /**
   * Initial date range in days (default: 30)
   */
  initialDays?: DateRange;
}

// ============================================================================
// MAIN COMPONENT (Memoized with optimizations)
// ============================================================================

export const ModeratorPerformanceCharts = memo(
  function ModeratorPerformanceCharts({
    initialDays = 30,
  }: ModeratorPerformanceChartsProps) {
    const [selectedRange, setSelectedRange] = useState<DateRange>(initialDays);
    const { metrics, isLoading, error } = useModeratorPerformance({
      days: selectedRange,
    });

    // Date range options (static, no need to memoize)
    const dateRangeOptions: Array<{ value: DateRange; label: string }> = [
      { value: 7, label: 'Son 7 Gün' },
      { value: 30, label: 'Son 30 Gün' },
      { value: 90, label: 'Son 90 Gün' },
    ];

    // Memoized date range change handler
    const handleRangeChange = useCallback((range: DateRange) => {
      setSelectedRange(range);
    }, []);

    // Memoized helper functions
    const formatDate = useCallback((dateStr: string) => {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('tr-TR', {
        month: 'short',
        day: 'numeric',
      }).format(date);
    }, []);

    const formatNumber = useCallback((num: number, decimals: number = 0) => {
      return new Intl.NumberFormat('tr-TR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(num);
    }, []);

    const formatPercentage = useCallback(
      (num: number, includeSign: boolean = false) => {
        const sign = includeSign && num > 0 ? '+' : '';
        return `${sign}${formatNumber(num, 1)}%`;
      },
      [formatNumber]
    );

    // Memoize chart data transformations
    const resolutionTimeData = useMemo(() => {
      if (!metrics) return [];
      return metrics.resolutionTimeTrend.map((d: DailyMetric) => ({
        date: formatDate(d.date),
        'Ort. Süre (dk)': d.value,
        count: d.count,
      }));
    }, [metrics, formatDate]);

    const accuracyData = useMemo(() => {
      if (!metrics) return [];
      return metrics.accuracyTrend.map((d: DailyMetric) => ({
        date: formatDate(d.date),
        'Doğruluk (%)': d.value,
        count: d.count,
      }));
    }, [metrics, formatDate]);

    const categoryData = useMemo(() => {
      if (!metrics) return [];
      return [
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
    }, [metrics]);

    // Note: comparisonData prepared but not used - kept for potential future use
    // Currently using metrics.comparison directly for simplicity

    // ============================================================================
    // LOADING STATE (Enhanced)
    // ============================================================================

    if (isLoading) {
      return (
        <div
          className="animate-pulse space-y-6"
          role="status"
          aria-live="polite"
          aria-label="Performans verileri yükleniyor"
        >
          {/* Header Skeleton */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="h-7 w-48 rounded bg-gray-200" />
              <div className="h-4 w-64 rounded bg-gray-200" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded bg-gray-200" />
              <div className="flex gap-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-9 w-24 rounded bg-gray-200" />
                ))}
              </div>
            </div>
          </div>
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
          <span className="sr-only">Performans verileri yükleniyor...</span>
        </div>
      );
    }

    // ============================================================================
    // ERROR STATE (Enhanced with Retry)
    // ============================================================================

    if (error) {
      return (
        <Card
          className="border-red-200 bg-red-50 p-8"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex flex-col items-center text-center">
            <div
              className="mb-4 rounded-full bg-red-100 p-3"
              aria-hidden="true"
            >
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-red-900">
              Performans Verileri Yüklenemedi
            </h3>
            <p className="text-muted-foreground mb-4 max-w-md text-sm">
              Performans metrikleriniz yüklenirken bir hata oluştu. Lütfen daha
              sonra tekrar deneyin.
            </p>
            {error.message && (
              <details className="text-muted-foreground mb-4 text-xs">
                <summary className="cursor-pointer font-medium">
                  Hata Detayları
                </summary>
                <p className="mt-2 rounded bg-red-100 p-2 font-mono">
                  {error.message}
                </p>
              </details>
            )}
            <div className="flex gap-3">
              <UnifiedButton
                onClick={() => handleRangeChange(selectedRange)}
                variant="primary"
                size="md"
                className="bg-red-600 hover:bg-red-700"
                aria-label="Performans verilerini yeniden yükle"
              >
                <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                Tekrar Dene
              </UnifiedButton>
              <UnifiedButton
                onClick={() => handleRangeChange(30)}
                variant="outline"
                size="md"
                aria-label="30 günlük varsayılan görünüme dön"
              >
                Varsayılana Dön
              </UnifiedButton>
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
        <Card className="p-12" role="status">
          <div className="text-muted-foreground flex flex-col items-center text-center">
            <div
              className="mb-4 rounded-full bg-gray-100 p-4"
              aria-hidden="true"
            >
              <Activity className="h-12 w-12 text-gray-400" />
            </div>
            <h4 className="mb-2 text-base font-semibold text-gray-900">
              Performans Verisi Bulunamadı
            </h4>
            <p className="text-sm">
              Seçili dönem için performans verisi bulunmuyor
            </p>
          </div>
        </Card>
      );
    }

    // ============================================================================
    // RENDER
    // ============================================================================

    return (
      <div
        className="space-y-6"
        role="region"
        aria-labelledby="performance-heading"
      >
        {/* Header with Date Range Selector */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2
              id="performance-heading"
              className="text-xl font-semibold text-gray-900"
            >
              Performans Analizi
            </h2>
            <p className="text-sm text-gray-600">
              Moderasyon performansınızı inceleyin
            </p>
          </div>
          <div
            className="flex items-center gap-2"
            role="group"
            aria-label="Tarih aralığı seçimi"
          >
            <Calendar className="h-5 w-5 text-gray-500" aria-hidden="true" />
            <div className="flex gap-1">
              {dateRangeOptions.map((option) => (
                <UnifiedButton
                  key={option.value}
                  variant={
                    selectedRange === option.value ? 'primary' : 'outline'
                  }
                  size="sm"
                  onClick={() => handleRangeChange(option.value)}
                  className={cn(
                    'transition-all',
                    selectedRange === option.value &&
                      'ring-2 ring-blue-500 ring-offset-2'
                  )}
                  aria-pressed={selectedRange === option.value}
                  aria-label={`${option.label} görünümü${selectedRange === option.value ? ' (seçili)' : ''}`}
                >
                  {option.label}
                </UnifiedButton>
              ))}
            </div>
          </div>
        </div>

        {/* Overall Metrics Cards */}
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          role="list"
          aria-label="Genel performans metrikleri"
        >
          {/* Total Actions */}
          <Card
            className="p-4"
            role="article"
            aria-labelledby="total-actions-label"
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  id="total-actions-label"
                  className="text-muted-foreground text-sm"
                >
                  Toplam İşlem
                </p>
                <p
                  className="text-2xl font-bold"
                  aria-describedby="total-actions-label"
                >
                  {formatNumber(metrics.overall.totalActions)}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Son 30 gün: {formatNumber(metrics.overall.actionsLast30Days)}
                </p>
              </div>
              <Activity
                className="h-8 w-8 text-blue-500 opacity-75"
                aria-hidden="true"
              />
            </div>
          </Card>

          {/* Average Resolution Time */}
          <Card
            className="p-4"
            role="article"
            aria-labelledby="resolution-time-label"
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  id="resolution-time-label"
                  className="text-muted-foreground text-sm"
                >
                  Ort. Çözüm Süresi
                </p>
                <p
                  className="text-2xl font-bold"
                  aria-describedby="resolution-time-label"
                >
                  {formatNumber(
                    metrics.overall.averageResolutionTimeMinutes,
                    1
                  )}
                  dk
                </p>
                <div className="mt-1 flex items-center gap-1" role="status">
                  {metrics.comparison.resolutionTimeVsAverage < 0 ? (
                    <>
                      <TrendingDown
                        className="h-3 w-3 text-green-600"
                        aria-hidden="true"
                      />
                      <span className="text-xs text-green-600">
                        {formatPercentage(
                          Math.abs(metrics.comparison.resolutionTimeVsAverage)
                        )}{' '}
                        daha hızlı
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingUp
                        className="h-3 w-3 text-orange-600"
                        aria-hidden="true"
                      />
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
              <Clock
                className="h-8 w-8 text-orange-500 opacity-75"
                aria-hidden="true"
              />
            </div>
          </Card>

          {/* Accuracy Rate */}
          <Card className="p-4" role="article" aria-labelledby="accuracy-label">
            <div className="flex items-center justify-between">
              <div>
                <p
                  id="accuracy-label"
                  className="text-muted-foreground text-sm"
                >
                  Doğruluk Oranı
                </p>
                <p
                  className="text-2xl font-bold"
                  aria-describedby="accuracy-label"
                >
                  {formatPercentage(metrics.overall.accuracyRate)}
                </p>
                <div className="mt-1 flex items-center gap-1" role="status">
                  {metrics.comparison.accuracyRateVsAverage >= 0 ? (
                    <>
                      <TrendingUp
                        className="h-3 w-3 text-green-600"
                        aria-hidden="true"
                      />
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
                      <TrendingDown
                        className="h-3 w-3 text-orange-600"
                        aria-hidden="true"
                      />
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
              <Target
                className="h-8 w-8 text-green-500 opacity-75"
                aria-hidden="true"
              />
            </div>
          </Card>

          {/* Rank */}
          <Card className="p-4" role="article" aria-labelledby="rank-label">
            <div className="flex items-center justify-between">
              <div>
                <p id="rank-label" className="text-muted-foreground text-sm">
                  Sıralama
                </p>
                <p className="text-2xl font-bold" aria-describedby="rank-label">
                  #{metrics.comparison.rank} /{' '}
                  {metrics.comparison.totalModerators}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {formatPercentage(metrics.comparison.percentile)} percentile
                </p>
              </div>
              <Award
                className="h-8 w-8 text-purple-500 opacity-75"
                aria-hidden="true"
              />
            </div>
          </Card>
        </div>

        {/* Charts Grid */}
        <div
          className="grid grid-cols-1 gap-4 lg:gap-6 xl:grid-cols-2"
          role="list"
          aria-label="Performans grafikleri"
        >
          {/* Resolution Time Trend */}
          <Card
            className="p-4 sm:p-6"
            role="article"
            aria-labelledby="resolution-trend-heading"
          >
            <h3
              id="resolution-trend-heading"
              className="mb-4 text-base font-semibold sm:text-lg"
            >
              Çözüm Süresi Trendi
            </h3>
            <div
              className="h-[250px] sm:h-[300px]"
              role="img"
              aria-label="Çözüm süresi trend grafiği"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={resolutionTimeData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div
                            className="rounded border bg-white p-3 shadow-lg"
                            role="tooltip"
                          >
                            <p className="text-sm font-semibold">
                              {payload[0].payload.date}
                            </p>
                            <p className="text-sm text-blue-600">
                              Ort. Süre:{' '}
                              {formatNumber(payload[0].value as number, 1)}{' '}
                              dakika
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
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
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
            </div>
          </Card>

          {/* Accuracy Trend */}
          <Card
            className="p-4 sm:p-6"
            role="article"
            aria-labelledby="accuracy-trend-heading"
          >
            <h3
              id="accuracy-trend-heading"
              className="mb-4 text-base font-semibold sm:text-lg"
            >
              Doğruluk Oranı Trendi
            </h3>
            <div
              className="h-[250px] sm:h-[300px]"
              role="img"
              aria-label="Doğruluk oranı trend grafiği"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={accuracyData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis domain={[90, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div
                            className="rounded border bg-white p-3 shadow-lg"
                            role="tooltip"
                          >
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
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
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
            </div>
          </Card>

          {/* Category Breakdown - Actions */}
          <Card
            className="p-4 sm:p-6"
            role="article"
            aria-labelledby="category-actions-heading"
          >
            <h3
              id="category-actions-heading"
              className="mb-4 text-base font-semibold sm:text-lg"
            >
              Kategori Bazında İşlemler
            </h3>
            <div
              className="h-[250px] sm:h-[300px]"
              role="img"
              aria-label="Kategori bazında işlem grafiği"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    angle={-15}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="actions" fill="#3b82f6" name="Toplam İşlem" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Response Time by Type */}
          <Card
            className="p-4 sm:p-6"
            role="article"
            aria-labelledby="category-performance-heading"
          >
            <h3
              id="category-performance-heading"
              className="mb-4 text-base font-semibold sm:text-lg"
            >
              Kategori Performansı
            </h3>
            <div
              className="space-y-3 sm:space-y-4"
              role="list"
              aria-label="Kategori performans detayları"
            >
              {categoryData.map((category) => (
                <div
                  key={category.name}
                  className="border-b pb-2 last:border-b-0 sm:pb-3"
                  role="listitem"
                >
                  <div className="mb-1.5 flex items-center justify-between sm:mb-2">
                    <span className="text-sm font-medium sm:text-base">
                      {category.name}
                    </span>
                    <span className="text-muted-foreground text-xs sm:text-sm">
                      {formatNumber(category.actions)} işlem
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs sm:gap-4 sm:text-sm">
                    <div>
                      <span className="text-muted-foreground">Ort. Süre:</span>
                      <span className="ml-1.5 font-medium sm:ml-2">
                        {formatNumber(category.avgTime, 1)}dk
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Doğruluk:</span>
                      <span className="ml-1.5 font-medium sm:ml-2">
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
        <Card
          className="p-4 sm:p-6"
          role="complementary"
          aria-labelledby="comparison-heading"
        >
          <h3
            id="comparison-heading"
            className="mb-3 text-base font-semibold sm:mb-4 sm:text-lg"
          >
            Karşılaştırmalı Performans
          </h3>
          <div
            className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3"
            role="list"
            aria-label="Takım karşılaştırma metrikleri"
          >
            <div
              className="rounded-lg bg-blue-50 p-3 text-center sm:p-4"
              role="listitem"
            >
              <p className="text-muted-foreground mb-1 text-xs sm:text-sm">
                Çözüm Süresi
              </p>
              <p
                className="text-xl font-bold sm:text-2xl"
                aria-label={`Çözüm süresi ${formatPercentage(metrics.comparison.resolutionTimeVsAverage, true)} takım ortalamasına göre`}
              >
                {formatPercentage(
                  metrics.comparison.resolutionTimeVsAverage,
                  true
                )}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                takım ortalamasına göre
              </p>
            </div>
            <div
              className="rounded-lg bg-green-50 p-3 text-center sm:p-4"
              role="listitem"
            >
              <p className="text-muted-foreground mb-1 text-xs sm:text-sm">
                Doğruluk Oranı
              </p>
              <p
                className="text-xl font-bold sm:text-2xl"
                aria-label={`Doğruluk oranı ${formatPercentage(metrics.comparison.accuracyRateVsAverage, true)} takım ortalamasına göre`}
              >
                {formatPercentage(
                  metrics.comparison.accuracyRateVsAverage,
                  true
                )}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                takım ortalamasına göre
              </p>
            </div>
            <div
              className="rounded-lg bg-purple-50 p-3 text-center sm:p-4"
              role="listitem"
            >
              <p className="text-muted-foreground mb-1 text-xs sm:text-sm">
                Günlük İşlem
              </p>
              <p
                className="text-xl font-bold sm:text-2xl"
                aria-label={`Günlük işlem ${formatPercentage(metrics.comparison.actionsPerDayVsAverage, true)} takım ortalamasına göre`}
              >
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
);

// Display name for debugging
ModeratorPerformanceCharts.displayName = 'ModeratorPerformanceCharts';
