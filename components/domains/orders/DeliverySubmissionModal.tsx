/**
 * ================================================
 * DELIVERY SUBMISSION MODAL
 * ================================================
 * Modal for seller to submit delivery
 *
 * Features:
 * - Delivery note textarea
 * - File upload (multiple files)
 * - Form validation
 * - Real-time submission
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Story 2: Seller Order Actions
 */

'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui';
import { Button, Textarea, Label } from '@/components/ui';
import FileUpload from '@/components/ui/FileUpload';
import { Package, Upload, FileText, AlertCircle, X } from 'lucide-react';
import { orderApi } from '@/lib/api/orders';
import type { OrderResponse as Order } from '@/types/backend-aligned';
import type { SubmitDeliveryRequest } from '@/lib/infrastructure/services/api/orderService';
import {
  fileUploadService,
  type UploadProgress,
} from '@/lib/services/file-upload.service';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ================================================
// TYPES
// ================================================

export interface DeliverySubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onSuccess?: (order: Order) => void;
}

// ================================================
// COMPONENT
// ================================================

export function DeliverySubmissionModal({
  isOpen,
  onClose,
  order,
  onSuccess,
}: DeliverySubmissionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFileUrls, setUploadedFileUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // ================================================
  // VALIDATION
  // ================================================

  const isValid = deliveryNote.trim().length >= 10;

  // ================================================
  // HANDLERS
  // ================================================

  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0) return [];

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload files using the file upload service
      const results = await fileUploadService.uploadFiles(selectedFiles, {
        folder: `orders/${order.id}/deliveries`,
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          type: 'delivery',
        },
        onProgress: (progress: UploadProgress) => {
          setUploadProgress(progress.progress);
        },
      });

      const uploadedUrls = results.map((result) => result.fileUrl);
      setUploadedFileUrls(uploadedUrls);

      toast.success('Dosyalar yüklendi', {
        description: `${uploadedUrls.length} dosya başarıyla yüklendi.`,
      });

      return uploadedUrls;
    } catch (error) {
      toast.error('Yükleme Hatası', {
        description:
          error instanceof Error ? error.message : 'Dosyalar yüklenemedi.',
      });
      return [];
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async () => {
    if (!isValid) {
      toast.error('Eksik Bilgi', {
        description: 'Teslimat notu en az 10 karakter olmalıdır.',
      });
      return;
    }

    try {
      setIsLoading(true);

      // Upload files first if any
      let fileUrls = uploadedFileUrls;
      if (selectedFiles.length > 0 && uploadedFileUrls.length === 0) {
        fileUrls = await handleUploadFiles();
      }

      // Submit delivery
      const request: SubmitDeliveryRequest = {
        deliverables: deliveryNote.trim(),
        deliveryNote: deliveryNote.trim(),
        attachments: fileUrls.length > 0 ? fileUrls : undefined,
      };

      const updatedOrder = await orderApi.submitDelivery(order.id, request);

      toast.success('Teslimat Gönderildi!', {
        description: 'Müşteri teslimatınızı inceleyecek.',
      });

      onSuccess?.(updatedOrder as unknown as Order);
      onClose();
    } catch (error) {
      toast.error('Hata', {
        description:
          error instanceof Error ? error.message : 'Teslimat gönderilemedi.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ================================================
  // HELPERS
  // ================================================

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // ================================================
  // RENDER
  // ================================================

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="h-6 w-6 text-purple-600" />
            Teslimat Gönder
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Order Info */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sipariş</p>
                <p className="font-medium text-gray-900">
                  #{order.orderNumber}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Alıcı</p>
                <p className="font-medium text-gray-900">
                  Alıcı #{order.buyerId}
                </p>
              </div>
            </div>
          </div>

          {/* Delivery Note */}
          <div className="space-y-2">
            <Label htmlFor="deliveryNote" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Teslimat Notu *
            </Label>
            <Textarea
              id="deliveryNote"
              value={deliveryNote}
              onChange={(e) => setDeliveryNote(e.target.value)}
              placeholder="Teslim ettiğiniz işi detaylı olarak açıklayın. Dosyalara nasıl erişileceği, kullanım talimatları vs..."
              rows={6}
              className={cn(
                'resize-none',
                deliveryNote.length > 0 &&
                  deliveryNote.length < 10 &&
                  'border-red-300 focus:border-red-500'
              )}
              disabled={isLoading}
            />
            <div className="flex items-center justify-between text-xs">
              <span
                className={cn(
                  'text-gray-500',
                  deliveryNote.length < 10 && 'text-red-500'
                )}
              >
                {deliveryNote.length < 10
                  ? `En az ${10 - deliveryNote.length} karakter daha yazın`
                  : `${deliveryNote.length} karakter`}
              </span>
              {deliveryNote.length >= 10 && (
                <span className="text-green-600">✓ Yeterli</span>
              )}
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Dosyalar (Opsiyonel)
            </Label>

            <FileUpload
              onFileSelect={handleFileSelect}
              accept="*/*"
              multiple={true}
              maxSize={50} // 50MB
              maxFiles={10}
              disabled={isLoading || isUploading}
            />

            {/* Selected Files List */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Seçili Dosyalar ({selectedFiles.length})
                </p>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
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
                        onClick={() => handleRemoveFile(index)}
                        disabled={isLoading || isUploading}
                        className="ml-2 flex-shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600 disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Yükleniyor...</span>
                <span className="font-medium">{uploadProgress}%</span>
              </div>
              <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Important Notice */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600" />
              <div className="text-sm text-blue-800">
                <p className="mb-2 font-semibold">Önemli Hatırlatmalar:</p>
                <ul className="list-inside list-disc space-y-1">
                  <li>Teslimatınızı gönderdikten sonra müşteri inceleyecek</li>
                  <li>Müşteri onayı ile ödeme hesabınıza aktarılır</li>
                  <li>
                    Revizyon talebi gelirse paket kapsamında ücretsiz
                    yapmalısınız
                  </li>
                  <li>Kaliteli teslimat yaptığınızdan emin olun</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading || isUploading}
          >
            İptal
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!isValid || isLoading || isUploading}
            className="min-w-32"
          >
            {isLoading || isUploading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {isUploading ? 'Yükleniyor...' : 'Gönderiliyor...'}
              </>
            ) : (
              <>
                <Package className="mr-2 h-4 w-4" />
                Teslimatı Gönder
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeliverySubmissionModal;
