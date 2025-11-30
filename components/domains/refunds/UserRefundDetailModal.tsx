'use client';

/**
 * ================================================
 * USER REFUND DETAIL MODAL
 * ================================================
 * Modal to display detailed refund information to users
 *
 * Features:
 * - Full refund details display
 * - Status timeline
 * - Admin response (if rejected)
 * - Order link
 * - Cancel action (if pending)
 * - Receipt/proof display
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 2 - User Refund Flow (Story 2.3)
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import { Alert, AlertDescription } from '@/components/ui';
import { useRefund, useRefundActions } from '@/hooks/business/useRefunds';
import { RefundDto, RefundStatus } from '@/types/business/features/refund';
import {
  RotateCcw,
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  ExternalLink,
  AlertCircle,
  Info,
  FileText,
  DollarSign,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import logger from '@/lib/infrastructure/monitoring/logger';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

// ================================================
// TYPES
// ================================================

export interface UserRefundDetailModalProps {
  /** Refund ID */
  refundId: string;
  /** Order ID (for API call) */
  orderId?: string;
  /** Modal open state */
  isOpen: boolean;
  /** Close modal callback */
  onClose: () => void;
  /** Cancel success callback */
  onCancelSuccess?: () => void;
}

// ================================================
// CONSTANTS
// ================================================

const STATUS_CONFIG: Record<
  RefundStatus,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    variant: 'default' | 'secondary' | 'destructive' | 'warning' | 'success';
    color: string;
    bgColor: string;
  }
> = {
  [RefundStatus.PENDING]: {
    label: 'Beklemede',
    icon: Clock,
    variant: 'warning',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50 border-orange-200',
  },
  [RefundStatus.APPROVED]: {
    label: 'Onaylandı',
    icon: CheckCircle,
    variant: 'success',
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
  },
  [RefundStatus.REJECTED]: {
    label: 'Reddedildi',
    icon: XCircle,
    variant: 'destructive',
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
  },
  [RefundStatus.CANCELLED]: {
    label: 'İptal Edildi',
    icon: Ban,
    variant: 'secondary',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50 border-gray-200',
  },
  [RefundStatus.PROCESSING]: {
    label: 'İşleniyor',
    icon: Clock,
    variant: 'default',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
  },
  [RefundStatus.COMPLETED]: {
    label: 'Tamamlandı',
    icon: CheckCircle,
    variant: 'success',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
  },
  [RefundStatus.FAILED]: {
    label: 'Başarısız',
    icon: XCircle,
    variant: 'destructive',
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
  },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(amount);
}

function formatDate(date: string | Date): string {
  return format(new Date(date), 'dd MMMM yyyy, HH:mm', { locale: tr });
}

// ================================================
// SUB-COMPONENTS
// ================================================

