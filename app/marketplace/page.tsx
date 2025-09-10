'use client';

import { useState } from 'react';
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

export default function MarketplacePage() {
  const { isMobile } = useResponsive();
  const [activeTab, setActiveTab] = useState<'jobs' | 'services'>('jobs');
  const [searchQuery, setSearchQuery] = useState('');

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

  const popularCategories = [
    'Web Geliştirme',
    'Mobil Uygulama',
    'Grafik Tasarım',
    'İçerik Yazımı',
    'Dijital Pazarlama',
    'Veri Analizi',
  ];

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="mb-4 text-3xl font-bold lg:text-4xl">
                Freelancer Pazaryeri
              </h1>
              <p className="mb-8 text-xl text-blue-100">
                Projeleriniz için uzman bulun veya hizmetlerinizi satın
              </p>

              {/* Search Bar */}
              <div className="mx-auto max-w-2xl">
                <Card className="bg-white p-2 shadow-xl">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="relative flex-1">
                      <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Hangi hizmeti veya işi arıyorsunuz?"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
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
                <Card key={index} className="p-6 text-center">
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

        {/* Navigation Tabs */}
        <section className="border-b bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('jobs')}
                className={`border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === 'jobs'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <Briefcase className="mr-2 inline h-5 w-5" />
                İş İlanları
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === 'services'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <Package className="mr-2 inline h-5 w-5" />
                Hizmet Paketleri
              </button>
            </div>
          </div>
        </section>

        {/* Popular Categories */}
        <section className="border-b bg-white">
          <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Popüler Kategoriler
              </h3>
              <Button variant="ghost" size="sm">
                Tümünü Gör
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularCategories.map((category, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-sm hover:border-blue-300 hover:bg-blue-50"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {isMobile ? (
            <MobileMarketplace />
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1">
                <Card className="sticky top-6 p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    <h3 className="font-semibold">Filtreler</h3>
                  </div>

                  {/* Quick Filters */}
                  <div className="space-y-6">
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

                    <div>
                      <h4 className="mb-3 text-sm font-medium text-gray-900">
                        Süre
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
                          <span className="text-sm">1 ay</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-3 text-sm font-medium text-gray-900">
                        Bütçe
                      </h4>
                      <div className="space-y-3">
                        <Input
                          type="number"
                          placeholder="Min"
                          className="w-full"
                        />
                        <Input
                          type="number"
                          placeholder="Max"
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Results */}
              <div className="lg:col-span-3">
                <MarketplaceList />
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
