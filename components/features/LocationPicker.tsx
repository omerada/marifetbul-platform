'use client';

/**
 * Location Picker Component
 * Konum seçme bileşeni
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, MapPin, X, Target, MapIcon } from 'lucide-react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useUnifiedLocation } from '@/hooks';
import type { Coordinates } from '@/types';

interface LocationPickerProps {
  value?: Coordinates | null;
  onLocationSelect: (location: Coordinates, address?: string) => void;
  onClose?: () => void;
  placeholder?: string;
  enableCurrentLocation?: boolean;
  showMap?: boolean;
  className?: string;
}

interface SearchResult {
  id: string;
  displayName: string;
  address: string;
  coordinates: Coordinates;
  type: string;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onLocationSelect,
  onClose,
  placeholder = 'Konum ara veya haritadan seç...',
  enableCurrentLocation = true,
  showMap = true,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Coordinates | null>(
    value || null
  );
  const [showResults, setShowResults] = useState(false);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const unifiedLocation = useUnifiedLocation();
  const { getCurrentPosition, isLoadingPosition: geoLoading } = unifiedLocation;

  // Handle search input change
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);

      try {
        // Mock search results - in real app, use geocoding API
        const mockResults: SearchResult[] = [
          {
            id: '1',
            displayName: 'Kızılay, Çankaya',
            address: 'Kızılay, Çankaya, Ankara, Türkiye',
            coordinates: {
              latitude: 39.9199,
              longitude: 32.8543,
              lat: 39.9199,
              lng: 32.8543,
            },
            type: 'neighborhood',
          },
          {
            id: '2',
            displayName: 'Bahçelievler',
            address: 'Bahçelievler, Ankara, Türkiye',
            coordinates: {
              latitude: 39.94,
              longitude: 32.82,
              lat: 39.94,
              lng: 32.82,
            },
            type: 'district',
          },
          {
            id: '3',
            displayName: 'Bilkent',
            address: 'Bilkent, Çankaya, Ankara, Türkiye',
            coordinates: {
              latitude: 39.8681,
              longitude: 32.7489,
              lat: 39.8681,
              lng: 32.7489,
            },
            type: 'neighborhood',
          },
        ].filter(
          (result) =>
            result.displayName.toLowerCase().includes(value.toLowerCase()) ||
            result.address.toLowerCase().includes(value.toLowerCase())
        );

        setSearchResults(mockResults);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      }

      setIsSearching(false);
    }, 500);
  }, []);

  // Handle current location
  const handleCurrentLocation = useCallback(async () => {
    try {
      if (!getCurrentPosition) {
        throw new Error('getCurrentPosition not available');
      }

      // Get current position using unified location
      await getCurrentPosition();
      const position = unifiedLocation.currentPosition;

      if (!position) {
        throw new Error('Could not get current position');
      }

      const currentCoordinates = {
        latitude: position.latitude,
        longitude: position.longitude,
        lat: position.latitude,
        lng: position.longitude,
      };

      setSelectedLocation(currentCoordinates);

      // Get address for current location (simplified for now)
      const address = `${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)}`;

      onLocationSelect(currentCoordinates, address);

      setSearchQuery(address);
      setShowResults(false);
    } catch (error) {
      console.error('Current location error:', error);
    }
  }, [getCurrentPosition, unifiedLocation.currentPosition, onLocationSelect]);

  // Handle search result selection
  const handleResultSelect = useCallback(
    (result: SearchResult) => {
      setSelectedLocation(result.coordinates);
      setSearchQuery(result.displayName);
      setShowResults(false);
      onLocationSelect(result.coordinates, result.address);
    },
    [onLocationSelect]
  );

  // Clear selection
  const handleClear = useCallback(() => {
    setSearchQuery('');
    setSelectedLocation(null);
    setSearchResults([]);
    setShowResults(false);
  }, []);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`location-picker ${className}`}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <MapPin className="h-5 w-5" />
          Konum Seç
        </h3>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={placeholder}
            className="pr-20 pl-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute top-1/2 right-12 h-6 w-6 -translate-y-1/2 transform p-1"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          {enableCurrentLocation && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCurrentLocation}
              disabled={geoLoading}
              className="absolute top-1/2 right-2 h-6 w-6 -translate-y-1/2 transform p-1"
              title="Mevcut konumumu kullan"
            >
              <Target
                className={`h-3 w-3 ${geoLoading ? 'animate-spin' : ''}`}
              />
            </Button>
          )}
        </div>

        {/* Loading indicator */}
        {isSearching && (
          <div className="absolute top-1/2 right-14 -translate-y-1/2 transform">
            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {showResults && searchResults.length > 0 && (
        <Card className="mb-4 max-h-60 overflow-y-auto">
          <div className="p-2">
            {searchResults.map((result) => (
              <button
                key={result.id}
                onClick={() => handleResultSelect(result)}
                className="w-full rounded-lg border-b border-gray-100 p-3 text-left transition-colors last:border-b-0 hover:bg-gray-50"
              >
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 h-4 w-4 flex-shrink-0 text-gray-400" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {result.displayName}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {result.address}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Map Preview */}
      {showMap && selectedLocation && (
        <Card className="mb-4">
          <div className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <MapIcon className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Seçilen Konum
              </span>
            </div>

            {/* Mock map - in real app, use Google Maps or similar */}
            <div className="relative h-48 overflow-hidden rounded-lg bg-gray-100">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="mx-auto mb-2 h-8 w-8 text-red-500" />
                  <p className="text-sm text-gray-600">
                    {selectedLocation.latitude.toFixed(4)},{' '}
                    {selectedLocation.longitude.toFixed(4)}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {searchQuery || 'Seçilen konum'}
                  </p>
                </div>
              </div>

              {/* Mock map grid */}
              <div className="absolute inset-0 opacity-20">
                <div className="grid h-full grid-cols-8 grid-rows-6">
                  {Array.from({ length: 48 }).map((_, i) => (
                    <div key={i} className="border border-gray-300"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* No Results */}
      {showResults &&
        searchResults.length === 0 &&
        searchQuery.trim().length >= 2 &&
        !isSearching && (
          <Card className="mb-4">
            <div className="p-4 text-center text-gray-500">
              <MapPin className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p className="text-sm">
                &ldquo;{searchQuery}&rdquo; için sonuç bulunamadı
              </p>
              <p className="mt-1 text-xs">Farklı bir arama terimı deneyin</p>
            </div>
          </Card>
        )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {selectedLocation && (
          <Button
            onClick={() => onLocationSelect(selectedLocation, searchQuery)}
            className="flex-1"
            disabled={!selectedLocation}
          >
            Konumu Onayla
          </Button>
        )}
        {onClose && (
          <Button variant="outline" onClick={onClose} className="flex-1">
            İptal
          </Button>
        )}
      </div>
    </div>
  );
};

export default LocationPicker;
