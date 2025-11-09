/**
 * ============================================================================
 * DISPUTE EVIDENCE API - Evidence Upload Management
 * ============================================================================
 * Handles evidence file upload for disputes
 *
 * Features:
 * - Upload evidence files to Cloudinary
 * - Submit evidence metadata to backend
 * - File validation (type, size)
 * - Progress tracking
 * - Multiple file support
 *
 * @version 1.0.0
 * @author MarifetBul Development Team
 * @created December 2024
 * @sprint Security & Settings Sprint - Story 4
 */

'use client';

import { apiClient } from '@/lib/infrastructure/api/client';
import logger from '@/lib/infrastructure/monitoring/logger';
import type { DisputeEvidence } from '@/types/dispute';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Evidence upload request for Cloudinary
 */
export interface EvidenceUploadRequest {
  file: File;
  description?: string;
}

/**
 * Evidence upload result from Cloudinary
 */
export interface EvidenceUploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
  fileSize?: number;
  fileType?: string;
  fileName?: string;
}

/**
 * Evidence submission to backend
 */
export interface EvidenceSubmissionRequest {
  fileUrl: string;
  fileType: string;
  fileName: string;
  fileSize: number;
  description?: string;
}

/**
 * Progress callback type
 */
export type ProgressCallback = (progress: number) => void;

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Allowed file types for evidence
 */
export const ALLOWED_EVIDENCE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
] as const;

/**
 * Maximum file size (10MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Cloudinary folder for disputes
 */
const DISPUTES_FOLDER = 'marifetbul/disputes';

/**
 * Cloudinary configuration
 */
const CLOUDINARY_CONFIG = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '',
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate file type
 *
 * @param file - File to validate
 * @returns boolean - True if valid
 *
 * @example
 * ```ts
 * const isValid = validateFileType(file);
 * ```
 */
export function validateFileType(file: File): boolean {
  return ALLOWED_EVIDENCE_TYPES.includes(
    file.type as (typeof ALLOWED_EVIDENCE_TYPES)[number]
  );
}

/**
 * Validate file size
 *
 * @param file - File to validate
 * @returns boolean - True if valid
 *
 * @example
 * ```ts
 * const isValid = validateFileSize(file);
 * ```
 */
export function validateFileSize(file: File): boolean {
  return file.size <= MAX_FILE_SIZE;
}

/**
 * Validate evidence file
 *
 * @param file - File to validate
 * @returns object - Validation result with error message if invalid
 *
 * @example
 * ```ts
 * const { valid, error } = validateEvidenceFile(file);
 * if (!valid) console.error(error);
 * ```
 */
export function validateEvidenceFile(file: File): {
  valid: boolean;
  error?: string;
} {
  if (!file) {
    return { valid: false, error: 'Dosya seçilmedi' };
  }

  if (!validateFileType(file)) {
    return {
      valid: false,
      error: 'Geçersiz dosya tipi. Sadece JPEG, PNG, WebP ve PDF desteklenir.',
    };
  }

  if (!validateFileSize(file)) {
    return {
      valid: false,
      error: 'Dosya boyutu 10MB sınırını aşıyor.',
    };
  }

  return { valid: true };
}

// ============================================================================
// UPLOAD FUNCTIONS
// ============================================================================

/**
 * Upload evidence file to Cloudinary
 *
 * @param file - File to upload
 * @param onProgress - Progress callback (0-100)
 * @returns Promise<EvidenceUploadResult> - Upload result with URL
 * @throws Error if upload fails
 *
 * @example
 * ```ts
 * const result = await uploadEvidenceFile(file, (progress) => {
 *   console.log(`Upload progress: ${progress}%`);
 * });
 * ```
 */
