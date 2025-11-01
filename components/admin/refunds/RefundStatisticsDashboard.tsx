/**
 * ================================================
 * REFUND STATISTICS DASHBOARD COMPONENT
 * ================================================
 * Statistics dashboard showing refund metrics
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created October 31, 2025
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import {
  refundAdminApi,
  type RefundStatisticsDto,
} from '@/lib/api/admin/refund-admin-api';
import {
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/lib/shared/utils/logger';

// ================================================
// COMPONENT
// ================================================

export function RefundStatisticsDashboard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [stats, setStats] = useState<RefundStatisticsDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStatistics = async () => {
    setIsLoading(true);
    try {
      const data = await refundAdminApi.getRefundStatistics();
      setStats(data);
    } catch (error) {
      logger.error('Failed to fetch statistics:', error);
      toast.error('İstatistikler yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isExpanded && !stats) {
      fetchStatistics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded]);

  return (
    <div className="bg-card rounded-lg border">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="hover:bg-muted/50 flex w-full items-center justify-between p-4 text-left"
      >
        <h3 className="font-semibold">Detaylı İstatistikler</h3>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5" />
        ) : (
          <ChevronDown className="h-5 w-5" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2" />
            </div>
          ) : stats ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                  label="Toplam İade"
                  value={stats.totalRefunds}
                  subValue={`₺${stats.totalAmount.toLocaleString('tr-TR')}`}
                  icon={TrendingUp}
                />
                <StatCard
                  label="Ortalama İşlem Süresi"
                  value={`${stats.averageProcessingTimeHours.toFixed(1)} saat`}
                  icon={Clock}
                />
                <StatCard
                  label="Başarı Oranı"
                  value={`%${(stats.successRate * 100).toFixed(1)}`}
                  subValue={`Onay: %${(stats.approvalRate * 100).toFixed(1)}`}
                  icon={CheckCircle}
                />
              </div>

              {/* Detailed Breakdown */}
              <div>
                <h4 className="mb-3 font-medium">Durum Dağılımı</h4>
                <div className="space-y-2">
                  <StatusBar
                    label="Beklemede"
                    count={stats.pendingCount}
                    amount={stats.pendingAmount}
                    color="yellow"
                  />
                  <StatusBar
                    label="Onaylandı"
                    count={stats.approvedCount}
                    amount={stats.approvedAmount}
                    color="blue"
                  />
                  <StatusBar
                    label="Tamamlandı"
                    count={stats.completedCount}
                    amount={stats.completedAmount}
                    color="green"
                  />
                  <StatusBar
                    label="Reddedildi"
                    count={stats.rejectedCount}
                    amount={0}
                    color="red"
                  />
                  <StatusBar
                    label="Başarısız"
                    count={stats.failedCount}
                    amount={0}
                    color="gray"
                  />
                </div>
              </div>

              {/* Refresh Button */}
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={fetchStatistics}>
                  Yenile
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground py-4 text-center">
              İstatistikler yüklenemedi
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ================================================
// HELPER COMPONENTS
// ================================================

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: React.ComponentType<{ className?: string }>;
}

function StatCard({ label, value, subValue, icon: Icon }: StatCardProps) {
  return (
    <div className="bg-muted/50 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm">{label}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
          {subValue && (
            <p className="text-muted-foreground mt-1 text-xs">{subValue}</p>
          )}
        </div>
        <Icon className="text-muted-foreground h-5 w-5" />
      </div>
    </div>
  );
}

interface StatusBarProps {
  label: string;
  count: number;
  amount: number;
  color: 'yellow' | 'blue' | 'green' | 'red' | 'gray';
}

function StatusBar({ label, count, amount, color }: StatusBarProps) {
  const colorClasses = {
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    gray: 'bg-gray-500',
  };

  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="flex items-center gap-3">
        <div className={`h-3 w-3 rounded-full ${colorClasses[color]}`} />
        <span className="font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-muted-foreground text-sm">{count} talep</span>
        {amount > 0 && (
          <span className="text-sm font-medium">
            ₺{amount.toLocaleString('tr-TR')}
          </span>
        )}
      </div>
    </div>
  );
}
