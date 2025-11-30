/**
 * ================================================
 * GEOCODING SERVICE - PRODUCTION READY
 * ================================================
 * Real backend integration with Google Maps API support
 * No mock data - uses Spring Boot backend geocoding endpoints
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 (Production)
 */

import { getBackendApiUrl } from '@/lib/config/api';
import logger from '@/lib/infrastructure/monitoring/logger';

const API_URL = getBackendApiUrl();

// ================================================
// TYPE DEFINITIONS
// ================================================

export interface Coordinates {
  latitude: number;
  longitude: number;
  lat: number;
  lng: number;
}

export interface GeocodingResult {
  formattedAddress: string;
  placeId?: string;
  latitude: number;
  longitude: number;
  city?: string;
  province?: string;
  country?: string;
  countryCode?: string;
  postalCode?: string;
  locationType?: string;
}

export interface GeocodingOptions {
  language?: string;
  region?: string;
}

// ================================================
// GEOCODING SERVICE CLASS
// ================================================

export class GeocodingService {
  /**
   * Convert address string to coordinates
   * Uses backend endpoint: GET /api/v1/geocoding/search?q={query}
   */
  async geocodeAddress(
    address: string,
    _options?: GeocodingOptions
  ): Promise<Coordinates | null> {
    try {
      const query = encodeURIComponent(address);
      const url = `${API_URL}/geocoding/search?q=${query}`;

      const response = await fetch(url);

      if (!response.ok) {
        logger.error(
          'Geocoding API error',
          new Error(`Status: ${response.status}`)
        );
        return null;
      }

      const data = await response.json();

      if (!data.success || !data.data || data.data.length === 0) {
        logger.warn('No geocoding results found', { address });
        return null;
      }

      const result: GeocodingResult = data.data[0];

      return {
        latitude: result.latitude,
        longitude: result.longitude,
        lat: result.latitude,
        lng: result.longitude,
      };
    } catch (error) {
      logger.error(
        'Geocoding error', error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  }

  /**
   * Search for locations by query
   * Returns multiple results
   */
  async searchLocations(
    query: string,
    _options?: GeocodingOptions
  ): Promise<GeocodingResult[]> {
    try {
      const encodedQuery = encodeURIComponent(query);
      const url = `${API_URL}/geocoding/search?q=${encodedQuery}`;

      const response = await fetch(url);

      if (!response.ok) {
        logger.error(
          'Geocoding search API error',
          new Error(`Status: ${response.status}`)
        );
        return [];
      }

      const data = await response.json();

      if (!data.success || !data.data) {
        logger.warn('No search results found', { query });
        return [];
      }

      return data.data;
    } catch (error) {
      logger.error(
        'Geocoding search error', error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  /**
   * Convert coordinates to address (Reverse Geocoding)
   * Uses backend endpoint: GET /api/v1/geocoding/reverse?lat={lat}&lng={lng}
   */
  async reverseGeocode(coordinates: Coordinates): Promise<string | null> {
    try {
      const { latitude, longitude } = coordinates;
      const url = `${API_URL}/geocoding/reverse?lat=${latitude}&lng=${longitude}`;

      const response = await fetch(url);

      if (!response.ok) {
        logger.error(
          'Reverse geocoding API error',
          new Error(`Status: ${response.status}`)
        );
        return null;
      }

      const data = await response.json();

      if (!data.success || !data.data) {
        logger.warn('No reverse geocoding result found', { coordinates });
        return null;
      }

      const result: GeocodingResult = data.data;
      return result.formattedAddress;
    } catch (error) {
      logger.error(
        'Reverse geocoding error', error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  }

  /**
   * Get detailed location information
   */
  async getLocationDetails(
    coordinates: Coordinates
  ): Promise<GeocodingResult | null> {
    try {
      const { latitude, longitude } = coordinates;
      const url = `${API_URL}/geocoding/reverse?lat=${latitude}&lng=${longitude}`;

      const response = await fetch(url);

      if (!response.ok) {
        logger.error(
          'Location details API error',
          new Error(`Status: ${response.status}`)
        );
        return null;
      }

      const data = await response.json();

      if (!data.success || !data.data) {
        logger.warn('No location details found', { coordinates });
        return null;
      }

      return data.data;
    } catch (error) {
      logger.error(
        'Location details error', error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  }

  /**
   * Validate coordinates
   */
  isValidCoordinates(coordinates: Coordinates): boolean {
    const { latitude, longitude } = coordinates;
    return (
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180 &&
      !isNaN(latitude) &&
      !isNaN(longitude)
    );
  }

  /**
   * Calculate distance between two coordinates (in kilometers)
   * Uses Haversine formula
   */
  calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371; // Earth's radius in kilometers

    const lat1 = this.toRadians(coord1.latitude);
    const lat2 = this.toRadians(coord2.latitude);
    const deltaLat = this.toRadians(coord2.latitude - coord1.latitude);
    const deltaLng = this.toRadians(coord2.longitude - coord1.longitude);

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(deltaLng / 2) *
        Math.sin(deltaLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

// ================================================
// SINGLETON INSTANCE
// ================================================

export const geocodingService = new GeocodingService();

// ================================================
// HELPER FUNCTIONS
// ================================================

/**
 * Quick geocode function
 */
export async function geocode(address: string): Promise<Coordinates | null> {
  return geocodingService.geocodeAddress(address);
}

/**
 * Quick reverse geocode function
 */
export async function reverseGeocode(
  coordinates: Coordinates
): Promise<string | null> {
  return geocodingService.reverseGeocode(coordinates);
}

/**
 * Quick location search function
 */
export async function searchLocations(
  query: string
): Promise<GeocodingResult[]> {
  return geocodingService.searchLocations(query);
}
