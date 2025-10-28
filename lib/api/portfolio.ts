/**
 * ================================================
 * PORTFOLIO API CLIENT
 * ================================================
 * Sprint 1 - Story 1.1: Portfolio API Client Setup
 *
 * Handles all portfolio-related API operations with:
 * - Modern API client integration
 * - Proper error handling
 * - TypeScript type safety
 * - Image upload via Cloudinary
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Refactored with apiClient
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import { PortfolioItem } from '@/types';
import { logger } from '@/lib/shared/utils/logger';
import { getBackendApiUrl } from '../config/api';

// ================================================
// TYPE DEFINITIONS
// ================================================

export interface CreatePortfolioRequest {
  title: string;
  description: string;
  url?: string;
  completedAt: string; // ISO date string
  category?: string;
  client?: string;
  skills?: string[];
  isPublic?: boolean;
}

export interface UpdatePortfolioRequest {
  title?: string;
  description?: string;
  url?: string;
  completedAt?: string;
  category?: string;
  client?: string;
  skills?: string[];
  isPublic?: boolean;
}

export interface PortfolioImageResponse {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  displayOrder: number;
  isPrimary: boolean;
  createdAt: string;
}

export interface PortfolioResponse {
  id: string;
  userId: string;
  title: string;
  description: string;
  url?: string;
  completedAt: string;
  category?: string;
  client?: string;
  skills?: string[];
  images: PortfolioImageResponse[];
  displayOrder: number;
  isPublic: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

// ================================================
// API FUNCTIONS
// ================================================

/**
 * Create a new portfolio item
 * @throws {ApiError} If creation fails
 */
export async function createPortfolio(
  data: CreatePortfolioRequest
): Promise<PortfolioResponse> {
  try {
    logger.info('Creating portfolio item', { title: data.title });

    const response = await apiClient.post<PortfolioResponse>(
      '/api/v1/portfolios',
      data
    );

    logger.info('Portfolio item created successfully', { id: response.id });
    return response;
  } catch (error) {
    logger.error('Failed to create portfolio', error);
    throw error;
  }
}

/**
 * Update an existing portfolio item
 * @throws {ApiError} If update fails
 */
export async function updatePortfolio(
  portfolioId: string,
  data: UpdatePortfolioRequest
): Promise<PortfolioResponse> {
  try {
    logger.info('Updating portfolio item', { portfolioId, data });

    const response = await apiClient.put<PortfolioResponse>(
      `/api/v1/portfolios/${portfolioId}`,
      data
    );

    logger.info('Portfolio item updated successfully', { id: portfolioId });
    return response;
  } catch (error) {
    logger.error('Failed to update portfolio', error);
    throw error;
  }
}

/**
 * Delete a portfolio item
 * @throws {ApiError} If deletion fails
 */
export async function deletePortfolio(portfolioId: string): Promise<void> {
  try {
    logger.info('Deleting portfolio item', { portfolioId });

    await apiClient.delete(`/api/v1/portfolios/${portfolioId}`);

    logger.info('Portfolio item deleted successfully', { id: portfolioId });
  } catch (error) {
    logger.error('Failed to delete portfolio', error);
    throw error;
  }
}

/**
 * Get portfolio item by ID
 * @throws {ApiError} If fetch fails
 */
export async function getPortfolio(
  portfolioId: string
): Promise<PortfolioResponse> {
  try {
    logger.debug('Fetching portfolio item', { portfolioId });

    const response = await apiClient.get<PortfolioResponse>(
      `/api/v1/portfolios/${portfolioId}`
    );

    return response;
  } catch (error) {
    logger.error('Failed to fetch portfolio', error);
    throw error;
  }
}

/**
 * Get user's portfolio items (paginated)
 * @throws {ApiError} If fetch fails
 */
export async function getUserPortfolio(
  userId: string,
  page: number = 0,
  size: number = 20
): Promise<{ content: PortfolioResponse[]; totalElements: number }> {
  try {
    logger.debug('Fetching user portfolio', { userId, page, size });

    const response = await apiClient.get<{
      content: PortfolioResponse[];
      totalElements: number;
    }>(`/api/v1/portfolios/user/${userId}`, {
      page: String(page),
      size: String(size),
    });

    logger.debug('User portfolio fetched', {
      userId,
      count: response.content.length,
      total: response.totalElements,
    });

    return response;
  } catch (error) {
    logger.error('Failed to fetch user portfolio', error);
    throw error;
  }
}

