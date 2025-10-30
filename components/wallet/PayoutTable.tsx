import {
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Badge, Card, Button } from '@/components/ui';
import { formatCurrency } from '@/lib/shared/utils/format';
import type { Payout } from '@/lib/api/validators';

interface PayoutTableProps {
  payouts: Payout[];
  onPayoutClick?: (payout: Payout) => void;
  onCancelPayout?: (payoutId: string) => void;
  cancellingId?: string | null;
  emptyMessage?: string;
}

/**
 * Payout Table Component
 * Displays payout history with responsive design
 */
export function PayoutTable({
  payouts,
  onPayoutClick,
  onCancelPayout,
  cancellingId,
  emptyMessage = 'Çekim talebi bulunamadı',
}: PayoutTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: Payout['status']) => {
    const config: Record<
      Payout['status'],
      {
        variant:
          | 'default'
          | 'secondary'
          | 'success'
          | 'warning'
          | 'destructive';
        icon: React.ReactNode;
        label: string;
      }
    > = {
      PENDING: {
        variant: 'warning',
        icon: <Clock className="h-3 w-3" />,
        label: 'Bekliyor',
      },
      APPROVED: {
        variant: 'secondary',
        icon: <CheckCircle2 className="h-3 w-3" />,
        label: 'Onaylandı',
      },
      PROCESSING: {
        variant: 'secondary',
        icon: <Loader2 className="h-3 w-3 animate-spin" />,
        label: 'İşleniyor',
      },
      COMPLETED: {
        variant: 'success',
        icon: <CheckCircle2 className="h-3 w-3" />,
        label: 'Tamamlandı',
      },
      FAILED: {
        variant: 'destructive',
        icon: <AlertCircle className="h-3 w-3" />,
        label: 'Başarısız',
      },
      CANCELLED: {
        variant: 'default',
        icon: <XCircle className="h-3 w-3" />,
        label: 'İptal',
      },
    };

    const { variant, icon, label } = config[status];
    return (
      <Badge variant={variant} className="flex w-fit items-center gap-1">
        {icon}
        {label}
      </Badge>
    );
  };

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      BANK_TRANSFER: 'Banka Transferi',
      PAYPAL: 'PayPal',
      IYZICO: 'Iyzico',
    };
    return labels[method] || method;
  };

  if (payouts.length === 0) {
    return (
      <Card className="text-muted-foreground p-12 text-center">
        {emptyMessage}
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left font-medium">Tarih</th>
                  <th className="p-4 text-left font-medium">Tutar</th>
                  <th className="p-4 text-left font-medium">Yöntem</th>
                  <th className="p-4 text-left font-medium">Durum</th>
                  <th className="p-4 text-left font-medium">Açıklama</th>
                  <th className="p-4 text-right font-medium">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => (
                  <tr
                    key={payout.id}
                    className="hover:bg-muted/50 cursor-pointer border-b transition-colors"
                    onClick={() => onPayoutClick?.(payout)}
                  >
                    <td className="p-4">
                      <div className="text-sm">
                        {formatDate(payout.requestedAt)}
                      </div>
                      {payout.completedAt && (
                        <div className="text-muted-foreground text-xs">
                          Tamamlandı: {formatDate(payout.completedAt)}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold">
                        {formatCurrency(payout.amount, payout.currency)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {getMethodLabel(payout.method)}
                      </div>
                    </td>
                    <td className="p-4">{getStatusBadge(payout.status)}</td>
                    <td className="p-4">
                      <div className="text-muted-foreground max-w-xs truncate text-sm">
                        {payout.description || '-'}
                      </div>
                      {payout.failureReason && (
                        <div className="mt-1 text-xs text-red-600">
                          Hata: {payout.failureReason}
                        </div>
                      )}
                    </td>
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {payout.status === 'PENDING' && onCancelPayout && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onCancelPayout(payout.id);
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-3 md:hidden">
        {payouts.map((payout) => (
          <Card
            key={payout.id}
            className="hover:border-primary/50 cursor-pointer p-4 transition-colors"
            onClick={() => onPayoutClick?.(payout)}
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
              {getStatusBadge(payout.status)}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Yöntem:</span>
                <span>{getMethodLabel(payout.method)}</span>
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

            {payout.status === 'PENDING' && onCancelPayout && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onCancelPayout(payout.id);
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
    </div>
  );
}
