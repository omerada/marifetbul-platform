'use client';

import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import UnifiedButton from '@/components/ui/UnifiedButton';
import { Loader2, Search, RefreshCw, Eye, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { formatDistance } from 'date-fns';
import { tr } from 'date-fns/locale';

/**
 * Refund History List Component
 *
 * Displays user's refund request history with filters and pagination
 *
 * Features:
 * - Status badges with color coding
 * - Status filter
 * - Search by order number
 * - Date range filtering
 * - Pagination
 * - Refund details modal
 * - Real-time updates
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 2
 */

export interface RefundHistoryListProps {
  userId?: string;
  onViewDetails?: (refundId: string) => void;
}

export interface Refund {
  id: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  status: RefundStatus;
  reason: RefundReason;
  description: string;
  requestedAt: string;
  processedAt?: string;
  completedAt?: string;
  requesterName?: string;
  processorName?: string;
  adminNotes?: string;
  errorMessage?: string;
}

export type RefundStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED';

export type RefundReason =
  | 'ORDER_CANCELLED'
  | 'SERVICE_NOT_PROVIDED'
  | 'QUALITY_ISSUE'
  | 'LATE_DELIVERY'
  | 'DISPUTE_RESOLUTION'
  | 'OTHER';

const STATUS_CONFIG: Record<
  RefundStatus,
  { label: string; color: 'default' | 'warning' | 'success' | 'destructive' }
> = {
  PENDING: { label: 'Beklemede', color: 'warning' },
  APPROVED: { label: 'Onaylandı', color: 'default' },
  REJECTED: { label: 'Reddedildi', color: 'destructive' },
  PROCESSING: { label: 'İşleniyor', color: 'default' },
  COMPLETED: { label: 'Tamamlandı', color: 'success' },
  FAILED: { label: 'Başarısız', color: 'destructive' },
};

const REASON_LABELS: Record<RefundReason, string> = {
  ORDER_CANCELLED: 'Sipariş İptal Edildi',
  SERVICE_NOT_PROVIDED: 'Hizmet Verilmedi',
  QUALITY_ISSUE: 'Kalite Sorunu',
  LATE_DELIVERY: 'Geç Teslimat',
  DISPUTE_RESOLUTION: 'Anlaşmazlık Çözümü',
  OTHER: 'Diğer',
};

export default function RefundHistoryList({
  userId,
  onViewDetails,
}: RefundHistoryListProps) {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const loadRefunds = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: pageSize.toString(),
      });

      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const url = userId
        ? `/api/v1/refunds/my-refunds?${params}`
        : `/api/v1/refunds?${params}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('İade geçmişi yüklenemedi');
      }

      const data = await response.json();

      setRefunds(data.content || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Load refunds error:', err);
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRefunds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, statusFilter, currentPage]);

  const filteredRefunds = refunds.filter((refund) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        refund.orderNumber.toLowerCase().includes(query) ||
        refund.id.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const handleRefresh = () => {
    loadRefunds();
  };

  const handleViewDetails = (refundId: string) => {
    onViewDetails?.(refundId);
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>İade Geçmişi</CardTitle>
            <p className="text-muted-foreground mt-1 text-sm">
              İade taleplerinizi görüntüleyin ve takip edin
            </p>
          </div>
          <UnifiedButton
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            Yenile
          </UnifiedButton>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filters */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Ara</Label>
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                id="search"
                type="text"
                placeholder="Sipariş No veya İade ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status">Durum</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger placeholder="Tümü" />
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="PENDING">Beklemede</SelectItem>
                <SelectItem value="APPROVED">Onaylandı</SelectItem>
                <SelectItem value="PROCESSING">İşleniyor</SelectItem>
                <SelectItem value="COMPLETED">Tamamlandı</SelectItem>
                <SelectItem value="REJECTED">Reddedildi</SelectItem>
                <SelectItem value="FAILED">Başarısız</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : filteredRefunds.length === 0 ? (
          <div className="text-muted-foreground py-12 text-center">
            <p>İade talebi bulunamadı</p>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sipariş No</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Neden</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRefunds.map((refund) => (
                    <TableRow key={refund.id}>
                      <TableCell className="font-medium">
                        {refund.orderNumber}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">
                          ₺{refund.amount.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {REASON_LABELS[refund.reason]}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_CONFIG[refund.status].color}>
                          {STATUS_CONFIG[refund.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDistance(
                          new Date(refund.requestedAt),
                          new Date(),
                          {
                            addSuffix: true,
                            locale: tr,
                          }
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <UnifiedButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(refund.id)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Detay
                        </UnifiedButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-muted-foreground text-sm">
                  Sayfa {currentPage + 1} / {totalPages}
                </p>
                <div className="flex gap-2">
                  <UnifiedButton
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                  >
                    Önceki
                  </UnifiedButton>
                  <UnifiedButton
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
                    }
                    disabled={currentPage >= totalPages - 1}
                  >
                    Sonraki
                  </UnifiedButton>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
