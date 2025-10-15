/**
 * Enhanced Type System for Database Integration
 * Provides comprehensive type definitions aligned with backend entities
 * Includes type guards, validators, and utility types
 */

// ============================================================================
// ENHANCED PACKAGE TYPES WITH FULL TIER SUPPORT
// ============================================================================

/**
 * Complete PackageTier definition aligned with backend entity
 */
export interface PackageTierComplete {
  id?: string;
  name: 'basic' | 'standard' | 'premium';
  title: string;
  description: string;
  price: number;
  deliveryTime: number;
  deliveryTimeUnit: 'days' | 'weeks' | 'months';
  features: string[];
  revisions: number;
  fastDelivery: boolean;
  sourceFiles: boolean;
  commercialUse: boolean;
  customizations?: number;
  additionalInfo?: string;
}

/**
 * Enhanced ServicePackage with complete tier structure
 */
export interface ServicePackageEnhanced {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;

  // Tier structure (complete backend alignment)
  tiers: {
    basic: PackageTierComplete;
    standard?: PackageTierComplete;
    premium?: PackageTierComplete;
  };

  // Calculated fields (from basic tier for backward compatibility)
  price: number; // From basic tier
  deliveryTime: number; // From basic tier

  // Relations
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  subcategory?: string;
  skillIds?: string[];
  skills?: string[];
  freelancerId: string;
  freelancer?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    rating?: number;
    reviewCount?: number;
    completedJobs?: number;
    responseTime?: string;
  };

  // Media
  images: Array<{
    id: string;
    url: string;
    name: string;
    type: string;
  }>;
  video?: string;
  portfolioItems?: Array<{
    id: string;
    title: string;
    image: string;
    url?: string;
  }>;

  // Status and visibility
  status: 'active' | 'inactive' | 'draft' | 'pending_review' | 'rejected';
  isFeatured: boolean;
  isVerified?: boolean;

  // Statistics (aligned with backend)
  viewCount: number;
  orderCount: number;
  rating: number;
  reviewCount: number;
  completionRate?: number;

  // Additional features
  tags?: string[];
  requirements?: string[];
  faqItems?: Array<{
    question: string;
    answer: string;
  }>;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastOrderedAt?: string;
}

// ============================================================================
// JOB BUDGET ENHANCED TYPES
// ============================================================================

/**
 * Complete JobBudget definition aligned with backend
 */
export interface JobBudgetComplete {
  type: 'fixed' | 'hourly';
  amount: number;
  maxAmount?: number; // For hourly: max budget
  currency: 'TRY' | 'USD' | 'EUR';
  negotiable: boolean;
}

/**
 * Enhanced Job type with complete budget structure
 */
export interface JobEnhanced {
  id: string;
  title: string;
  description: string;

  // Budget (complete structure)
  budget: JobBudgetComplete;

  // Relations
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  subcategory?: string;
  employerId: string;
  employer?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    companyName?: string;
    rating?: number;
    totalJobs?: number;
  };
  freelancerId?: string;

  // Job details
  skills: string[];
  tags?: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  timeline: string;
  duration?: string;

  // Location
  location?: string;
  isRemote: boolean;

  // Status and dates
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  deadline?: string;
  startDate?: string;
  completionDate?: string;

  // Additional info
  requirements?: string[];
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
  }>;

  // Statistics
  proposalsCount: number;
  viewCount?: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if entity is a Job
 */
export function isJob(entity: unknown): entity is JobEnhanced {
  return (
    typeof entity === 'object' &&
    entity !== null &&
    'budget' in entity &&
    'employerId' in entity
  );
}

/**
 * Type guard to check if entity is a ServicePackage
 */
export function isServicePackage(
  entity: unknown
): entity is ServicePackageEnhanced {
  return (
    typeof entity === 'object' &&
    entity !== null &&
    'tiers' in entity &&
    'freelancerId' in entity
  );
}

/**
 * Type guard to check if budget is complete structure
 */
export function isCompleteJobBudget(
  budget: unknown
): budget is JobBudgetComplete {
  return (
    typeof budget === 'object' &&
    budget !== null &&
    'type' in budget &&
    'amount' in budget
  );
}

/**
 * Type guard to check if package has complete tier structure
 */
