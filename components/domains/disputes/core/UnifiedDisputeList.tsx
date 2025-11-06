/**
 * UnifiedDisputeList Component
 *
 * Sprint 1.1: Dispute Component Consolidation
 * Replaces 3 duplicate DisputeList components with single unified component
 *
 * Features:
 * - 3 display variants: 'card', 'table', 'table-advanced'
 * - Built-in filtering and search
 * - Pagination support
 * - Loading and error states
 * - Responsive design
 * - Accessible and type-safe
 *
 * @version 1.0.0
 * @created November 5, 2025
 */

'use client';

import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  AlertCircle,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  Search,
  Download,
  RefreshCw,
} from 'lucide-react';

// UI Components
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/Select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { TableSkeleton } from '@/components/ui/loading/TableSkeleton';
import { ListSkeleton } from '@/components/ui/loading/ListSkeleton';

// Types
import type {
  DisputeResponse,
  DisputeStatus,
  DisputeReason,
} from '@/types/dispute';
import {
  disputeStatusLabels,
  disputeStatusColors,
  disputeReasonLabels,
} from '@/types/dispute';

// Existing DisputeCard component (reused)
import { DisputeCard } from '@/components/disputes/DisputeCard';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Display variant
 * - card: Grid of DisputeCard components (user-friendly)
 * - table: Simple table view (admin basic)
 * - table-advanced: Full table with filters & search (admin full)
 */
export type DisputeListVariant = 'card' | 'table' | 'table-advanced';

/**
 * Filter options
 */
export interface DisputeFilters {
  status?: DisputeStatus | '';
  reason?: DisputeReason | '';
  search?: string;
}

/**
 * Main component props
 */
export interface UnifiedDisputeListProps {
  /** Display variant */
  variant?: DisputeListVariant;

  /** Disputes to display */
  disputes?: DisputeResponse[];

  /** Loading state */
  isLoading?: boolean;

  /** Error message */
  error?: string | null;

  /** Show order info in cards */
  showOrder?: boolean;

  /** Show user info in cards */
  showUserInfo?: boolean;

  /** Pagination: total count */
  totalCount?: number;

  /** Pagination: current page (0-indexed) */
  currentPage?: number;

  /** Pagination: page size */
  pageSize?: number;

  /** Pagination handler */
  onPageChange?: (page: number) => void;

  /** View dispute handler */
  onViewDispute?: (disputeId: string) => void;

  /** Resolve dispute handler (admin only) */
  onResolveDispute?: (disputeId: string) => void;

  /** Export handler (admin only) */
  onExport?: () => void;

  /** Refresh handler */
  onRefresh?: () => void;

  /** Initial filters (for table-advanced) */
  initialFilters?: DisputeFilters;

  /** Custom className */
  className?: string;

