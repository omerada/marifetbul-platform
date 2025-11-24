/**
 * ================================================
 * USER STATS GRID COMPONENT
 * ================================================
 * Displays key user statistics in a grid layout
 * Part of Story 4: User Management Completion
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint 2 Story 2.1 - Real API Integration
 */

'use client';

import { Card } from '@/components/ui';
import type { UserStatsDTO } from '@/lib/api/admin-users';
import {
  ShoppingCart,
  DollarSign,
  Star,
  Package,
  TrendingUp,
  Users,
} from 'lucide-react';

interface UserStatsGridProps {
  stats: UserStatsDTO;
  className?: string;
}

/**
 * Stat Card Component
 */
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

function StatCard({
  icon,
  label,
  value,
  trend,
  className = '',
}: StatCardProps) {
  return (
    <Card className={`p-4 ${className}`}>
      <div className="mb-2 flex items-center justify-between">
        <div className="bg-primary/10 text-primary rounded-lg p-2">{icon}</div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            <TrendingUp
              className={`h-4 w-4 ${trend.isPositive ? '' : 'rotate-180'}`}
            />
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-muted-foreground text-sm">{label}</p>
      </div>
    </Card>
  );
}

/**
 * Format currency
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage
 */
function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * User Stats Grid Component
 */
export function UserStatsGrid({ stats, className = '' }: UserStatsGridProps) {
  return (
    <div
      className={`grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 ${className}`}
    >
      {/* Total Orders */}
      <StatCard
        icon={<ShoppingCart className="h-5 w-5" />}
        label="Toplam Sipariş"
        value={stats.totalOrders}
      />

      {/* Total Revenue */}
      <StatCard
        icon={<DollarSign className="h-5 w-5" />}
        label="Toplam Gelir"
        value={formatCurrency(stats.totalRevenue)}
      />

      {/* Average Rating */}
      <StatCard
        icon={<Star className="h-5 w-5" />}
        label="Ortalama Puan"
        value={stats.averageRating.toFixed(1)}
      />

      {/* Total Packages */}
      <StatCard
        icon={<Package className="h-5 w-5" />}
        label="Toplam Paket"
        value={stats.totalPackages}
      />

      {/* Completion Rate */}
      <StatCard
        icon={<TrendingUp className="h-5 w-5" />}
        label="Tamamlanma Oranı"
        value={formatPercentage(stats.completionRate)}
      />

      {/* Active Clients */}
      <StatCard
        icon={<Users className="h-5 w-5" />}
        label="Aktif Müşteri"
        value={stats.activeClients}
      />
    </div>
  );
}

export default UserStatsGrid;
