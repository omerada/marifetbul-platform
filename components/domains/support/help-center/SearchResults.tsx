'use client';

import React from 'react';
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Tag,
  X,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { useHelpCenter } from '@/hooks';
import { ArticleCard } from './ArticleCard';
import { cn } from '@/lib/utils';
import type { HelpArticle, HelpCategory } from '@/types';

interface SearchResultsProps {
  query?: string;
  category?: HelpCategory;
  onQueryChange?: (query: string) => void;
  className?: string;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  query = '',
  category,
  onQueryChange,
  className,
}) => {
  const {
    searchResults,
    searchLoading,
    searchError,
    searchPagination,
    searchArticles,
    categories,
    fetchCategories,
  } = useHelpCenter();

  const [searchQuery, setSearchQuery] = React.useState(query);
  const [selectedCategory, setSelectedCategory] = React.useState<string>(
    category?.id || ''
  );
  const [sortBy, setSortBy] = React.useState<
    'relevance' | 'date' | 'popularity' | 'rating'
  >('relevance');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = React.useState(false);

  // Load categories on mount
  React.useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [categories.length, fetchCategories]);

  // Perform search when query or filters change
  const performSearch = React.useCallback(async () => {
    try {
      await searchArticles(searchQuery, {
        categoryId: selectedCategory || undefined,
        sortBy:
          sortBy === 'relevance'
            ? undefined
            : sortBy === 'popularity'
              ? 'views'
              : sortBy,
        page: 1,
        limit: 20,
      });
    } catch (error) {
      console.error('Search failed:', error);
    }
  }, [searchQuery, selectedCategory, sortBy, searchArticles]);

  React.useEffect(() => {
    if (searchQuery.trim() || selectedCategory) {
      performSearch();
    }
  }, [searchQuery, selectedCategory, sortBy, performSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onQueryChange) {
      onQueryChange(searchQuery);
    }
    performSearch();
  };

  const handleClearFilter = (filterType: string) => {
    switch (filterType) {
      case 'category':
        setSelectedCategory('');
        break;
      case 'query':
        setSearchQuery('');
        if (onQueryChange) {
          onQueryChange('');
        }
        break;
    }
  };

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSortBy('relevance');
    if (onQueryChange) {
      onQueryChange('');
    }
  };

  const getSortText = () => {
    switch (sortBy) {
      case 'date':
        return 'En Yeni';
      case 'popularity':
        return 'Popülerlik';
      case 'rating':
        return 'En İyi Puanlı';
      default:
        return 'İlgililik';
    }
  };

  const getResultsText = () => {
    const total = searchPagination?.total || 0;
    if (total === 0) return 'Sonuç bulunamadı';
    if (total === 1) return '1 sonuç';
    return `${total} sonuç`;
  };

  const renderArticle = (article: HelpArticle) => {
    if (viewMode === 'list') {
      return (
        <ArticleCard
          key={article.id}
          article={article}
          variant="compact"
          showCategory
          showStats
        />
      );
    }

    return (
      <ArticleCard
        key={article.id}
        article={article}
        variant="default"
        showCategory
        showAuthor
        showStats
      />
    );
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Search Header */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Yardım makalelerinde ara..."
              className="w-full rounded-lg border border-gray-300 py-3 pr-4 pl-12 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={searchLoading}
              className="absolute top-1/2 right-2 -translate-y-1/2 transform rounded-md bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {searchLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Ara'
              )}
            </button>
          </div>
        </form>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left Controls */}
          <div className="flex items-center gap-3">
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
                showFilters
                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              )}
            >
              <Filter className="h-4 w-4" />
              Filtreler
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  showFilters && 'rotate-180'
                )}
              />
            </button>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tüm Kategoriler</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
              title={`Sıralama: ${getSortText()}`}
            >
              <option value="relevance">İlgililik</option>
              <option value="date">En Yeni</option>
              <option value="popularity">Popülerlik</option>
              <option value="rating">En İyi Puanlı</option>
            </select>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Results Count */}
            <span className="text-sm text-gray-600">{getResultsText()}</span>

            {/* View Mode */}
            <div className="flex items-center rounded-lg border border-gray-300">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'rounded-l-lg p-2 transition-colors',
                  viewMode === 'grid'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'rounded-r-lg p-2 transition-colors',
                  viewMode === 'list'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Applied Filters */}
        {(searchQuery || selectedCategory) && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
            <span className="text-sm text-gray-600">Aktif filtreler:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                <Search className="h-3 w-3" />
                &quot;{searchQuery}&quot;
                <button
                  onClick={() => handleClearFilter('query')}
                  className="ml-1 hover:text-blue-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
                <Tag className="h-3 w-3" />
                {categories.find((c) => c.id === selectedCategory)?.name}
                <button
                  onClick={() => handleClearFilter('category')}
                  className="ml-1 hover:text-green-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <button
              onClick={handleClearAllFilters}
              className="text-sm text-gray-500 underline hover:text-gray-700"
            >
              Tümünü Temizle
            </button>
          </div>
        )}
      </div>

      {/* Search Results */}
      <div className="space-y-6">
        {searchLoading && (
          <div className="py-12 text-center">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Aranıyor...</p>
          </div>
        )}

        {searchError && (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <X className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Arama Hatası
            </h3>
            <p className="mb-4 text-gray-600">
              Arama yapılırken bir hata oluştu. Lütfen tekrar deneyin.
            </p>
            <button
              onClick={performSearch}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Tekrar Dene
            </button>
          </div>
        )}

        {!searchLoading &&
          !searchError &&
          searchResults.length === 0 &&
          (searchQuery || selectedCategory) && (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                Sonuç Bulunamadı
              </h3>
              <p className="mb-4 text-gray-600">
                Aradığınız kriterlere uygun makale bulunamadı. Farklı kelimeler
                deneyin.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>• Yazım hatası kontrolü yapın</p>
                <p>• Daha genel terimler kullanın</p>
                <p>• Filtreleri temizleyin</p>
              </div>
            </div>
          )}

        {!searchLoading && !searchError && searchResults.length > 0 && (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {searchResults.map(renderArticle)}
              </div>
            ) : (
              <div className="space-y-4">
                {searchResults.map(renderArticle)}
              </div>
            )}

            {/* Pagination */}
            {searchPagination && searchPagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  disabled={!searchPagination.hasPrev}
                  className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Önceki
                </button>
                <span className="px-3 py-1 text-sm text-gray-600">
                  {searchPagination.page} / {searchPagination.totalPages}
                </span>
                <button
                  disabled={!searchPagination.hasNext}
                  className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Sonraki
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
