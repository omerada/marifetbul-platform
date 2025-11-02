/**
 * ================================================
 * DISPUTE ESCROW MODAL COMPONENT
 * ================================================
 * Modal for initiating dispute on escrow payment
 *
 * Features:
 * - Dispute reason selection
 * - Detailed description input
 * - Evidence upload (future)
 * - Submit to moderators
 * - Success feedback
 * - Error handling
 *
 * Sprint 1 - Epic 1.2 - Days 4-5
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Check,
  Loader2,
  Info,
  FileText,
  Upload,
} from 'lucide-react';
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
import { Label } from '@/components/ui/Label';
import { formatCurrency } from '@/lib/shared/utils/format';
import { DisputeReason } from '@/types/dispute';
import type { EscrowItem } from './EscrowList';

// ============================================================================
// TYPES
// ============================================================================

export interface DisputeEscrowModalProps {
  /** Escrow item to dispute */
  escrow: EscrowItem | null;

  /** Whether modal is open */
  isOpen: boolean;

  /** Callback when modal is closed */
  onClose: () => void;

  /** Callback when dispute is submitted */
  onSubmit: (
    escrowId: string,
    reason: DisputeReason,
    description: string
  ) => Promise<void>;
}

type FlowStep = 'form' | 'processing' | 'success' | 'error';

// ============================================================================
// CONSTANTS
// ============================================================================

