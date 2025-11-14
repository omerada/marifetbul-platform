/**
 * ================================================
 * WITHDRAWAL HISTORY PAGE
 * ================================================
 * Complete withdrawal/payout history with filters
 *
 * Features:
 * - List all withdrawal requests
 * - Status filtering (pending, processing, completed, failed, cancelled)
 * - Date range filtering
 * - Amount range filtering
 * - Search by transaction ID
 * - Status timeline view
 * - Cancel pending withdrawals
 * - Retry failed withdrawals
 * - Export to CSV/PDF
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 13, 2025
 * @sprint Sprint 1 - Week 1 - Day 5: Withdrawal History & Status
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import { usePayouts } from '@/hooks/business/wallet/usePayouts';
import { UnifiedPayoutHistory } from '@/components/domains/wallet';
import { PayoutStatusTracker } from '@/components/domains/wallet/PayoutStatusTracker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/Select';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import {
  Clock,
  Download,
  Filter,
  RefreshCw,
  Search,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { PayoutStatus, type Payout } from '@/types/business/features/wallet';
import { formatCurrency } from '@/lib/shared/formatters';
import { startOfMonth } from 'date-fns';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// TYPES
// ================================================

interface FilterState {
  status: PayoutStatus | 'ALL';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'custom';
  searchQuery: string;
  minAmount?: number;
  maxAmount?: number;
  customStartDate?: string;
  customEndDate?: string;
}

interface PayoutSummary {
  total: number;
  totalAmount: number;
  pending: number;
  pendingAmount: number;
  processing: number;
  processingAmount: number;
  completed: number;
  completedAmount: number;
  failed: number;
  cancelled: number;
}

// ================================================
// HELPER FUNCTIONS
// ================================================

/**
 * Calculate summary statistics
 */
function calculateSummary(payouts: Payout[]): PayoutSummary {
  return payouts.reduce(
    (summary, payout) => {
      summary.total++;
      summary.totalAmount += payout.amount;

      switch (payout.status) {
        case PayoutStatus.PENDING:
          summary.pending++;
          summary.pendingAmount += payout.amount;
          break;
        case PayoutStatus.PROCESSING:
          summary.processing++;
          summary.processingAmount += payout.amount;
          break;
        case PayoutStatus.COMPLETED:
          summary.completed++;
          summary.completedAmount += payout.amount;
          break;
        case PayoutStatus.FAILED:
          summary.failed++;
          break;
        case PayoutStatus.CANCELLED:
          summary.cancelled++;
          break;
      }

      return summary;
    },
    {
      total: 0,
      totalAmount: 0,
      pending: 0,
      pendingAmount: 0,
      processing: 0,
      processingAmount: 0,
      completed: 0,
      completedAmount: 0,
      failed: 0,
      cancelled: 0,
    } as PayoutSummary
  );
}

/**
 * Filter payouts based on filter state
 */
function filterPayouts(payouts: Payout[], filters: FilterState): Payout[] {
  return payouts.filter((payout) => {
    // Status filter
    if (filters.status !== 'ALL' && payout.status !== filters.status) {
      return false;
    }

    // Amount filter
    if (filters.minAmount && payout.amount < filters.minAmount) {
      return false;
    }
    if (filters.maxAmount && payout.amount > filters.maxAmount) {
      return false;
    }

    // Search filter (ID, description, bank account)
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesId = payout.id.toLowerCase().includes(query);
      const matchesDescription = payout.description
        ?.toLowerCase()
        .includes(query);

      // Check bank account info if available
      let matchesBankAccount = false;
      if (payout.bankAccountInfo) {
        const bankInfo =
          typeof payout.bankAccountInfo === 'string'
            ? payout.bankAccountInfo
            : JSON.stringify(payout.bankAccountInfo);
        matchesBankAccount = bankInfo.toLowerCase().includes(query);
      }

      if (!matchesId && !matchesDescription && !matchesBankAccount) {
        return false;
      }
    }

    // Date range filter
    const payoutDate = new Date(payout.requestedAt);
    const now = new Date();

    switch (filters.dateRange) {
      case 'today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (payoutDate < today) return false;
        break;

      case 'week':
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        if (payoutDate < weekAgo) return false;
        break;

      case 'month':
        const monthStart = startOfMonth(now);
        if (payoutDate < monthStart) return false;
        break;

      case 'custom':
        if (filters.customStartDate) {
          const startDate = new Date(filters.customStartDate);
          if (payoutDate < startDate) return false;
        }
        if (filters.customEndDate) {
          const endDate = new Date(filters.customEndDate);
          endDate.setHours(23, 59, 59, 999);
          if (payoutDate > endDate) return false;
        }
        break;
    }

    return true;
  });
}

/**
 * Get status badge variant
 */
