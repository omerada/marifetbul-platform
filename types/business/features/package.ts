/**
 * ================================================
 * PACKAGE SYSTEM - TYPE DEFINITIONS
 * ================================================
 * Type definitions for Package (Service Package) System
 * Aligned with backend Spring Boot entities
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

// ================================================
// ENUMS & CONSTANTS
// ================================================

/**
 * Package Status
 * Matches backend PackageStatus enum
 */
export type PackageStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'INACTIVE';

/**
 * Tier Names
 */
export type TierType = 'BASIC' | 'STANDARD' | 'PREMIUM';

/**
 * Sort Options for Package Listings
 */
export type PackageSortBy =
  | 'CREATED_AT'
  | 'ORDER_COUNT'
  | 'RATING'
  | 'VIEWS'
  | 'PRICE_ASC'
  | 'PRICE_DESC';

// ================================================
// CORE ENTITIES
// ================================================

/**
 * Package Tier Information
 * Embedded entity in Package
 */
export interface PackageTierInfo {
  price: number; // BigDecimal in backend
  deliveryDays: number; // Integer
  revisionCount: number; // Integer (-1 for unlimited)
  features: string[]; // JSON list
  isActive: boolean;
}

/**
 * Package Milestone Template
 * Sprint 4: Milestone-based package orders
 */
export interface PackageMilestoneTemplate {
  id?: string; // UUID (when reading)
  title: string; // 5-100 chars
  description: string; // 10-500 chars
  amount: number; // BigDecimal (10-50000 TL)
  order: number; // 1-100
  estimatedDays?: number; // 1-365 days (optional)
}

/**
 * Package Entity (Complete)
 * Matches backend Package entity
 */
export interface Package {
  // Core fields
  id: string; // UUID
  title: string; // max 200 chars
  slug: string; // unique, auto-generated
  description: string; // TEXT

  // Relations
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  sellerId: string;
  seller?: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl?: string;
    rating?: number;
    reviewCount?: number;
    isVerified?: boolean;
  };

  // Tier Pricing (Embedded)
  basicTier: PackageTierInfo;
  standardTier?: PackageTierInfo | null;
  premiumTier?: PackageTierInfo | null;

  // Features & Details
  highlights: string[]; // JSON list (max 5 items)
  deliverables: string[]; // JSON list (max 10 items)
  requirements: string[]; // JSON list (max 10 items)

  // Media
  images: string[]; // Cloudinary URLs (min 1, max 8)
  videoUrl?: string | null; // YouTube/Vimeo URL

  // Status & Flags
  status: PackageStatus;
  isFeatured: boolean;
  isVerified: boolean;

  // Statistics
  views: number; // Long
  orders: number; // Long
  rating?: number | null; // BigDecimal (0-5)
  reviewCount: number; // Long

  // SEO
  metaDescription?: string | null; // max 160 chars
  keywords: string[]; // JSON list

  // Timestamps
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * Package Summary (List View)
 * Lightweight version for listings
 */
export interface PackageSummary {
  id: string;
  title: string;
  slug: string;
  description: string; // Truncated excerpt
  categoryId: string;
  categoryName: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  sellerRating?: number;

  // Pricing (from tiers)
  basicPrice: number;
  standardPrice?: number | null;
  premiumPrice?: number | null;

  // Media
  coverImage: string; // First image from images array

  // Status
  status: PackageStatus;
  isFeatured: boolean;
  isVerified: boolean;

  // Statistics
  views: number;
  orders: number;
  rating?: number | null;
  reviewCount: number;

  // Timestamps
  createdAt: string;
}

// ================================================
// REQUEST DTOs
// ================================================

/**
 * Create Package Request
 * Matches backend CreatePackageRequest DTO
 */
export interface CreatePackageRequest {
  title: string; // 10-200 chars
  description: string; // 50-5000 chars
  categoryId: string; // UUID

