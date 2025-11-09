'use client';

/**
 * ================================================
 * EVIDENCE UPLOAD COMPONENT (DOMAIN-SPECIFIC)
 * ================================================
 * File upload component for dispute evidence
 *
 * This is a DOMAIN-SPECIFIC component for dispute evidence uploads.
 * Tailored for legal/dispute scenarios with specific validation rules.
 *
 * Features:
 * - Drag & drop file upload
 * - Multiple file selection (images + PDFs)
 * - Image preview for visual evidence
 * - PDF/document support for written evidence
 * - File validation (type, size - max 10MB)
 * - Cloudinary integration with dispute-specific folder
 * - Progress indicator
 * - Remove uploaded files
 * - Evidence-specific file type allowlist
 *
 * Use Cases:
 * - Dispute evidence submission
 * - Complaint file attachments
 * - Legal document uploads for disputes
 *
 * For General Files: Use @/components/ui/FileUpload
 * For Images Only: Use @/components/shared/ImageUpload
 *
 * @example
 * <EvidenceUpload
 *   files={evidence}
 *   onFilesChange={handleEvidenceChange}
 *   maxFiles={5}
 *   maxSizeMB={10}
 * />
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint 2: Domain-Specific Documentation
 */

'use client';

import React, { useState, useCallback, useRef } from 'react';
import { X, Upload, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { formatFileSize } from '@/lib/shared/formatters';

// ================================================
// TYPES
// ================================================

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  preview?: string;
}

interface EvidenceUploadProps {
  /** Current uploaded files */
  files?: UploadedFile[];
  /** Callback when files are uploaded */
  onFilesChange: (urls: string[]) => void;
  /** Maximum number of files */
  maxFiles?: number;
  /** Maximum file size in MB */
  maxSizeMB?: number;
  /** Allowed file types */
  acceptedTypes?: string[];
  /** Whether upload is disabled */
  disabled?: boolean;
}

// ================================================
// CONSTANTS
// ================================================

const DEFAULT_MAX_FILES = 5;
const DEFAULT_MAX_SIZE_MB = 10;
const DEFAULT_ACCEPTED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
];

const CLOUDINARY_UPLOAD_PRESET =
  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'marifetbul_disputes';
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

// ================================================
// COMPONENT
// ================================================

export function EvidenceUpload({
  files = [],
  onFilesChange,
  maxFiles = DEFAULT_MAX_FILES,
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  disabled = false,
}: EvidenceUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(
    files.map((f, i) => ({ ...f, id: `${i}` }))
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate file
  const validateFile = (file: File): string | null => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return `Geçersiz dosya tipi: ${file.type}. İzin verilen: ${acceptedTypes.join(', ')}`;
    }

    // Check file size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      return `Dosya boyutu çok büyük: ${sizeMB.toFixed(2)}MB. Maksimum: ${maxSizeMB}MB`;
    }

    // Check max files
    if (uploadedFiles.length >= maxFiles) {
      return `Maksimum ${maxFiles} dosya yükleyebilirsiniz`;
    }

    return null;
  };

  // Upload file to Cloudinary
  const uploadToCloudinary = async (file: File): Promise<string> => {
    if (!CLOUDINARY_CLOUD_NAME) {
      throw new Error('Cloudinary yapılandırması eksik');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'disputes');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Dosya yükleme başarısız');
    }

    const data = await response.json();
    return data.secure_url;
  };

  // Handle file upload
  const handleFileUpload = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);

      if (fileArray.length === 0) return;

      try {
        setIsUploading(true);
        setUploadProgress(0);

        const newFiles: UploadedFile[] = [];

        for (let i = 0; i < fileArray.length; i++) {
          const file = fileArray[i];

          // Validate file
          const error = validateFile(file);
          if (error) {
            toast.error('Dosya Hatası', { description: error });
            continue;
          }

          // Show progress
          setUploadProgress(((i + 1) / fileArray.length) * 100);

          try {
            // Upload to Cloudinary
            const url = await uploadToCloudinary(file);

            // Create preview for images
            let preview: string | undefined;
            if (file.type.startsWith('image/')) {
              preview = URL.createObjectURL(file);
            }

            // Add to list
            newFiles.push({
              id: `${Date.now()}-${i}`,
              name: file.name,
              url,
              type: file.type,
              size: file.size,
              preview,
            });
          } catch (_err) {
            toast.error('Yükleme Hatası', {
              description: `${file.name} yüklenemedi`,
            });
          }
        }

        if (newFiles.length > 0) {
          const updatedFiles = [...uploadedFiles, ...newFiles];
          setUploadedFiles(updatedFiles);
          onFilesChange(updatedFiles.map((f) => f.url));
          toast.success('Başarılı', {
            description: `${newFiles.length} dosya yüklendi`,
          });
        }
      } catch (_error) {
        toast.error('Yükleme Hatası', {
          description: 'Dosyalar yüklenirken bir hata oluştu',
        });
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [uploadedFiles, onFilesChange]
  );

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFileUpload(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle drag events
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
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  // Handle file remove
  const handleRemove = (fileId: string) => {
    const updatedFiles = uploadedFiles.filter((f) => f.id !== fileId);
    setUploadedFiles(updatedFiles);
    onFilesChange(updatedFiles.map((f) => f.url));
    toast.success('Dosya Kaldırıldı');
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {/* Upload Area */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          isDragging
            ? 'border-purple-500 bg-purple-50'
            : disabled
              ? 'border-gray-200 bg-gray-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={() => {
          if (!disabled && !isUploading && fileInputRef.current) {
            fileInputRef.current.click();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          disabled={disabled || isUploading}
          className="hidden"
        />

        {isUploading ? (
          <div className="space-y-3">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-purple-600" />
            <p className="text-sm font-medium text-gray-700">
              Yükleniyor... {uploadProgress.toFixed(0)}%
            </p>
            <div className="mx-auto h-2 w-full max-w-xs overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-purple-600 transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <Upload className="mx-auto mb-3 h-10 w-10 text-gray-400" />
            <p className="mb-2 text-sm font-medium text-gray-700">
              Dosyaları buraya sürükleyin veya{' '}
              <span className="text-purple-600">tıklayarak seçin</span>
            </p>
            <p className="text-xs text-gray-500">
              Maksimum {maxFiles} dosya, her biri {maxSizeMB}MB&apos;a kadar
            </p>
            <p className="mt-1 text-xs text-gray-400">
              JPG, PNG, GIF, WEBP, PDF
            </p>
          </>
        )}
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Yüklenen Dosyalar ({uploadedFiles.length}/{maxFiles})
          </p>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3"
              >
                {/* Preview/Icon */}
                <div className="flex-shrink-0">
                  {file.preview ? (
                    <div className="relative h-12 w-12 overflow-hidden rounded">
                      <Image
                        src={file.preview}
                        alt={file.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : file.type.startsWith('image/') ? (
                    <div className="flex h-12 w-12 items-center justify-center rounded bg-purple-100">
                      <ImageIcon className="h-6 w-6 text-purple-600" />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded bg-blue-100">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>

                {/* Remove Button */}
                {!disabled && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(file.id);
                    }}
                    className="flex-shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Helper Text */}
      {!disabled && uploadedFiles.length < maxFiles && (
        <p className="text-xs text-gray-500">
          💡 Kanıtlarınızı (ekran görüntüleri, mesajlar, belgeler) yükleyerek
          itirazınızı güçlendirebilirsiniz.
        </p>
      )}
    </div>
  );
}

export default EvidenceUpload;
