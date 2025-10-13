/**
 * ================================================
 * PACKAGE SERVICE (GIG SERVICES)
 * ================================================
 * Handles all package/gig-related API calls
 *
 * @author MarifetBul Development Team
 * @version 2.0.0
 */

import { apiClient, type ApiResponse, type PageMetadata } from '../client';
import { PACKAGE_ENDPOINTS } from '../endpoints';

// ================================================
// TYPES
// ================================================

export interface Package {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  images: string[];
  price: number;
  deliveryTime: number; // days
  revisions: number;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'DELETED';
  rating: number;
  reviewCount: number;
  orderCount: number;
  tags: string[];
  features: string[];
  requirements?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PackageSearchParams {
  query?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  deliveryTime?: number;
  rating?: number;
  page?: number;
  size?: number;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'recent';
  [key: string]: string | number | boolean | undefined;
}

export interface PackageListResponse {
  packages: Package[];
  page: PageMetadata;
}

export interface CreatePackageRequest {
  title: string;
  description: string;
  categoryId: string;
  price: number;
  deliveryTime: number;
  revisions: number;
  images: string[];
  tags?: string[];
  features: string[];
  requirements?: string[];
}

export interface UpdatePackageRequest extends Partial<CreatePackageRequest> {
  status?: 'DRAFT' | 'ACTIVE' | 'PAUSED';
}

export interface PackageStats {
  views: number;
  likes: number;
  orders: number;
  revenue: number;
  rating: number;
  reviewCount: number;
}

// ================================================
// PACKAGE SERVICE
// ================================================

class PackageService {
  /**
   * Get all packages with filters
   */
  async getAll(
    params?: PackageSearchParams
  ): Promise<ApiResponse<PackageListResponse>> {
    return apiClient.get<PackageListResponse>(
      PACKAGE_ENDPOINTS.GET_ALL,
      params
    );
  }

  /**
   * Get package by ID
   */
  async getById(packageId: string): Promise<ApiResponse<Package>> {
    return apiClient.get<Package>(PACKAGE_ENDPOINTS.GET_BY_ID(packageId));
  }

  /**
   * Search packages
   */
  async search(
    params: PackageSearchParams
  ): Promise<ApiResponse<PackageListResponse>> {
    return apiClient.get<PackageListResponse>(PACKAGE_ENDPOINTS.SEARCH, params);
  }

  /**
   * Filter packages
   */
  async filter(
    params: PackageSearchParams
  ): Promise<ApiResponse<PackageListResponse>> {
    return apiClient.get<PackageListResponse>(PACKAGE_ENDPOINTS.FILTER, params);
  }

  /**
   * Get packages by category
   */
  async getByCategory(
    categoryId: string,
    params?: PackageSearchParams
  ): Promise<ApiResponse<PackageListResponse>> {
    return apiClient.get<PackageListResponse>(
      PACKAGE_ENDPOINTS.BY_CATEGORY(categoryId),
      params
    );
  }

  /**
   * Get packages by seller
   */
  async getBySeller(
    sellerId: string,
    params?: PackageSearchParams
  ): Promise<ApiResponse<PackageListResponse>> {
    return apiClient.get<PackageListResponse>(
      PACKAGE_ENDPOINTS.BY_SELLER(sellerId),
      params
    );
  }

  /**
   * Get featured packages
   */
  async getFeatured(
    params?: PackageSearchParams
  ): Promise<ApiResponse<PackageListResponse>> {
    return apiClient.get<PackageListResponse>(
      PACKAGE_ENDPOINTS.FEATURED,
      params
    );
  }

  /**
   * Get top-rated packages
   */
  async getTopRated(
    params?: PackageSearchParams
  ): Promise<ApiResponse<PackageListResponse>> {
    return apiClient.get<PackageListResponse>(
      PACKAGE_ENDPOINTS.TOP_RATED,
      params
    );
  }

  /**
   * Get recent packages
   */
  async getRecent(
    params?: PackageSearchParams
  ): Promise<ApiResponse<PackageListResponse>> {
    return apiClient.get<PackageListResponse>(PACKAGE_ENDPOINTS.RECENT, params);
  }

  /**
   * Get recommended packages
   */
  async getRecommended(
    params?: PackageSearchParams
  ): Promise<ApiResponse<PackageListResponse>> {
    return apiClient.get<PackageListResponse>(
      PACKAGE_ENDPOINTS.RECOMMENDED,
      params
    );
  }

  /**
   * Get trending packages
   */
  async getTrending(
    params?: PackageSearchParams
  ): Promise<ApiResponse<PackageListResponse>> {
    return apiClient.get<PackageListResponse>(
      PACKAGE_ENDPOINTS.TRENDING,
      params
    );
  }

  /**
   * Get my packages (seller's own packages)
   */
  async getMyPackages(
    params?: PackageSearchParams
  ): Promise<ApiResponse<PackageListResponse>> {
    return apiClient.get<PackageListResponse>(
      PACKAGE_ENDPOINTS.MY_PACKAGES,
      params
    );
  }

  /**
   * Create new package
   */
  async create(data: CreatePackageRequest): Promise<ApiResponse<Package>> {
    return apiClient.post<Package>(PACKAGE_ENDPOINTS.CREATE, data);
  }

  /**
   * Update package
   */
  async update(
    packageId: string,
    data: UpdatePackageRequest
  ): Promise<ApiResponse<Package>> {
    return apiClient.put<Package>(PACKAGE_ENDPOINTS.UPDATE(packageId), data);
  }

  /**
   * Delete package
   */
  async delete(packageId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(PACKAGE_ENDPOINTS.DELETE(packageId));
  }

  /**
   * Publish package
   */
  async publish(packageId: string): Promise<ApiResponse<Package>> {
    return apiClient.post<Package>(PACKAGE_ENDPOINTS.PUBLISH(packageId));
  }

  /**
   * Unpublish package
   */
  async unpublish(packageId: string): Promise<ApiResponse<Package>> {
    return apiClient.post<Package>(PACKAGE_ENDPOINTS.UNPUBLISH(packageId));
  }

  /**
   * Duplicate package
   */
  async duplicate(packageId: string): Promise<ApiResponse<Package>> {
    return apiClient.post<Package>(PACKAGE_ENDPOINTS.DUPLICATE(packageId));
  }

  /**
   * Get package stats
   */
  async getStats(packageId: string): Promise<ApiResponse<PackageStats>> {
    return apiClient.get<PackageStats>(PACKAGE_ENDPOINTS.GET_STATS(packageId));
  }

  /**
   * Get package analytics
   */
  async getAnalytics(packageId: string): Promise<ApiResponse<unknown>> {
    return apiClient.get<unknown>(PACKAGE_ENDPOINTS.GET_ANALYTICS(packageId));
  }
}

// Export singleton instance
export const packageService = new PackageService();
export default packageService;
