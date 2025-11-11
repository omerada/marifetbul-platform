/**
 * ================================================
 * PAYMENT PROOF UPLOAD MODAL
 * ================================================
 * Modal for uploading payment proof (dekont/receipt) for manual IBAN transfers
 *
 * Features:
 * - Drag & drop file upload
 * - Image preview
 * - File validation (size, format)
 * - Progress indication
 * - Success/error states
 * - Accessibility (keyboard, ARIA)
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 1: Epic 2 Story 2.2
 */

'use client';

import React, { useState, useRef, useCallback, ChangeEvent } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Check,
  AlertCircle,
  FileImage,
  Loader2,
} from 'lucide-react';
import * as manualPaymentApi from '@/lib/api/manual-payment-api';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// TYPES
// ================================================

export interface PaymentProofUploadModalProps {
  /**
   * Order ID for payment proof
   */
  orderId: string;

  /**
   * Payment amount
   */
  amount: number;

  /**
   * Currency
   */
  currency?: string;

  /**
   * Whether modal is open
   */
  isOpen: boolean;

  /**
   * Callback when modal is closed
   */
  onClose: () => void;

  /**
   * Callback when upload is successful
   */
  onUploadSuccess: (fileUrl: string) => void;

  /**
   * Callback when upload fails
   */
  onUploadError?: (error: string) => void;
}

interface UploadState {
  file: File | null;
  preview: string | null;
  uploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
}

// ================================================
// CONSTANTS
// ================================================

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

// ================================================
// HELPER FUNCTIONS
// ================================================

/**
 * Validate file size and format
 */
const validateFile = (file: File): string | null => {
  if (!ALLOWED_FORMATS.includes(file.type)) {
    return `Geçersiz dosya formatı. Lütfen ${ALLOWED_EXTENSIONS.join(', ')} formatlarından birini kullanın.`;
  }

  if (file.size > MAX_FILE_SIZE) {
    return `Dosya boyutu çok büyük. Maksimum ${MAX_FILE_SIZE / (1024 * 1024)}MB olmalıdır.`;
  }

  return null;
};

/**
 * Format file size for display
 */
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Create preview URL from file
 */
const createPreviewUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

// ================================================
// COMPONENT
// ================================================

export const PaymentProofUploadModal: React.FC<
  PaymentProofUploadModalProps
