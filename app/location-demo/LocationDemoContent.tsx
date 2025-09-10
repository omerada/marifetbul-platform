/**
 * Location Demo Content Component
 * Client-side only location demo content to avoid SSR issues
 */

import React, { useState, useCallback } from 'react';
import { MapPin, Search, Navigation, Globe, Layers } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Coordinates, LocationData } from '@/types';

interface MapMarker {
  id: string;
  coordinates: Coordinates;
  title: string;
  description?: string;
  type?: 'job' | 'service' | 'freelancer' | 'location';
  color?: string;
}

export default function LocationDemoContent() {
  const [selectedLocation, setSelectedLocation] = useState<Coordinates | null>(
    null
  );
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([
    {
      id: '1',
      coordinates: { latitude: 39.9208, longitude: 32.8541 },
      title: 'Web Geliştirici İş İlanı',
      description:
        'React ve TypeScript ile modern web uygulamaları geliştirmek için deneyimli geliştirici arıyoruz.',
      type: 'job',
      color: '#3B82F6',
    },
    {
      id: '2',
      coordinates: { latitude: 39.9199, longitude: 32.8543 },
      title: 'Logo Tasarım Hizmeti',
      description:
        'Profesyonel logo tasarım hizmeti. Markanıza özel yaratıcı çözümler sunuyoruz.',
      type: 'service',
      color: '#10B981',
    },
    {
      id: '3',
      coordinates: { latitude: 39.919, longitude: 32.8545 },
      title: 'Freelance Yazılımcı',
      description:
        'Full-stack geliştirici. React, Node.js ve veritabanı uzmanlığı.',
      type: 'freelancer',
      color: '#F59E0B',
    },
    {
      id: '4',
      coordinates: { latitude: 41.0082, longitude: 28.9784 },
      title: 'İstanbul İş Fırsatları',
      description: 'Çeşitli teknoloji şirketlerinde iş fırsatları.',
      type: 'location',
      color: '#EF4444',
    },
    {
      id: '5',
      coordinates: { latitude: 38.4192, longitude: 27.1287 },
      title: 'İzmir Tasarım Stüdyosu',
      description: 'Kreatif tasarım hizmetleri ve dijital çözümler.',
      type: 'service',
      color: '#10B981',
    },
  ]);
  const [currentView, setCurrentView] = useState<
    'picker' | 'search' | 'map' | 'all'
  >('all');

  const handleLocationSelect = useCallback((location: Coordinates) => {
    setSelectedLocation(location);
    console.log('Seçilen lokasyon:', location);
  }, []);

  const handleLocationSearch = useCallback(async (query: string) => {
    console.log('Lokasyon arama:', query);
    // Mock arama sonuçları
    const mockResults: LocationData[] = [
      {
        id: '1',
        name: 'Ankara, Türkiye',
        fullName: 'Ankara, Çankaya, Türkiye',
        coordinates: { latitude: 39.9208, longitude: 32.8541 },
        type: 'city' as const,
        country: 'Türkiye',
        region: 'Ankara',
        address: 'Çankaya/Ankara',
        city: 'Ankara',
        state: 'Ankara',
      },
      {
        id: '2',
        name: 'İstanbul, Türkiye',
        fullName: 'İstanbul, Beşiktaş, Türkiye',
        coordinates: { latitude: 41.0082, longitude: 28.9784 },
        type: 'city' as const,
        country: 'Türkiye',
        region: 'İstanbul',
        address: 'Beşiktaş/İstanbul',
        city: 'İstanbul',
        state: 'İstanbul',
      },
      {
        id: '3',
        name: 'İzmir, Türkiye',
        fullName: 'İzmir, Konak, Türkiye',
        coordinates: { latitude: 38.4192, longitude: 27.1287 },
        type: 'city' as const,
        country: 'Türkiye',
        region: 'İzmir',
        address: 'Konak/İzmir',
        city: 'İzmir',
        state: 'İzmir',
      },
    ].filter((item) => item.name.toLowerCase().includes(query.toLowerCase()));

    setSearchResults(mockResults);
  }, []);

  const handleSearchResultSelect = useCallback((result: LocationData) => {
    setSelectedLocation(result.coordinates);
    setSearchResults([]);
    console.log('Arama sonucundan seçilen:', result);
  }, []);

  const handleMapClick = useCallback((coordinates: Coordinates) => {
    setSelectedLocation(coordinates);
    console.log('Haritada tıklanan konum:', coordinates);
  }, []);

  const handleMarkerClick = useCallback((marker: MapMarker) => {
    setSelectedLocation(marker.coordinates);
    console.log('Marker tıklandı:', marker);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">
          Lokasyon Demo Sayfası
        </h1>
        <p className="text-lg text-gray-600">
          Lokasyon seçici, arama ve harita bileşenlerini test edin
        </p>
      </div>

      {/* View Selector */}
      <div className="mb-8 flex flex-wrap justify-center gap-4">
        <Button
          variant={currentView === 'all' ? 'primary' : 'outline'}
          onClick={() => setCurrentView('all')}
          className="flex items-center gap-2"
        >
          <Globe className="h-4 w-4" />
          Tümü
        </Button>
        <Button
          variant={currentView === 'picker' ? 'primary' : 'outline'}
          onClick={() => setCurrentView('picker')}
          className="flex items-center gap-2"
        >
          <MapPin className="h-4 w-4" />
          Lokasyon Seçici
        </Button>
        <Button
          variant={currentView === 'search' ? 'primary' : 'outline'}
          onClick={() => setCurrentView('search')}
          className="flex items-center gap-2"
        >
          <Search className="h-4 w-4" />
          Lokasyon Arama
        </Button>
        <Button
          variant={currentView === 'map' ? 'primary' : 'outline'}
          onClick={() => setCurrentView('map')}
          className="flex items-center gap-2"
        >
          <Layers className="h-4 w-4" />
          Harita Görünümü
        </Button>
      </div>

      {/* Selected Location Display */}
      {selectedLocation && (
        <Card className="mb-8 p-6">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Seçilen Lokasyon
          </h3>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>
              Enlem: {selectedLocation.latitude.toFixed(6)}, Boylam:{' '}
              {selectedLocation.longitude.toFixed(6)}
            </span>
          </div>
        </Card>
      )}

      {/* Content */}
      <div className="space-y-8">
        {/* Location Picker Section */}
        {(currentView === 'all' || currentView === 'picker') && (
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Lokasyon Seçici
              </h2>
            </div>
            <p className="mb-4 text-gray-600">
              Mevcut konumunuzu alın veya haritadan bir konum seçin.
            </p>
            <div className="space-y-4">
              <Button
                onClick={() => setShowPicker(!showPicker)}
                className="flex items-center gap-2"
              >
                <Navigation className="h-4 w-4" />
                {showPicker ? 'Seçiciyi Gizle' : 'Lokasyon Seçiciyi Aç'}
              </Button>
              {showPicker && (
                <div className="border-t pt-4">
                  <div className="rounded-lg bg-gray-50 p-8 text-center">
                    <MapPin className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <p className="text-gray-600">Lokasyon seçici demo</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Location Search Section */}
        {(currentView === 'all' || currentView === 'search') && (
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Search className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Lokasyon Arama
              </h2>
            </div>
            <p className="mb-4 text-gray-600">
              Şehir, bölge veya adres ile lokasyon arayın.
            </p>
            <div className="space-y-4">
              <Button
                onClick={() => setShowSearch(!showSearch)}
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                {showSearch ? 'Aramayı Gizle' : 'Lokasyon Aramayı Aç'}
              </Button>
              {showSearch && (
                <div className="border-t pt-4">
                  <div className="rounded-lg bg-gray-50 p-8 text-center">
                    <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <p className="text-gray-600">Lokasyon arama demo</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Map View Section */}
        {(currentView === 'all' || currentView === 'map') && (
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Layers className="h-5 w-5 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Harita Görünümü
              </h2>
            </div>
            <p className="mb-4 text-gray-600">
              İş ilanları, hizmetler ve freelancerları harita üzerinde görün.
            </p>
            <div className="h-96 w-full overflow-hidden rounded-lg border border-gray-200">
              <div className="flex h-full items-center justify-center rounded-lg bg-gray-50 p-8 text-center">
                <div>
                  <Layers className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p className="text-gray-600">Harita görünümü demo</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {mapMarkers.filter((m) => m.type === 'job').length}
            </div>
            <div className="text-sm text-gray-600">İş İlanı</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {mapMarkers.filter((m) => m.type === 'service').length}
            </div>
            <div className="text-sm text-gray-600">Hizmet</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {mapMarkers.filter((m) => m.type === 'freelancer').length}
            </div>
            <div className="text-sm text-gray-600">Freelancer</div>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Nasıl Kullanılır?
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <span className="mt-1 text-blue-600">•</span>
              <span>
                <strong>Lokasyon Seçici:</strong> Mevcut konumunuzu almak için
                &ldquo;Mevcut Konum&rdquo; butonunu kullanın veya haritadan bir
                nokta seçin.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-1 text-green-600">•</span>
              <span>
                <strong>Lokasyon Arama:</strong> Şehir veya bölge adı yazarak
                konumları arayın ve sonuçlardan birini seçin.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-1 text-purple-600">•</span>
              <span>
                <strong>Harita Görünümü:</strong> İş ilanları, hizmetler ve
                freelancerları harita üzerinde görün. Marker&apos;lara
                tıklayarak detayları görüntüleyin.
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
