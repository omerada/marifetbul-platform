'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout';
import { MarketplaceList } from '@/components/marketplace/MarketplaceList';
import { MobileMarketplace } from '@/components/features/MobileMarketplace';
import { Card, Button, Input } from '@/components/ui';
import { useResponsive } from '@/hooks/useResponsive';
import {
  Search,
  Filter,
  Briefcase,
  Package,
  Users,
  Star,
  TrendingUp,
  MapPin,
  Clock,
} from 'lucide-react';

type MarketplaceView = 'jobs' | 'services';

export default function MarketplacePage() {
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

  const stats = [
    {
      icon: Briefcase,
      label: 'Aktif İş İlanı',
      value: '1,247',
      trend: '+12%',
    },
    {
      icon: Package,
      label: 'Hizmet Paketi',
      value: '3,891',
      trend: '+8%',
    },
    {
      icon: Users,
      label: 'Aktif Freelancer',
      value: '8,456',
      trend: '+15%',
    },
    {
      icon: Star,
      label: 'Ortalama Puan',
      value: '4.8',
      trend: '+0.1',
    },
  ];

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="mb-4 text-3xl font-bold lg:text-4xl">
                {activeTab === 'jobs' ? 'İş İlanları' : 'Hizmet Paketleri'}
              </h1>
              <p className="mb-8 text-xl text-blue-100">
                {activeTab === 'jobs'
                  ? 'Yeteneklerinize uygun işler bulun ve teklif verin'
                  : 'Profesyonel hizmetler satın alın ve projelerinizi tamamlayın'}
              </p>

              {/* Search Bar */}
              <div className="mx-auto max-w-2xl">
                <Card className="bg-white p-2 shadow-xl">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="relative flex-1">
                      <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                      <Input
                        type="text"
                        placeholder={`${activeTab === 'jobs' ? 'İş ara' : 'Hizmet ara'}...`}
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="border-0 pl-10 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <Button size="lg" className="px-8">
                      Ara
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-b bg-white">
          <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <Card
                  key={index}
                  className="transform p-6 text-center transition-transform hover:scale-105"
                >
                  <div className="mb-3 flex justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                      <stat.icon className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                  <div className="mt-1 flex items-center justify-center text-xs text-green-600">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    {stat.trend}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Navigation Tabs with Smooth Transitions */}
        <section className="sticky top-0 z-30 border-b bg-white shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex space-x-8">
                <button
                  onClick={() => handleTabChange('jobs')}
                  className={`border-b-2 px-1 py-4 text-sm font-medium transition-all duration-300 ${
                    activeTab === 'jobs'
                      ? 'scale-105 transform border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <Briefcase className="mr-2 inline h-5 w-5" />
                  İş İlanları
                  <span className="ml-2 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-600">
                    1,247
                  </span>
                </button>
                <button
                  onClick={() => handleTabChange('services')}
                  className={`border-b-2 px-1 py-4 text-sm font-medium transition-all duration-300 ${
                    activeTab === 'services'
                      ? 'scale-105 transform border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <Package className="mr-2 inline h-5 w-5" />
                  Hizmet Paketleri
                  <span className="ml-2 rounded-full bg-green-100 px-2 py-1 text-xs text-green-600">
                    3,891
                  </span>
                </button>
              </div>

              {/* Cross-Promotion Quick Access */}
              <div className="hidden items-center space-x-4 lg:flex">
                <span className="text-sm text-gray-500">
                  {activeTab === 'jobs'
                    ? 'Hizmet mi arıyorsun?'
                    : 'İş mi arıyorsun?'}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleTabChange(activeTab === 'jobs' ? 'services' : 'jobs')
                  }
                  className="text-sm"
                >
                  {activeTab === 'jobs'
                    ? 'Hizmetlere Bak'
                    : 'İş İlanlarına Bak'}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content with Smooth Transitions */}
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {isMobile ? (
            <MobileMarketplace initialMode={activeTab} />
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
              {/* Enhanced Filters Sidebar */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24 p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    <h3 className="font-semibold">Filtreler</h3>
                  </div>

                  {/* Context-Aware Filters */}
                  <div className="space-y-6">
                    {activeTab === 'jobs' ? (
                      <>
                        <div>
                          <h4 className="mb-3 text-sm font-medium text-gray-900">
                            Proje Bütçesi
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
                        <div>
                          <h4 className="mb-3 text-sm font-medium text-gray-900">
                            Proje Süresi
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
                      </>
                    ) : (
                      <>
                        <div>
                          <h4 className="mb-3 text-sm font-medium text-gray-900">
                            Fiyat Aralığı
                          </h4>
                          <div className="space-y-2">
                            <label className="flex items-center gap-2">
                              <input type="checkbox" className="rounded" />
                              <span className="text-sm">₺50 - ₺500</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input type="checkbox" className="rounded" />
                              <span className="text-sm">₺500 - ₺2.000</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input type="checkbox" className="rounded" />
                              <span className="text-sm">₺2.000+</span>
                            </label>
                          </div>
                        </div>
                        <div>
                          <h4 className="mb-3 text-sm font-medium text-gray-900">
                            Teslimat Süresi
                          </h4>
                          <div className="space-y-2">
                            <label className="flex items-center gap-2">
                              <input type="checkbox" className="rounded" />
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">24 saat</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input type="checkbox" className="rounded" />
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">3 gün</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input type="checkbox" className="rounded" />
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">1 hafta</span>
                            </label>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Common Filters */}
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
                  </div>

                  {/* Recommended Content (Cross-Pollination) */}
                  <div className="mt-8 rounded-lg bg-gray-50 p-4">
                    <h4 className="mb-3 text-sm font-medium text-gray-900">
                      {activeTab === 'jobs'
                        ? 'Popüler Hizmetler'
                        : 'Trend İş İlanları'}
                    </h4>
                    <div className="space-y-2">
                      <button className="w-full rounded-md bg-white px-3 py-2 text-left text-sm hover:bg-gray-100">
                        {activeTab === 'jobs'
                          ? 'Logo Tasarım'
                          : 'Web Geliştirme İşi'}
                      </button>
                      <button className="w-full rounded-md bg-white px-3 py-2 text-left text-sm hover:bg-gray-100">
                        {activeTab === 'jobs'
                          ? 'SEO Optimizasyon'
                          : 'Mobil App İşi'}
                      </button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 w-full"
                        onClick={() =>
                          handleTabChange(
                            activeTab === 'jobs' ? 'services' : 'jobs'
                          )
                        }
                      >
                        Tümünü Gör
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Results with Smooth Content Switching */}
              <div className="lg:col-span-3">
                <div className="transition-all duration-300 ease-in-out">
                  <MarketplaceList
                    initialMode={activeTab}
                    key={activeTab} // Force re-render for smooth transition
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
