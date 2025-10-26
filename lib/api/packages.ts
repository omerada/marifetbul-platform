/**
 * ================================================
 * PACKAGE API CLIENT
 * ================================================
 * Client functions for Package (Service Package) API endpoints
 * Handles 35 REST endpoints across Public, Seller, and Admin controllers
 *
 * Backend Controllers:
 * - PackageController (Public - 15 endpoints)
 * - PackageSellerController (Freelancer - 11 endpoints)
 * - PackageAdminController (Admin - 9 endpoints)
 *
 * @author MarifetBul Development Team
 * @version 2.1.0 - Sprint 4: API Standardization with Validation
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import { validateResponse, PackageSchema } from './validators';
import type { Package as ValidatedPackage } from './validators';
import type {
  Package,
  PackageSummary,
  CreatePackageRequest,
  UpdatePackageRequest,
  AdvancedSearchRequest,
  SellerPackageStats,
  PlatformPackageStats,
  PackageStatus,
  PackageSortBy,
} from '@/types/business/features/package';

// ================================================
// TYPE DEFINITIONS FOR API RESPONSES
// ================================================

interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: PackageSortBy;
  sortDir?: 'ASC' | 'DESC';
}

interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
  isFirst: boolean;
}

// Helper to convert params to string Record
const toStringParams = (
  params: Record<string, unknown>
): Record<string, string> => {
  const result: Record<string, string> = {};
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null) {
      result[key] = String(params[key]);
    }
  });
  return result;
};

// ================================================
// PUBLIC PACKAGE ENDPOINTS (15)
// ================================================

/**
 * Get all active packages (public browsing)
 * GET /api/v1/packages
 */
export const getActivePackages = async (
  params: PaginationParams = {}
): Promise<PaginatedResponse<PackageSummary>> => {
  const {
    page = 0,
    size = 20,
    sortBy = 'CREATED_AT',
    sortDir = 'DESC',
  } = params;

  return await apiClient.get<PaginatedResponse<PackageSummary>>(
    '/packages',
    toStringParams({ page, size, sortBy, sortDir })
  );
};

/**
 * Get package by ID
 * GET /api/v1/packages/{id}
 * @throws {NotFoundError} Package not found
 * @throws {ValidationError} Invalid response format
 */
export const getPackageById = async (id: string): Promise<ValidatedPackage> => {
  const response = await apiClient.get<Package>(`/packages/${id}`);
  return validateResponse(PackageSchema, response, 'Package');
};

/**
 * Get package by slug
 * GET /api/v1/packages/slug/{slug}
 * @throws {NotFoundError} Package not found
 * @throws {ValidationError} Invalid response format
 */
export const getPackageBySlug = async (
  slug: string
): Promise<ValidatedPackage> => {
  const response = await apiClient.get<Package>(`/packages/slug/${slug}`);
  return validateResponse(PackageSchema, response, 'Package');
};

/**
 * Simple keyword search
 * GET /api/v1/packages/search
 */
export const searchPackages = async (
  keyword: string,
  params: PaginationParams = {}
): Promise<PaginatedResponse<PackageSummary>> => {
  const {
    page = 0,
    size = 20,
    sortBy = 'CREATED_AT',
    sortDir = 'DESC',
  } = params;

  return await apiClient.get<PaginatedResponse<PackageSummary>>(
    '/packages/search',
    toStringParams({ keyword, page, size, sortBy, sortDir })
  );
};

/**
 * Advanced search with multiple filters
 * GET /api/v1/packages/advanced-search
 */
export const advancedSearchPackages = async (
  filters: AdvancedSearchRequest
): Promise<PaginatedResponse<PackageSummary>> => {
  return await apiClient.get<PaginatedResponse<PackageSummary>>(
    '/packages/advanced-search',
    toStringParams(filters as Record<string, unknown>)
  );
};

/**
 * Get packages by category
 * GET /api/v1/packages/category/{categoryId}
 */
export const getPackagesByCategory = async (
  categoryId: string,
  params: PaginationParams = {}
): Promise<PaginatedResponse<PackageSummary>> => {
  const {
    page = 0,
    size = 20,
    sortBy = 'CREATED_AT',
    sortDir = 'DESC',
  } = params;

  return await apiClient.get<PaginatedResponse<PackageSummary>>(
    `/packages/category/${categoryId}`,
    toStringParams({ page, size, sortBy, sortDir })
  );
};

/**
 * Get featured packages
 * GET /api/v1/packages/featured
 */
export const getFeaturedPackages = async (
  params: PaginationParams = {}
): Promise<PaginatedResponse<PackageSummary>> => {
  const { page = 0, size = 20 } = params;

  return await apiClient.get<PaginatedResponse<PackageSummary>>(
    '/packages/featured',
    toStringParams({ page, size })
  );
};

