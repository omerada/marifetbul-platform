/**
 * File upload utilities
 * Production-ready file upload functionality with service integration
 */

import { FileAttachment } from '@/types';
import { getFileUploadService } from './fileUpload.service';
import { logger } from '@/lib/shared/utils/logger';

// Allowed file types
export const ALLOWED_FILE_TYPES = {
  image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  text: ['text/plain'],
  all: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],
};

// Max file size (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Max files per upload
export const MAX_FILES = 5;

export interface FileUploadOptions {
  allowedTypes?: string[];
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
}

export interface FileValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate file before upload
 */
export function validateFile(
  file: File,
  options: FileUploadOptions = {}
): FileValidationResult {
  const { allowedTypes = ALLOWED_FILE_TYPES.all, maxSize = MAX_FILE_SIZE } =
    options;

  const errors: string[] = [];

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`Desteklenmeyen dosya türü: ${file.type}`);
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    errors.push(`Dosya boyutu ${maxSizeMB}MB'dan büyük olamaz`);
  }

  // Check file name
  if (!file.name || file.name.trim() === '') {
    errors.push('Geçersiz dosya adı');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate multiple files
 */
export function validateFiles(
  files: File[],
  options: FileUploadOptions = {}
): FileValidationResult {
  const { maxFiles = MAX_FILES } = options;

  const errors: string[] = [];

  // Check number of files
  if (files.length > maxFiles) {
    errors.push(`En fazla ${maxFiles} dosya yükleyebilirsiniz`);
  }

  // Validate each file
  files.forEach((file, index) => {
    const fileValidation = validateFile(file, options);
    if (!fileValidation.valid) {
      errors.push(`Dosya ${index + 1}: ${fileValidation.errors.join(', ')}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file icon based on file type
 */
export function getFileIcon(fileType: string): string {
  if (fileType.startsWith('image/')) {
    return '🖼️';
  } else if (fileType === 'application/pdf') {
    return '📄';
  } else if (fileType.includes('word') || fileType.includes('document')) {
    return '📝';
  } else if (fileType.startsWith('text/')) {
    return '📋';
  } else {
    return '📁';
  }
}

/**
 * Upload a single file using the file upload service
 */
export async function uploadFile(file: File): Promise<FileAttachment> {
  const uploadService = getFileUploadService();
  const result = await uploadService.uploadFile(file);

  if (!result.success) {
    throw new Error(result.error || 'Dosya yüklenemedi');
  }

  const attachment = uploadService.resultToAttachment(result, file);
  if (!attachment) {
    throw new Error('Dosya yüklenirken bir hata oluştu');
  }

  return attachment;
}

/**
 * Upload multiple files using the file upload service
 */
export async function uploadFiles(files: File[]): Promise<FileAttachment[]> {
  const uploadService = getFileUploadService();
  const results = await uploadService.uploadFiles(files);

  const attachments: FileAttachment[] = [];

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const file = files[i];

    if (result.success) {
      const attachment = uploadService.resultToAttachment(result, file);
      if (attachment) {
        attachments.push(attachment);
      }
    }
    // Silently skip failed uploads - could be enhanced with error handling
  }

  return attachments;
}

/**
 * Delete file from storage
 */
export async function deleteFile(fileId: string): Promise<void> {
  try {
    const response = await fetch(`/api/v1/files/${fileId}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('File deletion failed');
    }
  } catch (error) {
    logger.error(
      'Error deleting file',
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

/**
 * Check if file is an image
 */
export function isImageFile(fileType: string): boolean {
  return fileType.startsWith('image/');
}

/**
 * Create file preview URL
 */
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Cleanup preview URL
 */
export function cleanupPreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}