  /** Custom empty state message */
  emptyMessage?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function UnifiedDisputeList({
  variant = 'card',
  disputes = [],
  isLoading = false,
  error = null,
  showOrder = false,
  showUserInfo = false,
  totalCount = 0,
  currentPage = 0,
  pageSize = 20,
  onPageChange,
  onViewDispute,
  onResolveDispute,
  onExport,
  onRefresh,
  initialFilters = {},
  className = '',
  emptyMessage,
}: UnifiedDisputeListProps) {
  // Local filter state (only used in table-advanced variant)
  const [filters, setFilters] = useState<DisputeFilters>(initialFilters);

  // Filter disputes based on filters (client-side filtering)
  const filteredDisputes = useMemo(() => {
    if (variant !== 'table-advanced') {
      return disputes;
    }

    return disputes.filter((dispute) => {
      // Status filter
      if (filters.status && dispute.status !== filters.status) {
        return false;
      }

      // Reason filter
      if (filters.reason && dispute.reason !== filters.reason) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          dispute.id.toLowerCase().includes(searchLower) ||
          dispute.raisedByUserFullName.toLowerCase().includes(searchLower) ||
          dispute.description.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [disputes, filters, variant]);

  // Pagination calculations
  const totalPages = Math.ceil(
    (totalCount || filteredDisputes.length) / pageSize
  );
  const hasFilters = filters.status || filters.reason || filters.search;

  // ============================================================================
  // RENDER: Loading State
  // ============================================================================

  if (isLoading) {
    if (variant === 'card') {
      return (
        <ListSkeleton
          variant="card"
          items={5}
          showActions={true}
          className={className}
        />
      );
    }
    return (
      <TableSkeleton
        rows={5}
        columns={6}
        showActions={true}
        className={className}
      />
    );
  }

  // ============================================================================
  // RENDER: Error State
  // ============================================================================

  if (error) {
    return (
      <div className={className}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'İtirazlar yüklenirken bir hata oluştu'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // ============================================================================
  // RENDER: Empty State
  // ============================================================================

  if (!filteredDisputes || filteredDisputes.length === 0) {
    return (
      <div className={`py-12 text-center ${className}`}>
        <AlertCircle className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
        <h3 className="mb-2 text-lg font-semibold">İtiraz Bulunamadı</h3>
        <p className="text-muted-foreground">
          {emptyMessage ||
            (hasFilters
              ? 'Filtrelere uygun itiraz bulunamadı'
              : 'Henüz hiç itiraz oluşturulmamış')}
        </p>
        {hasFilters && variant === 'table-advanced' && (
          <Button
            variant="outline"
            onClick={() => setFilters({})}
            className="mt-4"
          >
            Filtreleri Temizle
          </Button>
        )}
      </div>
    );
  }

  // ============================================================================
  // RENDER: Card Variant
  // ============================================================================

  if (variant === 'card') {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDisputes.map((dispute) => (
            <DisputeCard
              key={dispute.id}
              dispute={dispute}
              showOrder={showOrder}
              showUserInfo={showUserInfo}
            />
          ))}
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: Table Variant (Simple)
  // ============================================================================

  if (variant === 'table') {
    return (
      <div className={`space-y-4 ${className}`}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>İtirazlar ({filteredDisputes.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sipariş ID</TableHead>
                    <TableHead>İtiraz Eden</TableHead>
                    <TableHead>Neden</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Oluşturma Tarihi</TableHead>
                    <TableHead>Çözüm Tarihi</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDisputes.map((dispute) => (
                    <TableRow key={dispute.id}>
                      <TableCell className="font-medium">
                        {dispute.orderId.slice(0, 8)}...
                      </TableCell>
                      <TableCell>{dispute.raisedByUserFullName}</TableCell>
                      <TableCell>
                        <span className="text-muted-foreground text-sm">
                          {disputeReasonLabels[dispute.reason]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={disputeStatusColors[dispute.status]}>
                          {disputeStatusLabels[dispute.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(
                          new Date(dispute.createdAt),
                          'dd MMM yyyy HH:mm',
                          { locale: tr }
                        )}
                      </TableCell>
                      <TableCell>
                        {dispute.resolvedAt
                          ? format(
                              new Date(dispute.resolvedAt),
                              'dd MMM yyyy HH:mm',
                              { locale: tr }
                            )
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewDispute?.(dispute.id)}
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            Görüntüle
                          </Button>
                          {dispute.status !== 'RESOLVED' &&
                            dispute.status !== 'CLOSED' && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => onResolveDispute?.(dispute.id)}
                              >
                                Çözümle
                              </Button>
                            )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <div className="text-muted-foreground text-sm">
                  Sayfa {currentPage + 1} / {totalPages} ({totalCount} toplam)
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange?.(currentPage - 1)}
                    disabled={currentPage === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Önceki
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange?.(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                  >
                    Sonraki
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================================================
  // RENDER: Table Advanced Variant (Admin Full)
  // ============================================================================

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">İtiraz Yönetimi</h1>
          <p className="text-muted-foreground">
            Tüm itirazları yönetin ve çözümleyin
          </p>
        </div>
        <div className="flex gap-2">
          {onRefresh && (
            <Button variant="outline" onClick={onRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Yenile
            </Button>
          )}
          {onExport && (
            <Button variant="outline" onClick={onExport}>
              <Download className="mr-2 h-4 w-4" />
              Dışa Aktar
            </Button>
          )}
        </div>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrele</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Search */}
            <div>
              <label className="mb-2 block text-sm font-medium">Arama</label>
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                <Input
                  placeholder="ID, kullanıcı veya açıklama..."
                  value={filters.search || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium">Durum</label>
              <Select
                value={filters.status || ''}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    status: value as DisputeStatus | '',
                  })
                }
              >
                <SelectTrigger />
                <SelectContent>
                  <SelectItem value="">Tüm durumlar</SelectItem>
                  {Object.entries(disputeStatusLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reason Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium">Neden</label>
              <Select
                value={filters.reason || ''}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    reason: value as DisputeReason | '',
                  })
                }
              >
                <SelectTrigger />
                <SelectContent>
                  <SelectItem value="">Tüm nedenler</SelectItem>
                  {Object.entries(disputeReasonLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {hasFilters && (
            <div className="mt-4">
              <Button variant="ghost" size="sm" onClick={() => setFilters({})}>
                <Filter className="mr-2 h-4 w-4" />
                Filtreleri Temizle
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>İtirazlar ({filteredDisputes.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sipariş ID</TableHead>
                  <TableHead>İtiraz Eden</TableHead>
                  <TableHead>Neden</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Oluşturma Tarihi</TableHead>
                  <TableHead>Çözüm Tarihi</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDisputes.map((dispute) => (
                  <TableRow key={dispute.id}>
                    <TableCell className="font-medium">
                      {dispute.orderId.slice(0, 8)}...
                    </TableCell>
                    <TableCell>{dispute.raisedByUserFullName}</TableCell>
                    <TableCell>
                      <span className="text-muted-foreground text-sm">
                        {disputeReasonLabels[dispute.reason]}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={disputeStatusColors[dispute.status]}>
                        {disputeStatusLabels[dispute.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(
                        new Date(dispute.createdAt),
                        'dd MMM yyyy HH:mm',
                        { locale: tr }
                      )}
                    </TableCell>
                    <TableCell>
                      {dispute.resolvedAt
                        ? format(
                            new Date(dispute.resolvedAt),
                            'dd MMM yyyy HH:mm',
                            { locale: tr }
                          )
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewDispute?.(dispute.id)}
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          Görüntüle
                        </Button>
                        {dispute.status !== 'RESOLVED' &&
                          dispute.status !== 'CLOSED' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => onResolveDispute?.(dispute.id)}
                            >
                              Çözümle
                            </Button>
                          )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <div className="text-muted-foreground text-sm">
                Sayfa {currentPage + 1} / {totalPages} ({totalCount} toplam)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Önceki
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange?.(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                >
                  Sonraki
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default UnifiedDisputeList;
