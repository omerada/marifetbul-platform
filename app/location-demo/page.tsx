/**
 * Location Demo Page
 * Lokasyon özelliklerini test etmek için demo sayfası
 */

'use client';

import React, { useState, useCallback } from 'react';
import { MapPin, Search, Navigation, Globe, Layers } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LocationPicker, LocationSearch, MapView } from '@/components/features';
import { Coordinates, LocationData } from '@/types';

interface MapMarker {
  id: string;
  coordinates: Coordinates;
  title: string;
  description?: string;
  type?: 'job' | 'service' | 'freelancer' | 'location';
  color?: string;
}

export default function LocationDemoPage() {
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
      coordinates: { latitude: 39.94, longitude: 32.82 },
      title: 'Zeynep Demir - UI/UX Tasarımcı',
      description:
        'Kullanıcı deneyimi odaklı modern tasarımlar yapan freelancer tasarımcı.',
      type: 'freelancer',
      color: '#8B5CF6',
    },
    {
      id: '4',
      coordinates: { latitude: 39.8681, longitude: 32.7489 },
      title: 'Mobil Uygulama Projesi',
      description:
        'iOS ve Android platformları için cross-platform mobil uygulama geliştirme.',
      type: 'job',
      color: '#3B82F6',
    },
  ]);

  // Handle location selection from picker
  const handleLocationSelect = useCallback(
    (coordinates: Coordinates, address?: string) => {
      setSelectedLocation(coordinates);
      console.log('Selected location:', coordinates, address);
    },
    []
  );

  // Handle search results
  const handleSearchResults = useCallback((results: LocationData[]) => {
    setSearchResults(results);
    console.log('Search results:', results);
  }, []);

  // Handle map marker click
  const handleMarkerClick = useCallback((marker: MapMarker) => {
    console.log('Marker clicked:', marker);
  }, []);

  // Handle map click
  const handleMapClick = useCallback((coordinates: Coordinates) => {
    console.log('Map clicked:', coordinates);

    // Add new marker at clicked location
    const newMarker: MapMarker = {
      id: `marker-${Date.now()}`,
      coordinates,
      title: 'Yeni Konum',
      description: 'Haritada tıklanarak eklenen konum',
      type: 'location',
      color: '#EF4444',
    };

    setMapMarkers((prev) => [...prev, newMarker]);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="rounded-full bg-blue-100 p-3">
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Lokasyon & Harita Demo
            </h1>
          </div>
          <p className="mx-auto max-w-2xl text-gray-600">
            Lokasyon bazlı arama, harita entegrasyonu ve konum seçme
            özelliklerini test edin. Bu demo sayfasında LocationPicker,
            LocationSearch ve MapView bileşenlerini deneyebilirsiniz.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mb-8 flex flex-wrap justify-center gap-4">
          <Button
            onClick={() => setShowPicker(true)}
            className="flex items-center gap-2"
            variant="outline"
          >
            <Navigation className="h-4 w-4" />
            Konum Seç
          </Button>

          <Button
            onClick={() => setShowSearch(!showSearch)}
            className="flex items-center gap-2"
            variant="outline"
          >
            <Search className="h-4 w-4" />
            Lokasyon Araması
          </Button>

          <Button
            onClick={() => setMapMarkers([])}
            className="flex items-center gap-2"
            variant="outline"
          >
            <Layers className="h-4 w-4" />
            Markerları Temizle
          </Button>
        </div>

        {/* Selected Location Display */}
        {selectedLocation && (
          <Card className="mb-6">
            <div className="p-4">
              <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold">
                <Globe className="h-5 w-5 text-green-600" />
                Seçilen Konum
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-600">Koordinatlar</p>
                  <p className="font-mono text-sm">
                    {selectedLocation.latitude.toFixed(6)},{' '}
                    {selectedLocation.longitude.toFixed(6)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Yaklaşık Adres</p>
                  <p className="text-sm">Ankara, Türkiye</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Location Search */}
          {showSearch && (
            <Card>
              <div className="p-6">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                  <Search className="h-5 w-5 text-blue-600" />
                  Lokasyon Araması
                </h2>
                <LocationSearch
                  onResults={handleSearchResults}
                  onLocationChange={setSelectedLocation}
                  defaultLocation={selectedLocation || undefined}
                  showLocationPicker={true}
                  showFilters={true}
                  autoSearch={true}
                />

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-6">
                    <h3 className="mb-3 text-lg font-medium">
                      Arama Sonuçları ({searchResults.length})
                    </h3>
                    <div className="max-h-60 space-y-3 overflow-y-auto">
                      {searchResults.map((result, index) => (
                        <div
                          key={index}
                          className="rounded-lg border border-gray-200 p-3 hover:bg-gray-50"
                        >
                          <div className="flex items-start gap-3">
                            <div className="rounded-lg bg-blue-100 p-2">
                              <MapPin className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium">
                                {result.name}
                              </h4>
                              <p className="mt-1 text-xs text-gray-600">
                                {result.address}
                              </p>
                              <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                                <span>Tip: {result.type}</span>
                                <span>
                                  {result.coordinates.latitude.toFixed(4)},{' '}
                                  {result.coordinates.longitude.toFixed(4)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Map View */}
          <Card className={showSearch ? '' : 'lg:col-span-2'}>
            <div className="p-6">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <MapPin className="h-5 w-5 text-green-600" />
                Harita Görünümü
              </h2>
              <div className="rounded-lg bg-gray-100 p-2">
                <MapView
                  markers={mapMarkers}
                  center={
                    selectedLocation || {
                      latitude: 39.9334,
                      longitude: 32.8597,
                    }
                  }
                  zoom={12}
                  showCurrentLocation={true}
                  showZoomControls={true}
                  showLayerControls={true}
                  interactive={true}
                  height="500px"
                  onMarkerClick={handleMarkerClick}
                  onMapClick={handleMapClick}
                />
              </div>

              {/* Map Info */}
              <div className="mt-4 text-sm text-gray-600">
                <p>
                  • Haritada herhangi bir yere tıklayarak yeni marker
                  ekleyebilirsiniz
                </p>
                <p>
                  • Zoom kontrolleri ve katman değiştirme butonlarını
                  kullanabilirsiniz
                </p>
                <p>• Mevcut konumunuzu görmek için konum butonuna tıklayın</p>
                <p>
                  • Marker&apos;lara tıklayarak detay bilgilerini görebilirsiniz
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Marker List */}
        {mapMarkers.length > 0 && (
          <Card className="mt-8">
            <div className="p-6">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <Layers className="h-5 w-5 text-purple-600" />
                Harita Marker&apos;ları ({mapMarkers.length})
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mapMarkers.map((marker) => (
                  <div
                    key={marker.id}
                    className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="mt-1 h-4 w-4 flex-shrink-0 rounded-full"
                        style={{ backgroundColor: marker.color }}
                      ></div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">{marker.title}</h4>
                        {marker.description && (
                          <p className="mt-1 line-clamp-2 text-xs text-gray-600">
                            {marker.description}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                          <span className="capitalize">{marker.type}</span>
                          <span>
                            {marker.coordinates.latitude.toFixed(4)},{' '}
                            {marker.coordinates.longitude.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Features Info */}
        <Card className="mt-8">
          <div className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Özellikler</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-blue-100 p-3">
                  <Navigation className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mb-2 font-semibold">Konum Seçici</h3>
                <p className="text-sm text-gray-600">
                  Kullanıcılar harita üzerinden veya arama yaparak konum
                  seçebilir. Mevcut konum desteği ile hızlı seçim yapılabilir.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-green-100 p-3">
                  <Search className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="mb-2 font-semibold">Lokasyon Araması</h3>
                <p className="text-sm text-gray-600">
                  Radius, tip ve fiyat filtrelerine göre çevredeki işleri,
                  hizmetleri ve freelancer&apos;ları bulabilir.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-purple-100 p-3">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="mb-2 font-semibold">Harita Görünümü</h3>
                <p className="text-sm text-gray-600">
                  Interactive harita ile marker&apos;ları görüntüleyebilir, zoom
                  yapabilir ve yeni konumlar ekleyebilir.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Location Picker Modal */}
      {showPicker && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white shadow-xl">
            <div className="p-4">
              <LocationPicker
                value={selectedLocation}
                onLocationSelect={handleLocationSelect}
                onClose={() => setShowPicker(false)}
                enableCurrentLocation={true}
                showMap={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
