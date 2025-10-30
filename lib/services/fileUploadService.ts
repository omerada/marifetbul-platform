/**
 * File Upload Service
 * Handles uploading various file types to Cloudinary for order deliveries
 */

import { logger } from '@/lib/shared/utils/logger';

// Cloudinary configuration
const CLOUDINARY_CONFIG = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '',
};

// Order deliveries folder structure
const ORDER_DELIVERIES_FOLDER = 'marifetbul/order-deliveries';

/**
 * Cloudinary upload response
 */
export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
  bytes: number;
  created_at: string;
  original_filename: string;
}

/**
 * Upload result with progress
 */
export interface FileUploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  fileName?: string;
  error?: string;
}

/**
 * Upload progress callback
 */
export type UploadProgressCallback = (progress: number) => void;

/**
 * Supported file types for order deliveries
 */
const ALLOWED_FILE_TYPES = {
  // Documents
  'application/pdf': { ext: 'pdf', category: 'document' },
  'application/msword': { ext: 'doc', category: 'document' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    ext: 'docx',
    category: 'document',
  },

  // Spreadsheets
  'application/vnd.ms-excel': { ext: 'xls', category: 'document' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
    ext: 'xlsx',
    category: 'document',
  },

  // Presentations
  'application/vnd.ms-powerpoint': { ext: 'ppt', category: 'document' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': {
    ext: 'pptx',
    category: 'document',
  },

  // Images
  'image/jpeg': { ext: 'jpg', category: 'image' },
  'image/jpg': { ext: 'jpg', category: 'image' },
  'image/png': { ext: 'png', category: 'image' },
  'image/gif': { ext: 'gif', category: 'image' },
  'image/webp': { ext: 'webp', category: 'image' },
  'image/svg+xml': { ext: 'svg', category: 'image' },

  // Design files
  'application/postscript': { ext: 'ai', category: 'design' },
  'image/vnd.adobe.photoshop': { ext: 'psd', category: 'design' },

  // Archives
  'application/zip': { ext: 'zip', category: 'archive' },
  'application/x-rar-compressed': { ext: 'rar', category: 'archive' },
  'application/x-7z-compressed': { ext: '7z', category: 'archive' },

  // Video
  'video/mp4': { ext: 'mp4', category: 'video' },
  'video/quicktime': { ext: 'mov', category: 'video' },
  'video/x-msvideo': { ext: 'avi', category: 'video' },
};

/**
 * Validate file type
 */
function validateFileType(file: File): { valid: boolean; error?: string } {
  const fileInfo =
    ALLOWED_FILE_TYPES[file.type as keyof typeof ALLOWED_FILE_TYPES];

  if (!fileInfo) {
    return {
      valid: false,
      error: `File type not supported: ${file.type}. Please upload documents, images, design files, or archives.`,
    };
  }

  return { valid: true };
}

/**
 * Validate file size (max 50MB per file)
 */
function validateFileSize(file: File): { valid: boolean; error?: string } {
  const maxSize = 50 * 1024 * 1024; // 50MB

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds 50MB limit. File: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
    };
  }

  return { valid: true };
}

/**
 * Upload a file to Cloudinary
 * Supports documents, images, design files, archives, and videos
 */
