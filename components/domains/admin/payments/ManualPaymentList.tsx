/**
 * ================================================
 * MANUAL PAYMENT LIST COMPONENT
 * ================================================
 * Displays list of manual payment proofs for admin
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 2 Story 2.3
 */

'use client';

import { Card } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui';
import { Eye, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/shared/formatters';
import type { ManualPaymentProofResponse } from '@/lib/api/admin-payments';

interface ManualPaymentListProps {
  payments: ManualPaymentProofResponse[];
  onViewProof: (payment: ManualPaymentProofResponse) => void;
  className?: string;
}

export function ManualPaymentList({
  payments,
  onViewProof,
  className = '',
}: ManualPaymentListProps) {
  const getStatusBadge = (status: string) => {
    const statusMap = {
      PENDING: { label: 'Beklemede', variant: 'warning' as const, icon: Clock },
      AUTO_VERIFIED: {
        label: 'Otomatik Onaylandı',
        variant: 'success' as const,
        icon: CheckCircle,
      },
      MANUALLY_VERIFIED: {
        label: 'Manuel Onaylandı',
        variant: 'success' as const,
        icon: CheckCircle,
      },
      REJECTED: {
        label: 'Reddedildi',
        variant: 'destructive' as const,
        icon: XCircle,
      },
      UNDER_REVIEW: {
        label: 'İnceleniyor',
        variant: 'secondary' as const,
        icon: AlertTriangle,
      },
    };

    const config =
      statusMap[status as keyof typeof statusMap] || statusMap.PENDING;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getConfirmationBadge = (status: string) => {
    const statusMap = {
      PENDING: { label: 'Bekliyor', variant: 'outline' as const },
      CONFIRMED: { label: 'Onaylandı', variant: 'success' as const },
      REJECTED: { label: 'Reddedildi', variant: 'destructive' as const },
      DISPUTED: { label: 'İtirazlı', variant: 'warning' as const },
    };

    const config =
      statusMap[status as keyof typeof statusMap] || statusMap.PENDING;

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (payments.length === 0) {
    return (
      <Card className={`p-8 text-center ${className}`}>
        <p className="text-muted-foreground">
          Bekleyen manuel ödeme kanıtı bulunmamaktadır.
        </p>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {payments.map((payment) => (
        <Card key={payment.id} className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              {/* Header */}
              <div className="flex items-center gap-3">
                <h3 className="font-semibold">
                  Sipariş #{payment.orderNumber}
                </h3>
                {getStatusBadge(payment.platformVerificationStatus)}
                {payment.disputed && (
                  <Badge
                    variant="destructive"
                    className="flex items-center gap-1"
                  >
                    <AlertTriangle className="h-3 w-3" />
                    İtirazlı
                  </Badge>
                )}
                {payment.fraudSuspected && (
                  <Badge
                    variant="destructive"
                    className="flex items-center gap-1"
                  >
                    <AlertTriangle className="h-3 w-3" />
                    Dolandırıcılık Şüphesi
                  </Badge>
                )}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <p className="text-muted-foreground text-sm">Ödeme Yapan</p>
                  <p className="font-medium">{payment.payerName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Tutar</p>
                  <p className="font-medium">
                    {formatCurrency(payment.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Ödeme Tarihi</p>
                  <p className="font-medium">
                    {formatDate(payment.paymentDate, 'DATETIME')}
                  </p>
                </div>
              </div>

              {/* Confirmation Status */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">Alıcı:</span>
                  {getConfirmationBadge(payment.buyerConfirmationStatus)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">Satıcı:</span>
                  {getConfirmationBadge(payment.sellerConfirmationStatus)}
                </div>
              </div>

              {/* Notes */}
              {payment.buyerNotes && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-muted-foreground mb-1 text-xs">
                    Alıcı Notu:
                  </p>
                  <p className="text-sm">{payment.buyerNotes}</p>
                </div>
              )}
              {payment.sellerNotes && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-muted-foreground mb-1 text-xs">
                    Satıcı Notu:
                  </p>
                  <p className="text-sm">{payment.sellerNotes}</p>
                </div>
              )}
              {payment.fraudReasons && (
                <div className="border-destructive bg-destructive/10 rounded-lg border p-3">
                  <p className="text-destructive mb-1 text-xs font-medium">
                    Dolandırıcılık Sebepleri:
                  </p>
                  <p className="text-destructive text-sm">
                    {payment.fraudReasons}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="ml-4">
              <Button
                onClick={() => onViewProof(payment)}
                variant="outline"
                size="sm"
              >
                <Eye className="mr-2 h-4 w-4" />
                İncele
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default ManualPaymentList;
