/**
 * ================================================
 * PAYOUT HISTORY TABLE
 * ================================================
 * Display payout history with status and actions
 *
 * Sprint 14 - Payment & Payout System
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { usePayout } from '@/hooks/business/wallet/usePayout';
import type { Payout } from '@/lib/api/validators';

// ============================================================================
// TYPES
// ============================================================================

interface PayoutHistoryTableProps {
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function PayoutHistoryTable({
  className = '',
}: PayoutHistoryTableProps) {
  const { payouts, isLoading, error, cancel, canCancel, load } = usePayout();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  /**
   * Handle cancel payout
   */
  const handleCancel = async (payoutId: string) => {
    if (!confirm('Ödeme talebini iptal etmek istediğinizden emin misiniz?')) {
      return;
    }

    setCancellingId(payoutId);
    try {
      await cancel(payoutId);
      await load();
    } catch (err) {
      console.error('Cancel payout error:', err);
    } finally {
      setCancellingId(null);
    }
  };

  /**
   * Get status badge
   */
  const getStatusBadge = (status: Payout['status']) => {
    const badges = {
      PENDING: {
        icon: Clock,
        label: 'Bekliyor',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      },
      APPROVED: {
        icon: CheckCircle,
        label: 'Onaylandı',
        className: 'bg-blue-100 text-blue-800 border-blue-200',
      },
      PROCESSING: {
        icon: Loader2,
        label: 'İşleniyor',
        className: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      },
      COMPLETED: {
        icon: CheckCircle,
        label: 'Tamamlandı',
        className: 'bg-green-100 text-green-800 border-green-200',
      },
      CANCELLED: {
        icon: XCircle,
        label: 'İptal Edildi',
        className: 'bg-gray-100 text-gray-800 border-gray-200',
      },
      REJECTED: {
        icon: XCircle,
        label: 'Reddedildi',
        className: 'bg-red-100 text-red-800 border-red-200',
      },
      FAILED: {
        icon: AlertCircle,
        label: 'Başarısız',
        className: 'bg-red-100 text-red-800 border-red-200',
      },
    };

    const badge = badges[status];
    const Icon = badge.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
      >
        <Icon
          className={`h-3.5 w-3.5 ${status === 'PROCESSING' ? 'animate-spin' : ''}`}
        />
        {badge.label}
      </span>
    );
  };

  /**
   * Format currency
   */
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  /**
   * Format date
   */
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy HH:mm', { locale: tr });
  };

  if (isLoading && payouts.length === 0) {
    return (
      <div className={`rounded-lg border bg-white p-8 ${className}`}>
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
          <span className="text-muted-foreground text-sm">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`rounded-lg border border-red-200 bg-red-50 p-4 ${className}`}
      >
        <div className="flex items-center gap-2 text-sm text-red-800">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (payouts.length === 0) {
    return (
      <div className={`rounded-lg border bg-white p-8 ${className}`}>
        <div className="text-center">
          <DollarSign className="text-muted-foreground mx-auto h-12 w-12" />
          <h3 className="text-foreground mt-4 text-sm font-medium">
            Henüz ödeme talebi yok
          </h3>
          <p className="text-muted-foreground mt-1 text-sm">
            İlk ödeme talebinizi oluşturun
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border bg-white ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Tarih
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Tutar
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Banka Hesabı
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Durum
              </th>
              <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                Açıklama
              </th>
              <th className="text-muted-foreground px-4 py-3 text-right text-xs font-medium tracking-wider uppercase">
                İşlem
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {payouts.map((payout) => (
              <tr
                key={payout.id}
                className="hover:bg-muted/30 transition-colors"
              >
                <td className="text-foreground px-4 py-3 text-sm whitespace-nowrap">
                  {formatDate(payout.createdAt)}
                </td>
                <td className="text-foreground px-4 py-3 text-sm font-medium whitespace-nowrap">
                  {formatCurrency(payout.amount)}
                </td>
                <td className="text-muted-foreground px-4 py-3 text-sm">
                  {payout.paymentMethodDetails || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {getStatusBadge(payout.status)}
                </td>
                <td className="text-muted-foreground max-w-xs truncate px-4 py-3 text-sm">
                  {payout.description || '-'}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  {canCancel(payout) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancel(payout.id)}
                      disabled={cancellingId === payout.id}
                    >
                      {cancellingId === payout.id ? (
                        <>
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          İptal ediliyor...
                        </>
                      ) : (
                        'İptal Et'
                      )}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
