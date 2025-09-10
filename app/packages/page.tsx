'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout';
import { Card, Button, Input } from '@/components/ui';
import { ServiceCard } from '@/components/marketplace/ServiceCard';
import { PackageFiltersComponent } from '@/components/filters/PackageFilters';
// import { MobileFiltersSheet } from '@/components/features/MobileFiltersSheet';
import { MobilePackageFilters } from '@/components/mobile/MobilePackageFilters';
import { usePackages } from '@/hooks/usePackages';
import { usePackageFilters } from '@/hooks/useFilters';
import { useResponsive } from '@/hooks/useResponsive';
import { Search, Filter, Package, Star, DollarSign, Clock } from 'lucide-react';
import type {
  PackageFilters as PackageFiltersType,
  ServicePackage,
} from '@/types';

export default function PackagesPage() {
  const { isMobile } = useResponsive();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<
    'newest' | 'price' | 'rating' | 'orders'
  >('newest');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const {
    filters,
    updateFilters,
    clearFilters,
    isFiltersVisible,
    toggleFiltersVisibility,
  } = usePackageFilters({ search: searchQuery });

  const {
    packages,
    pagination,
    isLoading,
    error,
    // refetch,
  } = usePackages(currentPage, 12, filters);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    updateFilters({ ...filters, search: query });
    setCurrentPage(1);
  };

  const handleFiltersChange = (newFilters: PackageFiltersType) => {
    updateFilters(newFilters);
    setCurrentPage(1);
  };

  const handleSortChange = (newSort: typeof sortBy) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const handlePackageSave = (pkg: ServicePackage) => {
    console.log('Saving package:', pkg.id);
  };

  const handleAddToCart = (pkg: ServicePackage) => {
    console.log('Adding to cart:', pkg.id);
  };

  // Quick filter options
  const quickFilters = [
    {
      label: 'Hızlı Teslimat',
      value: 'fast',
      icon: Clock,
      active: filters.deliveryTime && filters.deliveryTime <= 3,
      onClick: () => {
        handleFiltersChange({
          ...filters,
          deliveryTime: filters.deliveryTime === 3 ? undefined : 3,
        });
      },
    },
    {
      label: 'Bütçe Dostu',
      value: 'budget',
      icon: DollarSign,
      active: filters.priceMax && filters.priceMax <= 500,
      onClick: () => {
        handleFiltersChange({
          ...filters,
          priceMax: filters.priceMax === 500 ? undefined : 500,
        });
      },
    },
    {
      label: 'Yüksek Puanlı',
      value: 'rated',
      icon: Star,
      active: filters.rating && filters.rating >= 4.5,
      onClick: () => {
        handleFiltersChange({
          ...filters,
          rating: filters.rating === 4.5 ? undefined : 4.5,
        });
      },
    },
  ];

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    return (
      <div className="mt-8 flex items-center justify-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Önceki
        </Button>

        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
          const page = i + Math.max(1, currentPage - 2);
          if (page > pagination.totalPages) return null;

          return (
            <Button
              key={page}
              variant={currentPage === page ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          );
        })}

        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === pagination.totalPages}
        >
          Sonraki
        </Button>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
                  Freelancer Hizmetleri
                </h1>
                <p className="mt-1 text-gray-600">
                  {pagination?.total
                    ? `${pagination.total.toLocaleString('tr-TR')} `
                    : ''}
                  hizmet bulundu
                </p>
              </div>

              {/* Search Bar */}
              <div className="flex items-center space-x-4">
                <div className="relative flex-1 lg:w-80">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Hizmet ara (web tasarım, logo, yazılım...)"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pr-4 pl-10"
                  />
                </div>

                {/* Filter Toggle */}
                <Button
                  variant="outline"
                  onClick={() =>
                    isMobile
                      ? setShowMobileFilters(true)
                      : toggleFiltersVisibility()
                  }
                  className="flex items-center whitespace-nowrap"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filtreler
                </Button>
              </div>
            </div>

            {/* Quick Filters - Mobile */}
            {isMobile && (
              <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
                {quickFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={filter.onClick}
                    className={`flex items-center rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                      filter.active
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <filter.icon className="mr-1 h-4 w-4" />
                    {filter.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {/* Desktop Filters Sidebar */}
            {!isMobile && (
              <div
                className={`transition-all duration-300 ${
                  isFiltersVisible ? 'w-80' : 'w-0 overflow-hidden'
                }`}
              >
                <div className="sticky top-6">
                  <PackageFiltersComponent
                    filters={filters}
                    onFiltersChange={updateFilters}
                    isVisible={true}
                    onToggleVisibility={() => {}}
                  />
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="flex-1">
              {/* Sort Controls */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Sıralama:</span>
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      handleSortChange(e.target.value as typeof sortBy)
                    }
                    className="rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="newest">En Yeni</option>
                    <option value="price">Fiyat (Düşükten Yükseğe)</option>
                    <option value="rating">En Yüksek Puan</option>
                    <option value="orders">En Çok Satılan</option>
                  </select>
                </div>

                {/* Results Info */}
                <div className="text-sm text-gray-600">
                  {pagination && (
                    <>
                      {(currentPage - 1) * 12 + 1}-
                      {Math.min(currentPage * 12, pagination.total)} /{' '}
                      {pagination.total}
                    </>
                  )}
                </div>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }, (_, i) => (
                    <Card key={i} className="p-4">
                      <div className="animate-pulse">
                        <div className="mb-4 h-32 rounded bg-gray-200"></div>
                        <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
                        <div className="mb-2 h-4 w-1/2 rounded bg-gray-200"></div>
                        <div className="flex items-center space-x-2">
                          <div className="h-6 w-6 rounded-full bg-gray-200"></div>
                          <div className="h-3 w-16 rounded bg-gray-200"></div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Error State */}
              {error && (
                <Card className="p-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                    <Package className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    Hizmetler yüklenemedi
                  </h3>
                  <p className="mb-4 text-gray-600">
                    Bir hata oluştu. Lütfen sayfayı yenileyin veya daha sonra
                    tekrar deneyin.
                  </p>
                  <Button onClick={() => window.location.reload()}>
                    Tekrar Dene
                  </Button>
                </Card>
              )}

              {/* Packages Grid */}
              {!isLoading && !error && packages && (
                <>
                  {packages.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {packages.map((pkg) => (
                        <ServiceCard
                          key={pkg.id}
                          service={pkg}
                          onSaveService={handlePackageSave}
                          onAddToCart={handleAddToCart}
                          className="hover:shadow-lg"
                        />
                      ))}
                    </div>
                  ) : (
                    /* Empty State */
                    <Card className="p-12 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-gray-900">
                        Hizmet bulunamadı
                      </h3>
                      <p className="mb-4 text-gray-600">
                        Arama kriterlerinizle eşleşen hizmet bulunamadı.
                        Filtreleri değiştirmeyi deneyin.
                      </p>
                      <Button variant="outline" onClick={clearFilters}>
                        Filtreleri Temizle
                      </Button>
                    </Card>
                  )}

                  {/* Pagination */}
                  {renderPagination()}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {isMobile && (
        <MobilePackageFilters
          isOpen={showMobileFilters}
          onClose={() => setShowMobileFilters(false)}
          filters={filters}
          onFiltersChange={updateFilters}
        />
      )}
    </AppLayout>
  );
}
