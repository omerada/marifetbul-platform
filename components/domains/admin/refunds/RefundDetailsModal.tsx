'use client';

/**
 * ================================================
 * REFUND DETAILS MODAL COMPONENT
 * ================================================
 * Modal to display detailed refund information
 * with approve/reject actions
 *
 * @author MarifetBul Development Team
 * @version 1.1.0
 * @updated November 5, 2025 - Enhanced with centralized types
 */

'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CheckCircle, XCircle, Package, AlertCircle, Play } from 'lucide-react';
import type { RefundDto } from '@/types/business/features/refund';
import {
  getRefundReasonLabel,
  getRefundMethodLabel,
  canApproveRefund,
  canRejectRefund,
  canProcessRefund,
} from '@/types/business/features/refund';

// ================================================
// TYPES
// ================================================

interface RefundDetailsModalProps {
  refund: RefundDto;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (refundId: string, notes?: string) => Promise<void>;
  onReject: (refundId: string, reason: string, notes?: string) => Promise<void>;
  onProcess?: (refundId: string) => Promise<void>;
}

// ================================================
// COMPONENT
// ================================================

export function RefundDetailsModal({
  refund,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onProcess,
}: RefundDetailsModalProps) {
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await onApprove(refund.id, adminNotes);
      setAdminNotes('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Lütfen red nedeni belirtin');
      return;
    }
    setIsProcessing(true);
    try {
      await onReject(refund.id, rejectionReason, adminNotes);
      setAdminNotes('');
      setRejectionReason('');
      setShowRejectForm(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcess = async () => {
    if (!onProcess) return;
    setIsProcessing(true);
    try {
      await onProcess(refund.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const canApprove = canApproveRefund(refund);
  const canReject = canRejectRefund(refund);
  const canProcess = canProcessRefund(refund) && onProcess;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            İade Talebi Detayları
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <StatusBadge status={refund.status} type="REFUND" />
            <span className="text-muted-foreground text-sm">
              Talep Tarihi:{' '}
              {format(new Date(refund.requestedAt), 'dd MMM yyyy HH:mm', {
                locale: tr,
              })}
            </span>
          </div>

          {/* Refund Information */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="mb-3 font-semibold">İade Bilgileri</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <InfoItem label="İade Tutarı" value={`₺${refund.amount}`} />
              <InfoItem label="Para Birimi" value={refund.currency} />
              <InfoItem
                label="İade Nedeni"
                value={getRefundReasonLabel(refund.reasonCategory)}
              />
              <InfoItem
                label="İade Yöntemi"
                value={
                  refund.refundMethod
                    ? getRefundMethodLabel(refund.refundMethod)
                    : '-'
                }
              />
            </div>
            {refund.description && (
              <div className="mt-3">
                <Label className="text-sm font-medium">Açıklama</Label>
                <p className="text-muted-foreground mt-1 text-sm">
                  {refund.description}
                </p>
              </div>
            )}
          </div>

          {/* Order Information */}
          {refund.order && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="mb-3 font-semibold">Sipariş Bilgileri</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <InfoItem
                  label="Sipariş No"
                  value={refund.order.orderNumber || '-'}
                />
                <InfoItem
                  label="Sipariş Tutarı"
                  value={`₺${refund.order.totalAmount}`}
                />
                {refund.order.buyer && (
                  <InfoItem
                    label="Alıcı"
                    value={`${refund.order.buyer.firstName} ${refund.order.buyer.lastName}`}
                  />
                )}
                {refund.order.seller && (
                  <InfoItem
                    label="Satıcı"
                    value={`${refund.order.seller.firstName} ${refund.order.seller.lastName}`}
                  />
                )}
              </div>
            </div>
          )}

          {/* Payment Gateway Info */}
          {refund.gatewayRefundId && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="mb-3 font-semibold">Ödeme Gateway Bilgileri</h3>
              <InfoItem
                label="Gateway İade ID"
                value={refund.gatewayRefundId}
              />
            </div>
          )}

          {/* Admin Actions History */}
          {(refund.approvedBy || refund.rejectedBy) && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="mb-3 font-semibold">Yönetici İşlemleri</h3>
              {refund.approvedBy && (
                <div className="mb-2">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Onaylayan:</span>{' '}
                    {refund.approvedBy}
                  </p>
                  {refund.approvedAt && (
                    <p className="text-muted-foreground text-xs">
                      {format(
                        new Date(refund.approvedAt),
                        'dd MMM yyyy HH:mm',
                        { locale: tr }
                      )}
                    </p>
                  )}
                </div>
              )}
              {refund.rejectedBy && (
                <div className="mb-2">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Reddeden:</span>{' '}
                    {refund.rejectedBy}
                  </p>
                  {refund.rejectedAt && (
                    <p className="text-muted-foreground text-xs">
                      {format(
                        new Date(refund.rejectedAt),
                        'dd MMM yyyy HH:mm',
                        { locale: tr }
                      )}
                    </p>
                  )}
                  {refund.rejectionReason && (
                    <p className="text-muted-foreground mt-1 text-sm">
                      Neden: {refund.rejectionReason}
                    </p>
                  )}
                </div>
              )}
              {refund.adminNotes && (
                <div className="mt-2">
                  <Label className="text-sm font-medium">Yönetici Notu</Label>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {refund.adminNotes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Failure Info */}
          {refund.failureReason && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-900">Hata Oluştu</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {refund.failureReason}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Reject Form */}
          {showRejectForm && canReject && (
            <div className="border-t pt-4">
              <Label htmlFor="rejectionReason">Red Nedeni *</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="İade talebini neden reddediyorsunuz?"
                className="mt-2"
                rows={3}
              />
            </div>
          )}

          {/* Admin Notes */}
          {(canApprove || canReject) && (
            <div>
              <Label htmlFor="adminNotes">Yönetici Notu (Opsiyonel)</Label>
              <Textarea
                id="adminNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Bu iade talebi hakkında not ekleyin..."
                className="mt-2"
                rows={3}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {canApprove && !showRejectForm && (
              <>
                <Button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Onayla
                </Button>
                <Button
                  onClick={() => setShowRejectForm(true)}
                  variant="destructive"
                  disabled={isProcessing}
                  className="flex-1"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reddet
                </Button>
              </>
            )}

            {showRejectForm && canReject && (
              <>
                <Button
                  onClick={handleReject}
                  variant="destructive"
                  disabled={isProcessing || !rejectionReason.trim()}
                  className="flex-1"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reddetmeyi Onayla
                </Button>
                <Button
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectionReason('');
                  }}
                  variant="outline"
                  disabled={isProcessing}
                  className="flex-1"
                >
                  İptal
                </Button>
              </>
            )}

            {canProcess && (
              <Button
                onClick={handleProcess}
                disabled={isProcessing}
                variant="secondary"
                className="flex-1"
              >
                <Play className="mr-2 h-4 w-4" />
                İşleme Al
              </Button>
            )}

            <Button
              onClick={onClose}
              variant="outline"
              disabled={isProcessing}
              className="flex-1"
            >
              Kapat
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ================================================
// HELPER COMPONENTS
// ================================================

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label className="text-muted-foreground text-xs">{label}</Label>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
