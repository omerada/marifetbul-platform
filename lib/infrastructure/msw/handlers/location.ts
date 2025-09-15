import { http, HttpResponse } from 'msw';

// Mock location data
const mockCities = [
  {
    id: 'istanbul',
    name: 'İstanbul',
    country: 'Türkiye',
    region: 'Marmara',
    coordinates: { lat: 41.0082, lng: 28.9784 },
    timezone: 'Europe/Istanbul',
    population: 15460000,
  },
  {
    id: 'ankara',
    name: 'Ankara',
    country: 'Türkiye',
    region: 'İç Anadolu',
    coordinates: { lat: 39.9208, lng: 32.8541 },
    timezone: 'Europe/Istanbul',
    population: 5663000,
  },
  {
    id: 'izmir',
    name: 'İzmir',
    country: 'Türkiye',
    region: 'Ege',
    coordinates: { lat: 38.4192, lng: 27.1287 },
    timezone: 'Europe/Istanbul',
    population: 4394000,
  },
  {
    id: 'bursa',
    name: 'Bursa',
    country: 'Türkiye',
    region: 'Marmara',
    coordinates: { lat: 40.1885, lng: 29.061 },
    timezone: 'Europe/Istanbul',
    population: 3194000,
  },
  {
    id: 'antalya',
    name: 'Antalya',
    country: 'Türkiye',
    region: 'Akdeniz',
    coordinates: { lat: 36.8969, lng: 30.7133 },
    timezone: 'Europe/Istanbul',
    population: 2619000,
  },
];

const mockDistricts = [
  // İstanbul
  {
    id: 'besiktas',
    name: 'Beşiktaş',
    cityId: 'istanbul',
    coordinates: { lat: 41.0429, lng: 29.0082 },
  },
  {
    id: 'kadikoy',
    name: 'Kadıköy',
    cityId: 'istanbul',
    coordinates: { lat: 40.9833, lng: 29.0167 },
  },
  {
    id: 'sisli',
    name: 'Şişli',
    cityId: 'istanbul',
    coordinates: { lat: 41.0609, lng: 28.9876 },
  },
  {
    id: 'uskudar',
    name: 'Üsküdar',
    cityId: 'istanbul',
    coordinates: { lat: 41.0214, lng: 29.0155 },
  },

  // Ankara
  {
    id: 'cankaya',
    name: 'Çankaya',
    cityId: 'ankara',
    coordinates: { lat: 39.9138, lng: 32.8597 },
  },
  {
    id: 'kizilay',
    name: 'Kızılay',
    cityId: 'ankara',
    coordinates: { lat: 39.9208, lng: 32.854 },
  },

  // İzmir
  {
    id: 'karsiyaka',
    name: 'Karşıyaka',
    cityId: 'izmir',
    coordinates: { lat: 38.4606, lng: 27.1243 },
  },
  {
    id: 'alsancak',
    name: 'Alsancak',
    cityId: 'izmir',
    coordinates: { lat: 38.437, lng: 27.1406 },
  },
];

const mockLocationStats = {
  istanbul: { freelancers: 2847, jobs: 1923, services: 1456 },
  ankara: { freelancers: 1203, jobs: 876, services: 654 },
  izmir: { freelancers: 987, jobs: 678, services: 432 },
  bursa: { freelancers: 456, jobs: 321, services: 234 },
  antalya: { freelancers: 234, jobs: 167, services: 123 },
};

