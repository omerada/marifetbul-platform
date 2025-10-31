/**
 * ================================================
 * PACKAGE API CLIENT - UNIFIED
 * ================================================
 * Re-exports from production-ready PackageService
 * This file maintains backward compatibility while using
 * the centralized service implementation
 *
 * @author MarifetBul Development Team
 * @version 3.0.0 - Unified API Architecture
 */

import { PackageService } from '@/lib/infrastructure/services/api/packageService';
import type { ServicePackage, PaginatedResponse } from '@/types';

// Re-export types for backward compatibility
export type { ServicePackage, PaginatedResponse };
export type Package = ServicePackage;
export type PackageSummary = ServicePackage;

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

export interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

export interface CreatePackageRequest extends Partial<ServicePackage> {
  title: string;
  description: string;
  price: number;
}

export interface UpdatePackageRequest extends Partial<ServicePackage> {
  id: string;
}

/**
 * Unified Package API
 * All methods delegate to the centralized PackageService
 */
export const packageApi = {
  // ==================== PUBLIC PACKAGE ENDPOINTS ====================
  searchPackages: PackageService.searchPackages,
  getPackageById: PackageService.getPackageById,
  getPackageBySlug: PackageService.getPackageBySlug,
  getPackagesByCategory: PackageService.getPackagesByCategory,

  // ==================== FEATURED & DISCOVERY ====================
  getFeaturedPackages: PackageService.getFeaturedPackages,
  getVerifiedPackages: PackageService.getVerifiedPackages,
  getPopularPackages: PackageService.getPopularPackages,
  getTopRatedPackages: PackageService.getTopRatedPackages,
  getTrendingPackages: PackageService.getTrendingPackages,
  getNewestPackages: PackageService.getNewestPackages,

  // ==================== SELLER ENDPOINTS ====================
  createPackage: PackageService.createPackage,
  updatePackage: PackageService.updatePackage,
  deletePackage: PackageService.deletePackage,
  getUserPackages: PackageService.getUserPackages,
  activatePackage: PackageService.activatePackage,
  pausePackage: PackageService.pausePackage,

  // ==================== STATISTICS ====================
  getPlatformStats: PackageService.getPlatformStats,
} as const;

// Default export
export default packageApi;

/**
 * Individual function exports for tree-shaking
 * These maintain the old API surface for components that use direct imports
 */
export const searchPackages = packageApi.searchPackages;
export const getActivePackages = packageApi.searchPackages; // Alias for backward compat
export const getPackageById = packageApi.getPackageById;
export const getPackageBySlug = packageApi.getPackageBySlug;
export const getPackagesByCategory = packageApi.getPackagesByCategory;
export const getFeaturedPackages = packageApi.getFeaturedPackages;
export const getVerifiedPackages = packageApi.getVerifiedPackages;
export const getPopularPackages = packageApi.getPopularPackages;
export const getTopRatedPackages = packageApi.getTopRatedPackages;
export const getTrendingPackages = packageApi.getTrendingPackages;
export const getNewestPackages = packageApi.getNewestPackages;
export const createPackage = packageApi.createPackage;
export const updatePackage = packageApi.updatePackage;
export const deletePackage = packageApi.deletePackage;
export const getMyPackages = packageApi.getUserPackages; // Alias
export const getUserPackages = packageApi.getUserPackages;
export const getPlatformStats = packageApi.getPlatformStats;
export const activatePackage = packageApi.activatePackage;
export const pausePackage = packageApi.pausePackage;

// Additional convenience exports
export const getPackage = getPackageById;
export const getPackages = searchPackages;
