/**
 * ================================================
 * DISPUTE MODAL COMPONENT
 * ================================================
 * Modal for creating order disputes
 * Allows buyers/sellers to raise disputes with evidence
 *
 * Features:
 * - Reason selection with descriptions
 * - Evidence file upload
 * - Validation and submission
 * - Real-time feedback
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 3: Production Readiness
 */

'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui';
import { Button, Textarea, Label } from '@/components/ui';
import FileUpload from '@/components/ui/FileUpload';
import {
  AlertTriangle,
  Upload,
  FileText,
  Info,
  CheckCircle,
} from 'lucide-react';
import { raiseDispute } from '@/lib/api/disputes';
import { DisputeReason, disputeReasonLabels } from '@/types/dispute';
import { fileUploadService } from '@/lib/services/file-upload.service';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ================================================
// CONSTANTS
// ================================================

const MIN_DESCRIPTION_LENGTH = 50;
const MAX_FILES = 5;

const REASON_DESCRIPTIONS: Record<DisputeReason, string> = {
  [DisputeReason.QUALITY_ISSUE]:
    'Teslim edilen işin kalitesi beklenenden düşük veya kabul edilemez seviyede',
  [DisputeReason.DELIVERY_NOT_RECEIVED]:
    'Satıcı teslimat yapmadı veya teslim edildiği iddia edilen dosyalara erişilemiyor',
  [DisputeReason.INCOMPLETE_WORK]:
    'İş eksik teslim edildi, tüm gereksinimler karşılanmadı',
  [DisputeReason.NOT_AS_DESCRIBED]:
    'Teslim edilen iş, paket açıklamasına veya anlaşmaya uygun değil',
  [DisputeReason.COMMUNICATION_ISSUE]:
    'Satıcı ile iletişim kurulamıyor veya yanıt vermiyor',
  [DisputeReason.DEADLINE_MISSED]:
    'Belirlenen termin kaçırıldı ve iş zamanında teslim edilmedi',
  [DisputeReason.UNAUTHORIZED_WORK]:
    'Satıcı izinsiz değişiklikler yaptı veya anlaşma dışı iş ekledi',
  [DisputeReason.OTHER]: 'Yukarıdaki kategorilere girmeyen diğer sorunlar',
};

// ================================================
// TYPES
// ================================================

export interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber?: string;
  onSuccess?: () => void;
}

// ================================================
// COMPONENT
// ================================================

