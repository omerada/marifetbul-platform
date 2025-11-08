/**
 * ================================================
 * IMAGE UPLOAD COMPONENT (CANONICAL FOR IMAGES)
 * ================================================
 * Production-ready image upload with Cloudinary integration
 *
 * This is the CANONICAL component for image uploads in MarifetBul.
 * Use this for package images, portfolio images, and any image-centric uploads.
 *
 * Features:
 * - Drag & drop support
 * - Multiple file upload
 * - Image preview with thumbnails
 * - Crop functionality
 * - Progress indication
 * - File validation (type, size)
 * - Cloudinary direct upload
 * - Automatic thumbnail generation
 *
 * Use Cases:
 * - Package creation/editing (images)
 * - Portfolio uploads
 * - Profile pictures
 * - Any scenario requiring image preview
 *
 * For Simple Files: Use @/components/ui/FileUpload for documents/PDFs
 * For Disputes: Use @/components/domains/disputes/EvidenceUpload
 *
 * @example
 * <ImageUpload
 *   value={images}
 *   onChange={handleImagesChange}
 *   maxImages={8}
 *   maxFileSize={5 * 1024 * 1024}
 *   uploadPreset="marifetbul_packages"
 *   folder="marifetbul/packages"
 * />
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint 2: Canonical Documentation
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// TYPES
// ================================================

export interface UploadedImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  publicId: string;
  fileName: string;
  size: number;
}

export interface ImageUploadProps {
  /**
   * Maximum number of images
   */
  maxImages?: number;

  /**
   * Maximum file size in bytes (default: 5MB)
   */
  maxFileSize?: number;

  /**
   * Allowed file types
   */
  acceptedTypes?: string[];

  /**
   * Existing images (for edit mode)
   */
  value?: UploadedImage[];

  /**
   * Callback when images change
   */
  onChange: (images: UploadedImage[]) => void;

  /**
   * Cloudinary upload preset
   */
  uploadPreset?: string;

  /**
   * Upload folder in Cloudinary
   */
  folder?: string;

  /**
   * Disable upload
   */
  disabled?: boolean;

  /**
   * Show preview
   */
  showPreview?: boolean;
}

// ================================================
// COMPONENT
// ================================================

