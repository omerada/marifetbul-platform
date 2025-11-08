/**
 * Portfolio System Types
 * Sprint 17: Portfolio Management System
 */

/**
 * Portfolio response from backend
 */
export interface PortfolioResponse {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  displayOrder: number;
  viewCount: number;
  images: PortfolioImageResponse[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Portfolio image response
 */
export interface PortfolioImageResponse {
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  displayOrder: number;
  isPrimary: boolean;
  createdAt: string;
}

/**
 * Portfolio create request
 */
export interface PortfolioCreateRequest {
  title: string;
  description: string;
  category: string;
  tags: string[];
  isPublic: boolean;
}

/**
 * Portfolio update request
 */
export interface PortfolioUpdateRequest {
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  isPublic?: boolean;
}

/**
 * Portfolio image upload response
 */
export interface PortfolioImageUploadResponse {
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  cloudinaryPublicId: string;
  displayOrder: number;
  isPrimary: boolean;
}

/**
 * Portfolio categories
 */
export enum PortfolioCategory {
  WEB_DEVELOPMENT = 'WEB_DEVELOPMENT',
  MOBILE_DEVELOPMENT = 'MOBILE_DEVELOPMENT',
  GRAPHIC_DESIGN = 'GRAPHIC_DESIGN',
  UI_UX_DESIGN = 'UI_UX_DESIGN',
  CONTENT_WRITING = 'CONTENT_WRITING',
  VIDEO_EDITING = 'VIDEO_EDITING',
  PHOTOGRAPHY = 'PHOTOGRAPHY',
  DIGITAL_MARKETING = 'DIGITAL_MARKETING',
  OTHER = 'OTHER',
}

/**
 * Portfolio category labels (Turkish)
 */
export const portfolioCategoryLabels: Record<PortfolioCategory, string> = {
  [PortfolioCategory.WEB_DEVELOPMENT]: 'Web Geliştirme',
  [PortfolioCategory.MOBILE_DEVELOPMENT]: 'Mobil Uygulama',
  [PortfolioCategory.GRAPHIC_DESIGN]: 'Grafik Tasarım',
  [PortfolioCategory.UI_UX_DESIGN]: 'UI/UX Tasarım',
  [PortfolioCategory.CONTENT_WRITING]: 'İçerik Yazarlığı',
  [PortfolioCategory.VIDEO_EDITING]: 'Video Düzenleme',
  [PortfolioCategory.PHOTOGRAPHY]: 'Fotoğrafçılık',
  [PortfolioCategory.DIGITAL_MARKETING]: 'Dijital Pazarlama',
  [PortfolioCategory.OTHER]: 'Diğer',
};

/**
 * Portfolio form data (for UI forms)
 */
export interface PortfolioFormData {
  title: string;
  description: string;
  category: PortfolioCategory;
  tags: string[];
  isPublic: boolean;
  images?: File[];
}

/**
 * Portfolio filters (for listing)
 */
export interface PortfolioFilters {
  userId?: string;
  category?: PortfolioCategory;
  isPublic?: boolean;
  page?: number;
  size?: number;
  sortBy?: 'displayOrder' | 'createdAt' | 'viewCount';
  sortDir?: 'ASC' | 'DESC';
}

// Use canonical PageResponse from backend-aligned types
export type { PageResponse } from './backend-aligned';

/**
 * Helper: Check if portfolio has images
 */
export const hasImages = (portfolio: PortfolioResponse): boolean => {
  return portfolio.images && portfolio.images.length > 0;
};

/**
 * Helper: Get primary image
 */
export const getPrimaryImage = (
  portfolio: PortfolioResponse
): PortfolioImageResponse | undefined => {
  return portfolio.images.find((img) => img.isPrimary) || portfolio.images[0];
};

/**
 * Helper: Get thumbnail URL (primary or first)
 */
export const getThumbnailUrl = (portfolio: PortfolioResponse): string => {
  const primaryImage = getPrimaryImage(portfolio);
  return primaryImage?.thumbnailUrl || '/images/placeholder-portfolio.jpg';
};
