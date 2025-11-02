/**
 * ============================================================================
 * PayoutHistory Component
 * ============================================================================
 * Purpose: Display payout history with filtering, sorting, and status tracking
 * Features:
 * - Status filtering (PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED)
 * - Date range filtering
 * - Sorting by date/amount
 * - Status badges with colors
 * - Pagination
 * - Export functionality
 * - Details view
 *
 * Part of: Sprint 1 Days 6-7 (Payout System UI)
 * ============================================================================
 */

'use client';

import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
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

export interface PayoutHistoryProps {
  /** List of payouts */
  payouts: Payout[];
  /** Loading state */
  isLoading?: boolean;
  /** Callback when details clicked */
  onViewDetails?: (payout: Payout) => void;
  /** Callback when export clicked */
  onExport?: (filters: PayoutFilters) => void;
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
    variant: 'default' | 'secondary' | 'success' | 'destructive' | 'warning';
  }
> = {
  [PayoutStatus.PENDING]: {
    label: 'Beklemede',
    icon: <Clock className="h-4 w-4" />,
    variant: 'warning',
  },
  [PayoutStatus.PROCESSING]: {
    label: 'İşleniyor',
    icon: <Clock className="h-4 w-4" />,
    variant: 'default',
  },
  [PayoutStatus.COMPLETED]: {
    label: 'Tamamlandı',
    icon: <CheckCircle2 className="h-4 w-4" />,
    variant: 'success',
  },
  [PayoutStatus.FAILED]: {
    label: 'Başarısız',
    icon: <XCircle className="h-4 w-4" />,
    variant: 'destructive',
  },
  [PayoutStatus.CANCELLED]: {
    label: 'İptal Edildi',
    icon: <AlertCircle className="h-4 w-4" />,
    variant: 'secondary',
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

export function PayoutHistory({
  payouts,
  isLoading = false,
  onViewDetails,
  onExport,
}: PayoutHistoryProps) {
  // State
  const [filters, setFilters] = useState<PayoutFilters>({});
  const [sortField, setSortField] = useState<SortField>('requestedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and sort payouts
  const filteredPayouts = payouts
    .filter((payout) => {
      // Status filter
      if (filters.status && payout.status !== filters.status) return false;

      // Method filter
      if (filters.method && payout.method !== filters.method) return false;

      // Date range filter
      if (filters.startDate && new Date(payout.requestedAt) < filters.startDate)
        return false;
      if (filters.endDate && new Date(payout.requestedAt) > filters.endDate)
        return false;

      // Search filter (by ID or description)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          payout.id.toLowerCase().includes(query) ||
          payout.description?.toLowerCase().includes(query)
        );
      }

      return true;
    })
    .sort((a, b) => {
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

  // Pagination
  const totalPages = Math.ceil(filteredPayouts.length / ITEMS_PER_PAGE);
  const paginatedPayouts = filteredPayouts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchQuery, sortField, sortDirection]);

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Handle export
  const handleExport = () => {
    onExport?.({ ...filters, search: searchQuery });
  };

  // Render sort icon
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="text-muted-foreground h-4 w-4" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
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
          {onExport && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Dışa Aktar
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {(filters.status || filters.method || searchQuery) && (
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

      {/* Table */}
      <div className="overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('requestedAt')}
                    className="hover:text-primary flex items-center gap-2 text-sm font-semibold transition-colors"
                  >
                    Tarih
                    {renderSortIcon('requestedAt')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Durum
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Yöntem
                </th>
                <th className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleSort('amount')}
                    className="hover:text-primary ml-auto flex items-center gap-2 text-sm font-semibold transition-colors"
                  >
                    Tutar
                    {renderSortIcon('amount')}
                  </button>
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
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="text-muted-foreground flex items-center justify-center gap-2">
                      <div className="border-primary h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
                      <span>Yükleniyor...</span>
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
                          : 'Henüz hiç çekim talebiniz yok.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {paginatedPayouts.map((payout) => (
                    <motion.tr
                      key={payout.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="hover:bg-muted/30 border-t transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-sm font-medium">
                            {format(
                              new Date(payout.requestedAt),
                              'dd MMM yyyy',
                              { locale: tr }
                            )}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {formatDistanceToNow(new Date(payout.requestedAt), {
                              addSuffix: true,
                              locale: tr,
                            })}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={STATUS_CONFIG[payout.status].variant}
                          className="gap-1"
                        >
                          {STATUS_CONFIG[payout.status].icon}
                          {STATUS_CONFIG[payout.status].label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm">
                          {METHOD_CONFIG[payout.method].icon}
                          {METHOD_CONFIG[payout.method].label}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-semibold">
                          {formatCurrency(payout.amount)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-muted-foreground max-w-[200px] truncate text-sm">
                          {payout.description || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {onViewDetails && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewDetails(payout)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
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
