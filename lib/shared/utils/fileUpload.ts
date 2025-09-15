// File upload utilities
export interface FileUploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  multiple?: boolean;
  maxFiles?: number;
}

export interface UploadResult {
  success: boolean;
  file?: File;
  url?: string;
  error?: string;
}

// Alias for backward compatibility
export type FileUploadResult = UploadResult;

// Constants
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const validateFile = (
  file: File,
  options: FileUploadOptions = {}
): { valid: boolean; error?: string } => {
  const {
    maxSize = 5 * 1024 * 1024,
    allowedTypes = ['image/*', 'application/pdf'],
  } = options;

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit`,
    };
  }

  const isAllowedType = allowedTypes.some((type) => {
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.slice(0, -1));
    }
    return file.type === type;
  });

  if (!isAllowedType) {
    return { valid: false, error: `File type ${file.type} is not allowed` };
  }

  return { valid: true };
};

// Backward compatibility
export const validateFiles = (
  files: File[],
  options: FileUploadOptions = {}
) => {
  return files.map((file) => validateFile(file, options));
};

// Validation result for multiple files
export const validateFilesWithResult = (
  files: File[],
  options: FileUploadOptions = {}
) => {
  const validations = files.map((file) => validateFile(file, options));
  const errors = validations.filter((v) => !v.valid).map((v) => v.error!);

  return {
    isValid: validations.every((v) => v.valid),
    errors,
    validations,
  };
};

export const uploadFile = async (
  file: File,
  options: FileUploadOptions = {}
): Promise<UploadResult> => {
  const validation = validateFile(file, options);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    // Mock upload for development
    const formData = new FormData();
    formData.append('file', file);

    // For now, return mock success
    return {
      success: true,
      file,
      url: URL.createObjectURL(file), // Temporary blob URL
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
};

// Backward compatibility
export const uploadFiles = async (
  files: File[],
  options: FileUploadOptions = {}
) => {
  return Promise.all(files.map((file) => uploadFile(file, options)));
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

export const isImageFileType = (fileType: string): boolean => {
  return fileType.startsWith('image/');
};

export const createPreviewUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

export const cleanupPreviewUrl = (url: string): void => {
  URL.revokeObjectURL(url);
};

export const getFileIcon = (fileType: string): string => {
  if (fileType.startsWith('image/')) return '🖼️';
  if (fileType === 'application/pdf') return '📄';
  if (fileType.startsWith('video/')) return '🎥';
  if (fileType.startsWith('audio/')) return '🎵';
  return '📁';
};
