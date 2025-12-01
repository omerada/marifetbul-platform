/**
 * ================================================
 * UNIFIED DELIVERY MODAL
 * ================================================
 * Production-ready unified delivery submission component
 * Handles both regular orders and milestone deliveries
 *
 * Replaces:
 * - DeliverOrderButton.tsx
 * - DeliverOrderModal.tsx
 * - DeliverySubmissionModal.tsx
 * - MilestoneDeliveryForm.tsx (for delivery part)
 *
 * Features:
 * - Regular order delivery
 * - Milestone-specific delivery
 * - File upload with progress
 * - Form validation
 * - Error handling
 * - Cloudinary integration
 * - Accessibility support
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Unified Architecture
 * @since Sprint 1 - Code Quality & Refactoring
 */

'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import FileUpload from '@/components/ui/FileUpload';
import {
  Upload,
  FileText,
  X,
  AlertCircle,
  Package,
  CheckCircle,
} from 'lucide-react';
import { orderApi } from '@/lib/api/orders';
import { milestoneApiEnhanced as milestoneApi } from '@/lib/api/milestones-enhanced';
import { fileUploadService } from '@/lib/services/file-upload.service';
import logger from '@/lib/infrastructure/monitoring/logger';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/lib/shared/formatters';

// ================================================
// TYPES
// ================================================

/**
 * Delivery mode - determines which API to call
 */
export type DeliveryMode = 'order' | 'milestone';

/**
 * Component Props
 */
export interface UnifiedDeliveryModalProps {
  /** Delivery mode */
  mode: DeliveryMode;
  /** Order ID (for order mode) */
  orderId?: string;
  /** Milestone ID (for milestone mode) */
  milestoneId?: string;
  /** Display title */
  title: string;
  /** Subtitle or description */
  subtitle?: string;
  /** Modal open state */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Success callback */
  onSuccess?: () => void;
  /** Custom submit button text */
  submitButtonText?: string;
  /** Minimum note length */
  minNoteLength?: number;
  /** Maximum files allowed */
  maxFiles?: number;
  /** Maximum file size in MB */
  maxFileSize?: number;
}

/**
 * Uploaded File Info
 */
interface UploadedFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

// ================================================
// VALIDATION SCHEMA
// ================================================

const createDeliverySchema = (minLength: number = 20) =>
  z.object({
    deliveryNote: z
      .string()
      .min(minLength, `Teslimat notu en az ${minLength} karakter olmalıdır`)
      .max(2000, 'Teslimat notu en fazla 2000 karakter olabilir'),
  });

type DeliveryFormData = z.infer<ReturnType<typeof createDeliverySchema>>;

// ================================================
// COMPONENT
// ================================================

