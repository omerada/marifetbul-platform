'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useMarketplace } from '@/hooks/useMarketplace';
import { JobCard } from './JobCard';
import { PackageCard } from './PackageCard';
import { EmptyState } from './EmptyState';
import { MarketplaceSkeleton } from './MarketplaceSkeleton';
import { cn } from '@/lib/utils';

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
    const filters = {
      category: activeFilters.category || undefined,
      location: activeFilters.location ? [activeFilters.location] : undefined,
    };

    if (mode === 'jobs') {
      applyJobFilters(filters);
    } else {
      applyPackageFilters(filters);
    }
    setShowFilters(false);
  };

  const clearFilters = () => {
    setActiveFilters({ category: '', location: '', priceRange: '' });
    if (mode === 'jobs') {
      applyJobFilters({});
    } else {
      applyPackageFilters({});
    }
  };

  if (isLoading) {
    return <MarketplaceSkeleton />;
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="space-y-4 p-4">
          {/* Mode Toggle */}
          <div className="flex justify-center">
            <div className="rounded-xl bg-gray-100 p-1 dark:bg-gray-700">
              <Button
                variant={mode === 'jobs' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onModeChange('jobs')}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium transition-all',
                  mode === 'jobs'
                    ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-800 dark:text-blue-400'
                    : 'text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-600'
                )}
              >
                İş İlanları
              </Button>
              <Button
                variant={mode === 'packages' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onModeChange('packages')}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium transition-all',
                  mode === 'packages'
                    ? 'bg-white text-blue-600 shadow-sm dark:bg-gray-800 dark:text-blue-400'
                    : 'text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-600'
                )}
              >
                Hizmet Paketleri
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                type="text"
                placeholder={
                  mode === 'jobs' ? 'İş ilanı ara...' : 'Hizmet ara...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pr-4 pl-10"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="px-3"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={handleSearch}>
              Ara
            </Button>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {currentTotal > 0 ? (
              <>
                <span className="font-medium text-gray-900 dark:text-white">
                  {currentTotal.toLocaleString()}
                </span>{' '}
                {mode === 'jobs' ? 'iş ilanı' : 'hizmet paketi'} bulundu
              </>
            ) : (
              <span>Sonuç bulunamadı</span>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="m-4 mt-0">
            <CardContent className="space-y-4 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Filtreler</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                {/* Category Filter */}
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Kategori
                  </label>
                  <select
                    value={activeFilters.category}
                    onChange={(e) =>
                      handleFilterChange('category', e.target.value)
                    }
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
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
                  <label className="mb-1 block text-sm font-medium">
                    Konum
                  </label>
                  <select
                    value={activeFilters.location}
                    onChange={(e) =>
                      handleFilterChange('location', e.target.value)
                    }
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
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
                  <label className="mb-1 block text-sm font-medium">
                    {mode === 'jobs' ? 'Bütçe Aralığı' : 'Fiyat Aralığı'}
                  </label>
                  <select
                    value={activeFilters.priceRange}
                    onChange={(e) =>
                      handleFilterChange('priceRange', e.target.value)
                    }
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
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
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="flex-1"
                >
                  Temizle
                </Button>
                <Button size="sm" onClick={applyFilters} className="flex-1">
                  Uygula
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {!currentData || currentData.length === 0 ? (
          <EmptyState
            mode={mode}
            title={
              mode === 'jobs'
                ? 'İş ilanı bulunamadı'
                : 'Hizmet paketi bulunamadı'
            }
            description="Arama kriterlerinizi değiştirerek tekrar deneyin."
          />
        ) : (
          <div className="space-y-4">
            {mode === 'jobs'
              ? jobs.map((job) => (
                  <JobCard key={job.id} job={job} layout="list" />
                ))
              : packages.map((pkg) => (
                  <PackageCard key={pkg.id} package={pkg} layout="list" />
                ))}
          </div>
        )}
      </div>
    </div>
  );
}