const DISPUTE_REASONS: {
  value: DisputeReason;
  label: string;
  description: string;
}[] = [
  {
    value: DisputeReason.NOT_AS_DESCRIBED,
    label: 'Açıklamaya Uygun Değil',
    description: 'Alınan hizmet/ürün açıklamadaki gibi değil',
  },
  {
    value: DisputeReason.DELIVERY_NOT_RECEIVED,
    label: 'Teslim Edilmedi',
    description: 'Sipariş hiç teslim edilmedi',
  },
  {
    value: DisputeReason.INCOMPLETE_WORK,
    label: 'Eksik İş',
    description: 'Sipariş tamamlanmadı veya eksik',
  },
  {
    value: DisputeReason.QUALITY_ISSUE,
    label: 'Kalite Sorunu',
    description: 'İş kalitesi beklentileri karşılamıyor',
  },
  {
    value: DisputeReason.COMMUNICATION_ISSUE,
    label: 'İletişim Sorunu',
    description: 'Satıcı ile iletişim kurulamıyor',
  },
  {
    value: DisputeReason.OTHER,
    label: 'Diğer',
    description: 'Diğer bir sebep',
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DisputeEscrowModal({
  escrow,
  isOpen,
  onClose,
  onSubmit,
}: DisputeEscrowModalProps) {
  const [step, setStep] = useState<FlowStep>('form');
  const [selectedReason, setSelectedReason] = useState<DisputeReason>(
    DisputeReason.NOT_AS_DESCRIBED
  );
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Validation
  const isValid = selectedReason && description.trim().length >= 20;

  // Reset state when dialog closes
  const handleClose = () => {
    setStep('form');
    setSelectedReason(DisputeReason.NOT_AS_DESCRIBED);
    setDescription('');
    setError(null);
    onClose();
  };

  // Handle dispute submission
  const handleSubmit = async () => {
    if (!escrow || !selectedReason || !isValid) return;

    try {
      setStep('processing');
      setError(null);

      await onSubmit(escrow.id, selectedReason, description.trim());

      setStep('success');

      // Auto-close after 3 seconds
      setTimeout(() => {
        handleClose();
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'İhtilaf başlatılırken bir hata oluştu'
      );
      setStep('error');
    }
  };

  if (!escrow) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        {/* Form Step */}
        {step === 'form' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                İtiraz Başlat
              </DialogTitle>
              <DialogDescription>
                Bu ödeme için ihtilaf süreci başlatılacaktır. Moderatör ekibimiz
                durumu inceleyecek ve taraflar arasında çözüme ulaşmaya
                çalışacaktır.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Escrow Info */}
              <div className="bg-muted rounded-lg p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-muted-foreground text-sm">Tutar</div>
                  <div className="text-xl font-bold">
                    {formatCurrency(escrow.amount)}
                  </div>
                </div>
                {escrow.orderId && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Sipariş: </span>
                    <code className="text-xs">{escrow.orderId}</code>
                  </div>
                )}
              </div>

              {/* Reason Selection */}
              <div>
                <Label className="mb-3 block text-base font-semibold">
                  İtiraz Sebebi <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {DISPUTE_REASONS.map((reason) => (
                    <button
                      key={reason.value}
                      type="button"
                      onClick={() => setSelectedReason(reason.value)}
                      className={`rounded-lg border-2 p-4 text-left transition-all ${
                        selectedReason === reason.value
                          ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
                          : 'border-border hover:border-red-300 dark:hover:border-red-800'
                      }`}
                    >
                      <div className="mb-1 font-medium">{reason.label}</div>
                      <div className="text-muted-foreground text-xs">
                        {reason.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <Label
                  htmlFor="dispute-description"
                  className="mb-2 block text-base font-semibold"
                >
                  Detaylı Açıklama <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="dispute-description"
                  placeholder="Lütfen durumu detaylı bir şekilde açıklayın. Moderatör ekibimiz bu açıklamayı değerlendirerek karar verecektir. (Minimum 20 karakter)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  maxLength={2000}
                  className={
                    description.length > 0 && description.length < 20
                      ? 'border-red-500'
                      : ''
                  }
                />
                <div className="mt-1 flex items-center justify-between">
                  <div className="text-muted-foreground text-xs">
                    {description.length < 20 && description.length > 0 && (
                      <span className="text-red-500">
                        En az {20 - description.length} karakter daha gerekli
                      </span>
                    )}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {description.length}/2000
                  </div>
                </div>
              </div>

              {/* Evidence Upload (Placeholder for future) */}
              <div className="border-border rounded-lg border-2 border-dashed p-6 text-center">
                <Upload className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
                <div className="text-muted-foreground mb-1 text-sm">
                  Kanıt Dosyaları (İsteğe Bağlı)
                </div>
                <div className="text-muted-foreground text-xs">
                  Ekran görüntüleri, mesajlar veya diğer belgeler
                </div>
                <Button variant="outline" size="sm" className="mt-3" disabled>
                  <FileText className="mr-2 h-4 w-4" />
                  Dosya Ekle (Yakında)
                </Button>
              </div>

              {/* Info Box */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
                <div className="flex gap-3">
                  <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                  <div className="space-y-2 text-sm text-blue-900 dark:text-blue-100">
                    <p>
                      <strong>İhtilaf Süreci:</strong>
                    </p>
                    <ol className="ml-2 list-inside list-decimal space-y-1">
                      <li>İhtilafınız moderatör ekibimize iletilir</li>
                      <li>Her iki taraf da görüşlerini belirtir</li>
                      <li>Moderatör kanıtları inceler ve karar verir</li>
                      <li>Karar doğrultusunda ödeme işlenir</li>
                    </ol>
                    <p className="text-xs">
                      Ortalama çözüm süresi: 3-5 iş günü
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                İptal
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!isValid}
                className="bg-red-600 hover:bg-red-700"
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                İhtilaf Başlat
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
                <h3 className="mb-1 font-semibold">Gönderiliyor...</h3>
                <p className="text-muted-foreground text-sm">
                  İhtilafınız moderatör ekibimize iletiliyor.
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
                  İhtilaf Başarıyla Başlatıldı
                </h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  Moderatör ekibimiz en kısa sürede incelemeye alacaktır.
                </p>
                <p className="text-muted-foreground text-xs">
                  İhtilaflarım sayfasından durumu takip edebilirsiniz.
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
              <Button onClick={() => setStep('form')}>Tekrar Dene</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default DisputeEscrowModal;