export async function uploadEvidenceFile(
  file: File,
  onProgress?: ProgressCallback
): Promise<EvidenceUploadResult> {
  try {
    // Validate file
    const validation = validateEvidenceFile(file);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // Check Cloudinary config
    if (!CLOUDINARY_CONFIG.cloudName || !CLOUDINARY_CONFIG.uploadPreset) {
      logger.error('Cloudinary configuration missing');
      return {
        success: false,
        error:
          'Cloudinary yapılandırması eksik. Lütfen yönetici ile iletişime geçin.',
      };
    }

    logger.debug('uploadEvidenceFile: Starting upload', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('folder', DISPUTES_FOLDER);

    // Upload to Cloudinary with XMLHttpRequest for progress tracking
    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/upload`;

    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();

      // Progress tracking
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        });
      }

      // Success handler
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);

            logger.info('uploadEvidenceFile: Success', {
              url: data.secure_url,
              publicId: data.public_id,
            });

            resolve({
              success: true,
              url: data.secure_url,
              publicId: data.public_id,
              fileSize: file.size,
              fileType: file.type,
              fileName: file.name,
            });
          } catch (err) {
            logger.error(
              'uploadEvidenceFile: Failed to parse response',
              err as Error
            );
            resolve({
              success: false,
              error: 'Yanıt ayrıştırma hatası',
            });
          }
        } else {
          logger.error('uploadEvidenceFile: Upload failed');
          resolve({
            success: false,
            error: `Yükleme başarısız: ${xhr.statusText}`,
          });
        }
      });

      // Error handler
      xhr.addEventListener('error', () => {
        logger.error('uploadEvidenceFile: Network error');
        resolve({
          success: false,
          error: 'Ağ hatası. Lütfen tekrar deneyin.',
        });
      });

      // Send request
      xhr.open('POST', uploadUrl);
      xhr.send(formData);
    });
  } catch (error) {
    logger.error('uploadEvidenceFile: Unexpected error', error as Error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bilinmeyen hata',
    };
  }
}

/**
 * Submit evidence metadata to backend
 *
 * @param disputeId - Dispute ID
 * @param evidence - Evidence metadata
 * @returns Promise<DisputeEvidence> - Created evidence record
 * @throws Error if submission fails
 *
 * @example
 * ```ts
 * const evidence = await submitEvidence('dispute-123', {
 *   fileUrl: 'https://cloudinary.com/...',
 *   fileName: 'receipt.pdf',
 *   fileType: 'application/pdf',
 *   fileSize: 102400,
 *   description: 'Payment receipt'
 * });
 * ```
 */
export async function submitEvidence(
  disputeId: string,
  evidence: EvidenceSubmissionRequest
): Promise<DisputeEvidence> {
  try {
    logger.debug('submitEvidence: Submitting to backend', {
      disputeId,
      fileName: evidence.fileName,
    });

    const data = await apiClient.post<DisputeEvidence>(
      `/disputes/${disputeId}/evidence`,
      evidence
    );

    logger.info('submitEvidence: Success', {
      disputeId,
      evidenceId: data.id,
    });

    return data;
  } catch (error) {
    logger.error('submitEvidence: Failed', error as Error);
    throw error;
  }
}

/**
 * Upload and submit evidence (complete flow)
 *
 * @param disputeId - Dispute ID
 * @param request - Upload request with file and description
 * @param onProgress - Progress callback (0-100)
 * @returns Promise<DisputeEvidence> - Created evidence record
 * @throws Error if upload or submission fails
 *
 * @example
 * ```ts
 * const evidence = await uploadAndSubmitEvidence(
 *   'dispute-123',
 *   { file, description: 'Invoice' },
 *   (progress) => console.log(`${progress}%`)
 * );
 * ```
 */
export async function uploadAndSubmitEvidence(
  disputeId: string,
  request: EvidenceUploadRequest,
  onProgress?: ProgressCallback
): Promise<DisputeEvidence> {
  try {
    logger.debug('uploadAndSubmitEvidence: Starting', { disputeId });

    // Step 1: Upload file to Cloudinary
    const uploadResult = await uploadEvidenceFile(request.file, onProgress);

    if (!uploadResult.success || !uploadResult.url) {
      throw new Error(uploadResult.error || 'Upload failed');
    }

    // Step 2: Submit metadata to backend
    const evidence = await submitEvidence(disputeId, {
      fileUrl: uploadResult.url,
      fileName: uploadResult.fileName!,
      fileType: uploadResult.fileType!,
      fileSize: uploadResult.fileSize!,
      description: request.description,
    });

    logger.info('uploadAndSubmitEvidence: Success', {
      disputeId,
      evidenceId: evidence.id,
    });

    return evidence;
  } catch (error) {
    logger.error('uploadAndSubmitEvidence: Failed', error as Error);
    throw error;
  }
}

/**
 * Get evidence list for a dispute
 *
 * @param disputeId - Dispute ID
 * @returns Promise<DisputeEvidence[]> - List of evidence records
 * @throws Error if request fails
 *
 * @example
 * ```ts
 * const evidenceList = await getDisputeEvidence('dispute-123');
 * ```
 */
export async function getDisputeEvidence(
  disputeId: string
): Promise<DisputeEvidence[]> {
  try {
    logger.debug('getDisputeEvidence: Fetching', { disputeId });

    const data = await apiClient.get<DisputeEvidence[]>(
      `/disputes/${disputeId}/evidence`
    );

    logger.info('getDisputeEvidence: Success', {
      disputeId,
      count: data.length,
    });

    return data;
  } catch (error) {
    logger.error('getDisputeEvidence: Failed', error as Error);
    throw error;
  }
}

/**
 * Delete evidence
 *
 * @param disputeId - Dispute ID
 * @param evidenceId - Evidence ID
 * @returns Promise<boolean> - Success status
 * @throws Error if deletion fails
 *
 * @example
 * ```ts
 * await deleteEvidence('dispute-123', 'evidence-456');
 * ```
 */
export async function deleteEvidence(
  disputeId: string,
  evidenceId: string
): Promise<boolean> {
  try {
    logger.debug('deleteEvidence: Deleting', { disputeId, evidenceId });

    await apiClient.delete(`/disputes/${disputeId}/evidence/${evidenceId}`);

    logger.info('deleteEvidence: Success', { disputeId, evidenceId });

    return true;
  } catch (error) {
    logger.error('deleteEvidence: Failed', error as Error);
    throw error;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format file size to human-readable string
 *
 * @param bytes - File size in bytes
 * @returns string - Formatted size (e.g., "2.5 MB")
 *
 * @example
 * ```ts
 * formatFileSize(2500000); // "2.4 MB"
 * ```
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Get file type icon name
 *
 * @param fileType - MIME type
 * @returns string - Icon name for UI libraries
 *
 * @example
 * ```ts
 * getFileTypeIcon('application/pdf'); // "FileText"
 * getFileTypeIcon('image/jpeg'); // "Image"
 * ```
 */
export function getFileTypeIcon(fileType: string): string {
  if (fileType.startsWith('image/')) {
    return 'Image';
  }

  if (fileType === 'application/pdf') {
    return 'FileText';
  }

  return 'File';
}

/**
 * Check if file is an image
 *
 * @param fileType - MIME type
 * @returns boolean - True if image
 *
 * @example
 * ```ts
 * isImageFile('image/jpeg'); // true
 * isImageFile('application/pdf'); // false
 * ```
 */
export function isImageFile(fileType: string): boolean {
  return fileType.startsWith('image/');
}

// ============================================================================
// EXPORTS
// ============================================================================

export const disputeEvidenceApi = {
  uploadEvidenceFile,
  submitEvidence,
  uploadAndSubmitEvidence,
  getDisputeEvidence,
  deleteEvidence,
  validateEvidenceFile,
  validateFileType,
  validateFileSize,
  formatFileSize,
  getFileTypeIcon,
  isImageFile,
};

export default disputeEvidenceApi;
