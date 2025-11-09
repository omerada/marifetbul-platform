/**
 * Cloudinary Utility Functions
 * Handles image upload, delete, and URL transformations for portfolios
 */

import logger from '@/lib/infrastructure/monitoring/logger';

// Cloudinary configuration from environment
const CLOUDINARY_CONFIG = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '',
  apiKey: process.env.CLOUDINARY_API_KEY || '',
  apiSecret: process.env.CLOUDINARY_API_SECRET || '',
};

// Portfolio-specific folder structure
const PORTFOLIO_FOLDER = 'marifetbul/portfolios';
export const DISPUTES_FOLDER = 'marifetbul/disputes'; // Used by dispute-evidence API

/**
 * Cloudinary upload response
 */
export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
}

/**
 * Upload result
 */
export interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

/**
 * Upload an image to Cloudinary
 * Uses unsigned upload with upload preset
 */
export async function uploadImage(file: File): Promise<UploadResult> {
  try {
    // Validate file
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.',
      };
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File size exceeds 5MB limit.',
      };
    }

    // Check configuration
    if (!CLOUDINARY_CONFIG.cloudName || !CLOUDINARY_CONFIG.uploadPreset) {
      logger.error('Cloudinary configuration missing', {
        hasCloudName: !!CLOUDINARY_CONFIG.cloudName,
        hasUploadPreset: !!CLOUDINARY_CONFIG.uploadPreset,
      });
      return {
        success: false,
        error:
          'Cloudinary is not configured. Please check environment variables.',
      };
    }

    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('folder', PORTFOLIO_FOLDER);

    // Upload to Cloudinary
    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;

    logger.info('Uploading image to Cloudinary', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      folder: PORTFOLIO_FOLDER,
    });

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error('Cloudinary upload failed', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      return {
        success: false,
        error: `Upload failed: ${response.statusText}`,
      };
    }

    const data: CloudinaryUploadResponse = await response.json();

    logger.info('Image uploaded successfully', {
      publicId: data.public_id,
      url: data.secure_url,
      format: data.format,
      size: data.bytes,
    });

    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
    };
  } catch (error) {
    logger.error('Error uploading image', { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Delete an image from Cloudinary
 * Requires API key and secret (server-side only)
 */
/**
 * Delete an image from Cloudinary via server-side API
 *
 * @param publicId - Cloudinary public ID
 * @returns Promise<boolean> - Success status
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    if (!publicId) {
      logger.warn('No public ID provided for deletion');
      return false;
    }

    logger.info('Deleting image via server-side API', { publicId });

    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await fetch(
      `${API_BASE_URL}/api/v1/storage/files?storageKey=${encodeURIComponent(publicId)}`,
      {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      logger.error('Server returned error for image deletion', {
        status: response.status,
        publicId,
      });
      return false;
    }

    const result = await response.json();
    logger.info('Image deleted successfully', { publicId, result });
    return true;
  } catch (error) {
    logger.error('Error deleting image', { error, publicId });
    return false;
  }
}

/**
 * Get optimized image URL with transformations
 */
export function getOptimizedUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'scale' | 'thumb';
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  } = {}
): string {
  try {
    if (!url || !url.includes('cloudinary')) {
      return url;
    }

    const {
      width,
      height,
      crop = 'fill',
      quality = 'auto',
      format = 'auto',
    } = options;

    // Build transformation string
    const transformations: string[] = [];

    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (crop) transformations.push(`c_${crop}`);
    if (quality) transformations.push(`q_${quality}`);
    if (format) transformations.push(`f_${format}`);

    if (transformations.length === 0) {
      return url;
    }

    // Insert transformations into URL
    const transformationString = transformations.join(',');
    const urlParts = url.split('/upload/');

    if (urlParts.length !== 2) {
      return url;
    }

    return `${urlParts[0]}/upload/${transformationString}/${urlParts[1]}`;
  } catch (error) {
    logger.error('Error generating optimized URL', { error, url });
    return url;
  }
}

/**
 * Extract public ID from Cloudinary URL
 */
export function extractPublicId(url: string): string | null {
  try {
    if (!url || !url.includes('cloudinary')) {
      return null;
    }

    // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/marifetbul/portfolios/abc123.jpg
    const parts = url.split('/upload/');
    if (parts.length !== 2) {
      return null;
    }

    // Remove version and get the path
    const pathParts = parts[1].split('/');
    const versionRemoved = pathParts[0].startsWith('v')
      ? pathParts.slice(1)
      : pathParts;

    // Remove file extension
    const publicIdWithExt = versionRemoved.join('/');
    const publicId = publicIdWithExt.replace(/\.[^.]+$/, '');

    return publicId;
  } catch (error) {
    logger.error('Error extracting public ID', { error, url });
    return null;
  }
}

/**
 * Generate thumbnail URL
 */
export function getThumbnailUrl(url: string, size: number = 150): string {
  return getOptimizedUrl(url, {
    width: size,
    height: size,
    crop: 'thumb',
    quality: 'auto',
    format: 'auto',
  });
}

/**
 * Validate Cloudinary configuration
 */
export function isCloudinaryConfigured(): boolean {
  return !!(CLOUDINARY_CONFIG.cloudName && CLOUDINARY_CONFIG.uploadPreset);
}

/**
 * Get configuration status (for debugging)
 */
export function getConfigStatus() {
  return {
    configured: isCloudinaryConfigured(),
    cloudName: CLOUDINARY_CONFIG.cloudName ? '✓' : '✗',
    uploadPreset: CLOUDINARY_CONFIG.uploadPreset ? '✓' : '✗',
    apiKey: CLOUDINARY_CONFIG.apiKey ? '✓' : '✗',
    apiSecret: CLOUDINARY_CONFIG.apiSecret ? '✓' : '✗',
  };
}
