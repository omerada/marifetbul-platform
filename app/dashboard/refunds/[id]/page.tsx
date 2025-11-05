/**
 * ================================================
 * USER REFUND DETAIL PAGE
 * ================================================
 * Detailed view of a single refund request
 *
 * Features:
 * - Refund information display
 * - Timeline visualization
 * - Order information link
 * - Status tracking
 * - Cancel option (if pending)
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 5, 2025
 * Sprint: Refund System Completion - Day 1.1
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  DollarSign,
  User,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import { Button, Loading } from '@/components/ui';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getRefundById, cancelRefund } from '@/lib/api/refunds';
import {
  type RefundDto,
  getRefundStatusLabel,
  getRefundReasonLabel,
  getRefundMethodLabel,
  getRefundStatusColor,
  canCancelRefund,
  isRefundFinal,
} from '@/types/business/features/refund';
import { logger } from '@/lib/shared/utils/logger';

// ================================================
// COMPONENT
// ================================================

export default function RefundDetailPage() {
  const router = useRouter();
  const params = useParams();
  const refundId = params?.id as string;

  const [refund, setRefund] = useState<RefundDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  // Load refund details
  useEffect(() => {
    if (!refundId) return;

    const loadRefund = async () => {
      setIsLoading(true);
      try {
        const data = await getRefundById(refundId);
        setRefund(data);
      } catch (error) {
        logger.error('Failed to load refund:', error as Error);
        toast.error('İade bilgileri yüklenemedi');
      } finally {
        setIsLoading(false);
      }
    };

    loadRefund();
  }, [refundId]);

  // Handle refund cancellation
  const handleCancel = async () => {
    if (!refund) return;

    const confirmed = window.confirm(
      'İade talebini iptal etmek istediğinizden emin misiniz? Bu işlem geri alınamaz.'
    );

    if (!confirmed) return;

    setIsCancelling(true);
    try {
      await cancelRefund(refund.id);
      toast.success('İade talebi iptal edildi');
      router.push('/dashboard/refunds');
    } catch (error) {
      logger.error('Failed to cancel refund:', error as Error);
      toast.error('İade talebi iptal edilemedi');
    } finally {
      setIsCancelling(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading size="lg" text="İade bilgileri yükleniyor..." />
      </div>
    );
  }

  // Not found state
  if (!refund) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Card className="p-12 text-center">
          <AlertCircle className="mx-auto h-16 w-16 text-gray-400" />
          <h2 className="mt-4 text-xl font-semibold">İade Talebi Bulunamadı</h2>
          <p className="text-muted-foreground mt-2">
            Aradığınız iade talebi bulunamadı veya erişim yetkiniz yok.
          </p>
          <Link href="/dashboard/refunds">
            <Button variant="primary" className="mt-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              İade Taleplerime Dön
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/refunds"
          className="text-muted-foreground hover:text-primary mb-2 inline-flex items-center text-sm"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          İade Taleplerime Dön
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">İade Talebi Detayı</h1>
            <p className="text-muted-foreground mt-2">
              Talep No: {refund.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <Badge className={getRefundStatusColor(refund.status)}>
            {getRefundStatusLabel(refund.status)}
          </Badge>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Refund Information */}
          <Card className="p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <FileText className="h-5 w-5 text-blue-600" />
              İade Bilgileri
            </h2>

            <div className="space-y-4">
              <InfoRow
                icon={DollarSign}
                label="İade Tutarı"
                value={`₺${refund.amount.toLocaleString('tr-TR')}`}
                highlight
              />
              <InfoRow
                icon={CreditCard}
                label="Para Birimi"
                value={refund.currency}
              />
              <InfoRow
                icon={AlertTriangle}
                label="İade Nedeni"
                value={getRefundReasonLabel(refund.reasonCategory)}
              />
              {refund.refundMethod && (
                <InfoRow
                  icon={Package}
                  label="İade Yöntemi"
                  value={getRefundMethodLabel(refund.refundMethod)}
                />
              )}
            </div>

            {refund.description && (
              <div className="mt-4 rounded-lg bg-gray-50 p-4">
                <h4 className="mb-2 text-sm font-medium text-gray-700">
                  Açıklama
                </h4>
                <p className="text-sm text-gray-600">{refund.description}</p>
              </div>
            )}
          </Card>

          {/* Order Information */}
          <Card className="p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Package className="h-5 w-5 text-purple-600" />
              Sipariş Bilgileri
            </h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sipariş No</span>
                <Link
                  href={`/dashboard/orders/${refund.orderId}`}
                  className="hover:text-primary font-medium text-blue-600 transition-colors"
                >
                  {refund.orderNumber || `#${refund.orderId.slice(0, 8)}`}
                </Link>
              </div>
              {refund.order && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Sipariş Tutarı
                    </span>
                    <span className="font-medium">
                      ₺{refund.order.totalAmount.toLocaleString('tr-TR')}
                    </span>
                  </div>
                  {refund.order.seller && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Satıcı</span>
                      <Link
                        href={`/profile/${refund.order.seller.id}`}
                        className="hover:text-primary font-medium text-blue-600 transition-colors"
                      >
                        {refund.order.seller.firstName}{' '}
                        {refund.order.seller.lastName}
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>

          {/* Admin Notes (if any) */}
          {refund.adminNotes && (
            <Card className="border-blue-200 bg-blue-50 p-6">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-blue-900">
                <User className="h-5 w-5" />
                Yönetici Notu
              </h2>
              <p className="text-sm text-blue-800">{refund.adminNotes}</p>
            </Card>
          )}

          {/* Rejection Reason */}
          {refund.rejectionReason && (
            <Card className="border-red-200 bg-red-50 p-6">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-red-900">
                <XCircle className="h-5 w-5" />
                Red Nedeni
              </h2>
              <p className="text-sm text-red-800">{refund.rejectionReason}</p>
            </Card>
          )}

          {/* Failure Info */}
          {refund.failureReason && (
            <Card className="border-red-200 bg-red-50 p-6">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-red-900">
                <AlertCircle className="h-5 w-5" />
                Hata Bilgisi
              </h2>
              <p className="text-sm text-red-800">{refund.failureReason}</p>
            </Card>
          )}
        </div>

        {/* Right Column - Timeline & Actions */}
        <div className="space-y-6">
          {/* Timeline */}
          <Card className="p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Clock className="h-5 w-5 text-gray-600" />
              Süreç Takibi
            </h2>

            <RefundTimeline refund={refund} />
          </Card>

          {/* Actions */}
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold">İşlemler</h2>
            <div className="space-y-3">
              <Link href={`/dashboard/orders/${refund.orderId}`}>
                <Button variant="outline" className="w-full">
                  <Package className="mr-2 h-4 w-4" />
                  Siparişe Git
                </Button>
              </Link>

              {canCancelRefund(refund) && (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleCancel}
                  disabled={isCancelling}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  {isCancelling ? 'İptal Ediliyor...' : 'Talebi İptal Et'}
                </Button>
              )}

              {isRefundFinal(refund) && (
                <div className="rounded-lg bg-gray-50 p-3 text-center text-sm text-gray-600">
                  İade talebi sonuçlandı
                </div>
              )}
            </div>
          </Card>

          {/* Help Card */}
          <Card className="border-blue-200 bg-blue-50 p-6">
            <h3 className="mb-2 font-semibold text-blue-900">
              Yardıma mı ihtiyacınız var?
            </h3>
            <p className="mb-4 text-sm text-blue-800">
              İade süreciniz hakkında sorularınız varsa destek ekibimizle
              iletişime geçebilirsiniz.
            </p>
            <Link href="/support">
              <Button variant="outline" size="sm" className="w-full">
                Destek Talebi Oluştur
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ================================================
// HELPER COMPONENTS
// ================================================

interface InfoRowProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  highlight?: boolean;
}

