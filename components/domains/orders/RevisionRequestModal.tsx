/**
 * ================================================
 * REVISION REQUEST MODAL
 * ================================================
 * Modal for buyers to request revisions on delivered orders
 *
 * Features:
 * - Revision limit tracking
 * - Detailed revision request form
 * - File attachment support
 * - Real-time validation
 *
 * Backend Endpoint: POST /api/v1/orders/:id/revision
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 1.1: Revision Request Feature
 */

'use client';

import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/Dialog';
import { Button, Textarea, Label } from '@/components/ui';
import { AlertCircle, RefreshCw, Upload, X, FileText } from 'lucide-react';
import {
  orderApi,
  enrichOrder,
  unwrapOrderResponse,
  type OrderWithComputed,
} from '@/lib/api/orders';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { z } from 'zod';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// VALIDATION SCHEMA
// ================================================

const revisionRequestSchema = z.object({
  reason: z
    .string()
    .min(10, 'Revizyon sebebi en az 10 karakter olmalıdır')
    .max(500, 'Revizyon sebebi en fazla 500 karakter olabilir'),
  details: z.string().optional(),
  attachments: z
    .array(z.string().url())
    .max(5, 'En fazla 5 dosya ekleyebilirsiniz')
    .optional(),
});

type RevisionRequestInput = z.infer<typeof revisionRequestSchema>;

// ================================================
// TYPES
// ================================================

export interface RevisionRequestModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** The order to request revision for */
  order: OrderWithComputed;
  /** Callback after successful request */
  onSuccess?: (updatedOrder: OrderWithComputed) => void;
}

// ================================================
// COMPONENT
// ================================================

