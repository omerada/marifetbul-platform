/**
 * ================================================
 * RELEASE ESCROW FLOW COMPONENT
 * ================================================
 * Dialog flow for releasing escrow payment
 *
 * Features:
 * - Confirmation dialog
 * - Amount display
 * - Reason/notes input (optional)
 * - Success feedback with animation
 * - Error handling
 * - Loading states
 *
 * Sprint 1 - Epic 1.2 - Days 4-5
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Unlock, Check, AlertCircle, Loader2, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui';
import { Textarea } from '@/components/ui/Textarea';
import { formatCurrency } from '@/lib/shared/utils/format';
import type { EscrowItem } from './EscrowList';

// ============================================================================
// TYPES
// ============================================================================

export interface ReleaseEscrowFlowProps {
  /** Escrow item to release */
  escrow: EscrowItem | null;

  /** Whether dialog is open */
  isOpen: boolean;

  /** Callback when dialog is closed */
  onClose: () => void;

  /** Callback when release is confirmed */
  onConfirm: (escrowId: string, notes?: string) => Promise<void>;
}

type FlowStep = 'confirm' | 'processing' | 'success' | 'error';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ReleaseEscrowFlow({
  escrow,
  isOpen,
  onClose,
  onConfirm,
}: ReleaseEscrowFlowProps) {
  const [step, setStep] = useState<FlowStep>('confirm');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Reset state when dialog closes
  const handleClose = () => {
    setStep('confirm');
    setNotes('');
    setError(null);
    onClose();
  };

  // Handle release confirmation
  const handleRelease = async () => {
    if (!escrow) return;

    try {
      setStep('processing');
      setError(null);

      await onConfirm(escrow.id, notes.trim() || undefined);

      setStep('success');

      // Auto-close after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ödeme serbest bırakılırken bir hata oluştu'
      );
      setStep('error');
    }
  };

  if (!escrow) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md">
        {/* Confirm Step */}
        {step === 'confirm' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Unlock className="h-5 w-5 text-green-600" />
                Ödemeyi Serbest Bırak
              </DialogTitle>
              <DialogDescription>
                Bu işlem geri alınamaz. Ödeme satıcıya aktarılacak ve cüzdanında
                kullanılabilir hale gelecektir.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Amount Display */}
              <div className="bg-muted rounded-lg p-4 text-center">
                <div className="text-muted-foreground mb-1 text-sm">
                  Serbest Bırakılacak Tutar
                </div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(escrow.amount)}
                </div>
              </div>

              {/* Order Info */}
              {escrow.orderId && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/20">
                  <div className="flex gap-2">
                    <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                    <div className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>Sipariş:</strong> {escrow.orderId}
                    </div>
                  </div>
                </div>
              )}

              {/* Notes Input */}
              <div>
                <label
                  htmlFor="release-notes"
                  className="mb-2 block text-sm font-medium"
                >
                  Not (İsteğe Bağlı)
                </label>
                <Textarea
                  id="release-notes"
                  placeholder="Bu ödemeyi neden serbest bırakıyorsunuz? (isteğe bağlı)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  maxLength={500}
                />
                <div className="text-muted-foreground mt-1 text-right text-xs">
                  {notes.length}/500
                </div>
              </div>

              {/* Warning */}
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950/20">
                <div className="flex gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
                  <div className="text-sm text-yellow-900 dark:text-yellow-100">
                    Bu işlem geri alınamaz. Lütfen siparişin tamamlandığından
                    emin olun.
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                İptal
              </Button>
              <Button
                onClick={handleRelease}
                className="bg-green-600 hover:bg-green-700"
              >
                <Unlock className="mr-2 h-4 w-4" />
                Ödemeyi Serbest Bırak
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Processing Step */}
        {step === 'processing' && (
          <div className="py-8">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="text-primary h-12 w-12 animate-spin" />
              <div className="text-center">
                <h3 className="mb-1 font-semibold">İşleniyor...</h3>
                <p className="text-muted-foreground text-sm">
                  Ödeme serbest bırakılıyor, lütfen bekleyin.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="flex flex-col items-center justify-center gap-4"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/20">
                <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-center">
                <h3 className="mb-2 text-xl font-semibold">
                  Başarıyla Serbest Bırakıldı!
                </h3>
                <p className="text-muted-foreground text-sm">
                  Ödeme satıcıya aktarıldı ve cüzdanında kullanılabilir.
                </p>
              </div>
            </motion.div>
          </div>
        )}

        {/* Error Step */}
        {step === 'error' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Hata Oluştu
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20">
                <p className="text-sm text-red-900 dark:text-red-100">
                  {error || 'Bilinmeyen bir hata oluştu'}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Kapat
              </Button>
              <Button onClick={() => setStep('confirm')}>Tekrar Dene</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ReleaseEscrowFlow;
