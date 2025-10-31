/**
 * ================================================
 * PACKAGE TRANSFORMERS
 * ================================================
 * Transform backend ServicePackage to frontend PackageSummary/Package
 * Handles type mismatches between API responses and frontend types
 *
 * @module lib/transformers/package.transformer
 */

import type { ServicePackage } from '@/types';
import type {
  PackageSummary,
  Package,
  PackageTierInfo,
} from '@/types/business/features/package';

/**
 * Transform ServicePackage to Package (full detail)
 * Maps backend ServicePackage to complete frontend Package type
 */
export function transformServicePackageToPackage(pkg: ServicePackage): Package {
  // Extract first image URL
  let firstImage = '';
  if (pkg.images && pkg.images.length > 0) {
    const img = pkg.images[0];
    firstImage = typeof img === 'string' ? img : img.url;
  }

  // Build image URLs array
  const imageUrls: string[] = [];
  if (pkg.images) {
    pkg.images.forEach((img) => {
      const url = typeof img === 'string' ? img : img.url;
      if (url) imageUrls.push(url);
    });
  }

  // Build seller name
  const sellerName = pkg.seller
    ? `${pkg.seller.firstName || ''} ${pkg.seller.lastName || ''}`.trim()
    : pkg.freelancer
      ? `${pkg.freelancer.firstName || ''} ${pkg.freelancer.lastName || ''}`.trim() ||
        pkg.freelancer.name ||
        ''
      : '';

  // Build tier info
  const basicTier: PackageTierInfo = {
    price: pkg.price || pkg.pricing?.basic?.price || 0,
    deliveryDays: pkg.deliveryTime || pkg.pricing?.basic?.deliveryTime || 1,
    revisionCount: pkg.revisions || pkg.pricing?.basic?.revisions || 0,
    features: pkg.pricing?.basic?.features || pkg.features || [],
    isActive: true,
  };

  const standardTier: PackageTierInfo | null = pkg.pricing?.standard
    ? {
        price: pkg.pricing.standard.price,
        deliveryDays: pkg.pricing.standard.deliveryTime,
        revisionCount: pkg.pricing.standard.revisions,
        features: pkg.pricing.standard.features,
        isActive: true,
      }
    : null;

  const premiumTier: PackageTierInfo | null = pkg.pricing?.premium
    ? {
        price: pkg.pricing.premium.price,
        deliveryDays: pkg.pricing.premium.deliveryTime,
        revisionCount: pkg.pricing.premium.revisions,
        features: pkg.pricing.premium.features,
        isActive: true,
      }
    : null;

  return {
    id: pkg.id,
    title: pkg.title,
    slug: pkg.slug || '',
    description: pkg.description || '',

    // Relations
    categoryId: pkg.categoryId || pkg.category || '',
    category: {
      id: pkg.categoryId || pkg.category || '',
      name: pkg.category || '',
      slug: pkg.subcategory || '',
    },
    sellerId: pkg.freelancerId || '',
    seller: {
      id: pkg.freelancerId || '',
      username: pkg.freelancer?.name || sellerName,
      fullName: sellerName,
      avatarUrl: pkg.seller?.avatar || pkg.freelancer?.avatar,
      rating: pkg.seller?.rating || pkg.freelancer?.rating,
      reviewCount: pkg.freelancer?.reviewCount,
      isVerified: false,
    },

    // Tier Pricing
    basicTier,
    standardTier,
    premiumTier,

    // Features & Details
    highlights: pkg.features || [],
    deliverables: pkg.features || [],
    requirements: pkg.requirements || [],

    // Media
    images: imageUrls,
    videoUrl: pkg.video || null,

    // Status & Flags
    status: normalizePackageStatus(pkg.status),
    isFeatured: false,
    isVerified: false,

    // Statistics
    views: pkg.views || 0,
    orders: pkg.orders || 0,
    rating: pkg.rating || null,
    reviewCount:
      typeof pkg.reviews === 'number'
        ? pkg.reviews
        : pkg.freelancer?.reviewCount || 0,

    // SEO
    metaDescription: pkg.shortDescription || null,
    keywords: pkg.tags || [],

    // Timestamps
    createdAt: pkg.createdAt || new Date().toISOString(),
    updatedAt: pkg.updatedAt || new Date().toISOString(),
  };
}

