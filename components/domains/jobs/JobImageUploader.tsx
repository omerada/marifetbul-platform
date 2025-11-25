'use client';

/**
 * ================================================
 * JOB IMAGE UPLOADER COMPONENT
 * ================================================
 * Drag & drop image uploader for job postings
 *
 * Sprint 1 - Task 1.3: Job Posting System
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 25, 2025
 *
 * Features:
 * ✅ Drag & drop interface
 * ✅ Multi-file support (max 5)
 * ✅ Image preview with thumbnails
 * ✅ Upload progress indication
 * ✅ File validation (size, type)
 * ✅ Remove uploaded images
 * ✅ Cloudinary integration ready
 */

import React, { useCallback, useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { cn } from '@/lib/utils';
import type { JobImage } from '@/hooks/business/jobs/useJobCreate';

// ================================================
// TYPES
// ================================================

export interface JobImageUploaderProps {
  /** Current images */
  images: JobImage[];
  /** Is uploading in progress */
  isUploading?: boolean;
  /** Max number of images */
  maxImages?: number;
  /** Max image size in bytes */
  maxImageSize?: number;
  /** Callback when images are added */
  onAdd: (files: File[]) => Promise<void>;
  /** Callback when image is removed */
  onRemove: (index: number) => void;
  /** Is disabled */
  disabled?: boolean;
  /** Custom className */
  className?: string;
}

// ================================================
// CONSTANTS
// ================================================

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const DEFAULT_MAX_IMAGES = 5;
const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB

// ================================================
// COMPONENT
// ================================================

export function JobImageUploader({
  images,
  isUploading = false,
  maxImages = DEFAULT_MAX_IMAGES,
  maxImageSize = DEFAULT_MAX_SIZE,
  onAdd,
  onRemove,
  disabled = false,
  className,
}: JobImageUploaderProps) {
  // ==================== STATE ====================

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ==================== COMPUTED ====================

  const canAddMore = images.length < maxImages && !disabled;
  const remainingSlots = maxImages - images.length;

  // ==================== HANDLERS ====================

  const validateFiles = useCallback(
    (files: File[]): { valid: File[]; errors: string[] } => {
      const errors: string[] = [];
      const valid: File[] = [];

      for (const file of files) {
        // Check type
        if (!ACCEPTED_TYPES.includes(file.type)) {
          errors.push(`${file.name}: Desteklenmeyen format`);
          continue;
        }

        // Check size
        if (file.size > maxImageSize) {
          const maxMB = (maxImageSize / 1024 / 1024).toFixed(0);
          errors.push(`${file.name}: Maksimum ${maxMB}MB olmalıdır`);
          continue;
        }

        valid.push(file);
      }

      return { valid, errors };
    },
    [maxImageSize]
  );

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      // Check limit
      if (images.length + files.length > maxImages) {
        alert(`En fazla ${maxImages} görsel yükleyebilirsiniz`);
        return;
      }

      // Validate
      const { valid, errors } = validateFiles(files);

      if (errors.length > 0) {
        alert(errors.join('\n'));
      }

      if (valid.length > 0) {
        await onAdd(valid);
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [images.length, maxImages, validateFiles, onAdd]
  );

  const handleDrop = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);

      if (disabled || !canAddMore) return;

      const files = Array.from(event.dataTransfer.files);

      // Check limit
      if (images.length + files.length > maxImages) {
        alert(`En fazla ${maxImages} görsel yükleyebilirsiniz`);
        return;
      }

      // Validate
      const { valid, errors } = validateFiles(files);

      if (errors.length > 0) {
        alert(errors.join('\n'));
      }

      if (valid.length > 0) {
        await onAdd(valid);
      }
    },
    [disabled, canAddMore, images.length, maxImages, validateFiles, onAdd]
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();

      if (!disabled && canAddMore) {
        setIsDragging(true);
      }
    },
    [disabled, canAddMore]
  );

  const handleDragLeave = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
    },
    []
  );

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // ==================== RENDER ====================

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      {canAddMore && (
        <Card
          className={cn(
            'transition-all duration-200',
            isDragging &&
              'border-primary bg-primary/5 ring-primary border-2 ring-2 ring-offset-2',
            !isDragging && 'border-dashed border-gray-300',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className="p-8"
          >
            <div className="flex flex-col items-center justify-center text-center">
              {isUploading ? (
                <>
                  <Loader2 className="text-primary mb-4 h-12 w-12 animate-spin" />
                  <p className="text-sm font-medium text-gray-900">
                    Yükleniyor...
                  </p>
                  <p className="text-xs text-gray-500">
                    Lütfen bekleyin, görseller işleniyor
                  </p>
                </>
              ) : (
                <>
                  <div className="bg-primary/10 mb-4 rounded-full p-3">
                    <Upload className="text-primary h-8 w-8" />
                  </div>

                  <p className="mb-2 text-sm font-medium text-gray-900">
                    Görsel yüklemek için sürükle & bırak
                  </p>
                  <p className="mb-4 text-xs text-gray-500">
                    veya dosya seçmek için tıklayın
                  </p>

                  <Button
                    type="button"
                    onClick={handleBrowseClick}
                    variant="outline"
                    size="sm"
                    disabled={disabled}
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Dosya Seç
                  </Button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_TYPES.join(',')}
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={disabled}
                  />

                  <div className="mt-4 text-xs text-gray-500">
                    <p>
                      JPG, PNG, WEBP • Maksimum {maxImageSize / 1024 / 1024}MB
                    </p>
                    <p className="mt-1">
                      Kalan: {remainingSlots} / {maxImages} görsel
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {images.map((image, index) => (
            <Card key={index} className="group relative overflow-hidden p-0">
              {/* Image */}
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={image.url}
                  alt={image.name}
                  fill
                  className="object-cover transition-transform duration-200 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                />
              </div>

              {/* Overlay with Remove Button */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <Button
                  type="button"
                  onClick={() => onRemove(index)}
                  variant="destructive"
                  size="sm"
                  disabled={isUploading || disabled}
                  className="rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* File Info */}
              <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <p className="truncate text-xs text-white">{image.name}</p>
                <p className="text-[10px] text-white/70">
                  {(image.size / 1024).toFixed(0)} KB
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Info Message */}
      {images.length === 0 && !canAddMore && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
          <p className="text-sm text-gray-600">
            Maksimum görsel sayısına ulaşıldı
          </p>
        </div>
      )}
    </div>
  );
}

// ================================================
// EXPORT
// ================================================

export default JobImageUploader;
