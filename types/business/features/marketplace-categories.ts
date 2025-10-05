// ==========================================
// MARKETPLACE CATEGORIES TYPE DEFINITIONS
// ==========================================

export interface Category {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  icon: string; // Icon name as string for serialization
  iconColor: string;
  subcategories: SubCategory[];
  serviceCount: number;
  averagePrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  topSkills: string[];
  popularServices: string[];
  trending: boolean;
  featured: boolean;
  order: number;
  slug: string;
  metadata: CategoryMetadata;
  stats: CategoryStatistics;
}

export interface SubCategory {
  id: string;
  name: string;
  description: string;
  serviceCount: number;
  averagePrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  popularServices: string[];
  slug: string;
  trending?: boolean;
  parentCategoryId: string;
}

export interface CategoryMetadata {
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  ogImage?: string;
  lastUpdated: string;
  isActive: boolean;
}

export interface CategoryStatistics {
  totalFreelancers: number;
  completedProjects: number;
  averageRating: number;
  responseTime: number; // hours
  successRate: number; // percentage
  monthlyGrowth: number; // percentage
}

// Category Filter & Search Types
export interface CategoryFilters {
  search?: string;
  sortBy:
    | 'popular'
    | 'alphabetical'
    | 'serviceCount'
    | 'priceAsc'
    | 'priceDesc'
    | 'trending';
  priceRange?: {
    min: number;
    max: number;
  };
  serviceCountRange?: {
    min: number;
    max: number;
  };
  featured?: boolean;
  trending?: boolean;
  hasActiveFreelancers?: boolean;
}

export interface CategorySearchResult {
  categories: Category[];
  subcategories: SubCategory[];
  totalResults: number;
  searchTime: number;
  suggestions: string[];
}

// UI Component Props
export interface CategoryCardProps {
  category: Category;
  variant: 'default' | 'featured' | 'compact' | 'detailed';
  showStats: boolean;
  showSubcategories: boolean;
  onClick?: (categoryId: string) => void;
  className?: string;
}

export interface CategoryGridProps {
  categories: Category[];
  variant: 'grid' | 'list';
  columns: 1 | 2 | 3 | 4;
  showFilters: boolean;
  loading?: boolean;
  error?: string | null;
}

export interface CategoryFilterProps {
  filters: CategoryFilters;
  onFiltersChange: (filters: Partial<CategoryFilters>) => void;
  onReset: () => void;
  totalResults: number;
  loading?: boolean;
}

export interface CategorySearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onSearch: (term: string) => void;
  suggestions: string[];
  loading?: boolean;
  placeholder?: string;
}

// Store Types (Zustand)
export interface CategoryStore {
  // State
  categories: Category[];
  featuredCategories: Category[];
  searchResults: CategorySearchResult | null;
  filters: CategoryFilters;
  loading: boolean;
  error: string | null;
  searchTerm: string;
  selectedCategory: Category | null;

  // Statistics
  platformStats: PlatformStatistics;

  // Actions
  fetchCategories: () => Promise<void>;
  fetchFeaturedCategories: () => Promise<void>;
  searchCategories: (term: string) => Promise<void>;
  updateFilters: (filters: Partial<CategoryFilters>) => void;
  resetFilters: () => void;
  setSelectedCategory: (category: Category | null) => void;
  fetchPlatformStats: () => Promise<void>;

  // Computed/Derived State
  getFilteredCategories: () => Category[];
  getCategoryById: (id: string) => Category | undefined;
  getTrendingCategories: () => Category[];
  getPopularCategories: () => Category[];
}

export interface PlatformStatistics {
  totalCategories: number;
  totalSubcategories: number;
  totalFreelancers: number;
  totalProjects: number;
  averageProjectValue: number;
  successRate: number;
  monthlyGrowth: number;
  activeUsers: number;
}

// API Response Types
export interface CategoryListResponse {
  categories: Category[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: CategoryFilters;
}

export interface CategoryDetailResponse {
  category: Category;
  relatedCategories: Category[];
  topFreelancers: Array<{ id: string; name: string; rating: number }>; // Simplified freelancer type
  recentProjects: Array<{ id: string; title: string; completedAt: string }>; // Simplified project type
}

// SEO & Meta Types
export interface CategoryPageMeta {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  ogImage: string;
  structuredData: CategoryStructuredData;
}

export interface CategoryStructuredData {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  url: string;
  numberOfItems: number;
  provider: {
    '@type': string;
    name: string;
    url: string;
  };
}

// Animation & Motion Types
export interface CategoryAnimationVariants {
  hidden: {
    opacity: number;
    y: number;
    scale?: number;
  };
  visible: {
    opacity: number;
    y: number;
    scale?: number;
    transition?: {
      duration: number;
      delay?: number;
      ease?: string;
    };
  };
  hover: {
    scale: number;
    y: number;
    transition: {
      duration: number;
      ease: string;
    };
  };
}

export interface StaggerContainerVariants {
  hidden: {
    opacity: number;
  };
  visible: {
    opacity: number;
    transition: {
      staggerChildren: number;
      delayChildren?: number;
    };
  };
}

// Validation & Error Types
export interface CategoryValidationError {
  field: string;
  message: string;
  code: string;
}

export interface CategoryError {
  type: 'NETWORK_ERROR' | 'VALIDATION_ERROR' | 'NOT_FOUND' | 'SERVER_ERROR';
  message: string;
  details?: CategoryValidationError[];
  timestamp: string;
}

// Default Values & Constants
export const DEFAULT_CATEGORY_FILTERS: CategoryFilters = {
  sortBy: 'popular',
  featured: false,
  trending: false,
  hasActiveFreelancers: true,
};

export const CATEGORY_SORT_OPTIONS = [
  { value: 'popular', label: 'En Popüler' },
  { value: 'alphabetical', label: 'Alfabetik' },
  { value: 'serviceCount', label: 'Hizmet Sayısı' },
  { value: 'priceAsc', label: 'Fiyat (Düşük-Yüksek)' },
  { value: 'priceDesc', label: 'Fiyat (Yüksek-Düşük)' },
  { value: 'trending', label: 'Trend Kategoriler' },
] as const;

export const CATEGORY_GRID_COLUMNS = {
  mobile: 1,
  tablet: 2,
  desktop: 3,
  large: 4,
} as const;

export const CATEGORY_CARD_VARIANTS = [
  'default',
  'featured',
  'compact',
  'detailed',
] as const;

// Analytics Events
export interface CategoryAnalyticsEvent {
  event: string;
  categoryId?: string;
  categoryTitle?: string;
  searchTerm?: string;
  filters?: Partial<CategoryFilters>;
  source?: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
}

export type CategoryEventType =
  | 'category_view'
  | 'category_click'
  | 'category_search'
  | 'filter_apply'
  | 'filter_reset'
  | 'sort_change'
  | 'subcategory_expand'
  | 'cta_click';
