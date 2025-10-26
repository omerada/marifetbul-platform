/**
 * ================================================
 * FAVORITES API CLIENT
 * ================================================
 * Client functions for managing user favorites (packages, jobs, profiles)
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint 4: API Standardization
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
 * @throws {AuthenticationError} Not authenticated
 * @throws {ValidationError} Invalid response format
 */
export const getFavoritePackages = async (): Promise<FavoritePackage[]> => {
  const response = await apiClient.get<FavoritePackage[]>(
    '/favorites/packages'
  );

  // Validate each package in the response
  return response.map((fav) => ({
    ...fav,
    package: {
      ...fav.package,
      // Basic validation for embedded package data
      id: String(fav.package.id),
      title: String(fav.package.title),
      slug: String(fav.package.slug),
    },
  }));
};

/**
 * Add package to favorites
 * POST /api/v1/favorites/packages/{packageId}
 * @throws {AuthenticationError} Not authenticated
 * @throws {NotFoundError} Package not found
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
 * @throws {AuthenticationError} Not authenticated
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
 * @throws {NotFoundError} Package not found
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
 * @throws {AuthenticationError} Not authenticated
 * @throws {NotFoundError} Package not found
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
