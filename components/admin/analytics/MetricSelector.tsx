/**
 * ================================================
 * METRIC SELECTOR COMPONENT
 * ================================================
 * Component for selecting report metrics
 *
 * Features:
 * - Categorized metrics
 * - Multi-select functionality
 * - Search/filter
 * - Category grouping
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 3 - Task 3.5
 */

'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Search, Check } from 'lucide-react';
import { ReportMetric } from '@/hooks/business/admin/useReportBuilder';

interface MetricSelectorProps {
  selectedMetrics: string[];
  onMetricsChange: (metrics: string[]) => void;
}

/**
 * Available metrics for reports
 */
const AVAILABLE_METRICS: ReportMetric[] = [
  // Revenue Metrics
  {
    id: 'gross_revenue',
    label: 'Brüt Gelir',
    category: 'revenue',
    dataKey: 'grossRevenue',
  },
  {
    id: 'net_revenue',
    label: 'Net Gelir',
    category: 'revenue',
    dataKey: 'netRevenue',
  },
  {
    id: 'platform_fee',
    label: 'Platform Komisyonu',
    category: 'revenue',
    dataKey: 'platformFee',
  },
  {
    id: 'seller_earnings',
    label: 'Satıcı Kazançları',
    category: 'revenue',
    dataKey: 'sellerEarnings',
  },

  // Order Metrics
  {
    id: 'total_orders',
    label: 'Toplam Sipariş',
    category: 'orders',
    dataKey: 'totalOrders',
  },
  {
    id: 'completed_orders',
    label: 'Tamamlanan Siparişler',
    category: 'orders',
    dataKey: 'completedOrders',
  },
  {
    id: 'cancelled_orders',
    label: 'İptal Edilen Siparişler',
    category: 'orders',
    dataKey: 'cancelledOrders',
  },
  {
    id: 'avg_order_value',
    label: 'Ortalama Sipariş Değeri',
    category: 'orders',
    dataKey: 'avgOrderValue',
  },

  // Refund Metrics
  {
    id: 'total_refunds',
    label: 'Toplam İade',
    category: 'refunds',
    dataKey: 'totalRefunds',
  },
  {
    id: 'refund_amount',
    label: 'İade Tutarı',
    category: 'refunds',
    dataKey: 'refundAmount',
  },
  {
    id: 'refund_rate',
    label: 'İade Oranı',
    category: 'refunds',
    dataKey: 'refundRate',
  },

  // User Metrics
  {
    id: 'new_users',
    label: 'Yeni Kullanıcılar',
    category: 'users',
    dataKey: 'newUsers',
  },
  {
    id: 'active_users',
    label: 'Aktif Kullanıcılar',
    category: 'users',
    dataKey: 'activeUsers',
  },

  // Platform Metrics
  {
    id: 'transaction_count',
    label: 'İşlem Sayısı',
    category: 'platform',
    dataKey: 'transactionCount',
  },
  {
    id: 'wallet_balance',
    label: 'Cüzdan Bakiyesi',
    category: 'platform',
    dataKey: 'walletBalance',
  },
];

/**
 * Category labels
 */
const CATEGORY_LABELS: Record<string, string> = {
  revenue: 'Gelir Metrikleri',
  orders: 'Sipariş Metrikleri',
  refunds: 'İade Metrikleri',
  users: 'Kullanıcı Metrikleri',
  platform: 'Platform Metrikleri',
};

/**
 * Metric Selector Component
 */
export function MetricSelector({
  selectedMetrics,
  onMetricsChange,
}: MetricSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Filter metrics by search query
   */
  const filteredMetrics = useMemo(() => {
    if (!searchQuery) return AVAILABLE_METRICS;

    const query = searchQuery.toLowerCase();
    return AVAILABLE_METRICS.filter(
      (metric) =>
        metric.label.toLowerCase().includes(query) ||
        metric.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  /**
   * Group metrics by category
   */
  const groupedMetrics = useMemo(() => {
    const groups: Record<string, ReportMetric[]> = {};

    filteredMetrics.forEach((metric) => {
      if (!groups[metric.category]) {
        groups[metric.category] = [];
      }
      groups[metric.category].push(metric);
    });

    return groups;
  }, [filteredMetrics]);

  /**
   * Toggle metric selection
   */
  const toggleMetric = (metricId: string) => {
    const newMetrics = selectedMetrics.includes(metricId)
      ? selectedMetrics.filter((id) => id !== metricId)
      : [...selectedMetrics, metricId];

    onMetricsChange(newMetrics);
  };

  /**
   * Select all metrics in category
   */
  const selectCategory = (category: string) => {
    const categoryMetrics = AVAILABLE_METRICS.filter(
      (m) => m.category === category
    );
    const categoryIds = categoryMetrics.map((m) => m.id);
    const allSelected = categoryIds.every((id) => selectedMetrics.includes(id));

    if (allSelected) {
      // Deselect all in category
      onMetricsChange(
        selectedMetrics.filter((id) => !categoryIds.includes(id))
      );
    } else {
      // Select all in category
      const newMetrics = [
        ...selectedMetrics,
        ...categoryIds.filter((id) => !selectedMetrics.includes(id)),
      ];
      onMetricsChange(newMetrics);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold">Metrik Seçimi</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Rapora dahil edilecek metrikleri seçin
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Metrik ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="focus:ring-primary w-full rounded-md border py-2 pr-4 pl-10 focus:ring-2 focus:outline-none"
          />
        </div>

        {/* Selected Count */}
        <div className="text-muted-foreground text-sm">
          {selectedMetrics.length} metrik seçildi
        </div>

        {/* Metrics List */}
        <div className="max-h-96 space-y-6 overflow-y-auto">
          {Object.entries(groupedMetrics).map(([category, metrics]) => (
            <div key={category} className="space-y-2">
              {/* Category Header */}
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">
                  {CATEGORY_LABELS[category]}
                </h4>
                <button
                  onClick={() => selectCategory(category)}
                  className="text-primary text-xs hover:underline"
                >
                  {metrics.every((m) => selectedMetrics.includes(m.id))
                    ? 'Tümünü Kaldır'
                    : 'Tümünü Seç'}
                </button>
              </div>

              {/* Metrics */}
              <div className="space-y-1">
                {metrics.map((metric) => {
                  const isSelected = selectedMetrics.includes(metric.id);

                  return (
                    <button
                      key={metric.id}
                      onClick={() => toggleMetric(metric.id)}
                      className={`flex w-full items-center justify-between rounded-md border p-3 transition-colors ${
                        isSelected
                          ? 'bg-primary/10 border-primary'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-sm font-medium">
                        {metric.label}
                      </span>
                      {isSelected && <Check className="text-primary h-4 w-4" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {Object.keys(groupedMetrics).length === 0 && (
          <div className="text-muted-foreground py-8 text-center">
            Sonuç bulunamadı
          </div>
        )}
      </div>
    </Card>
  );
}
