/**
 * ================================================
 * PAYMENT PROOF UPLOAD FORM (BUYER SIDE)
 * ================================================
 * Buyer uploads payment proof (dekont/receipt) for manual IBAN transfers
 *
 * Features:
 * - Drag-and-drop file upload with preview
 * - Transaction reference input
 * - Amount validation
 * - File type/size validation (max 5MB, images/PDFs only)
 * - Optional notes field
 * - Progress indicator
 * - Success confirmation with status display
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @sprint Sprint 1 Epic 1.2 Story 1.2.2 - Manual Payment Improvement
 */

'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import {
  Upload,
  File,
  FileText,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Info,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  uploadPaymentProof,
  type PaymentProofResponse,
} from '@/lib/api/manual-payment-api';
import type { ManualPaymentProofResponse } from '@/types/backend-aligned';

// ================================================
// TYPES
// ================================================

export interface PaymentProofUploadFormProps {
  /** Order ID */
  orderId: string;
  /** Order number for display */
  orderNumber: string;
  /** Expected payment amount */
  expectedAmount: number;
  /** Currency code */
  currency?: string;
  /** Seller name */
  sellerName?: string;
  /** Seller IBAN (masked) */
  sellerIban?: string;
  /** Callback on successful upload */
  onSuccess?: (
    proof: ManualPaymentProofResponse | PaymentProofResponse
  ) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
  /** Custom className */
  className?: string;
}

// ================================================
// CONSTANTS
// ================================================

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];

// ================================================
// COMPONENT
// ================================================

