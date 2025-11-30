/**
 * ================================================
 * ADMIN REFUND ANALYTICS PAGE
 * ================================================
 * Comprehensive refund analytics and statistics dashboard
 *
 * Route: /admin/analytics/refunds
 * Access: Admin only
 *
 * Features:
 * - Refund statistics overview
 * - Status distribution charts
 * - Approval and success rate metrics
 * - Period-based filtering
 * - Processing time analysis
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 3 - Task 3.4
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';
import { RefreshCw, Download, Receipt } from 'lucide-react';
import {
  useRefundAnalytics,
  type RefundPeriod,
} from '@/hooks/business/admin/useRefundAnalytics';
import {
  RefundStatisticsWidget,
  RefundTrendChart,
} from '@/components/domains/admin/dashboard/widgets';
import { toast } from 'sonner';
import { exportToCSV, formatCurrencyForExport } from '@/lib/utils/export';
import { formatCurrency } from '@/lib/shared/formatters';

/**
 * Admin Refund Analytics Page
 */
export default function AdminRefundAnalyticsPage() {
  const [period, setPeriod] = useState<RefundPeriod>('today');

  const {
    data: analyticsData,
    isLoading,
    error,
    refresh,
    loadPeriod,
  } = useRefundAnalytics({
    period,
    autoLoad: true,
  });

  // Handle period change
  const handlePeriodChange = async (newPeriod: RefundPeriod) => {
    setPeriod(newPeriod);
    await loadPeriod(newPeriod);
  };

  // Handle export
  const handleExport = async () => {
    try {
      toast.info('İade raporu hazırlanıyor...');

      if (analyticsData) {
        const exportData = [
          {
            Periyod:
              period === 'today'
                ? 'Bugün'
                : period === 'week'
                  ? 'Bu Hafta'
                  : period === 'month'
                    ? 'Bu Ay'
                    : 'Özel',
            'Toplam İade Sayısı': analyticsData.totalRefunds,
            'Toplam İade Tutarı': formatCurrencyForExport(
              analyticsData.totalAmount
            ),
            'Bekleyen Sayı': analyticsData.pendingCount,
            'Bekleyen Tutar': formatCurrencyForExport(
              analyticsData.pendingAmount
            ),
            'Onaylanan Sayı': analyticsData.approvedCount,
            'Onaylanan Tutar': formatCurrencyForExport(
              analyticsData.approvedAmount
            ),
            'Reddedilen Sayı': analyticsData.rejectedCount,
            'Tamamlanan Sayı': analyticsData.completedCount,
            'Tamamlanan Tutar': formatCurrencyForExport(
              analyticsData.completedAmount
            ),
            'Başarısız Sayı': analyticsData.failedCount,
            'Ort. İşlem Süresi (Saat)':
              analyticsData.averageProcessingTimeHours.toFixed(2),
            'Onay Oranı': analyticsData.approvalRate.toFixed(2) + '%',
            'Başarı Oranı': analyticsData.successRate.toFixed(2) + '%',
            'Rapor Tarihi': new Date().toLocaleString('tr-TR'),
          },
        ];

        exportToCSV(
          exportData,
          `iade-analitikleri-${period}-${new Date().toISOString().split('T')[0]}.csv`
        );

        toast.success('Rapor başarıyla indirildi');
      }
    } catch (_err) {
      toast.error('Rapor indirme başarısız');
    }
  };

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gradient-to-br from-orange-500 to-red-600 p-3">
            <Receipt className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">İade Analitikleri</h1>
            <p className="text-muted-foreground mt-1">
              İade talepleri ve işlem istatistikleri
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
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
          <p className="text-muted-foreground text-sm font-medium">Dönem:</p>
          {(['today', 'week', 'month', 'custom'] as RefundPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p === 'today' && 'Bugün'}
              {p === 'week' && 'Bu Hafta'}
              {p === 'month' && 'Bu Ay'}
              {p === 'custom' && 'Özel Tarih'}
            </button>
          ))}
        </div>
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

      {/* Analytics Content */}
      {analyticsData && (
        <div className="space-y-6">
          {/* Statistics Widget */}
          <RefundStatisticsWidget data={analyticsData} isLoading={isLoading} />

          {/* Trend Chart */}
          <RefundTrendChart data={analyticsData} isLoading={isLoading} />

          {/* Key Insights */}
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
            <h3 className="mb-4 text-lg font-semibold">Önemli Göstergeler</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg border bg-white p-4">
                <p className="text-muted-foreground mb-1 text-sm">
                  En Yüksek Oran
                </p>
                <p className="text-xl font-bold text-blue-600">
                  {analyticsData.approvalRate > analyticsData.successRate
                    ? 'Onay Oranı'
                    : 'Başarı Oranı'}
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {Math.max(
                    analyticsData.approvalRate,
                    analyticsData.successRate
                  ).toFixed(1)}
                  %
                </p>
              </div>

              <div className="rounded-lg border bg-white p-4">
                <p className="text-muted-foreground mb-1 text-sm">
                  Ortalama İşlem
                </p>
                <p className="text-xl font-bold text-purple-600">
                  {analyticsData.averageProcessingTimeHours.toFixed(1)} Saat
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Onay ve işleme süresi
                </p>
              </div>

              <div className="rounded-lg border bg-white p-4">
                <p className="text-muted-foreground mb-1 text-sm">
                  Bekleyen İşlemler
                </p>
                <p className="text-xl font-bold text-yellow-600">
                  {analyticsData.pendingCount} Adet
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {formatCurrency(analyticsData.pendingAmount)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !analyticsData && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <RefreshCw className="text-primary mb-4 h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">
              İade analitikleri yükleniyor...
            </p>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && !analyticsData && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Receipt className="text-muted-foreground mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">Veri Bulunamadı</h3>
            <p className="text-muted-foreground">
              Seçilen dönem için iade verisi mevcut değil
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

// ================================================
// REMOVED: formatCurrency (Sprint 1 - Cleanup)
// ================================================
// Now using canonical formatter from @/lib/shared/formatters
// ================================================
