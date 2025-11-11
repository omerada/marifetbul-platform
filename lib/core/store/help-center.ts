import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  HelpCategory,
  HelpArticle,
  ArticleRatingFormData,
  PaginationMeta,
} from '@/types';
import type { ArticleSearchFormData } from '@/lib/core/validations/support';
import logger from '@/lib/infrastructure/monitoring/logger';

// Base types for async state
interface BaseAsyncState {
  isLoading: boolean;
  error: string | null;
}

interface HelpCenterState extends BaseAsyncState {
  // Categories
  categories: HelpCategory[];
  categoriesLoading: boolean;
  categoriesError: string | null;

  // Articles
  articles: HelpArticle[];
  articlesLoading: boolean;
  articlesError: string | null;
  articlesPagination: PaginationMeta | null;

  // Featured Articles
  featuredArticles: HelpArticle[];
  featuredLoading: boolean;

  // Article Detail
  currentArticle: HelpArticle | null;
  currentArticleLoading: boolean;
  currentArticleError: string | null;

  // Search
  searchResults: HelpArticle[];
  searchLoading: boolean;
  searchError: string | null;
  searchPagination: PaginationMeta | null;
  lastSearchQuery: string;

  // Popular/Trending
  popularArticles: HelpArticle[];
  recentlyViewed: HelpArticle[];
}

interface HelpCenterActions {
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
  clearSearchResults: () => void;
  clearError: (
    type: 'categories' | 'articles' | 'currentArticle' | 'search'
  ) => void;
}

type HelpCenterStore = HelpCenterState & HelpCenterActions;

