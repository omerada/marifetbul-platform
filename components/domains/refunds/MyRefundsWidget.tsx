'use client';

/**
 * ================================================
 * MY REFUNDS WIDGET
 * ================================================
 * Dashboard widget to display user's refund requests
 *
 * Features:
 * - Recent refunds list
 * - Status badges
 * - Quick actions (view details, cancel)
 * - Loading states
 * - Empty state
 * - Real-time updates via SWR
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 2 - User Refund Flow (Story 2.2)
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui';
import { useMyRefunds, useRefundActions } from '@/hooks/business/useRefunds';
import { RefundDto, RefundStatus } from '@/types/business/features/refund';
import { UserRefundDetailModal } from './UserRefundDetailModal';
import {
  RotateCcw,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Ban,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import logger from '@/lib/infrastructure/monitoring/logger';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// ================================================
// TYPES
// ================================================

export interface MyRefundsWidgetProps {
  /** Maximum number of refunds to show */
  maxItems?: number;
  /** Show view all button */
  showViewAll?: boolean;
  /** View all link */
  viewAllLink?: string;
  /** Custom className */
  className?: string;
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
  }
> = {
  [RefundStatus.PENDING]: {
    label: 'Beklemede',
    icon: Clock,
    variant: 'warning',
    color: 'text-orange-600',
  },
  [RefundStatus.APPROVED]: {
    label: 'Onaylandı',
    icon: CheckCircle,
    variant: 'success',
    color: 'text-green-600',
  },
  [RefundStatus.REJECTED]: {
    label: 'Reddedildi',
    icon: XCircle,
    variant: 'destructive',
    color: 'text-red-600',
  },
  [RefundStatus.CANCELLED]: {
    label: 'İptal Edildi',
    icon: Ban,
    variant: 'secondary',
    color: 'text-gray-600',
  },
  [RefundStatus.PROCESSING]: {
    label: 'İşleniyor',
    icon: Clock,
    variant: 'default',
    color: 'text-blue-600',
  },
  [RefundStatus.COMPLETED]: {
    label: 'Tamamlandı',
    icon: CheckCircle,
    variant: 'success',
    color: 'text-blue-600',
  },
  [RefundStatus.FAILED]: {
    label: 'Başarısız',
    icon: XCircle,
    variant: 'destructive',
    color: 'text-red-600',
  },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(amount);
}

// ================================================
// SUB-COMPONENTS
// ================================================

function RefundStatusBadge({ status }: { status: RefundStatus }) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

function RefundCard({
  refund,
  onViewDetails,
  onCancel,
  isCanceling,
}: {
  refund: RefundDto;
  onViewDetails: (refund: RefundDto) => void;
  onCancel: (refundId: string) => void;
  isCanceling: boolean;
}) {
  const canCancel = refund.status === RefundStatus.PENDING;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <h4 className="font-semibold text-gray-900">
              İade #{refund.id.slice(-8)}
            </h4>
            <RefundStatusBadge status={refund.status} />
          </div>
          <p className="text-sm text-gray-600">
            Sipariş #{refund.orderId.slice(-8)}
          </p>
        </div>
        <p className="text-lg font-bold text-gray-900">
          {formatCurrency(refund.amount)}
        </p>
      </div>

      {/* Reason */}
      <div className="mb-3">
        <p className="line-clamp-2 text-sm text-gray-700">
          <span className="font-medium">Neden:</span> {refund.reasonCategory}
        </p>
        {refund.description && (
          <p className="mt-1 line-clamp-1 text-xs text-gray-500">
            {refund.description}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <p className="text-xs text-gray-500">
          {formatDistanceToNow(new Date(refund.createdAt), {
            addSuffix: true,
            locale: tr,
          })}
        </p>

        <div className="flex items-center gap-2">
          <UnifiedButton
            variant="ghost"
            size="xs"
            onClick={() => onViewDetails(refund)}
          >
            <Eye className="mr-1 h-3 w-3" />
            Detay
          </UnifiedButton>

          {canCancel && (
            <UnifiedButton
              variant="ghost"
              size="xs"
              onClick={() => onCancel(refund.id)}
              disabled={isCanceling}
              className="text-red-600 hover:text-red-700"
            >
              <Ban className="mr-1 h-3 w-3" />
              İptal
            </UnifiedButton>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="mb-3 flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <RotateCcw className="mb-4 h-12 w-12 text-gray-300" />
      <h3 className="mb-2 text-lg font-semibold text-gray-900">
        Henüz İade Talebiniz Yok
      </h3>
      <p className="max-w-sm text-sm text-gray-600">
        Siparişleriniz için iade talebi oluşturduğunuzda burada görünecektir.
      </p>
    </div>
  );
}

// ================================================
// MAIN COMPONENT
// ================================================

export function MyRefundsWidget({
  maxItems = 5,
  showViewAll = true,
  viewAllLink = '/dashboard/refunds',
  className,
}: MyRefundsWidgetProps) {
  const { refunds, isLoading, error } = useMyRefunds();
  const { cancelRefund, isCanceling } = useRefundActions();
  const [selectedRefund, setSelectedRefund] = React.useState<RefundDto | null>(
    null
  );

  const displayRefunds = refunds?.slice(0, maxItems) || [];

  const handleViewDetails = (refund: RefundDto) => {
    logger.info('[MyRefundsWidget] View refund details', {
      refundId: refund.id,
    });
    setSelectedRefund(refund);
  };

  const handleCancel = async (refundId: string) => {
    const refund = refunds?.find((r) => r.id === refundId);
    if (!refund) return;

    try {
      logger.info('[MyRefundsWidget] Canceling refund', { refundId });
      await cancelRefund(refundId, refund.orderId);
      logger.info('[MyRefundsWidget] Refund canceled successfully');
    } catch (err) {
      logger.error('[MyRefundsWidget] Failed to cancel refund', err as Error);
      // Error toast already shown by hook
    }
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <RotateCcw className="h-5 w-5 text-orange-600" />
          İade Taleplerim
        </CardTitle>
        {showViewAll && refunds && refunds.length > maxItems && (
          <Link href={viewAllLink}>
            <UnifiedButton variant="ghost" size="sm">
              Tümünü Gör
              <ArrowRight className="ml-1 h-4 w-4" />
            </UnifiedButton>
          </Link>
        )}
      </CardHeader>

      <CardContent>
        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              İade talepleri yüklenirken bir hata oluştu. Lütfen sayfayı
              yenileyin.
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && <LoadingSkeleton />}

        {/* Empty State */}
        {!isLoading && !error && displayRefunds.length === 0 && <EmptyState />}

        {/* Refunds List */}
        {!isLoading && !error && displayRefunds.length > 0 && (
          <div className="space-y-3">
            {displayRefunds.map((refund) => (
              <RefundCard
                key={refund.id}
                refund={refund}
                onViewDetails={handleViewDetails}
                onCancel={handleCancel}
                isCanceling={isCanceling}
              />
            ))}
          </div>
        )}

        {/* Total Count */}
        {!isLoading && refunds && refunds.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-600">
            Toplam {refunds.length} iade talebi
            {refunds.length > maxItems && ` (${maxItems} tanesi gösteriliyor)`}
          </div>
        )}
      </CardContent>

      {/* Refund Detail Modal */}
      {selectedRefund && (
        <UserRefundDetailModal
          refundId={selectedRefund.id}
          orderId={selectedRefund.orderId}
          open={!!selectedRefund}
          onClose={() => setSelectedRefund(null)}
          {...({} as any)}
        />
      )}
    </Card>
  );
}

export default MyRefundsWidget;
