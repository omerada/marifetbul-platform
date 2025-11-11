import type { ServicePackage, PaginatedResponse } from '@/types';
import type { ApiResponse } from '@/types/shared/api';
import { apiClient } from '@/lib/infrastructure/api/client';
import logger from '@/lib/infrastructure/monitoring/logger';

export interface PackageSearchParams {
  keyword?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  deliveryTime?: number;
  rating?: number;
  featured?: boolean;
  verified?: boolean;
  sort?: 'newest' | 'popular' | 'rating' | 'price_low' | 'price_high';
  page?: number;
  limit?: number;
}

export interface PackageStats {
  totalPackages: number;
  activePackages: number;
  averageRating: number;
  totalRevenue: number;
}

export class PackageService {
  /**
   * Search packages with various filters
   */
  static async searchPackages(
    params: PackageSearchParams = {}
  ): Promise<PaginatedResponse<ServicePackage>> {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<ServicePackage>>
    >(`/packages?${queryParams.toString()}`);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch packages');
    }

    return response.data;
  }

  /**
   * Get a package by ID
   */
  static async getPackageById(id: string): Promise<ServicePackage | null> {
    try {
      const response = await apiClient.get<ApiResponse<ServicePackage>>(
        `/packages/${id}`
      );

      if (!response.success || !response.data) {
        return null;
      }

      return response.data;
    } catch (error) {
      logger.error(
        'Failed to fetch package',
        error
      );
      return null;
    }
  }

  /**
   * Get a package by slug
   */
  static async getPackageBySlug(slug: string): Promise<ServicePackage | null> {
    try {
      const response = await apiClient.get<ApiResponse<ServicePackage>>(
        `/packages/slug/${slug}`
      );

      if (!response.success || !response.data) {
        return null;
      }

      return response.data;
    } catch (error) {
      logger.error(
        'Failed to fetch package by slug',
        error
      );
      return null;
    }
  }

  /**
   * Get packages by category
   */
  static async getPackagesByCategory(
    categoryId: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<ServicePackage>> {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<ServicePackage>>
    >(`/packages/category/${categoryId}?page=${page}&limit=${limit}`);

    if (!response.success || !response.data) {
      throw new Error(
        response.message || 'Failed to fetch packages by category'
      );
    }

    return response.data;
  }

  /**
   * Get featured packages
   */
  static async getFeaturedPackages(
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<ServicePackage>> {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<ServicePackage>>
    >(`/packages/featured?page=${page}&limit=${limit}`);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch featured packages');
    }

    return response.data;
  }

  /**
   * Get verified packages
   */
  static async getVerifiedPackages(
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<ServicePackage>> {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<ServicePackage>>
    >(`/packages/verified?page=${page}&limit=${limit}`);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch verified packages');
    }

    return response.data;
  }

  /**
   * Get most popular packages
   */
  static async getPopularPackages(
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<ServicePackage>> {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<ServicePackage>>
    >(`/packages/popular?page=${page}&limit=${limit}`);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch popular packages');
    }

    return response.data;
  }

  /**
   * Get top rated packages
   */
  static async getTopRatedPackages(
    minReviews = 5,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<ServicePackage>> {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<ServicePackage>>
    >(
      `/packages/top-rated?minReviews=${minReviews}&page=${page}&limit=${limit}`
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch top rated packages');
    }

    return response.data;
  }

  /**
   * Get trending packages
   */
  static async getTrendingPackages(
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<ServicePackage>> {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<ServicePackage>>
    >(`/packages/trending?page=${page}&limit=${limit}`);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch trending packages');
    }

    return response.data;
  }

  /**
   * Get newest packages
   */
  static async getNewestPackages(
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<ServicePackage>> {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<ServicePackage>>
    >(`/packages/newest?page=${page}&limit=${limit}`);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch newest packages');
    }

    return response.data;
  }

  /**
   * Create a new package (seller endpoint)
   */
  static async createPackage(
    packageData: Partial<ServicePackage>
  ): Promise<ServicePackage> {
    const response = await apiClient.post<ApiResponse<ServicePackage>>(
      '/seller/packages',
      packageData
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create package');
    }

    return response.data;
  }

  /**
   * Update an existing package (seller endpoint)
   */
  static async updatePackage(
    id: string,
    updates: Partial<ServicePackage>
  ): Promise<ServicePackage | null> {
    try {
      const response = await apiClient.put<ApiResponse<ServicePackage>>(
        `/seller/packages/${id}`,
        updates
      );

      if (!response.success || !response.data) {
        return null;
      }

      return response.data;
    } catch (error) {
      logger.error(
        'Failed to update package',
        error
      );
      return null;
    }
  }

  /**
   * Delete a package (seller endpoint)
   */
  static async deletePackage(id: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(
        `/seller/packages/${id}`
      );
      return response.success;
    } catch (error) {
      logger.error(
        'Failed to delete package',
        error
      );
      return false;
    }
  }

  /**
   * Get user's packages (seller endpoint)
   */
  static async getUserPackages(
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<ServicePackage>> {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<ServicePackage>>
    >(`/seller/packages/my?page=${page}&limit=${limit}`);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch user packages');
    }

    return response.data;
  }

  /**
   * Get platform package statistics
   */
  static async getPlatformStats(): Promise<PackageStats> {
    const response =
      await apiClient.get<ApiResponse<PackageStats>>('/packages/stats');

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch platform stats');
    }

    return response.data;
  }

  /**
   * Activate a package (seller endpoint)
   */
  static async activatePackage(id: string): Promise<ServicePackage> {
    const response = await apiClient.post<ApiResponse<ServicePackage>>(
      `/seller/packages/${id}/activate`,
      {}
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to activate package');
    }

    return response.data;
  }

  /**
   * Pause a package (seller endpoint)
   */
  static async pausePackage(id: string): Promise<ServicePackage> {
    const response = await apiClient.post<ApiResponse<ServicePackage>>(
      `/seller/packages/${id}/pause`,
      {}
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to pause package');
    }

    return response.data;
  }
}
