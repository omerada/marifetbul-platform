/**
 * ================================================
 * ADMIN PAYOUT APPROVAL DASHBOARD
 * ================================================
 * Admin interface for reviewing and approving payout requests
 *
 * Sprint 14 - Payment & Payout System
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  User,
  Calendar,
  FileText,
} from 'lucide-react';
import { Button, Input, Label } from '@/components/ui';
import { usePayoutAdmin } from '@/hooks/business/wallet/usePayout';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

interface AdminPayoutApprovalProps {
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AdminPayoutApproval({
  className = '',
}: AdminPayoutApprovalProps) {
  const {
    pendingPayouts,
    isLoading,
    error,
    load,
    approve,
    reject,
    canApprove,
  } = usePayoutAdmin();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');

  // Load pending payouts on mount
  useEffect(() => {
    load();
  }, [load]);

  /**
   * Handle approve payout
   */
  const handleApprove = async (payoutId: string) => {
    if (!confirm('Bu ödeme talebini onaylamak istediğinizden emin misiniz?')) {
      return;
    }

    setProcessingId(payoutId);
    try {
      await approve(payoutId, approvalNotes || undefined);
      setApprovalNotes('');
      await load();
    } catch (err) {
      logger.error('Approve payout error:', err instanceof Error ? err : new Error(String(err)));
    } finally {
      setProcessingId(null);
    }
  };

  /**
   * Handle reject payout
   */
  const handleReject = async (payoutId: string) => {
    if (!rejectReason.trim()) {
      alert('Lütfen red nedeni giriniz');
      return;
    }

    if (!confirm('Bu ödeme talebini reddetmek istediğinizden emin misiniz?')) {
      return;
    }

    setRejectingId(payoutId);
    try {
      await reject(payoutId, rejectReason);
      setRejectReason('');
      await load();
    } catch (err) {
      logger.error('Reject payout error:', err instanceof Error ? err : new Error(String(err)));
    } finally {
      setRejectingId(null);
    }
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

  if (isLoading && pendingPayouts.length === 0) {
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

  if (pendingPayouts.length === 0) {
    return (
      <div className={`rounded-lg border bg-white p-8 ${className}`}>
        <div className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          <h3 className="text-foreground mt-4 text-sm font-medium">
            Bekleyen ödeme talebi yok
          </h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Tüm ödeme talepleri işlendi
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="rounded-lg border bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Bekleyen Ödeme Talepleri</h2>
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
            {pendingPayouts.length} talep
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {pendingPayouts.map((payout) => (
          <div key={payout.id} className="rounded-lg border bg-white p-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <User className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm font-medium">
                    User ID: {payout.userId}
                  </span>
                </div>
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatDate(payout.createdAt)}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-foreground text-2xl font-bold">
                  {formatCurrency(payout.amount)}
                </div>
                <div className="text-muted-foreground mt-1 text-xs">
                  Talep edilen tutar
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="mt-4 grid gap-3 border-t pt-4">
              <div className="flex items-start gap-2">
                <DollarSign className="text-muted-foreground mt-0.5 h-4 w-4" />
                <div>
                  <div className="text-muted-foreground text-xs font-medium">
                    Ödeme Yöntemi
                  </div>
                  <div className="mt-0.5 text-sm">
                    {payout.paymentMethodDetails || 'Bilgi yok'}
                  </div>
                </div>
              </div>

              {payout.description && (
                <div className="flex items-start gap-2">
                  <FileText className="text-muted-foreground mt-0.5 h-4 w-4" />
                  <div>
                    <div className="text-muted-foreground text-xs font-medium">
                      Açıklama
                    </div>
                    <div className="mt-0.5 text-sm">{payout.description}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-3 border-t pt-4">
              {/* Approval Notes */}
              <div className="space-y-2">
                <Label htmlFor={`notes-${payout.id}`} className="text-xs">
                  Admin Notları (opsiyonel)
                </Label>
                <Input
                  id={`notes-${payout.id}`}
                  placeholder="Onay için notlar ekleyin..."
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  disabled={
                    processingId === payout.id || rejectingId === payout.id
                  }
                />
              </div>

              {/* Reject Reason */}
              {rejectingId === payout.id && (
                <div className="space-y-2">
                  <Label
                    htmlFor={`reason-${payout.id}`}
                    className="text-xs text-red-700"
                  >
                    Red Nedeni (zorunlu)
                  </Label>
                  <Input
                    id={`reason-${payout.id}`}
                    placeholder="Red nedenini giriniz..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                {canApprove(payout) && (
                  <>
                    <Button
                      onClick={() => handleApprove(payout.id)}
                      disabled={
                        processingId === payout.id || rejectingId === payout.id
                      }
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {processingId === payout.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Onaylanıyor...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Onayla
                        </>
                      )}
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={() => {
                        if (rejectingId === payout.id) {
                          handleReject(payout.id);
                        } else {
                          setRejectingId(payout.id);
                        }
                      }}
                      disabled={processingId === payout.id}
                      className="flex-1 border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                    >
                      {rejectingId === payout.id ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Reddi Onayla
                        </>
                      ) : (
                        <>
                          <XCircle className="mr-2 h-4 w-4" />
                          Reddet
                        </>
                      )}
                    </Button>

                    {rejectingId === payout.id && (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setRejectingId(null);
                          setRejectReason('');
                        }}
                      >
                        İptal
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