export async function uploadFile(
  file: File,
  onProgress?: UploadProgressCallback
): Promise<FileUploadResult> {
  try {
    // Validate file
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    // Validate file type
    const typeValidation = validateFileType(file);
    if (!typeValidation.valid) {
      return { success: false, error: typeValidation.error };
    }

    // Validate file size
    const sizeValidation = validateFileSize(file);
    if (!sizeValidation.valid) {
      return { success: false, error: sizeValidation.error };
    }

    // Check Cloudinary configuration
    if (!CLOUDINARY_CONFIG.cloudName || !CLOUDINARY_CONFIG.uploadPreset) {
      logger.error('Cloudinary configuration missing', {
        hasCloudName: !!CLOUDINARY_CONFIG.cloudName,
        hasUploadPreset: !!CLOUDINARY_CONFIG.uploadPreset,
      });
      return {
        success: false,
        error: 'File upload service is not configured. Please contact support.',
      };
    }

    // Determine resource type
    const fileInfo =
      ALLOWED_FILE_TYPES[file.type as keyof typeof ALLOWED_FILE_TYPES];
    const resourceType =
      fileInfo.category === 'image'
        ? 'image'
        : fileInfo.category === 'video'
          ? 'video'
          : 'raw'; // Documents, archives, design files

    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('folder', ORDER_DELIVERIES_FOLDER);
    formData.append('resource_type', resourceType);

    // Upload URL
    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/${resourceType}/upload`;

    logger.info('Uploading file to Cloudinary', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      resourceType,
      folder: ORDER_DELIVERIES_FOLDER,
    });

    // Use XMLHttpRequest for progress tracking
    return new Promise<FileUploadResult>((resolve) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            onProgress(Math.round(percentComplete));
          }
        });
      }

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data: CloudinaryUploadResponse = JSON.parse(xhr.responseText);

            logger.info('File uploaded successfully', {
              publicId: data.public_id,
              url: data.secure_url,
              format: data.format,
              size: data.bytes,
              fileName: file.name,
            });

            resolve({
              success: true,
              url: data.secure_url,
              publicId: data.public_id,
              fileName: file.name,
            });
          } catch (error) {
            logger.error('Error parsing upload response', {
              error,
              response: xhr.responseText,
            });
            resolve({
              success: false,
              error: 'Failed to parse upload response',
            });
          }
        } else {
          logger.error('Upload failed with status', {
            status: xhr.status,
            statusText: xhr.statusText,
            response: xhr.responseText,
          });
          resolve({
            success: false,
            error: `Upload failed: ${xhr.statusText}`,
          });
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        logger.error('Network error during upload', { fileName: file.name });
        resolve({
          success: false,
          error: 'Network error during upload. Please check your connection.',
        });
      });

      // Handle abort
      xhr.addEventListener('abort', () => {
        logger.warn('Upload aborted', { fileName: file.name });
        resolve({
          success: false,
          error: 'Upload was cancelled',
        });
      });

      // Send request
      xhr.open('POST', uploadUrl);
      xhr.send(formData);
    });
  } catch (error) {
    logger.error('Error uploading file', { error, fileName: file.name });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Upload multiple files with progress tracking
 */
export async function uploadMultipleFiles(
  files: File[],
  onFileProgress?: (fileIndex: number, progress: number) => void,
  onOverallProgress?: (progress: number) => void
): Promise<FileUploadResult[]> {
  const results: FileUploadResult[] = [];
  let completedFiles = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    const result = await uploadFile(file, (progress) => {
      // Individual file progress
      if (onFileProgress) {
        onFileProgress(i, progress);
      }

      // Overall progress
      if (onOverallProgress) {
        const overallProgress =
          ((completedFiles + progress / 100) / files.length) * 100;
        onOverallProgress(Math.round(overallProgress));
      }
    });

    results.push(result);
    completedFiles++;

    // Update overall progress after file completion
    if (onOverallProgress) {
      const overallProgress = (completedFiles / files.length) * 100;
      onOverallProgress(Math.round(overallProgress));
    }
  }

  return results;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(fileName: string): string {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Get file icon based on type
 */
export function getFileIcon(fileType: string): string {
  const fileInfo =
    ALLOWED_FILE_TYPES[fileType as keyof typeof ALLOWED_FILE_TYPES];

  if (!fileInfo) return '📄';

  switch (fileInfo.category) {
    case 'document':
      return '📄';
    case 'image':
      return '🖼️';
    case 'design':
      return '🎨';
    case 'archive':
      return '📦';
    case 'video':
      return '🎬';
    default:
      return '📄';
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Check if Cloudinary is configured
 */
export function isFileUploadConfigured(): boolean {
  return !!(CLOUDINARY_CONFIG.cloudName && CLOUDINARY_CONFIG.uploadPreset);
}
