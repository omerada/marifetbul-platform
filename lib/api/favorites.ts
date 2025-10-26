/**
 * ================================================
 * FAVORITES API CLIENT
 * ================================================
 * Client functions for managing user favorites (packages, jobs, profiles)
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { apiClient } from '../infrastructure/api/client';

// ================================================
// TYPE DEFINITIONS
// ================================================

export interface FavoritePackage {
  id: string;
  packageId: string;
  userId: string;
  createdAt: string;
  package: {
    id: string;
    title: string;
    slug: string;
    coverImage: string;
    basicPrice: number;
    sellerName: string;
    rating: number;
  };
}

export interface FavoriteResponse {
  isFavorited: boolean;
  favoriteCount: number;
}

// ================================================
// PACKAGE FAVORITES ENDPOINTS
// ================================================

/**
 * Get user's favorite packages
 * GET /api/v1/favorites/packages
 */
export const getFavoritePackages = async (): Promise<FavoritePackage[]> => {
  return await apiClient.get<FavoritePackage[]>('/favorites/packages');
};

/**
 * Add package to favorites
 * POST /api/v1/favorites/packages/{packageId}
 */
export const addPackageToFavorites = async (
  packageId: string
): Promise<FavoriteResponse> => {
  return await apiClient.post<FavoriteResponse>(
    `/favorites/packages/${packageId}`
  );
};

/**
 * Remove package from favorites
 * DELETE /api/v1/favorites/packages/{packageId}
 */
export const removePackageFromFavorites = async (
  packageId: string
): Promise<FavoriteResponse> => {
  return await apiClient.delete<FavoriteResponse>(
    `/favorites/packages/${packageId}`
  );
};

/**
 * Check if package is favorited
 * GET /api/v1/favorites/packages/{packageId}/check
 */
export const checkPackageFavorite = async (
  packageId: string
): Promise<FavoriteResponse> => {
  return await apiClient.get<FavoriteResponse>(
    `/favorites/packages/${packageId}/check`
  );
};

/**
 * Toggle package favorite status
 * POST /api/v1/favorites/packages/{packageId}/toggle
 */
export const togglePackageFavorite = async (
  packageId: string
): Promise<FavoriteResponse> => {
  return await apiClient.post<FavoriteResponse>(
    `/favorites/packages/${packageId}/toggle`
  );
};

// ================================================
// FAVORITES API OBJECT
// ================================================

export const favoritesApi = {
  // Package Favorites
  getFavoritePackages,
  addPackageToFavorites,
  removePackageFromFavorites,
  checkPackageFavorite,
  togglePackageFavorite,
};

export default favoritesApi;
