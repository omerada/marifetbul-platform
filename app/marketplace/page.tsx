'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout';
import { MarketplaceList } from '@/components/marketplace/MarketplaceList';
import { MobileMarketplace } from '@/components/features/MobileMarketplace';
import { Card, Button, Input, Loading } from '@/components/ui';
import { useResponsive } from '@/hooks/useResponsive';
import {
  Search,
  Filter,
  Briefcase,
  Package,
  MapPin,
  Clock,
} from 'lucide-react';

type MarketplaceView = 'jobs' | 'services';

function MarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMobile } = useResponsive();

  // URL-based view switching
  const viewParam = searchParams.get('view') as MarketplaceView;
  const [activeTab, setActiveTab] = useState<MarketplaceView>(
    viewParam || 'jobs'
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  // Update tab when URL changes
  useEffect(() => {
    if (viewParam && viewParam !== activeTab) {
      setActiveTab(viewParam);
    }
  }, [viewParam, activeTab]);

  // Update URL when tab changes
  const handleTabChange = (tab: MarketplaceView) => {
    setActiveTab(tab);

    const params = new URLSearchParams(searchParams.toString());
    params.set('view', tab);

    if (searchQuery) {
      params.set('q', searchQuery);
    } else {
      params.delete('q');
    }

    router.push(`/marketplace?${params.toString()}`, { scroll: false });
  };

  // Update URL when search changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);

    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set('q', query);
    } else {
      params.delete('q');
    }

    router.push(`/marketplace?${params.toString()}`, { scroll: false });
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Simplified Header */}
        <section className="border-b bg-white">
          <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
            {/* Title and Description */}
            <div className="mb-6 text-center">
              <h1 className="mb-2 text-2xl font-bold text-gray-900">
                Pazar Yeri
              </h1>
              <p className="text-gray-600">
                İş ilanları ve hizmet paketlerini keşfedin
              </p>
            </div>

            {/* Unified Search Bar */}
            <div className="mx-auto max-w-xl">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <Input
                  type="text"
                  placeholder="İş veya hizmet ara..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pr-20 pl-10"
                />
                <Button
                  size="sm"
                  className="absolute top-1/2 right-2 -translate-y-1/2"
                >
                  Ara
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {isMobile ? (
            <MobileMarketplace initialMode={activeTab} />
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
              {/* Simplified Filters Sidebar */}
              <div className="lg:col-span-1">
                <Card className="sticky top-6 p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    <h3 className="font-semibold">Filtreler</h3>
                  </div>

                  <div className="space-y-6">
                    {/* Content Type Filter */}
                    <div>
                      <h4 className="mb-3 text-sm font-medium text-gray-900">
                        İçerik Türü
                      </h4>
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => handleTabChange('jobs')}
                          className={`flex items-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-300 ${
                            activeTab === 'jobs'
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                          }`}
                        >
                          <Briefcase className="mr-2 h-4 w-4" />
                          İş İlanları
                        </button>
                        <button
                          onClick={() => handleTabChange('services')}
                          className={`flex items-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-300 ${
                            activeTab === 'services'
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                          }`}
                        >
                          <Package className="mr-2 h-4 w-4" />
                          Hizmetler
                        </button>
                      </div>
                    </div>

                    {/* Budget/Price Filter */}
                    <div>
                      <h4 className="mb-3 text-sm font-medium text-gray-900">
                        {activeTab === 'jobs'
                          ? 'Proje Bütçesi'
                          : 'Fiyat Aralığı'}
                      </h4>
                      <div className="space-y-3">
                        <Input
                          type="number"
                          placeholder="Min (₺)"
                          className="w-full"
                        />
                        <Input
                          type="number"
                          placeholder="Max (₺)"
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Duration Filter */}
                    <div>
                      <h4 className="mb-3 text-sm font-medium text-gray-900">
                        {activeTab === 'jobs'
                          ? 'Proje Süresi'
                          : 'Teslimat Süresi'}
                      </h4>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">1-3 gün</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">1 hafta</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">1 ay+</span>
                        </label>
                      </div>
                    </div>

                    {/* Location Filter */}
                    <div>
                      <h4 className="mb-3 text-sm font-medium text-gray-900">
                        Konum
                      </h4>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">Uzaktan</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">İstanbul</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">Ankara</span>
                        </label>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="mt-8 rounded-lg bg-gray-50 p-4">
                      <h4 className="mb-3 text-sm font-medium text-gray-900">
                        İstatistikler
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Toplam:</span>
                          <span className="font-medium">
                            {activeTab === 'jobs' ? '1,247' : '3,891'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Bu hafta:</span>
                          <span className="font-medium text-green-600">
                            +{activeTab === 'jobs' ? '52' : '128'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Results */}
              <div className="lg:col-span-3">
                <MarketplaceList initialMode={activeTab} key={activeTab} />
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense
      fallback={
        <AppLayout>
          <div className="flex min-h-screen items-center justify-center">
            <Loading size="lg" text="Marketplace yükleniyor..." />
          </div>
        </AppLayout>
      }
    >
      <MarketplaceContent />
    </Suspense>
  );
}
