/**
 * Common file upload validation schemas
 * Centralized file validation to prevent duplication
 */

import { z } from 'zod';

// Common file validation constants
export const FILE_VALIDATION = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'text/plain',
  ] as const,
  IMAGE_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ] as const,
} as const;

// Base file validation schema for File objects
export const fileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= FILE_VALIDATION.MAX_SIZE, {
    message: `Dosya boyutu ${FILE_VALIDATION.MAX_SIZE / (1024 * 1024)}MB'dan büyük olamaz`,
  })
  .refine(
    (file) =>
      (FILE_VALIDATION.ALLOWED_TYPES as readonly string[]).includes(file.type),
    {
      message: 'Desteklenmeyen dosya türü',
    }
  );

// Schema for uploaded file info (URL based)
export const uploadedFileSchema = z.object({
  name: z.string().min(1, 'Dosya adı gereklidir'),
  type: z.string().min(1, 'Dosya tipi gereklidir'),
  size: z.number().max(FILE_VALIDATION.MAX_SIZE, 'Dosya boyutu çok büyük'),
  url: z.string().url('Geçerli bir URL olmalıdır'),
});

// Multiple files schema
export const multipleFilesSchema = z
  .array(fileSchema)
  .max(5, 'En fazla 5 dosya yükleyebilirsiniz');

// File upload form schemas for different contexts
export const fileUploadFormSchema = z.object({
  file: fileSchema,
});

export const supportFileUploadSchema = z.object({
  files: multipleFilesSchema,
  description: z.string().optional(),
});

export const attachmentUploadSchema = z.object({
  attachments: z.array(uploadedFileSchema).optional(),
});

// Type exports
export type FileUploadForm = z.infer<typeof fileUploadFormSchema>;
export type SupportFileUpload = z.infer<typeof supportFileUploadSchema>;
export type AttachmentUpload = z.infer<typeof attachmentUploadSchema>;
export type UploadedFile = z.infer<typeof uploadedFileSchema>;

// Validation helper functions
export const validateFile = (file: File) => {
  return fileSchema.safeParse(file);
};

export const validateMultipleFiles = (files: File[]) => {
  return multipleFilesSchema.safeParse(files);
};

export const validateUploadedFile = (data: unknown) => {
  return uploadedFileSchema.safeParse(data);
};
