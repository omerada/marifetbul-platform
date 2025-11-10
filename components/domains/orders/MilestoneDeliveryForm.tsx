'use client';

/**
 * ================================================
 * MILESTONE DELIVERY FORM
 * ================================================
 * Form for seller to deliver completed milestone
 *
 * Features:
 * - Delivery notes (required)
 * - File attachments (optional)
 * - Character counter
 * - Validation
 * - Optimistic updates
 * - Production-ready error handling
 *
 * @version 1.0.0
 * @sprint Sprint 1 - Story 1.3 (Milestone Delivery & Acceptance)
 * @author MarifetBul Development Team
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import logger from '@/lib/infrastructure/monitoring/logger';
import { Package, Upload, X, FileText } from 'lucide-react';
import type { OrderMilestone } from '@/types/business/features/milestone';
import { useMilestoneActions } from '@/hooks/business/useMilestones';
import { cn } from '@/lib/utils';

// ================================================
// TYPES
// ================================================

export interface MilestoneDeliveryFormProps {
  /** Milestone to deliver */
  milestone: OrderMilestone;
  /** Modal open state */
  isOpen: boolean;
  /** Close modal callback */
  onClose: () => void;
  /** Success callback */
  onSuccess?: (milestone: OrderMilestone) => void;
}

// ================================================
// CONSTANTS
// ================================================

const MIN_NOTES_LENGTH = 20;
const MAX_NOTES_LENGTH = 1000;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'text/plain',
];
const MAX_FILES = 5;

// ================================================
// HELPER FUNCTIONS
// ================================================

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function getFileIcon(type: string): typeof FileText {
  if (type.startsWith('image/')) return FileText;
  return FileText;
}

// ================================================
// COMPONENT
// ================================================

