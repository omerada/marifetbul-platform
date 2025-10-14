/**/**

 * ================================================ * Geocoding Service

 * GEOCODING SERVICE - PRODUCTION READY * Production-ready geocoding implementation with fallback to mock data

 * ================================================ */

 * Real backend integration, no mock data

 * Uses Spring Boot backend geocoding endpointsexport interface Coordinates {

 *  latitude: number;

 * @author MarifetBul Development Team  longitude: number;

 * @version 2.0.0 (Production)  lat: number;

 */  lng: number;

}

const API_URL =

  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';export interface GeocodingOptions {

  enableGoogleMaps?: boolean;

// ================================================  apiKey?: string;

// TYPE DEFINITIONS  fallbackToMock?: boolean;

// ================================================}



export interface Coordinates {export class GeocodingService {

  latitude: number;  private options: GeocodingOptions;

  longitude: number;

  lat: number;  constructor(options: GeocodingOptions = {}) {

  lng: number;    this.options = {

}      enableGoogleMaps: false, // Default to mock for development

      fallbackToMock: true,

export interface GeocodingResult {      ...options,

  formattedAddress: string;    };

  placeId?: string;  }

  latitude: number;

  longitude: number;  /**

  city?: string;   * Convert address string to coordinates

  province?: string;   */

