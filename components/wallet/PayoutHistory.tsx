/**
 * ================================================
 * PAYOUT HISTORY COMPONENT
 * ================================================
 * Displays payout request history with status tracking
 *
 * Features:
 * - Paginated payout list
 * - Status badges with colors
 * - Timeline view
 * - Filter by status/date
 * - Export functionality
 * - Cancellation support
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint 1
 */

'use client';

import { useState, useMemo } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  DollarSign,
  Building2,
  Calendar,
  Download,
  Filter,
  Search,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/loading';
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  formatIBAN,
} from '@/lib/shared/formatters';
import { cn } from '@/lib/utils';
import { PayoutStatus } from '@/types/business/features/wallet';
import type { Payout } from '@/types/business/features/wallet';

// ============================================================================
// TYPES
// ============================================================================

export interface PayoutHistoryProps {
  payouts: Payout[];
  isLoading?: boolean;
  error?: string | null;
  onCancel?: (payoutId: string) => Promise<void>;
  onRefresh?: () => void;
  onExport?: (format: 'csv' | 'excel') => void;
  className?: string;
}

interface FilterOptions {
  status: PayoutStatus | 'ALL';
  dateFrom?: string;
  dateTo?: string;
  search: string;
}

// ============================================================================
// STATUS HELPERS
// ============================================================================

function getStatusConfig(status: PayoutStatus) {
  switch (status) {
    case PayoutStatus.PENDING:
      return {
        label: 'Bekliyor',
        icon: Clock,
        variant: 'warning' as const,
        bgClass: 'bg-yellow-50',
        textClass: 'text-yellow-700',
        iconClass: 'text-yellow-600',
      };
    case PayoutStatus.PROCESSING:
      return {
        label: 'İşleniyor',
        icon: RefreshCw,
        variant: 'default' as const,
        bgClass: 'bg-blue-50',
        textClass: 'text-blue-700',
        iconClass: 'text-blue-600',
      };
    case PayoutStatus.COMPLETED:
      return {
        label: 'Tamamlandı',
        icon: CheckCircle2,
        variant: 'success' as const,
        bgClass: 'bg-green-50',
        textClass: 'text-green-700',
        iconClass: 'text-green-600',
      };
    case PayoutStatus.FAILED:
      return {
        label: 'Başarısız',
        icon: XCircle,
        variant: 'destructive' as const,
        bgClass: 'bg-red-50',
        textClass: 'text-red-700',
        iconClass: 'text-red-600',
      };
    case PayoutStatus.CANCELLED:
      return {
        label: 'İptal Edildi',
        icon: AlertCircle,
        variant: 'secondary' as const,
        bgClass: 'bg-gray-50',
        textClass: 'text-gray-700',
        iconClass: 'text-gray-600',
      };
    default:
      return {
        label: status,
        icon: AlertCircle,
        variant: 'secondary' as const,
        bgClass: 'bg-gray-50',
        textClass: 'text-gray-700',
        iconClass: 'text-gray-600',
      };
  }
}

// ============================================================================
// FILTER BAR
// ============================================================================

interface FilterBarProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onExport?: (format: 'csv' | 'excel') => void;
  disabled?: boolean;
}

