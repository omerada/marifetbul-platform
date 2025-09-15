'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, Filter, SortAsc, SortDesc } from 'lucide-react';
import { useHelpCenter } from '@/hooks';
import { ArticleCard } from './ArticleCard';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface SearchResultsProps {
  initialQuery?: string;
}

export function SearchResults({ initialQuery = '' }: SearchResultsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    searchResults,
    searchLoading,
    searchError,
    searchPagination,
    searchArticles,
    categories,
  } = useHelpCenter();

  const [query, setQuery] = React.useState(
    initialQuery || searchParams.get('q') || ''
  );
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const [sortBy, setSortBy] = React.useState('relevance');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');

  const handleSearch = React.useCallback(
    async (searchQuery: string = query) => {
      if (!searchQuery.trim()) return;

      const filters = {
        categoryId: selectedCategory || undefined,
        sortBy: (sortBy === 'relevance' ? undefined : sortBy) as
          | 'views'
          | 'rating'
          | 'date'
          | undefined,
      };

      await searchArticles(searchQuery, filters);

      // Update URL
      const params = new URLSearchParams();
      params.set('q', searchQuery);
      if (selectedCategory) params.set('category', selectedCategory);
      if (sortBy !== 'relevance') params.set('sort', sortBy);
      if (sortOrder !== 'desc') params.set('order', sortOrder);

      router.replace(`/help/search?${params.toString()}`);
    },
    [query, selectedCategory, sortBy, sortOrder, searchArticles, router]
  );

  React.useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery && urlQuery !== query) {
      setQuery(urlQuery);
      handleSearch(urlQuery);
    }
  }, [searchParams, query, handleSearch]);

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSortBy('relevance');
    setSortOrder('desc');
    handleSearch();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const sortOptions = [
    { value: 'relevance', label: 'İlgi Düzeyi' },
    { value: 'views', label: 'Görüntülenme' },
    { value: 'rating', label: 'Puan' },
    { value: 'updated', label: 'Güncellenme' },
    { value: 'created', label: 'Oluşturulma' },
  ];

  const hasFilters =
    selectedCategory || sortBy !== 'relevance' || sortOrder !== 'desc';

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main Search Bar */}
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Makalelerde ara..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pr-4 pl-10"
            />
            <Button
              type="submit"
              className="absolute top-1/2 right-2 -translate-y-1/2"
              size="sm"
            >
              Ara
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="min-w-0 flex-1">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <option value="">Tüm Kategoriler</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="min-w-0 flex-1">
              <Select value={sortBy} onValueChange={setSortBy}>
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-2"
            >
              {sortOrder === 'asc' ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
              {sortOrder === 'asc' ? 'Artan' : 'Azalan'}
            </Button>

            {hasFilters && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Filtreleri Temizle
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Results */}
      <div>
        {searchLoading ? (
          <Card className="p-8 text-center">
            <div className="text-gray-600">Aranıyor...</div>
          </Card>
        ) : searchError ? (
          <Card className="p-8 text-center">
            <div className="text-red-600">
              Arama sırasında bir hata oluştu: {searchError}
            </div>
          </Card>
        ) : searchResults.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="mb-4">
              <Search className="mx-auto h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Sonuç Bulunamadı
            </h3>
            <p className="text-gray-600">
              &quot;{query}&quot; için hiçbir makale bulunamadı. Farklı anahtar
              kelimeler deneyin.
            </p>
          </Card>
        ) : (
          <>
            {/* Results Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Arama Sonuçları
                </h2>
                <p className="text-gray-600">
                  &quot;{query}&quot; için{' '}
                  {searchPagination?.total || searchResults.length} sonuç
                  bulundu
                </p>
              </div>

              {hasFilters && (
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Filtre aktif</span>
                </div>
              )}
            </div>

            {/* Results Grid */}
            <div className="space-y-4">
              {searchResults.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  variant="compact"
                  showCategory={true}
                  showRating={true}
                />
              ))}
            </div>

            {/* Pagination */}
            {searchPagination && searchPagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center gap-2">
                  {searchPagination.hasPrev && (
                    <Button variant="outline" size="sm">
                      Önceki
                    </Button>
                  )}

                  <span className="px-4 py-2 text-sm text-gray-600">
                    {searchPagination.page} / {searchPagination.totalPages}
                  </span>

                  {searchPagination.hasNext && (
                    <Button variant="outline" size="sm">
                      Sonraki
                    </Button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
