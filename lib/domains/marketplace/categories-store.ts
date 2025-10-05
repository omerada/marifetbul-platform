import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  Category,
  CategoryFilters,
  CategorySearchResult,
  CategoryStore,
  DEFAULT_CATEGORY_FILTERS,
} from '@/types/business/features/marketplace-categories';
import {
  MARKETPLACE_CATEGORIES,
  FEATURED_CATEGORIES,
  TRENDING_CATEGORIES,
  PLATFORM_STATS,
  getCategoryById,
  getPopularCategories,
} from '@/lib/domains/marketplace/categories-data';

// ==========================================
// MARKETPLACE CATEGORIES STORE (ZUSTAND)
// ==========================================

export const useCategoryStore = create<CategoryStore>()(
  devtools(
    (set, get) => ({
      // ===== STATE =====
      categories: MARKETPLACE_CATEGORIES, // Initialize with data
      featuredCategories: FEATURED_CATEGORIES, // Initialize with data
      searchResults: null,
      filters: DEFAULT_CATEGORY_FILTERS,
      loading: false,
      error: null,
      searchTerm: '',
      selectedCategory: null,
      platformStats: PLATFORM_STATS,

      // ===== ACTIONS =====

      // Fetch all categories
      fetchCategories: async () => {
        set({ loading: true, error: null });
        try {
          // Simulate API call - replace with actual API
          await new Promise((resolve) => setTimeout(resolve, 500));
          set({
            categories: MARKETPLACE_CATEGORIES,
            loading: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Kategoriler yüklenirken hata oluştu',
            loading: false,
          });
        }
      },

      // Fetch featured categories
      fetchFeaturedCategories: async () => {
        set({ loading: true, error: null });
        try {
          await new Promise((resolve) => setTimeout(resolve, 300));
          set({
            featuredCategories: FEATURED_CATEGORIES,
            loading: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Öne çıkan kategoriler yüklenirken hata oluştu',
            loading: false,
          });
        }
      },

      // Search categories
      searchCategories: async (term: string) => {
        set({ loading: true, error: null, searchTerm: term });
        try {
          await new Promise((resolve) => setTimeout(resolve, 300));

          const searchLower = term.toLowerCase();
          const filteredCategories = MARKETPLACE_CATEGORIES.filter(
            (category) =>
              category.title.toLowerCase().includes(searchLower) ||
              category.description.toLowerCase().includes(searchLower) ||
              category.topSkills.some((skill) =>
                skill.toLowerCase().includes(searchLower)
              ) ||
              category.popularServices.some((service) =>
                service.toLowerCase().includes(searchLower)
              )
          );

          const filteredSubcategories = MARKETPLACE_CATEGORIES.flatMap(
            (category) =>
              category.subcategories.filter(
                (sub) =>
                  sub.name.toLowerCase().includes(searchLower) ||
                  sub.description.toLowerCase().includes(searchLower)
              )
          );

          const suggestions = [
            ...new Set([
              ...MARKETPLACE_CATEGORIES.flatMap((cat) => cat.topSkills),
              ...MARKETPLACE_CATEGORIES.flatMap((cat) => cat.popularServices),
            ]),
          ]
            .filter((item) => item.toLowerCase().includes(searchLower))
            .slice(0, 5);

          const searchResults: CategorySearchResult = {
            categories: filteredCategories,
            subcategories: filteredSubcategories,
            totalResults:
              filteredCategories.length + filteredSubcategories.length,
            searchTime: 0.3,
            suggestions,
          };

          set({
            searchResults,
            loading: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Arama sırasında hata oluştu',
            loading: false,
          });
        }
      },

      // Update filters
      updateFilters: (newFilters: Partial<CategoryFilters>) => {
        const currentFilters = get().filters;
        const updatedFilters = { ...currentFilters, ...newFilters };
        set({ filters: updatedFilters });
      },

      // Reset filters
      resetFilters: () => {
        set({ filters: DEFAULT_CATEGORY_FILTERS });
      },

      // Set selected category
      setSelectedCategory: (category: Category | null) => {
        set({ selectedCategory: category });
      },

      // Fetch platform statistics
      fetchPlatformStats: async () => {
        try {
          await new Promise((resolve) => setTimeout(resolve, 200));
          set({ platformStats: PLATFORM_STATS });
        } catch (error) {
          console.error('Platform istatistikleri yüklenirken hata:', error);
        }
      },

      // ===== COMPUTED/DERIVED STATE =====

      // Get filtered categories based on current filters
      getFilteredCategories: () => {
        const { categories, filters } = get();
        let filtered = [...categories];

        // Search filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filtered = filtered.filter(
            (category) =>
              category.title.toLowerCase().includes(searchLower) ||
              category.description.toLowerCase().includes(searchLower) ||
              category.topSkills.some((skill) =>
                skill.toLowerCase().includes(searchLower)
              )
          );
        }

        // Featured filter
        if (filters.featured) {
          filtered = filtered.filter((category) => category.featured);
        }

        // Trending filter
        if (filters.trending) {
          filtered = filtered.filter((category) => category.trending);
        }

        // Price range filter
        if (filters.priceRange) {
          filtered = filtered.filter(
            (category) =>
              category.averagePrice >= (filters.priceRange?.min || 0) &&
              category.averagePrice <= (filters.priceRange?.max || Infinity)
          );
        }

        // Service count filter
        if (filters.serviceCountRange) {
          filtered = filtered.filter(
            (category) =>
              category.serviceCount >= (filters.serviceCountRange?.min || 0) &&
              category.serviceCount <=
                (filters.serviceCountRange?.max || Infinity)
          );
        }

        // Sorting
        switch (filters.sortBy) {
          case 'alphabetical':
            filtered.sort((a, b) => a.title.localeCompare(b.title, 'tr'));
            break;
          case 'serviceCount':
            filtered.sort((a, b) => b.serviceCount - a.serviceCount);
            break;
          case 'priceAsc':
            filtered.sort((a, b) => a.averagePrice - b.averagePrice);
            break;
          case 'priceDesc':
            filtered.sort((a, b) => b.averagePrice - a.averagePrice);
            break;
          case 'trending':
            filtered.sort((a, b) => {
              if (a.trending && !b.trending) return -1;
              if (!a.trending && b.trending) return 1;
              return b.serviceCount - a.serviceCount;
            });
            break;
          case 'popular':
          default:
            filtered.sort((a, b) => b.serviceCount - a.serviceCount);
            break;
        }

        return filtered;
      },

      // Get category by ID
      getCategoryById: (id: string) => {
        return getCategoryById(id);
      },

      // Get trending categories
      getTrendingCategories: () => {
        return TRENDING_CATEGORIES;
      },

      // Get popular categories
      getPopularCategories: () => {
        return getPopularCategories();
      },
    }),
    {
      name: 'marketplace-categories-store',
    }
  )
);