export function UnifiedDeliveryModal({
  mode,
  orderId,
  milestoneId,
  title,
  subtitle,
  isOpen,
  onClose,
  onSuccess,
  submitButtonText = 'Teslimatı Gönder',
  minNoteLength = 20,
  maxFiles = 10,
  maxFileSize = 50,
}: UnifiedDeliveryModalProps) {
  const router = useRouter();

  // ================================================
  // STATE
  // ================================================

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // ================================================
  // FORM
  // ================================================

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<DeliveryFormData>({
    resolver: zodResolver(createDeliverySchema(minNoteLength)),
    defaultValues: {
      deliveryNote: '',
    },
  });

  const deliveryNote = watch('deliveryNote');

  // ================================================
  // VALIDATION
  // ================================================

  const isValid =
    deliveryNote.trim().length >= minNoteLength && uploadedFiles.length > 0;

  // ================================================
  // HANDLERS
  // ================================================

  /**
   * Handle file upload
   */
  const handleFileUpload = useCallback(
    async (files: File[]) => {
      if (uploadedFiles.length + files.length > maxFiles) {
        toast.error('Dosya Limiti Aşıldı', {
          description: `En fazla ${maxFiles} dosya yükleyebilirsiniz`,
        });
        return;
      }

      setIsUploading(true);
      setUploadError(null);
      setUploadProgress(0);

      try {
        logger.info('Starting file uploads', {
          mode,
          filesCount: files.length,
          orderId,
          milestoneId,
        });

        // Upload files with progress tracking
        const uploadPromises = files.map((file, index) =>
          fileUploadService.uploadFile(file, {
            onProgress: (progress) => {
              // Calculate overall progress
              const overallProgress =
                ((index + progress.progress / 100) / files.length) * 100;
              setUploadProgress(Math.min(Math.round(overallProgress), 99));
            },
            backend: 'cloudinary',
            folder:
              mode === 'milestone'
                ? `marifetbul/milestone-deliveries/${milestoneId}`
                : `marifetbul/order-deliveries/${orderId}`,
            metadata: {
              mode,
              orderId: orderId || 'unknown',
              milestoneId: milestoneId || 'unknown',
              uploadedAt: new Date().toISOString(),
            },
          })
        );

        const uploadResults = await Promise.all(uploadPromises);

        setUploadProgress(100);

        const newFiles: UploadedFile[] = uploadResults.map((result, index) => ({
          id: result.id,
          name: files[index].name,
          url: result.fileUrl,
          size: result.fileSize,
          type: result.fileType,
        }));

        setUploadedFiles((prev) => [...prev, ...newFiles]);

        toast.success('Dosyalar Yüklendi', {
          description: `${newFiles.length} dosya başarıyla yüklendi`,
        });

        logger.info('Files uploaded successfully', {
          mode,
          uploadedCount: newFiles.length,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Dosyalar yüklenirken hata oluştu';
        setUploadError(errorMessage);
        toast.error('Yükleme Hatası', { description: errorMessage });
        logger.error(
          'File upload failed',
          error instanceof Error ? error : new Error(errorMessage),
          {
            mode,
            orderId: orderId || 'N/A',
            milestoneId: milestoneId || 'N/A',
          }
        );
      } finally {
        setIsUploading(false);
        setTimeout(() => setUploadProgress(0), 1000);
      }
    },
    [uploadedFiles.length, maxFiles, mode, orderId, milestoneId]
  );

  /**
   * Remove uploaded file
   */
  const handleRemoveFile = useCallback((fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
    logger.debug('File removed', { fileId });
  }, []);

  /**
   * Handle form submission
   */
  const onSubmit = async (data: DeliveryFormData) => {
    if (!isValid) {
      toast.error('Eksik Bilgi', {
        description: 'Lütfen teslimat notu yazın ve en az bir dosya yükleyin',
      });
      return;
    }

    // Validate mode-specific requirements
    if (mode === 'order' && !orderId) {
      logger.error('Order ID missing for order delivery');
      toast.error('Hata', { description: 'Sipariş bilgisi bulunamadı' });
      return;
    }

    if (mode === 'milestone' && !milestoneId) {
      logger.error('Milestone ID missing for milestone delivery');
      toast.error('Hata', { description: 'Milestone bilgisi bulunamadı' });
      return;
    }

    setIsSubmitting(true);

    try {
      const attachmentUrls = uploadedFiles.map((file) => file.url);

      logger.info('Submitting delivery', {
        mode,
        orderId,
        milestoneId,
        attachmentsCount: attachmentUrls.length,
      });

      // Call appropriate API based on mode
      if (mode === 'order') {
        await orderApi.submitDelivery(orderId!, {
          deliverables: data.deliveryNote.trim(),
          deliveryNote: data.deliveryNote.trim(),
          attachments: attachmentUrls,
        });

        toast.success('Sipariş Teslim Edildi! 🎉', {
          description: 'Alıcı teslimatınızı inceleyecek',
        });
      } else {
        await milestoneApi.deliverMilestone(milestoneId!, {
          deliveryNotes: data.deliveryNote.trim(),
          attachments: attachmentUrls.join(','),
        });

        toast.success('Milestone Teslim Edildi! 🎉', {
          description: 'Alıcı teslimatınızı inceleyecek',
        });
      }

      logger.info('Delivery submitted successfully', {
        mode,
        orderId,
        milestoneId,
      });

      // Reset form and close
      handleClose();

      // Call success callback
      onSuccess?.();

      // Refresh page
      router.refresh();
    } catch (error) {
      logger.error(
        'Delivery submission failed',
        error instanceof Error ? error : new Error('Delivery failed'),
        {
          mode,
          orderId: orderId || 'N/A',
          milestoneId: milestoneId || 'N/A',
        }
      );

      toast.error('Teslimat Başarısız', {
        description:
          error instanceof Error
            ? error.message
            : 'Teslimat gönderilemedi. Lütfen tekrar deneyin.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Close modal and reset form
   */
  const handleClose = useCallback(() => {
    if (isSubmitting || isUploading) return;

    reset();
    setUploadedFiles([]);
    setUploadProgress(0);
    setUploadError(null);
    onClose();
  }, [isSubmitting, isUploading, reset, onClose]);

  // ================================================
  // RENDER
  // ================================================

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        {/* Header */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="h-6 w-6 text-purple-600" />
            {title}
          </DialogTitle>
          {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          {/* Delivery Note */}
          <div className="space-y-2">
            <Label htmlFor="deliveryNote" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Teslimat Notu <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="deliveryNote"
              {...register('deliveryNote')}
              rows={6}
              placeholder="Teslim ettiğiniz işi detaylı olarak açıklayın...&#10;&#10;• Neler tamamlandı?&#10;• Dosyalar nasıl kullanılır?&#10;• Özel notlar veya talimatlar&#10;&#10;Örnek: 'Logo tasarımı 3 farklı formatta (PNG, SVG, AI) eklendi. Ana logo renkli, alternatif versiyonlar siyah-beyaz olarak hazırlandı...'"
              className={cn(
                'resize-none',
                errors.deliveryNote && 'border-red-300 focus:border-red-500'
              )}
              disabled={isSubmitting}
            />
            {errors.deliveryNote && (
              <p className="text-sm text-red-600">
                {errors.deliveryNote.message}
              </p>
            )}
            <div className="flex items-center justify-between text-xs">
              <span
                className={cn(
                  'text-gray-500',
                  deliveryNote.length < minNoteLength && 'text-red-500'
                )}
              >
                {deliveryNote.length < minNoteLength
                  ? `En az ${minNoteLength - deliveryNote.length} karakter daha yazın`
                  : `${deliveryNote.length} / 2000 karakter`}
              </span>
              {deliveryNote.length >= minNoteLength && (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  Yeterli
                </span>
              )}
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Teslim Dosyaları <span className="text-red-500">*</span>
            </Label>
            <FileUpload
              onFileSelect={handleFileUpload}
              accept="*/*"
              maxFiles={maxFiles}
              maxSize={maxFileSize}
              multiple
              disabled={isSubmitting || isUploading}
            />
            <p className="text-xs text-gray-500">
              Kabul edilen: Tüm dosya formatları (Maks. {maxFileSize}MB/dosya,
              en fazla {maxFiles} dosya)
            </p>
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center justify-between">
                <span>
                  Yüklenen Dosyalar ({uploadedFiles.length}/{maxFiles})
                </span>
                <span className="text-xs font-normal text-green-600">
                  ✓ Hazır
                </span>
              </Label>
              <div className="space-y-2">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:border-gray-300"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="rounded-lg bg-blue-100 p-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(file.id)}
                      disabled={isSubmitting}
                      className="ml-2 flex-shrink-0 rounded p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label={`${file.name} dosyasını kaldır`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && uploadProgress > 0 && (
            <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-blue-900">
                  Dosyalar yükleniyor...
                </span>
                <span className="text-blue-700">{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-blue-200">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload Error */}
          {uploadError && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
              <p className="text-sm text-red-800">{uploadError}</p>
            </div>
          )}

          {/* No Files Warning */}
          {uploadedFiles.length === 0 && !isUploading && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  ⚠️ En az bir dosya yüklemeniz gerekmektedir.
                </p>
              </div>
            </div>
          )}

          {/* Important Info */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600" />
              <div className="text-sm text-blue-800">
                <p className="mb-2 font-semibold">Teslimat Süreci:</p>
                <ul className="list-inside list-disc space-y-1">
                  <li>Dosyalarınızı ve notlarınızı gönderin</li>
                  <li>Alıcı teslimatınızı inceleyecek</li>
                  <li>Onaylandığında ödeme hesabınıza aktarılacak</li>
                  <li>Revizyon talep edilirse düzeltme yapmanız gerekebilir</li>
                  <li>Kaliteli teslimat yaptığınızdan emin olun</li>
                </ul>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <DialogFooter className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting || isUploading}
          >
            İptal
          </Button>
          <Button
            type="submit"
            variant="primary"
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid || isSubmitting || isUploading}
            className="min-w-32"
          >
            {isSubmitting || isUploading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {isUploading ? 'Yükleniyor...' : 'Gönderiliyor...'}
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {submitButtonText}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UnifiedDeliveryModal;
