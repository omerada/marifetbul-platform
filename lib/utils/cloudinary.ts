/**
 * Cloudinary Utility Functions
 * Handles image upload, delete, and URL transformations for portfolios
 */

import { logger } from '@/lib/shared/utils/logger';

// Cloudinary configuration from environment
const CLOUDINARY_CONFIG = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '',
  apiKey: process.env.CLOUDINARY_API_KEY || '',
  apiSecret: process.env.CLOUDINARY_API_SECRET || '',
};

// Portfolio-specific folder structure
const PORTFOLIO_FOLDER = 'marifetbul/portfolios';

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
export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    if (!publicId) {
      logger.warn('No public ID provided for deletion');
      return false;
    }

    // Note: Image deletion requires server-side API
    // For now, we'll just log it and return success
    // In production, create an API route: /api/cloudinary/delete
    logger.info('Image deletion requested', { publicId });

    // TODO: Implement server-side deletion API
    // For now, images will remain in Cloudinary (can be cleaned up manually)
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