// ===== SELECTOR HOOKS =====

// Get categories with loading state
export const useCategories = () => {
  const categories = useCategoryStore((state) => state.categories);
  const loading = useCategoryStore((state) => state.loading);
  const error = useCategoryStore((state) => state.error);
  const fetchCategories = useCategoryStore((state) => state.fetchCategories);

  return { categories, loading, error, fetchCategories };
};

// Get filtered categories
export const useFilteredCategories = () => {
  const getFilteredCategories = useCategoryStore(
    (state) => state.getFilteredCategories
  );
  const filters = useCategoryStore((state) => state.filters);
  const updateFilters = useCategoryStore((state) => state.updateFilters);
  const resetFilters = useCategoryStore((state) => state.resetFilters);

  return {
    categories: getFilteredCategories(),
    filters,
    updateFilters,
    resetFilters,
  };
};

// Get search functionality
export const useCategorySearch = () => {
  const searchTerm = useCategoryStore((state) => state.searchTerm);
  const searchResults = useCategoryStore((state) => state.searchResults);
  const loading = useCategoryStore((state) => state.loading);
  const searchCategories = useCategoryStore((state) => state.searchCategories);

  return {
    searchTerm,
    searchResults,
    loading,
    searchCategories,
  };
};

// Get featured categories
export const useFeaturedCategories = () => {
  const featuredCategories = useCategoryStore(
    (state) => state.featuredCategories
  );
  const loading = useCategoryStore((state) => state.loading);
  const fetchFeaturedCategories = useCategoryStore(
    (state) => state.fetchFeaturedCategories
  );

  return { featuredCategories, loading, fetchFeaturedCategories };
};

// Get platform statistics
export const usePlatformStats = () => {
  const platformStats = useCategoryStore((state) => state.platformStats);
  const fetchPlatformStats = useCategoryStore(
    (state) => state.fetchPlatformStats
  );

  return { platformStats, fetchPlatformStats };
};

// Get selected category
export const useSelectedCategory = () => {
  const selectedCategory = useCategoryStore((state) => state.selectedCategory);
  const setSelectedCategory = useCategoryStore(
    (state) => state.setSelectedCategory
  );

  return { selectedCategory, setSelectedCategory };
};