export function PaymentProofUploadForm({
  orderId,
  orderNumber,
  expectedAmount,
  currency = 'TRY',
  sellerName,
  sellerIban,
  onSuccess,
  onError,
  className,
}: PaymentProofUploadFormProps) {
  // ===== State =====
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [notes, setNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // ===== Validation =====
  const isValid =
    selectedFile !== null &&
    paymentReference.trim().length >= 3 &&
    selectedFile.size <= MAX_FILE_SIZE &&
    ALLOWED_FILE_TYPES.includes(selectedFile.type);

  // ===== File Selection Handler =====
  const handleFileSelect = useCallback((file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error('Geçersiz Dosya Formatı', {
        description: `Sadece ${ALLOWED_EXTENSIONS.join(', ')} dosyaları yükleyebilirsiniz.`,
      });
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('Dosya Çok Büyük', {
        description: `Maksimum dosya boyutu 5MB'dır. Seçilen dosya: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      });
      return;
    }

    setSelectedFile(file);

    // Generate preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  }, []);

  // ===== Drag & Drop Handlers =====
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // ===== Input Change Handler =====
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // ===== Remove File Handler =====
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  // ===== Form Submit Handler =====
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      toast.error('Form Hatası', {
        description:
          'Lütfen tüm zorunlu alanları doldurunuz ve geçerli bir dosya seçiniz.',
      });
      return;
    }

    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress (real progress tracking requires XMLHttpRequest or fetch with stream)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload payment proof
      const response = await uploadPaymentProof({
        file: selectedFile,
        orderId,
        amount: expectedAmount,
        currency: 'TRY',
        transactionReference: paymentReference.trim(),
        notes: notes.trim() || undefined,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      toast.success('Dekont Yüklendi', {
        description:
          'Ödeme dekontu başarıyla yüklendi. Satıcının onayı bekleniyor.',
        duration: 5000,
      });

      // Reset form
      setSelectedFile(null);
      setPreviewUrl(null);
      setPaymentReference('');
      setNotes('');

      // Call success callback
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Dekont yüklenemedi');

      toast.error('Yükleme Hatası', {
        description:
          err.message ||
          'Dekont yüklenirken bir hata oluştu. Lütfen tekrar deneyin.',
      });

      if (onError) {
        onError(err);
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // ===== Get File Icon =====
  const getFileIcon = () => {
    if (!selectedFile) return <File className="h-6 w-6" />;

    if (selectedFile.type === 'application/pdf') {
      return <FileText className="h-6 w-6 text-red-600" />;
    }

    if (selectedFile.type.startsWith('image/')) {
      return <ImageIcon className="h-6 w-6 text-blue-600" />;
    }

    return <File className="h-6 w-6" />;
  };

  return (
    <Card className={cn('border-2 border-blue-200 bg-blue-50 p-6', className)}>
      {/* Header */}
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-200">
          <Upload className="h-6 w-6 text-blue-700" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-900">
            Ödeme Dekontu Yükle
          </h3>
          <p className="text-sm text-blue-700">
            {sellerName ? `${sellerName}'e` : 'Satıcıya'} yaptığınız ödemenin
            dekontunu yükleyin
          </p>
        </div>
        <Badge variant="warning" size="md">
          Dekont Gerekli
        </Badge>
      </div>

      {/* Payment Info */}
      <div className="mb-4 rounded-lg border-2 border-blue-300 bg-white p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-blue-800">
              Sipariş No
            </label>
            <p className="font-mono font-semibold text-blue-900">
              {orderNumber}
            </p>
          </div>
          <div className="text-left md:text-right">
            <label className="text-sm font-medium text-blue-800">
              Ödenen Tutar
            </label>
            <p className="text-xl font-bold text-blue-900">
              {new Intl.NumberFormat('tr-TR', {
                style: 'currency',
                currency: currency,
              }).format(expectedAmount)}
            </p>
          </div>
          {sellerIban && (
            <div className="col-span-2">
              <label className="text-sm font-medium text-blue-800">
                Alıcı IBAN
              </label>
              <p className="font-mono text-sm text-blue-900">{sellerIban}</p>
            </div>
          )}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File Upload Area */}
        <div>
          <Label className="text-blue-900">
            Dekont/Makbuz Dosyası <span className="text-red-600">*</span>
          </Label>

          {!selectedFile ? (
            <div
              className={cn(
                'mt-2 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
                isDragging
                  ? 'border-blue-500 bg-blue-100'
                  : 'border-blue-300 bg-white hover:border-blue-400 hover:bg-blue-50'
              )}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <Upload className="mb-3 h-12 w-12 text-blue-400" />
              <p className="mb-1 text-sm font-semibold text-blue-900">
                Dekont dosyasını sürükleyip bırakın veya tıklayın
              </p>
              <p className="text-xs text-blue-700">
                JPG, PNG, WEBP veya PDF • Maksimum 5MB
              </p>
              <input
                id="file-input"
                type="file"
                accept={ALLOWED_FILE_TYPES.join(',')}
                onChange={handleInputChange}
                className="hidden"
                disabled={isUploading}
              />
            </div>
          ) : (
            <div className="mt-2 rounded-lg border-2 border-blue-300 bg-white p-4">
              <div className="flex items-start gap-3">
                {/* Preview or Icon */}
                <div className="flex-shrink-0">
                  {previewUrl ? (
                    <div className="relative h-20 w-20 overflow-hidden rounded-lg border">
                      <Image
                        src={previewUrl}
                        alt="Dekont önizleme"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-lg border bg-gray-100">
                      {getFileIcon()}
                    </div>
                  )}
                </div>

                {/* File Details */}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-blue-900">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-blue-700">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-green-700">
                      Geçerli dosya
                    </span>
                  </div>
                </div>

                {/* Remove Button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  disabled={isUploading}
                  className="flex-shrink-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Payment Reference */}
        <div>
          <Label htmlFor="paymentReference" className="text-blue-900">
            İşlem/Referans Numarası <span className="text-red-600">*</span>
          </Label>
          <Input
            id="paymentReference"
            type="text"
            placeholder="Örn: TRX123456789 veya havale referans no"
            value={paymentReference}
            onChange={(e) => setPaymentReference(e.target.value)}
            disabled={isUploading}
            className="mt-1"
            required
            minLength={3}
          />
          <p className="mt-1 text-xs text-blue-700">
            Banka hesabınızdan gönderdiğiniz işlem numarasını giriniz
          </p>
        </div>

        {/* Notes (Optional) */}
        <div>
          <Label htmlFor="notes" className="text-blue-900">
            Notlar (Opsiyonel)
          </Label>
          <textarea
            id="notes"
            placeholder="Ek bilgiler, ödeme zamanı, vb. (opsiyonel)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isUploading}
            className="mt-1 min-h-[80px] w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            maxLength={500}
          />
          <p className="mt-1 text-xs text-blue-700">
            {notes.length}/500 karakter
          </p>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="rounded-lg border border-blue-300 bg-blue-50 p-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-blue-900">Yükleniyor...</span>
              <span className="text-blue-700">{uploadProgress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-blue-200">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="rounded-lg border-l-4 border-blue-500 bg-blue-100 p-4">
          <div className="flex gap-3">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-700" />
            <div className="space-y-1 text-sm text-blue-900">
              <p className="font-semibold">Önemli Bilgiler:</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Dekontunuzun net ve okunaklı olduğundan emin olun</li>
                <li>Tutar ve işlem numarası dekont üzerinde görünür olmalı</li>
                <li>Satıcı dekontunuzu inceleyip onaylayacaktır</li>
                <li>Onaylandıktan sonra sipariş başlatılacaktır</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-700" />
            <div className="text-sm text-yellow-900">
              <p className="font-semibold">Dikkat:</p>
              <p className="mt-1">
                Sahte veya manipüle edilmiş dekont yüklemek ciddi yaptırımlarla
                sonuçlanabilir ve hesabınız kalıcı olarak kapatılabilir.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={!isValid || isUploading}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Yükleniyor... {uploadProgress}%
            </>
          ) : (
            <>
              <Upload className="mr-2 h-5 w-5" />
              Dekontu Yükle ve Gönder
            </>
          )}
        </Button>
      </form>

      {/* Help Text */}
      <div className="mt-4 rounded-lg bg-blue-100 p-3">
        <div className="flex items-start gap-2">
          <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-700" />
          <p className="text-xs text-blue-800">
            <strong>İpucu:</strong> Dekont yükledikten sonra satıcı 24 saat
            içinde inceleyecektir. Herhangi bir sorun yaşarsanız destek ekibi
            ile iletişime geçiniz.
          </p>
        </div>
      </div>
    </Card>
  );
}