function StatusHeader({ refund }: { refund: RefundDto }) {
  const config = STATUS_CONFIG[refund.status];
  const Icon = config.icon;

  return (
    <div className={cn('rounded-lg border p-4', config.bgColor)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn('rounded-full bg-white p-2')}>
            <Icon className={cn('h-6 w-6', config.color)} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              İade Durumu: {config.label}
            </h3>
            <p className="text-sm text-gray-600">
              İade #{refund.id.slice(-12)}
            </p>
          </div>
        </div>
        <Badge variant={config.variant} className="text-sm">
          {config.label}
        </Badge>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start gap-3', className)}>
      <div className="rounded-md bg-gray-100 p-2">
        <Icon className="h-4 w-4 text-gray-600" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="text-base text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function RefundTimeline({ refund }: { refund: RefundDto }) {
  const events = [
    {
      label: 'Talep Oluşturuldu',
      date: refund.createdAt,
      status: 'completed',
    },
  ];

  if (refund.status === RefundStatus.APPROVED && refund.updatedAt) {
    events.push({
      label: 'Onaylandı',
      date: refund.updatedAt,
      status: 'completed',
    });
  }

  if (refund.status === RefundStatus.REJECTED && refund.updatedAt) {
    events.push({
      label: 'Reddedildi',
      date: refund.updatedAt,
      status: 'rejected',
    });
  }

  if (refund.status === RefundStatus.CANCELLED && refund.updatedAt) {
    events.push({
      label: 'İptal Edildi',
      date: refund.updatedAt,
      status: 'cancelled',
    });
  }

  if (refund.status === RefundStatus.COMPLETED && refund.updatedAt) {
    events.push({
      label: 'Tamamlandı',
      date: refund.updatedAt,
      status: 'completed',
    });
  }

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-gray-900">Süreç Takibi</h4>
      <div className="space-y-2">
        {events.map((event, index) => (
          <div key={index} className="flex items-start gap-3">
            <div
              className={cn(
                'mt-1 h-2 w-2 rounded-full',
                event.status === 'completed' && 'bg-green-500',
                event.status === 'rejected' && 'bg-red-500',
                event.status === 'cancelled' && 'bg-gray-500'
              )}
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{event.label}</p>
              <p className="text-xs text-gray-600">{formatDate(event.date)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-24 w-full" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

// ================================================
// MAIN COMPONENT
// ================================================

export function UserRefundDetailModal({
  refundId,
  orderId,
  isOpen,
  onClose,
  onCancelSuccess,
}: UserRefundDetailModalProps) {
  const { refund, isLoading, error } = useRefund(refundId);
  const { cancelRefund, isCanceling } = useRefundActions();

  const canCancel = refund?.status === RefundStatus.PENDING;

  const handleCancel = async () => {
    if (!refund || !orderId) return;

    try {
      logger.info('[UserRefundDetailModal] Canceling refund', { refundId });
      await cancelRefund(refundId, orderId || refund.orderId);
      logger.info('[UserRefundDetailModal] Refund canceled successfully');
      onCancelSuccess?.();
      onClose();
    } catch (err) {
      logger.error(
        '[UserRefundDetailModal] Failed to cancel refund',
        err as Error
      );
      // Error toast already shown by hook
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-orange-600" />
            İade Detayları
          </DialogTitle>
        </DialogHeader>

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              İade detayları yüklenirken bir hata oluştu. Lütfen tekrar deneyin.
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && <LoadingState />}

        {/* Content */}
        {!isLoading && !error && refund && (
          <div className="space-y-6">
            {/* Status Header */}
            <StatusHeader refund={refund} />

            {/* Amount & Order Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoRow
                icon={DollarSign}
                label="İade Tutarı"
                value={
                  <span className="text-xl font-bold text-green-600">
                    {formatCurrency(refund.amount)}
                  </span>
                }
              />
              <InfoRow
                icon={FileText}
                label="Sipariş"
                value={
                  <Link
                    href={`/dashboard/orders/${refund.orderId}`}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Sipariş #{refund.orderId.slice(-8)}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                }
              />
            </div>

            <hr className="my-4 border-gray-200" />

            {/* Reason & Description */}
            <div className="space-y-4">
              <InfoRow
                icon={Info}
                label="İade Nedeni"
                value={refund.reasonCategory}
              />
              {refund.description && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="mb-2 text-sm font-medium text-gray-700">
                    Açıklama:
                  </p>
                  <p className="text-sm whitespace-pre-wrap text-gray-900">
                    {refund.description}
                  </p>
                </div>
              )}
            </div>

            <hr className="my-4 border-gray-200" />

            {/* Dates */}
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoRow
                icon={Calendar}
                label="Oluşturulma Tarihi"
                value={formatDate(refund.createdAt)}
              />
              {refund.updatedAt && (
                <InfoRow
                  icon={Calendar}
                  label="Güncellenme Tarihi"
                  value={formatDate(refund.updatedAt)}
                />
              )}
            </div>

            {/* Admin Response (if rejected) */}
            {refund.status === RefundStatus.REJECTED &&
              refund.rejectionReason && (
                <>
                  <hr className="my-4 border-gray-200" />
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Yönetici Yanıtı:</strong>
                      <p className="mt-2">{refund.rejectionReason}</p>
                    </AlertDescription>
                  </Alert>
                </>
              )}

            {/* Timeline */}
            <hr className="my-4 border-gray-200" />
            <RefundTimeline refund={refund} />

            {/* Info Alert */}
            {refund.status === RefundStatus.PENDING && (
              <>
                <hr className="my-4 border-gray-200" />
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>Önemli:</strong> İade talebiniz yönetici tarafından
                    inceleniyor. Onaylandıktan sonra iade tutarı cüzdanınıza
                    veya orijinal ödeme yönteminize iade edilecektir.
                  </AlertDescription>
                </Alert>
              </>
            )}

            {refund.status === RefundStatus.APPROVED && (
              <>
                <hr className="my-4 border-gray-200" />
                <Alert
                  variant="default"
                  className="border-green-200 bg-green-50"
                >
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-sm text-green-800">
                    <strong>İade onaylandı!</strong> İade tutarı hesabınıza
                    yatırılacaktır. İşlem 3-5 iş günü sürebilir.
                  </AlertDescription>
                </Alert>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 border-t pt-4">
              <UnifiedButton variant="outline" onClick={onClose}>
                Kapat
              </UnifiedButton>

              {canCancel && (
                <UnifiedButton
                  variant="destructive"
                  onClick={handleCancel}
                  disabled={isCanceling}
                  loading={isCanceling}
                >
                  <Ban className="mr-2 h-4 w-4" />
                  {isCanceling ? 'İptal Ediliyor...' : 'İade Talebini İptal Et'}
                </UnifiedButton>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default UserRefundDetailModal;
