/**
 * Modal for freelancer to deliver completed work
 * Includes file upload, delivery notes, and submission
 */

'use client';

import React, { useState, useCallback } from 'react';
import { X, Upload, File, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import FileUpload from '@/components/ui/FileUpload';
import { useOrder } from '@/hooks/business/useOrder';
import { fileUploadService } from '@/lib/services/file-upload.service';
import logger from '@/lib/infrastructure/monitoring/logger';

interface DeliverOrderModalProps {
  orderId: string;
  orderTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

export function DeliverOrderModal({
  orderId,
  orderTitle,
  isOpen,
  onClose,
  onSuccess,
}: DeliverOrderModalProps) {
  const [deliveryNote, setDeliveryNote] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { deliverOrder, isLoading } = useOrder({
    onSuccess: () => {
      onSuccess?.();
      handleClose();
    },
  });

  const handleClose = useCallback(() => {
    if (isLoading || isUploading) return;
    setDeliveryNote('');
    setUploadedFiles([]);
    setUploadError(null);
    onClose();
  }, [isLoading, isUploading, onClose]);

  const handleFileUpload = useCallback(async (files: File[]) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const uploadPromises = files.map(async (file) => {
        const result = await fileUploadService.uploadFile(file, {
          backend: 'cloudinary',
          folder: 'marifetbul/order-deliveries',
        });
        return {
          id: result.id,
          name: file.name,
          url: result.fileUrl,
          size: result.fileSize,
          type: result.fileType,
        };
      });

      const newFiles = await Promise.all(uploadPromises);
      setUploadedFiles((prev) => [...prev, ...newFiles]);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Dosya yüklenirken hata oluştu';
      setUploadError(errorMessage);
      logger.error(
        'File upload error',
        error instanceof Error ? error : new Error(errorMessage)
      );
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleRemoveFile = useCallback((fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!deliveryNote.trim()) {
        setUploadError('Lütfen teslimat notu yazın');
        return;
      }

      if (uploadedFiles.length === 0) {
        setUploadError('Lütfen en az bir dosya yükleyin');
        return;
      }

      try {
        await deliverOrder(orderId, {
          deliveryNote: deliveryNote.trim(),
          attachments: uploadedFiles.map((file) => file.url),
        });
      } catch (error) {
        // Error is handled in the hook
        logger.error(
          'Deliver order error',
          error instanceof Error ? error : new Error(String(error))
        );
      }
    },
    [deliveryNote, uploadedFiles, orderId, deliverOrder]
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Siparişi Teslim Et
            </h2>
            <p className="mt-1 text-sm text-gray-600">{orderTitle}</p>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading || isUploading}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Delivery Note */}
          <div>
            <Label htmlFor="deliveryNote" className="mb-2">
              Teslimat Notu <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="deliveryNote"
              value={deliveryNote}
              onChange={(e) => setDeliveryNote(e.target.value)}
              placeholder="Tamamlanan işi açıklayın, kullanım talimatları ekleyin..."
              rows={6}
              className="w-full"
              disabled={isLoading}
              required
            />
            <p className="mt-2 text-sm text-gray-500">
              Müşterinin işi anlaması için detaylı bilgi verin
            </p>
          </div>

          {/* File Upload */}
          <div>
            <Label className="mb-2">
              Dosyalar <span className="text-red-500">*</span>
            </Label>
            <FileUpload
              onFileSelect={handleFileUpload}
              multiple={true}
              maxFiles={10}
              maxSize={50} // MB
              disabled={isLoading || isUploading}
            />
            <p className="mt-2 text-sm text-gray-500">
              Tamamlanan işin dosyalarını yükleyin (max 50MB per file)
            </p>
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <Label>Yüklenen Dosyalar ({uploadedFiles.length})</Label>
              <div className="space-y-2">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-blue-100 p-2">
                        <File className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
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
                      disabled={isLoading}
                      className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Dosyayı kaldır"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {uploadError && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
              <p className="text-sm text-red-800">{uploadError}</p>
            </div>
          )}

          {/* Info Box */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Teslimat Süreci</p>
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  <li>Dosyalarınızı ve notlarınızı gönderin</li>
                  <li>Müşteri işi inceleyecek</li>
                  <li>Onaylandığında ödeme hesabınıza aktarılacak</li>
                  <li>Revizyon talep edilirse düzeltme yapabilirsiniz</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isLoading || isUploading}
              className="flex-1"
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading ||
                isUploading ||
                !deliveryNote.trim() ||
                uploadedFiles.length === 0
              }
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Teslimatı Gönder
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