export function RevisionRequestModal({
  isOpen,
  onClose,
  order,
  onSuccess,
}: RevisionRequestModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [errors, setErrors] = useState<
    Partial<Record<keyof RevisionRequestInput, string>>
  >({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate remaining revisions
  const revisionsRemaining = order.revisions
    ? order.revisions.revisionsRemaining
    : (order.maxRevisions || 0) - (order.revisionCount || 0);

  // Check if can request revision
  const canRequest = order.status === 'DELIVERED' && revisionsRemaining > 0;

  // ================================================
  // HANDLERS
  // ================================================

  const validateForm = (): boolean => {
    try {
      revisionRequestSchema.parse({
        reason,
        details,
        attachments: attachments.length > 0 ? attachments : undefined,
      });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof RevisionRequestInput, string>> =
          {};
        const zodError = err as z.ZodError<RevisionRequestInput>;
        zodError.issues.forEach((error: z.ZodIssue) => {
          if (error.path[0]) {
            newErrors[error.path[0] as keyof RevisionRequestInput] =
              error.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Form Hatası', {
        description: 'Lütfen tüm alanları doğru şekilde doldurun.',
      });
      return;
    }

    if (!canRequest) {
      toast.error('Revizyon Talebi Gönderilemedi', {
        description:
          'Bu sipariş için revizyon hakkınız kalmadı veya sipariş durumu uygun değil.',
      });
      return;
    }

    try {
      setIsLoading(true);

      const response = await orderApi.requestRevision(order.id, {
        revisionNote: reason + (details.trim() ? `\n\n${details.trim()}` : ''),
      });

      // Response contains the created revision
      logger.info('Revision created:', response.data);

      toast.success('Revizyon Talebi Gönderildi!', {
        description: `Satıcı revizyonunuzu inceleyecek. ${revisionsRemaining - 1} revizyon hakkınız kaldı.`,
      });

      // Refresh order data to get updated revision count
      const orderResponse = await orderApi.getOrderById(order.id);
      const updatedOrder = enrichOrder(unwrapOrderResponse(orderResponse));

      onSuccess?.(updatedOrder);
      handleClose();
    } catch (error) {
      toast.error('Hata', {
        description:
          error instanceof Error
            ? error.message
            : 'Revizyon talebi gönderilemedi.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setReason('');
      setDetails('');
      setAttachments([]);
      setErrors({});
      onClose();
    }
  };

  const handleAddAttachment = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    // Validate file size (max 10MB per file)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validFiles = files.filter((file) => {
      if (file.size > maxSize) {
        toast.error(`${file.name} çok büyük`, {
          description: 'Dosya boyutu en fazla 10MB olabilir.',
        });
        return false;
      }
      return true;
    });

    // Add valid files (max 5 files total)
    setAttachments((prev) => {
      const newFiles = [...prev, ...validFiles].slice(0, 5);
      if (newFiles.length > 5) {
        toast.warning('Maksimum dosya sayısı', {
          description: 'En fazla 5 dosya ekleyebilirsiniz.',
        });
      }
      return newFiles.slice(0, 5);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // ================================================
  // RENDER
  // ================================================

  if (!canRequest) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Revizyon Talebi</DialogTitle>
            <DialogDescription>
              Bu sipariş için revizyon talebi gönderemezsiniz.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg bg-amber-50 p-4">
            <div className="flex items-start">
              <AlertCircle className="mr-3 h-5 w-5 flex-shrink-0 text-amber-600" />
              <div className="text-sm text-amber-800">
                {revisionsRemaining === 0 ? (
                  <p>
                    Revizyon hakkınız kalmadı. Siparişi onaylayabilir veya iptal
                    edebilirsiniz.
                  </p>
                ) : order.status !== 'DELIVERED' ? (
                  <p>
                    Revizyon talebi sadece teslim edilmiş siparişler için
                    yapılabilir.
                  </p>
                ) : (
                  <p>Bu sipariş için revizyon talebi gönderilemez.</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleClose} variant="outline">
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <RefreshCw className="mr-2 h-5 w-5 text-blue-600" />
            Revizyon Talebi
          </DialogTitle>
          <DialogDescription>
            Teslimatla ilgili değişiklik talebinde bulunun. {revisionsRemaining}{' '}
            revizyon hakkınız var.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Revision Info */}
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="flex items-start">
              <AlertCircle className="mr-3 h-5 w-5 flex-shrink-0 text-blue-600" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Revizyon Hakkında</p>
                <p className="mt-1">
                  Kalan revizyon hakkı: <strong>{revisionsRemaining}</strong>{' '}
                  adet
                </p>
                <p className="mt-1">
                  Revizyon talebiniz satıcıya iletilecek ve sipariş durumu
                  &quot;Devam Ediyor&quot; olarak güncellenecektir.
                </p>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="required">
              Revizyon Sebebi
            </Label>
            <Textarea
              id="reason"
              placeholder="Neden revizyon talep ediyorsunuz? Lütfen detaylı açıklayın..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              disabled={isLoading}
              className={cn(errors.reason && 'border-red-500')}
            />
            {errors.reason && (
              <p className="text-sm text-red-500">{errors.reason}</p>
            )}
            <p className="text-xs text-gray-500">
              {reason.length}/500 karakter
            </p>
          </div>

          {/* Details */}
          <div className="space-y-2">
            <Label htmlFor="details">Ek Detaylar (Opsiyonel)</Label>
            <Textarea
              id="details"
              placeholder="Revizyon için ek talimatlar veya beklentileriniz..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label>Ekler (Opsiyonel)</Label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="space-y-2">
              {attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-md border bg-gray-50 p-3"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <FileText className="h-4 w-4 flex-shrink-0 text-gray-500" />
                    <span className="truncate text-sm text-gray-700">
                      {attachment.name}
                    </span>
                    <span className="flex-shrink-0 text-xs text-gray-500">
                      ({(attachment.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(index)}
                    disabled={isLoading}
                    className="ml-2 flex-shrink-0 text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {attachments.length < 5 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddAttachment}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Dosya Ekle (Max 5, 10MB)
                </Button>
              )}
              <p className="text-xs text-gray-500">
                Desteklenen formatlar: Resim, PDF, Word, Metin dosyaları
              </p>
            </div>
            {errors.attachments && (
              <p className="text-sm text-red-500">{errors.attachments}</p>
            )}
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button onClick={handleClose} variant="outline" disabled={isLoading}>
            İptal
          </Button>
          <Button onClick={handleSubmit} loading={isLoading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Revizyon Talebi Gönder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RevisionRequestModal;
