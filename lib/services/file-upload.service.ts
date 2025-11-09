/**
 * ================================================
 * FILE UPLOAD SERVICE (CANONICAL)
 * ================================================
 * Production-ready file upload service with progress tracking
 * Supports multiple storage backends (S3, Cloudinary, local)
 *
 * This is the CANONICAL file upload service for MarifetBul.
 * Other file upload utilities are deprecated and will be removed in Sprint 3.
 *
 * @example
 * import { fileUploadService } from '@/lib/services/file-upload.service';
 *
 * const result = await fileUploadService.uploadFile(file, {
 *   onProgress: (progress) => console.log(progress.progress),
 *   backend: 'cloudinary',
 *   folder: 'orders'
 * });
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint 2: Canonical Service
 * @see Documentation: Story 6 - File Upload/Download
 */

import { validateFileUpload } from '@/lib/domains/order/error-handling';

// ================================================
// TYPES
// ================================================

export interface UploadProgress {
  /** Upload percentage (0-100) */
  progress: number;
  /** Uploaded bytes */
  loaded: number;
  /** Total bytes */
  total: number;
  /** Upload speed (bytes/sec) */
  speed: number;
  /** Estimated time remaining (seconds) */
  timeRemaining: number;
}

export interface UploadResult {
  /** File ID */
  id: string;
  /** File name */
  fileName: string;
  /** File URL */
  fileUrl: string;
  /** File size */
  fileSize: number;
  /** File type */
  fileType: string;
  /** Upload timestamp */
  uploadedAt: string;
}

export interface UploadOptions {
  /** Progress callback */
  onProgress?: (progress: UploadProgress) => void;
  /** Storage backend */
  backend?: 'api' | 's3' | 'cloudinary';
  /** Folder path */
  folder?: string;
  /** Additional metadata */
  metadata?: Record<string, string>;
  /** Custom endpoint URL (overrides default) */
  endpoint?: string;
  /** Include authentication token */
  authenticated?: boolean;
}

// ================================================
// FILE UPLOAD SERVICE
// ================================================

class FileUploadService {
  private apiBaseUrl = '/api/files';

  /**
   * Get authentication token from localStorage
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  /**
   * Upload a single file
   */
  async uploadFile(
    file: File,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    // Validate file
    const validation = validateFileUpload(file);
    if (!validation.valid) {
      throw new Error(validation.message || 'Invalid file');
    }

    const {
      onProgress,
      backend = 'api',
      folder = 'orders',
      metadata = {},
      endpoint,
      authenticated = true,
    } = options;

    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    formData.append('backend', backend);

    // Add metadata
    Object.entries(metadata).forEach(([key, value]) => {
      formData.append(`metadata.${key}`, value);
    });

    // Track upload progress
    const startTime = Date.now();
    let lastLoaded = 0;
    let lastTime = startTime;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Progress tracking
      xhr.upload.addEventListener('progress', (e) => {
        if (!e.lengthComputable) return;

        const now = Date.now();
        const timeDiff = (now - lastTime) / 1000; // seconds
        const loadedDiff = e.loaded - lastLoaded;
        const speed = timeDiff > 0 ? loadedDiff / timeDiff : 0;
        const timeRemaining = speed > 0 ? (e.total - e.loaded) / speed : 0;

        lastLoaded = e.loaded;
        lastTime = now;

        onProgress?.({
          progress: Math.round((e.loaded / e.total) * 100),
          loaded: e.loaded,
          total: e.total,
          speed,
          timeRemaining,
        });
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve({
              id: response.id || `file-${Date.now()}`,
              fileName: response.fileName || file.name,
              fileUrl: response.fileUrl || response.url,
              fileSize: response.fileSize || file.size,
              fileType: response.fileType || file.type,
              uploadedAt: response.uploadedAt || new Date().toISOString(),
            });
          } catch (_error) {
            reject(new Error('Invalid server response'));
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'));
      });

      // Send request
      const uploadUrl = endpoint || this.apiBaseUrl;
      xhr.open('POST', uploadUrl);

      // Add authentication header if required
      if (authenticated) {
        const token = this.getAuthToken();
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
      }

      xhr.send(formData);
    });
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: File[],
    options: UploadOptions = {}
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    const totalFiles = files.length;
    let completedFiles = 0;

    for (const file of files) {
      try {
        const result = await this.uploadFile(file, {
          ...options,
          onProgress: (progress) => {
            // Calculate overall progress
            const fileProgress = progress.progress / 100;
            const overallProgress =
              ((completedFiles + fileProgress) / totalFiles) * 100;

            options.onProgress?.({
              ...progress,
              progress: Math.round(overallProgress),
            });
          },
        });

        results.push(result);
        completedFiles++;
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        // Continue with other files
      }
    }

    return results;
  }

  /**
   * Download a file
   */
  async downloadFile(fileUrl: string, fileName: string): Promise<void> {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (_error) {
      throw new Error('Failed to download file');
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(fileId: string): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/${fileId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete file');
    }
  }

  /**
   * Get file preview URL
   */
  getPreviewUrl(file: File | UploadResult): string | null {
    if (file instanceof File) {
      // Create object URL for local preview
      const type = file.type;
      if (type.startsWith('image/')) {
        return URL.createObjectURL(file);
      }
      return null;
    }

    // For uploaded files
    const type = file.fileType;
    if (type.startsWith('image/')) {
      return file.fileUrl;
    }

    return null;
  }

  /**
   * Format file size
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
  }

  /**
   * Get file icon based on type
   */
  getFileIcon(fileType: string): string {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.startsWith('audio/')) return '🎵';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet'))
      return '📊';
    if (fileType.includes('powerpoint') || fileType.includes('presentation'))
      return '📽️';
    if (fileType.includes('zip') || fileType.includes('rar')) return '📦';
    if (fileType.includes('text')) return '📃';
    return '📎';
  }
}

// ================================================
// SINGLETON INSTANCE
// ================================================

export const fileUploadService = new FileUploadService();
