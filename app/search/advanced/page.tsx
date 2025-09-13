'use client';

import React, { useState, useCallback } from 'react';
import { EnhancedSearchSystem } from '@/components/search/EnhancedSearchSystem';
import { SearchResultList } from '@/components/search/SearchResults';
import { SearchResult } from '@/types/search';
import { SearchAnalyticsDashboard } from '@/components/features/SearchAnalyticsDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import {
  Grid,
  List,
  BarChart3,
  Settings,
  Bookmark,
  Filter,
  SortAsc,
  Layout,
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface SearchMetrics {
  totalResults: number;
  searchTime: number;
  popularFilters: string[];
  relatedSearches: string[];
}

export default function AdvancedSearchPage() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchMetrics, setSearchMetrics] = useState<SearchMetrics | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'compact'>('list');
  const [sortBy, setSortBy] = useState<
    'relevance' | 'date' | 'rating' | 'price'
  >('relevance');
  const [activeTab] = useState('search');
  const [favoritedIds, setFavoritedIds] = useState<string[]>([]);

  const { showToast } = useToast();

  // Handle search results
  const handleSearchResults = useCallback((results: SearchResult[]) => {
    setSearchResults(results);
    setIsLoading(false);
  }, []);

  // Handle search metrics
  const handleSearchMetrics = useCallback((metrics: SearchMetrics) => {
    setSearchMetrics(metrics);
  }, []);

  // Handle favorite toggle
  const handleFavorite = useCallback(
    (id: string) => {
      setFavoritedIds((prev) =>
        prev.includes(id) ? prev.filter((fId) => fId !== id) : [...prev, id]
      );

      showToast(
        favoritedIds.includes(id)
          ? 'Favorilerden çıkarıldı'
          : 'Favorilere eklendi',
        'success'
      );
    },
    [favoritedIds, showToast]
  );

  // Handle share
  const handleShare = useCallback(
    (id: string) => {
      const result = searchResults.find((r) => r.id === id);
      if (result) {
        navigator.clipboard.writeText(
          `${window.location.origin}/search?id=${id}`
        );
        showToast(
          `${result.title} başlıklı ilan linki panoya kopyalandı.`,
          'success'
        );
      }
    },
    [searchResults, showToast]
  );

  // Handle contact
  const handleContact = useCallback(
    (id: string) => {
      const result = searchResults.find((r) => r.id === id);
      if (result) {
        showToast(
          `${result.title} için iletişim sayfasına yönlendiriliyorsunuz.`,
          'info'
        );
        // Navigate to contact page
        window.location.href = `/contact/${id}`;
      }
    },
    [searchResults, showToast]
  );

  // Handle view
  const handleView = useCallback(
    (id: string) => {
      const result = searchResults.find((r) => r.id === id);
      if (result) {
        // Navigate to detail page
        window.location.href = `/${result.type}s/${id}`;
      }
    },
    [searchResults]
  );

  // Sort results
  const sortedResults = React.useMemo(() => {
    if (!searchResults.length) return [];

    const sorted = [...searchResults];

    switch (sortBy) {
      case 'date':
        return sorted.sort(
          (a, b) =>
            new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
        );
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'price':
        return sorted.sort((a, b) => a.budget.min - b.budget.min);
      case 'relevance':
      default:
        return sorted;
    }
  }, [searchResults, sortBy]);

  // View mode component map
  const getResultComponent = () => {
    switch (viewMode) {
      case 'compact':
        return (
          <SearchResultList
            results={sortedResults}
            variant="compact"
            onFavorite={handleFavorite}
            onShare={handleShare}
            onContact={handleContact}
            onView={handleView}
            favoritedIds={favoritedIds}
            className="space-y-2"
          />
        );
      case 'grid':
        return (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <SearchResultList
              results={sortedResults}
              variant="default"
              onFavorite={handleFavorite}
              onShare={handleShare}
              onContact={handleContact}
              onView={handleView}
              favoritedIds={favoritedIds}
              className="contents"
            />
          </div>
        );
      case 'list':
      default:
        return (
          <SearchResultList
            results={sortedResults}
            variant="detailed"
            onFavorite={handleFavorite}
            onShare={handleShare}
            onContact={handleContact}
            onView={handleView}
            favoritedIds={favoritedIds}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Gelişmiş Arama
          </h1>
          <p className="text-gray-600">
            Akıllı filtreler ve arama analitikleri ile istediğinizi kolayca
            bulun
          </p>
        </div>

        {/* Enhanced Search System */}
        <div className="mb-6">
          <EnhancedSearchSystem
            mode="all"
            onResults={handleSearchResults}
            onMetrics={handleSearchMetrics}
            enableAnalytics={true}
            enableSavedSearches={true}
            enableRealtime={true}
            placeholder="İş, hizmet, freelancer ara..."
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue={activeTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Arama Sonuçları
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analitikler
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              Favoriler
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Ayarlar
            </TabsTrigger>
          </TabsList>

          {/* Search Results Tab */}
          <TabsContent value="search" className="space-y-6">
            {/* Search Results Header */}
            {searchResults.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gray-600">
                        <span className="font-semibold">
                          {searchResults.length}
                        </span>{' '}
                        sonuç bulundu
                        {searchMetrics && (
                          <span className="ml-2">
                            ({searchMetrics.searchTime.toFixed(3)}s)
                          </span>
                        )}
                      </div>

                      {searchMetrics?.popularFilters && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            Popüler:
                          </span>
                          {searchMetrics.popularFilters
                            .slice(0, 3)
                            .map((filter) => (
                              <Badge
                                key={filter}
                                variant="secondary"
                                className="text-xs"
                              >
                                {filter}
                              </Badge>
                            ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Sort Options */}
                      <div className="flex items-center gap-2">
                        <SortAsc className="h-4 w-4 text-gray-500" />
                        <select
                          value={sortBy}
                          onChange={(e) =>
                            setSortBy(
                              e.target.value as
                                | 'relevance'
                                | 'date'
                                | 'rating'
                                | 'price'
                            )
                          }
                          className="rounded border px-2 py-1 text-sm"
                        >
                          <option value="relevance">İlgililik</option>
                          <option value="date">Tarih</option>
                          <option value="rating">Puan</option>
                          <option value="price">Fiyat</option>
                        </select>
                      </div>

                      {/* View Mode Toggle */}
                      <div className="flex items-center gap-1 rounded border">
                        <Button
                          variant={viewMode === 'list' ? 'primary' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('list')}
                          className="p-2"
                        >
                          <List className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('grid')}
                          className="p-2"
                        >
                          <Grid className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={viewMode === 'compact' ? 'primary' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('compact')}
                          className="p-2"
                        >
                          <Layout className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Search Results */}
            <div className="min-h-[400px]">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                  <span className="ml-2">Aranıyor...</span>
                </div>
              ) : (
                getResultComponent()
              )}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <SearchAnalyticsDashboard
              refreshInterval={30000}
              showTrends={true}
              showPerformance={true}
              showTopTerms={true}
              showFilters={true}
            />
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites">
            <Card>
              <CardHeader>
                <CardTitle>Favori İlanlar</CardTitle>
              </CardHeader>
              <CardContent>
                {favoritedIds.length === 0 ? (
                  <div className="py-12 text-center">
                    <Bookmark className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <h3 className="mb-2 text-lg font-semibold">
                      Henüz favori eklenmemiş
                    </h3>
                    <p className="text-gray-600">
                      Beğendiğiniz ilanları favorilere ekleyin.
                    </p>
                  </div>
                ) : (
                  <SearchResultList
                    results={searchResults.filter((result) =>
                      favoritedIds.includes(result.id)
                    )}
                    variant="default"
                    onFavorite={handleFavorite}
                    onShare={handleShare}
                    onContact={handleContact}
                    onView={handleView}
                    favoritedIds={favoritedIds}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Arama Ayarları</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Varsayılan Görünüm Modu
                    </label>
                    <select
                      value={viewMode}
                      onChange={(e) =>
                        setViewMode(
                          e.target.value as 'list' | 'grid' | 'compact'
                        )
                      }
                      className="w-full rounded border px-3 py-2"
                    >
                      <option value="list">Detaylı Liste</option>
                      <option value="grid">Izgara</option>
                      <option value="compact">Kompakt</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Varsayılan Sıralama
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(
                          e.target.value as
                            | 'relevance'
                            | 'date'
                            | 'rating'
                            | 'price'
                        )
                      }
                      className="w-full rounded border px-3 py-2"
                    >
                      <option value="relevance">İlgililik</option>
                      <option value="date">Tarih</option>
                      <option value="rating">Puan</option>
                      <option value="price">Fiyat</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bildirim Ayarları</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Yeni sonuçlar için bildirim</span>
                    <input type="checkbox" className="rounded" />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email bildirimleri</span>
                    <input type="checkbox" className="rounded" />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Öne çıkan ilanlar</span>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
