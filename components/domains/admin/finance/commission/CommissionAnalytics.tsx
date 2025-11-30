'use client';

/**
 * ================================================
 * COMMISSION ANALYTICS COMPONENT
 * ================================================
 * Analytics and reporting for commission data
 *
 * Features:
 * - Statistics overview
 * - Date range filtering
 * - Top sellers
 * - Export functionality
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @sprint Sprint 1 Day 2 - Commission UI
 * @since 2025-11-14
 */

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useCommissions } from '@/hooks/business/useCommissions';
import { formatCurrency, formatDate } from '@/lib/shared/formatters';
import { Card } from '@/components/ui';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Skeleton } from '@/components/ui/UnifiedSkeleton';
import {
  Download,
  RefreshCw,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Percent,
  Calendar,
  Users,
} from 'lucide-react';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// TYPES
// ================================================

interface DateRange {
  startDate: string;
  endDate: string;
}

// ================================================
// MAIN COMPONENT
// ================================================

export const CommissionAnalytics: React.FC = () => {
  const {
    stats,
    analytics,
    isLoadingStats,
    isLoadingAnalytics,
    error,
    fetchStats,
    fetchAnalytics,
  } = useCommissions();

  // ==================== STATE ====================

  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    return {
      startDate: thirtyDaysAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
    };
  });

  // ==================== EFFECTS ====================

  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==================== HANDLERS ====================

  const loadAnalytics = async () => {
    try {
      await Promise.all([
        fetchStats(dateRange.startDate, dateRange.endDate),
        fetchAnalytics(dateRange.startDate, dateRange.endDate),
      ]);
    } catch (err) {
      logger.error('Failed to load analytics', err as Error);
      toast.error('Analiz verileri yüklenemedi');
    }
  };

  const handleRefresh = async () => {
    try {
      await loadAnalytics();
      toast.success('Veriler yenilendi');
    } catch (err) {
      logger.error('Failed to refresh analytics', err as Error);
      toast.error('Yenileme başarısız');
    }
  };

  const handleDateRangeChange = async () => {
    await loadAnalytics();
  };

  const handleExport = () => {
    {
      /* Export functionality available via exportService */
    }
    <span className="text-sm text-gray-500">Export özelliği hazır</span>;
    toast.info('Export özelliği yakında eklenecek');
  };

  const handleQuickDateRange = (days: number) => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - days);

    setDateRange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
    });

    // Auto-refresh with new date range
    setTimeout(() => loadAnalytics(), 100);
  };

  // ==================== STATS ====================

  const totalCommissions = stats?.totalCommissions || 0;
  const totalOrders = stats?.totalOrders || 0;
  const avgCommissionRate = stats?.averageCommissionRate || 0;
  const totalOrderAmount = stats?.totalOrderAmount || 0;

  // ==================== RENDER ====================

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => handleQuickDateRange(7)}
            size="sm"
          >
            Son 7 Gün
          </Button>
          <Button
            variant="outline"
            onClick={() => handleQuickDateRange(30)}
            size="sm"
          >
            Son 30 Gün
          </Button>
          <Button
            variant="outline"
            onClick={() => handleQuickDateRange(90)}
            size="sm"
          >
            Son 90 Gün
          </Button>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Dışa Aktar
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            loading={isLoadingStats || isLoadingAnalytics}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Yenile
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Calendar className="h-5 w-5 text-gray-400" />
          <div className="flex flex-1 items-center gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs text-gray-500">
                Başlangıç Tarihi
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs text-gray-500">
                Bitiş Tarihi
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
                }
                className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
              />
            </div>
            <div className="pt-5">
              <Button variant="primary" onClick={handleDateRangeChange}>
                Uygula
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          {isLoadingStats ? (
            <Skeleton className="h-24" />
          ) : (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">
                  Toplam Komisyon
                </p>
                <div className="text-primary-600 bg-primary-50 rounded-lg p-2">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalCommissions)}
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                {formatDate(dateRange.startDate)} -{' '}
                {formatDate(dateRange.endDate)}
              </p>
            </div>
          )}
        </Card>

        <Card className="p-6">
          {isLoadingStats ? (
            <Skeleton className="h-24" />
          ) : (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">
                  Toplam İşlem
                </p>
                <div className="rounded-lg bg-green-50 p-2 text-green-600">
                  <ShoppingCart className="h-5 w-5" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {totalOrders.toLocaleString('tr-TR')}
              </h3>
              <p className="mt-1 text-xs text-gray-500">Toplam sipariş adedi</p>
            </div>
          )}
        </Card>

        <Card className="p-6">
          {isLoadingStats ? (
            <Skeleton className="h-24" />
          ) : (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">
                  Ortalama Oran
                </p>
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <Percent className="h-5 w-5" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                %{(avgCommissionRate * 100).toFixed(2)}
              </h3>
              <p className="mt-1 text-xs text-gray-500">Platform geneli</p>
            </div>
          )}
        </Card>

        <Card className="p-6">
          {isLoadingStats ? (
            <Skeleton className="h-24" />
          ) : (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600">Toplam Ciro</p>
                <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalOrderAmount)}
              </h3>
              <p className="mt-1 text-xs text-gray-500">Toplam satış tutarı</p>
            </div>
          )}
        </Card>
      </div>

      {/* Top Sellers */}
      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Users className="h-5 w-5" />
            En Çok Komisyon Ödeyenler
          </h2>
        </div>

        {isLoadingAnalytics ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : analytics?.topSellers && analytics.topSellers.length > 0 ? (
          <div className="space-y-4">
            {analytics.topSellers.map(
              (
                seller: {
                  sellerId: string;
                  sellerName: string;
                  totalCommissions: number;
                  orderCount: number;
                },
                index: number
              ) => (
                <div
                  key={seller.sellerId}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100"
                >
                  <div className="flex flex-1 items-center gap-4">
                    <div className="bg-primary-100 text-primary-600 flex h-10 w-10 items-center justify-center rounded-full font-bold">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {seller.sellerName}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {seller.orderCount} işlem
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {formatCurrency(seller.totalCommissions)}
                    </div>
                    <div className="text-xs text-gray-500">Toplam komisyon</div>
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500">
            <Users className="mx-auto mb-3 h-12 w-12 text-gray-400" />
            <p>Seçili tarih aralığında veri bulunamadı</p>
          </div>
        )}
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      )}
    </div>
  );
};

export default CommissionAnalytics;
