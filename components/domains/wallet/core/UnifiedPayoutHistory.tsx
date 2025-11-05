/**
 * ============================================================================
 * UnifiedPayoutHistory Component
 * ============================================================================
 * Unified payout history display with variant support
 *
 * Sprint 1.3: Consolidates PayoutTable, PayoutHistoryTable, and PayoutHistory
 *
 * Variants:
 * - 'simple': Basic table with minimal features (replaces PayoutTable)
 * - 'advanced': Full features with filtering, sorting, pagination (replaces PayoutHistoryTable)
 *
 * Features:
 * - ✅ Two variants for different use cases
 * - ✅ Responsive design (desktop table + mobile cards)
 * - ✅ Status badges (using PayoutStatusBadge)
 * - ✅ Cancel payout action
 * - ✅ Loading/error/empty states
 * - ✅ Advanced: Filtering (status, method, search)
 * - ✅ Advanced: Sorting (date, amount)
 * - ✅ Advanced: Pagination
 * - ✅ Advanced: Export functionality
 * - ✅ Animations (framer-motion)
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 1.3
 * ============================================================================
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Download,
  Filter,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Building2,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { formatCurrency } from '@/lib/shared/utils/format';
import {
  PayoutStatus,
  PayoutMethod,
  type Payout,
} from '@/types/business/features/wallet';
import { formatDistanceToNow, format } from 'date-fns';
import { tr } from 'date-fns/locale';

// ============================================================================
// TYPES
// ============================================================================

export type PayoutHistoryVariant = 'simple' | 'advanced';

export interface UnifiedPayoutHistoryProps {
  /** Display variant */
  variant: PayoutHistoryVariant;

  /** List of payouts */
  payouts: Payout[];

  /** Loading state */
  isLoading?: boolean;

  /** Error message */
  error?: string | null;

  /** Callback when details clicked */
  onViewDetails?: (payout: Payout) => void;

  /** Callback when cancel clicked */
  onCancelPayout?: (payoutId: string) => Promise<void>;

  /** Callback when export clicked (advanced variant only) */
  onExport?: (filters: PayoutFilters) => void;

  /** Enable filtering (default: true for advanced, false for simple) */
  enableFiltering?: boolean;

  /** Enable sorting (default: true for advanced, false for simple) */
  enableSorting?: boolean;

  /** Enable pagination (default: true for advanced, false for simple) */
  enablePagination?: boolean;

  /** Enable export (default: true for advanced, false for simple) */
  enableExport?: boolean;

  /** Empty state message */
  emptyMessage?: string;

  /** Additional CSS classes */
  className?: string;

  /** ID of payout being cancelled (for loading state) */
  cancellingId?: string | null;
}

