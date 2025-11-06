'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Textarea } from '@/components/ui/Textarea';
import FileUpload from '@/components/ui/FileUpload';
import { orderApi } from '@/lib/api/orders';
import logger from '@/lib/infrastructure/monitoring/logger';
import {
  uploadMultipleFiles,
  formatFileSize,
} from '@/lib/services/fileUploadService';

// ================================================
// VALIDATION SCHEMA
// ================================================

const deliverySchema = z.object({
  notes: z
    .string()
    .min(20, 'Teslim notları en az 20 karakter olmalıdır')
    .max(1000, 'Teslim notları en fazla 1000 karakter olabilir'),
});

type DeliveryFormData = z.infer<typeof deliverySchema>;

// ================================================
// COMPONENT PROPS
// ================================================

interface DeliverOrderButtonProps {
  orderId: string;
  orderTitle: string;
  onDelivered?: () => void;
  disabled?: boolean;
  className?: string;
}

// ================================================
// COMPONENT
// ================================================

export function DeliverOrderButton({
  orderId,
  orderTitle,
  onDelivered,
  disabled = false,
  className = '',
}: DeliverOrderButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DeliveryFormData>({
    resolver: zodResolver(deliverySchema),
  });

  // ================================================
  // FILE HANDLERS
  // ================================================

  const handleFileUpload = (files: File[]) => {
    if (uploadedFiles.length + files.length > 10) {
      toast.error('En fazla 10 dosya yükleyebilirsiniz');
      return;
    }
    setUploadedFiles((prev) => [...prev, ...files]);
    logger.debug('Files uploaded', { count: files.length });
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    logger.debug('File removed', { index });
  };

  // ================================================
  // FORM SUBMISSION
  // ================================================

  const onSubmit = async (data: DeliveryFormData) => {
    if (uploadedFiles.length === 0) {
      toast.error('Lütfen en az bir teslim dosyası yükleyin');
      return;
    }

    setIsSubmitting(true);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      logger.info('Starting file uploads', { orderId, filesCountuploadedFileslength,  });

      // Upload files to Cloudinary
      const uploadResults = await uploadMultipleFiles(
        uploadedFiles,
        (fileIndex, progress) => {
          // Individual file progress can be tracked here if needed
          logger.debug('File upload progress', { fileIndex, progress });
        },
        (overallProgress) => {
          // Update overall progress
          setUploadProgress(overallProgress);
        }
      );

      // Check for upload failures
      const failedUploads = uploadResults.filter((r) => !r.success);
      if (failedUploads.length > 0) {
        const failedFiles = failedUploads
          .map((r, i) => uploadedFiles[i]?.name)
          .filter(Boolean)
          .join(', ');

        toast.error('Dosya yükleme hatası', {
          description: `Şu dosyalar yüklenemedi: ${failedFiles}`,
        });
        setIsUploading(false);
        setIsSubmitting(false);
        return;
      }

      // Extract uploaded file URLs
      const attachmentUrls = uploadResults
        .filter((r) => r.success && r.url)
        .map((r) => r.url!);

      logger.info('Files uploaded successfully', { orderId, uploadedCountattachmentUrlslength,  });

      setIsUploading(false);

      // Submit delivery to backend
      logger.info('Submitting order delivery', { orderId });

      const response = await orderApi.submitDelivery(orderId, {
        deliverables: data.notes,
        deliveryNote: data.notes,
        attachments: attachmentUrls,
      });

      if (!response.success) {
        throw new Error(
          typeof response.error === 'string'
            ? response.error
            : 'Sipariş teslim edilemedi'
        );
      }

      toast.success('Sipariş Teslim Edildi! 🎉', {
        description: `${uploadedFiles.length} dosya yüklendi ve alıcıya iletildi.`,
      });

      logger.info('Order delivered successfully', { orderId });

      // Close modal and reset
      setIsOpen(false);
      reset();
      setUploadedFiles([]);
      setUploadProgress(0);

      // Callback
      onDelivered?.();

      // Refresh page
      router.refresh();
    } catch (error) {
      logger.error('Failed to deliver order', { orderId, error });
      toast.error('Teslim Başarısız', {
        description:
          error instanceof Error
            ? error.message
            : 'Sipariş teslim edilemedi. Lütfen tekrar deneyin.',
      });
      setIsUploading(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ================================================
  // RENDER
  // ================================================

  return (
    <>
      {/* Trigger Button */}
      <Button
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        variant="primary"
        className={`w-full sm:w-auto ${className}`}
      >
        <Upload className="mr-2 h-4 w-4" />
        Siparişi Teslim Et
      </Button>

      {/* Delivery Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sipariş Teslimi</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Order Info */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h3 className="font-medium text-gray-900">{orderTitle}</h3>
              <p className="mt-1 text-sm text-gray-600">
                Sipariş ID: {orderId.slice(0, 8)}...
              </p>
              <div className="mt-3 flex items-start gap-2 text-sm text-blue-800">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <p>
                  Teslim ettiğiniz dosyalar ve notlar alıcı tarafından
                  incelenecektir. Lütfen tüm gereksinimlerin karşılandığından
                  emin olun.
                </p>
              </div>
            </div>

            {/* File Upload Section */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Teslim Dosyaları *
              </label>
              <FileUpload
                onFileSelect={handleFileUpload}
                accept=".pdf,.doc,.docx,.zip,.rar,.jpg,.jpeg,.png,.gif,.psd,.ai,.svg,.mp4,.mov"
                maxFiles={10}
                maxSize={50} // MB
                multiple
                disabled={isSubmitting}
              />
              <p className="mt-2 text-xs text-gray-500">
                Kabul edilen formatlar: PDF, Word, Zip, Görsel, Video dosyaları
                (Maks. 50MB/dosya)
              </p>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    Yüklenen Dosyalar ({uploadedFiles.length}/10)
                  </p>
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:border-gray-300"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <FileText className="h-5 w-5 flex-shrink-0 text-gray-400" />
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
                        onClick={() => removeFile(index)}
                        className="rounded p-1 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                        aria-label="Dosyayı kaldır"
                        disabled={isSubmitting}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {uploadedFiles.length === 0 && (
                <div className="mt-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                  <p className="text-sm text-yellow-800">
                    ⚠️ En az bir dosya yüklemeniz gerekmektedir.
                  </p>
                </div>
              )}
            </div>

            {/* Delivery Notes */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Teslim Notları *
              </label>
              <Textarea
                {...register('notes')}
                rows={6}
                placeholder="Teslim ettiğiniz dosyaları açıklayın, alıcının neleri incelemesi gerektiğini belirtin, özel talimatlarınızı ekleyin...&#10;&#10;Örnek: 'Logo tasarımı 3 farklı formatta (PNG, SVG, AI) eklendi. Ana logo renkli, alternatif versiyonlar siyah-beyaz olarak hazırlandı...'"
                className="w-full"
              />
              {errors.notes && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.notes.message}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                💡 İpucu: Detaylı açıklama, alıcının işinizi daha iyi anlamasına
                yardımcı olur.
              </p>
            </div>

            {/* Guidelines */}
            <div className="space-y-2 rounded-lg bg-gray-50 p-4">
              <h4 className="text-sm font-medium text-gray-900">
                📋 Teslim Kontrol Listesi:
              </h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>✓ Tüm gereksinimler karşılandı</li>
                <li>✓ Dosyalar doğru formatta ve eksiksiz</li>
                <li>✓ Kalite kontrol yapıldı</li>
                <li>✓ Alıcı açıklamalar net ve anlaşılır</li>
              </ul>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="mb-2 flex items-center justify-between text-sm">
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
                <p className="mt-2 text-xs text-blue-700">
                  Lütfen bekleyin, dosyalarınız güvenli bir şekilde
                  yükleniyor...
                </p>
              </div>
            )}
          </form>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={uploadedFiles.length === 0}
              onClick={handleSubmit(onSubmit)}
            >
              <Upload className="mr-2 h-4 w-4" />
              Teslimi Gönder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