/**
 * Get verified packages
 * GET /api/v1/packages/verified
 */
export const getVerifiedPackages = async (
  params: PaginationParams = {}
): Promise<PaginatedResponse<PackageSummary>> => {
  const { page = 0, size = 20 } = params;

  return await apiClient.get<PaginatedResponse<PackageSummary>>(
    '/packages/verified',
    toStringParams({ page, size })
  );
};

/**
 * Get popular packages (by order count)
 * GET /api/v1/packages/popular
 */
export const getPopularPackages = async (
  params: PaginationParams = {}
): Promise<PaginatedResponse<PackageSummary>> => {
  const { page = 0, size = 20 } = params;

  return await apiClient.get<PaginatedResponse<PackageSummary>>(
    '/packages/popular',
    toStringParams({ page, size })
  );
};

/**
 * Get top-rated packages
 * GET /api/v1/packages/top-rated
 */
export const getTopRatedPackages = async (
  params: PaginationParams = {}
): Promise<PaginatedResponse<PackageSummary>> => {
  const { page = 0, size = 20 } = params;

  return await apiClient.get<PaginatedResponse<PackageSummary>>(
    '/packages/top-rated',
    toStringParams({ page, size })
  );
};

/**
 * Get trending packages
 * GET /api/v1/packages/trending
 */
export const getTrendingPackages = async (
  params: PaginationParams = {}
): Promise<PaginatedResponse<PackageSummary>> => {
  const { page = 0, size = 20 } = params;

  return await apiClient.get<PaginatedResponse<PackageSummary>>(
    '/packages/trending',
    toStringParams({ page, size })
  );
};

/**
 * Get newest packages
 * GET /api/v1/packages/newest
 */
export const getNewestPackages = async (
  params: PaginationParams = {}
): Promise<PaginatedResponse<PackageSummary>> => {
  const { page = 0, size = 20 } = params;

  return await apiClient.get<PaginatedResponse<PackageSummary>>(
    '/packages/newest',
    toStringParams({ page, size })
  );
};

/**
 * Get platform statistics (public)
 * GET /api/v1/packages/stats/platform
 */
export const getPlatformStats = async (): Promise<PlatformPackageStats> => {
  return await apiClient.get<PlatformPackageStats>('/packages/stats/platform');
};

// ================================================
// SELLER PACKAGE ENDPOINTS (11)
// ================================================

/**
 * Create new package
 * POST /api/v1/seller/packages
 * @throws {ValidationError} Invalid package data
 * @throws {AuthenticationError} Not authenticated
 */
export const createPackage = async (
  data: CreatePackageRequest
): Promise<ValidatedPackage> => {
  const response = await apiClient.post<Package>('/seller/packages', data);
  return validateResponse(PackageSchema, response, 'Package');
};

/**
 * Update existing package
 * PUT /api/v1/seller/packages/{id}
 * @throws {ValidationError} Invalid package data
 * @throws {NotFoundError} Package not found
 * @throws {AuthorizationError} Not package owner
 */
export const updatePackage = async (
  id: string,
  data: UpdatePackageRequest
): Promise<ValidatedPackage> => {
  const response = await apiClient.put<Package>(`/seller/packages/${id}`, data);
  return validateResponse(PackageSchema, response, 'Package');
};

/**
 * Delete package (soft delete → INACTIVE)
 * DELETE /api/v1/seller/packages/{id}
 */
export const deletePackage = async (id: string): Promise<void> => {
  await apiClient.delete(`/seller/packages/${id}`);
};

/**
 * Get my packages (all statuses)
 * GET /api/v1/seller/packages
 */
export const getMyPackages = async (
  params: PaginationParams = {}
): Promise<PaginatedResponse<PackageSummary>> => {
  const {
    page = 0,
    size = 20,
    sortBy = 'CREATED_AT',
    sortDir = 'DESC',
  } = params;

  return await apiClient.get<PaginatedResponse<PackageSummary>>(
    '/seller/packages',
    toStringParams({ page, size, sortBy, sortDir })
  );
};

/**
 * Get single package details (ownership verification)
 * GET /api/v1/seller/packages/{id}
 */
export const getMyPackage = async (id: string): Promise<Package> => {
  return await apiClient.get<Package>(`/seller/packages/${id}`);
};

/**
 * Get my packages by status
 * GET /api/v1/seller/packages/status/{status}
 */
export const getMyPackagesByStatus = async (
  status: PackageStatus,
  params: PaginationParams = {}
): Promise<PaginatedResponse<PackageSummary>> => {
  const { page = 0, size = 20 } = params;

  return await apiClient.get<PaginatedResponse<PackageSummary>>(
    `/seller/packages/status/${status}`,
    toStringParams({ page, size })
  );
};

/**
 * Activate package (DRAFT/PAUSED → ACTIVE)
 * POST /api/v1/seller/packages/{id}/activate
 */
