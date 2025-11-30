/**
 * ================================================
 * ADMIN REVENUE ANALYTICS PAGE
 * ================================================
 * Comprehensive revenue analytics dashboard for administrators
 *
 * Route: /admin/analytics/revenue
 * Access: Admin only
 *
 * Features:
 * - Revenue breakdown by period
 * - Payment method distribution
 * - Growth metrics and trends
 * - Health indicators
 * - Interactive charts
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 3 - Task 3.1
 */

'use client';

import { useState } from 'react';
import logger from '@/lib/infrastructure/monitoring/logger';
import { Card } from '@/components/ui';
import { Calendar, Download, RefreshCw } from 'lucide-react';
import { useRevenueAnalytics } from '@/hooks';
import type { PeriodType } from '@/hooks/business/admin/useRevenueAnalytics';
import {
  RevenueBreakdownWidget,
  RevenueChart,
} from '@/components/domains/admin/dashboard/widgets';
import { toast } from 'sonner';

/**
 * Admin Revenue Analytics Page
 */
export default function AdminRevenueAnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('today');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { data, isLoading, error, refresh, loadPeriod } = useRevenueAnalytics({
    period: selectedPeriod,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  // Handle period change
  const handlePeriodChange = async (period: PeriodType) => {
    setSelectedPeriod(period);
    setShowDatePicker(period === 'custom');
    await loadPeriod(period);
  };

  // Handle custom date range
  const handleDateRangeSubmit = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      toast.error('Lütfen başlangıç ve bitiş tarihlerini seçin');
      return;
    }

    if (new Date(dateRange.startDate) > new Date(dateRange.endDate)) {
      toast.error('Başlangıç tarihi bitiş tarihinden sonra olamaz');
      return;
    }

    await loadPeriod('custom', dateRange.startDate, dateRange.endDate);
    setShowDatePicker(false);
  };

  // Handle export
  const handleExport = async () => {
    try {
      toast.info('CSV raporu hazırlanıyor...');

      // Use existing backend CSV export endpoint
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]; // 30 days ago
      const endDate = new Date().toISOString().split('T')[0]; // Today

      // Create download link
      const downloadUrl = `/api/v1/admin/analytics/revenue/export/csv?startDate=${startDate}&endDate=${endDate}`;

      // Trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `revenue_${startDate}_${endDate}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('CSV raporu başarıyla indirildi');
    } catch (err) {
      logger.error(
        'Failed to export revenue analytics report',
        err instanceof Error ? err : new Error(String(err)),
        { component: 'AdminRevenueAnalyticsPage', action: 'handleExport' }
      );
      toast.error('Rapor indirme başarısız');
    }
  };

  // Generate mock chart data from breakdown
  const chartData = data
    ? [
        {
          date: 'Bugün',
          grossRevenue: data.summary.grossRevenue,
          netRevenue: data.summary.netRevenue,
          platformFee: data.summary.platformFee,
          orderCount: data.transactions.orderCount,
        },
      ]
    : [];

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gelir Analitiği</h1>
          <p className="text-muted-foreground mt-1">
            Platform gelir metrikleri ve performans göstergeleri
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refresh()}
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

      {/* Period Selector */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
            <Calendar className="h-4 w-4" />
            <span>Dönem:</span>
          </div>

          {(['today', 'week', 'month', 'custom'] as PeriodType[]).map(
            (period) => (
              <button
                key={period}
                onClick={() => handlePeriodChange(period)}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period === 'today' && 'Bugün'}
                {period === 'week' && 'Bu Hafta'}
                {period === 'month' && 'Bu Ay'}
                {period === 'custom' && 'Özel Tarih'}
              </button>
            )
          )}
        </div>

        {/* Custom Date Picker */}
        {showDatePicker && (
          <div className="mt-4 border-t pt-4">
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Başlangıç Tarihi
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, startDate: e.target.value })
                  }
                  className="rounded-md border px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Bitiş Tarihi
                </label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, endDate: e.target.value })
                  }
                  className="rounded-md border px-3 py-2"
                />
              </div>
              <button
                onClick={handleDateRangeSubmit}
                disabled={!dateRange.startDate || !dateRange.endDate}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                Uygula
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-2 text-red-600">
            <span className="font-medium">Hata:</span>
            <span>{error}</span>
          </div>
        </Card>
      )}

      {/* Revenue Breakdown */}
      {data && <RevenueBreakdownWidget data={data} isLoading={isLoading} />}

      {/* Revenue Chart */}
      {chartData.length > 0 && (
        <RevenueChart data={chartData} isLoading={isLoading} />
      )}

      {/* Loading State */}
      {isLoading && !data && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <RefreshCw className="text-primary mb-4 h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">Veriler yükleniyor...</p>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !data && !error && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Calendar className="text-muted-foreground mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">Veri Bulunamadı</h3>
            <p className="text-muted-foreground">
              Seçili dönem için gelir verisi bulunmuyor
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
