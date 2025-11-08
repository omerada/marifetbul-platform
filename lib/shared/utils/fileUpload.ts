import { FileAttachment } from '@/types';
import { formatFileSize } from '../formatters';

// ============================================================================
// Sprint 10: File Upload Constants
// ============================================================================
// Note: These constants are unused in the codebase (no imports found)
// Kept for potential future use or can be removed in future sprint

// Allowed file types for uploads
export const ALLOWED_FILE_TYPES = [
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',

  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',

  // Archives
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed',

  // Other
  'application/json',
  'application/xml',
];

// Re-export formatFileSize from canonical location
export { formatFileSize };

/**
 * Get file icon based on file type
 */
export function getFileIcon(fileType: string): string {
  if (fileType.startsWith('image/')) {
    return '🖼️';
  }

  if (fileType.startsWith('video/')) {
    return '🎥';
  }

  if (fileType.startsWith('audio/')) {
    return '🎵';
  }

  if (fileType.includes('pdf')) {
    return '📄';
  }

  if (fileType.includes('word') || fileType.includes('document')) {
    return '📝';
  }

  if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
    return '📊';
  }

  if (fileType.includes('powerpoint') || fileType.includes('presentation')) {
    return '📈';
  }

  if (
    fileType.includes('zip') ||
    fileType.includes('rar') ||
    fileType.includes('7z')
  ) {
    return '🗜️';
  }

  if (fileType === 'text/plain') {
    return '📄';
  }

  if (fileType === 'application/json') {
    return '📋';
  }

  return '📎';
}

/**
 * Validate file type against allowed types
 */
export function isFileTypeAllowed(fileType: string): boolean {
  return ALLOWED_FILE_TYPES.includes(fileType);
}

/**
 * Validate file size (max 10MB by default)
 */
export function isFileSizeValid(
  fileSize: number,
  maxSizeInMB: number = 10
): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return fileSize <= maxSizeInBytes;
}

/**
 * Generate file attachment object from File
 */
export function createFileAttachment(file: File): FileAttachment {
  return {
    id: crypto.randomUUID(),
    name: file.name,
    filename: file.name,
    size: file.size,
    type: file.type,
    mimetype: file.type,
    url: URL.createObjectURL(file),
    uploadedAt: new Date().toISOString(),
  };
}

/**
 * Validate uploaded files
 */
export function validateFiles(
  files: File[],
  options: {
    maxFiles?: number;
    maxSizeInMB?: number;
    allowedTypes?: string[];
  } = {}
): { valid: FileAttachment[]; errors: string[] } {
  const {
    maxFiles = 5,
    maxSizeInMB = 10,
    allowedTypes = ALLOWED_FILE_TYPES,
  } = options;

  const valid: FileAttachment[] = [];
  const errors: string[] = [];

  if (files.length > maxFiles) {
    errors.push(`En fazla ${maxFiles} dosya yükleyebilirsiniz.`);
    return { valid, errors };
  }

  for (const file of files) {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      errors.push(`${file.name}: Desteklenmeyen dosya formatı.`);
      continue;
    }

    // Check file size
    if (!isFileSizeValid(file.size, maxSizeInMB)) {
      errors.push(
        `${file.name}: Dosya boyutu ${maxSizeInMB}MB'dan büyük olamaz.`
      );
      continue;
    }

    // File is valid
    valid.push(createFileAttachment(file));
  }

  return { valid, errors };
}