  // Tier Pricing (Basic required, others optional)
  basicTier: {
    price: number; // 50-50000 TL
    deliveryDays: number; // 1-90
    revisionCount: number; // 0-20 (-1 for unlimited)
    features: string[]; // min 1
  };
  standardTier?: {
    price: number;
    deliveryDays: number;
    revisionCount: number;
    features: string[];
  } | null;
  premiumTier?: {
    price: number;
    deliveryDays: number;
    revisionCount: number;
    features: string[];
  } | null;

  // Features
  highlights: string[]; // max 5
  deliverables: string[]; // max 10
  requirements: string[]; // max 10

  // Media
  images: string[]; // min 1, max 8 (Cloudinary URLs)
  videoUrl?: string | null;

  // SEO
  metaDescription?: string | null; // max 160 chars
  keywords: string[]; // max 10

  // Milestone Templates (Sprint 4)
  milestoneTemplates?: PackageMilestoneTemplate[]; // max 10
}

/**
 * Update Package Request
 * Matches backend UpdatePackageRequest DTO
 */
export interface UpdatePackageRequest {
  title?: string;
  description?: string;
  categoryId?: string;

  basicTier?: {
    price: number;
    deliveryDays: number;
    revisionCount: number;
    features: string[];
  };
  standardTier?: {
    price: number;
    deliveryDays: number;
    revisionCount: number;
    features: string[];
  } | null;
  premiumTier?: {
    price: number;
    deliveryDays: number;
    revisionCount: number;
    features: string[];
  } | null;

  highlights?: string[];
  deliverables?: string[];
  requirements?: string[];

  images?: string[];
  videoUrl?: string | null;

  metaDescription?: string | null;
  keywords?: string[];
}

// ================================================
// RESPONSE DTOs
// ================================================

/**
 * Package Response (Single)
 */
export interface PackageResponse {
  success: boolean;
  data: Package;
  message?: string;
}

/**
 * Package List Response (Paginated)
 */
export interface PackageListResponse {
  success: boolean;
  data: {
    packages: PackageSummary[];
    pagination: {
      page: number;
      size: number;
      totalElements: number;
      totalPages: number;
      isLast: boolean;
      isFirst: boolean;
    };
  };
}

/**
 * Package Statistics (Seller)
 */
export interface SellerPackageStats {
  totalPackages: number;
  activePackages: number;
  draftPackages: number;
  pausedPackages: number;
  inactivePackages: number;

  totalViews: number;
  totalOrders: number;
  averageRating: number;
  totalReviews: number;

  // Revenue
  totalRevenue: number; // Sum of all order amounts
  monthlyRevenue: number; // Current month

  // Top performers
  topPackages: Array<{
    id: string;
    title: string;
    orders: number;
    rating: number;
    revenue: number;
  }>;

  // Recent activity (last 30 days)
  recentViews: number;
  recentOrders: number;
}

/**
 * Platform Package Statistics (Admin)
 */
export interface PlatformPackageStats {
  totalPackages: number;
  activePackages: number;
  featuredPackages: number;
  verifiedPackages: number;

  totalOrders: number;
  totalRevenue: number;
  averagePackagePrice: number;

  // Category breakdown
  topCategories: Array<{
    categoryId: string;
    categoryName: string;
    packageCount: number;
    orderCount: number;
  }>;

  // Seller breakdown
  topSellers: Array<{
    sellerId: string;
    sellerName: string;
    packageCount: number;
    totalOrders: number;
    totalRevenue: number;
  }>;

  // Tier distribution
  tierDistribution: {
    onlyBasic: number; // Packages with only basic tier
    basicAndStandard: number;
    allThreeTiers: number;
  };
}

// ================================================
// SEARCH & FILTERS
// ================================================

/**
 * Package Search Filters
 */
export interface PackageSearchFilters {
  // Text search
  keyword?: string;

  // Category
  categoryId?: string;

  // Price range
  minPrice?: number;
  maxPrice?: number;

  // Delivery time
  maxDeliveryDays?: number;

  // Ratings
  minRating?: number;

  // Flags
  featuredOnly?: boolean;
  verifiedOnly?: boolean;

