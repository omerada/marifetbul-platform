'use client';

/**
 * ================================================
 * DELIVERY MANAGER COMPONENT
 * ================================================
 * Comprehensive delivery management for orders
 *
 * Features:
 * - File upload with progress tracking
 * - Delivery notes with rich formatting
 * - Delivery acceptance/rejection flow
 * - Revision counter validation
 * - Metadata display (size, type, upload date)
 * - Role-based actions (seller/buyer)
 * - Error handling & validation
 * - Real-time upload progress
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 1.4: Delivery Management System
 */

'use client';

import React, { useState, useCallback } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Badge,
  Textarea,
  Label,
} from '@/components/ui';
import { CardTitle } from '@/components/ui/Card';
import {
  Upload,
  File,
  X,
  Download,
  Check,
  AlertCircle,
  FileText,
  RefreshCw,
  XCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/lib/shared/formatters';
import { z } from 'zod';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// TYPE DEFINITIONS
// ================================================

export interface DeliveryFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

export interface DeliveryData {
  id: string;
  orderId: string;
  note: string;
  files: DeliveryFile[];
  submittedAt: string;
  submittedBy: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'REVISION_REQUESTED';
  revisionCount?: number;
  maxRevisions?: number;
}

export interface DeliveryManagerProps {
  orderId: string;
  orderTitle: string;
  currentDelivery?: DeliveryData | null;
  userRole: 'SELLER' | 'BUYER';
  revisionCount?: number;
  maxRevisions?: number;
  onSubmitDelivery?: (data: {
    note: string;
    files: DeliveryFile[];
  }) => Promise<void>;
  onAcceptDelivery?: (deliveryId: string) => Promise<void>;
  onRejectDelivery?: (deliveryId: string, reason: string) => Promise<void>;
  onRequestRevision?: (deliveryId: string, reason: string) => Promise<void>;
  onUploadFile?: (file: File) => Promise<DeliveryFile>;
  className?: string;
  compact?: boolean;
}

// ================================================
// VALIDATION SCHEMAS
// ================================================

const deliveryNoteSchema = z.object({
  note: z
    .string()
    .min(20, 'Teslimat notu en az 20 karakter olmalıdır')
    .max(2000, 'Teslimat notu en fazla 2000 karakter olabilir'),
});

const rejectionReasonSchema = z.object({
  reason: z
    .string()
    .min(10, 'Red nedeni en az 10 karakter olmalıdır')
    .max(500, 'Red nedeni en fazla 500 karakter olabilir'),
});

// ================================================
// UTILITY FUNCTIONS
// ================================================

function getFileIcon(type: string): React.ReactNode {
  if (type.startsWith('image/')) return '🖼️';
  if (type.startsWith('video/')) return '🎥';
  if (type.startsWith('audio/')) return '🎵';
  if (type.includes('pdf')) return '📄';
  if (type.includes('zip') || type.includes('rar')) return '📦';
  return '📎';
}

// ================================================
// MAIN COMPONENT
// ================================================

export function DeliveryManager({
  orderId,
  orderTitle,
  currentDelivery,
  userRole,
  revisionCount = 0,
  maxRevisions = 3,
  onSubmitDelivery,
  onAcceptDelivery,
  onRejectDelivery,
  onRequestRevision,
  onUploadFile,
  className,
  compact = false,
}: DeliveryManagerProps) {
  // ================================================
  // STATE MANAGEMENT
  // ================================================

  const [deliveryNote, setDeliveryNote] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<DeliveryFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Rejection/Revision modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [revisionReason, setRevisionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // ================================================
  // FILE UPLOAD HANDLERS
  // ================================================

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;

      setIsUploading(true);
      setErrors((prev) => ({ ...prev, upload: '' }));

      try {
        const uploadPromises = Array.from(files).map(async (file) => {
          // Validate file size (max 50MB)
          if (file.size > 50 * 1024 * 1024) {
            throw new Error(`${file.name} çok büyük (max 50MB)`);
          }

          const fileId = `${Date.now()}-${file.name}`;
          setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));

          try {
            let uploadedFile: DeliveryFile;

            if (onUploadFile) {
              // Use provided upload function
              uploadedFile = await onUploadFile(file);
            } else {
              // Use canonical file upload service (PRODUCTION-READY)
              const { fileUploadService } = await import(
                '@/lib/services/file-upload.service'
              );

              const result = await fileUploadService.uploadFile(file, {
                folder: 'order-deliveries',
                backend: 'cloudinary',
                authenticated: true,
                onProgress: (progress) => {
                  setUploadProgress((prev) => ({
                    ...prev,
                    [fileId]: progress.progress,
                  }));
                },
              });

              uploadedFile = {
                id: result.id,
                name: result.fileName,
                url: result.fileUrl,
                size: result.fileSize,
                type: result.fileType,
                uploadedAt: result.uploadedAt,
              };
            }

            setUploadProgress((prev) => ({ ...prev, [fileId]: 100 }));
            return uploadedFile;
          } catch (error) {
            setUploadProgress((prev) => {
              const newProgress = { ...prev };
              delete newProgress[fileId];
              return newProgress;
            });
            throw error;
          }
        });

        const newFiles = await Promise.all(uploadPromises);
        setUploadedFiles((prev) => [...prev, ...newFiles]);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Dosya yüklenirken hata oluştu';
        setErrors((prev) => ({ ...prev, upload: errorMessage }));
        logger.error(
          'File upload error',
          error instanceof Error ? error : new Error(errorMessage)
        );
      } finally {
        setIsUploading(false);
        // Clear progress after 1 second
        setTimeout(() => setUploadProgress({}), 1000);
      }
    },
    [onUploadFile]
  );

  const handleRemoveFile = useCallback((fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  }, []);

  // ================================================
  // DELIVERY SUBMISSION
  // ================================================

  const handleSubmitDelivery = useCallback(async () => {
    setErrors({});

    // Validate delivery note
    const noteValidation = deliveryNoteSchema.safeParse({ note: deliveryNote });
    if (!noteValidation.success) {
      setErrors({ note: noteValidation.error.issues[0].message });
      return;
    }

    // Validate files
    if (uploadedFiles.length === 0) {
      setErrors({ files: 'En az 1 dosya yüklemelisiniz' });
      return;
    }

    // Check revision limit
    if (revisionCount >= maxRevisions) {
      setErrors({
        revision: `Maksimum revizyon sayısına (${maxRevisions}) ulaşıldı`,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (onSubmitDelivery) {
        await onSubmitDelivery({
          note: deliveryNote,
          files: uploadedFiles,
        });
      }

      // Reset form on success
      setDeliveryNote('');
      setUploadedFiles([]);

      logger.info('Delivery submitted successfully', { orderId });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Teslimat gönderilirken hata oluştu';
      setErrors({ submit: errorMessage });
      logger.error(
        'Delivery submission error',
        error instanceof Error ? error : new Error(errorMessage)
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    deliveryNote,
    uploadedFiles,
    revisionCount,
    maxRevisions,
    orderId,
    onSubmitDelivery,
  ]);

  // ================================================
  // DELIVERY ACCEPTANCE
  // ================================================

  const handleAcceptDelivery = useCallback(async () => {
    if (!currentDelivery || !onAcceptDelivery) return;

    setIsProcessing(true);
    try {
      await onAcceptDelivery(currentDelivery.id);
      logger.info('Delivery accepted', { deliveryId: currentDelivery.id });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Teslimat onaylanırken hata oluştu';
      setErrors({ accept: errorMessage });
      logger.error(
        'Delivery acceptance error',
        error instanceof Error ? error : new Error(errorMessage)
      );
    } finally {
      setIsProcessing(false);
    }
  }, [currentDelivery, onAcceptDelivery]);

  // ================================================
  // DELIVERY REJECTION
  // ================================================

  const handleRejectDelivery = useCallback(async () => {
    if (!currentDelivery || !onRejectDelivery) return;

    // Validate reason
    const reasonValidation = rejectionReasonSchema.safeParse({
      reason: rejectionReason,
    });
    if (!reasonValidation.success) {
      setErrors({ reject: reasonValidation.error.issues[0].message });
      return;
    }

    setIsProcessing(true);
    try {
      await onRejectDelivery(currentDelivery.id, rejectionReason);
      setShowRejectModal(false);
      setRejectionReason('');
      logger.info('Delivery rejected', { deliveryId: currentDelivery.id });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Teslimat reddedilirken hata oluştu';
      setErrors({ reject: errorMessage });
      logger.error(
        'Delivery rejection error',
        error instanceof Error ? error : new Error(errorMessage)
      );
    } finally {
      setIsProcessing(false);
    }
  }, [currentDelivery, rejectionReason, onRejectDelivery]);

  // ================================================
  // REVISION REQUEST
  // ================================================

  const handleRequestRevision = useCallback(async () => {
    if (!currentDelivery || !onRequestRevision) return;

    // Validate reason
    const reasonValidation = rejectionReasonSchema.safeParse({
      reason: revisionReason,
    });
    if (!reasonValidation.success) {
      setErrors({ revision: reasonValidation.error.issues[0].message });
      return;
    }

    // Check revision limit
    if (revisionCount >= maxRevisions) {
      setErrors({
        revision: `Maksimum revizyon sayısına (${maxRevisions}) ulaşıldı`,
      });
      return;
    }

    setIsProcessing(true);
    try {
      await onRequestRevision(currentDelivery.id, revisionReason);
      setShowRevisionModal(false);
      setRevisionReason('');
      logger.info('Revision requested', { deliveryId: currentDelivery.id });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Revizyon talep edilirken hata oluştu';
      setErrors({ revision: errorMessage });
      logger.error(
        'Revision request error',
        error instanceof Error ? error : new Error(errorMessage)
      );
    } finally {
      setIsProcessing(false);
    }
  }, [
    currentDelivery,
    revisionReason,
    revisionCount,
    maxRevisions,
    onRequestRevision,
  ]);

  // ================================================
  // RENDER: CURRENT DELIVERY VIEW (BUYER)
  // ================================================

  const renderCurrentDelivery = () => {
    if (!currentDelivery) return null;

    return (
      <div className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <Badge
            variant={
              currentDelivery.status === 'ACCEPTED'
                ? 'success'
                : currentDelivery.status === 'REJECTED'
                  ? 'destructive'
                  : 'default'
            }
          >
            {currentDelivery.status === 'PENDING' && '⏳ Onay Bekliyor'}
            {currentDelivery.status === 'ACCEPTED' && '✅ Onaylandı'}
            {currentDelivery.status === 'REJECTED' && '❌ Reddedildi'}
            {currentDelivery.status === 'REVISION_REQUESTED' &&
              '🔄 Revizyon Talep Edildi'}
          </Badge>
          <span className="text-sm text-gray-500">
            {new Date(currentDelivery.submittedAt).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        {/* Delivery Note */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-600" />
            <span className="font-medium text-gray-700">Teslimat Notu</span>
          </div>
          <p className="text-sm whitespace-pre-wrap text-gray-600">
            {currentDelivery.note}
          </p>
        </div>

        {/* Files */}
        {currentDelivery.files.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Dosyalar ({currentDelivery.files.length})
            </Label>
            <div className="space-y-2">
              {currentDelivery.files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getFileIcon(file.type)}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)} •{' '}
                        {new Date(file.uploadedAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(file.url, '_blank')}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Buyer Actions */}
        {userRole === 'BUYER' && currentDelivery.status === 'PENDING' && (
          <div className="flex flex-wrap gap-2 pt-4">
            <Button
              onClick={handleAcceptDelivery}
              disabled={isProcessing}
              className="flex-1"
              variant="primary"
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Teslimatı Onayla
            </Button>

            {revisionCount < maxRevisions && (
              <Button
                onClick={() => setShowRevisionModal(true)}
                disabled={isProcessing}
                variant="outline"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Revizyon İste ({revisionCount}/{maxRevisions})
              </Button>
            )}

            <Button
              onClick={() => setShowRejectModal(true)}
              disabled={isProcessing}
              variant="destructive"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reddet
            </Button>
          </div>
        )}

        {/* Error Display */}
        {(errors.accept || errors.reject || errors.revision) && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
              <p className="text-sm text-red-700">
                {errors.accept || errors.reject || errors.revision}
              </p>
            </div>
          </div>
        )}

        {/* Revision/Rejection Modals */}
        {showRevisionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Revizyon Talebi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="revision-reason">Revizyon Nedeni *</Label>
                  <Textarea
                    id="revision-reason"
                    value={revisionReason}
                    onChange={(e) => setRevisionReason(e.target.value)}
                    placeholder="Neyin değiştirilmesini istediğinizi detaylı açıklayın..."
                    rows={4}
                    className={cn(errors.revision && 'border-red-500')}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {revisionReason.length}/500 karakter
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleRequestRevision}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    {isProcessing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Revizyon Talep Et
                  </Button>
                  <Button
                    onClick={() => {
                      setShowRevisionModal(false);
                      setRevisionReason('');
                      setErrors((prev) => ({ ...prev, revision: '' }));
                    }}
                    variant="outline"
                    disabled={isProcessing}
                  >
                    İptal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Teslimatı Reddet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="reject-reason">Red Nedeni *</Label>
                  <Textarea
                    id="reject-reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Teslimatı neden reddettiğinizi açıklayın..."
                    rows={4}
                    className={cn(errors.reject && 'border-red-500')}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {rejectionReason.length}/500 karakter
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleRejectDelivery}
                    disabled={isProcessing}
                    variant="destructive"
                    className="flex-1"
                  >
                    {isProcessing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="mr-2 h-4 w-4" />
                    )}
                    Reddet
                  </Button>
                  <Button
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectionReason('');
                      setErrors((prev) => ({ ...prev, reject: '' }));
                    }}
                    variant="outline"
                    disabled={isProcessing}
                  >
                    İptal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  };

  // ================================================
  // RENDER: UPLOAD FORM (SELLER)
  // ================================================

  const renderUploadForm = () => {
    if (userRole !== 'SELLER') return null;
    if (currentDelivery && currentDelivery.status === 'PENDING') {
      return (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-900">
                Teslimat Onay Bekliyor
              </p>
              <p className="mt-1 text-sm text-yellow-700">
                Alıcı teslimatınızı inceliyor. Onaylanana kadar yeni teslimat
                yapamazsınız.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Revision Counter */}
        {maxRevisions > 0 && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Kalan Revizyon Hakkı
              </span>
              <Badge
                variant={
                  revisionCount >= maxRevisions ? 'destructive' : 'default'
                }
              >
                {maxRevisions - revisionCount} / {maxRevisions}
              </Badge>
            </div>
          </div>
        )}

        {/* Delivery Note */}
        <div>
          <Label htmlFor="delivery-note">Teslimat Notu *</Label>
          <Textarea
            id="delivery-note"
            value={deliveryNote}
            onChange={(e) => setDeliveryNote(e.target.value)}
            placeholder="Teslimat hakkında detaylı bilgi verin..."
            rows={compact ? 3 : 5}
            className={cn(errors.note && 'border-red-500')}
          />
          <p className="mt-1 text-xs text-gray-500">
            {deliveryNote.length}/2000 karakter
          </p>
          {errors.note && (
            <p className="mt-1 text-xs text-red-600">{errors.note}</p>
          )}
        </div>

        {/* File Upload */}
        <div>
          <Label>Dosyalar *</Label>
          <div className="mt-2">
            <label
              htmlFor="file-upload"
              className={cn(
                'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
                isUploading
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50',
                errors.files && 'border-red-500'
              )}
            >
              {isUploading ? (
                <Loader2 className="mb-2 h-8 w-8 animate-spin text-blue-600" />
              ) : (
                <Upload className="mb-2 h-8 w-8 text-gray-400" />
              )}
              <p className="text-sm font-medium text-gray-700">
                {isUploading ? 'Yükleniyor...' : 'Dosya Seçin veya Sürükleyin'}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                PNG, JPG, PDF, ZIP (max 50MB)
              </p>
              <input
                id="file-upload"
                type="file"
                multiple
                onChange={handleFileSelect}
                disabled={isUploading || isSubmitting}
                className="hidden"
                accept="image/*,application/pdf,.zip,.rar"
              />
            </label>
            {errors.files && (
              <p className="mt-1 text-xs text-red-600">{errors.files}</p>
            )}
            {errors.upload && (
              <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2">
                <p className="text-xs text-red-700">{errors.upload}</p>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {Object.keys(uploadProgress).length > 0 && (
            <div className="mt-2 space-y-2">
              {Object.entries(uploadProgress).map(([fileId, progress]) => (
                <div key={fileId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{fileId.split('-')[1]}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
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
                    onClick={() => handleRemoveFile(file.id)}
                    disabled={isSubmitting}
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
            isSubmitting || isUploading || revisionCount >= maxRevisions
          }
          className="w-full"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          Teslimatı Gönder
        </Button>

        {/* Error Display */}
        {(errors.submit || errors.revision) && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
              <p className="text-sm text-red-700">
                {errors.submit || errors.revision}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ================================================
  // MAIN RENDER
  // ================================================

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <File className="h-5 w-5" />
            {userRole === 'SELLER' ? 'Teslimat Yönetimi' : 'Teslimat İnceleme'}
          </span>
          {currentDelivery && (
            <Badge variant="outline" className="text-xs">
              Sipariş: {orderTitle}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {currentDelivery ? renderCurrentDelivery() : renderUploadForm()}
      </CardContent>
    </Card>
  );
}