export const useHelpCenterStore = create<HelpCenterStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      categories: [],
      categoriesLoading: false,
      categoriesError: null,

      articles: [],
      articlesLoading: false,
      articlesError: null,
      articlesPagination: null,

      featuredArticles: [],
      featuredLoading: false,

      currentArticle: null,
      currentArticleLoading: false,
      currentArticleError: null,

      searchResults: [],
      searchLoading: false,
      searchError: null,
      searchPagination: null,
      lastSearchQuery: '',

      popularArticles: [],
      recentlyViewed: [],

      // Actions
      fetchCategories: async () => {
        set({ categoriesLoading: true, categoriesError: null });

        try {
          const response = await fetch('/api/v1/help/categories');
          const result = await response.json();

          if (result.success) {
            set({
              categories: result.data,
              categoriesLoading: false,
            });
          } else {
            set({
              categoriesError:
                result.error || 'Kategoriler yüklenirken hata oluştu',
              categoriesLoading: false,
            });
          }
        } catch (error) {
          logger.error(
            'Failed to fetch categories',
            error
          );
          set({
            categoriesError: 'Ağ hatası: Kategoriler yüklenemedi',
            categoriesLoading: false,
          });
        }
      },

      fetchArticles: async (params) => {
        set({ articlesLoading: true, articlesError: null });

        try {
          const searchParams = new URLSearchParams();

          if (params?.categoryId)
            searchParams.append('category', params.categoryId);
          if (params?.query) searchParams.append('search', params.query);
          if (params?.featured !== undefined)
            searchParams.append('featured', String(params.featured));
          if (params?.language)
            searchParams.append('language', params.language);
          if (params?.page) searchParams.append('page', String(params.page));
          if (params?.limit) searchParams.append('limit', String(params.limit));
          if (params?.sortBy) searchParams.append('sortBy', params.sortBy);

          const response = await fetch(`/api/v1/help/articles?${searchParams}`);
          const result = await response.json();

          if (result.success) {
            set({
              articles: result.data,
              articlesPagination: result.pagination,
              articlesLoading: false,
            });
          } else {
            set({
              articlesError:
                result.error || 'Makaleler yüklenirken hata oluştu',
              articlesLoading: false,
            });
          }
        } catch (error) {
          logger.error(
            'Failed to fetch articles',
            error
          );
          set({
            articlesError: 'Ağ hatası: Makaleler yüklenemedi',
            articlesLoading: false,
          });
        }
      },

      fetchFeaturedArticles: async () => {
        set({ featuredLoading: true });

        try {
          const response = await fetch(
            '/api/v1/help/articles?featured=true&limit=6'
          );
          const result = await response.json();

          if (result.success) {
            set({
              featuredArticles: result.data,
              featuredLoading: false,
            });
          } else {
            set({ featuredLoading: false });
          }
        } catch (error) {
          logger.error(
            'Failed to fetch featured articles',
            error
          );
          set({ featuredLoading: false });
        }
      },

      fetchArticleById: async (id: string) => {
        set({ currentArticleLoading: true, currentArticleError: null });

        try {
          const response = await fetch(`/api/v1/help/articles/${id}`);
          const result = await response.json();

          if (result.success) {
            set({
              currentArticle: result.data,
              currentArticleLoading: false,
            });

            // Add to recently viewed
            get().addToRecentlyViewed(result.data);
          } else {
            set({
              currentArticleError: result.error || 'Makale bulunamadı',
              currentArticleLoading: false,
            });
          }
        } catch (error) {
          logger.error(
            'Failed to fetch article by ID',
            error
          );
          set({
            currentArticleError: 'Ağ hatası: Makale yüklenemedi',
            currentArticleLoading: false,
          });
        }
      },

      searchArticles: async (query: string, filters) => {
        set({
          searchLoading: true,
          searchError: null,
          lastSearchQuery: query,
        });

        try {
          const searchParams = new URLSearchParams();
          searchParams.append('search', query);

          if (filters?.categoryId)
            searchParams.append('category', filters.categoryId);
          if (filters?.language)
            searchParams.append('language', filters.language);
          if (filters?.page) searchParams.append('page', String(filters.page));
          if (filters?.limit)
            searchParams.append('limit', String(filters.limit));
          if (filters?.sortBy) searchParams.append('sortBy', filters.sortBy);

          const response = await fetch(`/api/v1/help/articles?${searchParams}`);
          const result = await response.json();

          if (result.success) {
            set({
              searchResults: result.data,
              searchPagination: result.pagination,
              searchLoading: false,
            });
          } else {
            set({
              searchError: result.error || 'Arama yapılırken hata oluştu',
              searchLoading: false,
            });
          }
        } catch (error) {
          logger.error(
            'Failed to search articles',
            error
          );
          set({
            searchError: 'Ağ hatası: Arama yapılamadı',
            searchLoading: false,
          });
        }
      },

      rateArticle: async (data: ArticleRatingFormData) => {
        try {
          const response = await fetch(
            `/api/v1/help/articles/${data.articleId}/rating`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            }
          );

          const result = await response.json();

          if (result.success && get().currentArticle?.id === data.articleId) {
            // Update current article rating
            set((state) => ({
              currentArticle: state.currentArticle
                ? {
                    ...state.currentArticle,
                    rating: result.data.averageRating,
                    ratingCount: result.data.ratingCount,
                  }
                : null,
            }));
          }
        } catch (error) {
          logger.error(
            'Rating submission failed',
            error
          );
        }
      },

      addToRecentlyViewed: (article: HelpArticle) => {
        set((state) => {
          const filtered = state.recentlyViewed.filter(
            (a) => a.id !== article.id
          );
          return {
            recentlyViewed: [article, ...filtered].slice(0, 10), // Keep last 10
          };
        });
      },

      clearCurrentArticle: () => {
        set({
          currentArticle: null,
          currentArticleError: null,
        });
      },

      clearSearchResults: () => {
        set({
          searchResults: [],
          searchError: null,
          searchPagination: null,
          lastSearchQuery: '',
        });
      },

      clearError: (type) => {
        switch (type) {
          case 'categories':
            set({ categoriesError: null });
            break;
          case 'articles':
            set({ articlesError: null });
            break;
          case 'currentArticle':
            set({ currentArticleError: null });
            break;
          case 'search':
            set({ searchError: null });
            break;
        }
      },
    }),
    {
      name: 'help-center-store',
    }
  )
);
