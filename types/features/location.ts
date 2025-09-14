import { PaginationMeta } from '../utils/api';

// Core location interface
export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Location Types
export interface LocationSearchRequest {
  query: string;
  limit?: number;
  country?: string;
  bounds?: LatLngBounds;
  types?: LocationType[];
  language?: string;
}

export interface LocationSearchResponse {
  results: LocationSearchResult[];
  pagination?: PaginationMeta;
  bounds?: LatLngBounds;
}

export interface LocationAutocompleteRequest {
  input: string;
  limit?: number;
  country?: string;
  types?: LocationType[];
  location?: Coordinates;
  radius?: number; // in meters
}

export interface LocationAutocompleteResponse {
  predictions: LocationPrediction[];
  status: 'OK' | 'ZERO_RESULTS' | 'INVALID_REQUEST' | 'REQUEST_DENIED';
}

export interface GeocodeRequest {
  address?: string;
  coordinates?: Coordinates;
  language?: string;
  region?: string;
}

export interface GeocodeResponse {
  results: GeocodingResult[];
  status:
    | 'OK'
    | 'ZERO_RESULTS'
    | 'OVER_QUERY_LIMIT'
    | 'REQUEST_DENIED'
    | 'INVALID_REQUEST';
}

export interface LocationSearchResult {
  id: string;
  name: string;
  displayName: string;
  type: LocationType;
  coordinates: Coordinates;
  address: Address;
  bounds?: LatLngBounds;
  importance?: number;
  distance?: number; // in meters from search center
}

export interface LocationPrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
  types: LocationType[];
  matchedSubstrings: MatchedSubstring[];
  distance?: number;
}

export interface MatchedSubstring {
  offset: number;
  length: number;
}

export interface GeocodingResult {
  placeId: string;
  formattedAddress: string;
  types: LocationType[];
  addressComponents: AddressComponent[];
  geometry: Geometry;
  plusCode?: PlusCode;
}

export interface AddressComponent {
  longName: string;
  shortName: string;
  types: LocationType[];
}

export interface Geometry {
  location: Coordinates;
  locationType:
    | 'ROOFTOP'
    | 'RANGE_INTERPOLATED'
    | 'GEOMETRIC_CENTER'
    | 'APPROXIMATE';
  viewport: LatLngBounds;
  bounds?: LatLngBounds;
}

export interface PlusCode {
  globalCode: string;
  compoundCode?: string;
}

export interface Address {
  street?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  formattedAddress: string;
}

export interface LatLngBounds {
  northeast: Coordinates;
  southwest: Coordinates;
}

export type LocationType =
  | 'country'
  | 'administrative_area_level_1'
  | 'administrative_area_level_2'
  | 'locality'
  | 'sublocality'
  | 'neighborhood'
  | 'postal_code'
  | 'route'
  | 'street_address'
  | 'establishment'
  | 'point_of_interest';

// Map utility types
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}