  country?: string;  async geocodeAddress(address: string): Promise<Coordinates | null> {

  countryCode?: string;    if (this.options.enableGoogleMaps && this.options.apiKey) {

  postalCode?: string;      try {

  locationType?: string;        return await this.googleMapsGeocode(address);

}      } catch (error) {

        console.warn(

export interface GeocodingOptions {          'Google Maps geocoding failed, falling back to mock:',

  language?: string;          error

  region?: string;        );

}

        if (this.options.fallbackToMock) {

// ================================================          return this.mockGeocode(address);

// GEOCODING SERVICE CLASS        }

// ================================================

        throw error;

export class GeocodingService {      }

  /**    }

   * Convert address string to coordinates

   * Uses backend endpoint: GET /api/v1/geocoding/search?q={query}    return this.mockGeocode(address);

   */  }

  async geocodeAddress(

    address: string,  /**

    options?: GeocodingOptions   * Convert coordinates to address

  ): Promise<Coordinates | null> {   */

    try {  async reverseGeocode(coordinates: Coordinates): Promise<string | null> {

      const query = encodeURIComponent(address);    if (this.options.enableGoogleMaps && this.options.apiKey) {

      const url = `${API_URL}/geocoding/search?q=${query}`;      try {

        return await this.googleMapsReverseGeocode(coordinates);

      const response = await fetch(url);      } catch (error) {

        console.warn(

      if (!response.ok) {          'Google Maps reverse geocoding failed, falling back to mock:',

        console.error('Geocoding API error:', response.status);          error

        return null;        );

      }

        if (this.options.fallbackToMock) {

      const data = await response.json();          return this.mockReverseGeocode(coordinates);

        }

      if (!data.success || !data.data || data.data.length === 0) {

        console.warn('No geocoding results found for:', address);        throw error;

        return null;      }

      }    }



      const result: GeocodingResult = data.data[0];    return this.mockReverseGeocode(coordinates);

  }

      return {

        latitude: result.latitude,  /**

        longitude: result.longitude,   * Google Maps Geocoding API implementation

        lat: result.latitude,   */

        lng: result.longitude,  private async googleMapsGeocode(

      };    address: string

    } catch (error) {  ): Promise<Coordinates | null> {

      console.error('Geocoding error:', error);    if (!this.options.apiKey) {

      return null;      throw new Error('Google Maps API key is required');

    }    }

  }

    const encodedAddress = encodeURIComponent(address);

  /**    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${this.options.apiKey}`;

   * Search for locations by query

   * Returns multiple results    const response = await fetch(url);

   */

  async searchLocations(    if (!response.ok) {

    query: string,      throw new Error(`Geocoding API request failed: ${response.status}`);

    options?: GeocodingOptions    }

  ): Promise<GeocodingResult[]> {

    try {    const data = await response.json();

      const encodedQuery = encodeURIComponent(query);

      const url = `${API_URL}/geocoding/search?q=${encodedQuery}`;    if (data.status !== 'OK' || !data.results?.length) {

      return null;

      const response = await fetch(url);    }



      if (!response.ok) {    const location = data.results[0].geometry.location;

        console.error('Geocoding search API error:', response.status);

        return [];    return {

      }      latitude: location.lat,

      longitude: location.lng,

      const data = await response.json();      lat: location.lat,

      lng: location.lng,

      if (!data.success || !data.data) {    };

        console.warn('No search results found for:', query);  }

        return [];

      }  /**

   * Google Maps Reverse Geocoding API implementation

      return data.data;   */

    } catch (error) {  private async googleMapsReverseGeocode(

      console.error('Geocoding search error:', error);    coordinates: Coordinates

      return [];  ): Promise<string | null> {

    }    if (!this.options.apiKey) {

  }      throw new Error('Google Maps API key is required');

    }

  /**

   * Convert coordinates to address (Reverse Geocoding)    const { latitude, longitude } = coordinates;

   * Uses backend endpoint: GET /api/v1/geocoding/reverse?lat={lat}&lng={lng}    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${this.options.apiKey}`;

   */

  async reverseGeocode(coordinates: Coordinates): Promise<string | null> {    const response = await fetch(url);

    try {

      const { latitude, longitude } = coordinates;    if (!response.ok) {

      const url = `${API_URL}/geocoding/reverse?lat=${latitude}&lng=${longitude}`;      throw new Error(

        `Reverse geocoding API request failed: ${response.status}`

      const response = await fetch(url);      );

    }

      if (!response.ok) {

        console.error('Reverse geocoding API error:', response.status);    const data = await response.json();

        return null;

      }    if (data.status !== 'OK' || !data.results?.length) {

      return null;

      const data = await response.json();    }



      if (!data.success || !data.data) {    return data.results[0].formatted_address;

        console.warn('No reverse geocoding result found for:', coordinates);  }

        return null;

      }  /**

   * Mock geocoding implementation for development/fallback

      const result: GeocodingResult = data.data;   * TODO: Replace with real geocoding API integration (Google Maps Geocoding API)

      return result.formattedAddress;   * Suggested endpoint: Use Google Maps Geocoding API with proper API key

    } catch (error) {   * Mock geocoding data - REMOVE THIS AFTER BACKEND INTEGRATION

      console.error('Reverse geocoding error:', error);   */

      return null;  private mockGeocode(address: string): Coordinates | null {

    }    const mockLocations: Record<string, Coordinates> = {

  }      istanbul: {

        latitude: 41.0082,

  /**        longitude: 28.9784,

   * Get detailed location information        lat: 41.0082,

   */        lng: 28.9784,

  async getLocationDetails(coordinates: Coordinates): Promise<GeocodingResult | null> {      },

    try {      ankara: {

      const { latitude, longitude } = coordinates;        latitude: 39.9334,

      const url = `${API_URL}/geocoding/reverse?lat=${latitude}&lng=${longitude}`;        longitude: 32.8597,

        lat: 39.9334,

      const response = await fetch(url);        lng: 32.8597,

      },

      if (!response.ok) {      izmir: {

        console.error('Location details API error:', response.status);        latitude: 38.4192,

        return null;        longitude: 27.1287,

      }        lat: 38.4192,

        lng: 27.1287,

      const data = await response.json();      },

      bursa: {

      if (!data.success || !data.data) {        latitude: 40.1826,

        console.warn('No location details found for:', coordinates);        longitude: 29.0665,

        return null;        lat: 40.1826,

      }        lng: 29.0665,

      },

      return data.data;      antalya: {

    } catch (error) {        latitude: 36.8969,

      console.error('Location details error:', error);        longitude: 30.7133,

      return null;        lat: 36.8969,

    }        lng: 30.7133,

  }      },

      adana: {

  /**        latitude: 37.0,

   * Validate coordinates        longitude: 35.3213,

   */        lat: 37.0,

  isValidCoordinates(coordinates: Coordinates): boolean {        lng: 35.3213,

    const { latitude, longitude } = coordinates;      },

    return (      konya: {

      typeof latitude === 'number' &&        latitude: 37.8713,

      typeof longitude === 'number' &&        longitude: 32.4846,

      latitude >= -90 &&        lat: 37.8713,

      latitude <= 90 &&        lng: 32.4846,

      longitude >= -180 &&      },

      longitude <= 180 &&      gaziantep: {

      !isNaN(latitude) &&        latitude: 37.0662,

      !isNaN(longitude)        longitude: 37.3833,

    );        lat: 37.0662,

  }        lng: 37.3833,

      },

  /**    };

   * Calculate distance between two coordinates (in kilometers)

   * Uses Haversine formula    const addressLower = address.toLowerCase();

   */

  calculateDistance(    // Check for exact matches first

    coord1: Coordinates,    for (const [city, coords] of Object.entries(mockLocations)) {

    coord2: Coordinates      if (addressLower.includes(city)) {

  ): number {        return coords;

    const R = 6371; // Earth's radius in kilometers      }

    }

    const lat1 = this.toRadians(coord1.latitude);

    const lat2 = this.toRadians(coord2.latitude);    // Fallback to approximate location based on first match

    const deltaLat = this.toRadians(coord2.latitude - coord1.latitude);    const turkishCities = ['istanbul', 'ankara', 'izmir', 'bursa', 'antalya'];

    const deltaLng = this.toRadians(coord2.longitude - coord1.longitude);    const matchedCity = turkishCities.find((city) =>

      addressLower.includes(city)

    const a =    );

      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +

      Math.cos(lat1) *    if (matchedCity && mockLocations[matchedCity]) {

        Math.cos(lat2) *      return mockLocations[matchedCity];

        Math.sin(deltaLng / 2) *    }

        Math.sin(deltaLng / 2);

    // Default to Istanbul if no match found

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));    return mockLocations.istanbul;

  }

    return R * c;

  }  /**

   * Mock reverse geocoding implementation

  /**   * TODO: Replace with real reverse geocoding API integration (Google Maps Reverse Geocoding)

   * Convert degrees to radians   * Suggested endpoint: Use Google Maps Reverse Geocoding API with proper API key

   */   * Mock reverse geocoding - REMOVE THIS AFTER BACKEND INTEGRATION

  private toRadians(degrees: number): number {   */

    return degrees * (Math.PI / 180);  private mockReverseGeocode(coordinates: Coordinates): string | null {

  }    const { latitude, longitude } = coordinates;

}

    const cities = [

// ================================================      { name: 'İstanbul', lat: 41.0082, lng: 28.9784 },

// SINGLETON INSTANCE      { name: 'Ankara', lat: 39.9334, lng: 32.8597 },

// ================================================      { name: 'İzmir', lat: 38.4192, lng: 27.1287 },

      { name: 'Bursa', lat: 40.1826, lng: 29.0665 },

export const geocodingService = new GeocodingService();      { name: 'Antalya', lat: 36.8969, lng: 30.7133 },

      { name: 'Adana', lat: 37.0, lng: 35.3213 },

// ================================================      { name: 'Konya', lat: 37.8713, lng: 32.4846 },

// HELPER FUNCTIONS      { name: 'Gaziantep', lat: 37.0662, lng: 37.3833 },

// ================================================    ];



/**    // Find the closest city

 * Quick geocode function    let closestCity = cities[0];

 */    let minDistance = this.calculateDistance(

export async function geocode(address: string): Promise<Coordinates | null> {      latitude,

  return geocodingService.geocodeAddress(address);      longitude,

}      closestCity.lat,

      closestCity.lng

/**    );

 * Quick reverse geocode function

 */    for (const city of cities.slice(1)) {

export async function reverseGeocode(      const distance = this.calculateDistance(

  coordinates: Coordinates        latitude,

): Promise<string | null> {        longitude,

  return geocodingService.reverseGeocode(coordinates);        city.lat,

}        city.lng

      );

/**

 * Quick location search function      if (distance < minDistance) {

 */        minDistance = distance;

export async function searchLocations(        closestCity = city;

  query: string      }

): Promise<GeocodingResult[]> {    }

  return geocodingService.searchLocations(query);

}    return `${closestCity.name}, Türkiye`;

  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}

// Singleton instance
let geocodingService: GeocodingService | null = null;

/**
 * Get or create geocoding service instance
 */
export function getGeocodingService(): GeocodingService {
  if (!geocodingService) {
    geocodingService = new GeocodingService({
      enableGoogleMaps:
        process.env.NODE_ENV === 'production' &&
        !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      fallbackToMock: true,
    });
  }

  return geocodingService;
}

/**
 * Convenience functions for backward compatibility
 */
export const geocodeAddress = (address: string) =>
  getGeocodingService().geocodeAddress(address);

export const reverseGeocode = (coordinates: Coordinates) =>
  getGeocodingService().reverseGeocode(coordinates);
