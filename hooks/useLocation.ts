import { useState, useCallback } from 'react';

export interface LocationData {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
}

export interface UseLocationReturn {
  currentLocation: LocationData | null;
  isLoading: boolean;
  error: string | null;
  getCurrentLocation: () => Promise<void>;
  searchLocations: (query: string) => Promise<LocationData[]>;
  setCurrentLocation: (location: LocationData) => void;
  // Additional properties for compatibility
  getCurrentPosition?: () => Promise<Coordinates | void>;
  loading?: boolean;
  // Additional location features
  results?: LocationData[];
  searchByLocation?: (params: {
    query: string;
    coordinates?: Coordinates;
  }) => Promise<void>;
  formatDistance?: (distance: number) => string;
  setBounds?: (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => void;
  fitToCoordinates?: (coordinates: Coordinates[]) => void;
  reverseGeocode?: (lat: number, lng: number) => Promise<string | null>;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
  lat: number;
  lng: number;
}

export const useLocation = (): UseLocationReturn => {
  const [currentLocation, setCurrentLocationState] =
    useState<LocationData | null>(null);
  const [results, setResults] = useState<LocationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentPosition =
    useCallback(async (): Promise<Coordinates | void> => {
      setIsLoading(true);
      setError(null);

      try {
        if (!navigator.geolocation) {
          throw new Error('Geolocation is not supported');
        }

        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          }
        );

        const coordinates: Coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        return coordinates;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get location');
        return undefined;
      } finally {
        setIsLoading(false);
      }
    }, []);

  const getCurrentLocation = useCallback(async () => {
    const position = await getCurrentPosition();
    if (position) {
      // Mock reverse geocoding
      const mockLocation: LocationData = {
        id: 'current',
        name: 'Current Location',
        address: '123 Main St',
        city: 'Istanbul',
        state: 'Istanbul',
        country: 'Turkey',
        lat: position.lat,
        lng: position.lng,
      };

      setCurrentLocationState(mockLocation);
    }
  }, [getCurrentPosition]);

  const searchByLocation = useCallback(
    async (params: { query: string; coordinates?: Coordinates }) => {
      setIsLoading(true);
      setError(null);

      try {
        const searchResults = await searchLocations(params.query);
        setResults(searchResults);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to search locations'
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const formatDistance = useCallback((distance: number): string => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  }, []);

  const setBounds = useCallback(
    (bounds: { north: number; south: number; east: number; west: number }) => {
      // Mock implementation - in real app would set map bounds
      console.log('Setting bounds:', bounds);
    },
    []
  );

  const fitToCoordinates = useCallback((coordinates: Coordinates[]) => {
    // Mock implementation - in real app would fit map to coordinates
    console.log('Fitting to coordinates:', coordinates);
  }, []);

  const reverseGeocode = useCallback(
    async (lat: number, lng: number): Promise<string | null> => {
      try {
        // Mock reverse geocoding
        return `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      } catch (err) {
        console.error('Reverse geocoding failed:', err);
        return null;
      }
    },
    []
  );

  const searchLocations = useCallback(
    async (query: string): Promise<LocationData[]> => {
      if (!query.trim()) return [];

      try {
        // Mock location search
        const mockResults: LocationData[] = [
          {
            id: '1',
            name: 'Istanbul, Turkey',
            address: 'Istanbul',
            city: 'Istanbul',
            state: 'Istanbul',
            country: 'Turkey',
            lat: 41.0082,
            lng: 28.9784,
          },
          {
            id: '2',
            name: 'Ankara, Turkey',
            address: 'Ankara',
            city: 'Ankara',
            state: 'Ankara',
            country: 'Turkey',
            lat: 39.9334,
            lng: 32.8597,
          },
        ].filter((location) =>
          location.name.toLowerCase().includes(query.toLowerCase())
        );

        return mockResults;
      } catch (err) {
        console.error('Failed to search locations:', err);
        return [];
      }
    },
    []
  );

  const setCurrentLocation = useCallback((location: LocationData) => {
    setCurrentLocationState(location);
  }, []);

  return {
    currentLocation,
    results,
    isLoading,
    error,
    getCurrentLocation,
    getCurrentPosition,
    searchLocations,
    searchByLocation,
    setCurrentLocation,
    formatDistance,
    setBounds,
    fitToCoordinates,
    reverseGeocode,
    // Compatibility aliases
    loading: isLoading,
  };
};

// Additional hooks for compatibility
export const useGeolocation = () => {
  const locationHook = useLocation();
  return {
    ...locationHook,
    getCurrentPosition: locationHook.getCurrentPosition,
  };
};

export const useGeocoding = () => {
  const locationHook = useLocation();
  return {
    ...locationHook,
    reverseGeocode: locationHook.reverseGeocode,
    loading: locationHook.isLoading,
  };
};

export const useLocationBasedSearch = () => {
  const locationHook = useLocation();
  return {
    ...locationHook,
    searchByLocation: locationHook.searchByLocation,
  };
};

export const useDistanceCalculator = () => {
  const locationHook = useLocation();
  return {
    ...locationHook,
    formatDistance: locationHook.formatDistance,
  };
};

export const useMapBounds = () => {
  const locationHook = useLocation();
  return {
    ...locationHook,
    setBounds: locationHook.setBounds,
    fitToCoordinates: locationHook.fitToCoordinates,
  };
};

export default useLocation;
