'use client';

import { useCallback, useRef } from 'react';
import { useLocationStore } from '@/lib/store';
import {
  LocationSearchRequest,
  LocationAutocompleteRequest,
  GeocodeRequest,
  LocationData,
} from '@/types';

export function useLocationSearch() {
  const store = useLocationStore();
  const autocompleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Search locations with current location context
  const searchLocations = useCallback(
    async (query: string, options?: Partial<LocationSearchRequest>) => {
      const request: LocationSearchRequest = {
        query,
        coordinates: store.currentLocation || undefined,
        radius: 50, // Default 50km radius
        limit: 10,
        language: 'tr',
        ...options,
      };

      await store.searchLocations(request);
    },
    [store]
  );

  // Get autocomplete predictions with debouncing
  const getAutocomplete = useCallback(
    async (input: string, options?: Partial<LocationAutocompleteRequest>) => {
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
        const request: LocationAutocompleteRequest = {
          input,
          coordinates: store.currentLocation || undefined,
          radius: 50,
          language: 'tr',
          ...options,
        };

        await store.getAutocomplete(request);
      }, 300);
    },
    [store]
  );

  // Geocode address or coordinates
  const geocode = useCallback(
    async (options: GeocodeRequest) => {
      await store.geocode(options);
    },
    [store]
  );

  // Get current location with permission handling
  const getCurrentLocation = useCallback(async () => {
    await store.getCurrentLocation();
  }, [store]);

  // Select location and optionally geocode for more details
  const selectLocation = useCallback(
    async (location: LocationData, shouldGeocode = true) => {
      store.setSelectedLocation(location);

      if (shouldGeocode && location.coordinates) {
        await geocode({ coordinates: location.coordinates });
      }
    },
    [store, geocode]
  );

  // Clear autocomplete timeout on unmount or when function changes
  const clearAutocompleteTimeout = useCallback(() => {
    if (autocompleteTimeoutRef.current) {
      clearTimeout(autocompleteTimeoutRef.current);
      autocompleteTimeoutRef.current = null;
    }
  }, []);

  return {
    // State
    currentLocation: store.currentLocation,
    selectedLocation: store.selectedLocation,
    searchResults: store.searchResults,
    predictions: store.predictions,
    isLoading: store.isLoading,
    isGettingLocation: store.isGettingLocation,
    error: store.error,
    permissionStatus: store.permissionStatus,

    // Computed
    hasLocationPermission: store.permissionStatus === 'granted',
    isLocationAvailable:
      typeof navigator !== 'undefined' && 'geolocation' in navigator,

    // Actions
    searchLocations,
    getAutocomplete,
    geocode,
    getCurrentLocation,
    selectLocation,
    setSelectedLocation: store.setSelectedLocation,
    clearSearchResults: store.clearSearchResults,
    clearPredictions: store.clearPredictions,
    clearAutocompleteTimeout,
    clearError: store.clearError,
    reset: store.reset,
  };
}