  // Pagination
  page?: number;
  size?: number;

  // Sorting
  sortBy?: PackageSortBy;
  sortDir?: 'ASC' | 'DESC';
}

/**
 * Advanced Search Request
 * For /packages/advanced-search endpoint
 */
export interface AdvancedSearchRequest extends PackageSearchFilters {
  // Extended filters
  sellerIds?: string[];
  excludePackageIds?: string[];
  hasStandardTier?: boolean;
  hasPremiumTier?: boolean;
}

// ================================================
// FRONTEND-SPECIFIC TYPES
// ================================================

/**
 * Package Creation Form Data
 * Used in multi-step wizard
 */
export interface PackageFormData {
  // Step 1: Basic Info
  basicInfo: {
    title: string;
    description: string;
    categoryId: string;
    keywords: string[];
  };

  // Step 2: Tier Pricing
  tierPricing: {
    basicTier: {
      price: number;
      deliveryDays: number;
      revisionCount: number;
      features: string[];
    };
    standardTier: {
      enabled: boolean;
      price: number;
      deliveryDays: number;
      revisionCount: number;
      features: string[];
    };
    premiumTier: {
      enabled: boolean;
      price: number;
      deliveryDays: number;
      revisionCount: number;
      features: string[];
    };
  };

  // Step 3: Features
  features: {
    highlights: string[];
    deliverables: string[];
    requirements: string[];
  };

  // Step 4: Media
  media: {
    images: string[]; // Cloudinary URLs
    videoUrl: string;
  };

  // Step 5: SEO (optional)
  seo: {
    metaDescription: string;
  };
}

/**
 * Package Tier Display (for comparison tables)
 */
export interface TierDisplay {
  type: TierType;
  name: string; // 'Basic', 'Standard', 'Premium'
  isAvailable: boolean;
  price: number;
  deliveryDays: number;
  revisionCount: number;
  features: string[];
  isRecommended?: boolean; // Highlight recommended tier
}

/**
 * Package Card Props (for UI components)
 */
export interface PackageCardData {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  sellerName: string;
  sellerAvatar?: string;
  sellerRating?: number;
  basicPrice: number;
  standardPrice?: number;
  premiumPrice?: number;
  rating?: number;
  reviewCount: number;
  orders: number;
  isFeatured: boolean;
  isVerified: boolean;
  status: PackageStatus;
}

/**
 * Tier Comparison Data (for detail page)
 */
export interface TierComparisonData {
  packageId: string;
  packageTitle: string;
  tiers: TierDisplay[];
  selectedTierType?: TierType;
}

/**
 * Package Dashboard Filters (seller dashboard)
 */
export interface PackageDashboardFilters {
  status?: PackageStatus;
  search?: string;
  sortBy?: 'CREATED_AT' | 'VIEWS' | 'ORDERS' | 'RATING';
  sortDir?: 'ASC' | 'DESC';
}

// ================================================
// VALIDATION TYPES
// ================================================

/**
 * Validation Error
 */
export interface PackageValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Tier Validation Result
 */
export interface TierValidationResult {
  isValid: boolean;
  errors: PackageValidationError[];
  warnings?: string[]; // Non-blocking warnings
}

// ================================================
// ANALYTICS TYPES
// ================================================

/**
 * Package Analytics (for seller insights)
 */
export interface PackageAnalytics {
  packageId: string;
  views: number;
  clicks: number;
  orders: number;
  conversionRate: number; // orders / clicks
  averageOrderValue: number;
  totalRevenue: number;

  // Time-series data
  viewsOverTime: Array<{ date: string; count: number }>;
  ordersOverTime: Array<{ date: string; count: number }>;

  // Geographic data
  topCountries: Array<{ country: string; views: number }>;

  // Tier breakdown
  tierOrderDistribution: {
    basic: number;
    standard: number;
    premium: number;
  };
}

// ================================================
// EXPORT ALL
// ================================================

export type {
  // Re-export for convenience
  Package as PackageEntity,
  PackageSummary as PackageListItem,
};
