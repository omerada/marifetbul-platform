'use client';

/**
 * AdminOrderStats Component
 * -------------------------
 * Statistics cards for admin order overview
 */

'use client';

import React, { useEffect, useState } from 'react';
import { StatsCardCompact } from '@/components/domains/dashboard/widgets/StatsCard';
import logger from '@/lib/infrastructure/monitoring/logger';
import { formatCurrency } from '@/lib/shared/formatters';
import {
  Package,
  CheckCircle,
  AlertCircle,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

interface AdminOrderStatsProps {
  className?: string;
}

interface PlatformStats {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  totalRevenue: number;
  platformFees: number;
  averageOrderValue: number;
}

export function AdminOrderStats({ className }: AdminOrderStatsProps) {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/v1/admin/orders/statistics', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data.data);
        }
      } catch (err) {
        logger.error(
          'Failed to fetch stats:',
          err instanceof Error ? err : new Error(String(err))
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div
        className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 ${className}`}
      >
        {[...Array(5)].map((_, i) => (
          <StatsCardCompact
            key={i}
            isLoading={true}
            data={{
              id: `loading-${i}`,
              title: '',
              value: '',
            }}
          />
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div
      className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 ${className}`}
    >
      <StatsCardCompact
        data={{
          id: 'total-orders',
          title: 'Toplam Sipariş',
          value: stats.totalOrders.toString(),
          icon: Package,
          iconColor: 'blue',
        }}
      />

      <StatsCardCompact
        data={{
          id: 'active-orders',
          title: 'Aktif Sipariş',
          value: stats.activeOrders.toString(),
          icon: AlertCircle,
          iconColor: 'yellow',
        }}
      />

      <StatsCardCompact
        data={{
          id: 'completed-orders',
          title: 'Tamamlanan',
          value: stats.completedOrders.toString(),
          icon: CheckCircle,
          iconColor: 'green',
        }}
      />

      <StatsCardCompact
        data={{
          id: 'total-revenue',
          title: 'Toplam Gelir',
          value: formatCurrency(stats.totalRevenue),
          icon: DollarSign,
          iconColor: 'purple',
        }}
      />

      <StatsCardCompact
        data={{
          id: 'average-order',
          title: 'Ort. Sipariş',
          value: formatCurrency(stats.averageOrderValue),
          icon: TrendingUp,
          iconColor: 'blue',
        }}
      />
    </div>
  );
}
