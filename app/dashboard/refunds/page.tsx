/**
 * ================================================
 * USER REFUNDS PAGE
 * ================================================
 * Page for users to view their refund requests
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created October 31, 2025
 */

'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Button, StatCard } from '@/components/ui';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  getMyRefunds,
  cancelRefund,
  canCancelRefund,
  getRefundReasonLabel,
  type RefundDto,
} from '@/lib/api/refunds';
import { toast } from 'sonner';
import {
  ArrowLeft,
  FileText,
  RefreshCw,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// PAGE COMPONENT
// ================================================

export default function UserRefundsPage() {
  const [refunds, setRefunds] = useState<RefundDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // ==================== DATA FETCHING ====================

  const fetchRefunds = async () => {
    setIsLoading(true);
    try {
      const data = await getMyRefunds();
      setRefunds(data);
    } catch (error) {
      logger.error('Failed to fetch user refunds', error instanceof Error ? error : new Error(String(error)), {
        component: 'UserRefundsPage',
        action: 'fetch-refunds',
      });
      toast.error('İade talepleri yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  // ==================== HANDLERS ====================

  const handleCancelRefund = async (refundId: string) => {
    if (!confirm('İade talebini iptal etmek istediğinizden emin misiniz?')) {
      return;
    }

    setCancellingId(refundId);
    try {
      await cancelRefund(refundId);
      toast.success('İade talebi iptal edildi');
      fetchRefunds();
    } catch (error) {
      logger.error('Failed to cancel refund request', error instanceof Error ? error : new Error(String(error)), {
        refundId,
        component: 'UserRefundsPage',
        action: 'cancel-refund',
      });
      toast.error('İade talebi iptal edilemedi');
    } finally {
      setCancellingId(null);
    }
  };

  // ==================== RENDER ====================

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/orders"
            className="text-muted-foreground hover:text-primary mb-2 inline-flex items-center text-sm"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Siparişlerime Dön
          </Link>
          <h1 className="text-3xl font-bold">İade Taleplerim</h1>
          <p className="text-muted-foreground mt-2">
            İade taleplerinizi görüntüleyin ve yönetin
          </p>
        </div>
        <Button variant="outline" onClick={fetchRefunds} disabled={isLoading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Yenile
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <StatCard
          label="Toplam Talep"
          value={refunds.length}
          color="blue"
          variant="compact"
          testId="stat-card-total"
        />
        <StatCard
          label="Beklemede"
          value={refunds.filter((r) => r.status === 'PENDING').length}
          color="yellow"
          variant="compact"
          testId="stat-card-pending"
        />
        <StatCard
          label="Onaylandı"
          value={
            refunds.filter(
              (r) => r.status === 'APPROVED' || r.status === 'PROCESSING'
            ).length
          }
          color="green"
          variant="compact"
          testId="stat-card-approved"
        />
        <StatCard
          label="Tamamlandı"
          value={refunds.filter((r) => r.status === 'COMPLETED').length}
          color="green"
          variant="compact"
          testId="stat-card-completed"
        />
      </div>

      {/* Refunds Table */}
      {refunds.length === 0 ? (
        <div className="bg-card flex flex-col items-center justify-center rounded-lg border p-12 text-center">
          <FileText className="text-muted-foreground mb-4 h-16 w-16" />
          <h3 className="mb-2 text-lg font-semibold">
            Henüz İade Talebiniz Yok
          </h3>
          <p className="text-muted-foreground mb-4">
            Bir siparişiniz için iade talebi oluşturduğunuzda burada
            görünecektir.
          </p>
          <Link href="/dashboard/orders">
            <Button>Siparişlerime Git</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-card overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sipariş No</TableHead>
                <TableHead>Tutar</TableHead>
                <TableHead>Neden</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Talep Tarihi</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {refunds.map((refund) => (
                <TableRow key={refund.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/dashboard/orders/${refund.orderId}`}
                      className="hover:text-primary"
                    >
                      #{refund.orderNumber || refund.orderId.slice(0, 8)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    ₺{refund.amount.toLocaleString('tr-TR')}
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-sm">
                      {getRefundReasonLabel(refund.reasonCategory)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      type="REFUND"
                      status={refund.status as any}
                      size="sm"
                      showIcon
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(refund.requestedAt), 'dd MMM yyyy', {
                      locale: tr,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/dashboard/refunds/${refund.id}`}>
                        <Button variant="ghost" size="sm">
                          Detay
                        </Button>
                      </Link>
                      {canCancelRefund(refund) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelRefund(refund.id)}
                          disabled={cancellingId === refund.id}
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          İptal
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Info Banner */}
      <div className="mt-6 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600" />
        <div className="text-sm text-blue-900">
          <p className="font-medium">İade Süreci Hakkında</p>
          <p className="mt-1 text-blue-700">
            İade talepleriniz yönetici onayına gönderilir. Onaylandıktan sonra
            ödeme gateway&apos;i üzerinden işleme alınır ve ödeme yönteminize
            iade edilir. Tüm süreç genellikle 3-5 iş günü içinde tamamlanır.
          </p>
        </div>
      </div>
    </div>
  );
}

// StatCard component now imported from @/components/ui
