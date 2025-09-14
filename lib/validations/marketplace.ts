import { z } from 'zod';
import { baseSchemas, compositeSchemas } from './base';

// ================================================
// MARKETPLACE VALIDATION SCHEMAS
// ================================================
// Optimized with base schema composition

// Base marketplace filter schema using composition
export const marketplaceFilterSchema = z.object({
  search: z.string().optional(),
  category: baseSchemas.category.optional(),
  subcategory: z.string().optional(),
  minBudget: baseSchemas.price.optional(),
  maxBudget: baseSchemas.price.optional(),
  minPrice: baseSchemas.price.optional(),
  maxPrice: baseSchemas.price.optional(),
  deliveryTime: z.number().min(1).max(365).optional(),
  experienceLevel: z.enum(['beginner', 'intermediate', 'expert']).optional(),
  location: baseSchemas.stringArray.optional(),
  isRemote: baseSchemas.optional,
  skills: baseSchemas.tags.optional(),
  rating: baseSchemas.rating.optional(),
  datePosted: z.enum(['today', 'week', 'month', 'all']).optional(),
  sortBy: z
    .enum(['newest', 'oldest', 'budget', 'price', 'rating', 'relevance'])
    .optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  ...compositeSchemas.pagination.shape,
});

// Job-specific filters
export const jobFiltersSchema = marketplaceFilterSchema.extend({
  budgetType: z.enum(['fixed', 'hourly']).optional(),
  proposalsCount: baseSchemas.nonNegativeInt.optional(),
  deadline: z.enum(['urgent', 'week', 'month', 'flexible']).optional(),
});

// Package-specific filters
export const packageFiltersSchema = marketplaceFilterSchema.extend({
  revisions: baseSchemas.nonNegativeInt.optional(),
  orders: baseSchemas.nonNegativeInt.optional(),
});

// Search query schema with composition
export const searchQuerySchema = z.object({
  query: z.string().min(1, 'Arama terimi en az 1 karakter olmalıdır'),
  filters: marketplaceFilterSchema.optional(),
  type: z.enum(['jobs', 'packages', 'all']).default('all'),
});

// Advanced search schema using composite patterns
export const advancedSearchSchema = z.object({
  keywords: baseSchemas.stringArray.optional(),
  excludeKeywords: baseSchemas.stringArray.optional(),
  exactPhrase: z.string().optional(),
  category: baseSchemas.category.optional(),
  subcategory: z.string().optional(),
  location: z
    .object({
      city: baseSchemas.city.optional(),
      country: baseSchemas.country.optional(),
      radius: z.number().min(1).max(100).optional(),
    })
    .optional(),
  budget: compositeSchemas.priceRange.optional(),
  timeline: z
    .object({
      min: baseSchemas.positiveInt.optional(),
      max: baseSchemas.positiveInt.optional(),
      unit: z.enum(['days', 'weeks', 'months']).optional(),
    })
    .optional(),
  skills: z
    .object({
      required: baseSchemas.tags.optional(),
      preferred: baseSchemas.tags.optional(),
    })
    .optional(),
  rating: baseSchemas.rating.optional(),
  verified: baseSchemas.optional,
  availability: z.enum(['available', 'busy', 'not_available']).optional(),
});

// Marketplace view preferences
export const viewPreferencesSchema = z.object({
  layout: z.enum(['grid', 'list']).default('grid'),
  itemsPerPage: z.number().min(6).max(50).default(12),
  showFilters: z.boolean().default(true),
  showAdvancedFilters: z.boolean().default(false),
  sortBy: z
    .enum(['newest', 'oldest', 'budget', 'price', 'rating', 'relevance'])
    .default('newest'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Export types
export type MarketplaceFilters = z.infer<typeof marketplaceFilterSchema>;
export type JobFilters = z.infer<typeof jobFiltersSchema>;
export type PackageFilters = z.infer<typeof packageFiltersSchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type AdvancedSearch = z.infer<typeof advancedSearchSchema>;
export type ViewPreferences = z.infer<typeof viewPreferencesSchema>;

// Filter validation functions
export const validateMarketplaceFilters = (
  filters: unknown
): MarketplaceFilters => {
  return marketplaceFilterSchema.parse(filters);
};

export const validateJobFilters = (filters: unknown): JobFilters => {
  return jobFiltersSchema.parse(filters);
};

export const validatePackageFilters = (filters: unknown): PackageFilters => {
  return packageFiltersSchema.parse(filters);
};

export const validateSearchQuery = (query: unknown): SearchQuery => {
  return searchQuerySchema.parse(query);
};

export const validateAdvancedSearch = (search: unknown): AdvancedSearch => {
  return advancedSearchSchema.parse(search);
};

export const validateViewPreferences = (
  preferences: unknown
): ViewPreferences => {
  return viewPreferencesSchema.parse(preferences);
};

// Default values
export const defaultFilters: MarketplaceFilters = {
  page: 1,
  limit: 12,
  sortBy: 'newest',
  sortOrder: 'desc',
};

export const defaultJobFilters: JobFilters = {
  ...defaultFilters,
  budgetType: undefined,
  deadline: undefined,
};

export const defaultPackageFilters: PackageFilters = {
  ...defaultFilters,
  deliveryTime: undefined,
  rating: undefined,
};

export const defaultViewPreferences: ViewPreferences = {
  layout: 'grid',
  itemsPerPage: 12,
  showFilters: true,
  showAdvancedFilters: false,
  sortBy: 'newest',
  sortOrder: 'desc',
};
