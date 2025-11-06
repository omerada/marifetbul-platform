export interface GeocodeResult {
  address: string;
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  formattedAddress: string;
}

import logger from '@/lib/infrastructure/monitoring/logger';

export interface GoogleGeocodeComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

export interface GoogleGeocodeResult {
  address_components: GoogleGeocodeComponent[];
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export interface ReverseGeocodeResult {
  latitude: number;
  longitude: number;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  formattedAddress: string;
}

export class GeocodingService {
  private static instance: GeocodingService;
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api/geocode/json';

  private constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  }

  public static getInstance(): GeocodingService {
    if (!GeocodingService.instance) {
      GeocodingService.instance = new GeocodingService();
    }
    return GeocodingService.instance;
  }

  async geocodeAddress(address: string): Promise<GeocodeResult[]> {
    if (!this.apiKey) {
      throw new Error('Google Maps API key is not configured');
    }

    const params = new URLSearchParams({
      address: address,
      key: this.apiKey,
    });

    try {
      const response = await fetch(`${this.baseUrl}?${params.toString()}`);
      const data = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Geocoding failed: ${data.status}`);
      }

      return data.results.map((result: GoogleGeocodeResult) => ({
        address: address,
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        city: this.extractComponent(result.address_components, 'locality'),
        state: this.extractComponent(
          result.address_components,
          'administrative_area_level_1'
        ),
        country: this.extractComponent(result.address_components, 'country'),
        postalCode: this.extractComponent(
          result.address_components,
          'postal_code'
        ),
        formattedAddress: result.formatted_address,
      }));
    } catch (error) {
      logger.error(
        'Geocoding error',
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }

  async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<ReverseGeocodeResult[]> {
    if (!this.apiKey) {
      throw new Error('Google Maps API key is not configured');
    }

    const params = new URLSearchParams({
      latlng: `${latitude},${longitude}`,
      key: this.apiKey,
    });

    try {
      const response = await fetch(`${this.baseUrl}?${params.toString()}`);
      const data = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Reverse geocoding failed: ${data.status}`);
      }

      return data.results.map((result: GoogleGeocodeResult) => ({
        latitude,
        longitude,
        address: result.formatted_address,
        city: this.extractComponent(result.address_components, 'locality'),
        state: this.extractComponent(
          result.address_components,
          'administrative_area_level_1'
        ),
        country: this.extractComponent(result.address_components, 'country'),
        postalCode: this.extractComponent(
          result.address_components,
          'postal_code'
        ),
        formattedAddress: result.formatted_address,
      }));
    } catch (error) {
      logger.error(
        'Reverse geocoding error',
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }

  private extractComponent(
    components: GoogleGeocodeComponent[],
    type: string
  ): string | undefined {
    const component = components.find((c) => c.types.includes(type));
    return component?.long_name;
  }
}

// Utility functions
export async function geocodeAddress(
  address: string
): Promise<GeocodeResult[]> {
  const service = GeocodingService.getInstance();
  return service.geocodeAddress(address);
}

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeResult[]> {
  const service = GeocodingService.getInstance();
  return service.reverseGeocode(latitude, longitude);
}
