'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { FileAttachment } from '@/types';
import {
  validateFiles,
  uploadFiles,
  formatFileSize,
  getFileIcon,
  isImageFile,
  createPreviewUrl,
  cleanupPreviewUrl,
  FileUploadOptions,
  FileUploadResult,
  ALLOWED_FILE_TYPES,
} from '@/lib/utils/fileUpload';

interface FileUploadProps {
  onFilesUploaded: (files: FileAttachment[]) => void;
  onError?: (error: string) => void;
  options?: FileUploadOptions;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

interface FilePreview {
  file: File;
  previewUrl?: string;
  error?: string;
}

export default function FileUpload({
  onFilesUploaded,
  onError,
  options = {},
  disabled = false,
  className = '',
  children,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    allowedTypes = ALLOWED_FILE_TYPES,
    multiple = true,
    maxFiles = 5,
  } = options;

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);

      // Validate files
      const validation = validateFiles(fileArray, options);
      if (!validation.isValid) {
        onError?.(validation.errors.join('\n'));
        return;
      }

      // Create previews
      const newPreviews: FilePreview[] = fileArray.map((file) => ({
        file,
        previewUrl: isImageFile(file.type) ? createPreviewUrl(file) : undefined,
      }));

      setPreviews(newPreviews);
    },
    [options, onError]
  );

  const handleUpload = useCallback(async () => {
    if (previews.length === 0) return;

    setIsUploading(true);

    try {
      const files = previews.map((p) => p.file);
      const uploadResults = await uploadFiles(files);

      // Convert FileUploadResult[] to FileAttachment[]
      const fileAttachments: FileAttachment[] = uploadResults
        .filter((result: FileUploadResult) => result.success)
        .map((result: FileUploadResult, index: number) => ({
          id: Math.random().toString(36).substr(2, 9),
          name: files[index].name,
          type: files[index].type,
          filename: files[index].name,
          size: files[index].size,
          mimetype: files[index].type,
          url: result.url || '',
          uploadedAt: new Date().toISOString(),
        }));

      onFilesUploaded(fileAttachments);

      // Cleanup
      previews.forEach((preview) => {
        if (preview.previewUrl) {
          cleanupPreviewUrl(preview.previewUrl);
        }
      });
      setPreviews([]);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      onError?.(
        error instanceof Error ? error.message : 'Dosya yükleme hatası'
      );
    } finally {
      setIsUploading(false);
    }
  }, [previews, onFilesUploaded, onError]);

  const handleCancel = useCallback(() => {
    // Cleanup preview URLs
    previews.forEach((preview) => {
      if (preview.previewUrl) {
        cleanupPreviewUrl(preview.previewUrl);
      }
    });
    setPreviews([]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [previews]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (disabled || isUploading) return;

      const files = e.dataTransfer.files;
      handleFileSelect(files);
    },
    [disabled, isUploading, handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const openFileDialog = useCallback(() => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  }, [disabled, isUploading]);

  return (
    <div className={`file-upload ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={allowedTypes.join(',')}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* Upload area */}
      {previews.length === 0 ? (
        <div
          onClick={openFileDialog}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`relative cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors duration-200 hover:border-blue-400 hover:bg-blue-50 ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${isUploading ? 'pointer-events-none' : ''} `}
        >
          {children || (
            <>
              <div className="mb-4 text-4xl">📁</div>
              <div className="text-gray-600">
                <p className="font-medium">
                  Dosya yüklemek için tıklayın veya sürükleyin
                </p>
                <p className="mt-1 text-sm">
                  Maksimum {maxFiles} dosya, her biri en fazla 5MB
                </p>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* File previews */}
          <div className="space-y-2">
            {previews.map((preview, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 rounded-lg bg-gray-50 p-3"
              >
                {/* File icon or image preview */}
                <div className="flex-shrink-0">
                  {preview.previewUrl ? (
                    <Image
                      src={preview.previewUrl}
                      alt={preview.file.name}
                      width={40}
                      height={40}
                      className="rounded object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="text-2xl">
                      {getFileIcon(preview.file.type)}
                    </span>
                  )}
                </div>

                {/* File info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {preview.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(preview.file.size)}
                  </p>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => {
                    const newPreviews = previews.filter((_, i) => i !== index);
                    if (preview.previewUrl) {
                      cleanupPreviewUrl(preview.previewUrl);
                    }
                    setPreviews(newPreviews);
                  }}
                  className="p-1 text-red-500 hover:text-red-700"
                  disabled={isUploading}
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleUpload}
              disabled={isUploading || previews.length === 0}
              className={`flex-1 rounded-md px-4 py-2 font-medium text-white ${
                isUploading || previews.length === 0
                  ? 'cursor-not-allowed bg-gray-400'
                  : 'bg-blue-600 hover:bg-blue-700'
              } transition-colors duration-200`}
            >
              {isUploading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Yükleniyor...
                </span>
              ) : (
                'Yükle'
              )}
            </button>

            <button
              onClick={handleCancel}
              disabled={isUploading}
              className="rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50"
            >
              İptal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
