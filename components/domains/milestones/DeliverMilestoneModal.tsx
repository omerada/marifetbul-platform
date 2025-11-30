/**
 * ================================================
 * DELIVER MILESTONE MODAL
 * ================================================
 * Freelancer modal for delivering completed milestone
 * Sprint 1 - Story 1.4 (13 pts)
 *
 * Features:
 * - Delivery notes (min 20 chars, max 2000)
 * - File upload (max 5 files, 10MB each)
 * - Drag & drop support
 * - Upload progress indicators
 * - Validation with error messages
 * - Success state with confetti
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 1 - Milestone Payment System
 */

'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Card } from '@/components/ui';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Alert, AlertDescription } from '@/components/ui';
import {
  Upload,
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  File,
  Image as ImageIcon,
} from 'lucide-react';
import { useMilestoneActions } from '@/hooks/business/useMilestones';
import { fileUploadService } from '@/lib/services/file-upload.service';
import type { OrderMilestone } from '@/types/business/features/milestone';
import { formatFileSize } from '@/lib/shared/formatters';
import logger from '@/lib/infrastructure/monitoring/logger';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================

export interface DeliverMilestoneModalProps {
  /** Milestone to deliver */
  milestone: OrderMilestone;
  /** Close modal callback */
  onClose: () => void;
  /** Success callback (optional) */
  onSuccess?: () => void;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  progress: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MIN_NOTES_LENGTH = 20;
const MAX_NOTES_LENGTH = 2000;
const ALLOWED_TYPES = [
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // Archives
  'application/zip',
  'application/x-rar-compressed',
  // Text
  'text/plain',
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * DeliverMilestoneModal Component
 *
 * @example
 * ```tsx
 * <DeliverMilestoneModal
 *   milestone={milestone}
 *   onClose={() => setShowModal(false)}
 *   onSuccess={() => refetchMilestones()}
 * />
 * ```
 */
export function DeliverMilestoneModal({
  milestone,
  onClose,
  onSuccess,
}: DeliverMilestoneModalProps) {
  const { deliverMilestone, isDelivering } = useMilestoneActions();

  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [notesError, setNotesError] = useState('');
  const [uploadingCount, setUploadingCount] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ========== VALIDATION ==========

  const validateNotes = useCallback((notes: string): string => {
    if (notes.trim().length < MIN_NOTES_LENGTH) {
      return `Teslim notları en az ${MIN_NOTES_LENGTH} karakter olmalıdır`;
    }
    if (notes.length > MAX_NOTES_LENGTH) {
      return `Teslim notları en fazla ${MAX_NOTES_LENGTH} karakter olabilir`;
    }
    return '';
  }, []);

  const validateFile = useCallback(
    (file: File): string => {
      // Size check
      if (file.size > MAX_FILE_SIZE) {
        return `${file.name} çok büyük (max ${formatFileSize(MAX_FILE_SIZE)})`;
      }

      // Type check
      if (!ALLOWED_TYPES.includes(file.type)) {
        return `${file.name} desteklenmeyen dosya türü`;
      }

      // Count check
      if (uploadedFiles.length >= MAX_FILES) {
        return `Maksimum ${MAX_FILES} dosya yükleyebilirsiniz`;
      }

      return '';
    },
    [uploadedFiles.length]
  );

  // ========== FILE UPLOAD ==========

  const handleFileUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      setError('');
      const filesToUpload = Array.from(files);

      // Validate all files first
      for (const file of filesToUpload) {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          return;
        }
      }

      // Check total count
      if (uploadedFiles.length + filesToUpload.length > MAX_FILES) {
        setError(`Maksimum ${MAX_FILES} dosya yükleyebilirsiniz`);
        return;
      }

      // Upload files
      setUploadingCount(filesToUpload.length);

      for (const file of filesToUpload) {
        const tempId = `temp-${Date.now()}-${Math.random()}`;

        // Add to UI immediately with 0% progress
        const tempFile: UploadedFile = {
          id: tempId,
          name: file.name,
          size: file.size,
          type: file.type,
          url: '',
          progress: 0,
        };

        setUploadedFiles((prev) => [...prev, tempFile]);

        try {
          // Upload to server
          const result = await fileUploadService.uploadFile(file, {
            folder: 'milestones',
            authenticated: true,
            onProgress: (progress) => {
              setUploadedFiles((prev) =>
                prev.map((f) =>
                  f.id === tempId ? { ...f, progress: progress.progress } : f
                )
              );
            },
          });

          // Update with real data
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === tempId
                ? {
                    id: result.id,
                    name: result.fileName,
                    size: result.fileSize,
                    type: result.fileType,
                    url: result.fileUrl,
                    progress: 100,
                  }
                : f
            )
          );

          logger.info('[DeliverMilestone] File uploaded', {
            milestoneId: milestone.id,
            fileName: result.fileName,
          });
        } catch (err) {
          logger.error(
            '[DeliverMilestone] Upload failed',
            err instanceof Error ? err : new Error(String(err))
          );

          // Remove failed upload
          setUploadedFiles((prev) => prev.filter((f) => f.id !== tempId));
          setError(
            `${file.name} yüklenemedi: ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`
          );
        } finally {
          setUploadingCount((prev) => prev - 1);
        }
      }
    },
    [uploadedFiles.length, validateFile, milestone.id]
  );

  // ========== DRAG & DROP ==========

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

      const files = e.dataTransfer.files;
      void handleFileUpload(files);
    },
    [handleFileUpload]
  );

  // ========== REMOVE FILE ==========

  const handleRemoveFile = useCallback((fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
    setError('');
  }, []);

  // ========== SUBMIT ==========

  const handleSubmit = useCallback(async () => {
    // Validate notes
    const notesValidation = validateNotes(deliveryNotes);
    if (notesValidation) {
      setNotesError(notesValidation);
      return;
    }

    // Check if any files are still uploading
    if (uploadingCount > 0) {
      setError('Lütfen dosya yüklemelerinin tamamlanmasını bekleyin');
      return;
    }

    try {
      setError('');
      setNotesError('');

      // Prepare attachments (comma-separated URLs)
      const attachmentUrls = uploadedFiles.map((f) => f.url).join(',');

      await deliverMilestone(milestone.id, {
        deliveryNotes,
        attachments: attachmentUrls || undefined,
      });

      toast.success('Milestone teslim edildi! 🎉', {
        description: 'Alıcının onayı bekleniyor',
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      logger.error(
        '[DeliverMilestone] Submit failed',
        err instanceof Error ? err : new Error(String(err))
      );
      setError(
        err instanceof Error
          ? err.message
          : 'Milestone teslim edilemedi. Lütfen tekrar deneyin.'
      );
    }
  }, [
    deliveryNotes,
    uploadedFiles,
    uploadingCount,
    validateNotes,
    deliverMilestone,
    milestone.id,
    onSuccess,
    onClose,
  ]);

  // ========== NOTES CHANGE ==========

  const handleNotesChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setDeliveryNotes(value);

      // Clear error when user starts typing
      if (notesError) {
        setNotesError('');
      }

      // Show validation error in real-time (optional)
      if (value.length > MAX_NOTES_LENGTH) {
        setNotesError(`Maksimum ${MAX_NOTES_LENGTH} karakter`);
      }
    },
    [notesError]
  );

  // ========== RENDER ==========

  const canSubmit =
    deliveryNotes.trim().length >= MIN_NOTES_LENGTH &&
    deliveryNotes.length <= MAX_NOTES_LENGTH &&
    uploadingCount === 0 &&
    !isDelivering;

  const completedFiles = uploadedFiles.filter((f) => f.progress === 100);
  const uploadingFiles = uploadedFiles.filter((f) => f.progress < 100);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card
          className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Milestone Teslim Et
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                #{milestone.sequence} - {milestone.title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-gray-100"
              aria-label="Kapat"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Body */}
          <div className="space-y-6 p-6">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Delivery Notes */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Teslim Notları <span className="text-red-500">*</span>
              </label>
              <textarea
                value={deliveryNotes}
                onChange={handleNotesChange}
                placeholder="Tamamladığınız işi detaylı olarak açıklayın..."
                rows={6}
                className={`w-full rounded-lg border px-4 py-3 transition-shadow focus:border-transparent focus:ring-2 focus:ring-purple-500 ${
                  notesError ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isDelivering}
              />
              <div className="mt-2 flex items-center justify-between">
                {notesError ? (
                  <p className="text-sm text-red-600">{notesError}</p>
                ) : (
                  <p className="text-sm text-gray-500">
                    Min {MIN_NOTES_LENGTH} karakter gerekli
                  </p>
                )}
                <span
                  className={`text-sm ${
                    deliveryNotes.length > MAX_NOTES_LENGTH
                      ? 'text-red-600'
                      : 'text-gray-500'
                  }`}
                >
                  {deliveryNotes.length} / {MAX_NOTES_LENGTH}
                </span>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Dosyalar (İsteğe Bağlı)
              </label>
              <p className="mb-3 text-sm text-gray-500">
                Tamamlanmış işinizle ilgili dosyalar yükleyin (max {MAX_FILES}{' '}
                dosya, her biri {formatFileSize(MAX_FILE_SIZE)})
              </p>

              {/* Upload Zone */}
              <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                  isDragging
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-300 bg-gray-50'
                } ${uploadedFiles.length >= MAX_FILES ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-purple-400'}`}
                onClick={() =>
                  uploadedFiles.length < MAX_FILES &&
                  fileInputRef.current?.click()
                }
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={ALLOWED_TYPES.join(',')}
                  onChange={(e) => void handleFileUpload(e.target.files)}
                  className="hidden"
                  disabled={uploadedFiles.length >= MAX_FILES || isDelivering}
                />

                <Upload className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                <p className="mb-1 font-medium text-gray-700">
                  Dosyaları sürükleyin veya tıklayın
                </p>
                <p className="text-sm text-gray-500">
                  PDF, Word, Excel, Resim, ZIP ({formatFileSize(MAX_FILE_SIZE)}{' '}
                  max)
                </p>
              </div>

              {/* Uploading Files */}
              {uploadingFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    Yükleniyor...
                  </p>
                  {uploadingFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3"
                    >
                      <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin text-blue-600" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {file.name}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-blue-200">
                            <div
                              className="h-full bg-blue-600 transition-all duration-300"
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-blue-700">
                            {file.progress}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Uploaded Files */}
              {completedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    Yüklenen Dosyalar ({completedFiles.length}/{MAX_FILES})
                  </p>
                  {completedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3"
                    >
                      {file.type.startsWith('image/') ? (
                        <ImageIcon className="h-5 w-5 flex-shrink-0 text-green-600" />
                      ) : (
                        <File className="h-5 w-5 flex-shrink-0 text-green-600" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />
                      <button
                        onClick={() => handleRemoveFile(file.id)}
                        className="rounded p-1 transition-colors hover:bg-red-100"
                        disabled={isDelivering}
                        aria-label="Kaldır"
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info Alert */}
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <strong>Not:</strong> Teslim ettikten sonra alıcı işinizi
                inceleyecek ve 48 saat içinde onaylayacak veya revizyon
                isteyecektir.
              </AlertDescription>
            </Alert>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t bg-gray-50 px-6 py-4">
            <Button onClick={onClose} variant="outline" disabled={isDelivering}>
              İptal
            </Button>
            <Button
              onClick={() => void handleSubmit()}
              variant="primary"
              disabled={!canSubmit}
              loading={isDelivering}
              className="gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Teslim Et
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}

export default DeliverMilestoneModal;
