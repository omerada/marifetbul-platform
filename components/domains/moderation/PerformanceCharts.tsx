/**
 * ================================================
 * PERFORMANCE CHARTS COMPONENT
 * ================================================
 * Displays moderation performance metrics with charts
 * - Approval rate trend
 * - Response time analysis
 * - Actions by type breakdown
 *
 * Sprint 2 - Day 4 Story 4.2: Activity Timeline & Charts
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { TrendingUp, Clock, Activity, BarChart3 } from 'lucide-react';

// ==================== TYPES ====================

export interface PerformanceData {
  approvalRate: number;
  averageResponseTime: number;
  totalActions: number;
  actionsByType: Record<string, number>;
  trend: 'up' | 'down' | 'stable';
}

export interface PerformanceChartsProps {
  data: PerformanceData | null;
  loading?: boolean;
}

// ==================== METRIC CARD ====================

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color,
}: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
  };

  const trendIcons = {
    up: '📈',
    down: '📉',
    stable: '➡️',
  };

  return (
    <Card className={`p-4 ${colorClasses[color]} border`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {icon}
            <p className="text-sm font-medium opacity-80">{title}</p>
          </div>
          <p className="mt-2 text-2xl font-bold">{value}</p>
          {subtitle && <p className="mt-1 text-xs opacity-70">{subtitle}</p>}
        </div>
        {trend && (
          <span className="text-2xl" title={`Trend: ${trend}`}>
            {trendIcons[trend]}
          </span>
        )}
      </div>
    </Card>
  );
}

// ==================== ACTION TYPE BAR ====================

interface ActionTypeBarProps {
  label: string;
  count: number;
  total: number;
  color: string;
}

function ActionTypeBar({ label, count, total, color }: ActionTypeBarProps) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-600">
          {count} ({percentage}%)
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export default function PerformanceCharts({
  data,
  loading,
}: PerformanceChartsProps) {
  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Performans Metrikleri
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4">
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-24 rounded bg-gray-200" />
                <div className="h-6 w-16 rounded bg-gray-200" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <Card className="p-6 text-center">
        <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-gray-600">Performans verileri yüklenemedi</p>
      </Card>
    );
  }

  // Calculate action type data
  const actionTypes = [
    { key: 'APPROVE', label: 'Onaylandı', color: 'bg-green-500' },
    { key: 'REJECT', label: 'Reddedildi', color: 'bg-red-500' },
    { key: 'SPAM', label: 'Spam', color: 'bg-orange-500' },
    { key: 'BULK_APPROVE', label: 'Toplu Onay', color: 'bg-green-400' },
    { key: 'BULK_REJECT', label: 'Toplu Red', color: 'bg-red-400' },
  ];

  const totalActionsByType = Object.values(data.actionsByType).reduce(
    (sum, count) => sum + count,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Performans Metrikleri
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Activity className="h-4 w-4" />
          <span>Son 24 saat</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Onay Oranı"
          value={`${data.approvalRate}%`}
          subtitle="Onaylanan/Toplam"
          icon={<TrendingUp className="h-4 w-4" />}
          trend={data.trend}
          color="green"
        />
        <MetricCard
          title="Ort. Yanıt Süresi"
          value={`${data.averageResponseTime}dk`}
          subtitle="İlk işlem süresi"
          icon={<Clock className="h-4 w-4" />}
          color="blue"
        />
        <MetricCard
          title="Toplam İşlem"
          value={data.totalActions.toString()}
          subtitle="Bugün"
          icon={<Activity className="h-4 w-4" />}
          color="purple"
        />
        <MetricCard
          title="Aktif Moderatör"
          value={Object.keys(data.actionsByType).length.toString()}
          subtitle="İşlem yapan"
          icon={<BarChart3 className="h-4 w-4" />}
          color="orange"
        />
      </div>

      {/* Actions by Type Chart */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            İşlem Türü Dağılımı
          </h3>
          <span className="text-sm text-gray-600">
            Toplam: {totalActionsByType}
          </span>
        </div>
        <div className="space-y-4">
          {actionTypes.map((type) => {
            const count = data.actionsByType[type.key] || 0;
            if (count === 0) return null;
            return (
              <ActionTypeBar
                key={type.key}
                label={type.label}
                count={count}
                total={totalActionsByType}
                color={type.color}
              />
            );
          })}
        </div>
      </Card>

      {/* Performance Insights */}
      <Card className="border-purple-200 bg-purple-50 p-4">
        <div className="flex items-start gap-3">
          <TrendingUp className="mt-0.5 h-5 w-5 text-purple-600" />
          <div>
            <h3 className="font-semibold text-purple-900">
              Performans İçgörüleri
            </h3>
            <ul className="mt-2 space-y-1 text-sm text-purple-800">
              {data.approvalRate >= 70 && (
                <li>✓ Yüksek onay oranı - İyi performans</li>
              )}
              {data.averageResponseTime < 60 && (
                <li>✓ Hızlı yanıt süresi - Etkili moderasyon</li>
              )}
              {data.totalActions > 50 && (
                <li>✓ Yüksek aktivite - Aktif moderasyon ekibi</li>
              )}
              {data.approvalRate < 50 && (
                <li>⚠ Düşük onay oranı - İçerik kalitesini gözden geçirin</li>
              )}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
