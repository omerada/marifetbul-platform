'use client';

import { useEffect, useState, useCallback } from 'react';
import { useMarketplace } from '@/hooks';
import { useResponsive } from '@/hooks';
import { MarketplaceFilters } from './MarketplaceFilters';
import { MarketplaceList } from './MarketplaceList';
import { MarketplacePagination } from './MarketplacePagination';
import { MobileMarketplace } from './MobileMarketplace';
import { SearchAutocomplete } from '@/components/domains/search';
import { ErrorState } from '@/components/shared/utilities';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import {
  RefreshCcw,
  Filter,
  Grid3X3,
  List,
  Briefcase,
  Package,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type MarketplaceMode = 'jobs' | 'packages';

export function MarketplacePage() {
  const [mode, setMode] = useState<MarketplaceMode>('jobs');
  const [showFilters, setShowFilters] = useState(false);
  const { isMobile, isTablet } = useResponsive();

  const {
    jobs,
    packages,
    jobsPagination,
    packagesPagination,
    isLoading,
    error,
    stats,
    viewPreferences,
    search,
    applyJobFilters,
    applyPackageFilters,
    updateViewPreferences,
    refreshData,
    setSearchQuery,
  } = useMarketplace();

  // Initial data fetch
  useEffect(() => {
    if (mode === 'jobs' && jobs.length === 0) {
      applyJobFilters();
    } else if (mode === 'packages' && packages.length === 0) {
      applyPackageFilters();
    }
  }, [
    mode,
    jobs.length,
    packages.length,
    applyJobFilters,
    applyPackageFilters,
  ]);

  const handleModeChange = (newMode: MarketplaceMode) => {
    setMode(newMode);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery();
    await search(query, mode);
  };

  const handleRefresh = async () => {
    await refreshData();
  };

  const handleViewModeChange = () => {
    updateViewPreferences();
  };

  const handleClearFilters = useCallback(async () => {
    try {
      if (mode === 'jobs') {
        await applyJobFilters();
      } else {
        await applyPackageFilters();
      }
    } catch (error) {
      console.error('Error clearing filters:', error);
    }
  }, [mode, applyJobFilters, applyPackageFilters]);

  const handleShowAll = useCallback(async () => {
    try {
      if (mode === 'jobs') {
        await applyJobFilters();
      } else {
        await applyPackageFilters();
      }
    } catch (error) {
      console.error('Error showing all items:', error);
    }
  }, [mode, applyJobFilters, applyPackageFilters]);

  if (error) {
    return (
      <ErrorState
        title="Marketplace Yüklenemedi"
        message={error}
        onRetry={handleRefresh}
        variant="full"
      />
    );
  }

  // Mobile view
  if (isMobile) {
    return <MobileMarketplace mode={mode} onModeChange={handleModeChange} />;
  }

  const currentData = mode === 'jobs' ? jobs : packages;
  const currentPagination =
    mode === 'jobs' ? jobsPagination : packagesPagination;
  const currentTotal = mode === 'jobs' ? stats.totalJobs : stats.totalPackages;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Ana sayfaya benzer tasarım */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          {/* Mode Toggle - Ana sayfadan esinlenilerek */}
          <div className="mb-8 flex justify-center">
            <div className="flex items-center rounded-lg bg-white/10 p-1 backdrop-blur-sm">
              <button
                onClick={() => handleModeChange('jobs')}
                className={cn(
                  'flex items-center rounded-md px-6 py-3 text-sm font-medium transition-all duration-300',
                  mode === 'jobs'
                    ? 'scale-105 transform bg-white text-blue-600 shadow-lg'
                    : 'text-white hover:bg-white/20'
                )}
              >
                <Briefcase className="mr-2 h-4 w-4" />
                İş İlanları
              </button>
              <button
                onClick={() => handleModeChange('packages')}
                className={cn(
                  'flex items-center rounded-md px-6 py-3 text-sm font-medium transition-all duration-300',
                  mode === 'packages'
                    ? 'scale-105 transform bg-white text-blue-600 shadow-lg'
                    : 'text-white hover:bg-white/20'
                )}
              >
                <Package className="mr-2 h-4 w-4" />
                Hizmet Paketleri
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              {/* Dynamic Content */}
              <div>
                <h1 className="text-4xl leading-tight font-bold lg:text-6xl">
                  <span className="block whitespace-nowrap">
                    {mode === 'jobs' ? 'İş Fırsatları' : 'Hizmet Mağazası'}
                  </span>
                  <span className="block whitespace-nowrap text-blue-200">
                    MarifetBul&apos;da
                  </span>
                </h1>
                <p className="mt-4 text-xl leading-relaxed text-blue-100">
                  {mode === 'jobs'
                    ? 'Yeteneklerinize uygun işleri keşfedin, teklif verin ve kazanmaya başlayın'
                    : 'Hazır hizmet paketlerini inceleyin, ihtiyacınıza uygun olanı seçin'}
                </p>
              </div>

              {/* Enhanced Search Bar */}
              <div>
                <SearchAutocomplete
                  placeholder={
                    mode === 'jobs'
                      ? 'İş ilanı, beceri veya kategori ara...'
                      : 'Hizmet, freelancer veya kategori ara...'
                  }
                  onSearch={handleSearch}
                  className="rounded-lg bg-white shadow-xl"
                />
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-blue-100">
                  <div className="mr-2 h-2 w-2 rounded-full bg-blue-300"></div>
                  {mode === 'jobs'
                    ? `${currentTotal}+ aktif iş ilanı`
                    : `${currentTotal}+ hizmet paketi`}
                </div>
                <div className="flex items-center text-blue-100">
                  <div className="mr-2 h-2 w-2 rounded-full bg-blue-300"></div>
                  Günlük yeni fırsatlar
                </div>
                <div className="flex items-center text-blue-100">
                  <div className="mr-2 h-2 w-2 rounded-full bg-blue-300"></div>
                  Güvenli ödeme sistemi
                </div>
                <div className="flex items-center text-blue-100">
                  <div className="mr-2 h-2 w-2 rounded-full bg-blue-300"></div>
                  7/24 destek
                </div>
              </div>
            </div>

            {/* Stats Card - Ana sayfa tasarımı */}
            <div className="relative">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-8 shadow-lg backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white drop-shadow-sm">
                      {mode === 'jobs' ? '15K+' : '8K+'}
                    </div>
                    <div className="font-medium text-blue-100">
                      {mode === 'jobs' ? 'Aktif İş İlanı' : 'Hizmet Paketi'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white drop-shadow-sm">
                      50K+
                    </div>
                    <div className="font-medium text-blue-100">
                      Kayıtlı Uzman
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white drop-shadow-sm">
                      4.9
                    </div>
                    <div className="flex items-center justify-center font-medium text-blue-100">
                      <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
                      Ortalama Puan
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white drop-shadow-sm">
                      98%
                    </div>
                    <div className="font-medium text-blue-100">
                      Başarı Oranı
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Controls Bar */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {mode === 'jobs' ? 'İş İlanları' : 'Hizmet Paketleri'}
            </h2>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
              {currentTotal} sonuç
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => handleViewModeChange()}
                className={cn(
                  'rounded-md p-2 transition-colors',
                  viewPreferences.layout === 'grid'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleViewModeChange()}
                className={cn(
                  'rounded-md p-2 transition-colors',
                  viewPreferences.layout === 'list'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'gap-2',
                showFilters && 'border-blue-200 bg-blue-50 text-blue-700'
              )}
            >
              <Filter className="h-4 w-4" />
              Filtreler
            </Button>

            {/* Refresh */}
            <Button
              variant="ghost"
              onClick={handleRefresh}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCcw
                className={cn('h-4 w-4', isLoading && 'animate-spin')}
              />
              Yenile
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <Card variant="elevated" padding="lg">
                  <MarketplaceFilters
                    mode={mode}
                    onJobFiltersChange={applyJobFilters}
                    onPackageFiltersChange={applyPackageFilters}
                    onClose={() => setShowFilters(false)}
                  />
                </Card>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className={cn(showFilters ? 'lg:col-span-3' : 'lg:col-span-4')}>
            <MarketplaceList
              mode={mode}
              data={currentData}
              isLoading={isLoading}
              viewPreferences={{
                ...viewPreferences,
                showFilters: showFilters,
                showAdvancedFilters: false,
              }}
              onClearFilters={handleClearFilters}
              onShowAll={handleShowAll}
            />

            {/* Pagination */}
            {currentPagination.totalPages > 1 && (
              <div className="mt-8">
                <MarketplacePagination
                  mode={mode}
                  pagination={currentPagination}
                  onPageChange={() => {
                    if (mode === 'jobs') {
                      applyJobFilters();
                    } else {
                      applyPackageFilters();
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Mobile Filters Overlay */}
      {isTablet && showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowFilters(false)}
          />
          <div className="absolute top-0 right-0 h-full w-80 max-w-[90vw] bg-white shadow-xl">
            <Card className="h-full" padding="lg">
              <MarketplaceFilters
                mode={mode}
                onJobFiltersChange={applyJobFilters}
                onPackageFiltersChange={applyPackageFilters}
                onClose={() => setShowFilters(false)}
              />
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
