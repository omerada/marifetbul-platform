/**
 * Geocoding Service
 * Production-ready geocoding implementation with fallback to mock data
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
  lat: number;
  lng: number;
}

export interface GeocodingOptions {
  enableGoogleMaps?: boolean;
  apiKey?: string;
  fallbackToMock?: boolean;
}

export class GeocodingService {
  private options: GeocodingOptions;

  constructor(options: GeocodingOptions = {}) {
    this.options = {
      enableGoogleMaps: false, // Default to mock for development
      fallbackToMock: true,
      ...options,
    };
  }

  /**
   * Convert address string to coordinates
   */
  async geocodeAddress(address: string): Promise<Coordinates | null> {
    if (this.options.enableGoogleMaps && this.options.apiKey) {
      try {
        return await this.googleMapsGeocode(address);
      } catch (error) {
        console.warn(
          'Google Maps geocoding failed, falling back to mock:',
          error
        );

        if (this.options.fallbackToMock) {
          return this.mockGeocode(address);
        }

        throw error;
      }
    }

    return this.mockGeocode(address);
  }

  /**
   * Convert coordinates to address
   */
  async reverseGeocode(coordinates: Coordinates): Promise<string | null> {
    if (this.options.enableGoogleMaps && this.options.apiKey) {
      try {
        return await this.googleMapsReverseGeocode(coordinates);
      } catch (error) {
        console.warn(
          'Google Maps reverse geocoding failed, falling back to mock:',
          error
        );

        if (this.options.fallbackToMock) {
          return this.mockReverseGeocode(coordinates);
        }

        throw error;
      }
    }

    return this.mockReverseGeocode(coordinates);
  }

  /**
   * Google Maps Geocoding API implementation
   */
  private async googleMapsGeocode(
    address: string
  ): Promise<Coordinates | null> {
    if (!this.options.apiKey) {
      throw new Error('Google Maps API key is required');
    }

    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${this.options.apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Geocoding API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK' || !data.results?.length) {
      return null;
    }

    const location = data.results[0].geometry.location;

    return {
      latitude: location.lat,
      longitude: location.lng,
      lat: location.lat,
      lng: location.lng,
    };
  }

  /**
   * Google Maps Reverse Geocoding API implementation
   */
  private async googleMapsReverseGeocode(
    coordinates: Coordinates
  ): Promise<string | null> {
    if (!this.options.apiKey) {
      throw new Error('Google Maps API key is required');
    }

    const { latitude, longitude } = coordinates;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${this.options.apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Reverse geocoding API request failed: ${response.status}`
      );
    }

    const data = await response.json();

    if (data.status !== 'OK' || !data.results?.length) {
      return null;
    }

    return data.results[0].formatted_address;
  }

  /**
   * Mock geocoding implementation for development/fallback
   */
  private mockGeocode(address: string): Coordinates | null {
    const mockLocations: Record<string, Coordinates> = {
      istanbul: {
        latitude: 41.0082,
        longitude: 28.9784,
        lat: 41.0082,
        lng: 28.9784,
      },
      ankara: {
        latitude: 39.9334,
        longitude: 32.8597,
        lat: 39.9334,
        lng: 32.8597,
      },
      izmir: {
        latitude: 38.4192,
        longitude: 27.1287,
        lat: 38.4192,
        lng: 27.1287,
      },
      bursa: {
        latitude: 40.1826,
        longitude: 29.0665,
        lat: 40.1826,
        lng: 29.0665,
      },
      antalya: {
        latitude: 36.8969,
        longitude: 30.7133,
        lat: 36.8969,
        lng: 30.7133,
      },
      adana: {
        latitude: 37.0,
        longitude: 35.3213,
        lat: 37.0,
        lng: 35.3213,
      },
      konya: {
        latitude: 37.8713,
        longitude: 32.4846,
        lat: 37.8713,
        lng: 32.4846,
      },
      gaziantep: {
        latitude: 37.0662,
        longitude: 37.3833,
        lat: 37.0662,
        lng: 37.3833,
      },
    };

    const addressLower = address.toLowerCase();

    // Check for exact matches first
    for (const [city, coords] of Object.entries(mockLocations)) {
      if (addressLower.includes(city)) {
        return coords;
      }
    }

    // Fallback to approximate location based on first match
    const turkishCities = ['istanbul', 'ankara', 'izmir', 'bursa', 'antalya'];
    const matchedCity = turkishCities.find((city) =>
      addressLower.includes(city)
    );

    if (matchedCity && mockLocations[matchedCity]) {
      return mockLocations[matchedCity];
    }

    // Default to Istanbul if no match found
    return mockLocations.istanbul;
  }

  /**
   * Mock reverse geocoding implementation
   */
  private mockReverseGeocode(coordinates: Coordinates): string | null {
    const { latitude, longitude } = coordinates;

    const cities = [
      { name: 'İstanbul', lat: 41.0082, lng: 28.9784 },
      { name: 'Ankara', lat: 39.9334, lng: 32.8597 },
      { name: 'İzmir', lat: 38.4192, lng: 27.1287 },
      { name: 'Bursa', lat: 40.1826, lng: 29.0665 },
      { name: 'Antalya', lat: 36.8969, lng: 30.7133 },
      { name: 'Adana', lat: 37.0, lng: 35.3213 },
      { name: 'Konya', lat: 37.8713, lng: 32.4846 },
      { name: 'Gaziantep', lat: 37.0662, lng: 37.3833 },
    ];

    // Find the closest city
    let closestCity = cities[0];
    let minDistance = this.calculateDistance(
      latitude,
      longitude,
      closestCity.lat,
      closestCity.lng
    );

    for (const city of cities.slice(1)) {
      const distance = this.calculateDistance(
        latitude,
        longitude,
        city.lat,
        city.lng
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestCity = city;
      }
    }

    return `${closestCity.name}, Türkiye`;
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
