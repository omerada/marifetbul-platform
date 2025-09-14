/**
 * Map and Location Utilities
 * Harita entegrasyonu ve konum yönetimi
 */

import { Coordinates, MapBounds } from '@/types';
import { geocodeAddress, reverseGeocode } from '@/lib/services/geocoding';

export class MapUtils {
  // Calculate distance between two coordinates using Haversine formula
  static calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371; // Earth's radius in kilometers

    // Support both lat/lng and latitude/longitude properties
    const lat1 = coord1.latitude || coord1.lat;
    const lng1 = coord1.longitude || coord1.lng;
    const lat2 = coord2.latitude || coord2.lat;
    const lng2 = coord2.longitude || coord2.lng;

    const dLat = MapUtils.toRadians(lat2 - lat1);
    const dLon = MapUtils.toRadians(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(MapUtils.toRadians(lat1)) *
        Math.cos(MapUtils.toRadians(lat2)) *
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
      // Support both lat/lng and latitude/longitude properties
      const lat = MapUtils.toRadians(coord.latitude || coord.lat);
      const lon = MapUtils.toRadians(coord.longitude || coord.lng);

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
      lat: MapUtils.toDegrees(centralLat),
      lng: MapUtils.toDegrees(centralLon),
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

    // Support both lat/lng and latitude/longitude properties for the first coordinate
    let minLat = coordinates[0].latitude || coordinates[0].lat;
    let maxLat = coordinates[0].latitude || coordinates[0].lat;
    let minLng = coordinates[0].longitude || coordinates[0].lng;
    let maxLng = coordinates[0].longitude || coordinates[0].lng;

    coordinates.forEach((coord) => {
      const lat = coord.latitude || coord.lat;
      const lng = coord.longitude || coord.lng;
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
    });

    return {
      north: maxLat + padding,
      south: minLat - padding,
      east: maxLng + padding,
      west: minLng - padding,
      northeast: {
        lat: maxLat + padding,
        lng: maxLng + padding,
        latitude: maxLat + padding,
        longitude: maxLng + padding,
      },
      southwest: {
        lat: minLat - padding,
        lng: minLng - padding,
        latitude: minLat - padding,
        longitude: minLng - padding,
      },
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

      const centerLat = center.latitude || center.lat;
      const centerLng = center.longitude || center.lng;
      coordinates.push({
        latitude: centerLat + deltaLat,
        longitude: centerLng + deltaLng,
        lat: centerLat + deltaLat,
        lng: centerLng + deltaLng,
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

  // Convert address string to coordinates using geocoding service
  static async geocodeAddress(address: string): Promise<Coordinates | null> {
    const results = await geocodeAddress(address);
    if (results && results.length > 0) {
      const firstResult = results[0];
      return {
        lat: firstResult.latitude,
        lng: firstResult.longitude,
        latitude: firstResult.latitude,
        longitude: firstResult.longitude,
      };
    }
    return null;
  }

  // Reverse geocode coordinates to address using geocoding service
  static async reverseGeocode(
    coordinates: Coordinates
  ): Promise<string | null> {
    const results = await reverseGeocode(
      coordinates.latitude,
      coordinates.longitude
    );
    if (results && results.length > 0) {
      return results[0].formattedAddress;
    }
    return null;
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
    return typeof window !== 'undefined' && 'geolocation' in navigator;
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
            lat: position.coords.latitude,
            lng: position.coords.longitude,
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

    if (this.watchId === null && typeof navigator !== 'undefined') {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          const coordinates: Coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
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

    if (
      this.callbacks.length === 0 &&
      this.watchId !== null &&
      typeof navigator !== 'undefined'
    ) {
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
