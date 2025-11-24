/**
 * ================================================
 * PAYMENT ACTION MODAL COMPONENT
 * ================================================
 * Modal for approving/rejecting manual payment proofs
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 2 Story 2.3
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/shared/formatters';
import type { ManualPaymentProofResponse } from '@/lib/api/admin-payments';

interface PaymentActionModalProps {
  payment: ManualPaymentProofResponse | null;
  open: boolean;
  onClose: () => void;
  onApprove: (proofId: string, notes: string) => Promise<void>;
  onReject: (proofId: string, notes: string) => Promise<void>;
  onMarkFraud: (proofId: string, reasons: string) => Promise<void>;
}

export function PaymentActionModal({
  payment,
  open,
  onClose,
  onApprove,
  onReject,
  onMarkFraud,
}: PaymentActionModalProps) {
  const [notes, setNotes] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | 'fraud' | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!payment) return null;

  const handleSubmit = async () => {
    if (!action || !payment) return;

    setIsSubmitting(true);
    try {
      if (action === 'approve') {
        await onApprove(payment.id, notes);
      } else if (action === 'reject') {
        await onReject(payment.id, notes);
      } else if (action === 'fraud') {
        await onMarkFraud(payment.id, notes);
      }
      handleClose();
    } catch (_error) {
      // Error handling is done in parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setNotes('');
    setAction(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ödeme Kanıtı İnceleme</DialogTitle>
          <DialogDescription>
            Sipariş #{payment.orderNumber} için ödeme kanıtını inceleyin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Proof Image */}
          <div className="bg-muted rounded-lg p-4">
            <Label className="mb-2 block">Ödeme Dekontu</Label>
            <a
              href={payment.proofFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Image
                src={payment.proofFileUrl}
                alt="Payment Proof"
                width={600}
                height={800}
                className="h-auto w-full max-w-lg rounded border object-contain"
              />
            </a>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground text-sm">Tutar</Label>
              <p className="font-semibold">{formatCurrency(payment.amount)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-sm">
                Ödeme Tarihi
              </Label>
              <p className="font-semibold">
                {formatDate(payment.paymentDate, 'DATETIME')}
              </p>
            </div>
            {payment.paymentReference && (
              <div>
                <Label className="text-muted-foreground text-sm">
                  Referans No
                </Label>
                <p className="font-semibold">{payment.paymentReference}</p>
              </div>
            )}
            <div>
              <Label className="text-muted-foreground text-sm">
                Ödeme Yapan
              </Label>
              <p className="font-semibold">{payment.payerName}</p>
            </div>
          </div>

          {/* Buyer Notes */}
          {payment.buyerNotes && (
            <div>
              <Label className="mb-2 block">Alıcı Notu</Label>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm">{payment.buyerNotes}</p>
              </div>
            </div>
          )}

          {/* Seller Notes */}
          {payment.sellerNotes && (
            <div>
              <Label className="mb-2 block">Satıcı Notu</Label>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm">{payment.sellerNotes}</p>
              </div>
            </div>
          )}

          {/* Admin Notes Input */}
          <div>
            <Label htmlFor="admin-notes">Admin Notu</Label>
            <Textarea
              id="admin-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="İnceleme notlarınızı buraya yazın..."
              rows={4}
              className="mt-2"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            İptal
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              setAction('fraud');
              handleSubmit();
            }}
            disabled={isSubmitting}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Dolandırıcılık İşaretle
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setAction('reject');
              handleSubmit();
            }}
            disabled={isSubmitting}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Reddet
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setAction('approve');
              handleSubmit();
            }}
            disabled={isSubmitting}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Onayla
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PaymentActionModal;