function getStatusBadgeVariant(
  status: PayoutStatus
): 'default' | 'success' | 'warning' | 'destructive' {
  switch (status) {
    case PayoutStatus.COMPLETED:
      return 'success';
    case PayoutStatus.PENDING:
      return 'warning';
    case PayoutStatus.PROCESSING:
      return 'default';
    case PayoutStatus.FAILED:
    case PayoutStatus.CANCELLED:
      return 'destructive';
    default:
      return 'default';
  }
}

// ================================================
// MAIN COMPONENT
// ================================================

export default function WithdrawalHistoryPage() {
  // Data fetching
  const {
    payouts,
    isLoading,
    refresh,
    cancelPayout,
    requestPayout,
    fetchPayouts,
  } = usePayouts();

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    status: 'ALL',
    dateRange: 'month',
    searchQuery: '',
  });

  // UI state
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // ==================== COMPUTED VALUES ====================

  const filteredPayouts = useMemo(
    () => filterPayouts(payouts, filters),
    [payouts, filters]
  );

  const summary = useMemo(
    () => calculateSummary(filteredPayouts),
    [filteredPayouts]
  );

  // ==================== HANDLERS ====================

  const handleStatusFilter = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: status as PayoutStatus | 'ALL',
    }));
  };

  const handleDateRangeFilter = (range: FilterState['dateRange']) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: range,
    }));
  };

  const handleSearch = (query: string) => {
    setFilters((prev) => ({
      ...prev,
      searchQuery: query,
    }));
  };

  const handleRefresh = useCallback(() => {
    logger.info('Refreshing withdrawal history');
    refresh();
  }, [refresh]);

  const handleCancelPayout = useCallback(
    async (payoutId: string) => {
      try {
        await cancelPayout(payoutId);
        logger.info('Payout cancelled', { payoutId });
      } catch (error) {
        logger.error('Failed to cancel payout', error as Error, { payoutId });
      }
    },
    [cancelPayout]
  );

  const handleRetryPayout = useCallback(
    async (payoutId: string) => {
      try {
        logger.info('Payout retry requested', { payoutId });

        // Find the failed payout
        const failedPayout = filteredPayouts.find((p) => p.id === payoutId);
        if (!failedPayout) {
          throw new Error('Payout not found');
        }

        // Retry by creating a new payout request with same details
        await requestPayout({
          amount: failedPayout.amount,
          method: failedPayout.method,
          bankAccountInfo: failedPayout.bankAccountInfo,
          notes: `Retry of failed payout ${payoutId}`,
        });

        // Refresh the list
        await fetchPayouts();

        logger.info('Payout retry successful', { payoutId });
      } catch (error) {
        logger.error('Failed to retry payout', error as Error, { payoutId });
        throw error;
      }
    },
    [filteredPayouts, requestPayout, fetchPayouts]
  );

  const handleExportCSV = useCallback(() => {
    logger.info('Exporting withdrawal history to CSV');

    try {
      // Prepare CSV headers
      const headers = [
        'ID',
        'Tarih',
        'Tutar',
        'Durum',
        'Yöntem',
        'Banka Hesabı',
        'Açıklama',
      ];

      // Convert payouts to CSV rows
      const rows = filteredPayouts.map((payout) => [
        payout.id,
        new Date(payout.requestedAt).toLocaleString('tr-TR'),
        formatCurrency(payout.amount),
        payout.status,
        payout.method,
        payout.bankAccountInfo?.iban || '-',
        payout.description || '-',
      ]);

      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `cekim-gecmisi-${new Date().toISOString().split('T')[0]}.csv`
      );
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      logger.info('CSV export completed', {
        rowCount: filteredPayouts.length,
      });
    } catch (error) {
      logger.error('Failed to export CSV', error as Error);
      throw error;
    }
  }, [filteredPayouts]);

  // ==================== RENDER ====================

  return (
    <div className="container mx-auto max-w-7xl space-y-6 px-4 py-8">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 p-3 shadow-lg">
            <Clock className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Çekim Geçmişi</h1>
            <p className="text-gray-600">
              Tüm para çekme taleplerinizi görüntüleyin ve yönetin
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam İşlem</p>
              <p className="mt-2 text-3xl font-bold">{summary.total}</p>
              <p className="mt-1 text-sm text-gray-500">
                {formatCurrency(summary.totalAmount)}
              </p>
            </div>
            <TrendingUp className="h-12 w-12 text-blue-500 opacity-20" />
          </div>
        </Card>

        {/* Completed */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tamamlandı</p>
              <p className="mt-2 text-3xl font-bold text-green-600">
                {summary.completed}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {formatCurrency(summary.completedAmount)}
              </p>
            </div>
            <CheckCircle2 className="h-12 w-12 text-green-500 opacity-20" />
          </div>
        </Card>

        {/* Pending */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Beklemede</p>
              <p className="mt-2 text-3xl font-bold text-yellow-600">
                {summary.pending + summary.processing}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {formatCurrency(
                  summary.pendingAmount + summary.processingAmount
                )}
              </p>
            </div>
            <AlertCircle className="h-12 w-12 text-yellow-500 opacity-20" />
          </div>
        </Card>

        {/* Failed */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Başarısız</p>
              <p className="mt-2 text-3xl font-bold text-red-600">
                {summary.failed + summary.cancelled}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                İptal edildi: {summary.cancelled}
              </p>
            </div>
            <XCircle className="h-12 w-12 text-red-500 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="İşlem ID, açıklama veya hesap ara..."
              value={filters.searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Status Filter */}
            <Select value={filters.status} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-[180px]" />
              <SelectContent>
                <SelectItem value="ALL">Tümü</SelectItem>
                <SelectItem value={PayoutStatus.PENDING}>Beklemede</SelectItem>
                <SelectItem value={PayoutStatus.PROCESSING}>
                  İşleniyor
                </SelectItem>
                <SelectItem value={PayoutStatus.COMPLETED}>
                  Tamamlandı
                </SelectItem>
                <SelectItem value={PayoutStatus.FAILED}>Başarısız</SelectItem>
                <SelectItem value={PayoutStatus.CANCELLED}>
                  İptal Edildi
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Date Range Filter */}
            <Select
              value={filters.dateRange}
              onValueChange={(value) =>
                handleDateRangeFilter(value as FilterState['dateRange'])
              }
            >
              <SelectTrigger className="w-[150px]" />
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="today">Bugün</SelectItem>
                <SelectItem value="week">Son 7 Gün</SelectItem>
                <SelectItem value="month">Bu Ay</SelectItem>
                <SelectItem value="custom">Özel Tarih</SelectItem>
              </SelectContent>
            </Select>

            {/* Refresh */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
              />
            </Button>

            {/* Export */}
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Dışa Aktar
            </Button>

            {/* Advanced Filters Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              {showFilters ? 'Filtreleri Gizle' : 'Daha Fazla Filtre'}
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 grid gap-4 border-t pt-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Min Amount */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Minimum Tutar
              </label>
              <Input
                type="number"
                placeholder="0"
                value={filters.minAmount || ''}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    minAmount: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  }))
                }
              />
            </div>

            {/* Max Amount */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Maximum Tutar
              </label>
              <Input
                type="number"
                placeholder="10000"
                value={filters.maxAmount || ''}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    maxAmount: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  }))
                }
              />
            </div>

            {/* Custom Date Range */}
            {filters.dateRange === 'custom' && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Başlangıç Tarihi
                  </label>
                  <Input
                    type="date"
                    value={filters.customStartDate || ''}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        customStartDate: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Bitiş Tarihi
                  </label>
                  <Input
                    type="date"
                    value={filters.customEndDate || ''}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        customEndDate: e.target.value,
                      }))
                    }
                  />
                </div>
              </>
            )}
          </div>
        )}
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          <span className="font-semibold">{filteredPayouts.length}</span> işlem
          gösteriliyor
          {filters.status !== 'ALL' && (
            <span>
              {' '}
              (Durum:{' '}
              <Badge
                variant={getStatusBadgeVariant(filters.status as PayoutStatus)}
              >
                {filters.status}
              </Badge>
              )
            </span>
          )}
        </p>
      </div>

      {/* Payout History List */}
      <UnifiedPayoutHistory
        variant="advanced"
        payouts={filteredPayouts}
        isLoading={isLoading}
        onCancelPayout={handleCancelPayout}
        onViewDetails={(payout) => setSelectedPayout(payout)}
      />

      {/* Payout Detail Modal */}
      {selectedPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Ödeme Detayları</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPayout(null)}
              >
                ✕
              </Button>
            </div>
            <PayoutStatusTracker
              payout={{
                ...selectedPayout,
                createdAt: selectedPayout.requestedAt,
                method: selectedPayout.method as 'BANK_TRANSFER' | 'IYZICO',
              }}
              showTimeline={true}
            />
            <div className="mt-4 flex justify-end gap-2">
              {selectedPayout.status === PayoutStatus.PENDING && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleCancelPayout(selectedPayout.id);
                    setSelectedPayout(null);
                  }}
                >
                  İptal Et
                </Button>
              )}
              {selectedPayout.status === PayoutStatus.FAILED && (
                <Button
                  variant="primary"
                  onClick={() => {
                    handleRetryPayout(selectedPayout.id);
                    setSelectedPayout(null);
                  }}
                >
                  Tekrar Dene
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
