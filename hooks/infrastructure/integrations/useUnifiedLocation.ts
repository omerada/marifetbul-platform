'use client';

// Unified Location Hook - consolidating useLocation and useLocationSearch
'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLocationStore } from '@/lib/core/store';
import logger from '@/lib/infrastructure/monitoring/logger';
import type { Coordinates, LocationData } from '@/types/core/base';

interface UseUnifiedLocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  autoWatch?: boolean;
  autocompleteDelay?: number;
}

interface LocationSearchOptions {
  radius?: number;
  limit?: number;
  language?: string;
}

interface UseUnifiedLocationReturn {
  // Current position state
  currentPosition: Coordinates | null;
  selectedLocation: LocationData | null;
  accuracy: number | null;

  // Search results
  searchResults: LocationData[];
  predictions: LocationData[];

  // Loading states
  isLoadingPosition: boolean;
  isSearching: boolean;
  isLoadingPredictions: boolean;

  // Error state
  error: string | null;

  // Position operations
  getCurrentPosition: () => Promise<void>;
  watchPosition: () => void;
  stopWatching: () => void;

  // Search operations
  searchLocations: (
    query: string,
    options?: LocationSearchOptions
  ) => Promise<void>;
  getAutocomplete: (
    input: string,
    options?: LocationSearchOptions
  ) => Promise<void>;

  // Selection operations
  selectLocation: (location: LocationData) => void;
  clearSelection: () => void;

  // Utilities
  calculateDistance: (location1: Coordinates, location2: Coordinates) => number;
  clearResults: () => void;
  clearPredictions: () => void;
  clearError: () => void;
  reset: () => void;
}

export function useUnifiedLocation(
  options: UseUnifiedLocationOptions = {}
): UseUnifiedLocationReturn {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 300000,
    autoWatch = false,
    autocompleteDelay = 300,
  } = options;

  const store = useLocationStore();
  const [isLoadingPosition, setIsLoadingPosition] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const autocompleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Position options
  const positionOptions = useMemo(
    () => ({
      enableHighAccuracy,
      timeout,
      maximumAge,
    }),
    [enableHighAccuracy, timeout, maximumAge]
  );

  // Get current position
  const getCurrentPosition = useCallback(async () => {
    if (!navigator.geolocation) {
      logger.error('Geolocation is not supported by this browser');
      return;
    }

    setIsLoadingPosition(true);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            positionOptions
          );
        }
      );

      // Store'un getCurrentLocation method'unu çağır
      await store.getCurrentLocation();
      setAccuracy(position.coords.accuracy);
    } catch (error) {
      logger.error('Failed to get current position:', error);
    } finally {
      setIsLoadingPosition(false);
    }
  }, [store, positionOptions]);

  // Watch position
  const watchPosition = useCallback(() => {
    if (!navigator.geolocation) {
      logger.error('Geolocation is not supported by this browser');
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        // Store'un getCurrentLocation method'unu çağır
        await store.getCurrentLocation();
        setAccuracy(position.coords.accuracy);
      },
      (error) => {
        logger.error('Position watch error:', error);
      },
      positionOptions
    );
  }, [store, positionOptions]);

  // Stop watching position
  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Search locations
  const searchLocations = useCallback(
    async (query: string, searchOptions?: LocationSearchOptions) => {
      if (query.length < 2) {
        store.clearSearchResults();
        return;
      }

      try {
        const request = {
          query,
          coordinates: store.currentLocation || undefined,
          radius: searchOptions?.radius || 50,
          limit: searchOptions?.limit || 10,
          language: searchOptions?.language || 'tr',
        };

        await store.searchLocations(request);
      } catch (error) {
        logger.error('Location search failed:', error);
      }
    },
    [store]
  );

  // Get autocomplete predictions
  const getAutocomplete = useCallback(
    async (input: string, searchOptions?: LocationSearchOptions) => {
      if (input.length < 2) {
        store.clearPredictions();
        return;
      }

      // Clear previous timeout
      if (autocompleteTimeoutRef.current) {
        clearTimeout(autocompleteTimeoutRef.current);
      }

      // Set new timeout for debouncing
      autocompleteTimeoutRef.current = setTimeout(async () => {
        try {
          const request = {
            input,
            coordinates: store.currentLocation || undefined,
            radius: searchOptions?.radius || 50,
            limit: searchOptions?.limit || 5,
            language: searchOptions?.language || 'tr',
          };

          await store.getAutocomplete(request);
        } catch (error) {
          logger.error('Autocomplete failed:', error);
        }
      }, autocompleteDelay);
    },
    [store, autocompleteDelay]
  );

  // Calculate distance between two coordinates
  const calculateDistance = useCallback(
    (location1: Coordinates, location2: Coordinates): number => {
      const R = 6371; // Earth's radius in kilometers

      // Use lat/lng with fallback to latitude/longitude
      const lat1 = location1.latitude ?? location1.lat;
      const lat2 = location2.latitude ?? location2.lat;
      const lng1 = location1.longitude ?? location1.lng;
      const lng2 = location2.longitude ?? location2.lng;

      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLng = ((lng2 - lng1) * Math.PI) / 180;

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },
    []
  );

  // Select a location
  const selectLocation = useCallback(
    (location: LocationData) => {
      store.setSelectedLocation(location);
    },
    [store]
  );

  // Clear selection
  const clearSelection = useCallback(() => {
    store.setSelectedLocation(null);
  }, [store]);

  // Clear search results
  const clearResults = useCallback(() => {
    store.clearSearchResults();
  }, [store]);

  // Clear predictions
  const clearPredictions = useCallback(() => {
    store.clearPredictions();
  }, [store]);

  // Reset all state
  const reset = useCallback(() => {
    store.clearSearchResults();
    store.clearPredictions();
    store.setSelectedLocation(null);
    store.clearError();
    setAccuracy(null);
    stopWatching();
  }, [store, stopWatching]);

  // Auto-watch position if enabled
  useEffect(() => {
    if (autoWatch) {
      watchPosition();
      return stopWatching;
    }
  }, [autoWatch, watchPosition, stopWatching]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWatching();
      if (autocompleteTimeoutRef.current) {
        clearTimeout(autocompleteTimeoutRef.current);
      }
    };
  }, [stopWatching]);

  return {
    // Current position state
    currentPosition: store.currentLocation,
    selectedLocation: store.selectedLocation,
    accuracy,

    // Search results (type assertion to match interface)
    searchResults: store.searchResults as unknown as LocationData[],
    predictions: store.predictions as unknown as LocationData[],

    // Loading states
    isLoadingPosition,
    isSearching: store.isLoading,
    isLoadingPredictions: store.isLoading,

    // Error state
    error: store.error,

    // Position operations
    getCurrentPosition,
    watchPosition,
    stopWatching,

    // Search operations
    searchLocations,
    getAutocomplete,

    // Selection operations
    selectLocation,
    clearSelection,

    // Utilities
    calculateDistance,
    clearResults,
    clearPredictions,
    clearError: store.clearError,
    reset,
  };
}

export default useUnifiedLocation;