export const DisputeModal: React.FC<DisputeModalProps> = ({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReason, setSelectedReason] = useState<DisputeReason | null>(
    null
  );
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFileUrls, setUploadedFileUrls] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ================================================
  // VALIDATION
  // ================================================

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedReason) {
      newErrors.reason = 'Lütfen bir sebep seçin';
    }

    if (!description.trim()) {
      newErrors.description = 'Açıklama gerekli';
    } else if (description.trim().length < MIN_DESCRIPTION_LENGTH) {
      newErrors.description = `Açıklama en az ${MIN_DESCRIPTION_LENGTH} karakter olmalı`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ================================================
  // FILE UPLOAD
  // ================================================

  const handleUploadFiles = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const file of selectedFiles) {
      try {
        const result = await fileUploadService.uploadFile(file, {
          folder: 'dispute-evidence',
        });
        uploadedUrls.push(result.fileUrl);
      } catch (error) {
        toast.error('Dosya Yükleme Hatası', {
          description: `${file.name} yüklenemedi`,
        });
        throw error;
      }
    }

    return uploadedUrls;
  };

  // ================================================
  // SUBMIT
  // ================================================

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    try {
      setIsLoading(true);

      // Upload files first if any
      let fileUrls = uploadedFileUrls;
      if (selectedFiles.length > 0 && uploadedFileUrls.length === 0) {
        fileUrls = await handleUploadFiles();
        setUploadedFileUrls(fileUrls);
      }

      // Submit dispute
      await raiseDispute({
        orderId,
        reason: selectedReason!,
        description: description.trim(),
        evidenceUrls: fileUrls.length > 0 ? fileUrls : undefined,
      });

      toast.success('İtiraz Oluşturuldu!', {
        description: 'Müşteri destek ekibimiz en kısa sürede inceleyecektir.',
      });

      onSuccess?.();
      onClose();
      resetForm();
    } catch (error) {
      toast.error('Hata', {
        description:
          error instanceof Error ? error.message : 'İtiraz oluşturulamadı.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ================================================
  // HELPERS
  // ================================================

  const resetForm = () => {
    setSelectedReason(null);
    setDescription('');
    setSelectedFiles([]);
    setUploadedFileUrls([]);
    setErrors({});
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onClose();
    }
  };

  const characterCount = description.trim().length;
  const isValid =
    selectedReason &&
    description.trim().length >= MIN_DESCRIPTION_LENGTH &&
    selectedFiles.length <= MAX_FILES;

  // ================================================
  // RENDER
  // ================================================

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            İtiraz Oluştur
          </DialogTitle>
          <DialogDescription>
            Sipariş #{orderNumber || orderId.slice(0, 8)} için itiraz
            oluşturuyorsunuz. Lütfen sorunu detaylı açıklayın.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Warning Notice */}
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
            <div className="flex gap-3">
              <Info className="h-5 w-5 shrink-0 text-orange-600" />
              <div className="text-sm text-orange-800">
                <p className="font-medium">Önemli Bilgilendirme</p>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  <li>İtiraz süreci 3-5 iş günü sürebilir</li>
                  <li>Sipariş ödeme emanette tutulacak</li>
                  <li>
                    Kanıt belgeleri güçlü bir dosya hazırlamanıza yardımcı olur
                  </li>
                  <li>Yanlış itiraz durumunda işlem ücreti alınabilir</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Reason Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              İtiraz Sebebi *
            </Label>
            <div className="space-y-2">
              {Object.entries(DisputeReason).map(([_key, value]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelectedReason(value)}
                  className={cn(
                    'w-full rounded-lg border p-4 text-left transition-all',
                    selectedReason === value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                        selectedReason === value
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-gray-300'
                      )}
                    >
                      {selectedReason === value && (
                        <CheckCircle className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {disputeReasonLabels[value]}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        {REASON_DESCRIPTIONS[value]}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {errors.reason && (
              <p className="text-sm text-red-600">{errors.reason}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Detaylı Açıklama *
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Sorunu detaylı olarak açıklayın. Ne beklediniz, ne aldınız? Hangi sorunlarla karşılaştınız? (En az 50 karakter)"
              rows={6}
              className={cn(
                'resize-none',
                errors.description && 'border-red-500'
              )}
            />
            <div className="flex items-center justify-between text-sm">
              <span
                className={cn(
                  'text-gray-500',
                  characterCount < MIN_DESCRIPTION_LENGTH && 'text-orange-600'
                )}
              >
                {characterCount} / minimum {MIN_DESCRIPTION_LENGTH} karakter
              </span>
              {errors.description && (
                <span className="text-red-600">{errors.description}</span>
              )}
            </div>
          </div>

          {/* Evidence Upload */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Kanıt Belgeleri (Opsiyonel)
            </Label>
            <p className="text-sm text-gray-600">
              Ekran görüntüleri, mesajlaşma geçmişi, dosyalar vb. (Maksimum{' '}
              {MAX_FILES} dosya)
            </p>
            <FileUpload
              accept="image/*,.pdf,.doc,.docx"
              multiple
              maxFiles={MAX_FILES}
              onFileSelect={setSelectedFiles}
              className="w-full"
            />
            {selectedFiles.length > 0 && (
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-sm font-medium text-gray-700">
                  Seçili Dosyalar: {selectedFiles.length}
                </p>
                <ul className="mt-2 space-y-1">
                  {selectedFiles.map((file, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      • {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Summary */}
          {selectedReason && (
            <div className="rounded-lg bg-blue-50 p-4">
              <h4 className="font-medium text-blue-900">İtiraz Özeti</h4>
              <div className="mt-2 space-y-1 text-sm text-blue-800">
                <p>
                  <span className="font-medium">Sebep:</span>{' '}
                  {disputeReasonLabels[selectedReason]}
                </p>
                <p>
                  <span className="font-medium">Açıklama Uzunluğu:</span>{' '}
                  {characterCount} karakter
                </p>
                <p>
                  <span className="font-medium">Kanıt Sayısı:</span>{' '}
                  {selectedFiles.length} dosya
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            İptal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isLoading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isLoading ? 'Gönderiliyor...' : 'İtiraz Oluştur'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DisputeModal;
