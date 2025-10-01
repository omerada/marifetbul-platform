// Map utilities
import { MapBounds } from '@/types';

export interface MapLocation {
  lat: number;
  lng: number;
  latitude: number;
  longitude: number;
  address?: string;
}

export class MapUtils {
  static calculateDistance(point1: MapLocation, point2: MapLocation): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.degToRad(point2.lat - point1.lat);
    const dLng = this.degToRad(point2.lng - point1.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degToRad(point1.lat)) *
        Math.cos(this.degToRad(point2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  static degToRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  static calculateCenter(locations: MapLocation[]): MapLocation | null {
    if (locations.length === 0) return null;

    const total = locations.reduce(
      (acc, location) => ({
        lat: acc.lat + location.lat,
        lng: acc.lng + location.lng,
        latitude: acc.latitude + location.latitude,
        longitude: acc.longitude + location.longitude,
      }),
      { lat: 0, lng: 0, latitude: 0, longitude: 0 }
    );

    const avgLat = total.lat / locations.length;
    const avgLng = total.lng / locations.length;
    const avgLatitude = total.latitude / locations.length;
    const avgLongitude = total.longitude / locations.length;

    return {
      lat: avgLat,
      lng: avgLng,
      latitude: avgLatitude,
      longitude: avgLongitude,
    };
  }

  static getZoomLevel(radiusKm: number): number {
    // Simple zoom level calculation based on radius
    if (radiusKm > 100) return 5;
    if (radiusKm > 50) return 7;
    if (radiusKm > 20) return 9;
    if (radiusKm > 10) return 11;
    if (radiusKm > 5) return 13;
    return 15;
  }

  static getBounds(locations: MapLocation[]): MapBounds | null {
    if (locations.length === 0) return null;

    let minLat = locations[0].lat;
    let maxLat = locations[0].lat;
    let minLng = locations[0].lng;
    let maxLng = locations[0].lng;

    locations.forEach((location) => {
      minLat = Math.min(minLat, location.lat);
      maxLat = Math.max(maxLat, location.lat);
      minLng = Math.min(minLng, location.lng);
      maxLng = Math.max(maxLng, location.lng);
    });

    return {
      northeast: {
        latitude: maxLat,
        longitude: maxLng,
        lat: maxLat,
        lng: maxLng,
      },
      southwest: {
        latitude: minLat,
        longitude: minLng,
        lat: minLat,
        lng: minLng,
      },
      north: maxLat,
      south: minLat,
      east: maxLng,
      west: minLng,
    };
  }

  static isWithinBounds(location: MapLocation, bounds: MapBounds): boolean {
    return (
      location.lat >= bounds.south &&
      location.lat <= bounds.north &&
      location.lng >= bounds.west &&
      location.lng <= bounds.east
    );
  }
}
