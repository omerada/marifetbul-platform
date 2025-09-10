'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  AdvancedSearch,
  NotificationCenter,
  AnimatedInteractions,
  AnalyticsDashboard,
  PWAManager,
} from '@/components/features';
import { useJobs } from '@/hooks';
import { Job, ServicePackage } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import {
  Sparkles,
  Search,
  Bell,
  BarChart3,
  Smartphone,
  MousePointer,
} from 'lucide-react';

export default function AdvancedFeaturesDemo() {
  const { jobs } = useJobs();
  const [searchResults, setSearchResults] = useState<(Job | ServicePackage)[]>(
    []
  );

  const handleSearchResults = (results: (Job | ServicePackage)[]) => {
    setSearchResults(results);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="mb-2 flex items-center justify-center gap-2 text-3xl font-bold">
            <Sparkles className="h-8 w-8 text-yellow-500" />
            Gelişmiş Özellikler Demo
          </h1>
          <p className="mx-auto max-w-2xl text-gray-600">
            Marifet platformunun yeni gelişmiş özelliklerini keşfedin. Gelişmiş
            arama, bildirim sistemi, animasyonlu etkileşimler, analytics
            dashboard ve PWA özellikleri.
          </p>
        </div>

        {/* Feature Tabs */}
        <Card className="p-6">
          <Tabs defaultValue="search" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="search" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Gelişmiş Arama</span>
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="flex items-center gap-2"
              >
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Bildirimler</span>
              </TabsTrigger>
              <TabsTrigger
                value="animations"
                className="flex items-center gap-2"
              >
                <MousePointer className="h-4 w-4" />
                <span className="hidden sm:inline">Animasyonlar</span>
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="pwa" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <span className="hidden sm:inline">PWA</span>
              </TabsTrigger>
            </TabsList>

            {/* Advanced Search Tab */}
            <TabsContent value="search" className="space-y-6">
              <div className="text-center">
                <h2 className="mb-2 text-2xl font-bold">
                  Gelişmiş Arama Sistemi
                </h2>
                <p className="text-gray-600">
                  Akıllı filtreleme, arama önerileri, arama geçmişi ve gerçek
                  zamanlı sonuçlar
                </p>
              </div>

              <AdvancedSearch
                mode="jobs"
                items={jobs}
                onResultsChange={handleSearchResults}
              />

              {searchResults.length > 0 && (
                <Card className="p-4">
                  <h3 className="mb-3 font-semibold">
                    Arama Sonuçları ({searchResults.length})
                  </h3>
                  <div className="grid max-h-64 gap-2 overflow-y-auto">
                    {searchResults.slice(0, 5).map((job) => (
                      <div key={job.id} className="rounded-lg bg-gray-50 p-3">
                        <h4 className="font-medium">{job.title}</h4>
                        <p className="line-clamp-2 text-sm text-gray-600">
                          {job.description}
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                          <span>{job.category}</span>
                          <span>•</span>
                          <span>
                            {'budget' in job
                              ? job.budget?.type === 'fixed'
                                ? '₺' + job.budget.amount
                                : '₺' + job.budget?.amount + '/saat'
                              : '₺' + ('price' in job ? job.price : 0)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <div className="text-center">
                <h2 className="mb-2 text-2xl font-bold">Bildirim Sistemi</h2>
                <p className="text-gray-600">
                  Gerçek zamanlı bildirimler, filtreleme ve önem seviyesi
                  yönetimi
                </p>
              </div>

              <div className="flex justify-center">
                <NotificationCenter />
              </div>

              <Card className="p-6">
                <h3 className="mb-4 font-semibold">Bildirim Özellikleri</h3>
                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <span>Mesaj bildirimleri</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span>Teklif bildirimleri</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                      <span>Ödeme bildirimleri</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                      <span>Değerlendirme bildirimleri</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500"></div>
                      <span>Sistem bildirimleri</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-gray-500"></div>
                      <span>Proje güncellemeleri</span>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Animations Tab */}
            <TabsContent value="animations" className="space-y-6">
              <div className="text-center">
                <h2 className="mb-2 text-2xl font-bold">
                  Animasyonlu Etkileşimler
                </h2>
                <p className="text-gray-600">
                  Mikro animasyonlar, ripple efektleri, yükleme durumları ve
                  kullanıcı geri bildirimleri
                </p>
              </div>

              <AnimatedInteractions />
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="text-center">
                <h2 className="mb-2 text-2xl font-bold">Analytics Dashboard</h2>
                <p className="text-gray-600">
                  Detaylı istatistikler, grafikler, performans metrikleri ve
                  trend analizi
                </p>
              </div>

              <AnalyticsDashboard />
            </TabsContent>

            {/* PWA Tab */}
            <TabsContent value="pwa" className="space-y-6">
              <div className="text-center">
                <h2 className="mb-2 text-2xl font-bold">Progressive Web App</h2>
                <p className="text-gray-600">
                  Çevrimdışı çalışma, uygulama yükleme, push bildirimleri ve
                  önbellek yönetimi
                </p>
              </div>

              <PWAManager />
            </TabsContent>
          </Tabs>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="mb-4 font-semibold">Hızlı Erişim</h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Button
              variant="outline"
              className="flex h-20 flex-col items-center gap-2"
            >
              <Search className="h-6 w-6" />
              <span className="text-sm">Arama</span>
            </Button>
            <Button
              variant="outline"
              className="flex h-20 flex-col items-center gap-2"
            >
              <Bell className="h-6 w-6" />
              <span className="text-sm">Bildirimler</span>
            </Button>
            <Button
              variant="outline"
              className="flex h-20 flex-col items-center gap-2"
            >
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm">İstatistikler</span>
            </Button>
            <Button
              variant="outline"
              className="flex h-20 flex-col items-center gap-2"
            >
              <Smartphone className="h-6 w-6" />
              <span className="text-sm">PWA</span>
            </Button>
          </div>
        </Card>

        {/* Feature Summary */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 p-6">
          <div className="text-center">
            <h3 className="mb-2 text-xl font-bold">🎉 Tebrikler!</h3>
            <p className="mb-4 text-gray-700">
              Marifet platformu artık en gelişmiş özelliklerle donatılmış
              durumda. Bu yeni özellikler kullanıcı deneyimini önemli ölçüde
              geliştirecek.
            </p>
            <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">5</div>
                <div className="text-gray-600">Yeni Özellik</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">15+</div>
                <div className="text-gray-600">Yeni Komponent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">%100</div>
                <div className="text-gray-600">TypeScript Uyumlu</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