export const activatePackage = async (id: string): Promise<Package> => {
  return await apiClient.post<Package>(`/seller/packages/${id}/activate`, {});
};

/**
 * Pause package (ACTIVE → PAUSED)
 * POST /api/v1/seller/packages/{id}/pause
 */
export const pausePackage = async (id: string): Promise<Package> => {
  return await apiClient.post<Package>(`/seller/packages/${id}/pause`, {});
};

/**
 * Get my package statistics
 * GET /api/v1/seller/packages/stats
 */
export const getMyStats = async (): Promise<SellerPackageStats> => {
  return await apiClient.get<SellerPackageStats>('/seller/packages/stats');
};

/**
 * Get my top packages (by performance)
 * GET /api/v1/seller/packages/top
 */
export const getMyTopPackages = async (
  limit: number = 5
): Promise<PackageSummary[]> => {
  return await apiClient.get<PackageSummary[]>(
    '/seller/packages/top',
    toStringParams({ limit })
  );
};

// ================================================
// ADMIN PACKAGE ENDPOINTS (9)
// ================================================

/**
 * Get all packages (any status)
 * GET /api/v1/admin/packages
 */
export const getAllPackages = async (
  params: PaginationParams = {}
): Promise<PaginatedResponse<PackageSummary>> => {
  const {
    page = 0,
    size = 20,
    sortBy = 'CREATED_AT',
    sortDir = 'DESC',
  } = params;

  return await apiClient.get<PaginatedResponse<PackageSummary>>(
    '/admin/packages',
    toStringParams({ page, size, sortBy, sortDir })
  );
};

/**
 * Get package details (admin view)
 * GET /api/v1/admin/packages/{id}
 */
export const getPackageByIdAdmin = async (id: string): Promise<Package> => {
  return await apiClient.get<Package>(`/admin/packages/${id}`);
};

/**
 * Get packages by status (admin filter)
 * GET /api/v1/admin/packages/status/{status}
 */
export const getPackagesByStatusAdmin = async (
  status: PackageStatus,
  params: PaginationParams = {}
): Promise<PaginatedResponse<PackageSummary>> => {
  const { page = 0, size = 20 } = params;

  return await apiClient.get<PaginatedResponse<PackageSummary>>(
    `/admin/packages/status/${status}`,
    toStringParams({ page, size })
  );
};

/**
 * Set package as featured
 * POST /api/v1/admin/packages/{id}/feature
 */
export const featurePackage = async (
  id: string,
  featured: boolean
): Promise<Package> => {
  return await apiClient.post<Package>(
    `/admin/packages/${id}/feature?featured=${featured}`,
    {}
  );
};

/**
 * Set package as verified
 * POST /api/v1/admin/packages/{id}/verify
 */
export const verifyPackage = async (
  id: string,
  verified: boolean
): Promise<Package> => {
  return await apiClient.post<Package>(
    `/admin/packages/${id}/verify?verified=${verified}`,
    {}
  );
};

/**
 * Archive package (soft delete)
 * POST /api/v1/admin/packages/{id}/archive
 */
export const archivePackage = async (id: string): Promise<Package> => {
  return await apiClient.post<Package>(`/admin/packages/${id}/archive`, {});
};

/**
 * Restore archived package
 * POST /api/v1/admin/packages/{id}/restore
 */
export const restorePackage = async (id: string): Promise<Package> => {
  return await apiClient.post<Package>(`/admin/packages/${id}/restore`, {});
};

/**
 * Get platform statistics (admin view)
 * GET /api/v1/admin/packages/stats/platform
 */
export const getPlatformStatsAdmin =
  async (): Promise<PlatformPackageStats> => {
    return await apiClient.get<PlatformPackageStats>(
      '/admin/packages/stats/platform'
    );
  };

// ================================================
// CONVENIENCE EXPORTS
// ================================================

/**
 * Package API Client
 * Grouped exports for easier imports
 */
export const packageApi = {
  // Public endpoints
  getActivePackages,
  getPackageById,
  getPackageBySlug,
  searchPackages,
  advancedSearchPackages,
  getPackagesByCategory,
  getFeaturedPackages,
  getVerifiedPackages,
  getPopularPackages,
  getTopRatedPackages,
  getTrendingPackages,
  getNewestPackages,
  getPlatformStats,

  // Seller endpoints
  createPackage,
  updatePackage,
  deletePackage,
  getMyPackages,
  getMyPackage,
  getMyPackagesByStatus,
  activatePackage,
  pausePackage,
  getMyStats,
  getMyTopPackages,

  // Admin endpoints
  getAllPackages,
  getPackageByIdAdmin,
  getPackagesByStatusAdmin,
  featurePackage,
  verifyPackage,
  archivePackage,
  restorePackage,
  getPlatformStatsAdmin,
};

export default packageApi;
