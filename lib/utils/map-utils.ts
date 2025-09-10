/**
 * Map and Location Utilities
 * Harita entegrasyonu ve konum yönetimi
 */

import { Coordinates, MapBounds } from '@/types';

export class MapUtils {
  // Calculate distance between two coordinates using Haversine formula
  static calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371; // Earth's radius in kilometers

    const dLat = MapUtils.toRadians(coord2.latitude - coord1.latitude);
    const dLon = MapUtils.toRadians(coord2.longitude - coord1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(MapUtils.toRadians(coord1.latitude)) *
        Math.cos(MapUtils.toRadians(coord2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in kilometers
  }

  // Convert degrees to radians
  static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Convert radians to degrees
  static toDegrees(radians: number): number {
    return radians * (180 / Math.PI);
  }

  // Calculate center point of multiple coordinates
  static calculateCenter(coordinates: Coordinates[]): Coordinates {
    if (coordinates.length === 0) {
      throw new Error('No coordinates provided');
    }

    if (coordinates.length === 1) {
      return coordinates[0];
    }

    let x = 0,
      y = 0,
      z = 0;

    coordinates.forEach((coord) => {
      const lat = MapUtils.toRadians(coord.latitude);
      const lon = MapUtils.toRadians(coord.longitude);

      x += Math.cos(lat) * Math.cos(lon);
      y += Math.cos(lat) * Math.sin(lon);
      z += Math.sin(lat);
    });

    const total = coordinates.length;
    x = x / total;
    y = y / total;
    z = z / total;

    const centralLon = Math.atan2(y, x);
    const centralSquareRoot = Math.sqrt(x * x + y * y);
    const centralLat = Math.atan2(z, centralSquareRoot);

    return {
      latitude: MapUtils.toDegrees(centralLat),
      longitude: MapUtils.toDegrees(centralLon),
    };
  }

  // Calculate bounds that contain all coordinates with padding
  static calculateBounds(
    coordinates: Coordinates[],
    padding = 0.01
  ): MapBounds {
    if (coordinates.length === 0) {
      throw new Error('No coordinates provided');
    }

    let minLat = coordinates[0].latitude;
    let maxLat = coordinates[0].latitude;
    let minLng = coordinates[0].longitude;
    let maxLng = coordinates[0].longitude;

    coordinates.forEach((coord) => {
      minLat = Math.min(minLat, coord.latitude);
      maxLat = Math.max(maxLat, coord.latitude);
      minLng = Math.min(minLng, coord.longitude);
      maxLng = Math.max(maxLng, coord.longitude);
    });

    return {
      north: maxLat + padding,
      south: minLat - padding,
      east: maxLng + padding,
      west: minLng - padding,
    };
  }

  // Check if a coordinate is within given bounds
  static isWithinBounds(coordinate: Coordinates, bounds: MapBounds): boolean {
    return (
      coordinate.latitude <= bounds.north &&
      coordinate.latitude >= bounds.south &&
      coordinate.longitude <= bounds.east &&
      coordinate.longitude >= bounds.west
    );
  }

  // Check if a coordinate is within a radius of a center point
  static isWithinRadius(
    coordinate: Coordinates,
    center: Coordinates,
    radiusKm: number
  ): boolean {
    const distance = MapUtils.calculateDistance(coordinate, center);
    return distance <= radiusKm;
  }

  // Generate coordinates within a radius (for demo/testing purposes)
  static generateRandomCoordinatesInRadius(
    center: Coordinates,
    radiusKm: number,
    count: number
  ): Coordinates[] {
    const coordinates: Coordinates[] = [];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * radiusKm;

      // Convert distance to degrees (rough approximation)
      const deltaLat = (distance / 111) * Math.cos(angle); // 1 degree ≈ 111 km
      const deltaLng =
        (distance / (111 * Math.cos(MapUtils.toRadians(center.latitude)))) *
        Math.sin(angle);

      coordinates.push({
        latitude: center.latitude + deltaLat,
        longitude: center.longitude + deltaLng,
      });
    }

    return coordinates;
  }

  // Format distance for display
  static formatDistance(distanceKm: number): string {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)} m`;
    } else if (distanceKm < 10) {
      return `${distanceKm.toFixed(1)} km`;
    } else {
      return `${Math.round(distanceKm)} km`;
    }
  }

  // Get zoom level based on radius
  static getZoomLevel(radiusKm: number): number {
    if (radiusKm <= 1) return 15;
    if (radiusKm <= 5) return 13;
    if (radiusKm <= 10) return 12;
    if (radiusKm <= 25) return 11;
    if (radiusKm <= 50) return 10;
    if (radiusKm <= 100) return 9;
    if (radiusKm <= 200) return 8;
    return 7;
  }

  // Convert address string to approximate coordinates (mock implementation)
  static async geocodeAddress(address: string): Promise<Coordinates | null> {
    // Mock implementation - in real app, use Google Maps Geocoding API
    const mockLocations: Record<string, Coordinates> = {
      istanbul: { latitude: 41.0082, longitude: 28.9784 },
      ankara: { latitude: 39.9334, longitude: 32.8597 },
      izmir: { latitude: 38.4192, longitude: 27.1287 },
      bursa: { latitude: 40.1826, longitude: 29.0665 },
      antalya: { latitude: 36.8969, longitude: 30.7133 },
      adana: { latitude: 37.0, longitude: 35.3213 },
      konya: { latitude: 37.8746, longitude: 32.4932 },
      şanlıurfa: { latitude: 37.1674, longitude: 38.7955 },
      gaziantep: { latitude: 37.0662, longitude: 37.3833 },
      kayseri: { latitude: 38.7312, longitude: 35.4787 },
    };

    const searchKey = address.toLowerCase().trim();

    // Try exact match first
    if (mockLocations[searchKey]) {
      return mockLocations[searchKey];
    }

    // Try partial match
    for (const [key, coords] of Object.entries(mockLocations)) {
      if (key.includes(searchKey) || searchKey.includes(key)) {
        return coords;
      }
    }

    // Return null if no match found
    return null;
  }

  // Reverse geocode coordinates to address (mock implementation)
  static async reverseGeocode(
    coordinates: Coordinates
  ): Promise<string | null> {
    // Mock implementation - in real app, use Google Maps Reverse Geocoding API
    const { latitude, longitude } = coordinates;

    // Simple mock based on known cities
    const cities = [
      { name: 'İstanbul', lat: 41.0082, lng: 28.9784 },
      { name: 'Ankara', lat: 39.9334, lng: 32.8597 },
      { name: 'İzmir', lat: 38.4192, lng: 27.1287 },
      { name: 'Bursa', lat: 40.1826, lng: 29.0665 },
      { name: 'Antalya', lat: 36.8969, lng: 30.7133 },
    ];

    let closestCity = cities[0];
    let minDistance = MapUtils.calculateDistance(coordinates, {
      latitude: closestCity.lat,
      longitude: closestCity.lng,
    });

    cities.forEach((city) => {
      const distance = MapUtils.calculateDistance(coordinates, {
        latitude: city.lat,
        longitude: city.lng,
      });
      if (distance < minDistance) {
        minDistance = distance;
        closestCity = city;
      }
    });

    if (minDistance < 50) {
      // Within 50km
      return `${closestCity.name}, Türkiye`;
    }

    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }
}

export class GeolocationService {
  private static instance: GeolocationService;
  private currentPosition: Coordinates | null = null;
  private watchId: number | null = null;
  private callbacks: ((position: Coordinates) => void)[] = [];

  private constructor() {}

  static getInstance(): GeolocationService {
    if (!GeolocationService.instance) {
      GeolocationService.instance = new GeolocationService();
    }
    return GeolocationService.instance;
  }

  // Check if geolocation is supported
  static isSupported(): boolean {
    return 'geolocation' in navigator;
  }

  // Get current position
  async getCurrentPosition(options?: PositionOptions): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      if (!GeolocationService.isSupported()) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      const defaultOptions: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coordinates: Coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          this.currentPosition = coordinates;
          resolve(coordinates);
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        { ...defaultOptions, ...options }
      );
    });
  }

  // Watch position changes
  watchPosition(
    callback: (position: Coordinates) => void,
    options?: PositionOptions
  ): number {
    if (!GeolocationService.isSupported()) {
      throw new Error('Geolocation is not supported');
    }

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000, // 1 minute
    };

    this.callbacks.push(callback);

    if (this.watchId === null) {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          const coordinates: Coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          this.currentPosition = coordinates;

          // Notify all callbacks
          this.callbacks.forEach((cb) => cb(coordinates));
        },
        (error) => {
          console.error('Geolocation watch error:', error);
        },
        { ...defaultOptions, ...options }
      );
    }

    return this.callbacks.length - 1;
  }

  // Stop watching position
  clearWatch(callbackIndex?: number): void {
    if (callbackIndex !== undefined) {
      this.callbacks.splice(callbackIndex, 1);
    } else {
      this.callbacks = [];
    }

    if (this.callbacks.length === 0 && this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  // Get cached position
  getCachedPosition(): Coordinates | null {
    return this.currentPosition;
  }

  // Get user's city based on current position
  async getCurrentCity(): Promise<string | null> {
    try {
      const position = await this.getCurrentPosition();
      return await MapUtils.reverseGeocode(position);
    } catch (error) {
      console.error('Failed to get current city:', error);
      return null;
    }
  }
}

// Export singleton instance
export const geolocationService = GeolocationService.getInstance();