export const locationHandlers = [
  // Search locations (cities)
  http.get('/api/locations/search', ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    const limit = parseInt(url.searchParams.get('limit') || '10');

    const filteredCities = mockCities
      .filter(
        (city) =>
          city.name.toLowerCase().includes(query.toLowerCase()) ||
          city.region.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, limit)
      .map((city) => ({
        ...city,
        stats: mockLocationStats[city.id as keyof typeof mockLocationStats] || {
          freelancers: 0,
          jobs: 0,
          services: 0,
        },
      }));

    return HttpResponse.json({
      success: true,
      data: {
        cities: filteredCities,
        total: filteredCities.length,
      },
    });
  }),

  // Get popular cities
  http.get('/api/locations/popular', () => {
    const popularCities = mockCities
      .slice(0, 5)
      .map((city) => ({
        ...city,
        stats: mockLocationStats[city.id as keyof typeof mockLocationStats],
      }))
      .sort(
        (a, b) => (b.stats?.freelancers || 0) - (a.stats?.freelancers || 0)
      );

    return HttpResponse.json({
      success: true,
      data: {
        cities: popularCities,
      },
    });
  }),

  // Get districts by city
  http.get('/api/locations/cities/:cityId/districts', ({ params }) => {
    const cityDistricts = mockDistricts.filter(
      (district) => district.cityId === params.cityId
    );

    return HttpResponse.json({
      success: true,
      data: {
        districts: cityDistricts,
        total: cityDistricts.length,
      },
    });
  }),

  // Geocoding - address to coordinates
  http.get('/api/locations/geocode', ({ request }) => {
    const url = new URL(request.url);
    const address = url.searchParams.get('address') || '';

    // Simple mock geocoding
    const mockResult = {
      address: address,
      coordinates: {
        lat: 41.0082 + (Math.random() - 0.5) * 0.1,
        lng: 28.9784 + (Math.random() - 0.5) * 0.1,
      },
      formattedAddress: `${address}, İstanbul, Türkiye`,
      city: 'İstanbul',
      district: 'Beşiktaş',
      country: 'Türkiye',
    };

    return HttpResponse.json({
      success: true,
      data: mockResult,
    });
  }),

  // Reverse geocoding - coordinates to address
  http.get('/api/locations/reverse-geocode', ({ request }) => {
    const url = new URL(request.url);
    const lat = parseFloat(url.searchParams.get('lat') || '41.0082');
    const lng = parseFloat(url.searchParams.get('lng') || '28.9784');

    const mockResult = {
      coordinates: { lat, lng },
      formattedAddress: 'Beşiktaş, İstanbul, Türkiye',
      city: 'İstanbul',
      district: 'Beşiktaş',
      neighborhood: 'Levent',
      postalCode: '34394',
      country: 'Türkiye',
    };

    return HttpResponse.json({
      success: true,
      data: mockResult,
    });
  }),

  // Get nearby locations
  http.get('/api/locations/nearby', ({ request }) => {
    const url = new URL(request.url);
    const lat = parseFloat(url.searchParams.get('lat') || '41.0082');
    const lng = parseFloat(url.searchParams.get('lng') || '28.9784');
    const radius = parseInt(url.searchParams.get('radius') || '10'); // km

    // Mock nearby locations
    const nearby = mockCities.slice(1, 4).map((city) => ({
      ...city,
      distance: Math.round(Math.random() * radius * 1000), // meters
      stats: mockLocationStats[city.id as keyof typeof mockLocationStats],
    }));

    return HttpResponse.json({
      success: true,
      data: {
        locations: nearby,
        center: { lat, lng },
        radius,
      },
    });
  }),

  // Get location statistics
  http.get('/api/locations/:locationId/stats', ({ params }) => {
    const stats = mockLocationStats[
      params.locationId as keyof typeof mockLocationStats
    ] || {
      freelancers: 0,
      jobs: 0,
      services: 0,
    };

    const additionalStats = {
      ...stats,
      averageRates: {
        hourly: { min: 150, max: 500, currency: 'TRY' },
        project: { min: 5000, max: 50000, currency: 'TRY' },
      },
      topCategories: [
        { name: 'Web Geliştirme', count: Math.floor(stats.freelancers * 0.3) },
        { name: 'Grafik Tasarım', count: Math.floor(stats.freelancers * 0.25) },
        { name: 'Pazarlama', count: Math.floor(stats.freelancers * 0.2) },
      ],
      trends: {
        monthlyGrowth: Math.round((Math.random() - 0.5) * 20),
        popularityScore: Math.round(Math.random() * 100),
      },
    };

    return HttpResponse.json({
      success: true,
      data: additionalStats,
    });
  }),

  // Auto-complete for locations
  http.get('/api/locations/autocomplete', ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    const limit = parseInt(url.searchParams.get('limit') || '5');

    if (query.length < 2) {
      return HttpResponse.json({
        success: true,
        data: { suggestions: [] },
      });
    }

    const suggestions = [
      ...mockCities
        .filter((city) => city.name.toLowerCase().includes(query.toLowerCase()))
        .map((city) => ({
          id: city.id,
          type: 'city',
          name: city.name,
          subtitle: `${city.region}, ${city.country}`,
          coordinates: city.coordinates,
        })),
      ...mockDistricts
        .filter((district) =>
          district.name.toLowerCase().includes(query.toLowerCase())
        )
        .map((district) => {
          const city = mockCities.find((c) => c.id === district.cityId);
          return {
            id: district.id,
            type: 'district',
            name: district.name,
            subtitle: city ? `${city.name}, ${city.country}` : 'Türkiye',
            coordinates: district.coordinates,
          };
        }),
    ].slice(0, limit);

    return HttpResponse.json({
      success: true,
      data: { suggestions },
    });
  }),
];