function InfoRow({ icon: Icon, label, value, highlight }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
      <div className="flex items-center gap-2 text-gray-600">
        <Icon className="h-4 w-4" />
        <span className="text-sm">{label}</span>
      </div>
      <span
        className={`font-medium ${highlight ? 'text-lg text-blue-600' : ''}`}
      >
        {value}
      </span>
    </div>
  );
}

interface TimelineItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  date?: string;
  isActive: boolean;
  isCompleted: boolean;
}

function TimelineItem({
  icon: Icon,
  label,
  date,
  isActive,
  isCompleted,
}: TimelineItemProps) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${
            isCompleted
              ? 'bg-green-100 text-green-600'
              : isActive
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-400'
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="mt-2 h-full w-px bg-gray-200 last:hidden" />
      </div>
      <div className="flex-1 pb-6">
        <p
          className={`font-medium ${
            isCompleted || isActive ? 'text-gray-900' : 'text-gray-500'
          }`}
        >
          {label}
        </p>
        {date && (
          <p className="mt-1 text-xs text-gray-500">
            {format(new Date(date), 'dd MMMM yyyy, HH:mm', { locale: tr })}
          </p>
        )}
      </div>
    </div>
  );
}

function RefundTimeline({ refund }: { refund: RefundDto }) {
  const timeline = [
    {
      icon: FileText,
      label: 'Talep Oluşturuldu',
      date: refund.requestedAt,
      isCompleted: true,
      isActive: false,
    },
    {
      icon: Clock,
      label: 'Onay Bekleniyor',
      date: undefined,
      isCompleted: !!refund.approvedAt || !!refund.rejectedAt,
      isActive: !refund.approvedAt && !refund.rejectedAt,
    },
    {
      icon: refund.rejectedAt ? XCircle : CheckCircle,
      label: refund.rejectedAt ? 'Reddedildi' : 'Onaylandı',
      date: refund.approvedAt || refund.rejectedAt,
      isCompleted: !!(refund.approvedAt || refund.rejectedAt),
      isActive: false,
    },
  ];

  // Add processing step if approved
  if (refund.approvedAt && !refund.rejectedAt) {
    timeline.push({
      icon: Package,
      label: 'İşleme Alındı',
      date: refund.processedAt,
      isCompleted: !!refund.processedAt,
      isActive: !refund.processedAt && !refund.completedAt,
    });

    timeline.push({
      icon: CheckCircle,
      label: 'Tamamlandı',
      date: refund.completedAt,
      isCompleted: !!refund.completedAt,
      isActive: false,
    });
  }

  return (
    <div className="space-y-0">
      {timeline.map((item, index) => (
        <TimelineItem key={index} {...item} />
      ))}
    </div>
  );
}
