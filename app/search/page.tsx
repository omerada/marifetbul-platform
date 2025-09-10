'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout';
import { UniversalSearch } from '@/components/features/UniversalSearch';
import { MarketplaceList } from '@/components/marketplace/MarketplaceList';
import { Card, Button, Loading } from '@/components/ui';
import { useResponsive } from '@/hooks/useResponsive';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Briefcase,
  Package,
  Users,
  MapPin,
  Clock,
  Star,
} from 'lucide-react';

type SearchTab = 'all' | 'services' | 'jobs' | 'freelancers';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMobile } = useResponsive();

  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') as SearchTab | null;

  const [activeTab, setActiveTab] = useState<SearchTab>(type || 'all');
  const [searchQuery, setSearchQuery] = useState(query);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');

  // Update URL when tab or query changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (activeTab !== 'all') params.set('type', activeTab);

    const newUrl = `/search${params.toString() ? `?${params.toString()}` : ''}`;
    router.replace(newUrl, { scroll: false });
  }, [searchQuery, activeTab, router]);

  const handleSearch = (newQuery: string, searchType?: string) => {
    setSearchQuery(newQuery);
    if (searchType && searchType !== 'all') {
      setActiveTab(searchType as SearchTab);
    }
  };

  const handleTabChange = (tab: SearchTab) => {
    setActiveTab(tab);
  };

  // Mock search results counts
  const searchResults = {
    all: 1247,
    services: 856,
    jobs: 234,
    freelancers: 157,
  };

  const tabs = [
    {
      key: 'all' as SearchTab,
      label: 'Tümü',
      icon: Search,
      count: searchResults.all,
    },
    {
      key: 'services' as SearchTab,
      label: 'Hizmetler',
      icon: Package,
      count: searchResults.services,
    },
    {
      key: 'jobs' as SearchTab,
      label: 'İş İlanları',
      icon: Briefcase,
      count: searchResults.jobs,
    },
    {
      key: 'freelancers' as SearchTab,
      label: 'Freelancerlar',
      icon: Users,
      count: searchResults.freelancers,
    },
  ];

  const sortOptions = [
    { value: 'relevance', label: 'En İlgili' },
    { value: 'newest', label: 'En Yeni' },
    { value: 'price_low', label: 'Fiyat: Düşük → Yüksek' },
    { value: 'price_high', label: 'Fiyat: Yüksek → Düşük' },
    { value: 'rating', label: 'En Yüksek Puan' },
    { value: 'popular', label: 'En Popüler' },
  ];

  const quickFilters = [
    { label: 'Uzaktan', icon: MapPin, active: false },
    { label: '24 saat teslimat', icon: Clock, active: false },
    { label: '4+ yıldız', icon: Star, active: false },
    { label: 'Pro freelancer', icon: Users, active: false },
  ];

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Search Header */}
        <section className="border-b bg-white">
          <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <UniversalSearch
                onSearch={handleSearch}
                placeholder="Ne arıyorsun?"
                className="mb-4"
              />

              {searchQuery && (
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    <strong>&quot;{searchQuery}&quot;</strong> için{' '}
                    <strong>{searchResults[activeTab].toLocaleString()}</strong>{' '}
                    sonuç bulundu
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Search Navigation */}
        <section className="sticky top-0 z-30 border-b bg-white shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              {/* Tabs */}
              <div className="flex space-x-1 lg:space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => handleTabChange(tab.key)}
                    className={`group flex items-center border-b-2 px-2 py-4 text-sm font-medium transition-all duration-200 lg:px-1 ${
                      activeTab === tab.key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <tab.icon className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.slice(0, 3)}</span>
                    {tab.count > 0 && (
                      <span className="ml-2 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 group-hover:bg-gray-200">
                        {tab.count > 999 ? '999+' : tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Sort and Filter */}
              <div className="flex items-center space-x-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {!isMobile && 'Filtreler'}
                </Button>
              </div>
            </div>

            {/* Quick Filters */}
            {!isMobile && (
              <div className="flex items-center space-x-3 pb-4">
                <span className="text-sm text-gray-500">Hızlı filtreler:</span>
                {quickFilters.map((filter, index) => (
                  <button
                    key={index}
                    className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm transition-colors ${
                      filter.active
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <filter.icon className="h-3 w-3" />
                    {filter.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Search Results */}
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {searchQuery ? (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
              {/* Advanced Filters Sidebar - Desktop */}
              {!isMobile && showFilters && (
                <div className="lg:col-span-1">
                  <Card className="sticky top-24 p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      <h3 className="font-semibold">Detaylı Filtreler</h3>
                    </div>

                    <div className="space-y-6">
                      {/* Category Filter */}
                      <div>
                        <h4 className="mb-3 text-sm font-medium text-gray-900">
                          Kategori
                        </h4>
                        <div className="space-y-2">
                          {[
                            'Web Geliştirme',
                            'Mobil Geliştirme',
                            'Tasarım',
                            'Yazarlık',
                            'Pazarlama',
                          ].map((category) => (
                            <label
                              key={category}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-blue-600"
                              />
                              <span className="text-sm text-gray-700">
                                {category}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Price Range */}
                      <div>
                        <h4 className="mb-3 text-sm font-medium text-gray-900">
                          Fiyat Aralığı
                        </h4>
                        <div className="space-y-2">
                          {[
                            '₺0 - ₺500',
                            '₺500 - ₺2.000',
                            '₺2.000 - ₺5.000',
                            '₺5.000+',
                          ].map((range) => (
                            <label
                              key={range}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-blue-600"
                              />
                              <span className="text-sm text-gray-700">
                                {range}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Location */}
                      <div>
                        <h4 className="mb-3 text-sm font-medium text-gray-900">
                          Konum
                        </h4>
                        <div className="space-y-2">
                          {['Uzaktan', 'İstanbul', 'Ankara', 'İzmir'].map(
                            (location) => (
                              <label
                                key={location}
                                className="flex items-center gap-2"
                              >
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                                />
                                <span className="text-sm text-gray-700">
                                  {location}
                                </span>
                              </label>
                            )
                          )}
                        </div>
                      </div>

                      {/* Rating */}
                      <div>
                        <h4 className="mb-3 text-sm font-medium text-gray-900">
                          Değerlendirme
                        </h4>
                        <div className="space-y-2">
                          {[
                            { stars: 5, label: '5 yıldız' },
                            { stars: 4, label: '4+ yıldız' },
                            { stars: 3, label: '3+ yıldız' },
                          ].map((rating) => (
                            <label
                              key={rating.stars}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-blue-600"
                              />
                              <span className="text-sm text-gray-700">
                                {rating.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-6 w-full"
                      onClick={() => {
                        // Clear all filters
                      }}
                    >
                      Filtreleri Temizle
                    </Button>
                  </Card>
                </div>
              )}

              {/* Results Content */}
              <div
                className={
                  showFilters && !isMobile ? 'lg:col-span-3' : 'lg:col-span-4'
                }
              >
                {activeTab === 'all' && (
                  <div className="space-y-8">
                    {/* Mixed Results Preview */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                          <Package className="mr-2 h-5 w-5 text-green-500" />
                          Hizmetler
                        </h3>
                        <MarketplaceList initialMode="services" />
                      </div>

                      <div>
                        <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                          <Briefcase className="mr-2 h-5 w-5 text-blue-500" />
                          İş İlanları
                        </h3>
                        <MarketplaceList initialMode="jobs" />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'services' && (
                  <MarketplaceList initialMode="services" />
                )}

                {activeTab === 'jobs' && <MarketplaceList initialMode="jobs" />}

                {activeTab === 'freelancers' && (
                  <div className="space-y-6">
                    <Card className="p-6">
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                          <h3 className="mb-2 text-lg font-semibold text-gray-900">
                            Freelancer Arama
                          </h3>
                          <p className="text-gray-600">
                            Freelancer arama özelliği yakında eklenecek.
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* No Search Query - Show trending/popular */
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-8">
                <h2 className="mb-4 text-2xl font-bold text-gray-900">
                  Ne aramak istiyorsun?
                </h2>
                <p className="text-gray-600">
                  Popüler kategorileri keşfet veya arama yaparak başla
                </p>
              </div>

              {/* Popular Categories */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {[
                  { name: 'Web Tasarım', count: '2.3k', icon: '🎨' },
                  { name: 'Logo Yapımı', count: '1.8k', icon: '🎯' },
                  { name: 'SEO', count: '967', icon: '📈' },
                  { name: 'Mobil App', count: '1.2k', icon: '📱' },
                  { name: 'İçerik Yazımı', count: '834', icon: '✍️' },
                  { name: 'Sosyal Medya', count: '692', icon: '📸' },
                  { name: 'Video Editör', count: '543', icon: '🎬' },
                  { name: 'Çeviri', count: '421', icon: '🌍' },
                ].map((category) => (
                  <button
                    key={category.name}
                    onClick={() => handleSearch(category.name)}
                    className="group rounded-lg border border-gray-200 bg-white p-4 text-left transition-all hover:border-blue-300 hover:shadow-md"
                  >
                    <div className="mb-2 text-2xl">{category.icon}</div>
                    <div className="font-medium text-gray-900 group-hover:text-blue-600">
                      {category.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {category.count} hizmet
                    </div>
                  </button>
                ))}
              </div>

              {/* Trending Searches */}
              <div className="mt-8">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Trend Aramalar
                </h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    'React developer',
                    'Logo tasarım',
                    'WordPress',
                    'E-ticaret',
                    'Instagram tasarım',
                    'SEO uzmanı',
                  ].map((trend) => (
                    <button
                      key={trend}
                      onClick={() => handleSearch(trend)}
                      className="rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-blue-100 hover:text-blue-700"
                    >
                      {trend}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <AppLayout>
          <div className="flex min-h-screen items-center justify-center">
            <Loading size="lg" text="Arama sayfası yükleniyor..." />
          </div>
        </AppLayout>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
