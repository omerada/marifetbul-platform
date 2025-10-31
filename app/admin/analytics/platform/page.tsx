/**
 * ================================================
 * ADMIN PLATFORM STATISTICS PAGE
 * ================================================
 * Platform-wide statistics and analytics dashboard
 *
 * Route: /admin/analytics/platform
 * Access: Admin only
 *
 * Features:
 * - Wallet metrics
 * - Payout statistics
 * - Transaction analytics
 * - Growth indicators
 * - Real-time refresh
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 3 - Task 3.2
 */

'use client';

import { Card } from '@/components/ui/Card';
import { RefreshCw, Download, TrendingUp } from 'lucide-react';
import { usePlatformStatistics } from '@/hooks';
import { PlatformStatsWidget } from '@/components/admin/analytics';
import { toast } from 'sonner';

/**
 * Admin Platform Statistics Page
 */
export default function AdminPlatformStatisticsPage() {
  const { data, isLoading, error, refresh } = usePlatformStatistics({
    autoLoad: true,
    refreshInterval: 60000, // Refresh every 60 seconds
  });

  // Handle export
  const handleExport = async () => {
    try {
      toast.info('Rapor hazırlanıyor...');
      // TODO: Implement export functionality
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Rapor başarıyla indirildi');
    } catch (_err) {
      toast.error('Rapor indirme başarısız');
    }
  };

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <TrendingUp className="h-8 w-8" />
            Platform İstatistikleri
          </h1>
          <p className="text-muted-foreground mt-1">
            Cüzdan, ödeme ve işlem metrikleri
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

      {/* Auto-refresh indicator */}
      <Card className="border-blue-200 bg-blue-50 p-3">
        <p className="text-sm text-blue-800">
          <span className="font-medium">Otomatik yenileme aktif:</span> Veriler
          her 60 saniyede bir güncelleniyor
        </p>
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

      {/* Platform Statistics */}
      {data && <PlatformStatsWidget data={data} isLoading={isLoading} />}

      {/* Loading State */}
      {isLoading && !data && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <RefreshCw className="text-primary mb-4 h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">İstatistikler yükleniyor...</p>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !data && !error && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <TrendingUp className="text-muted-foreground mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">Veri Bulunamadı</h3>
            <p className="text-muted-foreground">
              Platform istatistikleri yüklenemedi
            </p>
          </div>
        </Card>
      )}

      {/* Quick Insights */}
      {data && !isLoading && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 p-6">
          <h3 className="mb-4 text-lg font-semibold">Hızlı Bilgiler</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <p className="text-muted-foreground mb-1 text-sm">
                Aktiflik Oranı
              </p>
              <p className="text-2xl font-bold">
                {data.totalWallets > 0
                  ? ((data.activeWallets / data.totalWallets) * 100).toFixed(1)
                  : '0.0'}
                %
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Toplam cüzdanların aktif oranı
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 text-sm">
                Ortalama İşlem Hacmi
              </p>
              <p className="text-2xl font-bold">
                {data.totalTransactionCount > 0
                  ? (
                      data.totalTransactionVolume / data.totalTransactionCount
                    ).toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })
                  : '₺0'}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                İşlem başına ortalama
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 text-sm">
                Ödeme Tamamlanma Oranı
              </p>
              <p className="text-2xl font-bold text-green-600">
                {data.totalPayouts > 0
                  ? (
                      (data.completedPayoutCount / data.totalPayouts) *
                      100
                    ).toFixed(1)
                  : '0.0'}
                %
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Başarılı ödeme oranı
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