function FilterBar({
  filters,
  onFiltersChange,
  onExport,
  disabled,
}: FilterBarProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="İşlem ara..."
            value={filters.search}
            onChange={(e) =>
              onFiltersChange({ ...filters, search: e.target.value })
            }
            disabled={disabled}
            className="w-full rounded-lg border border-gray-300 py-2 pr-3 pl-9 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
          />
        </div>

        {/* Export Buttons */}
        {onExport && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport('csv')}
              disabled={disabled}
            >
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport('excel')}
              disabled={disabled}
            >
              <Download className="mr-2 h-4 w-4" />
              Excel
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filters.status}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                status: e.target.value as PayoutStatus | 'ALL',
              })
            }
            disabled={disabled}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
          >
            <option value="ALL">Tüm Durumlar</option>
            <option value={PayoutStatus.PENDING}>Bekliyor</option>
            <option value={PayoutStatus.PROCESSING}>İşleniyor</option>
            <option value={PayoutStatus.COMPLETED}>Tamamlandı</option>
            <option value={PayoutStatus.FAILED}>Başarısız</option>
            <option value={PayoutStatus.CANCELLED}>İptal Edildi</option>
          </select>
        </div>

        {/* Date Range */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <input
            type="date"
            value={filters.dateFrom || ''}
            onChange={(e) =>
              onFiltersChange({ ...filters, dateFrom: e.target.value })
            }
            disabled={disabled}
            placeholder="Başlangıç"
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
          />
          <span className="text-sm text-gray-500">-</span>
          <input
            type="date"
            value={filters.dateTo || ''}
            onChange={(e) =>
              onFiltersChange({ ...filters, dateTo: e.target.value })
            }
            disabled={disabled}
            placeholder="Bitiş"
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PAYOUT CARD
// ============================================================================

interface PayoutCardProps {
  payout: Payout;
  onCancel?: (payoutId: string) => Promise<void>;
}

function PayoutCard({ payout, onCancel }: PayoutCardProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const statusConfig = getStatusConfig(payout.status);
  const StatusIcon = statusConfig.icon;

  const canCancel = payout.status === PayoutStatus.PENDING;

  const handleCancel = async () => {
    if (!onCancel || !canCancel) return;

    if (
      !confirm(
        'Bu para çekme talebini iptal etmek istediğinizden emin misiniz?'
      )
    ) {
      return;
    }

    setIsCancelling(true);
    try {
      await onCancel(payout.id);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn('rounded-full p-2', statusConfig.bgClass)}>
                <StatusIcon className={cn('h-5 w-5', statusConfig.iconClass)} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">
                    {formatCurrency(payout.amount, payout.currency)}
                  </h3>
                  <Badge variant={statusConfig.variant}>
                    {statusConfig.label}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  {formatRelativeTime(payout.requestedAt)}
                </p>
              </div>
            </div>

            {/* Cancel Button */}
            {canCancel && onCancel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={isCancelling}
                className="text-red-600 hover:text-red-700"
              >
                {isCancelling ? (
                  <>
                    <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                    İptal Ediliyor
                  </>
                ) : (
                  'İptal Et'
                )}
              </Button>
            )}
          </div>

          {/* Bank Info */}
          {payout.bankAccountInfo && (
            <div className="flex items-start gap-2 rounded-lg bg-gray-50 p-3">
              <Building2 className="mt-0.5 h-4 w-4 text-gray-600" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {payout.bankAccountInfo.bankName}
                </p>
                <p className="mt-1 truncate text-xs text-gray-600">
                  {formatIBAN(payout.bankAccountInfo.iban)}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {payout.bankAccountInfo.accountHolder}
                </p>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-2 border-l-2 border-gray-200 pl-4">
            {/* Requested */}
            <div className="flex items-center gap-2 text-sm">
              <div className="-ml-[25px] h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-gray-600">Talep:</span>
              <span className="font-medium">
                {formatDate(payout.requestedAt, 'FULL')}
              </span>
            </div>

            {/* Processed */}
            {payout.processedAt && (
              <div className="flex items-center gap-2 text-sm">
                <div className="-ml-[25px] h-2 w-2 rounded-full bg-yellow-500" />
                <span className="text-gray-600">İşleme Alındı:</span>
                <span className="font-medium">
                  {formatDate(payout.processedAt, 'FULL')}
                </span>
              </div>
            )}

            {/* Completed */}
            {payout.completedAt && (
              <div className="flex items-center gap-2 text-sm">
                <div className="-ml-[25px] h-2 w-2 rounded-full bg-green-500" />
                <span className="text-gray-600">Tamamlandı:</span>
                <span className="font-medium">
                  {formatDate(payout.completedAt, 'FULL')}
                </span>
              </div>
            )}

            {/* Cancelled */}
            {payout.cancelledAt && (
              <div className="flex items-center gap-2 text-sm">
                <div className="-ml-[25px] h-2 w-2 rounded-full bg-gray-500" />
                <span className="text-gray-600">İptal Edildi:</span>
                <span className="font-medium">
                  {formatDate(payout.cancelledAt, 'FULL')}
                </span>
              </div>
            )}

            {/* Estimated Arrival */}
            {payout.estimatedArrival &&
              payout.status === PayoutStatus.PROCESSING && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="-ml-[25px] h-2 w-2 rounded-full bg-gray-300" />
                  <span className="text-gray-600">Tahmini Varış:</span>
                  <span className="font-medium">
                    {formatDate(payout.estimatedArrival, 'FULL')}
                  </span>
                </div>
              )}
          </div>

          {/* Failure Reason */}
          {payout.status === PayoutStatus.FAILED && payout.failureReason && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-900">
                    Hata Nedeni
                  </p>
                  <p className="mt-1 text-xs text-red-700">
                    {payout.failureReason}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {payout.description && (
            <p className="text-sm text-gray-600 italic">
              &ldquo;{payout.description}&rdquo;
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PayoutHistory({
  payouts,
  isLoading = false,
  error,
  onCancel,
  onRefresh,
  onExport,
  className,
}: PayoutHistoryProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'ALL',
    search: '',
  });

  // Filter payouts
  const filteredPayouts = useMemo(() => {
    return payouts.filter((payout) => {
      // Status filter
      if (filters.status !== 'ALL' && payout.status !== filters.status) {
        return false;
      }

      // Date range filter
      if (filters.dateFrom) {
        const payoutDate = new Date(payout.requestedAt);
        const fromDate = new Date(filters.dateFrom);
        if (payoutDate < fromDate) return false;
      }

      if (filters.dateTo) {
        const payoutDate = new Date(payout.requestedAt);
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (payoutDate > toDate) return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesAmount = payout.amount.toString().includes(searchLower);
        const matchesBank = payout.bankAccountInfo?.bankName
          ?.toLowerCase()
          .includes(searchLower);
        const matchesIban = payout.bankAccountInfo?.iban
          ?.toLowerCase()
          .includes(searchLower);
        const matchesDescription = payout.description
          ?.toLowerCase()
          .includes(searchLower);

        return (
          matchesAmount || matchesBank || matchesIban || matchesDescription
        );
      }

      return true;
    });
  }, [payouts, filters]);

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-semibold text-red-900">Hata</p>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">Para Çekme Geçmişi</h2>
          <p className="mt-1 text-sm text-gray-600">
            Toplam {payouts.length} işlem bulundu
            {filteredPayouts.length < payouts.length &&
              ` (${filteredPayouts.length} gösteriliyor)`}
          </p>
        </div>
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onFiltersChange={setFilters}
        onExport={onExport}
        disabled={isLoading}
      />

      {/* Payout List */}
      {filteredPayouts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="py-12 text-center">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 font-semibold text-gray-900">
                Para Çekme İşlemi Bulunamadı
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {filters.status !== 'ALL' ||
                filters.search ||
                filters.dateFrom ||
                filters.dateTo
                  ? 'Filtrelere uygun işlem bulunamadı. Filtreleri değiştirin.'
                  : 'Henüz para çekme işlemi yapmadınız.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredPayouts.map((payout) => (
            <PayoutCard key={payout.id} payout={payout} onCancel={onCancel} />
          ))}
        </div>
      )}
    </div>
  );
}

export default PayoutHistory;