export function hasCompleteTiers(pkg: unknown): pkg is ServicePackageEnhanced {
  if (typeof pkg !== 'object' || pkg === null || !('tiers' in pkg)) {
    return false;
  }

  const tiers = (pkg as { tiers: unknown }).tiers;
  return typeof tiers === 'object' && tiers !== null && 'basic' in tiers;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Extract budget amount from Job regardless of format
 */
export function getJobBudgetAmount(
  job: JobEnhanced | { budget: number | JobBudgetComplete }
): number {
  if (typeof job.budget === 'number') {
    return job.budget;
  }
  return job.budget.amount;
}

/**
 * Extract package price from tier structure
 */
export function getPackagePrice(
  pkg: ServicePackageEnhanced,
  tier: 'basic' | 'standard' | 'premium' = 'basic'
): number {
  if (tier === 'standard' && pkg.tiers.standard) {
    return pkg.tiers.standard.price;
  }
  if (tier === 'premium' && pkg.tiers.premium) {
    return pkg.tiers.premium.price;
  }
  return pkg.tiers.basic.price;
}

/**
 * Extract package delivery time from tier structure
 */
export function getPackageDeliveryTime(
  pkg: ServicePackageEnhanced,
  tier: 'basic' | 'standard' | 'premium' = 'basic'
): number {
  if (tier === 'standard' && pkg.tiers.standard) {
    return pkg.tiers.standard.deliveryTime;
  }
  if (tier === 'premium' && pkg.tiers.premium) {
    return pkg.tiers.premium.price;
  }
  return pkg.tiers.basic.deliveryTime;
}

/**
 * Convert simple package to enhanced package with tiers
 */
export function convertToEnhancedPackage(simplePackage: {
  id: string;
  title: string;
  price: number;
  deliveryTime: number;
  features?: string[];
  [key: string]: unknown;
}): ServicePackageEnhanced {
  return {
    ...simplePackage,
    tiers: {
      basic: {
        name: 'basic',
        title: 'Basic Package',
        description: (simplePackage.description as string) || '',
        price: simplePackage.price,
        deliveryTime: simplePackage.deliveryTime,
        deliveryTimeUnit: 'days',
        features: simplePackage.features || [],
        revisions: 1,
        fastDelivery: false,
        sourceFiles: false,
        commercialUse: false,
      },
    },
  } as ServicePackageEnhanced;
}

/**
 * Convert simple job budget to complete budget
 */
export function convertToCompleteJobBudget(
  budget: number | JobBudgetComplete
): JobBudgetComplete {
  if (typeof budget === 'number') {
    return {
      type: 'fixed',
      amount: budget,
      currency: 'TRY',
      negotiable: false,
    };
  }
  return budget;
}

// ============================================================================
// BACKWARD COMPATIBILITY HELPERS
// ============================================================================

/**
 * Normalize Job to ensure budget is always complete structure
 */
export function normalizeJob(
  job: JobEnhanced | { budget: number; [key: string]: unknown }
): JobEnhanced {
  return {
    ...job,
    budget: convertToCompleteJobBudget(job.budget),
  } as JobEnhanced;
}

/**
 * Normalize ServicePackage to ensure tiers structure exists
 */
export function normalizePackage(
  pkg:
    | ServicePackageEnhanced
    | { price: number; deliveryTime: number; [key: string]: unknown }
): ServicePackageEnhanced {
  if (hasCompleteTiers(pkg)) {
    return pkg;
  }
  return convertToEnhancedPackage(pkg as never);
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate Job structure
 */
export function validateJob(job: unknown): job is JobEnhanced {
  if (!isJob(job)) return false;

  // Required fields
  if (!job.id || !job.title || !job.description) return false;
  if (!job.categoryId || !job.employerId) return false;
  if (!Array.isArray(job.skills) || job.skills.length === 0) return false;

  // Budget validation
  if (!isCompleteJobBudget(job.budget)) return false;
  if (job.budget.amount <= 0) return false;

  // Status validation
  const validStatuses = ['open', 'in_progress', 'completed', 'cancelled'];
  if (!validStatuses.includes(job.status)) return false;

  return true;
}

/**
 * Validate ServicePackage structure
 */
export function validatePackage(pkg: unknown): pkg is ServicePackageEnhanced {
  if (!isServicePackage(pkg)) return false;

  // Required fields
  if (!pkg.id || !pkg.title || !pkg.description) return false;
  if (!pkg.categoryId || !pkg.freelancerId) return false;

  // Tiers validation
  if (!pkg.tiers.basic) return false;
  if (pkg.tiers.basic.price <= 0) return false;
  if (pkg.tiers.basic.deliveryTime <= 0) return false;

  // Status validation
  const validStatuses = [
    'active',
    'inactive',
    'draft',
    'pending_review',
    'rejected',
  ];
  if (!validStatuses.includes(pkg.status)) return false;

  return true;
}
