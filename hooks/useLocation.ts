/**
 * Map and Location Hooks
 * Harita ve konum yönetimi hook'ları
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Coordinates,
  LocationData,
  MapBounds,
  LocationSearchParams,
} from '@/types';
import { MapUtils, geolocationService } from '@/lib/utils/map-utils';

export interface UseLocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  autoWatch?: boolean;
}

export interface UseLocationState {
  position: Coordinates | null;
  error: string | null;
  loading: boolean;
  accuracy: number | null;
}

// Hook for managing user's current location
export const useGeolocation = (options: UseLocationOptions = {}) => {
  const [state, setState] = useState<UseLocationState>({
    position: null,
    error: null,
    loading: false,
    accuracy: null,
  });

  const watchIdRef = useRef<number | null>(null);

  const getCurrentPosition = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const position = await geolocationService.getCurrentPosition({
        enableHighAccuracy: options.enableHighAccuracy ?? true,
        timeout: options.timeout ?? 10000,
        maximumAge: options.maximumAge ?? 300000,
      });

      setState((prev) => ({
        ...prev,
        position,
        loading: false,
        accuracy: null, // Navigator position would have accuracy, but our service doesn't provide it
      }));

      return position;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Konum alınamadı',
        loading: false,
      }));
      throw error;
    }
  }, [options.enableHighAccuracy, options.timeout, options.maximumAge]);

  const watchPosition = useCallback(() => {
    if (watchIdRef.current !== null) return;

    try {
      watchIdRef.current = geolocationService.watchPosition(
        (position) => {
          setState((prev) => ({
            ...prev,
            position,
            error: null,
            loading: false,
          }));
        },
        {
          enableHighAccuracy: options.enableHighAccuracy ?? true,
          timeout: options.timeout ?? 10000,
          maximumAge: options.maximumAge ?? 60000,
        }
      );
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : 'Konum takibi başlatılamadı',
        loading: false,
      }));
    }
  }, [options.enableHighAccuracy, options.timeout, options.maximumAge]);

  const clearWatch = useCallback(() => {
    if (watchIdRef.current !== null) {
      geolocationService.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (options.autoWatch) {
      watchPosition();
    }

    return () => {
      clearWatch();
    };
  }, [options.autoWatch, watchPosition, clearWatch]);

  return {
    ...state,
    getCurrentPosition,
    watchPosition,
    clearWatch,
    isSupported: typeof window !== 'undefined' && 'geolocation' in navigator,
  };
};

export interface UseLocationSearchState {
  results: LocationData[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  total: number;
}

// Hook for location-based search
export const useLocationBasedSearch = () => {
  const [state, setState] = useState<UseLocationSearchState>({
    results: [],
    loading: false,
    error: null,
    hasMore: false,
    total: 0,
  });

  const searchByLocation = useCallback(async (params: LocationSearchParams) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const query = new URLSearchParams();

      if (params.coordinates) {
        query.append('lat', params.coordinates.latitude.toString());
        query.append('lng', params.coordinates.longitude.toString());
      }

      if (params.radius) {
        query.append('radius', params.radius.toString());
      }

      if (params.type) {
        query.append('type', params.type);
      }

      if (params.category) {
        query.append('category', params.category);
      }

      if (params.query) {
        query.append('q', params.query);
      }

      if (params.minPrice) {
        query.append('minPrice', params.minPrice.toString());
      }

      if (params.maxPrice) {
        query.append('maxPrice', params.maxPrice.toString());
      }

      query.append('page', (params.page || 1).toString());
      query.append('limit', (params.limit || 20).toString());

      const response = await fetch(`/api/location/search?${query.toString()}`);

      if (!response.ok) {
        throw new Error('Arama başarısız');
      }

      const data = await response.json();

      setState((prev) => ({
        ...prev,
        results:
          params.page === 1 ? data.results : [...prev.results, ...data.results],
        loading: false,
        hasMore: data.hasMore,
        total: data.total,
      }));

      return data;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : 'Arama sırasında hata oluştu',
        loading: false,
      }));
      throw error;
    }
  }, []);

  const clearResults = useCallback(() => {
    setState({
      results: [],
      loading: false,
      error: null,
      hasMore: false,
      total: 0,
    });
  }, []);

  return {
    ...state,
    searchByLocation,
    clearResults,
  };
};

export interface UseMapBoundsState {
  bounds: MapBounds | null;
  center: Coordinates | null;
  zoom: number;
}

// Hook for managing map bounds and viewport
export const useMapBounds = () => {
  const [state, setState] = useState<UseMapBoundsState>({
    bounds: null,
    center: null,
    zoom: 10,
  });

  const setBounds = useCallback((bounds: MapBounds) => {
    setState((prev) => ({ ...prev, bounds }));
  }, []);

  const setCenter = useCallback((center: Coordinates, zoom?: number) => {
    setState((prev) => ({
      ...prev,
      center,
      zoom: zoom ?? prev.zoom,
    }));
  }, []);

  const calculateBoundsFromCoordinates = useCallback(
    (coordinates: Coordinates[], padding = 0.01) => {
      if (coordinates.length === 0) return;

      const bounds = MapUtils.calculateBounds(coordinates, padding);
      const center = MapUtils.calculateCenter(coordinates);

      setState((prev) => ({
        ...prev,
        bounds,
        center,
      }));
    },
    []
  );

  const fitToCoordinates = useCallback(
    (coordinates: Coordinates[], padding = 0.01) => {
      calculateBoundsFromCoordinates(coordinates, padding);
    },
    [calculateBoundsFromCoordinates]
  );

  return {
    ...state,
    setBounds,
    setCenter,
    calculateBoundsFromCoordinates,
    fitToCoordinates,
  };
};

// Hook for distance calculations
export const useDistanceCalculator = () => {
  const calculateDistance = useCallback(
    (coord1: Coordinates, coord2: Coordinates) => {
      return MapUtils.calculateDistance(coord1, coord2);
    },
    []
  );

  const formatDistance = useCallback((distanceKm: number) => {
    return MapUtils.formatDistance(distanceKm);
  }, []);

  const isWithinRadius = useCallback(
    (coordinate: Coordinates, center: Coordinates, radiusKm: number) => {
      return MapUtils.isWithinRadius(coordinate, center, radiusKm);
    },
    []
  );

  const sortByDistance = useCallback(
    <T extends { coordinates: Coordinates }>(
      items: T[],
      referencePoint: Coordinates
    ): T[] => {
      return [...items].sort((a, b) => {
        const distanceA = calculateDistance(referencePoint, a.coordinates);
        const distanceB = calculateDistance(referencePoint, b.coordinates);
        return distanceA - distanceB;
      });
    },
    [calculateDistance]
  );

  return {
    calculateDistance,
    formatDistance,
    isWithinRadius,
    sortByDistance,
  };
};

// Hook for geocoding
export const useGeocoding = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geocode = useCallback(
    async (address: string): Promise<Coordinates | null> => {
      setLoading(true);
      setError(null);

      try {
        const coordinates = await MapUtils.geocodeAddress(address);
        setLoading(false);
        return coordinates;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Geocoding başarısız');
        setLoading(false);
        return null;
      }
    },
    []
  );

  const reverseGeocode = useCallback(
    async (coordinates: Coordinates): Promise<string | null> => {
      setLoading(true);
      setError(null);

      try {
        const address = await MapUtils.reverseGeocode(coordinates);
        setLoading(false);
        return address;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Reverse geocoding başarısız'
        );
        setLoading(false);
        return null;
      }
    },
    []
  );

  return {
    geocode,
    reverseGeocode,
    loading,
    error,
  };
};
