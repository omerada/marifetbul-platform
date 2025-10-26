'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useMarketplace } from '@/hooks';
import { useResponsive } from '@/hooks';
import { MarketplaceFilters } from './MarketplaceFilters';
import { MarketplaceList } from './MarketplaceList';
import { MarketplacePagination } from './MarketplacePagination';
import { MobileMarketplace } from './MobileMarketplace';
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
  Users,
  CheckCircle,
  Target,
  Zap,
  Shield,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/shared/utils/logger';

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
    applyJobFilters,
    applyPackageFilters,
    updateViewPreferences,
    refreshData,
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
      logger.error('Error clearing filters:', error);
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
      logger.error('Error showing all items:', error);
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
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen bg-gradient-to-b from-white to-gray-50/50"
    >
      {/* Hero Section - Yeni Modern Minimal Tasarım */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700">
        {/* Modern Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent" />

        <div className="relative container mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          {/* Üst Kısım - Mode Toggle & Quick Stats */}
          <div className="mb-12 flex flex-col items-center gap-6">
            {/* Mode Toggle - Kompakt Tasarım */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 p-1 ring-1 ring-white/30 backdrop-blur-xl">
              <button
                onClick={() => handleModeChange('jobs')}
                className={cn(
                  'flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold transition-all duration-300',
                  mode === 'jobs'
                    ? 'bg-white text-blue-700 shadow-xl'
                    : 'text-white/80 hover:text-white'
                )}
              >
                <Briefcase className="h-4 w-4" />
                <span>İş İlanları</span>
                <span
                  className={cn(
                    'ml-1 rounded-full px-2 py-0.5 text-xs font-bold',
                    mode === 'jobs'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-white/20 text-white'
                  )}
                >
                  {mode === 'jobs' ? stats.totalJobs : ''}
                </span>
              </button>
              <button
                onClick={() => handleModeChange('packages')}
                className={cn(
                  'flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold transition-all duration-300',
                  mode === 'packages'
                    ? 'bg-white text-blue-700 shadow-xl'
                    : 'text-white/80 hover:text-white'
                )}
              >
                <Package className="h-4 w-4" />
                <span>Hizmet Paketleri</span>
                <span
                  className={cn(
                    'ml-1 rounded-full px-2 py-0.5 text-xs font-bold',
                    mode === 'packages'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-white/20 text-white'
                  )}
                >
                  {mode === 'packages' ? stats.totalPackages : ''}
                </span>
              </button>
            </div>

            {/* Trust Indicators - Minimal */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/90">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                </div>
                <span className="font-medium">4.9 Ortalama Puan</span>
              </div>
              <div className="h-4 w-px bg-white/30" />
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <Users className="h-4 w-4" />
                </div>
                <span className="font-medium">50K+ Uzman</span>
              </div>
              <div className="h-4 w-px bg-white/30" />
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-400/20 backdrop-blur-sm">
                  <CheckCircle className="h-4 w-4 text-green-300" />
                </div>
                <span className="font-medium">98% Başarı</span>
              </div>
            </div>
          </div>

          {/* Ana İçerik - Merkezi & Temiz */}
          <div className="mx-auto max-w-4xl text-center">
            {/* Başlık - Sabit Yükseklik */}
            <div className="mb-8 space-y-4">
              <div className="flex min-h-[200px] items-center justify-center lg:min-h-[240px]">
                <h1 className="text-5xl leading-tight font-bold text-white lg:text-6xl xl:text-7xl">
                  {mode === 'jobs' ? (
                    <>
                      <span className="block">Yeteneklerinize Uygun</span>
                      <span className="relative inline-block">
                        <span className="relative z-10 bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                          İşler
                        </span>
                        <span className="absolute inset-0 bg-gradient-to-r from-yellow-400/50 to-orange-400/50 blur-2xl" />
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="block">Profesyonel</span>
                      <span className="relative inline-block">
                        <span className="relative z-10 bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">
                          Hizmetler
                        </span>
                        <span className="absolute inset-0 bg-gradient-to-r from-green-400/50 to-emerald-400/50 blur-2xl" />
                      </span>
                    </>
                  )}
                </h1>
              </div>
              <p className="mx-auto max-w-2xl text-xl leading-relaxed text-blue-100 lg:text-2xl">
                {mode === 'jobs'
                  ? 'Binlerce iş fırsatı arasından sizin için en uygun olanı bulun ve hemen başvurun'
                  : 'İhtiyacınıza özel hazır hizmet paketleri ile işlerinizi kolaylaştırın'}
              </p>
            </div>

            {/* CTA & Özellikler */}
            <div className="flex flex-col items-center gap-6">
              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/marketplace/categories">
                  <Button
                    size="lg"
                    className="gap-2 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-blue-700 shadow-xl hover:bg-blue-50"
                  >
                    <Target className="h-5 w-5" />
                    Kategorileri Keşfet
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 rounded-xl border-2 border-white/40 bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm hover:bg-white/20"
                  onClick={() => {
                    const searchSection = document.querySelector(
                      '[data-search-section]'
                    );
                    searchSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <Zap className="h-5 w-5" />
                  Hemen Başla
                </Button>
              </div>

              {/* Özellik Badges - Minimal */}
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  { icon: Shield, text: 'Güvenli Ödeme' },
                  { icon: Zap, text: 'Hızlı İşlem' },
                  { icon: MessageCircle, text: '7/24 Destek' },
                ].map((feature, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/20 backdrop-blur-sm"
                  >
                    <feature.icon className="h-4 w-4" />
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ana İçerik Bölümü */}
      <section
        className="container mx-auto px-4 py-12 sm:px-6 lg:px-8"
        data-search-section
      >
        {/* Kontrol Barı - Ana sayfa teması */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200/60">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Sol - Başlık & Sayı */}
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 ring-1 ring-blue-200/60">
                {mode === 'jobs' ? (
                  <Briefcase className="h-6 w-6 text-blue-600" />
                ) : (
                  <Package className="h-6 w-6 text-blue-600" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 lg:text-2xl">
                  {mode === 'jobs' ? 'İş İlanları' : 'Hizmet Paketleri'}
                </h2>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-blue-600">
                    {currentTotal}
                  </span>{' '}
                  sonuç bulundu
                </p>
              </div>
            </div>

            {/* Sağ - Kontroller */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Görünüm Modu */}
              <div className="flex items-center gap-1 rounded-lg bg-gray-50 p-1 ring-1 ring-gray-200/60">
                <button
                  onClick={() => handleViewModeChange()}
                  className={cn(
                    'rounded-md p-2 transition-all duration-200',
                    viewPreferences.layout === 'grid'
                      ? 'bg-white text-blue-600 shadow-sm ring-1 ring-blue-200/60'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                  title="Grid görünümü"
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleViewModeChange()}
                  className={cn(
                    'rounded-md p-2 transition-all duration-200',
                    viewPreferences.layout === 'list'
                      ? 'bg-white text-blue-600 shadow-sm ring-1 ring-blue-200/60'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                  title="Liste görünümü"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {/* Filtre Butonu */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'gap-2 transition-all duration-200',
                  showFilters &&
                    'border-blue-200 bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                )}
              >
                <Filter className="h-4 w-4" />
                <span>Filtreler</span>
                {showFilters && (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                    ✓
                  </span>
                )}
              </Button>

              {/* Yenile Butonu */}
              <Button
                variant="ghost"
                onClick={handleRefresh}
                disabled={isLoading}
                className="gap-2"
                title="Yenile"
              >
                <RefreshCcw
                  className={cn(
                    'h-4 w-4 transition-transform',
                    isLoading && 'animate-spin'
                  )}
                />
                <span className="hidden sm:inline">Yenile</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Filtre Kenar Çubuğu */}
          {showFilters && (
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-4">
                <Card
                  className="overflow-hidden shadow-sm ring-1 ring-gray-200/60"
                  padding="none"
                >
                  <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                    <h3 className="font-semibold text-gray-900">Filtreler</h3>
                  </div>
                  <div className="p-6">
                    <MarketplaceFilters
                      mode={mode}
                      onJobFiltersChange={applyJobFilters}
                      onPackageFiltersChange={applyPackageFilters}
                      onClose={() => setShowFilters(false)}
                    />
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Ana İçerik */}
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

            {/* Sayfalama */}
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

      {/* Mobil Filtre Overlay */}
      {isTablet && showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowFilters(false)}
          />
          {/* Slide-in Panel */}
          <div className="animate-in slide-in-from-right absolute inset-y-0 right-0 w-80 max-w-[90vw] duration-300">
            <Card
              className="h-full overflow-y-auto shadow-2xl ring-1 ring-gray-200"
              padding="none"
            >
              <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Filtreler</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                  >
                    <Filter className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <MarketplaceFilters
                  mode={mode}
                  onJobFiltersChange={applyJobFilters}
                  onPackageFiltersChange={applyPackageFilters}
                  onClose={() => setShowFilters(false)}
                />
              </div>
            </Card>
          </div>
        </div>
      )}
    </main>
  );
}
