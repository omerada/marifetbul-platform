'use client';

/**
 * ================================================
 * COMMISSION DASHBOARD COMPONENT
 * ================================================
 * Main dashboard for commission overview
 *
 * Features:
 * - Statistics cards
 * - Recent transactions
 * - Active rules summary
 * - Quick action buttons
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @sprint Sprint 1 Day 2 - Commission UI
 * @since 2025-11-14
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useCommissions } from '@/hooks/business/useCommissions';
import { formatCurrency, formatDate } from '@/lib/shared/formatters';
import { Card } from '@/components/ui';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/UnifiedSkeleton';
import { StatCard } from '@/components/ui';
import {
  DollarSign,
  TrendingUp,
  FileText,
  Settings,
  BarChart3,
  RefreshCw,
  Plus,
  ChevronRight,
} from 'lucide-react';
import logger from '@/lib/infrastructure/monitoring/logger';

// StatCard component now imported from @/components/ui

// ================================================
// MAIN COMPONENT
// ================================================

export const CommissionDashboard: React.FC = () => {
  const router = useRouter();
  const {
    transactions,
    rules,
    stats,
    isLoading,
    isLoadingStats,
    error,
    fetchTransactions,
    fetchStats,
    refresh,
  } = useCommissions({ page: 0, size: 5 });

  // ==================== EFFECTS ====================

  useEffect(() => {
    const loadData = async () => {
      try {
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);

        await Promise.all([
          fetchTransactions(0, 5),
          fetchStats(thirtyDaysAgo.toISOString(), today.toISOString()),
        ]);
      } catch (err) {
        logger.error('Failed to load commission dashboard data', err as Error);
        toast.error('Dashboard verileri yüklenemedi');
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==================== HANDLERS ====================

  const handleRefresh = async () => {
    try {
      await refresh();
      toast.success('Veriler yenilendi');
    } catch (err) {
      logger.error('Failed to refresh commission data', err as Error);
      toast.error('Yenileme başarısız');
    }
  };

  const handleNavigateToRules = () => {
    router.push('/admin/commissions/rules');
  };

  const handleNavigateToAnalytics = () => {
    router.push('/admin/commissions/analytics');
  };

  const handleCreateRule = () => {
    router.push('/admin/commissions/rules?action=create');
  };

  // ==================== STATS CALCULATION ====================

  const activeRulesCount = rules.filter((r) => r.isActive).length;
  const totalRulesCount = rules.length;

  const totalCommission = stats?.totalCommissions || 0;
  const avgCommissionRate = stats?.averageCommissionRate || 0;
  const totalOrders = stats?.totalOrders || 0;

  // ==================== RENDER ====================

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <Button variant="primary" onClick={handleCreateRule}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Kural
          </Button>
          <Button variant="outline" onClick={handleNavigateToAnalytics}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Analiz
          </Button>
        </div>
        <Button variant="outline" onClick={handleRefresh} loading={isLoading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Yenile
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Toplam Komisyon"
          value={formatCurrency(totalCommission)}
          subtitle="Son 30 gün"
          icon={<DollarSign className="h-6 w-6" />}
          isLoading={isLoadingStats}
          variant="detailed"
          testId="stat-card-commission"
        />

        <StatCard
          label="Ortalama Oran"
          value={`%${(avgCommissionRate * 100).toFixed(2)}`}
          subtitle="Platform geneli"
          icon={<TrendingUp className="h-6 w-6" />}
          isLoading={isLoadingStats}
          variant="detailed"
          testId="stat-card-rate"
        />

        <StatCard
          label="Toplam İşlem"
          value={totalOrders}
          subtitle="Son 30 gün"
          icon={<FileText className="h-6 w-6" />}
          isLoading={isLoadingStats}
          variant="detailed"
          testId="stat-card-orders"
        />

        <StatCard
          label="Aktif Kurallar"
          value={`${activeRulesCount}/${totalRulesCount}`}
          subtitle="Toplam kurallar"
          icon={<Settings className="h-6 w-6" />}
          isLoading={isLoading}
          variant="detailed"
          testId="stat-card-rules"
        />
      </div>

      {/* Recent Transactions & Active Rules */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Transactions */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Son İşlemler
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin/commissions/transactions')}
            >
              Tümünü Gör
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              Henüz işlem bulunmuyor
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {formatCurrency(transaction.commissionAmount)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      transaction.status === 'COMPLETED'
                        ? 'success'
                        : transaction.status === 'PENDING'
                          ? 'warning'
                          : 'destructive'
                    }
                  >
                    {transaction.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Active Rules */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Aktif Kurallar
            </h2>
            <Button variant="ghost" size="sm" onClick={handleNavigateToRules}>
              Tümünü Gör
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : rules.filter((r) => r.isActive).length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              Henüz aktif kural bulunmuyor
            </div>
          ) : (
            <div className="space-y-3">
              {rules
                .filter((r) => r.isActive)
                .slice(0, 5)
                .map((rule) => (
                  <div
                    key={rule.id}
                    className="flex cursor-pointer items-center justify-between rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                    onClick={() =>
                      router.push(`/admin/commissions/rules?id=${rule.id}`)
                    }
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{rule.ruleType}</Badge>
                        <span className="font-medium text-gray-900">
                          %{(rule.rate * 100).toFixed(2)}
                        </span>
                      </div>
                      {rule.description && (
                        <p className="mt-1 text-sm text-gray-500">
                          {rule.description}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
            </div>
          )}
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      )}
    </div>
  );
};

export default CommissionDashboard;
