'use client';

import { useState } from 'react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useMarketplace } from '@/hooks';
import { Loading } from '@/components/ui';
import { cn } from '@/lib/utils';
import type {
  JobResponse,
  PackageSummaryResponse,
} from '@/types/backend-aligned';

interface MobileMarketplaceProps {
  mode: 'jobs' | 'packages';
  onModeChange: (mode: 'jobs' | 'packages') => void;
}

export function MobileMarketplace({
  mode,
  onModeChange,
}: MobileMarketplaceProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<{
    category: string;
    location: string;
    priceRange: string;
  }>({
    category: '',
    location: '',
    priceRange: '',
  });

  const {
    jobs,
    packages,
    stats,
    isLoading,
    error,
    search,
    applyJobFilters,
    applyPackageFilters,
  } = useMarketplace();

  const currentData = mode === 'jobs' ? jobs : packages;
  const currentTotal = mode === 'jobs' ? stats.totalJobs : stats.totalPackages;

  const handleSearch = () => {
    search(searchQuery, mode);
  };

  const handleFilterChange = (key: string, value: string) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    if (mode === 'jobs') {
      applyJobFilters();
    } else {
      applyPackageFilters();
    }
    setShowFilters(false);
  };

  const clearFilters = () => {
    setActiveFilters({ category: '', location: '', priceRange: '' });
    if (mode === 'jobs') {
      applyJobFilters();
    } else {
      applyPackageFilters();
    }
  };

  if (isLoading) {
    return (
      <Loading
        variant="skeleton"
        size="lg"
        text="Mobil marketplace yükleniyor..."
      />
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="py-8 text-center">
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            Marketplace Yüklenemedi
          </h3>
          <p className="mb-4 text-gray-600 dark:text-gray-400">{error}</p>
          <Button onClick={() => window.location.reload()}>Tekrar Dene</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 border-b border-blue-100 bg-white/80 shadow-lg backdrop-blur-lg">
        <div className="space-y-4 p-4">
          {/* Mode Toggle */}
          <div className="flex justify-center">
            <div className="rounded-2xl bg-gradient-to-r from-blue-100 to-indigo-100 p-1.5 shadow-inner">
              <Button
                variant={mode === 'jobs' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onModeChange('jobs')}
                className={cn(
                  'rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-300',
                  mode === 'jobs'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300'
                    : 'text-blue-700 hover:bg-white/60 hover:text-blue-800'
                )}
              >
                İş İlanları
              </Button>
              <Button
                variant={mode === 'packages' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onModeChange('packages')}
                className={cn(
                  'rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-300',
                  mode === 'packages'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300'
                    : 'text-blue-700 hover:bg-white/60 hover:text-blue-800'
                )}
              >
                Hizmet Paketleri
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-blue-400" />
              <Input
                type="text"
                placeholder={
                  mode === 'jobs' ? 'İş ilanı ara...' : 'Hizmet ara...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="h-12 rounded-2xl border-blue-200 bg-white/90 pr-4 pl-12 shadow-sm backdrop-blur-sm transition-all duration-200 focus:border-blue-300 focus:bg-white focus:shadow-md focus:ring-blue-100"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'h-12 rounded-2xl border-blue-200 bg-white/90 px-4 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-blue-300 hover:bg-blue-50',
                showFilters &&
                  'border-blue-300 bg-blue-50 text-blue-700 shadow-md'
              )}
            >
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
            <Button
              size="sm"
              onClick={handleSearch}
              className="h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 shadow-lg shadow-blue-200 transition-all duration-200 hover:shadow-xl hover:shadow-blue-300"
            >
              Ara
            </Button>
          </div>

          {/* Results Count */}
          <div className="rounded-xl bg-blue-50/80 px-4 py-3 text-sm">
            {currentTotal > 0 ? (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span className="font-semibold text-blue-900">
                  {currentTotal.toLocaleString()}
                </span>
                <span className="text-blue-700">
                  {mode === 'jobs' ? 'iş ilanı' : 'hizmet paketi'} bulundu
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                <span className="text-gray-600">Sonuç bulunamadı</span>
              </div>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="m-4 mt-0 rounded-2xl border-blue-200 bg-white/95 shadow-xl backdrop-blur-sm">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center justify-between">
                <h3 className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-lg font-bold text-transparent">
                  Filtreler
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                  className="rounded-full p-2 hover:bg-blue-50"
                >
                  <X className="h-5 w-5 text-blue-600" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Category Filter */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-800">
                    Kategori
                  </label>
                  <select
                    value={activeFilters.category}
                    onChange={(e) =>
                      handleFilterChange('category', e.target.value)
                    }
                    className="w-full rounded-xl border border-blue-200 bg-white/90 px-4 py-3 text-sm shadow-sm transition-all duration-200 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Tüm Kategoriler</option>
                    <option value="Web Geliştirme">Web Geliştirme</option>
                    <option value="Mobil Uygulama">Mobil Uygulama</option>
                    <option value="Tasarım">Tasarım</option>
                    <option value="Yazılım">Yazılım</option>
                    <option value="Pazarlama">Pazarlama</option>
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-800">
                    Konum
                  </label>
                  <select
                    value={activeFilters.location}
                    onChange={(e) =>
                      handleFilterChange('location', e.target.value)
                    }
                    className="w-full rounded-xl border border-blue-200 bg-white/90 px-4 py-3 text-sm shadow-sm transition-all duration-200 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Tüm Konumlar</option>
                    <option value="İstanbul">İstanbul</option>
                    <option value="Ankara">Ankara</option>
                    <option value="İzmir">İzmir</option>
                    <option value="Uzaktan">Uzaktan</option>
                  </select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-800">
                    {mode === 'jobs' ? 'Bütçe Aralığı' : 'Fiyat Aralığı'}
                  </label>
                  <select
                    value={activeFilters.priceRange}
                    onChange={(e) =>
                      handleFilterChange('priceRange', e.target.value)
                    }
                    className="w-full rounded-xl border border-blue-200 bg-white/90 px-4 py-3 text-sm shadow-sm transition-all duration-200 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Tüm Fiyatlar</option>
                    <option value="0-500">0 - 500 ₺</option>
                    <option value="500-1500">500 - 1.500 ₺</option>
                    <option value="1500-5000">1.500 - 5.000 ₺</option>
                    <option value="5000+">5.000 ₺ +</option>
                  </select>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex gap-3 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="flex-1 rounded-xl border-blue-200 bg-white/90 py-3 font-semibold transition-all duration-200 hover:border-blue-300 hover:bg-blue-50"
                >
                  Temizle
                </Button>
                <Button
                  size="sm"
                  onClick={applyFilters}
                  className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-3 font-semibold shadow-lg shadow-blue-200 transition-all duration-200 hover:shadow-xl hover:shadow-blue-300"
                >
                  Uygula
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4">
        {!currentData || currentData.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground text-lg font-medium">
              {mode === 'jobs'
                ? 'İş ilanı bulunamadı'
                : 'Hizmet paketi bulunamadı'}
            </p>
            <p className="text-muted-foreground mt-2 text-sm">
              Arama kriterlerinizi değiştirerek tekrar deneyin.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {mode === 'jobs'
              ? jobs.map((job) => (
                  <Card key={job.id}>
                    <CardContent className="p-4">
                      <h3 className="font-semibold">{job.title}</h3>
                      <p className="mt-1 text-sm text-gray-600">
                        {job.description?.substring(0, 100)}...
                      </p>
                    </CardContent>
                  </Card>
                ))
              : packages.map((pkg) => (
                  <Card key={pkg.id}>
                    <CardContent className="p-4">
                      <h3 className="font-semibold">{pkg.title}</h3>
                      <p className="mt-1 text-sm text-gray-600">
                        {pkg.description?.substring(0, 100)}...
                      </p>
                    </CardContent>
                  </Card>
                ))}
          </div>
        )}
      </div>
    </div>
  );
}