export function ImageUpload({
  maxImages = 8,
  maxFileSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  value = [],
  onChange,
  uploadPreset,
  folder = 'marifetbul/packages',
  disabled = false,
  showPreview = true,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cloudinary config from environment
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset =
    uploadPreset || process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  // Check if can upload more
  const canUploadMore = value.length < maxImages;

  // Validate file
  const validateFile = useCallback(
    (file: File): string | null => {
      if (!acceptedTypes.includes(file.type)) {
        return `Geçersiz dosya türü. İzin verilen: ${acceptedTypes.join(', ')}`;
      }
      if (file.size > maxFileSize) {
        return `Dosya boyutu çok büyük. Maksimum: ${(maxFileSize / 1024 / 1024).toFixed(1)}MB`;
      }
      return null;
    },
    [acceptedTypes, maxFileSize]
  );

  // Upload to Cloudinary
  const uploadToCloudinary = useCallback(
    async (file: File): Promise<UploadedImage> => {
      if (!cloudName) {
        throw new Error('Cloudinary yapılandırması bulunamadı');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', preset || 'unsigned');
      formData.append('folder', folder);

      // Track progress
      const uploadId = Math.random().toString(36);
      setUploadProgress((prev) => ({ ...prev, [uploadId]: 0 }));

      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error('Yükleme başarısız oldu');
        }

        const data = await response.json();

        // Generate thumbnail URL
        const thumbnailUrl = data.secure_url.replace(
          '/upload/',
          '/upload/w_300,h_300,c_fill/'
        );

        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[uploadId];
          return newProgress;
        });

        return {
          id: data.public_id,
          url: data.secure_url,
          thumbnailUrl,
          publicId: data.public_id,
          fileName: file.name,
          size: file.size,
        };
      } catch (err) {
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[uploadId];
          return newProgress;
        });
        throw err;
      }
    },
    [cloudName, preset, folder]
  );

  // Handle file selection
  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      if (!canUploadMore) {
        setError(`Maksimum ${maxImages} resim yükleyebilirsiniz`);
        return;
      }

      setError(null);
      setUploading(true);

      const filesToUpload = Array.from(files).slice(
        0,
        maxImages - value.length
      );
      const newImages: UploadedImage[] = [];

      for (const file of filesToUpload) {
        // Validate
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          continue;
        }

        try {
          const uploadedImage = await uploadToCloudinary(file);
          newImages.push(uploadedImage);
        } catch (err) {
          logger.error(
            'Upload failed:',
            err instanceof Error ? err : new Error(String(err))
          );
          setError(err instanceof Error ? err.message : 'Yükleme başarısız');
        }
      }

      if (newImages.length > 0) {
        onChange([...value, ...newImages]);
      }

      setUploading(false);
    },
    [
      value,
      canUploadMore,
      maxImages,
      onChange,
      validateFile,
      uploadToCloudinary,
    ]
  );

  // Handle drag & drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      handleFiles(files);
    },
    [disabled, handleFiles]
  );

  // Handle file input change
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [handleFiles]
  );

  // Remove image
  const handleRemove = useCallback(
    (imageId: string) => {
      onChange(value.filter((img) => img.id !== imageId));
    },
    [value, onChange]
  );

  // Trigger file input
  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const isUploading = uploading || Object.keys(uploadProgress).length > 0;

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {canUploadMore && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-lg border-2 border-dashed p-8 text-center transition ${
            isDragging
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          onClick={disabled ? undefined : triggerFileInput}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            multiple
            onChange={handleFileInputChange}
            disabled={disabled || isUploading}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-3">
            {isUploading ? (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
                <p className="text-sm font-medium text-gray-700">
                  Yükleniyor...
                </p>
              </>
            ) : (
              <>
                <Upload className="h-12 w-12 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Resimleri sürükleyip bırakın veya{' '}
                    <span className="text-purple-600">seçin</span>
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    PNG, JPG, WebP - Maksimum{' '}
                    {(maxFileSize / 1024 / 1024).toFixed(0)}MB
                  </p>
                  <p className="text-xs text-gray-500">
                    {value.length}/{maxImages} resim yüklendi
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Image Preview Grid */}
      {showPreview && value.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {value.map((image) => (
            <div
              key={image.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.thumbnailUrl || image.url}
                alt={image.fileName}
                className="h-full w-full object-cover"
              />

              {/* Remove Button */}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(image.id)}
                  className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* File Info */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
                <p className="truncate text-xs text-white">{image.fileName}</p>
                <p className="text-xs text-gray-300">
                  {(image.size / 1024).toFixed(0)} KB
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Text */}
      {!canUploadMore && (
        <p className="text-sm text-gray-600">
          Maksimum resim sayısına ulaştınız ({maxImages})
        </p>
      )}
    </div>
  );
}

// ================================================
// HELPER FUNCTIONS
// ================================================

// Sprint 1 Cleanup: formatFileSize removed - use @/lib/shared/formatters

/**
 * Generate Cloudinary transformation URL
 */
export function getCloudinaryUrl(
  publicId: string,
  cloudName: string,
  transformation?: string
): string {
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
  return transformation
    ? `${baseUrl}/${transformation}/${publicId}`
    : `${baseUrl}/${publicId}`;
}

/**
 * Delete image from Cloudinary (requires backend)
 */
export async function deleteCloudinaryImage(publicId: string): Promise<void> {
  // This should call your backend endpoint
  // Backend will use Cloudinary SDK to delete
  await fetch(`/api/media/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ publicId }),
  });
}
