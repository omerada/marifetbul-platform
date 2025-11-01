/**
 * Location and Map Types
 * @module types/shared/location
 * @description Location search, geocoding, and map-related types
 */

/**
 * Geographic coordinates
 */
export interface Coordinates {
  lat: number;
  lng: number;
  latitude?: number; // Alias for lat
  longitude?: number; // Alias for lng
}

/**
 * Map bounding box
 */
export interface MapBounds {
  northeast: Coordinates;
  southwest: Coordinates;
  north: number;
  south: number;
  east: number;
  west: number;
}

/**
 * Location search parameters
 */
export interface LocationSearchParams {
  query: string;
  limit?: number;
  types?: string[];
  bounds?: MapBounds;
  location?: Coordinates;
  radius?: number;
}

/**
 * Location search result (Google Places API format)
 * @description This is the canonical version using Google Places structure
 */
export interface LocationSearchResult {
  id: string;
  name: string;
  formattedAddress: string;
  types: string[];
  geometry: {
    location: Coordinates;
    bounds?: MapBounds;
  };
  placeId: string;
}

/**
 * Location autocomplete prediction
 */
export interface LocationPrediction {
  id: string;
  description: string;
  types: string[];
  mainText: string;
  secondaryText: string;
  placeId: string;
  distance_meters?: number;
}

/**
 * Location search request
 */
export interface LocationSearchRequest {
  query: string;
  limit?: number;
  types?: ('city' | 'region' | 'country')[];
  language?: string;
  coordinates?: Coordinates;
  radius?: number;
  bounds?: {
    northeast: Coordinates;
    southwest: Coordinates;
  };
}

/**
 * Location autocomplete request
 */
export interface LocationAutocompleteRequest {
  input: string;
  limit?: number;
  types?: string[];
  location?: Coordinates;
  coordinates?: Coordinates;
  radius?: number;
  language?: string;
}

/**
 * Geocode request (address to coordinates)
 */
export interface GeocodeRequest {
  address: string;
  placeId?: string;
  coordinates?: Coordinates;
  language?: string;
}

/**
 * Reverse geocode request (coordinates to address)
 */
export interface ReverseGeocodeRequest {
  coordinates: Coordinates;
  language?: string;
}

/**
 * Geocode response
 */
export interface GeocodeResponse {
  results: LocationSearchResult[];
  status: 'OK' | 'ZERO_RESULTS' | 'INVALID_REQUEST' | 'ERROR';
}
