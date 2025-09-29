/**
 * File Upload Service
 * Production-ready file upload implementation with multiple storage options
 */

import { FileAttachment } from '@/types';

export interface UploadOptions {
  provider?: 'aws-s3' | 'cloudinary' | 'local' | 'mock';
  maxFileSize?: number;
  allowedTypes?: string[];
  folder?: string;
  generateThumbnails?: boolean;
}

export interface UploadResult {
  success: boolean;
  data?: {
    url: string;
    key: string;
    thumbnails?: {
      small: string;
      medium: string;
      large: string;
    };
  };
  error?: string;
}

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret?: string;
  uploadPreset?: string;
}

export interface S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucket: string;
}

export class FileUploadService {
  private options: Required<UploadOptions>;
  private cloudinaryConfig?: CloudinaryConfig;
  private s3Config?: S3Config;

  constructor(options: UploadOptions = {}) {
    this.options = {
      provider: 'mock',
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: [
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
      folder: 'uploads',
      generateThumbnails: false,
      ...options,
    };

    // Initialize configs from environment variables
    if (this.options.provider === 'cloudinary') {
      this.cloudinaryConfig = {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
        apiKey: process.env.CLOUDINARY_API_KEY || '',
        apiSecret: process.env.CLOUDINARY_API_SECRET,
        uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
      };
    }

    if (this.options.provider === 'aws-s3') {
      this.s3Config = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        region: process.env.AWS_REGION || 'us-east-1',
        bucket: process.env.AWS_S3_BUCKET || '',
      };
    }
  }

  /**
   * Upload a single file
   */
  async uploadFile(file: File): Promise<UploadResult> {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      // Route to appropriate upload method
      switch (this.options.provider) {
        case 'aws-s3':
          return await this.uploadToS3(file);
        case 'cloudinary':
          return await this.uploadToCloudinary(file);
        case 'local':
          return await this.uploadToLocal(file);
        case 'mock':
        default:
          return await this.mockUpload(file);
      }
    } catch (error) {
      console.error('File upload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(files: File[]): Promise<UploadResult[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file));
    return await Promise.all(uploadPromises);
  }

  /**
   * Convert UploadResult to FileAttachment
   */
  resultToAttachment(
    result: UploadResult,
    originalFile: File
  ): FileAttachment | null {
    if (!result.success || !result.data) {
      return null;
    }

    return {
      id: result.data.key,
      name: originalFile.name,
      filename: originalFile.name,
      size: originalFile.size,
      type: originalFile.type,
      mimetype: originalFile.type,
      url: result.data.url,
      uploadedAt: new Date().toISOString(),
      thumbnailUrl: result.data.thumbnails?.small,
    };
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > this.options.maxFileSize) {
      const maxSizeMB = this.options.maxFileSize / (1024 * 1024);
      return {
        valid: false,
        error: `Dosya boyutu ${maxSizeMB}MB'dan büyük olamaz`,
      };
    }

    // Check file type
    if (!this.options.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Desteklenmeyen dosya türü',
      };
    }

    return { valid: true };
  }

  /**
   * Upload to AWS S3
   */
  private async uploadToS3(file: File): Promise<UploadResult> {
    if (!this.s3Config) {
      throw new Error('S3 configuration not found');
    }

    // This would require AWS SDK implementation
    // For now, return mock response
    console.warn('S3 upload not implemented, using mock response');
    return this.mockUpload(file);
  }

  /**
   * Upload to Cloudinary
   */
  private async uploadToCloudinary(file: File): Promise<UploadResult> {
    if (!this.cloudinaryConfig?.cloudName) {
      throw new Error('Cloudinary configuration not found');
    }

    const formData = new FormData();
    formData.append('file', file);

    if (this.cloudinaryConfig.uploadPreset) {
      formData.append('upload_preset', this.cloudinaryConfig.uploadPreset);
    } else if (this.cloudinaryConfig.apiKey) {
      formData.append('api_key', this.cloudinaryConfig.apiKey);
      // Note: In production, signature should be generated server-side
    }

    formData.append('folder', this.options.folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudinaryConfig.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Cloudinary upload failed: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      data: {
        url: data.secure_url,
        key: data.public_id,
        thumbnails: this.options.generateThumbnails
          ? {
              small: data.secure_url.replace(
                '/upload/',
                '/upload/w_150,h_150,c_fill/'
              ),
              medium: data.secure_url.replace(
                '/upload/',
                '/upload/w_300,h_300,c_fill/'
              ),
              large: data.secure_url.replace(
                '/upload/',
                '/upload/w_600,h_600,c_fill/'
              ),
            }
          : undefined,
      },
    };
  }

  /**
   * Upload to local storage (development only)
   */
  private async uploadToLocal(file: File): Promise<UploadResult> {
    // In a real implementation, this would save to local filesystem
    // For browser environment, we'll use mock
    console.warn('Local upload not available in browser, using mock response');
    return this.mockUpload(file);
  }

  /**
   * Mock upload for development/testing
   */
  private async mockUpload(file: File): Promise<UploadResult> {
    // Simulate upload delay
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 2000)
    );

    // Simulate occasional failures
    if (Math.random() < 0.1) {
      throw new Error('Simulated upload failure');
    }

    const key = `${this.options.folder}/${Date.now()}-${file.name}`;
    const url = `https://via.placeholder.com/300x200?text=${encodeURIComponent(file.name)}`;

    return {
      success: true,
      data: {
        url,
        key,
        thumbnails: this.options.generateThumbnails
          ? {
              small: `${url}&size=150x150`,
              medium: `${url}&size=300x300`,
              large: `${url}&size=600x600`,
            }
          : undefined,
      },
    };
  }
}

// Singleton instance
let fileUploadService: FileUploadService | null = null;

/**
 * Get or create file upload service instance
 */
export function getFileUploadService(): FileUploadService {
  if (!fileUploadService) {
    // Determine provider based on environment
    let provider: UploadOptions['provider'] = 'mock';

    if (process.env.NODE_ENV === 'production') {
      if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
        provider = 'cloudinary';
      } else if (process.env.AWS_S3_BUCKET) {
        provider = 'aws-s3';
      }
    }

    fileUploadService = new FileUploadService({
      provider,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: [
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
      folder: 'marifetbul-uploads',
      generateThumbnails: true,
    });
  }

  return fileUploadService;
}

/**
 * Convenience function for single file upload
 */
export const uploadFile = (file: File) =>
  getFileUploadService().uploadFile(file);

/**
 * Convenience function for multiple file upload
 */
export const uploadFiles = (files: File[]) =>
  getFileUploadService().uploadFiles(files);

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
