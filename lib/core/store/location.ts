import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  LocationSearchRequest,
  LocationSearchResponse,
  LocationAutocompleteRequest,
  LocationAutocompleteResponse,
  GeocodeRequest,
  GeocodeResponse,
  LocationSearchResult,
  LocationPrediction,
  LocationData,
  Coordinates,
} from '@/types';

interface LocationStore {
  // State properties
  currentLocation: Coordinates | null;
  selectedLocation: LocationData | null;
  searchResults: LocationSearchResult[];
  predictions: LocationPrediction[];
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown';

  // Base async state
  isLoading: boolean;
  isGettingLocation: boolean;
  error: string | null;
  lastFetch: string | null;

  // Actions
  getCurrentLocation: () => Promise<void>;
  searchLocations: (request: LocationSearchRequest) => Promise<void>;
  getAutocomplete: (request: LocationAutocompleteRequest) => Promise<void>;
  geocode: (request: GeocodeRequest) => Promise<void>;
  setSelectedLocation: (location: LocationData | null) => void;
  clearSearchResults: () => void;
  clearPredictions: () => void;

  // Base actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  currentLocation: null,
  selectedLocation: null,
  searchResults: [],
  predictions: [],
  permissionStatus: 'unknown' as const,
  isLoading: false,
  isGettingLocation: false,
  error: null,
  lastFetch: null,
};

export const useLocationStore = create<LocationStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Base actions
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error, isLoading: false, isGettingLocation: false });
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        set(initialState);
      },

      getCurrentLocation: async () => {
        if (!navigator.geolocation) {
          set({
            error: 'Tarayıcınız konum bilgisini desteklemiyor',
            permissionStatus: 'denied',
          });
          return;
        }

        set({ isGettingLocation: true, error: null });

        try {
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 5 * 60 * 1000, // 5 minutes
              });
            }
          );

          const coordinates: Coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          set({
            currentLocation: coordinates,
            isGettingLocation: false,
            permissionStatus: 'granted',
            lastFetch: new Date().toISOString(),
          });

          // Optionally geocode to get location details
          await get().geocode({ address: 'current' });
        } catch (error) {
          let errorMessage = 'Konum bilgisi alınamadı';
          let permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown' =
            'unknown';

          if (error instanceof GeolocationPositionError) {
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Konum erişimi reddedildi';
                permissionStatus = 'denied';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Konum bilgisi mevcut değil';
                break;
              case error.TIMEOUT:
                errorMessage = 'Konum bilgisi alma zaman aşımına uğradı';
                break;
            }
          }

          set({
            error: errorMessage,
            isGettingLocation: false,
            permissionStatus,
          });
        }
      },

      searchLocations: async (request: LocationSearchRequest) => {
        set({ isLoading: true, error: null });

        try {
          const params = new URLSearchParams();
          if (request.query) params.append('query', request.query);
          if (request.coordinates) {
            params.append('lat', request.coordinates.latitude.toString());
            params.append('lng', request.coordinates.longitude.toString());
          }
          if (request.radius)
            params.append('radius', request.radius.toString());
          if (request.bounds) {
            params.append('north', request.bounds.north.toString());
            params.append('south', request.bounds.south.toString());
            params.append('east', request.bounds.east.toString());
            params.append('west', request.bounds.west.toString());
          }
          if (request.types) {
            request.types.forEach((type) => params.append('types', type));
          }
          if (request.limit) params.append('limit', request.limit.toString());
          if (request.language) params.append('language', request.language);

          const response = await fetch(
            `/api/v1/locations/search?${params.toString()}`
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data: LocationSearchResponse = await response.json();

          if (data.success && data.data) {
            set({
              searchResults: data.data,
              isLoading: false,
              lastFetch: new Date().toISOString(),
            });
          } else {
            throw new Error(data.error || 'Lokasyon arama başarısız');
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Lokasyon araması başarısız',
            isLoading: false,
          });
        }
      },

      getAutocomplete: async (request: LocationAutocompleteRequest) => {
        if (request.input.length < 2) {
          set({ predictions: [] });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const params = new URLSearchParams();
          params.append('input', request.input);
          if (request.coordinates) {
            params.append('lat', request.coordinates.latitude.toString());
            params.append('lng', request.coordinates.longitude.toString());
          }
          if (request.radius)
            params.append('radius', request.radius.toString());
          if (request.types) {
            request.types.forEach((type) => params.append('types', type));
          }
          if (request.language) params.append('language', request.language);

          const response = await fetch(
            `/api/v1/locations/autocomplete?${params.toString()}`
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data: LocationAutocompleteResponse = await response.json();

          if (data.success && data.data) {
            set({
              predictions: data.data.predictions,
              isLoading: false,
              lastFetch: new Date().toISOString(),
            });
          } else {
            throw new Error(data.error || 'Lokasyon önerileri alınamadı');
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Lokasyon önerileri alınamadı',
            isLoading: false,
          });
        }
      },

      geocode: async (request: GeocodeRequest) => {
        set({ isLoading: true, error: null });

        try {
          const params = new URLSearchParams();
          if (request.address) params.append('address', request.address);
          if (request.placeId) params.append('placeId', request.placeId);
          if (request.coordinates) {
            params.append('lat', request.coordinates.latitude.toString());
            params.append('lng', request.coordinates.longitude.toString());
          }

          const response = await fetch(
            `/api/v1/locations/geocode?${params.toString()}`
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data: GeocodeResponse = await response.json();

          if (data.success && data.data) {
            set({
              selectedLocation: data.data.location,
              isLoading: false,
              lastFetch: new Date().toISOString(),
            });
          } else {
            throw new Error(data.error || 'Geocoding başarısız');
          }
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Geocoding başarısız',
            isLoading: false,
          });
        }
      },

      setSelectedLocation: (location: LocationData | null) => {
        set({ selectedLocation: location });
      },

      clearSearchResults: () => {
        set({ searchResults: [] });
      },

      clearPredictions: () => {
        set({ predictions: [] });
      },
    }),
    {
      name: 'location-store',
    }
  )
);

// Initialize with stored location permission if available
if (typeof window !== 'undefined' && 'permissions' in navigator) {
  navigator.permissions
    .query({ name: 'geolocation' })
    .then((result) => {
      useLocationStore.setState({ permissionStatus: result.state });

      result.addEventListener('change', () => {
        useLocationStore.setState({ permissionStatus: result.state });
      });
    })
    .catch(() => {
      // Permissions API not supported, ignore
    });
}
