/**
 * ================================================
 * ORDER STATS WIDGET
 * ================================================
 * Widget for displaying order statistics summary
 *
 * Features:
 * - Active orders count
 * - Completed orders count
 * - Total revenue
 * - Pending actions count
 * - Loading states
 * - Error handling
 * - Click actions
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 2: Order System Enhancement
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { StatsCard } from '@/components/domains/dashboard/widgets/StatsCard';
import { formatCurrency } from '@/lib/shared/formatters';
import { Package, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import type { OrderStats } from '@/types/business/features/orders';

// ================================================
// TYPES
// ================================================

interface OrderStatsWidgetProps {
  /** Statistics data */
  stats: OrderStats | null;
  /** Loading state */
  isLoading?: boolean;
  /** Error message */
  error?: string | null;
  /** Show revenue (for sellers) */
  showRevenue?: boolean;
  /** Click handler for each stat */
  onStatClick?: (statType: keyof OrderStats) => void;
}

// Internal StatCard removed - now using unified StatsCard from dashboard widgets

// ================================================
// MAIN COMPONENT
// ================================================

export function OrderStatsWidget({
  stats,
  isLoading = false,
  error = null,
  showRevenue = false,
  onStatClick,
}: OrderStatsWidgetProps) {
  // ================================================
  // LOADING STATE
  // ================================================

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(showRevenue ? 4 : 3)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-2">
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                <div className="h-8 w-12 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="h-12 w-12 animate-pulse rounded-lg bg-gray-200" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // ================================================
  // ERROR STATE
  // ================================================

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/5 p-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="text-destructive h-5 w-5" />
          <p className="text-destructive text-sm">{error}</p>
        </div>
      </Card>
    );
  }

  // ================================================
  // EMPTY STATE
  // ================================================

  if (!stats) {
    return (
      <Card className="p-8 text-center">
        <Package className="text-muted-foreground mx-auto mb-2 h-12 w-12" />
        <p className="text-muted-foreground">İstatistik verisi bulunamadı</p>
      </Card>
    );
  }

  // ================================================
  // FORMAT HELPERS
  // ================================================

  // ================================================
  // RENDER
  // ================================================

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Orders */}
      <StatsCard
        data={{
          id: 'total-orders',
          title: 'Toplam Siparişler',
          value: (stats.totalOrders || 0).toString(),
          icon: Package,
          iconColor: 'blue',
          metadata: {
            onClick: () => onStatClick?.('totalOrders'),
          },
        }}
        onClick={() => onStatClick?.('totalOrders')}
      />

      {/* Completed Orders */}
      <StatsCard
        data={{
          id: 'completed-orders',
          title: 'Tamamlanan',
          value: (stats.completedOrders || 0).toString(),
          icon: CheckCircle,
          iconColor: 'green',
          metadata: {
            onClick: () => onStatClick?.('completedOrders'),
          },
        }}
        onClick={() => onStatClick?.('completedOrders')}
      />

      {/* Cancelled Orders */}
      <StatsCard
        data={{
          id: 'cancelled-orders',
          title: 'İptal Edilen',
          value: (stats.cancelledOrders || 0).toString(),
          icon: Clock,
          iconColor: 'gray',
          metadata: {
            onClick: () => onStatClick?.('cancelledOrders'),
          },
        }}
        onClick={() => onStatClick?.('cancelledOrders')}
      />

      {/* Revenue (for sellers) */}
      {showRevenue && stats.totalRevenue !== undefined && (
        <StatsCard
          data={{
            id: 'total-revenue',
            title: 'Toplam Gelir',
            value: formatCurrency(stats.totalRevenue),
            icon: Package, // Using Package instead of TrendingUp for consistency
            iconColor: 'purple',
            metadata: {
              onClick: () => onStatClick?.('totalRevenue'),
            },
          }}
          onClick={() => onStatClick?.('totalRevenue')}
        />
      )}
    </div>
  );
}