/**
 * Get my portfolio items (authenticated user)
 * @throws {ApiError} If fetch fails or user not authenticated
 */
export async function getMyPortfolio(): Promise<PortfolioResponse[]> {
  try {
    logger.debug('Fetching my portfolio');

    const response = await apiClient.get<PortfolioResponse[]>(
      '/api/v1/portfolios/my-portfolio'
    );

    logger.debug('My portfolio fetched', { count: response.length });
    return response;
  } catch (error) {
    logger.error('Failed to fetch my portfolio', error);
    throw error;
  }
}

/**
 * Reorder portfolio items
 * @throws {ApiError} If reordering fails
 */
export async function reorderPortfolio(portfolioIds: string[]): Promise<void> {
  try {
    logger.info('Reordering portfolio items', { count: portfolioIds.length });

    await apiClient.put('/api/v1/portfolios/reorder', portfolioIds);

    logger.info('Portfolio items reordered successfully');
  } catch (error) {
    logger.error('Failed to reorder portfolio', error);
    throw error;
  }
}

// ================================================
// IMAGE UPLOAD FUNCTIONS
// ================================================

/**
 * Upload image to portfolio
 * Note: Uses FormData for multipart upload (special handling required)
 * @throws {ApiError} If upload fails
 */
export async function uploadPortfolioImage(
  portfolioId: string,
  file: File,
  isPrimary: boolean = false
): Promise<PortfolioImageResponse> {
  try {
    logger.info('Uploading portfolio image', {
      portfolioId,
      fileName: file.name,
      isPrimary,
    });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('isPrimary', isPrimary.toString());

    // Note: For multipart/form-data, we need to use fetch directly
    // as apiClient doesn't support FormData yet
    const backendUrl = getBackendApiUrl();
    const response = await fetch(
      `${backendUrl}/portfolios/${portfolioId}/images`,
      {
        method: 'POST',
        credentials: 'include',
        body: formData,
        // Don't set Content-Type header - browser will set it with boundary
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error('Portfolio image upload failed', {
        status: response.status,
        error: errorData,
      });
      throw new Error(errorData.message || 'Failed to upload image');
    }

    const result = await response.json();
    const imageData = result.data;

    logger.info('Portfolio image uploaded successfully', {
      imageId: imageData.id,
    });
    return imageData;
  } catch (error) {
    logger.error('Failed to upload portfolio image', error);
    throw error;
  }
}

/**
 * Delete portfolio image
 * @throws {ApiError} If deletion fails
 */
export async function deletePortfolioImage(
  portfolioId: string,
  imageId: string
): Promise<void> {
  try {
    logger.info('Deleting portfolio image', { portfolioId, imageId });

    await apiClient.delete(
      `/api/v1/portfolios/${portfolioId}/images/${imageId}`
    );

    logger.info('Portfolio image deleted successfully', { imageId });
  } catch (error) {
    logger.error('Failed to delete portfolio image', error);
    throw error;
  }
}

// ================================================
// UTILITY FUNCTIONS
// ================================================

/**
 * Convert PortfolioResponse to PortfolioItem type
 * Ensures compatibility with existing components
 */
export function convertToPortfolioItem(
  response: PortfolioResponse
): PortfolioItem {
  return {
    id: response.id,
    title: response.title,
    description: response.description,
    images: response.images.map((img) => img.imageUrl),
    url: response.url,
    skills: response.skills || [],
    completedAt: response.completedAt,
    viewCount: response.viewCount, // Analytics: view count tracking
    imageUrl: response.images[0]?.imageUrl,
    image: response.images[0]?.imageUrl,
    tags: response.skills,
    category: response.category,
    client: response.client,
    createdAt: response.createdAt,
    techStack: response.skills,
    isPrivate: !response.isPublic,
    isArchived: false,
  };
}