export interface PayoutFilters {
  status?: PayoutStatus;
  method?: PayoutMethod;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

type SortField = 'requestedAt' | 'amount';
type SortDirection = 'asc' | 'desc';

// ============================================================================
// CONSTANTS
// ============================================================================

const STATUS_CONFIG: Record<
  PayoutStatus,
  {
    label: string;
    icon: React.ReactNode;
  }
> = {
  [PayoutStatus.PENDING]: {
    label: 'Beklemede',
    icon: <Clock className="h-4 w-4" />,
  },
  [PayoutStatus.PROCESSING]: {
    label: 'İşleniyor',
    icon: <Clock className="h-4 w-4" />,
  },
  [PayoutStatus.COMPLETED]: {
    label: 'Tamamlandı',
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  [PayoutStatus.FAILED]: {
    label: 'Başarısız',
    icon: <XCircle className="h-4 w-4" />,
  },
  [PayoutStatus.CANCELLED]: {
    label: 'İptal Edildi',
    icon: <AlertCircle className="h-4 w-4" />,
  },
};

const METHOD_CONFIG: Record<
  PayoutMethod,
  { label: string; icon: React.ReactNode }
> = {
  [PayoutMethod.BANK_TRANSFER]: {
    label: 'Banka Transferi',
    icon: <Building2 className="h-4 w-4" />,
  },
  [PayoutMethod.IYZICO_PAYOUT]: {
    label: 'Iyzico',
    icon: <CreditCard className="h-4 w-4" />,
  },
  [PayoutMethod.WALLET_TRANSFER]: {
    label: 'Cüzdan',
    icon: <CreditCard className="h-4 w-4" />,
  },
};

const ITEMS_PER_PAGE = 10;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function UnifiedPayoutHistory({
  variant,
  payouts,
  isLoading = false,
  error = null,
  onViewDetails,
  onCancelPayout,
  onExport,
  enableFiltering,
  enableSorting,
  enablePagination,
  enableExport,
  emptyMessage = 'Çekim talebi bulunamadı',
  className = '',
  cancellingId = null,
}: UnifiedPayoutHistoryProps) {
  // Feature flags based on variant (memoized to prevent useMemo dependency issues)
  const features = useMemo(
    () => ({
      filtering: enableFiltering ?? variant === 'advanced',
      sorting: enableSorting ?? variant === 'advanced',
      pagination: enablePagination ?? variant === 'advanced',
      export: enableExport ?? variant === 'advanced',
    }),
    [enableFiltering, enableSorting, enablePagination, enableExport, variant]
  );

  // State
  const [filters, setFilters] = useState<PayoutFilters>({});
  const [sortField, setSortField] = useState<SortField>('requestedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and sort payouts
  const filteredPayouts = useMemo(() => {
    let result = [...payouts];

    // Apply filters (only in advanced mode)
    if (features.filtering) {
      result = result.filter((payout) => {
        // Status filter
        if (filters.status && payout.status !== filters.status) return false;

        // Method filter
        if (filters.method && payout.method !== filters.method) return false;

        // Date range filter
        if (
          filters.startDate &&
          new Date(payout.requestedAt) < filters.startDate
        )
          return false;
        if (filters.endDate && new Date(payout.requestedAt) > filters.endDate)
          return false;

        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            payout.id.toLowerCase().includes(query) ||
            payout.description?.toLowerCase().includes(query)
          );
        }

        return true;
      });
    }

    // Apply sorting
    if (features.sorting) {
      result.sort((a, b) => {
        const direction = sortDirection === 'asc' ? 1 : -1;

        if (sortField === 'requestedAt') {
          return (
            direction *
            (new Date(a.requestedAt).getTime() -
              new Date(b.requestedAt).getTime())
          );
        } else {
          return direction * (a.amount - b.amount);
        }
      });
    }

    return result;
  }, [payouts, filters, searchQuery, sortField, sortDirection, features]);

  // Pagination
  const totalPages = Math.ceil(filteredPayouts.length / ITEMS_PER_PAGE);
  const paginatedPayouts = features.pagination
    ? filteredPayouts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
      )
    : filteredPayouts;

  // Reset to page 1 when filters change
  useEffect(() => {
    if (features.pagination) {
      setCurrentPage(1);
    }
  }, [filters, searchQuery, sortField, sortDirection, features.pagination]);

