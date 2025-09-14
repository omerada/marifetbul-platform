/**
 * Media Domain - Clean Architecture
 * Handles all media-related business logic (files, images, uploads)
 */

// Domain services
export { uploadFile, uploadFiles } from './fileUpload.service';

// Domain utilities (no conflicts)
export { isImageFile } from './fileUpload';
export * from './image-fallback';