> = ({
  orderId,
  amount,
  currency = 'TRY',
  isOpen,
  onClose,
  onUploadSuccess,
  onUploadError,
}) => {
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    preview: null,
    uploading: false,
    progress: 0,
    error: null,
    success: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  /**
   * Reset upload state
   */
  const resetState = useCallback(() => {
    setUploadState({
      file: null,
      preview: null,
      uploading: false,
      progress: 0,
      error: null,
      success: false,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback(async (file: File) => {
    // Validate file
    const error = validateFile(file);
    if (error) {
      setUploadState((prev) => ({ ...prev, error, file: null, preview: null }));
      return;
    }

    // Create preview
    try {
      const preview = await createPreviewUrl(file);
      setUploadState({
        file,
        preview,
        uploading: false,
        progress: 0,
        error: null,
        success: false,
      });
    } catch (err) {
      setUploadState((prev) => ({
        ...prev,
        error: 'Önizleme oluşturulamadı',
        file: null,
        preview: null,
      }));
    }
  }, []);

  /**
   * Handle file input change
   */
  const handleFileInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  /**
   * Handle drag events
   */
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

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  /**
   * Handle upload
   */
  const handleUpload = useCallback(async () => {
    if (!uploadState.file) return;

    setUploadState((prev: UploadState) => ({ 
      ...prev, 
      uploading: true, 
      progress: 0, 
      error: null 
    }));

    try {
      // Upload payment proof to backend
      const response = await manualPaymentApi.uploadPaymentProof({
        file: uploadState.file,
        orderId,
        amount,
        currency: 'TRY',
      });

      logger.info('Payment proof uploaded successfully', {
        orderId,
        fileUrl: response.fileUrl,
      });

      setUploadState((prev: UploadState) => ({
        ...prev,
        uploading: false,
        success: true,
        progress: 100,
      }));

      // Call success callback after delay
      setTimeout(() => {
        onUploadSuccess(response.fileUrl);
        resetState();
        onClose();
      }, 1500);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Yükleme sırasında hata oluştu';
      
      logger.error('Payment proof upload failed', error as Error, {
        orderId,
        fileSize: uploadState.file.size,
      });

      setUploadState((prev: UploadState) => ({
        ...prev,
        uploading: false,
        error: errorMessage,
        progress: 0,
      }));
      onUploadError?.(errorMessage);
    }
  }, [uploadState.file, orderId, amount, onUploadSuccess, onUploadError, onClose, resetState]);

  /**
   * Handle modal close
   */
  const handleClose = useCallback(() => {
    if (!uploadState.uploading) {
      resetState();
      onClose();
    }
  }, [uploadState.uploading, resetState, onClose]);

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div
          className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
                Ödeme Kanıtı Yükle
              </h2>
              <p className="text-sm text-gray-600">
                Banka dekontunuzu veya ödeme ekran görüntüsünü yükleyin
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={uploadState.uploading}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Kapat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* Order Info */}
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sipariş No:</span>
                <span className="font-mono font-medium text-gray-900">
                  {orderId.slice(-8).toUpperCase()}
                </span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-gray-600">Tutar:</span>
                <span className="font-semibold text-gray-900">
                  {amount.toLocaleString('tr-TR', {
                    minimumFractionDigits: 2,
                  })}{' '}
                  {currency}
                </span>
              </div>
            </div>

            {/* Upload Area */}
            {!uploadState.preview ? (
              <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  relative rounded-lg border-2 border-dashed p-8 text-center transition-colors
                  ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 bg-gray-50'
                  }
                  ${uploadState.error ? 'border-red-300 bg-red-50' : ''}
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ALLOWED_EXTENSIONS.join(',')}
                  onChange={handleFileInputChange}
                  className="hidden"
                  aria-label="Dosya seç"
                />

                <div className="space-y-3">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                    <Upload className="h-8 w-8 text-blue-600" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Dosya yüklemek için tıklayın veya sürükleyin
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      PNG, JPG, WEBP (Maks. {MAX_FILE_SIZE / (1024 * 1024)}MB)
                    </p>
                  </div>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <FileImage className="h-4 w-4" />
                    Dosya Seç
                  </button>
                </div>
              </div>
            ) : (
              /* Preview Area */
              <div className="space-y-3">
                <div className="relative overflow-hidden rounded-lg border border-gray-200">
                  <img
                    src={uploadState.preview}
                    alt="Payment proof preview"
                    className="h-64 w-full object-contain bg-gray-100"
                  />
                </div>

                {uploadState.file && (
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <ImageIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {uploadState.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(uploadState.file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={resetState}
                      disabled={uploadState.uploading}
                      className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      aria-label="Dosyayı kaldır"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Progress Bar */}
                {uploadState.uploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Yükleniyor...</span>
                      <span className="font-medium text-gray-900">
                        {uploadState.progress}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${uploadState.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {uploadState.success && (
                  <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-green-800">
                    <Check className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm font-medium">
                      Ödeme kanıtı başarıyla yüklendi!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {uploadState.error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-800">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{uploadState.error}</p>
              </div>
            )}

            {/* Info Message */}
            <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
              <div className="flex items-start gap-2 text-sm text-blue-800">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium">Dikkat Edilmesi Gerekenler:</p>
                  <ul className="list-disc list-inside text-xs space-y-0.5">
                    <li>Dekontunuzda tutar ve tarih net görünmelidir</li>
                    <li>Fotoğraf bulanık veya okunamaz olmamalıdır</li>
                    <li>
                      Ödeme kanıtı yüklendikten sonra 1-2 iş günü içinde
                      onaylanacaktır
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <button
              onClick={handleClose}
              disabled={uploadState.uploading}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              İptal
            </button>
            <button
              onClick={handleUpload}
              disabled={!uploadState.file || uploadState.uploading || uploadState.success}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadState.uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Yükleniyor...
                </>
              ) : uploadState.success ? (
                <>
                  <Check className="h-4 w-4" />
                  Yüklendi
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Yükle
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ================================================
// DISPLAY NAME
// ================================================

PaymentProofUploadModal.displayName = 'PaymentProofUploadModal';
