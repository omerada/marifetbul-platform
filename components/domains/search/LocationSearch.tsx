'use client';

/**
 * Location Search Component
 * Lokasyon bazlı arama bileşeni
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  Search,
  MapPin,
  SlidersHorizontal,
  Navigation,
  Loader2,
} from 'lucide-react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui';
import { LocationPicker } from '@/components/shared/utilities';
import { Coordinates, LocationSearchParams, LocationData } from '@/types';
import { useUnifiedLocation } from '@/hooks';
import logger from '@/lib/infrastructure/monitoring/logger';

interface LocationSearchProps {
  onResults?: (results: LocationData[]) => void;
  onLocationChange?: (coordinates: Coordinates) => void;
  defaultLocation?: Coordinates;
  searchTypes?: string[];
  showLocationPicker?: boolean;
  showFilters?: boolean;
  autoSearch?: boolean;
  className?: string;
}

interface SearchFilters {
  radius: number;
  types: string[];
  minPrice?: number;
  maxPrice?: number;
  category?: string;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  onResults,
  onLocationChange,
  defaultLocation,
  searchTypes = ['job', 'service', 'freelancer'],
  showLocationPicker = true,
  showFilters = true,
  autoSearch = true,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(
    defaultLocation || null
  );
  const [showPicker, setShowPicker] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    radius: 10,
    types: searchTypes,
  });

  const unifiedLocation = useUnifiedLocation();
  const { getCurrentPosition, isLoadingPosition: geoLoading } = unifiedLocation;

  // Distance formatting utility
  const formatDistance = useCallback((distance: number) => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  }, []);

  // Real states for location search
  const [results, setResults] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle search
  const handleSearch = useCallback(async () => {
    if (!currentLocation) return;

    const searchParams: LocationSearchParams = {
      location: currentLocation,
      radius: filters.radius,
      query: searchQuery.trim() || '',
      limit: 20,
    };

    try {
      setLoading(true);
      setError(null);

      // Real API call for location-based search
      const response = await fetch('/api/v1/search/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(searchParams),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      const searchResults = data.data || [];
      setResults(searchResults);

      if (onResults) {
        onResults(searchResults as never);
      }
    } catch (err) {
      logger.error(
        'Search error',
        err instanceof Error ? err : new Error(String(err))
      );
    }
  }, [currentLocation, filters, searchQuery, onResults]);

  // Handle location selection
  const handleLocationSelect = useCallback(
    (coordinates: Coordinates) => {
      setCurrentLocation(coordinates);
      setShowPicker(false);

      if (onLocationChange) {
        onLocationChange(coordinates);
      }

      if (autoSearch) {
        // Trigger search with new location
        setTimeout(handleSearch, 100);
      }
    },
    [onLocationChange, autoSearch, handleSearch]
  );

  // Handle current location
  const handleUseCurrentLocation = useCallback(async () => {
    try {
      if (!getCurrentPosition) {
        logger.warn(
          'getCurrentPosition not available',
          new Error('Geolocation API unavailable')
        );
        return;
      }

      await getCurrentPosition();
      const currentLocationData = unifiedLocation.currentPosition;

      if (currentLocationData) {
        // Validate coordinates exist
        if (!currentLocationData.latitude || !currentLocationData.longitude) {
          logger.error('Invalid location coordinates');
          return;
        }

        // Convert Coordinates to expected format
        const locationData: Coordinates = {
          lat: currentLocationData.latitude,
          lng: currentLocationData.longitude,
          latitude: currentLocationData.latitude,
          longitude: currentLocationData.longitude,
        };
        handleLocationSelect(locationData);
      }
    } catch (err) {
      logger.error(
        'Current location error',
        err instanceof Error ? err : new Error(String(err))
      );
    }
  }, [
    getCurrentPosition,
    handleLocationSelect,
    unifiedLocation.currentPosition,
  ]);

  // Handle filter changes
  const handleFilterChange = useCallback(
    (
      key: keyof SearchFilters,
      value: string | number | string[] | undefined
    ) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  // Auto search when filters change
  useEffect(() => {
    if (autoSearch && currentLocation) {
      const timeoutId = setTimeout(handleSearch, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [filters, autoSearch, currentLocation, handleSearch]);

  return (
    <div className={`location-search ${className}`}>
      {/* Search Header */}
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ne arıyorsunuz?"
            className="pl-10"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        <Button onClick={handleSearch} disabled={loading || !currentLocation}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Location and Filters Bar */}
      <div className="mb-4 flex flex-wrap gap-2">
        {/* Current Location Display */}
        {currentLocation ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPicker(true)}
            className="flex items-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            <span className="text-sm">
              {currentLocation.lat.toFixed(3)}, {currentLocation.lng.toFixed(3)}
            </span>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={
              showLocationPicker
                ? () => setShowPicker(true)
                : handleUseCurrentLocation
            }
            disabled={geoLoading}
            className="flex items-center gap-2"
          >
            <Navigation
              className={`h-4 w-4 ${geoLoading ? 'animate-spin' : ''}`}
            />
            <span className="text-sm">Konum Seç</span>
          </Button>
        )}

        {/* Radius Filter */}
        <select
          value={filters.radius}
          onChange={(e) => handleFilterChange('radius', Number(e.target.value))}
          className="rounded-md border border-gray-300 px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value={1}>1 km</option>
          <option value={5}>5 km</option>
          <option value={10}>10 km</option>
          <option value={25}>25 km</option>
          <option value={50}>50 km</option>
          <option value={100}>100 km</option>
        </select>

        {/* Type Filter */}
        <select
          value={filters.types.length === 1 ? filters.types[0] : 'all'}
          onChange={(e) => {
            const value = e.target.value;
            handleFilterChange(
              'types',
              value === 'all' ? searchTypes : [value]
            );
          }}
          className="rounded-md border border-gray-300 px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="all">Tümü</option>
          <option value="job">İş İlanları</option>
          <option value="service">Hizmetler</option>
          <option value="freelancer">Freelancer&apos;lar</option>
        </select>

        {/* Advanced Filters Toggle */}
        {showFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className={`flex items-center gap-2 ${showFiltersPanel ? 'border-blue-300 bg-blue-50' : ''}`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="text-sm">Filtreler</span>
          </Button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showFiltersPanel && (
        <Card className="mb-4">
          <div className="space-y-4 p-4">
            <h4 className="text-sm font-medium text-gray-700">
              Gelişmiş Filtreler
            </h4>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Price Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Fiyat Aralığı
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice || ''}
                    onChange={(e) =>
                      handleFilterChange(
                        'minPrice',
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    className="text-sm"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice || ''}
                    onChange={(e) =>
                      handleFilterChange(
                        'maxPrice',
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Kategori
                </label>
                <select
                  value={filters.category || ''}
                  onChange={(e) =>
                    handleFilterChange('category', e.target.value || undefined)
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Tüm Kategoriler</option>
                  <option value="yazilim">Yazılım Geliştirme</option>
                  <option value="tasarim">Tasarım</option>
                  <option value="pazarlama">Pazarlama</option>
                  <option value="ceviri">Çeviri</option>
                  <option value="video">Video & Animasyon</option>
                  <option value="muhasebe">Muhasebe</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={handleSearch} className="flex-1">
                Filtrele
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilters({
                    radius: 10,
                    types: searchTypes,
                  });
                  setSearchQuery('');
                }}
                className="flex-1"
              >
                Temizle
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Results Summary */}
      {results && results.length > 0 && (
        <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
          <span>{results.length} sonuç bulundu</span>
          {currentLocation && formatDistance && (
            <span>Yarıçap: {formatDistance(filters.radius)}</span>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Card className="mb-4 border-red-200 bg-red-50">
          <div className="p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </Card>
      )}

      {/* Location Picker Modal */}
      {showPicker && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white shadow-xl">
            <div className="p-4">
              <LocationPicker
                value={currentLocation}
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
};
