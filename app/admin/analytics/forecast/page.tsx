/**
 * ================================================
 * ADMIN REVENUE COMPARISON & FORECAST PAGE
 * ================================================
 * Revenue comparison and forecasting dashboard
 *
 * Route: /admin/analytics/forecast
 * Access: Admin only
 *
 * Features:
 * - Period comparison (day, week, month, custom)
 * - Revenue forecasting
 * - Trend analysis
 * - Performance indicators
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 3 - Task 3.3
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { RefreshCw, Download, TrendingUp, Target } from 'lucide-react';
import {
  useRevenueComparison,
  useRevenueForecast,
  type ComparisonType,
  type ForecastPeriod,
} from '@/hooks';
import {
  RevenueComparisonChart,
  RevenueForecastWidget,
} from '@/components/domains/admin/dashboard/widgets';
import { toast } from 'sonner';
import {
  exportToCSV,
  formatDateForExport,
  formatCurrencyForExport,
} from '@/lib/utils/export';

/**
 * Admin Revenue Comparison & Forecast Page
 */
export default function AdminRevenueComparisonForecastPage() {
  const [comparisonType, setComparisonType] = useState<ComparisonType>('day');
  const [forecastPeriod, setForecastPeriod] = useState<ForecastPeriod>('week');
  const [activeTab, setActiveTab] = useState<'comparison' | 'forecast'>(
    'comparison'
  );

  // Comparison hook
  const {
    data: comparisonData,
    isLoading: isComparisonLoading,
    error: comparisonError,
    refresh: refreshComparison,
    loadComparison,
  } = useRevenueComparison({
    comparisonType,
    autoLoad: true,
  });

  // Forecast hook
  const {
    data: forecastData,
    isLoading: isForecastLoading,
    error: forecastError,
    refresh: refreshForecast,
    loadForecast,
  } = useRevenueForecast({
    period: forecastPeriod,
    autoLoad: true,
  });

  // Handle comparison type change
  const handleComparisonChange = async (type: ComparisonType) => {
    setComparisonType(type);
    await loadComparison(type);
  };

  // Handle forecast period change
  const handleForecastChange = async (period: ForecastPeriod) => {
    setForecastPeriod(period);
    await loadForecast(period);
  };

  // Handle refresh
  const handleRefresh = async () => {
    if (activeTab === 'comparison') {
      await refreshComparison();
    } else {
      await refreshForecast();
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      toast.info('Rapor hazırlanıyor...');

      if (activeTab === 'comparison' && comparisonData) {
        // Export comparison data
        const exportData = [
          {
            'Karşılaştırma Tipi': comparisonData.comparisonType,
            'Mevcut Dönem Başlangıç': comparisonData.currentPeriod.startDate,
            'Mevcut Dönem Bitiş': comparisonData.currentPeriod.endDate,
            'Mevcut Dönem Gelir': formatCurrencyForExport(
              comparisonData.currentPeriod.revenue
            ),
            'Mevcut Dönem Sipariş': comparisonData.currentPeriod.orders,
            'Mevcut Ort. Sipariş Değeri': formatCurrencyForExport(
              comparisonData.currentPeriod.averageOrderValue
            ),
            'Önceki Dönem Başlangıç': comparisonData.previousPeriod.startDate,
            'Önceki Dönem Bitiş': comparisonData.previousPeriod.endDate,
            'Önceki Dönem Gelir': formatCurrencyForExport(
              comparisonData.previousPeriod.revenue
            ),
            'Önceki Dönem Sipariş': comparisonData.previousPeriod.orders,
            'Önceki Ort. Sipariş Değeri': formatCurrencyForExport(
              comparisonData.previousPeriod.averageOrderValue
            ),
            'Gelir Değişimi': formatCurrencyForExport(
              comparisonData.comparison.revenueChange
            ),
            'Gelir Değişim Yüzdesi':
              comparisonData.comparison.revenueChangePercentage.toFixed(2) +
              '%',
            'Sipariş Değişimi': comparisonData.comparison.ordersChange,
            'Sipariş Değişim Yüzdesi':
              comparisonData.comparison.ordersChangePercentage.toFixed(2) + '%',
            Trend: comparisonData.performance.trend,
            'Önem Seviyesi': comparisonData.performance.significance,
            'Rapor Tarihi': formatDateForExport(new Date()),
          },
        ];

        exportToCSV(
          exportData,
          `gelir-karsilastirma-${comparisonType}-${new Date().toISOString().split('T')[0]}.csv`
        );
      } else if (activeTab === 'forecast' && forecastData) {
        // Export forecast data
        const exportData = [
          {
            'Tahmin Periyodu': forecastData.forecastPeriod,
            'Başlangıç Tarihi': forecastData.startDate,
            'Bitiş Tarihi': forecastData.endDate,
            'Temel Alınan Gün Sayısı': forecastData.basedOnDays,
            'Tahmin Edilen Gelir': formatCurrencyForExport(
              forecastData.predicted.revenue
            ),
            'Tahmin Edilen Sipariş': forecastData.predicted.orderCount,
            'Tahmin Ort. Sipariş Değeri': formatCurrencyForExport(
              forecastData.predicted.averageOrderValue
            ),
            'Alt Güven Sınırı': formatCurrencyForExport(
              forecastData.confidence.lower
            ),
            'Üst Güven Sınırı': formatCurrencyForExport(
              forecastData.confidence.upper
            ),
            'Güven Seviyesi': forecastData.confidence.level.toFixed(2) + '%',
            'Trend Yönü': forecastData.trend.direction,
            'Trend Gücü': forecastData.trend.strength.toFixed(2),
            Güvenilirlik: forecastData.trend.reliability.toFixed(2),
            'Geçmiş Ort. Günlük Gelir': formatCurrencyForExport(
              forecastData.historicalAverage.dailyRevenue
            ),
            'Geçmiş Ort. Günlük Sipariş':
              forecastData.historicalAverage.dailyOrders,
            'Rapor Tarihi': formatDateForExport(new Date()),
          },
        ];

        exportToCSV(
          exportData,
          `gelir-tahmin-${forecastPeriod}-${new Date().toISOString().split('T')[0]}.csv`
        );
      }

      toast.success('Rapor başarıyla indirildi');
    } catch (_err) {
      toast.error('Rapor indirme başarısız');
    }
  };

  const isLoading =
    activeTab === 'comparison' ? isComparisonLoading : isForecastLoading;
  const error = activeTab === 'comparison' ? comparisonError : forecastError;

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gelir Karşılaştırma & Tahmin</h1>
          <p className="text-muted-foreground mt-1">
            Dönemsel karşılaştırma ve gelecek tahminleri
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-md border bg-white px-4 py-2 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            Yenile
          </button>
          <button
            onClick={handleExport}
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-md px-4 py-2 transition-colors"
          >
            <Download className="h-4 w-4" />
            Dışa Aktar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('comparison')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 font-medium transition-colors ${
            activeTab === 'comparison'
              ? 'border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground border-transparent'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          Dönem Karşılaştırması
        </button>
        <button
          onClick={() => setActiveTab('forecast')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 font-medium transition-colors ${
            activeTab === 'forecast'
              ? 'border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground border-transparent'
          }`}
        >
          <Target className="h-4 w-4" />
          Gelir Tahmini
        </button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-2 text-red-600">
            <span className="font-medium">Hata:</span>
            <span>{error}</span>
          </div>
        </Card>
      )}

      {/* Comparison Tab */}
      {activeTab === 'comparison' && (
        <div className="space-y-6">
          {/* Period Selector */}
          <Card className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-muted-foreground text-sm font-medium">
                Karşılaştırma Türü:
              </p>
              {(['day', 'week', 'month', 'custom'] as ComparisonType[]).map(
                (type) => (
                  <button
                    key={type}
                    onClick={() => handleComparisonChange(type)}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                      comparisonType === type
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type === 'day' && 'Gün / Gün'}
                    {type === 'week' && 'Hafta / Hafta'}
                    {type === 'month' && 'Ay / Ay'}
                    {type === 'custom' && 'Özel'}
                  </button>
                )
              )}
            </div>
          </Card>

          {/* Comparison Chart */}
          {comparisonData && (
            <RevenueComparisonChart
              data={comparisonData}
              isLoading={isComparisonLoading}
            />
          )}

          {/* Loading State */}
          {isComparisonLoading && !comparisonData && (
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <RefreshCw className="text-primary mb-4 h-8 w-8 animate-spin" />
                <p className="text-muted-foreground">
                  Karşılaştırma verileri yükleniyor...
                </p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Forecast Tab */}
      {activeTab === 'forecast' && (
        <div className="space-y-6">
          {/* Period Selector */}
          <Card className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-muted-foreground text-sm font-medium">
                Tahmin Dönemi:
              </p>
              {(['week', 'month', 'custom'] as ForecastPeriod[]).map(
                (period) => (
                  <button
                    key={period}
                    onClick={() => handleForecastChange(period)}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                      forecastPeriod === period
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {period === 'week' && 'Gelecek Hafta'}
                    {period === 'month' && 'Gelecek Ay'}
                    {period === 'custom' && 'Özel'}
                  </button>
                )
              )}
            </div>
          </Card>

          {/* Forecast Widget */}
          {forecastData && (
            <RevenueForecastWidget
              data={forecastData}
              isLoading={isForecastLoading}
            />
          )}

          {/* Loading State */}
          {isForecastLoading && !forecastData && (
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <RefreshCw className="text-primary mb-4 h-8 w-8 animate-spin" />
                <p className="text-muted-foreground">
                  Tahmin verileri yükleniyor...
                </p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && !comparisonData && !forecastData && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <TrendingUp className="text-muted-foreground mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">Veri Bulunamadı</h3>
            <p className="text-muted-foreground">
              {activeTab === 'comparison'
                ? 'Karşılaştırma verileri yüklenemedi'
                : 'Tahmin verileri yüklenemedi'}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