/**
 * Transform ServicePackage to PackageSummary
 * Maps backend ServicePackage fields to frontend PackageSummary requirements
 *
 * Backend differences:
 * - ServicePackage.freelancerId → PackageSummary.sellerId
 * - ServicePackage.category (string) → PackageSummary.categoryId
 * - ServicePackage.price → PackageSummary.basicPrice
 * - ServicePackage.status (lowercase) → PackageSummary.status (uppercase enum)
 * - Adds categoryName, sellerName from nested objects
 */
export function transformServicePackageToSummary(
  pkg: ServicePackage
): PackageSummary {
  // Extract first image URL from images array
  let coverImage = '';
  if (pkg.images && pkg.images.length > 0) {
    const firstImage = pkg.images[0];
    coverImage = typeof firstImage === 'string' ? firstImage : firstImage.url;
  }

  // Build seller name from seller object
  const sellerName = pkg.seller
    ? `${pkg.seller.firstName || ''} ${pkg.seller.lastName || ''}`.trim()
    : pkg.freelancer
      ? `${pkg.freelancer.firstName || ''} ${pkg.freelancer.lastName || ''}`.trim() ||
        pkg.freelancer.name ||
        ''
      : '';

  return {
    id: pkg.id,
    title: pkg.title,
    slug: pkg.slug || '',
    description: pkg.description || '',
    categoryId: pkg.categoryId || pkg.category || '',
    categoryName: pkg.category || '',
    sellerId: pkg.freelancerId || '',
    sellerName,
    sellerAvatar: pkg.seller?.avatar || pkg.freelancer?.avatar || undefined,
    sellerRating: pkg.seller?.rating || pkg.freelancer?.rating || undefined,

    // Pricing from tiers or basic price
    basicPrice: pkg.price || pkg.pricing?.basic?.price || 0,
    standardPrice: pkg.pricing?.standard?.price || null,
    premiumPrice: pkg.pricing?.premium?.price || null,

    // Media
    coverImage,

    // Status (normalize to uppercase)
    status: normalizePackageStatus(pkg.status),
    isFeatured: false, // ServicePackage doesn't have this field
    isVerified: false, // ServicePackage doesn't have this field

    // Statistics
    views: pkg.views || 0,
    orders: pkg.orders || 0,
    rating: pkg.rating || null,
    reviewCount:
      typeof pkg.reviews === 'number'
        ? pkg.reviews
        : pkg.freelancer?.reviewCount || 0,

    // Timestamps
    createdAt: pkg.createdAt || new Date().toISOString(),
  };
}

/**
 * Transform array of ServicePackage to PackageSummary
 */
export function transformServicePackagesToSummaries(
  packages: ServicePackage[]
): PackageSummary[] {
  return packages.map(transformServicePackageToSummary);
}

/**
 * Normalize package status to uppercase enum format
 * Backend: 'active' | 'paused' | 'draft' | 'rejected'
 * Frontend: 'ACTIVE' | 'PAUSED' | 'DRAFT' | 'INACTIVE'
 */
function normalizePackageStatus(
  status?: string | 'active' | 'paused' | 'draft' | 'rejected'
): 'ACTIVE' | 'PAUSED' | 'DRAFT' | 'INACTIVE' {
  if (!status) return 'DRAFT';

  const upperStatus = status.toUpperCase();

  // Map 'rejected' to 'INACTIVE'
  if (upperStatus === 'REJECTED') return 'INACTIVE';

  if (
    upperStatus === 'ACTIVE' ||
    upperStatus === 'PAUSED' ||
    upperStatus === 'DRAFT' ||
    upperStatus === 'INACTIVE'
  ) {
    return upperStatus as 'ACTIVE' | 'PAUSED' | 'DRAFT' | 'INACTIVE';
  }

  // Default fallback
  return 'DRAFT';
}

/**
 * Transform backend response with type-safe casting
 * Useful for handling unknown API responses
 */
export function transformPackageResponse(
  response: Record<string, unknown>
): PackageSummary {
  return transformServicePackageToSummary(
    response as unknown as ServicePackage
  );
}

/**
 * Transform paginated package response
 */
export function transformPaginatedPackages(response: Record<string, unknown>): {
  packages: PackageSummary[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
} {
  const data = response.data || response.content || [];
  const packages = Array.isArray(data)
    ? transformServicePackagesToSummaries(data as ServicePackage[])
    : [];

  const paginationData = (response.pagination || response) as Record<
    string,
    unknown
  >;

  return {
    packages,
    pagination: {
      page: Number(paginationData.page || 0),
      pageSize: Number(paginationData.size || paginationData.pageSize || 20),
      total: Number(paginationData.total || paginationData.totalElements || 0),
      totalPages: Number(paginationData.totalPages || 0),
    },
  };
}
