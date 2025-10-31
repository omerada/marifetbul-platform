/**
 * Category Transformer
 * Converts backend CategoryResponse to frontend Category
 *
 * Backend: id, name, slug, description, iconUrl, parentId, active, displayOrder, packageCount
 * Frontend: id, title, description, icon, iconColor, subcategories, serviceCount, averagePrice, etc.
 */

import type { Category as BackendCategory } from '@/lib/api/validators';
import type { Category as FrontendCategory } from '@/types/business/features/marketplace-categories';

/**
 * Default icon mapping by category slug
 */
const ICON_MAP: Record<string, string> = {
  teknoloji: 'Laptop',
  tasarim: 'Palette',
  yazilar: 'FileText',
  video: 'Video',
  muzik: 'Music',
  is: 'Briefcase',
  egitim: 'GraduationCap',
  danismanlik: 'UserCheck',
  default: 'Folder',
};

/**
 * Default icon color mapping
 */
const ICON_COLOR_MAP: Record<string, string> = {
  teknoloji: 'text-blue-600',
  tasarim: 'text-purple-600',
  yazilar: 'text-green-600',
  video: 'text-red-600',
  muzik: 'text-pink-600',
  is: 'text-indigo-600',
  egitim: 'text-yellow-600',
  danismanlik: 'text-teal-600',
  default: 'text-gray-600',
};

/**
 * Transform backend category to frontend category
 */
export function transformCategory(backend: BackendCategory): FrontendCategory {
  const icon = ICON_MAP[backend.slug] || ICON_MAP.default;
  const iconColor = ICON_COLOR_MAP[backend.slug] || ICON_COLOR_MAP.default;

  return {
    id: backend.id.toString(),
    title: backend.name,
    description: backend.description || '',
    shortDescription: backend.description?.substring(0, 100) || undefined,
    icon,
    iconColor,
    subcategories: [], // Will be populated separately if needed
    serviceCount: backend.packageCount || 0,
    averagePrice: 0, // Not available in backend response
    priceRange: {
      min: 0,
      max: 0,
    },
    topSkills: [],
    popularServices: [],
    trending: false,
    featured: false,
    order: backend.displayOrder,
    slug: backend.slug,
    metadata: {
      seoTitle: backend.name,
      seoDescription: backend.description || '',
      keywords: [],
      lastUpdated: new Date().toISOString(),
      isActive: backend.active,
    },
    stats: {
      totalFreelancers: 0,
      completedProjects: 0,
      averageRating: 0,
      responseTime: 0,
      successRate: 0,
      monthlyGrowth: 0,
    },
  };
}

/**
 * Transform array of backend categories
 */
export function transformCategories(
  backend: BackendCategory[]
): FrontendCategory[] {
  return backend.map(transformCategory);
}

/**
 * Transform and filter only active categories
 */
export function transformActiveCategories(
  backend: BackendCategory[]
): FrontendCategory[] {
  return backend
    .filter((cat) => cat.active)
    .map(transformCategory)
    .sort((a, b) => a.order - b.order);
}
