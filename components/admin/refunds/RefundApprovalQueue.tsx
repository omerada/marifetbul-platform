/**
 * ================================================
 * REFUND APPROVAL QUEUE COMPONENT
 * ================================================
 * Table component to display refund list with filters
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created October 31, 2025
 */

'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type {
  RefundDto,
  RefundFilters,
  RefundStatus,
  RefundReasonCategory,
} from '@/lib/api/admin/refund-admin-api';

// ================================================
// TYPES
// ================================================

interface RefundApprovalQueueProps {
  refunds: RefundDto[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  filters: RefundFilters;
  selectedRefundIds: Set<string>;
  onRefundClick: (refund: RefundDto) => void;
  onPageChange: (page: number) => void;
  onFiltersChange: (filters: RefundFilters) => void;
  onSelectRefund: (refundId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
}

// ================================================
// COMPONENT
// ================================================

export function RefundApprovalQueue({
  refunds,
  isLoading,
  currentPage,
  totalPages,
  filters,
  selectedRefundIds,
  onRefundClick,
  onPageChange,
  onFiltersChange,
  onSelectRefund,
  onSelectAll,
}: RefundApprovalQueueProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    onFiltersChange({ ...filters, searchQuery, page: 0 });
  };

  const handleStatusFilter = (status: string) => {
    onFiltersChange({
      ...filters,
      status: status === 'ALL' ? undefined : (status as RefundStatus),
      page: 0,
    });
  };

  const handleReasonFilter = (reason: string) => {
    onFiltersChange({
      ...filters,
      reasonCategory:
        reason === 'ALL' ? undefined : (reason as RefundReasonCategory),
      page: 0,
    });
  };

  const allSelected =
    refunds.length > 0 && refunds.every((r) => selectedRefundIds.has(r.id));

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="bg-card flex flex-col gap-4 rounded-lg border p-4 md:flex-row md:items-center">
        {/* Search */}
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Sipariş No, Kullanıcı veya ID ile ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9"
            />
          </div>
          <Button onClick={handleSearch}>Ara</Button>
        </div>

        {/* Filter Toggle */}
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="w-full md:w-auto"
        >
          <Filter className="mr-2 h-4 w-4" />
          Filtreler
        </Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-card grid gap-4 rounded-lg border p-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="text-muted-foreground mb-2 block text-sm font-medium">
              Durum
            </label>
            <select
              value={filters.status || 'ALL'}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            >
              <option value="ALL">Tüm Durumlar</option>
              <option value="PENDING">Beklemede</option>
              <option value="APPROVED">Onaylandı</option>
              <option value="REJECTED">Reddedildi</option>
              <option value="PROCESSING">İşleniyor</option>
              <option value="COMPLETED">Tamamlandı</option>
              <option value="FAILED">Başarısız</option>
              <option value="CANCELLED">İptal Edildi</option>
            </select>
          </div>

          <div>
            <label className="text-muted-foreground mb-2 block text-sm font-medium">
              İade Nedeni
            </label>
            <select
              value={filters.reasonCategory || 'ALL'}
              onChange={(e) => handleReasonFilter(e.target.value)}
              className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            >
              <option value="ALL">Tüm Nedenler</option>
              <option value="BUYER_REQUEST">Alıcı Talebi</option>
              <option value="SELLER_CANCELLATION">Satıcı İptali</option>
              <option value="ORDER_NOT_DELIVERED">Teslim Edilmedi</option>
              <option value="PRODUCT_NOT_AS_DESCRIBED">
                Açıklamaya Uygun Değil
              </option>
              <option value="QUALITY_ISSUE">Kalite Sorunu</option>
              <option value="DUPLICATE_PAYMENT">Çift Ödeme</option>
              <option value="FRAUD_SUSPECTED">Dolandırıcılık</option>
              <option value="DISPUTE_RESOLUTION">Anlaşmazlık Çözümü</option>
              <option value="OTHER">Diğer</option>
            </select>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onChange={() => onSelectAll(!allSelected)}
                />
              </TableHead>
              <TableHead>Sipariş No</TableHead>
              <TableHead>Tutar</TableHead>
              <TableHead>Neden</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Talep Tarihi</TableHead>
              <TableHead className="text-right">İşlem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {refunds.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center">
                  <p className="text-muted-foreground">
                    Gösterilecek iade talebi bulunamadı
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              refunds.map((refund) => (
                <TableRow
                  key={refund.id}
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => onRefundClick(refund)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedRefundIds.has(refund.id)}
                      onChange={() =>
                        onSelectRefund(
                          refund.id,
                          !selectedRefundIds.has(refund.id)
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {refund.order?.orderNumber || '-'}
                  </TableCell>
                  <TableCell>
                    ₺{refund.amount.toLocaleString('tr-TR')}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {getReasonLabel(refund.reasonCategory)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge type="REFUND" status={refund.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(refund.requestedAt), 'dd MMM yyyy', {
                      locale: tr,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRefundClick(refund);
                      }}
                    >
                      Detay
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            Sayfa {currentPage + 1} / {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Önceki
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
            >
              Sonraki
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ================================================
// HELPER COMPONENTS
// ================================================

function getReasonLabel(reasonCategory: string): string {
  const reasons: Record<string, string> = {
    BUYER_REQUEST: 'Alıcı Talebi',
    SELLER_CANCELLATION: 'Satıcı İptali',
    ORDER_NOT_DELIVERED: 'Teslim Edilmedi',
    PRODUCT_NOT_AS_DESCRIBED: 'Açıklamaya Uygun Değil',
    QUALITY_ISSUE: 'Kalite Sorunu',
    DUPLICATE_PAYMENT: 'Çift Ödeme',
    FRAUD_SUSPECTED: 'Dolandırıcılık',
    DISPUTE_RESOLUTION: 'Anlaşmazlık',
    OTHER: 'Diğer',
  };
  return reasons[reasonCategory] || reasonCategory;
}

function LoadingSkeleton() {
  return (
    <div className="bg-card animate-pulse space-y-4 rounded-lg border p-4">
      <div className="h-10 rounded bg-gray-200" />
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 rounded bg-gray-200" />
        ))}
      </div>
    </div>
  );
}
