'use client';

import React, { useCallback } from 'react';
import { useHelpCenterStore } from '@/lib/core/store/help-center';
import type { HelpCategory, HelpArticle, PaginationMeta } from '@/types';
import type {
  ArticleRatingFormData,
  ArticleSearchFormData,
} from '@/lib/core/validations/support';

export interface UseHelpCenterReturn {
  // Categories
  categories: HelpCategory[];
  categoriesLoading: boolean;
  categoriesError: string | null;

  // Articles
  articles: HelpArticle[];
  articlesLoading: boolean;
  articlesError: string | null;
  articlesPagination: PaginationMeta | null;

  // Current Article
  currentArticle: HelpArticle | null;
  currentArticleLoading: boolean;
  currentArticleError: string | null;

  // Search
  searchResults: HelpArticle[];
  searchLoading: boolean;
  searchError: string | null;
  searchPagination: PaginationMeta | null;

  // Featured/Popular
  featuredArticles: HelpArticle[];
  featuredLoading: boolean;
  popularArticles: HelpArticle[];
  recentlyViewed: HelpArticle[];

  // Actions
  fetchCategories: () => Promise<void>;
  fetchArticles: (params?: ArticleSearchFormData) => Promise<void>;
  fetchFeaturedArticles: () => Promise<void>;
  fetchArticleById: (id: string) => Promise<void>;
  searchArticles: (
    query: string,
    filters?: Partial<ArticleSearchFormData>
  ) => Promise<void>;
  rateArticle: (data: ArticleRatingFormData) => Promise<void>;
  addToRecentlyViewed: (article: HelpArticle) => void;
  clearCurrentArticle: () => void;
  clearError: (
    type: 'categories' | 'articles' | 'currentArticle' | 'search'
  ) => void;
}

/**
 * Custom hook for managing help center data and operations
 *
 * Provides a clean interface to the help center store with:
 * - Category management
 * - Article CRUD operations
 * - Search functionality
 * - Rating system
 * - Error handling
 *
 * @example
 * ```tsx
 * function HelpCenter() {
 *   const {
 *     categories,
 *     articles,
 *     fetchCategories,
 *     searchArticles,
 *     rateArticle
 *   } = useHelpCenter();
 *
 *   useEffect(() => {
 *     fetchCategories();
 *   }, [fetchCategories]);
 *
 *   return (
 *     <div>
 *       {categories.map(category => (
 *         <CategoryCard key={category.id} category={category} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export const useHelpCenter = (): UseHelpCenterReturn => {
  const store = useHelpCenterStore();

  const fetchCategories = useCallback(async () => {
    await store.fetchCategories();
  }, [store]);

  const fetchArticles = useCallback(
    async (params?: ArticleSearchFormData) => {
      await store.fetchArticles(params);
    },
    [store]
  );

  const fetchFeaturedArticles = useCallback(async () => {
    await store.fetchFeaturedArticles();
  }, [store]);

  const fetchArticleById = useCallback(
    async (id: string) => {
      await store.fetchArticleById(id);
    },
    [store]
  );

  const searchArticles = useCallback(
    async (query: string, filters?: Partial<ArticleSearchFormData>) => {
      await store.searchArticles(query, filters);
    },
    [store]
  );

  const rateArticle = useCallback(
    async (data: ArticleRatingFormData) => {
      await store.rateArticle(data);
    },
    [store]
  );

  const addToRecentlyViewed = useCallback(
    (article: HelpArticle) => {
      store.addToRecentlyViewed(article);
    },
    [store]
  );

  const clearCurrentArticle = useCallback(() => {
    store.clearCurrentArticle();
  }, [store]);

  const clearError = useCallback(
    (type: 'categories' | 'articles' | 'currentArticle' | 'search') => {
      store.clearError(type);
    },
    [store]
  );

  return {
    // Categories
    categories: store.categories,
    categoriesLoading: store.categoriesLoading,
    categoriesError: store.categoriesError,

    // Articles
    articles: store.articles,
    articlesLoading: store.articlesLoading,
    articlesError: store.articlesError,
    articlesPagination: store.articlesPagination,

    // Current Article
    currentArticle: store.currentArticle,
    currentArticleLoading: store.currentArticleLoading,
    currentArticleError: store.currentArticleError,

    // Search
    searchResults: store.searchResults,
    searchLoading: store.searchLoading,
    searchError: store.searchError,
    searchPagination: store.searchPagination,

    // Featured/Popular
    featuredArticles: store.featuredArticles,
    featuredLoading: store.featuredLoading,
    popularArticles: store.popularArticles,
    recentlyViewed: store.recentlyViewed,

    // Actions
    fetchCategories,
    fetchArticles,
    fetchFeaturedArticles,
    fetchArticleById,
    searchArticles,
    rateArticle,
    addToRecentlyViewed,
    clearCurrentArticle,
    clearError,
  };
};

/**
 * Hook for managing a specific help article
 * Automatically fetches and manages a single article
 *
 * @param articleId - The ID of the article to manage
 * @param autoFetch - Whether to automatically fetch the article on mount
 * @param autoTrack - Whether to automatically add to recently viewed
 */
export const useHelpArticle = (
  articleId: string,
  autoFetch = true,
  autoTrack = true
) => {
  const {
    currentArticle,
    currentArticleLoading,
    currentArticleError,
    fetchArticleById,
    addToRecentlyViewed,
    rateArticle,
    clearCurrentArticle,
    clearError,
  } = useHelpCenter();

  const loadArticle = useCallback(async () => {
    if (!articleId) return;

    await fetchArticleById(articleId);

    if (autoTrack && currentArticle) {
      addToRecentlyViewed(currentArticle);
    }
  }, [
    articleId,
    fetchArticleById,
    addToRecentlyViewed,
    autoTrack,
    currentArticle,
  ]);

  // Auto-fetch on mount or articleId change
  React.useEffect(() => {
    if (autoFetch && articleId) {
      loadArticle();
    }

    // Cleanup on unmount
    return () => {
      clearCurrentArticle();
    };
  }, [articleId, autoFetch, loadArticle, clearCurrentArticle]);

  return {
    article: currentArticle,
    loading: currentArticleLoading,
    error: currentArticleError,
    reload: loadArticle,
    rateArticle,
    clearError: () => clearError('currentArticle'),
  };
};

/**
 * Hook for help center search functionality
 * Provides debounced search with filters
 */
export const useHelpCenterSearch = (debounceMs = 300) => {
  const {
    searchResults,
    searchLoading,
    searchError,
    searchPagination,
    searchArticles,
    clearError,
  } = useHelpCenter();

  const [query, setQuery] = React.useState('');
  const [debouncedQuery, setDebouncedQuery] = React.useState('');

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Perform search when debounced query changes
  React.useEffect(() => {
    if (debouncedQuery.trim()) {
      searchArticles(debouncedQuery);
    }
  }, [debouncedQuery, searchArticles]);

  const search = useCallback(
    (searchQuery: string, filters?: Partial<ArticleSearchFormData>) => {
      setQuery(searchQuery);
      return searchArticles(searchQuery, filters);
    },
    [searchArticles]
  );

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
  }, []);

  return {
    query,
    setQuery,
    results: searchResults,
    loading: searchLoading,
    error: searchError,
    pagination: searchPagination,
    search,
    clearSearch,
    clearError: () => clearError('search'),
  };
};
