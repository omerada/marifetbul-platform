/**
 * CategoryCard Types
 *
 * Type definitions for category card components
 */

// ============================================================================
// Core Types
// ============================================================================

export type CategoryCardVariant =
  | 'default'
  | 'compact'
  | 'featured'
  | 'detailed';

export interface CategorySubcategory {
  id: string;
  name: string;
  serviceCount: number;
  averagePrice: number;
  popularServices?: string[];
}

export interface CategoryStats {
  averageRating: number;
  responseTime: number;
  completedJobs?: number;
  activeFreelancers?: number;
}

export interface CategoryPriceRange {
  min: number;
  max: number;
}

export interface Category {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  slug: string;
  icon: string;
  iconColor: string;
  serviceCount: number;
  averagePrice: number;
  popularServices: string[];
  topSkills: string[];
  subcategories: CategorySubcategory[];
  stats: CategoryStats;
  priceRange: CategoryPriceRange;
}

// ============================================================================
// Component Props
// ============================================================================

export interface CategoryCardProps {
  category: Category;
  variant?: CategoryCardVariant;
  showStats?: boolean;
  showSubcategories?: boolean;
  onClick?: (categoryId: string) => void;
  className?: string;
  isExpandable?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: (categoryId: string) => void;
  searchTerm?: string;
}

export interface CategoryHeaderProps {
  category: Category;
  variant: CategoryCardVariant;
  isExpandable?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export interface CategoryStatsProps {
  category: Category;
  variant: CategoryCardVariant;
  showStats: boolean;
}

export interface CategoryBadgeListProps {
  items: string[];
  maxItems?: number;
  variant?: 'default' | 'colored' | 'outlined';
  color?: string;
  title?: string;
  className?: string;
}

export interface CategorySubcategoryListProps {
  subcategories: CategorySubcategory[];
  expandedIds: Set<string>;
  onToggle: (subcategoryId: string, e: React.MouseEvent) => void;
  maxItems?: number;
}

export interface CategoryServiceListProps {
  services: string[];
  priceRange: CategoryPriceRange;
  totalCount: number;
  maxHeight?: string;
}

export interface CategoryActionsProps {
  categorySlug: string;
  variant: CategoryCardVariant;
}

export interface CategoryExpandedContentProps {
  category: Category;
  isExpanded: boolean;
}

// ============================================================================
// Hook Return Types
// ============================================================================

export interface UseCategoryExpansionReturn {
  isCardExpanded: boolean;
  expandedSubcategories: Set<string>;
  toggleCard: () => void;
  toggleSubcategory: (subcategoryId: string, e: React.MouseEvent) => void;
  setCardExpanded: (expanded: boolean) => void;
}