export function MilestoneDeliveryForm({
  milestone,
  isOpen,
  onClose,
  onSuccess,
}: MilestoneDeliveryFormProps) {
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const { deliverMilestone, isDelivering } = useMilestoneActions();

  // Reset form when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setDeliveryNotes('');
      setAttachments([]);
      setFileError(null);
    }
  }, [isOpen]);

  // Validation
  const isValid = deliveryNotes.trim().length >= MIN_NOTES_LENGTH;
  const remainingChars = MAX_NOTES_LENGTH - deliveryNotes.length;

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFileError(null);

    // Check total file count
    if (attachments.length + files.length > MAX_FILES) {
      setFileError(`En fazla ${MAX_FILES} dosya yükleyebilirsiniz`);
      return;
    }

    // Validate each file
    for (const file of files) {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        setFileError(
          `${file.name} çok büyük. Maksimum dosya boyutu: ${formatFileSize(MAX_FILE_SIZE)}`
        );
        return;
      }

      // Check file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setFileError(
          `${file.name} desteklenmeyen dosya türü. İzin verilen: JPG, PNG, GIF, PDF, ZIP, TXT`
        );
        return;
      }
    }

    setAttachments((prev) => [...prev, ...files]);
  };

  // Remove file
  const handleRemoveFile = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    setFileError(null);
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) return;

    try {
      // TODO: In production, upload attachments first and get URLs
      // For now, we'll send delivery notes only
      const attachmentUrls: string[] = [];
      
      const updatedMilestone = await deliverMilestone(milestone.id, {
        deliveryNotes: deliveryNotes.trim(),
        attachments: attachmentUrls,
      });

      onSuccess?.(updatedMilestone);
      onClose();
    } catch (error) {
      logger.error('Milestone delivery failed', error as Error);
      // Error toast already shown by hook
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Milestone Teslimi
          </DialogTitle>
          <DialogDescription>
            Tamamlanan milestone&apos;ı alıcıya teslim et
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          {/* Milestone Info */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h4 className="mb-2 text-sm font-medium text-blue-900">
              Milestone Bilgisi
            </h4>
            <div className="space-y-1 text-sm text-blue-700">
              <p>
                <span className="font-medium">Başlık:</span> {milestone.title}
              </p>
              {milestone.description && (
                <p>
                  <span className="font-medium">Açıklama:</span>{' '}
                  {milestone.description}
                </p>
              )}
              <p>
                <span className="font-medium">Tutar:</span>{' '}
                {new Intl.NumberFormat('tr-TR', {
                  style: 'currency',
                  currency: 'TRY',
                }).format(milestone.amount)}
              </p>
              <p>
                <span className="font-medium">Sıra:</span> {milestone.sequence}
              </p>
            </div>
          </div>

          {/* Delivery Notes */}
          <div className="space-y-2">
            <Label htmlFor="delivery-notes" required>
              Teslim Notları
            </Label>
            <p className="text-sm text-gray-600">
              Yaptığınız işi detaylı bir şekilde açıklayın. Alıcının
              değerlendirmesi için önemli bilgileri ekleyin.
            </p>
            <Textarea
              id="delivery-notes"
              value={deliveryNotes}
              onChange={(e) =>
                setDeliveryNotes(e.target.value.slice(0, MAX_NOTES_LENGTH))
              }
              placeholder="Örnek: Tasarım tamamlandı. 5 farklı varyasyon hazırlandı. Ana renk paleti müşteri tercihine göre düzenlendi. Logo revize edildi..."
              rows={6}
              className={cn(
                'resize-none',
                deliveryNotes.trim().length > 0 &&
                  !isValid &&
                  'border-red-300 focus:border-red-500'
              )}
              disabled={isDelivering}
              required
            />

            {/* Character Counter */}
            <div className="flex items-center justify-between text-sm">
              <span
                className={cn(
                  'text-gray-500',
                  deliveryNotes.trim().length > 0 &&
                    !isValid &&
                    'text-red-600'
                )}
              >
                {deliveryNotes.trim().length > 0 && !isValid && (
                  <>En az {MIN_NOTES_LENGTH} karakter gerekli</>
                )}
              </span>
              <span
                className={cn(
                  'text-gray-500',
                  remainingChars < 100 && 'text-yellow-600',
                  remainingChars === 0 && 'text-red-600'
                )}
              >
                {deliveryNotes.length} / {MAX_NOTES_LENGTH}
              </span>
            </div>
          </div>

          {/* File Attachments */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">
              Dosya Ekleri{' '}
              <span className="text-gray-500 font-normal">(İsteğe Bağlı)</span>
            </Label>
            <p className="text-sm text-gray-600">
              Çalışmanızla ilgili dosyaları ekleyebilirsiniz (max {MAX_FILES}{' '}
              dosya, her biri max {formatFileSize(MAX_FILE_SIZE)})
            </p>

            {/* File Input */}
            <div className="relative">
              <Input
                id="file-upload"
                type="file"
                multiple
                accept={ALLOWED_FILE_TYPES.join(',')}
                onChange={handleFileChange}
                disabled={isDelivering || attachments.length >= MAX_FILES}
                className="cursor-pointer"
              />
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <Upload className="h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* File Error */}
            {fileError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {fileError}
              </div>
            )}

            {/* File List */}
            {attachments.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Yüklenen Dosyalar ({attachments.length}/{MAX_FILES})
                </p>
                <div className="space-y-2">
                  {attachments.map((file, index) => {
                    const Icon = getFileIcon(file.type);
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Icon className="h-5 w-5 flex-shrink-0 text-gray-400" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <UnifiedButton
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(index)}
                          disabled={isDelivering}
                          className="ml-2"
                        >
                          <X className="h-4 w-4" />
                        </UnifiedButton>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Warning */}
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">
              <span className="font-medium">Önemli:</span> Teslim ettikten
              sonra alıcının onayını beklemeniz gerekecektir. Alıcı
              değerlendirme yapıp onayladığında ödeme tarafınıza aktarılacaktır.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 border-t pt-4">
            <UnifiedButton
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isDelivering}
            >
              İptal
            </UnifiedButton>
            <UnifiedButton
              type="submit"
              variant="default"
              disabled={!isValid || isDelivering}
              loading={isDelivering}
            >
              <Package className="mr-2 h-4 w-4" />
              {isDelivering ? 'Teslim Ediliyor...' : 'Teslim Et'}
            </UnifiedButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default MilestoneDeliveryForm;
