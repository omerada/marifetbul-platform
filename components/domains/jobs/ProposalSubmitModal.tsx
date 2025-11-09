'use client';

/**
 * ================================================
 * PROPOSAL SUBMIT MODAL
 * ================================================
 * Modal for freelancers to submit proposals to job postings
 *
 * Sprint 1 - Story 1.2: Proposal Submission Flow
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Send, Upload, File, X, AlertCircle, DollarSign } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Button, Textarea, Label, Input } from '@/components/ui';
import { useProposal } from '@/hooks/business/useProposal';
import type { SubmitProposalData } from '@/hooks/business/useProposal';
import { fileUploadService } from '@/lib/services/file-upload.service';
import { formatCurrency } from '@/lib/shared/formatters';
import type { JobResponse } from '@/types/backend-aligned';
import { toast } from 'sonner';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// TYPES
// ================================================

export interface ProposalSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobResponse;
  onSuccess?: (proposalId: string) => void;
}

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  size: number;
}

// ================================================
// CONSTANTS
// ================================================

const MIN_COVER_LETTER_LENGTH = 100;
const MAX_COVER_LETTER_LENGTH = 2000;
const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 10;

// ================================================
// COMPONENT
// ================================================

export function ProposalSubmitModal({
  isOpen,
  onClose,
  job,
  onSuccess,
}: ProposalSubmitModalProps) {
  // Form state
  const [coverLetter, setCoverLetter] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Hooks
  const { submitProposal, isLoading } = useProposal({
    onSuccess: (proposal) => {
      toast.success('Teklif gönderildi!', {
        description: 'Teklif başarıyla gönderildi, işveren inceleyecektir.',
      });
      if (proposal) {
        onSuccess?.(proposal.id);
      }
      handleClose();
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : String(error);
      toast.error('Hata', {
        description: message || 'Teklif gönderilemedi.',
      });
    },
  });

  // ================================================
  // HANDLERS
  // ================================================

  const handleClose = useCallback(() => {
    if (isLoading || isUploading) return;
    setCoverLetter('');
    setBidAmount('');
    setEstimatedDuration('');
    setUploadedFiles([]);
    setErrors({});
    onClose();
  }, [isLoading, isUploading, onClose]);

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      if (uploadedFiles.length + files.length > MAX_FILES) {
        setErrors((prev) => ({
          ...prev,
          files: `En fazla ${MAX_FILES} dosya yükleyebilirsiniz`,
        }));
        return;
      }

      setIsUploading(true);
      setErrors((prev) => {
        const { files: _files, ...rest } = prev;
        return rest;
      });

      try {
        const uploadPromises = files.map(async (file) => {
          if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            throw new Error(
              `${file.name} dosyası ${MAX_FILE_SIZE_MB}MB'dan büyük`
            );
          }

          const result = await fileUploadService.uploadFile(file, {
            backend: 'cloudinary',
            folder: 'marifetbul/proposals',
          });

          return {
            id: result.id,
            name: file.name,
            url: result.fileUrl,
            size: result.fileSize,
          };
        });

        const newFiles = await Promise.all(uploadPromises);
        setUploadedFiles((prev) => [...prev, ...newFiles]);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Dosya yüklenirken hata oluştu';
        setErrors((prev) => ({ ...prev, files: errorMessage }));
        logger.error(
          'File upload error',
          error instanceof Error ? error : new Error(errorMessage)
        );
      } finally {
        setIsUploading(false);
        e.target.value = '';
      }
    },
    [uploadedFiles.length]
  );

  const handleRemoveFile = useCallback((fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validate form inline
      const newErrors: Record<string, string> = {};

      // Cover letter validation
      if (!coverLetter.trim()) {
        newErrors.coverLetter = 'Ön yazı zorunludur';
      } else if (coverLetter.trim().length < MIN_COVER_LETTER_LENGTH) {
        newErrors.coverLetter = `Ön yazı en az ${MIN_COVER_LETTER_LENGTH} karakter olmalıdır`;
      } else if (coverLetter.trim().length > MAX_COVER_LETTER_LENGTH) {
        newErrors.coverLetter = `Ön yazı en fazla ${MAX_COVER_LETTER_LENGTH} karakter olabilir`;
      }

      // Bid amount validation
      const amount = parseFloat(bidAmount);
      if (!bidAmount || isNaN(amount)) {
        newErrors.bidAmount = 'Teklif tutarı zorunludur';
      } else if (amount <= 0) {
        newErrors.bidAmount = "Teklif tutarı 0'dan büyük olmalıdır";
      } else if (amount < (job.budgetMin || 0) * 0.5) {
        newErrors.bidAmount = "Teklif tutarı bütçenin en az %50'si olmalıdır";
      } else if (amount > (job.budgetMax || job.budgetMin || 0) * 2) {
        newErrors.bidAmount = 'Teklif tutarı bütçenin 2 katından fazla olamaz';
      }

      // Duration validation
      const duration = parseInt(estimatedDuration);
      if (!estimatedDuration || isNaN(duration)) {
        newErrors.estimatedDuration = 'Tahmini süre zorunludur';
      } else if (duration <= 0) {
        newErrors.estimatedDuration = "Tahmini süre 0'dan büyük olmalıdır";
      } else if (duration > 365) {
        newErrors.estimatedDuration = 'Tahmini süre 365 günden fazla olamaz';
      }

      setErrors(newErrors);
      const isValid = Object.keys(newErrors).length === 0;

      if (!isValid) {
        toast.error('Form Hatası', {
          description: 'Lütfen tüm alanları doğru şekilde doldurun',
        });
        return;
      }

      const proposalData: SubmitProposalData = {
        jobId: job.id,
        coverLetter: coverLetter.trim(),
        bidAmount: parseFloat(bidAmount),
        estimatedDuration: parseInt(estimatedDuration),
        attachments: uploadedFiles.map((file) => file.url),
      };

      try {
        await submitProposal(proposalData);
      } catch (error) {
        logger.error(
          'Proposal submission error',
          error instanceof Error ? error : new Error(String(error))
        );
      }
    },
    [
      coverLetter,
      bidAmount,
      estimatedDuration,
      uploadedFiles,
      job,
      submitProposal,
    ]
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Teklif Gönder</DialogTitle>
          <DialogDescription>{job.title}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Info */}
          <div className="rounded-lg border bg-gray-50 p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Bütçe:</span>
                <span className="font-semibold">
                  {job.budgetMin && job.budgetMax
                    ? `${formatCurrency(job.budgetMin)} - ${formatCurrency(job.budgetMax)}`
                    : formatCurrency(job.budgetMin || 0)}
                </span>
              </div>
              {job.duration && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Süre:</span>
                  <span className="font-semibold">{job.duration}</span>
                </div>
              )}
            </div>
          </div>

          {/* Cover Letter */}
          <div>
            <Label htmlFor="coverLetter">
              Ön Yazı <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="coverLetter"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Neden bu iş için uygun olduğunuzu, deneyiminizi ve yaklaşımınızı açıklayın..."
              rows={8}
              className="mt-2 w-full"
              disabled={isLoading}
              maxLength={MAX_COVER_LETTER_LENGTH}
            />
            <div className="mt-2 flex items-center justify-between text-xs">
              <span
                className={
                  errors.coverLetter ? 'text-red-600' : 'text-gray-500'
                }
              >
                {errors.coverLetter ||
                  `${coverLetter.length}/${MAX_COVER_LETTER_LENGTH} karakter (Min: ${MIN_COVER_LETTER_LENGTH})`}
              </span>
            </div>
          </div>

          {/* Bid Amount */}
          <div>
            <Label htmlFor="bidAmount">
              Teklif Tutarı (TRY) <span className="text-red-500">*</span>
            </Label>
            <div className="relative mt-2">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="bidAmount"
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder="0.00"
                className="pl-10"
                disabled={isLoading}
                step="0.01"
                min="0"
              />
            </div>
            {errors.bidAmount && (
              <p className="mt-1 text-xs text-red-600">{errors.bidAmount}</p>
            )}
          </div>

          {/* Estimated Duration */}
          <div>
            <Label htmlFor="estimatedDuration">
              Tahmini Süre (Gün) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="estimatedDuration"
              type="number"
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(e.target.value)}
              placeholder="7"
              className="mt-2"
              disabled={isLoading}
              min="1"
              max="365"
            />
            {errors.estimatedDuration && (
              <p className="mt-1 text-xs text-red-600">
                {errors.estimatedDuration}
              </p>
            )}
          </div>

          {/* File Upload */}
          <div>
            <Label>
              Ek Dosyalar{' '}
              <span className="text-sm font-normal text-gray-500">
                (İsteğe bağlı, max {MAX_FILES} dosya)
              </span>
            </Label>
            <div className="mt-2">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-4 transition-colors hover:border-blue-400 hover:bg-blue-50">
                <Upload className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {isUploading ? 'Yükleniyor...' : 'Dosya Seç'}
                </span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  disabled={
                    isLoading ||
                    isUploading ||
                    uploadedFiles.length >= MAX_FILES
                  }
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
                />
              </label>
              <p className="mt-1 text-xs text-gray-500">
                PDF, Word, resim veya ZIP dosyaları (max {MAX_FILE_SIZE_MB}MB)
              </p>
              {errors.files && (
                <p className="mt-1 text-xs text-red-600">{errors.files}</p>
              )}
            </div>
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <Label>Yüklenen Dosyalar ({uploadedFiles.length})</Label>
              <div className="space-y-2">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between rounded-lg border bg-gray-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-blue-100 p-2">
                        <File className="h-4 w-4 text-blue-600" />
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
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Teklif Süreci</p>
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  <li>Teklifiniz işverene iletilecek</li>
                  <li>İşveren tüm teklifleri değerlendirecek</li>
                  <li>Seçilirseniz siparişe başlayabilirsiniz</li>
                  <li>
                    Ödeme güvende tutulacak ve iş tamamlandığında alacaksınız
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading || isUploading}
            >
              İptal
            </Button>
            <Button type="submit" disabled={isLoading || isUploading}>
              {isLoading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Teklif Gönder
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
