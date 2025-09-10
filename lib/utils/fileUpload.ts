/**
 * File upload utilities
 * Mock implementation for file upload functionality
 */

import { FileAttachment } from '@/types';

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
 * Mock file upload function
 * In a real app, this would upload to a cloud storage service
 */
export async function uploadFile(file: File): Promise<FileAttachment> {
  // Simulate upload delay
  await new Promise((resolve) =>
    setTimeout(resolve, 1000 + Math.random() * 2000)
  );

  // Simulate random upload failures (10% chance)
  if (Math.random() < 0.1) {
    throw new Error('Dosya yüklenemedi. Lütfen tekrar deneyin.');
  }

  // Create mock file URL
  const mockUrl = URL.createObjectURL(file);

  return {
    id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: file.name,
    url: mockUrl,
    type: file.type,
    size: file.size,
    uploadedAt: new Date().toISOString(),
  };
}

/**
 * Mock multiple file upload function
 */
export async function uploadFiles(files: File[]): Promise<FileAttachment[]> {
  const uploadPromises = files.map((file) => uploadFile(file));
  return Promise.all(uploadPromises);
}

/**
 * Mock file deletion function
 */
export async function deleteFile(fileId: string): Promise<void> {
  // Simulate deletion delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // In a real app, this would delete from cloud storage
  console.log(`Mock: Deleted file ${fileId}`);
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
