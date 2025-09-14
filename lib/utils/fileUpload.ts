export interface FileUploadOptions {
  maxSize?: number; // bytes
  allowedTypes?: string[];
  maxFiles?: number;
  compression?: boolean;
  quality?: number; // 0-1 for image compression
  multiple?: boolean;
}

// Type alias for compatibility
export type FileUploadConfig = FileUploadOptions;

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FileUploadResult {
  success: boolean;
  file?: File;
  url?: string;
  error?: string;
}

// Extended file upload result for multiple files
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: string;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export const DEFAULT_UPLOAD_OPTIONS: FileUploadOptions = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'text/plain',
  ],
  maxFiles: 5,
  compression: true,
  quality: 0.8,
};

export const ALLOWED_FILE_TYPES = DEFAULT_UPLOAD_OPTIONS.allowedTypes!;

export function validateFile(
  file: File,
  options: FileUploadOptions = DEFAULT_UPLOAD_OPTIONS
): FileValidationResult {
  const errors: string[] = [];

  // Check file size
  if (options.maxSize && file.size > options.maxSize) {
    errors.push(
      `Dosya boyutu ${formatFileSize(options.maxSize)} limitini aşıyor`
    );
  }

  // Check file type
  if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
    errors.push(`Desteklenmeyen dosya türü: ${file.type}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateFiles(
  files: FileList | File[],
  options: FileUploadOptions = DEFAULT_UPLOAD_OPTIONS
): FileValidationResult {
  const errors: string[] = [];
  const fileArray = Array.from(files);

  // Check number of files
  if (options.maxFiles && fileArray.length > options.maxFiles) {
    errors.push(`En fazla ${options.maxFiles} dosya yükleyebilirsiniz`);
  }

  // Validate each file
  fileArray.forEach((file, index) => {
    const validation = validateFile(file, options);
    if (!validation.isValid) {
      errors.push(`Dosya ${index + 1}: ${validation.errors.join(', ')}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

export function getMimeTypeFromExtension(extension: string): string {
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    pdf: 'application/pdf',
    txt: 'text/plain',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };

  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
}

export async function compressImage(
  file: File,
  quality: number = 0.8,
  maxWidth: number = 1920,
  maxHeight: number = 1080
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Sıkıştırma işlemi başarısız'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => reject(new Error('Resim yüklenemedi'));
    img.src = URL.createObjectURL(file);
  });
}

export async function getImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    img.onerror = () => reject(new Error('Resim boyutları alınamadı'));
    img.src = URL.createObjectURL(file);
  });
}

export function createFilePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };

    reader.onerror = () => reject(new Error('Dosya önizlemesi oluşturulamadı'));
    reader.readAsDataURL(file);
  });
}

export async function uploadFile(
  file: File,
  endpoint: string,
  options: FileUploadOptions = DEFAULT_UPLOAD_OPTIONS
): Promise<FileUploadResult> {
  // Validate file first
  const validation = validateFile(file, options);
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.errors.join(', '),
    };
  }

  // Compress if it's an image and compression is enabled
  let fileToUpload = file;
  if (options.compression && file.type.startsWith('image/')) {
    try {
      fileToUpload = await compressImage(file, options.quality);
    } catch (error) {
      console.warn('Image compression failed, uploading original:', error);
    }
  }

  // Create form data
  const formData = new FormData();
  formData.append('file', fileToUpload);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      file: fileToUpload,
      url: data.url,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

// Additional utility functions for FileUpload component
export async function uploadFiles(
  files: File[],
  endpoint: string = '/api/upload',
  options: FileUploadOptions = DEFAULT_UPLOAD_OPTIONS
): Promise<FileUploadResult[]> {
  const results: FileUploadResult[] = [];

  for (const file of files) {
    const result = await uploadFile(file, endpoint, options);
    results.push(result);
  }

  return results;
}

export function getFileIcon(fileType: string): string {
  if (fileType.startsWith('image/')) return '🖼️';
  if (fileType.startsWith('video/')) return '🎥';
  if (fileType.startsWith('audio/')) return '🎵';
  if (fileType === 'application/pdf') return '📄';
  if (fileType.includes('word')) return '📝';
  if (fileType.includes('excel') || fileType.includes('spreadsheet'))
    return '📊';
  if (fileType.includes('presentation')) return '📈';
  if (fileType.startsWith('text/')) return '📋';

  return '📁';
}

export function isImageFile(fileType: string): boolean {
  return fileType.startsWith('image/');
}

export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

export function cleanupPreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}
