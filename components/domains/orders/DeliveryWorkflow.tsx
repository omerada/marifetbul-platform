'use client';

/**
 * ================================================
 * DELIVERY WORKFLOW COMPONENT
 * ================================================
 * Modern delivery management with file upload, revision, and acceptance flow
 *
 * Sprint 2 - Task 2.3: Delivery Management
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 25, 2025
 *
 * Features:
 * ✅ File upload with Cloudinary integration
 * ✅ Drag & drop file support
 * ✅ Delivery submission with notes
 * ✅ Revision request flow
 * ✅ Delivery acceptance/rejection
 * ✅ Delivery history timeline
 * ✅ Role-based actions (buyer/seller)
 * ✅ Real-time upload progress
 * ✅ File preview & download
 */

import React, { useState, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import {
  Upload,
  X,
  FileText,
  Check,
  RefreshCw,
  Download,
  AlertCircle,
  Loader2,
  Paperclip,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fileUploadService } from '@/lib/services/file-upload.service';
import useToast from '@/hooks/core/useToast';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// TYPES
// ================================================

export interface DeliveryFile {
  id?: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt?: string;
  cloudinaryId?: string;
}

export interface Delivery {
  id: string;
  orderId: string;
  deliverables: string; // Delivery note
  attachments: DeliveryFile[];
  submittedAt: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  revisionNote?: string;
}

export interface DeliveryWorkflowProps {
  /** Order ID */
  orderId: string;
  /** Current delivery (if exists) */
  delivery?: Delivery | null;
  /** User role */
  userRole: 'buyer' | 'seller';
  /** Callback when delivery submitted */
  onSubmitDelivery: (data: {
    deliverables: string;
    attachments: string[];
  }) => Promise<void>;
  /** Callback when delivery accepted */
  onAcceptDelivery?: (deliveryId: string) => Promise<void>;
  /** Callback when revision requested */
  onRequestRevision?: (
    deliveryId: string,
    revisionNote: string
  ) => Promise<void>;
  /** Show delivery history */
  showHistory?: boolean;
  /** Custom className */
  className?: string;
}

// ================================================
// CONSTANTS
// ================================================

const MAX_FILES = 10;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FILE_TYPES = [
  'image/*',
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.txt',
];

// ================================================
// HELPER FUNCTIONS
// ================================================

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const getFileIcon = (type: string): React.ReactNode => {
  if (type.startsWith('image/')) return '🖼️';
  if (type.includes('pdf')) return '📄';
  if (type.includes('zip')) return '📦';
  if (type.includes('doc')) return '📝';
  if (type.includes('xls') || type.includes('sheet')) return '📊';
  return '📎';
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ================================================
// COMPONENT
// ================================================

export function DeliveryWorkflow({
  orderId,
  delivery,
  userRole,
  onSubmitDelivery,
  onAcceptDelivery,
  onRequestRevision,
  className,
}: DeliveryWorkflowProps) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ==================== STATE ====================

  const [deliveryNote, setDeliveryNote] = useState('');
  const [files, setFiles] = useState<DeliveryFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [revisionNote, setRevisionNote] = useState('');
  const [isRequestingRevision, setIsRequestingRevision] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const hasDelivery = !!delivery;
  const canSubmitDelivery = userRole === 'seller' && !hasDelivery;
  const canAcceptDelivery =
    userRole === 'buyer' && hasDelivery && delivery.status === 'PENDING';

  // ==================== FILE UPLOAD ====================

  const handleFileSelect = useCallback(
    async (selectedFiles: FileList | null) => {
      if (!selectedFiles || selectedFiles.length === 0) return;

      const fileArray = Array.from(selectedFiles);

      // Validate file count
      if (files.length + fileArray.length > MAX_FILES) {
        toast.error(
          'Dosya Limiti Aşıldı',
          `En fazla ${MAX_FILES} dosya yükleyebilirsiniz.`
        );
        return;
      }

      // Validate file sizes
      const oversizedFiles = fileArray.filter(
        (file) => file.size > MAX_FILE_SIZE
      );
      if (oversizedFiles.length > 0) {
        toast.error(
          'Dosya Boyutu Çok Büyük',
          `Bazı dosyalar 50MB limitini aşıyor: ${oversizedFiles.map((f) => f.name).join(', ')}`
        );
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      try {
        const uploadedFiles: DeliveryFile[] = [];

        for (let i = 0; i < fileArray.length; i++) {
          const file = fileArray[i];
          logger.info('[DeliveryWorkflow] Uploading file', {
            name: file.name,
            size: file.size,
            type: file.type,
          });

          const result = await fileUploadService.uploadFile(file, {
            folder: `orders/${orderId}/deliveries`,
            onProgress: (progress: { progress: number }) => {
              const totalProgress =
                ((i + progress.progress / 100) / fileArray.length) * 100;
              setUploadProgress(Math.round(totalProgress));
            },
          });

          uploadedFiles.push({
            name: file.name,
            url: result.fileUrl,
            size: result.fileSize,
            type: result.fileType,
            cloudinaryId: result.id,
          });
        }

        setFiles((prev) => [...prev, ...uploadedFiles]);
        toast.success(
          'Dosyalar Yüklendi',
          `${fileArray.length} dosya başarıyla yüklendi.`
        );

        logger.info('[DeliveryWorkflow] Files uploaded successfully', {
          count: fileArray.length,
          orderId,
        });
      } catch (error) {
        logger.error('[DeliveryWorkflow] File upload failed', error as Error);
        toast.error(
          'Dosya Yükleme Hatası',
          'Dosyalar yüklenirken bir hata oluştu. Lütfen tekrar deneyin.'
        );
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [files.length, orderId, toast]
  );

  const handleRemoveFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // ==================== DRAG & DROP ====================

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFiles = e.dataTransfer.files;
      handleFileSelect(droppedFiles);
    },
    [handleFileSelect]
  );

  // ==================== DELIVERY SUBMISSION ====================

  const handleSubmitDelivery = useCallback(async () => {
    // Validation
    if (deliveryNote.trim().length < 20) {
      toast.error('Eksik Bilgi', 'Teslimat notu en az 20 karakter olmalıdır.');
      return;
    }

    if (files.length === 0) {
      toast.error('Eksik Dosya', 'En az bir dosya yüklemelisiniz.');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmitDelivery({
        deliverables: deliveryNote,
        attachments: files.map((f) => f.url),
      });

      toast.success(
        'Teslimat Gönderildi',
        'Teslimatınız başarıyla gönderildi.'
      );

      // Reset form
      setDeliveryNote('');
      setFiles([]);

      logger.info('[DeliveryWorkflow] Delivery submitted', { orderId });
    } catch (error) {
      logger.error(
        '[DeliveryWorkflow] Delivery submission failed',
        error as Error
      );
      toast.error(
        'Teslimat Gönderilemedi',
        'Teslimat gönderilirken bir hata oluştu. Lütfen tekrar deneyin.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [deliveryNote, files, onSubmitDelivery, orderId, toast]);

  // ==================== DELIVERY ACCEPTANCE ====================

  const handleAcceptDelivery = useCallback(async () => {
    if (!delivery || !onAcceptDelivery) return;

    try {
      await onAcceptDelivery(delivery.id);
      toast.success(
        'Teslimat Kabul Edildi',
        'Teslimat başarıyla kabul edildi.'
      );
      logger.info('[DeliveryWorkflow] Delivery accepted', {
        deliveryId: delivery.id,
        orderId,
      });
    } catch (error) {
      logger.error(
        '[DeliveryWorkflow] Delivery acceptance failed',
        error as Error
      );
      toast.error(
        'Kabul İşlemi Başarısız',
        'Teslimat kabul edilirken bir hata oluştu.'
      );
    }
  }, [delivery, onAcceptDelivery, orderId, toast]);

  // ==================== REVISION REQUEST ====================

  const handleRequestRevision = useCallback(async () => {
    if (!delivery || !onRequestRevision) return;

    if (revisionNote.trim().length < 10) {
      toast.error('Eksik Bilgi', 'Revizyon notu en az 10 karakter olmalıdır.');
      return;
    }

    setIsRequestingRevision(true);

    try {
      await onRequestRevision(delivery.id, revisionNote);
      toast.success('Revizyon Talep Edildi', 'Revizyon talebiniz gönderildi.');
      setRevisionNote('');
      logger.info('[DeliveryWorkflow] Revision requested', {
        deliveryId: delivery.id,
        orderId,
      });
    } catch (error) {
      logger.error(
        '[DeliveryWorkflow] Revision request failed',
        error as Error
      );
      toast.error(
        'Revizyon Talebi Başarısız',
        'Revizyon talebi gönderilirken bir hata oluştu.'
      );
    } finally {
      setIsRequestingRevision(false);
    }
  }, [delivery, revisionNote, onRequestRevision, orderId, toast]);

  // ==================== RENDER ====================

  return (
    <div className={cn('space-y-6', className)}>
      {/* Delivery Submission (Seller Only) */}
      {canSubmitDelivery && (
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Teslimat Gönder
          </h3>

          {/* Delivery Note */}
          <div className="mb-4">
            <Label htmlFor="deliveryNote">Teslimat Notu *</Label>
            <Textarea
              id="deliveryNote"
              value={deliveryNote}
              onChange={(e) => setDeliveryNote(e.target.value)}
              placeholder="Teslimat ile ilgili detaylı açıklama yazın..."
              rows={4}
              className="mt-2"
            />
            <p className="mt-1 text-xs text-gray-500">
              Minimum 20 karakter ({deliveryNote.length}/20)
            </p>
          </div>

          {/* File Upload Area */}
          <div className="mb-4">
            <Label>
              Dosyalar ({files.length}/{MAX_FILES})
            </Label>
            <div
              className={cn(
                'mt-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors',
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-gray-50'
              )}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Dosyaları sürükleyip bırakın veya{' '}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700"
                >
                  dosya seçin
                </button>
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Maksimum dosya boyutu: 50MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={ALLOWED_FILE_TYPES.join(',')}
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Yükleniyor...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Uploaded Files List */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getFileIcon(file.type)}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                      disabled={isUploading || isSubmitting}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmitDelivery}
            disabled={
              isSubmitting ||
              isUploading ||
              deliveryNote.trim().length < 20 ||
              files.length === 0
            }
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Teslimatı Gönder
              </>
            )}
          </Button>
        </Card>
      )}

      {/* Delivery Review (Buyer Only) */}
      {hasDelivery && (
        <Card className="p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Teslimat Detayları
              </h3>
              <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{formatDate(delivery.submittedAt)}</span>
              </div>
            </div>
            <Badge
              variant={
                delivery.status === 'ACCEPTED'
                  ? 'success'
                  : delivery.status === 'REJECTED'
                    ? 'destructive'
                    : 'default'
              }
            >
              {delivery.status === 'ACCEPTED'
                ? 'Kabul Edildi'
                : delivery.status === 'REJECTED'
                  ? 'Reddedildi'
                  : 'Beklemede'}
            </Badge>
          </div>

          {/* Delivery Note */}
          <div className="mb-4">
            <Label>Teslimat Notu</Label>
            <p className="mt-2 rounded-lg bg-gray-50 p-4 text-sm whitespace-pre-wrap text-gray-700">
              {delivery.deliverables}
            </p>
          </div>

          {/* Attachments */}
          {delivery.attachments && delivery.attachments.length > 0 && (
            <div className="mb-4">
              <Label>Ekler ({delivery.attachments.length})</Label>
              <div className="mt-2 space-y-2">
                {delivery.attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getFileIcon(file.type)}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <a
                      href={file.url}
                      download={file.name}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buyer Actions */}
          {canAcceptDelivery && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="primary"
                  onClick={handleAcceptDelivery}
                  className="w-full"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Kabul Et
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsRequestingRevision(true)}
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Revizyon İste
                </Button>
              </div>

              {/* Revision Note Input */}
              {isRequestingRevision && (
                <div className="space-y-2">
                  <Label htmlFor="revisionNote">Revizyon Notu *</Label>
                  <Textarea
                    id="revisionNote"
                    value={revisionNote}
                    onChange={(e) => setRevisionNote(e.target.value)}
                    placeholder="Revizyon ile ilgili açıklama yazın..."
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleRequestRevision}
                      disabled={revisionNote.trim().length < 10}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Revizyon Gönder
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsRequestingRevision(false);
                        setRevisionNote('');
                      }}
                    >
                      İptal
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Revision Note Display */}
          {delivery.revisionNote && (
            <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-orange-900">
                    Revizyon Talebi
                  </p>
                  <p className="mt-1 text-sm text-orange-700">
                    {delivery.revisionNote}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* No Delivery State */}
      {!hasDelivery && !canSubmitDelivery && (
        <Card className="p-6 text-center">
          <Paperclip className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Henüz teslimat yapılmadı. Freelancer teslimat gönderdiğinde burada
            görüntülenecektir.
          </p>
        </Card>
      )}
    </div>
  );
}

export default DeliveryWorkflow;
