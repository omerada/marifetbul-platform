'use client';

/**
 * Location Picker Component
 * Konum seçme bileþeni
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, MapPin, X, Target, Map } from 'lucide-react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui';
import { useUnifiedLocation } from '@/hooks';
import logger from '@/lib/infrastructure/monitoring/logger';
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
        // Call backend geocoding API
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
        const response = await fetch(
          `${apiUrl}/geocoding/search?q=${encodeURIComponent(value)}`
        );

        if (!response.ok) {
          throw new Error('Geocoding search failed');
        }

        const data = await response.json();
        const results: SearchResult[] = data.results || [];

        setSearchResults(results);
        setShowResults(true);
      } catch (error) {
        logger.error('Geocoding search error:', error instanceof Error ? error : new Error(String(error)));
        setSearchResults([]);
        setShowResults(false);
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

      // Ensure we have valid coordinates
      if (!position.latitude || !position.longitude) {
        logger.error('Invalid position coordinates');
        return;
      }

      const currentCoordinates: Coordinates = {
        lat: position.latitude,
        lng: position.longitude,
        latitude: position.latitude,
        longitude: position.longitude,
      };

      setSelectedLocation(currentCoordinates);

      // Get address for current location (simplified for now)
      const address = `${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)}`;

      onLocationSelect(currentCoordinates, address);

      setSearchQuery(address);
      setShowResults(false);
    } catch (error) {
      logger.error('Current location error:', error instanceof Error ? error : new Error(String(error)));
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
              <Map className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Seçilen Konum
              </span>
            </div>

            {/* Production note: Map visualization awaiting real map library integration */}
            <div className="relative h-48 overflow-hidden rounded-lg bg-gray-100">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="mx-auto mb-2 h-8 w-8 text-red-500" />
                  <p className="text-sm text-gray-600">
                    {selectedLocation.lat.toFixed(4)},{' '}
                    {selectedLocation.lng.toFixed(4)}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {searchQuery || 'Seçilen konum'}
                  </p>
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
                &ldquo;{searchQuery}&rdquo; için sonuç bulunamadý
              </p>
              <p className="mt-1 text-xs">Farklý bir arama terimý deneyin</p>
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
            Ýptal
          </Button>
        )}
      </div>
    </div>
  );
};

export default LocationPicker;