  // Handle sort
  const handleSort = (field: SortField) => {
    if (!features.sorting) return;

    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Handle export
  const handleExport = () => {
    if (features.export && onExport) {
      onExport({ ...filters, search: searchQuery });
    }
  };

  // Handle cancel
  const handleCancel = async (payoutId: string) => {
    if (onCancelPayout) {
      await onCancelPayout(payoutId);
    }
  };

  // Render sort icon
  const renderSortIcon = (field: SortField) => {
    if (!features.sorting) return null;

    if (sortField !== field) {
      return <ArrowUpDown className="text-muted-foreground h-4 w-4" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy HH:mm', { locale: tr });
  };

  // Loading state
  if (isLoading && payouts.length === 0) {
    return (
      <Card className={`p-12 ${className}`}>
        <div className="text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Yükleniyor...</span>
        </div>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={`border-red-200 bg-red-50 p-4 ${className}`}>
        <div className="flex items-center gap-2 text-sm text-red-800">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      </Card>
    );
  }

  // Empty state
  if (payouts.length === 0) {
    return (
      <Card className={`text-muted-foreground p-12 text-center ${className}`}>
        <AlertCircle className="mx-auto mb-3 h-12 w-12 opacity-50" />
        <p className="mb-1 font-medium">{emptyMessage}</p>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header - Advanced variant only */}
      {features.filtering && (
        <div className="flex items-center justify-between gap-4">
          <div className="max-w-md flex-1">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Çekim ID veya açıklama ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Durum
                  {filters.status && (
                    <Badge variant="secondary" className="ml-2">
                      1
                    </Badge>
                  )}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, status: undefined }))
                  }
                >
                  Tümü
                </DropdownMenuItem>
                {Object.values(PayoutStatus).map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => setFilters((prev) => ({ ...prev, status }))}
                  >
                    <div className="flex items-center gap-2">
                      {STATUS_CONFIG[status].icon}
                      {STATUS_CONFIG[status].label}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Method Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Yöntem
                  {filters.method && (
                    <Badge variant="secondary" className="ml-2">
                      1
                    </Badge>
                  )}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, method: undefined }))
                  }
                >
                  Tümü
                </DropdownMenuItem>
                {Object.values(PayoutMethod).map((method) => (
                  <DropdownMenuItem
                    key={method}
                    onClick={() => setFilters((prev) => ({ ...prev, method }))}
                  >
                    <div className="flex items-center gap-2">
                      {METHOD_CONFIG[method].icon}
                      {METHOD_CONFIG[method].label}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Export Button */}
            {features.export && onExport && (
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Dışa Aktar
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Active Filters - Advanced variant only */}
      {features.filtering &&
        (filters.status || filters.method || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-sm">
              Aktif Filtreler:
            </span>
            {filters.status && (
              <Badge variant="secondary" className="gap-1">
                {STATUS_CONFIG[filters.status].label}
                <button
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, status: undefined }))
                  }
                  className="hover:bg-background/50 ml-1 rounded-full"
                >
                  ×
                </button>
              </Badge>
            )}
            {filters.method && (
              <Badge variant="secondary" className="gap-1">
                {METHOD_CONFIG[filters.method].label}
                <button
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, method: undefined }))
                  }
                  className="hover:bg-background/50 ml-1 rounded-full"
                >
                  ×
                </button>
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                Arama: {searchQuery}
                <button
                  onClick={() => setSearchQuery('')}
                  className="hover:bg-background/50 ml-1 rounded-full"
                >
                  ×
                </button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilters({});
                setSearchQuery('');
              }}
            >
              Tümünü Temizle
            </Button>
          </div>
        )}

      {/* Desktop Table */}
      <div className="hidden md:block">
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    {features.sorting ? (
                      <button
                        onClick={() => handleSort('requestedAt')}
                        className="hover:text-primary flex items-center gap-2 text-sm font-semibold transition-colors"
                      >
                        Tarih
                        {renderSortIcon('requestedAt')}
                      </button>
                    ) : (
                      <span className="text-sm font-semibold">Tarih</span>
                    )}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Durum
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Yöntem
                  </th>
                  <th className="px-4 py-3 text-right">
                    {features.sorting ? (
                      <button
                        onClick={() => handleSort('amount')}
                        className="hover:text-primary ml-auto flex items-center gap-2 text-sm font-semibold transition-colors"
                      >
                        Tutar
                        {renderSortIcon('amount')}
                      </button>
                    ) : (
                      <span className="text-sm font-semibold">Tutar</span>
                    )}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Açıklama
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading && payouts.length > 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <div className="text-muted-foreground flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Yenileniyor...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedPayouts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <div className="text-muted-foreground">
                        <AlertCircle className="mx-auto mb-3 h-12 w-12 opacity-50" />
                        <p className="mb-1 font-medium">Çekim bulunamadı</p>
                        <p className="text-sm">
                          {searchQuery || filters.status || filters.method
                            ? 'Filtrelere uygun çekim bulunamadı.'
                            : emptyMessage}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {paginatedPayouts.map((payout) => (
                      <motion.tr
                        key={payout.id}
                        initial={
                          variant === 'advanced' ? { opacity: 0, y: 10 } : false
                        }
                        animate={
                          variant === 'advanced' ? { opacity: 1, y: 0 } : {}
                        }
                        exit={
                          variant === 'advanced' ? { opacity: 0, y: -10 } : {}
                        }
                        className="hover:bg-muted/50 cursor-pointer border-t transition-colors"
                        onClick={() => onViewDetails?.(payout)}
                      >
                        <td className="px-4 py-3">
                          <div>
                            <div className="text-sm font-medium">
                              {variant === 'advanced'
                                ? format(
                                    new Date(payout.requestedAt),
                                    'dd MMM yyyy',
                                    { locale: tr }
                                  )
                                : formatDate(payout.requestedAt)}
                            </div>
                            {variant === 'advanced' && (
                              <div className="text-muted-foreground text-xs">
                                {formatDistanceToNow(
                                  new Date(payout.requestedAt),
                                  {
                                    addSuffix: true,
                                    locale: tr,
                                  }
                                )}
                              </div>
                            )}
                            {payout.completedAt && variant === 'simple' && (
                              <div className="text-muted-foreground text-xs">
                                Tamamlandı: {formatDate(payout.completedAt)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            type="PAYOUT"
                            status={payout.status as any}
                            showIcon={variant === 'advanced'}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-sm">
                            {METHOD_CONFIG[payout.method].icon}
                            {METHOD_CONFIG[payout.method].label}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="font-semibold">
                            {formatCurrency(payout.amount, payout.currency)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-muted-foreground max-w-[200px] truncate text-sm">
                            {payout.description || '-'}
                          </div>
                          {payout.failureReason && (
                            <div className="mt-1 text-xs text-red-600">
                              Hata: {payout.failureReason}
                            </div>
                          )}
                        </td>
                        <td
                          className="px-4 py-3 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-2">
                            {variant === 'advanced' && onViewDetails && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onViewDetails(payout)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            {payout.status === PayoutStatus.PENDING &&
                              onCancelPayout && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancel(payout.id);
                                  }}
                                  disabled={cancellingId === payout.id}
                                >
                                  {cancellingId === payout.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    'İptal Et'
                                  )}
                                </Button>
                              )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-3 md:hidden">
        {paginatedPayouts.map((payout) => (
          <Card
            key={payout.id}
            className="hover:border-primary/50 cursor-pointer p-4 transition-colors"
            onClick={() => onViewDetails?.(payout)}
          >
            <div className="mb-3 flex items-start justify-between">
              <div>
                <div className="text-lg font-semibold">
                  {formatCurrency(payout.amount, payout.currency)}
                </div>
                <div className="text-muted-foreground text-sm">
                  {formatDate(payout.requestedAt)}
                </div>
              </div>
              <StatusBadge
                type="PAYOUT"
                status={payout.status as any}
                showIcon
              />
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Yöntem:</span>
                <span>{METHOD_CONFIG[payout.method].label}</span>
              </div>
              {payout.description && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Açıklama:</span>
                  <span className="text-right">{payout.description}</span>
                </div>
              )}
              {payout.failureReason && (
                <div className="text-xs text-red-600">
                  Hata: {payout.failureReason}
                </div>
              )}
            </div>

            {payout.status === PayoutStatus.PENDING && onCancelPayout && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancel(payout.id);
                }}
                disabled={cancellingId === payout.id}
              >
                {cancellingId === payout.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    İptal Ediliyor...
                  </>
                ) : (
                  'İptal Et'
                )}
              </Button>
            )}
          </Card>
        ))}
      </div>

      {/* Pagination - Advanced variant only */}
      {features.pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground text-sm">
            Toplam {filteredPayouts.length} çekim
            {filteredPayouts.length !== payouts.length &&
              ` (${payouts.length} çekimden)`}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => {
                  // Show first, last, current, and adjacent pages
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={page}
                        variant={page === currentPage ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="min-w-[32px]"
                      >
                        {page}
                      </Button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <span key={page} className="text-muted-foreground px-1">
                        ...
                      </span>
                    );
                  }
                  return null;
                }
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
