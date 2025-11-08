/**
 * AdminOrderStats Component
 * -------------------------
 * Statistics cards for admin order overview
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
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
          <Card key={i} className="p-4">
            <div className="animate-pulse space-y-2">
              <div className="h-4 w-20 rounded bg-gray-200" />
              <div className="h-8 w-12 rounded bg-gray-200" />
            </div>
          </Card>
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
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Toplam Sipariş</p>
            <p className="text-2xl font-bold text-blue-600">
              {stats.totalOrders}
            </p>
          </div>
          <div className="rounded-lg bg-blue-100 p-3">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Aktif Sipariş</p>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.activeOrders}
            </p>
          </div>
          <div className="rounded-lg bg-yellow-100 p-3">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Tamamlanan</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.completedOrders}
            </p>
          </div>
          <div className="rounded-lg bg-green-100 p-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Toplam Gelir</p>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(stats.totalRevenue)}
            </p>
          </div>
          <div className="rounded-lg bg-purple-100 p-3">
            <DollarSign className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Ort. Sipariş</p>
            <p className="text-2xl font-bold text-indigo-600">
              {formatCurrency(stats.averageOrderValue)}
            </p>
          </div>
          <div className="rounded-lg bg-indigo-100 p-3">
            <TrendingUp className="h-6 w-6 text-indigo-600" />
          </div>
        </div>
      </Card>
    </div>
  );
}
