import { LocationData, Coordinates } from '@/types';

// Mock location data for Turkey
export const mockLocationResults: LocationData[] = [
  {
    id: '1',
    name: 'Ankara, Türkiye',
    coordinates: { latitude: 39.9208, longitude: 32.8541 },
    type: 'city' as const,
    country: 'Türkiye',
    address: 'Çankaya/Ankara',
    city: 'Ankara',
    state: 'Ankara',
  },
  {
    id: '2',
    name: 'İstanbul, Türkiye',
    coordinates: { latitude: 41.0082, longitude: 28.9784 },
    type: 'city' as const,
    country: 'Türkiye',
    address: 'Beşiktaş/İstanbul',
    city: 'İstanbul',
    state: 'İstanbul',
  },
  {
    id: '3',
    name: 'İzmir, Türkiye',
    coordinates: { latitude: 38.4192, longitude: 27.1287 },
    type: 'city' as const,
    country: 'Türkiye',
    address: 'Konak/İzmir',
    city: 'İzmir',
    state: 'İzmir',
  },
  {
    id: '4',
    name: 'Kızılay, Çankaya',
    coordinates: { latitude: 39.9199, longitude: 32.8543 },
    type: 'neighborhood' as const,
    country: 'Türkiye',
    address: 'Kızılay, Çankaya/Ankara',
    city: 'Ankara',
    state: 'Ankara',
  },
  {
    id: '5',
    name: 'Bahçelievler',
    coordinates: { latitude: 39.94, longitude: 32.82 },
    type: 'district' as const,
    country: 'Türkiye',
    address: 'Bahçelievler/Ankara',
    city: 'Ankara',
    state: 'Ankara',
  },
  {
    id: '6',
    name: 'Bilkent',
    coordinates: { latitude: 39.8681, longitude: 32.7489 },
    type: 'neighborhood' as const,
    country: 'Türkiye',
    address: 'Bilkent, Çankaya/Ankara',
    city: 'Ankara',
    state: 'Ankara',
  },
];

// Mock search function
export const searchLocations = async (
  query: string
): Promise<LocationData[]> => {
  // Simulate API delay
  await new Promise((resolve) =>
    setTimeout(resolve, 300 + Math.random() * 200)
  );

  if (!query.trim()) return [];

  return mockLocationResults.filter(
    (location) =>
      location.name.toLowerCase().includes(query.toLowerCase()) ||
      location.address.toLowerCase().includes(query.toLowerCase()) ||
      location.city.toLowerCase().includes(query.toLowerCase())
  );
};

// Get location by coordinates (reverse geocoding mock)
export const getLocationByCoordinates = async (
  coordinates: Coordinates
): Promise<LocationData | null> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Find closest location (simple distance calculation)
  let closestLocation = null;
  let minDistance = Infinity;

  for (const location of mockLocationResults) {
    const distance = Math.sqrt(
      Math.pow(location.coordinates.latitude - coordinates.latitude, 2) +
        Math.pow(location.coordinates.longitude - coordinates.longitude, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestLocation = location;
    }
  }

  return closestLocation;
};

// Format location display name
export const formatLocationDisplayName = (location: LocationData): string => {
  switch (location.type) {
    case 'city':
      return `${location.city}, ${location.country}`;
    case 'district':
      return `${location.name}, ${location.city}`;
    case 'neighborhood':
      return `${location.name}, ${location.city}`;
    default:
      return location.name;
  }
};

// Calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (
  coord1: Coordinates,
  coord2: Coordinates
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.latitude * Math.PI) / 180) *
      Math.cos((coord2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};
